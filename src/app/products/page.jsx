'use client';

import { useEffect, useState } from 'react';
import { Header, Sidebar } from '@/components/layout';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { Button, Input, Modal, ModalFooter, Card, CardContent } from '@/components/ui';
import { useProductStore, useUIStore } from '@/stores/posStore';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

export default function ProductsPage() {
  const { sidebarOpen } = useUIStore();
  const { products, categories, searchQuery, selectedCategory, setSearchQuery, setSelectedCategory, setProducts, setCategories, loading } = useProductStore();
  const { setActiveModal, activeModal, closeModal } = useUIStore();
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', sku: '', barcode: '', price: '', cost: '', stock: '', minStock: '', categoryId: '', imageUrl: '' });

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);

        const [productsData, categoriesData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
        ]);

        if (productsData.products) setProducts(productsData.products);
        if (categoriesData.categories) setCategories(categoriesData.categories);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    }

    fetchData();
  }, [setProducts, setCategories]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', sku: '', barcode: '', price: '', cost: '', stock: '0', minStock: '5', categoryId: '', imageUrl: '' });
    setActiveModal('product-form');
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      barcode: product.barcode || '',
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      minStock: product.minStock,
      categoryId: product.categoryId?._id || product.categoryId || '',
      imageUrl: product.imageUrl || '',
    });
    setActiveModal('product-form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        closeModal();
        // Refresh products
        const productsRes = await fetch('/api/products');
        const productsData = await productsRes.json();
        if (productsData.products) setProducts(productsData.products);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save product');
      }
    } catch (error) {
      alert('Failed to save product');
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (response.ok) {
        const productsRes = await fetch('/api/products');
        const productsData = await productsRes.json();
        if (productsData.products) setProducts(productsData.products);
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className={sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} style={{ flex: 1, minWidth: 0 }}>
        <Header />
        <main className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
            <Button onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          <ProductGrid
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <Modal isOpen={activeModal === 'product-form'} onClose={closeModal} title={editingProduct ? 'Edit Product' : 'Add Product'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                <Input label="SKU" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value.toUpperCase()})} required />
                <Input label="Barcode" value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})} />
                <Input label="Category" type="select" value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} required>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </Input>
                <Input label="Price" type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                <Input label="Cost" type="number" step="0.01" min="0" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} required />
                <Input label="Stock" type="number" min="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                <Input label="Min Stock Alert" type="number" min="0" value={formData.minStock} onChange={(e) => setFormData({...formData, minStock: e.target.value})} />
                <Input label="Image URL" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="md:col-span-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <ModalFooter>
                <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button type="submit">{editingProduct ? 'Update' : 'Create'}</Button>
              </ModalFooter>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}