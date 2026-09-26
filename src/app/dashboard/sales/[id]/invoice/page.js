'use client';

import { useEffect, useState } from 'react';
import { Header, Sidebar } from '@/components/layout';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { useUIStore } from '@/stores/posStore';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { format } from 'date-fns';
import { FileText, Printer, ArrowLeft, Building2, User, ShoppingCart, DollarSign, Truck, MapPin, Mail, Phone, CreditCard, Receipt, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InvoicePage({ params }) {
  const { sidebarOpen } = useUIStore();
  const router = useRouter();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    storeName: 'Smart POS',
    taxRate: 0,
    currency: 'USD',
    receiptFooter: 'Thank you for your purchase!',
  });

  useEffect(() => {
    fetchSettings();
    fetchSale();
  }, [params]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data) setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchSale = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sales/${params.id}`);
      const data = await response.json();
      if (data) {
        setSale(data);
      } else {
        router.push('/sales');
      }
    } catch (error) {
      console.error('Failed to fetch sale:', error);
      router.push('/sales');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />
        <div className={sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} style={{ flex: 1, minWidth: 0 }}>
          <Header />
          <main className="p-4 lg:p-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading invoice...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />
        <div className={sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} style={{ flex: 1, minWidth: 0 }}>
          <Header />
          <main className="p-4 lg:p-6">
            <div className="max-w-3xl mx-auto text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Invoice not found</p>
              <Button onClick={() => router.push('/sales')} className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sales
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const subtotal = sale.subtotal;
  const discount = sale.discount;
  const discountType = sale.discountType;
  const tax = sale.tax;
  const total = sale.total;
  const discountLabel = discountType === 'percentage' ? `${discount}%` : formatCurrency(discount);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className={sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} style={{ flex: 1, minWidth: 0 }}>
        <Header />
        <main className="p-4 lg:p-6">
          <div className="max-w-3xl mx-auto">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice {sale.saleNumber}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>

            {/* Invoice Card - Print Optimized */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 print:shadow-none print:rounded-none print:p-0" id="invoice-content">
              {/* Store Header */}
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{settings.storeName}</h2>
                    <p className="text-gray-600 dark:text-gray-400">Point of Sale Invoice</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                    <CheckCircle className="w-3 h-3" />
                    PAID
                  </div>
                </div>
              </div>

              {/* Invoice Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Invoice Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    Invoice Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Invoice #</span>
                      <span className="font-mono font-medium text-gray-900 dark:text-white">{sale.saleNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date</span>
                      <span className="font-medium text-gray-900 dark:text-white">{format(new Date(sale.createdAt), 'MMMM dd, yyyy HH:mm')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Cashier</span>
                      <span className="font-medium text-gray-900 dark:text-white">{sale.userId?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                      <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        <span>{getPaymentMethodIcon(sale.paymentMethod)}</span>
                        {sale.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-500" />
                    Bill To
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {sale.customerId?.name || 'Walk-in Customer'}
                    </p>
                    {sale.customerId?.email && (
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {sale.customerId.email}
                      </p>
                    )}
                    {sale.customerId?.phone && (
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {sale.customerId.phone}
                      </p>
                    )}
                    {sale.customerId?.address && (
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {sale.customerId.address}
                      </p>
                    )}
                    {(!sale.customerId || (!sale.customerId.email && !sale.customerId.phone && !sale.customerId.address)) && (
                      <p className="text-gray-500 dark:text-gray-400 italic">Walk-in Customer</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-gray-500" />
                  Items
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Product</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Qty</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Unit Price</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sale.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900 dark:text-white">{item.productName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.sku}</p>
                          </td>
                          <td className="py-3 px-4 text-center text-gray-900 dark:text-white">{formatNumber(item.quantity)}</td>
                          <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{formatCurrency(item.price)}</td>
                          <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="max-w-xs ml-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Discount ({discountLabel})</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax ({settings.taxRate}%)</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-center sm:text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{settings.storeName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Thank you for your business!</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Invoice generated on {format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">This is a computer-generated invoice</p>
                  </div>
                </div>
                {settings.receiptFooter && (
                  <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400 italic">
                    {settings.receiptFooter}
                  </div>
                )}
              </div>
            </div>

            {/* Print-only message */}
            <div className="hidden print:block text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
              Press Ctrl+P (Cmd+P on Mac) to print or save as PDF
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}