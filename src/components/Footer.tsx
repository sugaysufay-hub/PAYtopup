import { ShoppingCart, Instagram, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="glass border-t border-white/10 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold gradient-text">PayTopUpMurah</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Platform top up game dan produk digital terpercaya di Indonesia. 
              Proses cepat, harga bersahabat, dan layanan 24/7.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6">Menu Cepat</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Beranda</Link></li>
              <li><Link to="/cek-status" className="hover:text-orange-400 transition-colors">Cek Status</Link></li>
              <li><Link to="/admin" className="hover:text-orange-400 transition-colors">Admin Panel</Link></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Syarat & Ketentuan</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Metode Pembayaran</h4>
            <div className="grid grid-cols-3 gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 glass rounded flex items-center justify-center p-1">
                  <div className="w-full h-full bg-white/10 rounded" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6">Bantuan</h4>
            <p className="text-sm text-slate-400 mb-4">Punya kendala? Hubungi kami via WhatsApp.</p>
            <a 
              href="https://wa.me/628123456789" 
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp CS
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} PayTopUpMurah. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
