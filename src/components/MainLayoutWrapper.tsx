'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === '/dashboard' || pathname === '/admin-panel/dashboard';
  const isProduct = pathname.startsWith('/product/');
  const isHome = pathname === '/';
  const isAccount = pathname.startsWith('/account');

  return (
    <div className={`relative flex-1 flex flex-col ${isAdmin || isProduct || isHome || isAccount ? '' : 'pt-24'}`}>
      {children}
    </div>
  );
}
