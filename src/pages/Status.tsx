import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Copy, Download, MessageCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Status() {
  const [transactionId, setTransactionId] = useState('');
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!transactionId) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/transaction/${transactionId}`);
      setTransaction(response.data);
    } catch (error) {
      toast.error('Transaksi tidak ditemukan');
      setTransaction(null);
    } finally {
      setLoading(false);
    }
  };

  // Real-time polling
  useEffect(() => {
    if (!transaction?.id) return;
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/transaction/${transaction.id}`);
        setTransaction(response.data);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [transaction?.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-500 text-white font-bold px-4 py-1 rounded-full">Berhasil</Badge>;
      case 'failed': return <Badge className="bg-red-500 text-white font-bold px-4 py-1 rounded-full">Gagal</Badge>;
      default: return <Badge className="bg-[#ff6b00] text-white font-bold px-4 py-1 rounded-full">Pending</Badge>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('ID Transaksi disalin');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-black text-[#121212]">Lacak Pesanan</h1>
        <p className="text-gray-500 font-medium">Masukkan ID Transaksi untuk melihat status pesanan real-time.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input 
            placeholder="Contoh: PAY-123456789" 
            className="h-14 rounded-2xl border-gray-200 focus:border-[#ff6b00] focus:ring-[#ff6b00]/20 font-bold text-lg"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
          />
          <Button 
            className="h-14 px-8 bg-[#ff6b00] hover:bg-[#e66000] text-white font-black rounded-2xl shadow-xl shadow-[#ff6b00]/20 transition-all active:scale-95" 
            onClick={handleSearch} 
            disabled={loading}
          >
            <Search className="w-5 h-5 mr-2" />
            Cari
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {transaction && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100"
          >
            <div className={`h-2 w-full ${
              transaction.status === 'success' ? 'bg-green-500' : 
              transaction.status === 'failed' ? 'bg-red-500' : 'bg-[#ff6b00]'
            }`} />
            
            <div className="p-6 md:p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-[#121212]">Detail Transaksi</h2>
                {getStatusBadge(transaction.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID Transaksi</p>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-[#121212]">{transaction.id}</p>
                    <button onClick={() => copyToClipboard(transaction.id)} className="text-[#ff6b00] hover:text-[#e66000]">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 md:text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Produk</p>
                  <p className="font-black text-[#121212]">{transaction.productName}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User ID</p>
                  <p className="font-bold text-[#121212]">{transaction.userId} {transaction.zoneId ? `(${transaction.zoneId})` : ''}</p>
                </div>

                <div className="space-y-1 md:text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Metode Bayar</p>
                  <p className="font-bold text-[#121212]">{transaction.paymentMethod}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waktu Transaksi</p>
                  <p className="font-medium text-gray-600">{new Date(transaction.createdAt).toLocaleString('id-ID')}</p>
                </div>

                <div className="space-y-1 md:text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Bayar</p>
                  <p className="text-2xl font-black text-[#ff6b00]">Rp {transaction.price.toLocaleString()}</p>
                </div>
              </div>

              {transaction.status === 'pending' && transaction.paymentUrl && (
                <Button 
                  className="w-full h-14 bg-[#ff6b00] hover:bg-[#e66000] text-white font-black rounded-2xl shadow-xl shadow-[#ff6b00]/20 transition-all" 
                  onClick={() => window.location.href = transaction.paymentUrl}
                >
                  Lanjutkan Pembayaran
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              )}

              <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="h-12 rounded-xl border-gray-200 flex-1 font-bold hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" />
                  Simpan Struk
                </Button>
                <Button variant="outline" className="h-12 rounded-xl border-gray-200 flex-1 font-bold hover:bg-gray-50">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Hubungi CS
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
