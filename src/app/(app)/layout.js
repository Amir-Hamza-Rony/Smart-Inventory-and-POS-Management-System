'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { logout } = useAuth();

  // Persist sidebar state in localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
    }
  }, [collapsed, mounted]);

  const handleSignOut = async () => {
    await logout();
    window.location.href = '/';
  };

  const sidebarWidth = collapsed ? '64px' : '256px';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712' }}>

      {/* Fixed Sidebar - independent of content height */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onSignOut={handleSignOut}
        sidebarWidth={sidebarWidth}
      />

      {/* Main content with left margin for sidebar */}
      <div style={{
        marginLeft: sidebarWidth,
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Header onMenuClick={() => setCollapsed(!collapsed)} sidebarWidth={sidebarWidth} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </main>
      </div>

    </div>
  );
}