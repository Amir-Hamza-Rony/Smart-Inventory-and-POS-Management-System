'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge, Modal, ModalFooter } from '@/components/ui';
import { useUIStore } from '@/stores/posStore';
import { Search, Plus, Edit, Trash2, Image, RefreshCw, Tag } from 'lucide-react';
import { format } from 'date-fns';

export default function BrandsPage() {
  const { sidebarOpen } = useUIStore();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
  });

  useEffect(() => {
    fetchBrands();
  }, [currentPage, search]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        includeProductCount: 'true',
      });
      if (search) params.set('search', search);

      const response = await fetch(`/api/brands?${params}`);
      const data = await response.json();
      if (data.brands) {
        setBrands(data.brands);
        setTotalPages(Math.ceil(data.total / 20));
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormData({ name: '', description: '', logoUrl: '' });
    setShowForm(true);
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logoUrl: brand.logoUrl || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBrand ? `/api/brands/${editingBrand._id}` : '/api/brands';
      const method = editingBrand ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        fetchBrands();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save brand');
      }
    } catch (error) {
      alert('Failed to save brand');
    }
  };

  const handleDelete = async (brandId) => {
    if (!confirm('Are you sure you want to delete this brand? This will also remove it from all products.')) return;
    try {
      const response = await fetch(`/api/brands/${brandId}`, { method: 'DELETE' });
      if (response.ok) {
        fetchBrands();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete brand');
      }
    } catch (error) {
      alert('Failed to delete brand');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brands</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage product brands</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchBrands}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Brand
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading brands...</p>
            </div>
          ) : brands.length === 0 ? (
            <div className="py-12 text-center">
              <Tag className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No brands found</h3>
              <p className="text-gray-500 dark:text-gray-400">Create your first brand to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Brand</th>
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Description</th>
                    <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Products</th>
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Logo</th>
                    <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Created</th>
                    <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {brand.logoUrl ? (
                            <img
                              src={brand.logoUrl}
                              alt={brand.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                              <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{brand.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {brand.description || '-'}
                      </td>
                      <td className="p-3 text-right">
                        <Badge variant="info">{brand.productCount || 0} products</Badge>
                      </td>
                      <td className="p-3">
                        {brand.logoUrl ? (
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="w-12 h-8 rounded object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">No logo</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(brand.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(brand)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(brand._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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

      {/* Brand Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingBrand ? 'Edit Brand' : 'Add Brand'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Brand description (optional)"
            />
          </div>
          <Input label="Logo URL" value={formData.logoUrl} onChange={(e) => setFormData({...formData, logoUrl: e.target.value})} placeholder="https://example.com/logo.png" />
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">{editingBrand ? 'Update' : 'Create'}</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}