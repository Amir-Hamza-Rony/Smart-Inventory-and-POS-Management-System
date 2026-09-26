'use client';

import { useEffect, useState } from 'react';
import { Header, Sidebar } from '@/components/layout';
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useUIStore } from '@/stores/posStore';
import { Save, Store, DollarSign, CreditCard, Receipt, Bell, Shield, Palette } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function SettingsPage() {
  const { sidebarOpen } = useUIStore();
  const [settings, setSettings] = useState({
    storeName: 'Smart POS',
    taxRate: 0,
    currency: 'USD',
    receiptFooter: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    {
      title: 'General',
      icon: Store,
      fields: [
        { key: 'storeName', label: 'Store Name', type: 'text', placeholder: 'Enter store name' },
        { key: 'taxRate', label: 'Tax Rate (%)', type: 'number', step: '0.01', min: 0, max: 100 },
        { key: 'currency', label: 'Currency', type: 'select', options: [
          { value: 'USD', label: 'USD - US Dollar' },
          { value: 'EUR', label: 'EUR - Euro' },
          { value: 'GBP', label: 'GBP - British Pound' },
          { value: 'CAD', label: 'CAD - Canadian Dollar' },
          { value: 'AUD', label: 'AUD - Australian Dollar' },
        ]},
      ],
    },
    {
      title: 'Receipt',
      icon: Receipt,
      fields: [
        { key: 'receiptFooter', label: 'Receipt Footer Text', type: 'textarea', placeholder: 'Thank you for your purchase!', rows: 3 },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className={sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} style={{ flex: 1, minWidth: 0 }}>
        <Header />
        <main className="p-4 lg:p-6 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {saved && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg flex items-center gap-2 text-green-800 dark:text-green-400">
              <Bell className="w-5 h-5" />
              <span>Settings saved successfully!</span>
            </div>
          )}

          <div className="space-y-6">
            {sections.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <section.icon className="w-5 h-5 text-gray-500" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {field.label}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={settings[field.key] || ''}
                            onChange={(e) => setSettings({...settings, [field.key]: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={field.rows || 3}
                            placeholder={field.placeholder}
                          />
                        ) : field.type === 'select' ? (
                          <Select
                            value={settings[field.key] || ''}
                            onChange={(e) => setSettings({...settings, [field.key]: e.target.value})}
                            options={field.options}
                            className="w-full"
                          />
                        ) : (
                          <Input
                            type={field.type}
                            step={field.step}
                            min={field.min}
                            max={field.max}
                            value={settings[field.key] || ''}
                            onChange={(e) => setSettings({...settings, [field.key]: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value})}
                            placeholder={field.placeholder}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-500" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    User management features coming soon. This will include:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li>Add/remove staff members</li>
                    <li>Role-based access control (Admin, Manager, Cashier)</li>
                    <li>Password management</li>
                    <li>Activity logs</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-gray-500" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theme</label>
                    <Select
                      value="light"
                      onChange={() => {}}
                      options={[
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                        { value: 'system', label: 'System Default' },
                      ]}
                      className="w-full max-w-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}