'use client';

import { useEffect } from 'react';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { Cart } from '@/components/pos/Cart';
import { useProductStore, usePosStore } from '@/stores/posStore';
import { useAuth } from '@/components/providers/AuthProvider';

export default function DashboardPage() {
  const { setProducts, setCategories, setLoading } = useProductStore();
  const { setTaxRate } = usePosStore();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [productsRes, categoriesRes, settingsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/settings'),
        ]);

        const [productsData, categoriesData, settingsData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          settingsRes.json(),
        ]);

        if (productsData.products) setProducts(productsData.products);
        if (categoriesData.categories) setCategories(categoriesData.categories);
        if (settingsData.taxRate !== undefined) setTaxRate(settingsData.taxRate);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [setProducts, setCategories, setLoading, setTaxRate]);

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        <div className="lg:col-span-2 flex flex-col min-w-0">
          <ProductGrid />
        </div>
        <div className="flex flex-col min-w-0">
          <Cart />
        </div>
      </div>
    </div>
  );
}