'use client';

import { AuthProvider } from '@/components/providers/AuthProvider';

export function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}