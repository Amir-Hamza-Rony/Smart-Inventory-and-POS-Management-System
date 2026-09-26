'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { useUIStore } from '@/stores/posStore';
import { useAuth } from '@/components/providers/AuthProvider';
import { Search, Filter, Plus, Download, RefreshCw, ArrowUp, ArrowDown, Minus, Package, AlertTriangle, XCircle, DollarSign, History, RotateCcw, ShoppingCart, Truck } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { format } from 'date-fns';

export default function InventoryPage() {
  const { sidebarOpen } = useUIStore();
  const { user } = useAuth();
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

  // Stock movements state
  const [movements, setMovements] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementsTotalPages, setMovementsTotalPages] = useState(1);
  const [movementsCurrentPage, setMovementsCurrentPage] = useState(1);
  const [movementTypeFilter, setMovementTypeFilter] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStats();
  }, [currentPage, search, statusFilter, categoryFilter]);

  useEffect(() => {
    if (activeTab === 'movements') {
      fetchMovements();
    }
  }, [activeTab, movementsCurrentPage, movementTypeFilter]);

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

  const fetchMovements = async () => {
    setMovementsLoading(true);
    try {
      const params = new URLSearchParams({
        page: movementsCurrentPage.toString(),
        limit: '50',
      });
      if (movementTypeFilter) params.set('action', movementTypeFilter);

      const response = await fetch(`/api/activity-logs?entity=PRODUCT&${params}`);
      const data = await response.json();
      if (data.logs) {
        setMovements(data.logs);
        setMovementsTotalPages(Math.ceil(data.total / 50));
      }
    } catch (error) {
      console.error('Failed to fetch stock movements:', error);
    } finally {
      setMovementsLoading(false);
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
          userId: user?.id || 'current-user-id',
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

  const getMovementIcon = (action) => {
    const icons = {
      STOCK_IN: ArrowUp,
      STOCK_OUT: ArrowDown,
      STOCK_ADJUSTMENT: Minus,
      CREATE_PURCHASE: Truck,
      RECEIVE_PURCHASE: Truck,
      CREATE_SALE: ShoppingCart,
      CREATE_RETURN: RotateCcw,
      COMPLETE_RETURN: RotateCcw,
    };
    return icons[action] || History;
  };

  const getMovementColor = (action) => {
    if (action === 'STOCK_IN' || action === 'RECEIVE_PURCHASE') return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (action === 'STOCK_OUT' || action === 'CREATE_SALE') return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
    if (action === 'STOCK_ADJUSTMENT') return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    if (action === 'CREATE_RETURN' || action === 'COMPLETE_RETURN') return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
    if (action === 'CREATE_PURCHASE') return 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30';
    return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
  };

  const formatAction = (action) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
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
                  <div className="flex items-center justify-between">
                    <CardTitle>Stock Movement History</CardTitle>
                    <Select
                      value={movementTypeFilter}
                      onChange={(e) => { setMovementTypeFilter(e.target.value); setMovementsCurrentPage(1); }}
                      options={[
                        { value: '', label: 'All Types' },
                        { value: 'STOCK_IN', label: 'Stock In' },
                        { value: 'STOCK_OUT', label: 'Stock Out' },
                        { value: 'STOCK_ADJUSTMENT', label: 'Adjustment' },
                        { value: 'RECEIVE_PURCHASE', label: 'Purchase Received' },
                        { value: 'CREATE_SALE', label: 'Sale' },
                        { value: 'CREATE_RETURN', label: 'Return' },
                        { value: 'COMPLETE_RETURN', label: 'Return Completed' },
                      ]}
                      className="w-48"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {movementsLoading ? (
                    <div className="py-12 text-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Loading movements...</p>
                    </div>
                  ) : movements.length === 0 ? (
                    <div className="py-12 text-center">
                      <History className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No stock movements found</h3>
                      <p className="text-gray-500 dark:text-gray-400">Stock movements will appear here after sales, purchases, returns, or manual adjustments</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {movements.map((movement) => {
                        const MovementIcon = getMovementIcon(movement.action);
                        const colorClass = getMovementColor(movement.action);
                        const metadata = movement.metadata || {};
                        const prevStock = metadata.previousStock !== undefined ? metadata.previousStock : '-';
                        const newStock = metadata.newStock !== undefined ? metadata.newStock : '-';
                        const quantity = metadata.quantity ? (movement.action === 'STOCK_OUT' || movement.action === 'CREATE_SALE' ? -metadata.quantity : metadata.quantity) : null;

                        return (
                          <div key={movement._id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                <MovementIcon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                      {formatAction(movement.action)}
                                      <Badge variant="default" className="text-xs">{movement.entity}</Badge>
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{movement.details || '-'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      By {movement.userName} ({movement.userEmail}) • {format(new Date(movement.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4 text-right whitespace-nowrap">
                                    <div className="text-sm">
                                      <span className="text-gray-500 dark:text-gray-400">Prev: </span>
                                      <span className="font-medium">{formatNumber(prevStock)}</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-gray-500 dark:text-gray-400">New: </span>
                                      <span className="font-medium">{formatNumber(newStock)}</span>
                                    </div>
                                    {quantity !== null && (
                                      <span className={`text-sm font-medium ${quantity < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {quantity > 0 ? '+' : ''}{quantity}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {movement.metadata?.referenceId && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Reference: {movement.metadata.referenceType} #{movement.metadata.referenceId}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {movementsTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Page {movementsCurrentPage} of {movementsTotalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMovementsCurrentPage(p => Math.max(1, p - 1))}
                          disabled={movementsCurrentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMovementsCurrentPage(p => Math.min(movementsTotalPages, p + 1))}
                          disabled={movementsCurrentPage === movementsTotalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
    );
}