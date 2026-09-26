'use client';

import { cn } from '@/lib/utils';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

const alertVariants = {
  default: 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700',
  destructive: 'bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800',
  success: 'bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800',
  warning: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800',
};

const iconMap = {
  default: Info,
  destructive: AlertTriangle,
  success: CheckCircle,
  warning: AlertTriangle,
};

export function Alert({ className, variant = 'default', title, children, onClose, ...props }) {
  const Icon = iconMap[variant];

  return (
    <div
      className={cn(
        'relative flex w-full items-center gap-4 rounded-lg border p-4',
        alertVariants[variant],
        className
      )}
      role="alert"
      {...props}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1">
        {title && (
          <h5 className="font-medium leading-none">{title}</h5>
        )}
        <div className="text-sm [&_p]:leading-relaxed [&_p]:my-1">
          {children}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
}

export function AlertTitle({ className, ...props }) {
  return (
    <h5 className={cn('mb-1 font-medium leading-none', className)} {...props} />
  );
}

export function AlertDescription({ className, ...props }) {
  return (
    <div className={cn('text-sm [&_p]:leading-relaxed [&_p]:my-1', className)} {...props} />
  );
}