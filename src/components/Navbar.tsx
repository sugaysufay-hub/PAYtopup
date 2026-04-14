import { Link } from 'react-router-dom';
import { Search, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
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
    <nav className="sticky top-0 z-50 bg-[#121212] border-b border-white/5 shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="https://res.cloudinary.com/dey3ylteq/image/upload/f_auto,q_auto/file_00000000c53c720b85cfd32d77bd66cb_ak4xjw" 
            alt="Logo" 
            className="h-10 w-auto object-contain"
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-semibold text-white hover:text-[#ff6b00] transition-colors">Beranda</Link>
          <Link to="/cek-status" className="text-sm font-semibold text-white hover:text-[#ff6b00] transition-colors">Cek Status</Link>
          <Link to="/admin" className="text-sm font-semibold text-white hover:text-[#ff6b00] transition-colors">Admin</Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
            <Search className="w-5 h-5" />
          </Button>
          
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-white line-clamp-1">{user.displayName}</span>
                <span className="text-[10px] text-gray-400 line-clamp-1">{user.email}</span>
              </div>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Button 
              className="bg-[#ff6b00] hover:bg-[#e66000] text-white font-bold rounded-full px-6"
              onClick={handleLogin}
            >
              Masuk
            </Button>
          )}

          <Button variant="ghost" size="icon" className="text-white md:hidden">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
