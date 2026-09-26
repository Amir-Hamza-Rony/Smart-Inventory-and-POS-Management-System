import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { checkApiPermission, canAccessPage } from '@/lib/permissions';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/api/auth/signup',
  '/api/auth/login',
  '/api/auth/logout',
];

const PUBLIC_API_PREFIXES = [
  '/api/auth/',
];

function isPublicPath(pathname) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/static')) return true;
  if (pathname.startsWith('/favicon')) return true;
  if (PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix))) return true;
  return false;
}

// API route permissions mapping
const API_PERMISSIONS = {
  // Products
  'GET /api/products': 'products.view',
  'POST /api/products': 'products.create',
  'GET /api/products/': 'products.view',
  'PUT /api/products/': 'products.edit',
  'DELETE /api/products/': 'products.delete',

  // Categories
  'GET /api/categories': 'categories.view',
  'POST /api/categories': 'categories.create',
  'GET /api/categories/': 'categories.view',
  'PUT /api/categories/': 'categories.edit',
  'DELETE /api/categories/': 'categories.delete',

  // Brands
  'GET /api/brands': 'brands.view',
  'POST /api/brands': 'brands.create',
  'GET /api/brands/': 'brands.view',
  'PUT /api/brands/': 'brands.edit',
  'DELETE /api/brands/': 'brands.delete',

  // Sales
  'GET /api/sales': 'sales.view',
  'POST /api/sales': 'sales.create',
  'GET /api/sales/': 'sales.view',
  'PUT /api/sales/': 'sales.edit',
  'DELETE /api/sales/': 'sales.delete',

  // Customers
  'GET /api/customers': 'customers.view',
  'POST /api/customers': 'customers.create',
  'GET /api/customers/': 'customers.view',
  'PUT /api/customers/': 'customers.edit',
  'DELETE /api/customers/': 'customers.delete',

  // Reports
  'GET /api/reports': 'reports.view',

  // Inventory
  'GET /api/inventory': 'inventory.view',
  'POST /api/inventory': 'inventory.adjust',
  'GET /api/inventory/stats': 'inventory.view',

  // Purchases
  'GET /api/purchases': 'purchases.view',
  'POST /api/purchases': 'purchases.create',
  'GET /api/purchases/': 'purchases.view',
  'PUT /api/purchases/': 'purchases.edit',
  'PATCH /api/purchases/': 'purchases.receive',
  'DELETE /api/purchases/': 'purchases.delete',
  'GET /api/purchases/stats': 'purchases.view',

  // Suppliers
  'GET /api/suppliers': 'suppliers.view',
  'POST /api/suppliers': 'suppliers.create',
  'GET /api/suppliers/': 'suppliers.view',
  'PUT /api/suppliers/': 'suppliers.edit',
  'DELETE /api/suppliers/': 'suppliers.delete',

  // Returns
  'GET /api/returns': 'returns.view',
  'POST /api/returns': 'returns.create',
  'GET /api/returns/': 'returns.view',
  'PATCH /api/returns/': 'returns.process',
  'DELETE /api/returns/': 'returns.delete',

  // Notifications
  'GET /api/notifications': 'notifications.view',
  'POST /api/notifications': 'notifications.manage',
  'PATCH /api/notifications/': 'notifications.manage',

  // Activity Logs
  'GET /api/activity-logs': 'activity-logs.view',

  // Settings
  'GET /api/settings': 'settings.view',
  'PUT /api/settings': 'settings.edit',

  // Dashboard Overview
  'GET /api/dashboard/overview': 'dashboard.view',
};

function getApiPermission(method, pathname) {
  // Try exact match first
  const exactKey = `${method} ${pathname}`;
  if (API_PERMISSIONS[exactKey]) return API_PERMISSIONS[exactKey];

  // Try pattern match for dynamic routes (e.g., /api/products/123)
  for (const [pattern, permission] of Object.entries(API_PERMISSIONS)) {
    const [patternMethod, patternPath] = pattern.split(' ');
    if (patternMethod === method && patternPath.endsWith('/')) {
      if (pathname.startsWith(patternPath)) return permission;
    }
  }

  return null; // No permission required (or unknown route)
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check authentication
  const user = await getUserFromRequest(request);

  if (!user) {
    // Redirect to login for page routes
    if (!pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Return 401 for API routes
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const userRole = user.role;

  // Check page access for non-API routes
  if (!pathname.startsWith('/api/')) {
    if (!canAccessPage(userRole, pathname)) {
      const dashboardUrl = new URL('/dashboard/overview', request.url);
      dashboardUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Check API permissions
  if (pathname.startsWith('/api/')) {
    const requiredPermission = getApiPermission(method, pathname);
    if (requiredPermission && !checkApiPermission(userRole, requiredPermission)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
  }

  // Add user info to request headers for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.userId);
  requestHeaders.set('x-user-email', user.email);
  requestHeaders.set('x-user-name', user.name);
  requestHeaders.set('x-user-role', user.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};