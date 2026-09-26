'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/components/providers/AuthProvider';

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#030712' }}>

      {/* Sidebar with dynamic width */}
      <div style={{
        width: collapsed ? '64px' : '256px',
        flexShrink: 0,
        transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}>
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Main content expands when sidebar collapses */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}>
        <Header onMenuClick={() => setCollapsed(!collapsed)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </main>
      </div>

    </div>
  );
}