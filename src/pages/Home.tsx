import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Gamepad2, Smartphone, Zap, Wallet, Ticket } from 'lucide-react';

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
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[300px] rounded-3xl overflow-hidden flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-blue-900/40 z-0" />
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/gaming/1920/1080')] bg-cover bg-center opacity-20 z-[-1]" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Top Up <span className="gradient-text">Kilat</span> & <span className="gradient-text">Murah</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Layanan top up game dan produk digital terlengkap di Indonesia. 
            Proses otomatis 24 jam nonstop.
          </p>
        </div>
      </section>

      {/* Categories Tabs */}
      <Tabs defaultValue="Game" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-center mb-8">
          <TabsList className="glass p-1 h-auto flex-wrap justify-center gap-2">
            {CATEGORIES.map(cat => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id}
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-xl px-6 py-3 flex items-center gap-2 transition-all"
              >
                <cat.icon className="w-5 h-5" />
                <span className="font-medium">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {CATEGORIES.map(cat => (
          <TabsContent key={cat.id} value={cat.id} className="mt-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {[...Array(12)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {getBrands(cat.id).map((brand: any) => (
                  <Link key={brand} to={`/product/${encodeURIComponent(brand as string)}`}>
                    <Card className="glass-card hover:border-orange-500/50 transition-all group cursor-pointer h-full flex flex-col items-center justify-center text-center gap-4 p-4">
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 flex items-center justify-center">
                        <img 
                          src={getLogo(brand)} 
                          alt={brand}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/game/200/200';
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm line-clamp-1">{brand}</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{cat.id}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
