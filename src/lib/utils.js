import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

export function generateSaleNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `POS${year}${month}${day}-${random}`;
}

export function generatePurchaseNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PO${year}${month}${day}-${random}`;
}

export function generateReturnNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RET${year}${month}${day}-${random}`;
}

export function calculateTotals(items, taxRate = 0, discount = 0, discountType = 'percentage') {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discountType === 'percentage'
    ? subtotal * (discount / 100)
    : discount;
  const taxable = subtotal - discountAmount;
  const tax = taxable * (taxRate / 100);
  const total = subtotal - discountAmount + tax;
  return { subtotal, discountAmount, tax, total };
}