import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, Info } from 'lucide-react';
import axios from 'axios';

const PAYMENT_METHODS = [
  { id: 'QRIS', name: 'QRIS (All Payment)', fee: 0, icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg' },
  { id: 'DANA', name: 'DANA', fee: 500, icon: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg' },
  { id: 'OVO', name: 'OVO', fee: 500, icon: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg' },
  { id: 'GOPAY', name: 'GOPAY', fee: 500, icon: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg' },
];

export default function ProductDetail() {
  const { brand } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [nickname, setNickname] = useState('');
  const [checkingNickname, setCheckingNickname] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await axios.get(`/api/products?brand=${encodeURIComponent(brand || '')}`);
        if (response.data.success) {
          setProducts(response.data.data.sort((a: any, b: any) => a.price - b.price));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [brand]);

  const handleCheckNickname = async () => {
    if (!userId || !selectedProduct) {
      toast.error('Pilih produk dan masukkan User ID terlebih dahulu');
      return;
    }

    setCheckingNickname(true);
    setNickname('');
    
    try {
      const customer_no = zoneId ? `${userId}(${zoneId})` : userId;
      const response = await axios.post('/api/check-nickname', {
        sku: selectedProduct.id,
        customer_no
      });

      if (response.data.data && response.data.data.customer_name) {
        setNickname(response.data.data.customer_name);
        toast.success('Nickname ditemukan!');
      } else {
        setNickname('Nickname tidak ditemukan');
        toast.error('Nickname tidak ditemukan');
      }
    } catch (error) {
      toast.error('Gagal mengecek nickname');
    } finally {
      setCheckingNickname(false);
    }
  };

  const handleCheckout = async () => {
    if (!userId || !selectedProduct || !selectedPayment || !phoneNumber) {
      toast.error('Harap lengkapi semua data');
      return;
    }

    try {
      const response = await axios.post('/api/vipayment/create', {
        userId,
        zoneId,
        phoneNumber,
        sku: selectedProduct.id,
        productName: selectedProduct.name,
        price: selectedProduct.price + (selectedPayment.fee || 0),
        paymentMethod: selectedPayment.id
      });

      if (response.data.success) {
        toast.success('Invoice berhasil dibuat! Mengalihkan ke pembayaran...');
        if (response.data.payment_url) {
          window.location.href = response.data.payment_url;
        } else if (response.data.qr) {
          // If only QR is provided, we might need a modal, but usually payment_url is enough
          toast.info('QR Code tersedia. Silakan cek status pesanan.');
          navigate(`/cek-status?id=${response.data.transactionId}`);
        }
      }
    } catch (error: any) {
      console.error('Checkout Error:', error);
      toast.error(error.response?.data?.error || 'Gagal membuat transaksi');
    }
  };

  const getLogo = (brand: string) => {
    const name = brand.toLowerCase().replace(/\s+/g, '-');
    return `https://res.cloudinary.com/dey3ylteq/image/upload/f_auto,q_auto/${name}.png`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar: Product Info */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="glass-card sticky top-24">
          <CardContent className="pt-6 space-y-6">
            <div className="relative w-32 h-32 mx-auto rounded-3xl overflow-hidden bg-slate-800">
              <img 
                src={getLogo(brand || '')} 
                alt={brand} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/game/200/200';
                }}
              />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">{brand}</h1>
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                Proses Otomatis
              </Badge>
            </div>
            <div className="space-y-4 text-sm text-slate-400">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-orange-500 shrink-0" />
                <p>Masukkan User ID dan Zone ID Anda dengan benar. Contoh: 12345678(1234).</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <p>Pilih item yang ingin Anda beli.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <p>Pilih metode pembayaran dan masukkan nomor WhatsApp.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Form */}
      <div className="lg:col-span-2 space-y-8">
        {/* Step 1: User ID */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-sm">1</div>
              Lengkapi Data Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input 
                placeholder="Masukkan User ID" 
                className="glass border-white/10"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Zone ID (Opsional)</Label>
              <Input 
                placeholder="Masukkan Zone ID" 
                className="glass border-white/10"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
              />
            </div>
            {nickname && (
              <div className="md:col-span-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-400">Nickname: {nickname}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Select Product */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-sm">2</div>
              Pilih Nominal Top Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/5" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                      selectedProduct?.id === product.id 
                        ? 'bg-orange-500/20 border-orange-500 shadow-lg shadow-orange-500/10' 
                        : 'glass border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span className="text-sm font-bold line-clamp-2">{product.name}</span>
                    <span className="text-xs text-orange-400 font-medium">
                      Rp {product.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Payment Method */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-sm">3</div>
              Pilih Metode Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PAYMENT_METHODS.map((method) => (
                <div 
                  key={method.id}
                  onClick={() => setSelectedPayment(method)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedPayment?.id === method.id 
                      ? 'bg-orange-500/20 border-orange-500' 
                      : 'glass border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-white rounded p-1 flex items-center justify-center">
                      <img src={method.icon} alt={method.name} className="max-h-full" />
                    </div>
                    <span className="text-sm font-medium">{method.name}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {method.fee > 0 ? `+Rp ${method.fee}` : 'Gratis Biaya'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Contact & Checkout */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-sm">4</div>
              Konfirmasi Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Nomor WhatsApp</Label>
              <Input 
                placeholder="Contoh: 08123456789" 
                className="glass border-white/10"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-[10px] text-slate-500">Bukti pembayaran akan dikirim ke nomor ini.</p>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Total Pembayaran</p>
                <p className="text-2xl font-black text-orange-500">
                  Rp {((selectedProduct?.price || 0) + (selectedPayment?.fee || 0)).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="glass border-white/10 flex-1 sm:flex-none"
                  onClick={handleCheckNickname}
                  disabled={checkingNickname}
                >
                  {checkingNickname ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Cek Nickname
                </Button>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white flex-1 sm:flex-none px-8"
                  onClick={handleCheckout}
                >
                  Bayar Sekarang
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
