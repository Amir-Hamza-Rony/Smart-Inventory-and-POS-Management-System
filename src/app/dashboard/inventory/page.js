'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { useUIStore } from '@/stores/posStore';
import { Search, Filter, Plus, Download, RefreshCw, ArrowUp, ArrowDown, Minus, Package, AlertTriangle, XCircle, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { format } from 'date-fns';

export default function InventoryPage() {
  const { sidebarOpen } = useUIStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ inStock: 0, lowStock: 0, outOfStock: 0, totalValue: 0 });
  const [activeTab, setActiveTab] = useState('list'); // list, movements

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStats();
  }, [currentPage, search, statusFilter, categoryFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
      });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('categoryId', categoryFilter);

      const response = await fetch(`/api/inventory?${params}`);
      const data = await response.json();
      if (data.products) {
        setProducts(data.products);
        setTotalPages(Math.ceil(data.total / 50));
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?includeProductCount=true');
      const data = await response.json();
      if (data.categories) setCategories(data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/inventory/stats');
      const data = await response.json();
      if (data) setStats(data);
    } catch (error) {
      console.error('Failed to fetch inventory stats:', error);
    }
  };

  const getStockStatus = (product) => {
    if (product.stock === 0) return { label: 'Out of Stock', variant: 'danger', icon: '🔴' };
    if (product.stock <= product.minStock) return { label: 'Low Stock', variant: 'warning', icon: '🟡' };
    return { label: 'In Stock', variant: 'success', icon: '🟢' };
  };

  const handleStockAdjustment = async (product, type) => {
    const quantity = prompt(`Enter quantity to ${type === 'IN' ? 'add' : type === 'OUT' ? 'remove' : 'set'}:`);
    if (!quantity) return;

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (type === 'OUT' && product.stock < qty) {
      alert('Insufficient stock');
      return;
    }

    const reason = prompt('Reason for adjustment:') || 'Manual adjustment';

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          type,
          quantity: qty,
          reason,
          userId: 'current-user-id', // TODO: Get from auth
        }),
      });

      if (response.ok) {
        fetchProducts();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to adjust stock');
      }
    } catch (error) {
      alert('Failed to adjust stock');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your product stock levels</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => { fetchProducts(); fetchStats(); }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">In Stock</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.inStock)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.lowStock)}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Out of Stock</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.outOfStock)}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Inventory Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalValue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search products (name, SKU, barcode)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'in-stock', label: 'In Stock' },
                    { value: 'low-stock', label: 'Low Stock' },
                    { value: 'out-of-stock', label: 'Out of Stock' },
                  ]}
                  className="w-full sm:w-48"
                />
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c._id, label: `${c.name} (${c.productCount || 0})` }))]}
                  className="w-full sm:w-56"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="list">Product List</TabsTrigger>
              <TabsTrigger value="movements">Stock Movements</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                          <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Product</th>
                          <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Category</th>
                          <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Brand</th>
                          <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">SKU</th>
                          <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Current Stock</th>
                          <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Min Stock</th>
                          <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Cost</th>
                          <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Value</th>
                          <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                          <th className="text-right p-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={10} className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</td>
                          </tr>
                        ) : products.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="text-center py-8 text-gray-500 dark:text-gray-400">No products found</td>
                          </tr>
                        ) : (
                          products.map((product) => {
                            const status = getStockStatus(product);
                            const value = product.stock * product.cost;
                            return (
                              <tr key={product._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-3">
                                  <div className="flex items-center gap-3">
                                    {product.imageUrl ? (
                                      <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                                    ) : (
                                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                        <Package className="w-5 h-5 text-gray-400" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white text-sm">{product.name}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                                  {product.categoryId?.name || 'Uncategorized'}
                                </td>
                                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                                  {product.brandId?.name || '-'}
                                </td>
                                <td className="p-3 text-right text-sm font-mono text-gray-600 dark:text-gray-400">{product.sku}</td>
                                <td className="p-3 text-right font-medium text-gray-900 dark:text-white">{formatNumber(product.stock)}</td>
                                <td className="p-3 text-right text-sm text-gray-600 dark:text-gray-400">{formatNumber(product.minStock)}</td>
                                <td className="p-3 text-right text-sm text-gray-600 dark:text-gray-400">{formatCurrency(product.cost)}</td>
                                <td className="p-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(value)}</td>
                                <td className="p-3">
                                  <Badge variant={status.variant} className="capitalize">{status.label}</Badge>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleStockAdjustment(product, 'IN')}
                                      className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                      title="Add Stock"
                                    >
                                      <ArrowUp className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleStockAdjustment(product, 'OUT')}
                                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                      title="Remove Stock"
                                    >
                                      <ArrowDown className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleStockAdjustment(product, 'ADJUSTMENT')}
                                      className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                      title="Set Stock"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
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
            </TabsContent>

            <TabsContent value="movements">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Movement History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Stock movement history coming soon</p>
                    <p className="text-sm mt-1">This will show all stock adjustments, purchases, sales, and returns</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
    </div>
  );
}