'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle, Badge, Modal, ModalFooter, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { useUIStore } from '@/stores/posStore';
import { Search, Filter, Plus, Download, RefreshCw, Truck, Package, DollarSign, Eye, Edit, Check, X } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function PurchasesPage() {
  const { sidebarOpen } = useUIStore();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ pending: 0, received: 0, totalValue: 0, totalDue: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Form state for creating purchase
  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDate: '',
    taxRate: 0,
    discount: 0,
    discountType: 'percentage',
    notes: '',
    items: [{ productId: '', quantity: 1, unitCost: 0 }],
  });

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
    fetchProducts();
    fetchStats();
  }, [currentPage, search, statusFilter, supplierFilter]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      if (statusFilter) params.set('status', statusFilter);
      if (supplierFilter) params.set('supplierId', supplierFilter);

      const response = await fetch(`/api/purchases?${params}`);
      const data = await response.json();
      if (data.purchases) {
        setPurchases(data.purchases);
        setTotalPages(Math.ceil(data.total / 20));
      }
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      if (data.suppliers) setSuppliers(data.suppliers);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=200');
      const data = await response.json();
      if (data.products) setProducts(data.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/purchases/stats');
      const data = await response.json();
      if (data) setStats(data);
    } catch (error) {
      console.error('Failed to fetch purchase stats:', error);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      supplierId: '',
      expectedDate: '',
      taxRate: 0,
      discount: 0,
      discountType: 'percentage',
      notes: '',
      items: [{ productId: '', quantity: 1, unitCost: 0 }],
    });
    setShowCreateModal(true);
  };

  const handleCloseCreate = () => {
    setShowCreateModal(false);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { productId: '', quantity: 1, unitCost: 0 }] });
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const calculateItemTotal = (item) => {
    return (parseFloat(item.unitCost) || 0) * (parseInt(item.quantity) || 0);
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = formData.discountType === 'percentage'
      ? subtotal * (parseFloat(formData.discount) || 0) / 100
      : parseFloat(formData.discount) || 0;
    const taxable = subtotal - discountAmount;
    const tax = taxable * (parseFloat(formData.taxRate) || 0) / 100;
    return subtotal - discountAmount + tax;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validItems = formData.items.filter(item => item.productId && item.quantity > 0);
      if (validItems.length === 0) {
        alert('Please add at least one product');
        return;
      }

      if (!formData.supplierId) {
        alert('Please select a supplier');
        return;
      }

      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: validItems,
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchPurchases();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create purchase');
      }
    } catch (error) {
      alert('Failed to create purchase');
    }
  };

  const handleReceive = async (purchaseId) => {
    if (!confirm('Mark this purchase as received? This will update product stock.')) return;

    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'receive' }),
      });

      if (response.ok) {
        fetchPurchases();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to receive purchase');
      }
    } catch (error) {
      alert('Failed to receive purchase');
    }
  };

  const handleCancel = async (purchaseId) => {
    if (!confirm('Cancel this purchase? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      if (response.ok) {
        fetchPurchases();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to cancel purchase');
      }
    } catch (error) {
      alert('Failed to cancel purchase');
    }
  };

  const handleViewDetail = (purchase) => {
    setSelectedPurchase(purchase);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: 'warning',
      RECEIVED: 'success',
      CANCELLED: 'danger',
      PARTIAL: 'info',
    };
    return <Badge variant={variants[status] || 'default'} className="capitalize">{status}</Badge>;
  };

  const getPaymentStatusBadge = (status) => {
    const variants = {
      UNPAID: 'danger',
      PARTIAL: 'warning',
      PAID: 'success',
    };
    return <Badge variant={variants[status] || 'default'} className="capitalize">{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Purchase Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage purchase orders and supplier payments</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => { fetchPurchases(); fetchStats(); }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleOpenCreate}>
                <Plus className="w-4 h-4 mr-2" />
                New Purchase
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending Orders</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Received</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.received}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalValue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Amount Due</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalDue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                    <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search purchase number..."
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
                    { value: 'RECEIVED', label: 'Received' },
                    { value: 'CANCELLED', label: 'Cancelled' },
                    { value: 'PARTIAL', label: 'Partial' },
                  ]}
                  className="w-full sm:w-40"
                />
                <Select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  options={[{ value: '', label: 'All Suppliers' }, ...suppliers.map(s => ({ value: s._id, label: s.name }))]}
                  className="w-full sm:w-56"
                />
              </div>
            </CardContent>
          </Card>

          {/* Purchases Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">PO Number</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Supplier</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                      <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Items</th>
                      <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Total</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Payment</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Expected</th>
                      <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</td>
                      </tr>
                    ) : purchases.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-gray-500 dark:text-gray-400">No purchases found</td>
                      </tr>
                    ) : (
                      purchases.map((purchase) => (
                        <tr key={purchase._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="p-3 text-sm font-mono text-gray-900 dark:text-white">{purchase.purchaseNumber}</td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{purchase.supplierName}</td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(purchase.createdAt), 'MMM dd, yyyy')}
                          </td>
                          <td className="p-3 text-right text-sm text-gray-600 dark:text-gray-400">
                            {purchase.items.length} item(s)
                          </td>
                          <td className="p-3 text-right font-medium text-gray-900 dark:text-white">
                            {formatCurrency(purchase.total)}
                          </td>
                          <td className="p-3">{getStatusBadge(purchase.status)}</td>
                          <td className="p-3">{getPaymentStatusBadge(purchase.paymentStatus)}</td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                            {purchase.expectedDate ? format(new Date(purchase.expectedDate), 'MMM dd, yyyy') : '-'}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleViewDetail(purchase)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {purchase.status === 'PENDING' && (
                                <>
                                  <Button variant="ghost" size="sm" className="text-green-600" onClick={() => handleReceive(purchase._id)}>
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleCancel(purchase._id)}>
                                    <X className="w-4 h-4" />
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Purchase Modal */}
          <Modal isOpen={showCreateModal} onClose={handleCloseCreate} title="Create Purchase Order" size="xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Supplier"
                  value={formData.supplierId}
                  onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                  options={[{ value: '', label: 'Select Supplier' }, ...suppliers.map(s => ({ value: s._id, label: s.name }))]}
                  required
                />
                <Input
                  label="Expected Date"
                  type="date"
                  value={formData.expectedDate}
                  onChange={(e) => setFormData({...formData, expectedDate: e.target.value})}
                />
                <Input
                  label="Tax Rate (%)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({...formData, taxRate: parseFloat(e.target.value) || 0})}
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount</label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                      options={[
                        { value: 'percentage', label: 'Percentage (%)' },
                        { value: 'fixed', label: 'Fixed Amount ($)' },
                      ]}
                      className="w-40"
                    />
                    <Input
                      type="number"
                      step={formData.discountType === 'percentage' ? '0.1' : '0.01'}
                      min="0"
                      max={formData.discountType === 'percentage' ? '100' : undefined}
                      value={formData.discount}
                      onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                      placeholder={formData.discountType === 'percentage' ? 'Enter %' : 'Enter $'}
                    />
                  </div>
                </div>
                <Input
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="md:col-span-2"
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Items</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        options={[{ value: '', label: 'Select Product' }, ...products.map(p => ({ value: p._id, label: `${p.name} (${p.sku}) - Stock: ${p.stock}` }))]}
                        className="flex-1 min-w-0"
                      />
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        placeholder="Qty"
                        className="w-24"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitCost}
                        onChange={(e) => handleItemChange(index, 'unitCost', parseFloat(e.target.value) || 0)}
                        placeholder="Unit Cost"
                        className="w-32"
                      />
                      <div className="w-28 text-right pt-6 text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(calculateItemTotal(item))}
                      </div>
                      {formData.items.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => removeItem(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2 text-right">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  {(formData.discount > 0) && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Discount ({formData.discountType === 'percentage' ? `${formData.discount}%` : formatCurrency(formData.discount)})</span>
                      <span>-{formatCurrency(formData.discountType === 'percentage' ? calculateSubtotal() * formData.discount / 100 : formData.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax ({formData.taxRate}%)</span>
                    <span className="font-medium">{formatCurrency((calculateSubtotal() - (formData.discountType === 'percentage' ? calculateSubtotal() * formData.discount / 100 : formData.discount)) * formData.taxRate / 100)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              <ModalFooter>
                <Button type="button" variant="secondary" onClick={handleCloseCreate}>Cancel</Button>
                <Button type="submit">Create Purchase Order</Button>
              </ModalFooter>
            </form>
          </Modal>

          {/* Purchase Detail Modal */}
          <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Purchase Details" size="lg">
            {selectedPurchase && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">PO Number</p>
                    <p className="font-mono font-medium">{selectedPurchase.purchaseNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p>{format(new Date(selectedPurchase.createdAt), 'MMMM dd, yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Supplier</p>
                    <p>{selectedPurchase.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created By</p>
                    <p>{selectedPurchase.userId?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <p>{getStatusBadge(selectedPurchase.status)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment</p>
                    <p>{getPaymentStatusBadge(selectedPurchase.paymentStatus)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Expected Date</p>
                    <p>{selectedPurchase.expectedDate ? format(new Date(selectedPurchase.expectedDate), 'MMMM dd, yyyy') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Received Date</p>
                    <p>{selectedPurchase.receivedDate ? format(new Date(selectedPurchase.receivedDate), 'MMMM dd, yyyy') : '-'}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium mb-3">Items</h4>
                  <div className="space-y-2">
                    {selectedPurchase.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.sku} × {item.quantity} @ {formatCurrency(item.unitCost)}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedPurchase.subtotal)}</span>
                  </div>
                  {selectedPurchase.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount ({selectedPurchase.discountType === 'percentage' ? `${selectedPurchase.discount}%` : formatCurrency(selectedPurchase.discount)})</span>
                      <span>-{formatCurrency(selectedPurchase.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(selectedPurchase.tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(selectedPurchase.total)}</span>
                  </div>
                </div>

                {selectedPurchase.notes && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                    <p>{selectedPurchase.notes}</p>
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