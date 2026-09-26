/**
 * Role-Based Access Control (RBAC) utilities
 *
 * Roles hierarchy: ADMIN > MANAGER > CASHIER
 * - ADMIN: Full access to everything
 * - MANAGER: All except Settings and Activity Logs
 * - CASHIER: Only POS, Customers, Own Sales, Profile
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
};

export const PERMISSIONS = {
  // Dashboard & POS
  'dashboard.view': [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  'pos.access': [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],

  // Products
  'products.view': [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  'products.create': [ROLES.ADMIN, ROLES.MANAGER],
  'products.edit': [ROLES.ADMIN, ROLES.MANAGER],
  'products.delete': [ROLES.ADMIN],

  // Sales
  'sales.view': [ROLES.ADMIN, ROLES.MANAGER],
  'sales.view_own': [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  'sales.create': [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  'sales.edit': [ROLES.ADMIN, ROLES.MANAGER],
  'sales.delete': [ROLES.ADMIN],

  // Customers
  'customers.view': [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  'customers.create': [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  'customers.edit': [ROLES.ADMIN, ROLES.MANAGER],
  'customers.delete': [ROLES.ADMIN],

  // Reports
  'reports.view': [ROLES.ADMIN, ROLES.MANAGER],

  // Inventory
  'inventory.view': [ROLES.ADMIN, ROLES.MANAGER],
  'inventory.adjust': [ROLES.ADMIN, ROLES.MANAGER],

  // Purchases
  'purchases.view': [ROLES.ADMIN, ROLES.MANAGER],
  'purchases.create': [ROLES.ADMIN, ROLES.MANAGER],
  'purchases.receive': [ROLES.ADMIN, ROLES.MANAGER],
  'purchases.cancel': [ROLES.ADMIN, ROLES.MANAGER],
  'purchases.delete': [ROLES.ADMIN],

  // Suppliers
  'suppliers.view': [ROLES.ADMIN, ROLES.MANAGER],
  'suppliers.create': [ROLES.ADMIN, ROLES.MANAGER],
  'suppliers.edit': [ROLES.ADMIN, ROLES.MANAGER],
  'suppliers.delete': [ROLES.ADMIN],

  // Returns
  'returns.view': [ROLES.ADMIN, ROLES.MANAGER],
  'returns.create': [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  'returns.process': [ROLES.ADMIN, ROLES.MANAGER],
  'returns.delete': [ROLES.ADMIN],

  // Notifications
  'notifications.view': [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  'notifications.manage': [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],

  // Activity Logs (Admin only)
  'activity-logs.view': [ROLES.ADMIN],

  // Categories
  'categories.view': [ROLES.ADMIN, ROLES.MANAGER],
  'categories.create': [ROLES.ADMIN, ROLES.MANAGER],
  'categories.edit': [ROLES.ADMIN, ROLES.MANAGER],
  'categories.delete': [ROLES.ADMIN],

  // Brands
  'brands.view': [ROLES.ADMIN, ROLES.MANAGER],
  'brands.create': [ROLES.ADMIN, ROLES.MANAGER],
  'brands.edit': [ROLES.ADMIN, ROLES.MANAGER],
  'brands.delete': [ROLES.ADMIN],

  // Settings (Admin only)
  'settings.view': [ROLES.ADMIN],
  'settings.edit': [ROLES.ADMIN],

  // Profile (All roles)
  'profile.view': [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  'profile.edit': [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role (ADMIN, MANAGER, CASHIER)
 * @param {string} permission - Permission key from PERMISSIONS
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

/**
 * Check if a role can access a specific page/route
 * @param {string} role - User role
 * @param {string} path - Page path
 * @returns {boolean}
 */
export function canAccessPage(role, path) {
  const pagePermissions = {
    '/dashboard': 'pos.access',
    '/dashboard/overview': 'dashboard.view',
    '/products': 'products.view',
    '/sales': 'sales.view',
    '/sales/new': 'sales.create',
    '/customers': 'customers.view',
    '/reports': 'reports.view',
    '/settings': 'settings.view',
    '/dashboard/inventory': 'inventory.view',
    '/dashboard/purchases': 'purchases.view',
    '/dashboard/suppliers': 'suppliers.view',
    '/dashboard/returns': 'returns.view',
    '/dashboard/notifications': 'notifications.view',
    '/dashboard/activity-logs': 'activity-logs.view',
    '/dashboard/categories': 'categories.view',
    '/dashboard/brands': 'brands.view',
    '/dashboard/profile': 'profile.view',
  };

  // Find the most specific matching path
  const matchingPath = Object.keys(pagePermissions).find(p => path.startsWith(p));
  if (!matchingPath) return true; // Allow unknown paths by default

  return hasPermission(role, pagePermissions[matchingPath]);
}

/**
 * Get navigation items filtered by user role
 * @param {string} role - User role
 * @returns {Array} Filtered navigation items
 */
export function getNavigationForRole(role) {
  const mainNav = [
    { name: 'Dashboard', href: '/dashboard/overview', icon: 'LayoutDashboard', permission: 'dashboard.view' },
    { name: 'POS', href: '/dashboard', icon: 'ShoppingCart', permission: 'pos.access' },
    { name: 'Products', href: '/products', icon: 'Package', permission: 'products.view' },
    { name: 'Sales', href: '/sales', icon: 'BarChart2', permission: 'sales.view' },
    { name: 'Customers', href: '/customers', icon: 'Users', permission: 'customers.view' },
    { name: 'Settings', href: '/settings', icon: 'Settings', permission: 'settings.view' },
  ];

  const adminOnly = [
    { name: 'Reports', href: '/reports', icon: 'FileText', permission: 'reports.view' },
    { name: 'Inventory', href: '/dashboard/inventory', icon: 'Box', permission: 'inventory.view' },
    { name: 'Purchases', href: '/dashboard/purchases', icon: 'ShoppingBag', permission: 'purchases.view' },
    { name: 'Suppliers', href: '/dashboard/suppliers', icon: 'Building2', permission: 'suppliers.view' },
    { name: 'Returns', href: '/dashboard/returns', icon: 'RotateCcw', permission: 'returns.view' },
    { name: 'Notifications', href: '/dashboard/notifications', icon: 'Bell', permission: 'notifications.view' },
    { name: 'Activity Logs', href: '/dashboard/activity-logs', icon: 'Activity', permission: 'activity-logs.view' },
    { name: 'Categories', href: '/dashboard/categories', icon: 'Tag', permission: 'categories.view' },
    { name: 'Brands', href: '/dashboard/brands', icon: 'Image', permission: 'brands.view' },
  ];

  return {
    main: mainNav.filter(item => hasPermission(role, item.permission)),
    admin: adminOnly.filter(item => hasPermission(role, item.permission)),
  };
}

/**
 * Middleware helper to check API permissions
 * @param {string} role - User role
 * @param {string} permission - Permission key
 * @returns {boolean}
 */
export function checkApiPermission(role, permission) {
  return hasPermission(role, permission);
}