import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Clock, CheckCircle2, XCircle, Copy, Download } from 'lucide-react';

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
      case 'success': return <Badge className="bg-green-500">Berhasil</Badge>;
      case 'failed': return <Badge className="bg-red-500">Gagal</Badge>;
      default: return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('ID Transaksi disalin');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Cek Status Pesanan</h1>
        <p className="text-slate-400">Masukkan ID Transaksi Anda untuk melihat status pesanan secara real-time.</p>
      </div>

      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input 
              placeholder="Contoh: PAY-123456789" 
              className="glass border-white/10"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Cari
            </Button>
          </div>
        </CardContent>
      </Card>

      {transaction && (
        <Card className="glass-card overflow-hidden">
          <div className={`h-2 w-full ${
            transaction.status === 'success' ? 'bg-green-500' : 
            transaction.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Detail Transaksi</CardTitle>
            {getStatusBadge(transaction.status)}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-slate-400">ID Transaksi</div>
              <div className="font-mono flex items-center justify-end gap-2">
                {transaction.id}
                <Copy className="w-4 h-4 cursor-pointer hover:text-orange-500" onClick={() => copyToClipboard(transaction.id)} />
              </div>
              
              <div className="text-slate-400">Produk</div>
              <div className="text-right font-bold">{transaction.productName}</div>
              
              <div className="text-slate-400">User ID</div>
              <div className="text-right">{transaction.userId} {transaction.zoneId ? `(${transaction.zoneId})` : ''}</div>
              
              <div className="text-slate-400">Metode Pembayaran</div>
              <div className="text-right">{transaction.paymentMethod}</div>
              
              <div className="text-slate-400">Total Harga</div>
              <div className="text-right font-bold text-orange-500">Rp {transaction.price.toLocaleString()}</div>
              
              <div className="text-slate-400">Waktu</div>
              <div className="text-right">{new Date(transaction.createdAt).toLocaleString('id-ID')}</div>
            </div>

            {transaction.status === 'pending' && transaction.paymentUrl && (
              <Button className="w-full bg-orange-500" onClick={() => window.location.href = transaction.paymentUrl}>
                Lanjutkan Pembayaran
              </Button>
            )}

            <div className="pt-6 border-t border-white/10 flex gap-2">
              <Button variant="outline" className="glass border-white/10 flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download Struk
              </Button>
              <Button variant="outline" className="glass border-white/10 flex-1">
                Hubungi Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
