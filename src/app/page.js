'use client';

import Link from 'next/link';
import { ShoppingCart, Package, BarChart2, Users, CreditCard, Truck, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';

export default function LandingPage() {
  const features = [
    {
      icon: ShoppingCart,
      title: 'Point of Sale',
      description: 'Fast, intuitive POS interface with barcode scanning, cart management, and multiple payment methods.',
    },
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Track stock levels, set low-stock alerts, manage categories, and organize products with ease.',
    },
    {
      icon: BarChart2,
      title: 'Sales Analytics',
      description: 'Real-time dashboards with revenue trends, top products, category breakdowns, and payment methods.',
    },
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Build customer profiles, track purchase history, loyalty points, and visit frequency.',
    },
    {
      icon: CreditCard,
      title: 'Flexible Payments',
      description: 'Accept cash, card, mobile payments, and custom methods with automatic change calculation.',
    },
    {
      icon: Truck,
      title: 'Multi-location Ready',
      description: 'Designed for scaling — manage multiple registers, locations, and staff roles from one dashboard.',
    },
  ];

  const stats = [
    { label: 'Transactions Processed', value: '100K+' },
    { label: 'Active Stores', value: '500+' },
    { label: 'Products Managed', value: '50K+' },
    { label: 'Uptime Guarantee', value: '99.9%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">Smart POS</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#stats" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Statistics
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              New: Multi-location support & advanced analytics
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Modern POS System for{' '}
              <span className="text-blue-600 dark:text-blue-400">Growing Businesses</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Streamline sales, manage inventory, and grow your business with a powerful,
              easy-to-use point of sale system built for retail and hospitality.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto gap-2" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>

          {/* Hero Illustration */}
          <div className="mt-16 relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-5xl mx-auto">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center text-sm text-gray-500 dark:text-gray-400 font-mono">
                  dashboard.smartpos.app
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <div className="lg:col-span-2 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {['T-Shirt', 'Jeans', 'Sneakers', 'Hat', 'Watch', 'Backpack', 'Sunglasses', 'Belt', 'Socks', 'Jacket'].map((item, i) => (
                      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                        <div className="w-full h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded mb-2" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">$29.99</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Cart</h4>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-1 rounded-full">3 items</span>
                  </div>
                  <div className="space-y-3 mb-4">
                    {[
                      { name: 'T-Shirt', qty: 2, price: 29.99 },
                      { name: 'Jeans', qty: 1, price: 59.99 },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{item.name} × {item.qty}</span>
                        <span className="font-medium text-gray-900 dark:text-white">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="font-medium text-gray-900 dark:text-white">$119.97</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Discount (10%)</span>
                      <span className="font-medium">-$12.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tax (8%)</span>
                      <span className="font-medium text-gray-900 dark:text-white">$8.64</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                      <span>Total</span>
                      <span className="text-blue-600 dark:text-blue-400">$116.61</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="lg">Complete Sale</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Run Your Business
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to simplify your daily operations and help you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="group bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
              >
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 sm:p-12 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Join thousands of businesses already using Smart POS. Start your 14-day free trial today.
            </p>
            <Link href="/signup">
              <Button size="xl" className="bg-white text-blue-600 hover:bg-blue-50 gap-2" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white">Smart POS</span>
              </Link>
              <p className="text-gray-600 dark:text-gray-300 max-w-sm">
                Modern point of sale system for retail and hospitality businesses.
                Built with Next.js, React, and MongoDB.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                <li><Link href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</Link></li>
                <li><Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Login</Link></li>
                <li><Link href="/signup" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                <li><Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Smart POS. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm">Privacy</Link>
              <Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm">Terms</Link>
              <Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}