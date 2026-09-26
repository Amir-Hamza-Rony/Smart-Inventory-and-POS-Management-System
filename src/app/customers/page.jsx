'use client';

import { useEffect, useState } from 'react';
import { Header, Sidebar } from '@/components/layout';
import { Button, Input, Modal, ModalFooter, Card, CardContent, Badge } from '@/components/ui';
import { useUIStore } from '@/stores/posStore';
import { Plus, Search, Edit, Trash2, User, Mail, Phone, MapPin, Award } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { format } from 'date-fns';

export default function CustomersPage() {
  const { sidebarOpen } = useUIStore();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      if (search) params.set('search', search);

      const response = await fetch(`/api/customers?${params}`);
      const data = await response.json();
      if (data.customers) {
        setCustomers(data.customers);
        setTotalPages(Math.ceil(data.total / 20));
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, search]);

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
    setShowForm(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer._id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        fetchCustomers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save customer');
      }
    } catch (error) {
      alert('Failed to save customer');
    }
  };

  const handleDelete = async (customerId) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      const response = await fetch(`/api/customers/${customerId}`, { method: 'DELETE' });
      if (response.ok) {
        fetchCustomers();
      } else {
        alert('Failed to delete customer');
      }
    } catch (error) {
      alert('Failed to delete customer');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className={sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} style={{ flex: 1, minWidth: 0 }}>
        <Header />
        <main className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
            <Button onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search customers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Contact</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Address</th>
                      <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Total Spent</th>
                      <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Visits</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Loyalty Points</th>
                      <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Last Visit</th>
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
                    ) : customers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No customers found
                        </td>
                      </tr>
                    ) : (
                      customers.map((customer) => (
                        <tr key={customer._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Joined {format(new Date(customer.createdAt), 'MMM dd, yyyy')}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                            {customer.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {customer.email}</div>}
                            {customer.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.phone}</div>}
                          </td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                            {customer.address || '-'}
                          </td>
                          <td className="p-3 text-right font-medium text-gray-900 dark:text-white">
                            {formatCurrency(customer.totalSpent)}
                          </td>
                          <td className="p-3 text-right text-gray-600 dark:text-gray-400">
                            {formatNumber(customer.visitCount)}
                          </td>
                          <td className="p-3">
                            <Badge variant="info">{formatNumber(customer.loyaltyPoints)} pts</Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                            {customer.lastVisit ? format(new Date(customer.lastVisit), 'MMM dd, yyyy') : 'Never'}
                          </td>
                          <td className="p-3 text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(customer._id)}>
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
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingCustomer ? 'Edit Customer' : 'Add Customer'} size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <ModalFooter>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">{editingCustomer ? 'Update' : 'Create'}</Button>
              </ModalFooter>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}