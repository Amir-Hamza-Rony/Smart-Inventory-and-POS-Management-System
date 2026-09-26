'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function DropdownMenu({ children }) {
  return <>{children}</>;
}

export function DropdownMenuTrigger({ children, ...props }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block" {...props}>
      <button
        onClick={() => setOpen(!open)}
        className="focus:outline-none"
      >
        {children}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in">
          <div className="py-1">
            {props.children && props.children.props?.children}
          </div>
        </div>
      )}
    </div>
  );
}

export function DropdownMenuContent({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white dark:bg-gray-800 py-1 text-gray-900 dark:text-white shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, className, disabled, ...props }) {
  return (
    <button
      onClick={(e) => {
        if (!disabled) onClick?.(e);
      }}
      disabled={disabled}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuLabel({ children, className, ...props }) {
  return (
    <div className={cn('px-2 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400', className)} {...props}>
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className, ...props }) {
  return <div className={cn('-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-700', className)} {...props} />;
}

export function DropdownMenuGroup({ children, ...props }) {
  return <div {...props}>{children}</div>;
}