'use client';

import { useState } from 'react';
import { Trash2, Minus, Plus, Tag, Percent, DollarSign, CreditCard, Landmark, User, MessageSquare } from 'lucide-react';
import { Button, Input, Select, Card, CardContent, CardFooter } from '@/components/ui';
import { usePosStore } from '@/stores/posStore';
import { formatCurrency } from '@/lib/utils';

export function Cart() {
  const {
    items,
    discount,
    discountType,
    taxRate,
    customerId,
    notes,
    removeItem,
    updateQuantity,
    setDiscount,
    setTaxRate,
    setCustomerId,
    setNotes,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getTaxAmount,
    getTotal,
    getItemCount,
  } = usePosStore();

  const [showDiscount, setShowDiscount] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [cashReceived, setCashReceived] = useState('');

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const tax = getTaxAmount();
  const total = getTotal();
  const itemCount = getItemCount();

  const handleCheckout = async () => {
    if (items.length === 0) return;

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          userId: 'current-user-id', // TODO: Get from auth
          paymentMethod,
          taxRate,
          discount,
          discountType,
          customerId,
          notes,
        }),
      });

      if (response.ok) {
        clearCart();
        setShowPayment(false);
        alert('Sale completed successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to process sale');
      }
    } catch (error) {
      alert('Failed to process sale');
    }
  };

  const changeDue = paymentMethod === 'CASH' && cashReceived
    ? Math.max(0, parseFloat(cashReceived) - total)
    : 0;

  if (items.length === 0) {
    return (
      <Card className="flex flex-col h-full">
        <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Cart is empty</h3>
            <p className="text-gray-500 dark:text-gray-400">Add products from the catalog</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Cart ({itemCount} items)
        </h2>
      </div>

      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.productName} className="w-16 h-16 object-cover rounded" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">{item.productName}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.sku}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium text-gray-900 dark:text-white ml-2">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="space-y-4 p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {(discount > 0 || showDiscount) && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Discount ({discountType === 'percentage' ? `${discount}%` : formatCurrency(discount)})
              </span>
              <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Percent className="w-4 h-4" />
              Tax ({taxRate}%)
            </span>
            <span className="font-medium">{formatCurrency(tax)}</span>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={showDiscount ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
              onClick={() => setShowDiscount(!showDiscount)}
            >
              <Tag className="w-4 h-4 mr-1" /> Discount
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={showPayment ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
              onClick={() => setShowPayment(!showPayment)}
            >
              <CreditCard className="w-4 h-4 mr-1" /> Checkout
            </Button>
          </div>

          {showDiscount && (
            <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Select
                value={discountType}
                onChange={(e) => setDiscount(discount, e.target.value)}
                options={[
                  { value: 'percentage', label: 'Percentage (%)' },
                  { value: 'fixed', label: 'Fixed Amount ($)' },
                ]}
                className="w-full"
              />
              <Input
                type="number"
                step={discountType === 'percentage' ? '0.1' : '0.01'}
                min="0"
                max={discountType === 'percentage' ? '100' : undefined}
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0, discountType)}
                placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
              />
            </div>
          )}

          {showPayment && (
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  options={[
                    { value: 'CASH', label: 'Cash' },
                    { value: 'CARD', label: 'Card' },
                    { value: 'MOBILE', label: 'Mobile Payment' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                  className="w-full"
                />
              </div>

              {paymentMethod === 'CASH' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cash Received</label>
                  <Input
                    type="number"
                    step="0.01"
                    min={total}
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="Enter amount received"
                  />
                  {changeDue > 0 && (
                    <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                      Change due: <span className="font-bold">{formatCurrency(changeDue)}</span>
                    </p>
                  )}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={paymentMethod === 'CASH' && cashReceived && parseFloat(cashReceived) < total}
              >
                Complete Sale - {formatCurrency(total)}
              </Button>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
              <Input
                placeholder="Customer name or ID (optional)"
                value={customerId || ''}
                onChange={(e) => setCustomerId(e.target.value || null)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <Input
                placeholder="Order notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}