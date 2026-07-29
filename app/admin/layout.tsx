"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, Plus, Settings, ChevronLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname.startsWith('/admin/edit/') && pathname !== href) {
      if (!window.confirm("Make sure you've published your changes! Are you sure you want to leave this page?")) {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-black/40 border-r border-white/5 p-4 flex flex-col gap-2">
        <Link 
          href="/admin"
          onClick={(e) => handleNav(e, '/admin')}
          className="flex items-center gap-3 px-2 py-4 mb-4 group outline-none"
        >
          <span className="font-bold text-lg group-hover:text-accent transition-colors">Chordly Admin</span>
        </Link>

        <Link 
          href="/admin" 
          onClick={(e) => handleNav(e, '/admin')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/admin' ? 'bg-white/10 text-white' : 'text-secondary hover:text-white hover:bg-white/5'}`}
        >
          <Music size={18} />
          <span>All Songs</span>
        </Link>
        <Link 
          href="/admin/edit/new" 
          className={`hidden md:flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/admin/edit/new' ? 'bg-white/10 text-white' : 'text-secondary hover:text-white hover:bg-white/5'}`}
        >
          <Plus size={18} />
          <span>New Song</span>
        </Link>
        
        <div className="flex-1" />

        <Link 
          href="/" 
          onClick={(e) => handleNav(e, '/')}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary hover:text-white hover:bg-white/5 transition-colors mt-auto"
        >
          <ChevronLeft size={18} />
          <span>Back to App</span>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
