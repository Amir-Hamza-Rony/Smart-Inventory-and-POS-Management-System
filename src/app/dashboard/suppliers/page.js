'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle, Badge, Modal, ModalFooter } from '@/components/ui';
import { useUIStore } from '@/stores/posStore';
import { Search, Plus, Edit, Trash2, Eye, Truck, DollarSign, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { format } from 'date-fns';

export default function SuppliersPage() {
  const { sidebarOpen } = useUIStore();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [supplierPurchases, setSupplierPurchases] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    taxId: '',
    paymentTerms: 30,
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    fetchSuppliers();
  }, [currentPage, search, isActiveFilter]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      if (search) params.set('search', search);
      if (isActiveFilter) params.set('isActive', isActiveFilter);

      const response = await fetch(`/api/suppliers?${params}`);
      const data = await response.json();
      if (data.suppliers) {
        setSuppliers(data.suppliers);
        setTotalPages(Math.ceil(data.total / 20));
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData({
      name: '', company: '', email: '', phone: '', address: '',
      contactPerson: '', taxId: '', paymentTerms: 30, notes: '', isActive: true,
    });
    setShowForm(true);
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      company: supplier.company || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      contactPerson: supplier.contactPerson || '',
      taxId: supplier.taxId || '',
      paymentTerms: supplier.paymentTerms || 30,
      notes: supplier.notes || '',
      isActive: supplier.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSupplier ? `/api/suppliers/${editingSupplier._id}` : '/api/suppliers';
      const method = editingSupplier ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        fetchSuppliers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save supplier');
      }
    } catch (error) {
      alert('Failed to save supplier');
    }
  };

  const handleDelete = async (supplierId) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`, { method: 'DELETE' });
      if (response.ok) {
        fetchSuppliers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete supplier');
      }
    } catch (error) {
      alert('Failed to delete supplier');
    }
  };

  const handleViewDetail = async (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailModal(true);
    try {
      const response = await fetch(`/api/suppliers/${supplier._id}`);
      const data = await response.json();
      if (data.purchases) setSupplierPurchases(data.purchases);
    } catch (error) {
      console.error('Failed to fetch supplier purchases:', error);
    }
  };

  const getDueBadge = (dueAmount) => {
    if (dueAmount > 0) {
      return <Badge variant="danger">{formatCurrency(dueAmount)} Due</Badge>;
    }
    return <Badge variant="success">Paid</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your suppliers and track purchase history</p>
            </div>
            <Button onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search suppliers (name, company, email, phone)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={isActiveFilter}
                  onChange={(e) => setIsActiveFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All' },
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' },
                  ]}
                  className="w-full sm:w-40"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Supplier</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Contact</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Payment Terms</th>
                      <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Amount Due</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</td>
                      </tr>
                    ) : suppliers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">No suppliers found</td>
                      </tr>
                    ) : (
                      suppliers.map((supplier) => (
                        <tr key={supplier._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{supplier.name}</p>
                              {supplier.company && <p className="text-sm text-gray-500 dark:text-gray-400">{supplier.company}</p>}
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                            {supplier.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {supplier.email}</div>}
                            {supplier.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {supplier.phone}</div>}
                            {supplier.contactPerson && <div className="flex items-center gap-1"><User className="w-3 h-3" /> {supplier.contactPerson}</div>}
                          </td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                            Net {supplier.paymentTerms} days
                          </td>
                          <td className="p-3 text-right">
                            {getDueBadge(supplier.dueAmount)}
                          </td>
                          <td className="p-3">
                            <Badge variant={supplier.isActive ? 'success' : 'default'} className="capitalize">
                              {supplier.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetail(supplier)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(supplier)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(supplier._id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

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

          {/* Supplier Form Modal */}
          <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                <Input label="Company" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
                <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <Input label="Contact Person" value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} />
                <Input label="Tax ID" value={formData.taxId} onChange={(e) => setFormData({...formData, taxId: e.target.value})} />
                <Input label="Payment Terms (days)" type="number" min="0" value={formData.paymentTerms} onChange={(e) => setFormData({...formData, paymentTerms: parseInt(e.target.value) || 30})} />
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <ModalFooter>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">{editingSupplier ? 'Update' : 'Create'}</Button>
              </ModalFooter>
            </form>
          </Modal>

          {/* Supplier Detail Modal */}
          <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Supplier Details" size="xl">
            {selectedSupplier && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedSupplier.name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedSupplier.company || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contact Person</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedSupplier.contactPerson || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Terms</p>
                    <p className="font-medium text-gray-900 dark:text-white">Net {selectedSupplier.paymentTerms} days</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedSupplier.email || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedSupplier.phone || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedSupplier.address || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tax ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedSupplier.taxId || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Amount Due</p>
                    <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(selectedSupplier.dueAmount)}</p>
                  </div>
                </div>

                {selectedSupplier.notes && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                    <p>{selectedSupplier.notes}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Purchase History
                  </h4>
                  {supplierPurchases.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left p-2 font-medium text-gray-500 dark:text-gray-400 text-sm">PO Number</th>
                            <th className="text-left p-2 font-medium text-gray-500 dark:text-gray-400 text-sm">Date</th>
                            <th className="text-right p-2 font-medium text-gray-500 dark:text-gray-400 text-sm">Items</th>
                            <th className="text-right p-2 font-medium text-gray-500 dark:text-gray-400 text-sm">Total</th>
                            <th className="text-left p-2 font-medium text-gray-500 dark:text-gray-400 text-sm">Status</th>
                            <th className="text-left p-2 font-medium text-gray-500 dark:text-gray-400 text-sm">Payment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {supplierPurchases.map((purchase) => (
                            <tr key={purchase._id} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="p-2 text-sm font-mono">{purchase.purchaseNumber}</td>
                              <td className="p-2 text-sm">{format(new Date(purchase.createdAt), 'MMM dd, yyyy')}</td>
                              <td className="p-2 text-sm text-right">{purchase.items.length}</td>
                              <td className="p-2 text-sm text-right font-medium">{formatCurrency(purchase.total)}</td>
                              <td className="p-2 text-sm">
                                <Badge variant={
                                  purchase.status === 'RECEIVED' ? 'success' :
                                  purchase.status === 'PENDING' ? 'warning' :
                                  'danger'
                                } className="capitalize">{purchase.status}</Badge>
                              </td>
                              <td className="p-2 text-sm">
                                <Badge variant={
                                  purchase.paymentStatus === 'PAID' ? 'success' :
                                  purchase.paymentStatus === 'PARTIAL' ? 'warning' :
                                  'danger'
                                } className="capitalize">{purchase.paymentStatus}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No purchase history</p>
                  )}
                </div>
              </div>
            )}
            <ModalFooter>
              <Button onClick={() => setShowDetailModal(false)}>Close</Button>
            </ModalFooter>
          </Modal>
        </div>
  );
}

import { Mail, Phone, User } from 'lucide-react';