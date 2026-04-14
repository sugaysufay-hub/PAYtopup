import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, Info, ChevronRight, Zap } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';

const PAYMENT_METHODS = [
  { id: 'QRIS', name: 'QRIS', fee: 0, icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg' },
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/checkout', {
        userId,
        zoneId,
        phoneNumber,
        sku: selectedProduct.id,
        productName: selectedProduct.name,
        nominal: selectedProduct.price + (selectedPayment.fee || 0),
        metode: selectedPayment.id
      });

      if (response.data.status === 'ok') {
        toast.success('Invoice berhasil dibuat!');
        if (response.data.payment_url) {
          window.location.href = response.data.payment_url;
        } else if (response.data.qr) {
          navigate(`/cek-status?id=${response.data.transactionId}`);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLogo = (brand: string) => {
    const name = brand.toLowerCase().replace(/\s+/g, '-');
    return `https://res.cloudinary.com/dey3ylteq/image/upload/f_auto,q_auto/${name}.png`;
  };

  return (
    <div className="pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Product Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-24">
            <div className="relative w-32 h-32 mx-auto rounded-3xl overflow-hidden bg-gray-50 mb-6 shadow-inner">
              <img 
                src={getLogo(brand || '')} 
                alt={brand} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${brand}/400/400`;
                }}
              />
            </div>
            <div className="text-center space-y-3 mb-8">
              <h1 className="text-2xl font-black text-[#121212]">{brand}</h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff6b00]/10 text-[#ff6b00] rounded-full text-xs font-bold">
                <Zap className="w-3 h-3 fill-current" />
                PROSES INSTAN
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#121212] uppercase tracking-wider">Cara Top Up</h3>
              <div className="space-y-3">
                {[
                  "Masukkan User ID & Zone ID",
                  "Pilih Nominal yang diinginkan",
                  "Pilih Metode Pembayaran",
                  "Masukkan No. WhatsApp",
                  "Klik Beli Sekarang & Bayar"
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-gray-500">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: User ID */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-[#ff6b00] text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-[#ff6b00]/20">1</div>
              <h2 className="text-xl font-black text-[#121212]">Lengkapi Data Akun</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-400">User ID</Label>
                <Input 
                  placeholder="Masukkan User ID" 
                  className="h-12 rounded-xl border-gray-200 focus:border-[#ff6b00] focus:ring-[#ff6b00]/20 transition-all font-medium"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-400">Zone ID (Opsional)</Label>
                <Input 
                  placeholder="Masukkan Zone ID" 
                  className="h-12 rounded-xl border-gray-200 focus:border-[#ff6b00] focus:ring-[#ff6b00]/20 transition-all font-medium"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                />
              </div>
            </div>
            <AnimatePresence>
              {nickname && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Nickname Ditemukan</p>
                    <p className="text-sm font-black text-green-700">{nickname}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Step 2: Select Product */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-[#ff6b00] text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-[#ff6b00]/20">2</div>
              <h2 className="text-xl font-black text-[#121212]">Pilih Nominal Top Up</h2>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-2xl bg-gray-50" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((product) => (
                  <button 
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all group overflow-hidden ${
                      selectedProduct?.id === product.id 
                        ? 'border-[#ff6b00] bg-[#ff6b00]/5' 
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className="relative z-10 space-y-1">
                      <p className={`text-sm font-bold line-clamp-2 transition-colors ${
                        selectedProduct?.id === product.id ? 'text-[#ff6b00]' : 'text-[#121212]'
                      }`}>
                        {product.name}
                      </p>
                      <p className="text-xs font-black text-gray-400">
                        Rp {product.price.toLocaleString()}
                      </p>
                    </div>
                    {selectedProduct?.id === product.id && (
                      <motion.div 
                        layoutId="activeProduct"
                        className="absolute top-2 right-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#ff6b00]" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Step 3: Payment Method */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-[#ff6b00] text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-[#ff6b00]/20">3</div>
              <h2 className="text-xl font-black text-[#121212]">Pilih Metode Pembayaran</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PAYMENT_METHODS.map((method) => (
                <button 
                  key={method.id}
                  onClick={() => setSelectedPayment(method)}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                    selectedPayment?.id === method.id 
                      ? 'border-[#ff6b00] bg-[#ff6b00]/5' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-10 bg-white rounded-xl border border-gray-100 p-2 flex items-center justify-center shadow-sm">
                      <img src={method.icon} alt={method.name} className="max-h-full object-contain" />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold transition-colors ${
                        selectedPayment?.id === method.id ? 'text-[#ff6b00]' : 'text-[#121212]'
                      }`}>
                        {method.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        {method.fee > 0 ? `+Rp ${method.fee}` : 'Bebas Biaya'}
                      </p>
                    </div>
                  </div>
                  {selectedPayment?.id === method.id && (
                    <CheckCircle2 className="w-5 h-5 text-[#ff6b00]" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Step 4: Contact & Checkout */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-[#ff6b00] text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-[#ff6b00]/20">4</div>
              <h2 className="text-xl font-black text-[#121212]">Konfirmasi Pesanan</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-400">Nomor WhatsApp</Label>
                <Input 
                  placeholder="Contoh: 08123456789" 
                  className="h-12 rounded-xl border-gray-200 focus:border-[#ff6b00] focus:ring-[#ff6b00]/20 transition-all font-medium"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-[10px] text-gray-400 font-medium italic">Bukti pembayaran akan dikirim otomatis via WhatsApp.</p>
              </div>

              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">Harga Produk</span>
                  <span className="text-[#121212] font-bold">Rp {(selectedProduct?.price || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">Biaya Layanan</span>
                  <span className="text-[#121212] font-bold">Rp {(selectedPayment?.fee || 0).toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-base font-black text-[#121212]">Total Bayar</span>
                  <span className="text-2xl font-black text-[#ff6b00]">
                    Rp {((selectedProduct?.price || 0) + (selectedPayment?.fee || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="h-14 rounded-2xl border-gray-200 flex-1 font-bold hover:bg-gray-50"
                  onClick={handleCheckNickname}
                  disabled={checkingNickname}
                >
                  {checkingNickname ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Cek Nickname
                </Button>
                <Button 
                  className="h-14 rounded-2xl bg-[#ff6b00] hover:bg-[#e66000] text-white flex-[2] font-black text-lg shadow-xl shadow-[#ff6b00]/20 transition-all active:scale-95 disabled:opacity-50"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Beli Sekarang
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
