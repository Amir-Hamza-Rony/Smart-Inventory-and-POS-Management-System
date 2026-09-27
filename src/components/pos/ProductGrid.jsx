'use client';

import { useState } from 'react';
import { Search, Barcode, Filter, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button, Input, Select, Card, Badge, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui';
import { useProductStore, usePosStore } from '@/stores/posStore';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function ProductGrid({ onEdit, onDelete, managementMode = false }) {
  const { products, categories, searchQuery, selectedCategory, setSearchQuery, setSelectedCategory, getFilteredProducts } = useProductStore();
  const { addItem, taxRate } = usePosStore();
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const filteredProducts = getFilteredProducts();

  const handleAddToCart = (product) => {
    addItem(product, 1);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search products (name, SKU, barcode)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCategoryFilter(!showCategoryFilter)}>
            <Filter className="w-4 h-4 mr-1" />
            Category
          </Button>
          {showCategoryFilter && (
            <Select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c._id, label: c.name }))]}
              className="w-48"
            />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Barcode className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">No products found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAdd={handleAddToCart}
                onEdit={onEdit}
                onDelete={onDelete}
                managementMode={managementMode}
                lowStock={product.stock <= product.minStock}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAdd, onEdit, onDelete, managementMode, lowStock }) {
  const categoryName = product.categoryId?.name || 'Uncategorized';

  if (managementMode) {
    return (
      <Card className="p-3 flex flex-col min-h-[200px]">
        <div className="relative mb-2">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-28 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-28 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Barcode className="w-10 h-10 text-gray-400" />
            </div>
          )}
          <div className="absolute top-1 right-1 flex gap-1">
            {lowStock && (
              <Badge variant="warning" className="text-xs">Low Stock</Badge>
            )}
            {product.stock === 0 && (
              <Badge variant="danger" className="text-xs">Out of Stock</Badge>
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col mb-2">
          <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
            {product.name}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{categoryName}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">SKU: {product.sku}</p>
          <div className="mt-auto flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(product.price)}
            </span>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded',
              product.stock === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              lowStock ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            )}>
              Stock: {product.stock}
            </span>
          </div>
        </div>
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); onEdit?.(product); }}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
            onClick={(e) => { e.stopPropagation(); onDelete?.(product._id); }}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3 flex flex-col cursor-pointer hover:shadow-md transition-shadow min-h-[200px]" onClick={() => onAdd(product)}>
      <div className="relative mb-2">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-28 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-28 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Barcode className="w-10 h-10 text-gray-400" />
          </div>
        )}
        {lowStock && (
          <span className="absolute top-1 right-1">
            <Badge variant="warning">Low Stock</Badge>
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-1 right-1">
            <Badge variant="danger">Out of Stock</Badge>
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
          {product.name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{categoryName}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">SKU: {product.sku}</p>
        <div className="mt-auto flex items-baseline justify-between">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(product.price)}
          </span>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded',
            product.stock === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            lowStock ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          )}>
            Stock: {product.stock}
          </span>
        </div>
      </div>
    </Card>
  );
}