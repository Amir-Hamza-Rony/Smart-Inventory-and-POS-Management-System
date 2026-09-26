'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Tabs = ({ children, value, onValueChange, defaultValue, orientation = 'horizontal', ...props }) => {
  return (
    <div
      data-orientation={orientation}
      {...props}
    >
      {children}
    </div>
  );
};

const TabsList = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400',
        className
      )}
      {...props}
    />
  );
});
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef(({ className, value, disabled, ...props }, ref) => {
  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={false}
      aria-disabled={disabled}
      data-state={false ? 'active' : 'inactive'}
      data-disabled={disabled ? '' : undefined}
      data-value={value}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-white dark:data-[state=active]:text-gray-900',
        className
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef(({ className, value, forceMount, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="tabpanel"
      data-value={value}
      data-orientation="horizontal"
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };