'use client';

import { useEffect, useState } from 'react';
import { Header, Sidebar } from '@/components/layout';
import { Button, Input, Select, Card, CardContent, Modal, ModalFooter, Badge } from '@/components/ui';
import { Search, Filter, Calendar, Eye, Download, FileText, Printer } from 'lucide-react';
import { useUIStore } from '@/stores/posStore';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

export default function SalesPage() {
  const { sidebarOpen } = useUIStore();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      if (statusFilter) params.set('status', statusFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const response = await fetch(`/api/sales?${params}`);
      const data = await response.json();
      if (data.sales) {
        setSales(data.sales);
        setTotalPages(Math.ceil(data.total / 20));
      }
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [currentPage, statusFilter, startDate, endDate]);

  const getStatusBadge = (status) => {
    const variants = {
      COMPLETED: 'success',
      REFUNDED: 'warning',
      VOIDED: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      CASH: '💵',
      CARD: '💳',
      MOBILE: '📱',
      OTHER: '💰',
    };
    return icons[method] || '💰';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className={sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} style={{ flex: 1, minWidth: 0 }}>
        <Header />
        <main className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales History</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search sale number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { value: '', label: 'All Status' },
                      { value: 'COMPLETED', label: 'Completed' },
                      { value: 'REFUNDED', label: 'Refunded' },
                      { value: 'VOIDED', label: 'Voided' },
                    ]}
                    className="w-40"
                  />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start Date"
                    className="w-40"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="End Date"
                    className="w-40"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Sale #</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Cashier</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Items</th>
                      <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Total</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Payment</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          Loading...
                        </td>
                      </tr>
                    ) : sales.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No sales found
                        </td>
                      </tr>
                    ) : (
                      sales.map((sale) => (
                        <tr key={sale._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="p-3 text-sm font-mono text-gray-900 dark:text-white">{sale.saleNumber}</td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm')}
                          </td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                            {sale.userId?.name || 'Unknown'}
                          </td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                            {sale.items.length} item(s)
                          </td>
                          <td className="p-3 text-sm font-medium text-right text-gray-900 dark:text-white">
                            {formatCurrency(sale.total)}
                          </td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <span>{getPaymentMethodIcon(sale.paymentMethod)}</span>
                            {sale.paymentMethod}
                          </td>
                          <td className="p-3">{getStatusBadge(sale.status)}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setSelectedSale(sale); setShowDetail(true); }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Link href={`/dashboard/sales/${sale._id}/invoice`}>
                                <Button variant="ghost" size="sm">
                                  <FileText className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Link href={`/dashboard/sales/${sale._id}/invoice`} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm">
                                  <Printer className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Sale Details" size="lg">
            {selectedSale && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sale Number</p>
                    <p className="font-mono font-medium">{selectedSale.saleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p>{format(new Date(selectedSale.createdAt), 'MMMM dd, yyyy HH:mm:ss')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cashier</p>
                    <p>{selectedSale.userId?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                    <p>{getPaymentMethodIcon(selectedSale.paymentMethod)} {selectedSale.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <p>{getStatusBadge(selectedSale.status)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                    <p>{selectedSale.customerId?.name || 'Walk-in'}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium mb-3">Items</h4>
                  <div className="space-y-2">
                    {selectedSale.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.sku} × {item.quantity}
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
                    <span>{formatCurrency(selectedSale.subtotal)}</span>
                  </div>
                  {selectedSale.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount ({selectedSale.discountType === 'percentage' ? `${selectedSale.discount}%` : formatCurrency(selectedSale.discount)})</span>
                      <span>-{formatCurrency(selectedSale.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(selectedSale.tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(selectedSale.total)}</span>
                  </div>
                </div>

                {selectedSale.notes && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                    <p>{selectedSale.notes}</p>
                  </div>
                )}
              </div>
            )}
            <ModalFooter>
              <Button onClick={() => setShowDetail(false)}>Close</Button>
            </ModalFooter>
          </Modal>
        </main>
      </div>
    </div>
  );
}