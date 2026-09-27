'use client';

import { useEffect, useState } from 'react';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { Button, Input, Select, Modal, ModalFooter, Card, CardContent } from '@/components/ui';
import { useProductStore, useUIStore } from '@/stores/posStore';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

export default function ProductsPage() {
  const { products, categories, searchQuery, selectedCategory, setSearchQuery, setSelectedCategory, setProducts, setCategories, loading } = useProductStore();
  const { setActiveModal, activeModal, closeModal } = useUIStore();
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', sku: '', barcode: '', price: '', cost: '', stock: '', minStock: '', categoryId: '', imageUrl: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory) params.set('category', selectedCategory);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (data.products) {
        setProducts(data.products);
        setTotalPages(Math.ceil(data.total / 20));
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery, selectedCategory, setProducts]);

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
        fetchProducts();
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
        fetchProducts();
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <Select
              label="Category"
              value={selectedCategory || ''}
              onChange={handleCategoryChange}
              options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c._id, label: c.name }))]}
              className="w-full sm:w-64"
            />
          </div>

          <ProductGrid
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

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

      <Modal isOpen={activeModal === 'product-form'} onClose={closeModal} title={editingProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            <Input label="SKU" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value.toUpperCase()})} required />
            <Input label="Barcode" value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})} />
            <Select
              label="Category"
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              options={categories.map(c => ({ value: c._id, label: c.name }))}
              required
            />
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
    </div>
  );
}