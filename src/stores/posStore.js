import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialCart = {
  items: [],
  discount: 0,
  discountType: 'percentage',
  taxRate: 0,
  customerId: null,
  notes: '',
};

export const usePosStore = create(
  persist(
    (set, get) => ({
      ...initialCart,

      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existingIndex = items.findIndex(item => item.productId === product._id);

        if (existingIndex >= 0) {
          const newItems = [...items];
          newItems[existingIndex].quantity += quantity;
          newItems[existingIndex].total = newItems[existingIndex].price * newItems[existingIndex].quantity;
          set({ items: newItems });
        } else {
          const newItem = {
            id: crypto.randomUUID(),
            productId: product._id,
            productName: product.name,
            sku: product.sku,
            barcode: product.barcode,
            price: Number(product.price),
            cost: Number(product.cost),
            quantity,
            total: Number(product.price) * quantity,
            imageUrl: product.imageUrl,
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter(item => item.id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map(item =>
            item.id === itemId
              ? { ...item, quantity, total: item.price * quantity }
              : item
          ),
        });
      },

      setDiscount: (discount, type = 'percentage') => {
        set({ discount, discountType: type });
      },

      setTaxRate: (rate) => set({ taxRate: Number(rate) || 0 }),

      setCustomerId: (customerId) => set({ customerId }),

      setNotes: (notes) => set({ notes }),

      clearCart: () => set(initialCart),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.total, 0);
      },

      getDiscountAmount: () => {
        const { items, discount, discountType } = get();
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        if (discountType === 'percentage') {
          return subtotal * (discount / 100);
        }
        return discount;
      },

      getTaxAmount: () => {
        const { items, taxRate, discount, discountType } = get();
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const discountAmount = discountType === 'percentage'
          ? subtotal * (discount / 100)
          : discount;
        return (subtotal - discountAmount) * (taxRate / 100);
      },

      getTotal: () => {
        const { items, discount, discountType, taxRate } = get();
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const discountAmount = discountType === 'percentage'
          ? subtotal * (discount / 100)
          : discount;
        const taxable = subtotal - discountAmount;
        const tax = taxable * (taxRate / 100);
        return subtotal - discountAmount + tax;
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'pos-cart',
      partialize: (state) => ({
        items: state.items,
        discount: state.discount,
        discountType: state.discountType,
        taxRate: state.taxRate,
        customerId: state.customerId,
        notes: state.notes,
      }),
    }
  )
);

export const useProductStore = create((set, get) => ({
  products: [],
  categories: [],
  searchQuery: '',
  selectedCategory: null,
  loading: false,

  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setLoading: (loading) => set({ loading }),

  getFilteredProducts: () => {
    const { products, searchQuery, selectedCategory } = get();
    return products.filter(product => {
      const matchesSearch = !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.categoryId?._id === selectedCategory || product.categoryId === selectedCategory;
      return matchesSearch && matchesCategory && product.isActive;
    });
  },
}));

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  activeModal: null,
  activeTab: 'pos',
  theme: 'light',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTheme: (theme) => set({ theme }),
}));