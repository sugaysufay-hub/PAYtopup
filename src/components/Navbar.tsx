import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  const handleLogin = () => {
    toast.info('Fitur login pelanggan sedang dalam pemeliharaan.');
  };

  const handleLogout = () => {
    setUser(null);
    toast.success('Berhasil keluar');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <ShoppingCart className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold gradient-text hidden sm:block">PayTopUpMurah</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium hover:text-orange-400 transition-colors">Beranda</Link>
          <Link to="/cek-status" className="text-sm font-medium hover:text-orange-400 transition-colors">Cek Status</Link>
          <Link to="/admin" className="text-sm font-medium hover:text-orange-400 transition-colors">Admin</Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="w-5 h-5" />
          </Button>
          
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold line-clamp-1">{user.displayName}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1">{user.email}</span>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 hidden sm:flex"
              onClick={handleLogin}
            >
              Masuk
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
