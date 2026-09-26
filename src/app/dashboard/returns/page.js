'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle, Badge, Modal, ModalFooter } from '@/components/ui';
import { useUIStore } from '@/stores/posStore';
import { Search, Filter, Plus, RefreshCw, RotateCcw, Eye, CheckCircle, XCircle, Package, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { format } from 'date-fns';

export default function ReturnsPage() {
  const { sidebarOpen } = useUIStore();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleItems, setSaleItems] = useState([]);
  const [returnFormData, setReturnFormData] = useState({
    saleId: '',
    refundMethod: 'CASH',
    notes: '',
    items: [],
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchReturns();
    fetchRecentSales();
  }, [currentPage, search, statusFilter]);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/returns?${params}`);
      const data = await response.json();
      if (data.returns) {
        setReturns(data.returns);
        setTotalPages(Math.ceil(data.total / 20));
      }
    } catch (error) {
      console.error('Failed to fetch returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentSales = async () => {
    try {
      const response = await fetch('/api/sales?limit=100&status=COMPLETED');
      const data = await response.json();
      if (data.sales) setSales(data.sales);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    }
  };

  const handleSaleSelect = async (saleId) => {
    setSelectedSale(saleId);
    const sale = sales.find(s => s._id === saleId);
    if (sale) {
      // Pre-fill return items with sale items
      const items = sale.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        maxQuantity: item.quantity,
        quantity: 0,
        price: item.price,
        reason: '',
      }));
      setSaleItems(items);
      setReturnFormData(prev => ({
        ...prev,
        saleId,
        items,
      }));
    }
  };

  const handleOpenCreate = () => {
    setSelectedSale(null);
    setSaleItems([]);
    setReturnFormData({
      saleId: '',
      refundMethod: 'CASH',
      notes: '',
      items: [],
    });
    setShowCreateModal(true);
  };

  const handleCloseCreate = () => {
    setShowCreateModal(false);
    setSelectedSale(null);
    setSaleItems([]);
  };

  const handleItemQuantityChange = (index, quantity) => {
    const maxQty = saleItems[index].maxQuantity;
    const qty = Math.max(0, Math.min(parseInt(quantity) || 0, maxQty));
    const newItems = [...returnFormData.items];
    newItems[index] = { ...newItems[index], quantity: qty };
    setReturnFormData({ ...returnFormData, items: newItems });
  };

  const handleItemReasonChange = (index, reason) => {
    const newItems = [...returnFormData.items];
    newItems[index] = { ...newItems[index], reason };
    setReturnFormData({ ...returnFormData, items: newItems });
  };

  const calculateReturnTotal = () => {
    return returnFormData.items
      .filter(item => item.quantity > 0)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validItems = returnFormData.items.filter(item => item.quantity > 0);
      if (validItems.length === 0) {
        alert('Please select at least one item to return');
        return;
      }

      if (!returnFormData.saleId) {
        alert('Please select a sale');
        return;
      }

      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...returnFormData,
          items: validItems,
          userId: 'current-user-id', // TODO: Get from auth
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchReturns();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create return');
      }
    } catch (error) {
      alert('Failed to create return');
    }
  };

  const handleComplete = async (returnId) => {
    if (!confirm('Mark this return as completed?')) return;

    try {
      const response = await fetch(`/api/returns/${returnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', userId: 'current-user-id' }),
      });

      if (response.ok) {
        fetchReturns();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to complete return');
      }
    } catch (error) {
      alert('Failed to complete return');
    }
  };

  const handleReject = async (returnId) => {
    if (!confirm('Reject this return? This will reverse stock changes.')) return;

    try {
      const response = await fetch(`/api/returns/${returnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', userId: 'current-user-id' }),
      });

      if (response.ok) {
        fetchReturns();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to reject return');
      }
    } catch (error) {
      alert('Failed to reject return');
    }
  };

  const handleViewDetail = async (returnDoc) => {
    setSelectedReturn(returnDoc);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: 'warning',
      COMPLETED: 'success',
      REJECTED: 'danger',
    };
    return <Badge variant={variants[status] || 'default'} className="capitalize">{status}</Badge>;
  };

  const getRefundMethodIcon = (method) => {
    const icons = {
      CASH: '💵',
      CARD: '💳',
      STORE_CREDIT: '🎫',
      ORIGINAL: '🔄',
    };
    return icons[method] || '💰';
  };

  return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Returns Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Process customer returns and restore inventory</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={fetchReturns}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={handleOpenCreate}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Return
                </Button>
              </div>
            </div>

            <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search return number or sale number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'COMPLETED', label: 'Completed' },
                    { value: 'REJECTED', label: 'Rejected' },
                  ]}
                  className="w-full sm:w-40"
                />
              </div>
            </CardContent>
          </Card>

          {/* Returns Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Return #</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Original Sale</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                      <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Items</th>
                      <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Total</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Refund Method</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</td>
                      </tr>
                    ) : returns.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-gray-500 dark:text-gray-400">No returns found</td>
                      </tr>
                    ) : (
                      returns.map((returnDoc) => (
                        <tr key={returnDoc._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="p-3 text-sm font-mono text-gray-900 dark:text-white">{returnDoc.returnNumber}</td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{returnDoc.saleNumber}</td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{returnDoc.customerName || 'Walk-in'}</td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{format(new Date(returnDoc.createdAt), 'MMM dd, yyyy')}</td>
                          <td className="p-3 text-right text-sm text-gray-600 dark:text-gray-400">
                            {returnDoc.items.length} item(s)
                          </td>
                          <td className="p-3 text-right font-medium text-gray-900 dark:text-white">
                            {formatCurrency(returnDoc.total)}
                          </td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <span>{getRefundMethodIcon(returnDoc.refundMethod)}</span>
                            {returnDoc.refundMethod}
                          </td>
                          <td className="p-3">{getStatusBadge(returnDoc.status)}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleViewDetail(returnDoc)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {returnDoc.status === 'PENDING' && (
                                <>
                                  <Button variant="ghost" size="sm" className="text-green-600" onClick={() => handleComplete(returnDoc._id)}>
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleReject(returnDoc._id)}>
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Return Modal */}
          <Modal isOpen={showCreateModal} onClose={handleCloseCreate} title="Create Return" size="xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Select Sale"
                  value={returnFormData.saleId}
                  onChange={(e) => { setReturnFormData({...returnFormData, saleId: e.target.value}); handleSaleSelect(e.target.value); }}
                  options={[{ value: '', label: 'Select a completed sale' }, ...sales.map(s => ({ value: s._id, label: `${s.saleNumber} - ${s.customerId?.name || 'Walk-in'} - ${formatCurrency(s.total)}` }))]}
                  required
                />
                <Select
                  label="Refund Method"
                  value={returnFormData.refundMethod}
                  onChange={(e) => setReturnFormData({...returnFormData, refundMethod: e.target.value})}
                  options={[
                    { value: 'CASH', label: 'Cash' },
                    { value: 'CARD', label: 'Card' },
                    { value: 'STORE_CREDIT', label: 'Store Credit' },
                    { value: 'ORIGINAL', label: 'Original Payment Method' },
                  ]}
                />
              </div>

              {selectedSale && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Return Items (Sale: {selectedSale})</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total: {formatCurrency(calculateReturnTotal())}
                    </p>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {saleItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{item.productName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.sku}</p>
                        </div>
                        <div className="w-20">
                          <Input
                            type="number"
                            min="0"
                            max={item.maxQuantity}
                            value={item.quantity}
                            onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                            placeholder="Qty"
                            className="text-center"
                          />
                        </div>
                        <div className="w-24 text-right text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                        <Input
                          type="text"
                          value={item.reason}
                          onChange={(e) => handleItemReasonChange(index, e.target.value)}
                          placeholder="Reason (optional)"
                          className="flex-1 max-w-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={returnFormData.notes}
                  onChange={(e) => setReturnFormData({...returnFormData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Additional notes about this return"
                />
              </div>

              <ModalFooter>
                <Button type="button" variant="secondary" onClick={handleCloseCreate}>Cancel</Button>
                <Button type="submit" disabled={returnFormData.items.filter(i => i.quantity > 0).length === 0}>
                  Create Return - {formatCurrency(calculateReturnTotal())}
                </Button>
              </ModalFooter>
            </form>
          </Modal>

          {/* Return Detail Modal */}
          <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Return Details" size="lg">
            {selectedReturn && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Return Number</p>
                    <p className="font-mono font-medium">{selectedReturn.returnNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Original Sale</p>
                    <p>{selectedReturn.saleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                    <p>{selectedReturn.customerName || 'Walk-in'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p>{format(new Date(selectedReturn.createdAt), 'MMMM dd, yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Refund Method</p>
                    <p>{getRefundMethodIcon(selectedReturn.refundMethod)} {selectedReturn.refundMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <p>{getStatusBadge(selectedReturn.status)}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium mb-3">Returned Items</h4>
                  <div className="space-y-2">
                    {selectedReturn.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.sku} × {item.quantity} @ {formatCurrency(item.price)}
                          </p>
                          {item.reason && <p className="text-xs text-gray-500 dark:text-gray-400">Reason: {item.reason}</p>}
                        </div>
                        <p className="font-medium">{formatCurrency(item.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedReturn.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(selectedReturn.tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span>Total Refund</span>
                    <span>{formatCurrency(selectedReturn.total)}</span>
                  </div>
                </div>

                {selectedReturn.notes && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                    <p>{selectedReturn.notes}</p>
                  </div>
                )}
              </div>
            )}
            <ModalFooter>
              <Button onClick={() => setShowDetailModal(false)}>Close</Button>
            </ModalFooter>
          </Modal>
        </div>
  );
}