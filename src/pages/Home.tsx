import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { Gamepad2, Smartphone, Zap, Wallet, Ticket } from 'lucide-react';
import { motion } from 'motion/react';

const CATEGORIES = [
  { id: 'Game', icon: Gamepad2, label: 'Games' },
  { id: 'Pulsa', icon: Smartphone, label: 'Pulsa' },
  { id: 'PLN', icon: Zap, label: 'PLN' },
  { id: 'E-Wallet', icon: Wallet, label: 'E-Wallet' },
  { id: 'Voucher', icon: Ticket, label: 'Voucher' },
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Game');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await axios.get('/api/products');
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const getBrands = (category: string) => {
    const filtered = products.filter(p => p.category === category);
    const brands = Array.from(new Set(filtered.map(p => p.brand)));
    return brands.sort();
  };

  const getLogo = (brand: string) => {
    const name = brand.toLowerCase().replace(/\s+/g, '-');
    return `https://res.cloudinary.com/dey3ylteq/image/upload/f_auto,q_auto/${name}.png`;
  };

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#121212] py-12 md:py-20 mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b00]/20 to-transparent z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-black text-white leading-tight mb-4"
            >
              Top Up Game <br />
              <span className="text-[#ff6b00]">Murah & Instan</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-sm md:text-base max-w-md"
            >
              Layanan top up game dan produk digital terlengkap. 
              Proses otomatis 24 jam nonstop.
            </motion.p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Categories Horizontal Scroll */}
        <div className="flex items-center gap-3 overflow-x-auto pb-6 no-scrollbar mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full whitespace-nowrap font-bold transition-all ${
                activeTab === cat.id 
                ? 'bg-[#ff6b00] text-white shadow-lg shadow-[#ff6b00]/20' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#121212] flex items-center gap-2">
              <div className="w-2 h-6 bg-[#ff6b00] rounded-full" />
              Daftar {activeTab}
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-2xl bg-white" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {getBrands(activeTab).map((brand: any) => (
                <Link key={brand} to={`/product/${encodeURIComponent(brand as string)}`}>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#ff6b00]/10 border border-transparent hover:border-[#ff6b00]/30 transition-all group cursor-pointer h-full flex flex-col"
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      <img 
                        src={getLogo(brand)} 
                        alt={brand}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${brand}/400/400`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-white text-xs font-bold">Top Up Sekarang</span>
                      </div>
                    </div>
                    <div className="p-3 md:p-4 flex-1 flex flex-col justify-center">
                      <h3 className="font-bold text-sm md:text-base text-[#121212] line-clamp-1 group-hover:text-[#ff6b00] transition-colors">{brand}</h3>
                      <p className="text-[10px] md:text-xs text-gray-400 font-medium uppercase tracking-wider">{activeTab}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
