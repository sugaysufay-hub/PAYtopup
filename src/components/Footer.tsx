import { Instagram, Twitter, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#121212] text-white border-t border-white/5 mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <img 
                src="https://res.cloudinary.com/dey3ylteq/image/upload/f_auto,q_auto/file_00000000c53c720b85cfd32d77bd66cb_ak4xjw" 
                alt="Logo" 
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Platform top up game dan produk digital terpercaya di Indonesia. 
              Proses cepat, harga bersahabat, dan layanan otomatis 24/7.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#ff6b00] transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#ff6b00] transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#ff6b00] transition-all">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-black text-lg mb-6 uppercase tracking-wider">Menu Cepat</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-[#ff6b00] transition-colors">Beranda</Link></li>
              <li><Link to="/cek-status" className="hover:text-[#ff6b00] transition-colors">Cek Status</Link></li>
              <li><Link to="/admin" className="hover:text-[#ff6b00] transition-colors">Admin Panel</Link></li>
              <li><a href="#" className="hover:text-[#ff6b00] transition-colors">Syarat & Ketentuan</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-lg mb-6 uppercase tracking-wider">Metode Bayar</h4>
            <div className="grid grid-cols-3 gap-3">
              {['QRIS', 'DANA', 'OVO', 'GOPAY', 'SHOPEEPAY', 'LINKAJA'].map((m) => (
                <div key={m} className="aspect-[3/2] bg-white/5 rounded-xl flex items-center justify-center p-2 border border-white/5">
                  <span className="text-[8px] font-black text-gray-500">{m}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black text-lg mb-6 uppercase tracking-wider">Bantuan</h4>
            <p className="text-sm text-gray-400 mb-6">Punya kendala? Hubungi Customer Service kami.</p>
            <a 
              href="https://wa.me/628123456789" 
              className="flex items-center justify-center gap-3 bg-[#ff6b00] hover:bg-[#e66000] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#ff6b00]/20 transition-all active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp CS
            </a>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} <span className="text-white">PayTopUpMurah</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
