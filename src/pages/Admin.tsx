import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { RefreshCw, Settings, ListOrdered, Save, Loader2, Lock, LogOut, ChevronRight, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';

export default function Admin() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [digiflazzUsername, setDigiflazzUsername] = useState("");
  const [digiflazzApiKey, setDigiflazzApiKey] = useState("");
  const [vipaymentMerchantId, setVipaymentMerchantId] = useState("");
  const [vipaymentApiKey, setVipaymentApiKey] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [marginLow, setMarginLow] = useState(1000);
  const [marginMid, setMarginMid] = useState(2000);
  const [marginHigh, setMarginHigh] = useState(3000);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [customAuth, setCustomAuth] = useState(localStorage.getItem('admin_login') === 'true');
  const [loginForm, setLoginForm] = useState({ username: '', password: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSendOtp = async () => {
    if (!loginForm.username || !loginForm.password) {
      toast.error('Masukkan Username dan Password');
      return;
    }
    setSendingOtp(true);
    try {
      await axios.post('/api/send-otp', { 
        username: loginForm.username, 
        password: loginForm.password 
      });
      setOtpSent(true);
      toast.success('OTP dikirim ke WhatsApp Admin');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal mengirim OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/verify-otp', loginForm);
      if (response.data.success) {
        setCustomAuth(true);
        localStorage.setItem('admin_login', 'true');
        toast.success('Selamat datang, Admin!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login gagal');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_login');
    setCustomAuth(false);
    toast.success('Berhasil logout');
  };

  useEffect(() => {
    if (!customAuth) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const transRes = await axios.get('/api/admin/transactions');
        setTransactions(transRes.data);

        const settingsRes = await axios.get('/api/settings');
        const data = settingsRes.data;
        setDigiflazzUsername(data.digiflazzUsername || "");
        setDigiflazzApiKey(data.digiflazzApiKey || "");
        setVipaymentMerchantId(data.vipaymentMerchantId || "");
        setVipaymentApiKey(data.vipaymentApiKey || "");
        setWhatsapp(data.whatsapp || "");
        setMarginLow(data.margin?.low || 1000);
        setMarginMid(data.margin?.mid || 2000);
        setMarginHigh(data.margin?.high || 3000);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Gagal memuat data admin.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [customAuth]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b00]" />
        <p className="text-gray-400 font-bold">Memuat data admin...</p>
      </div>
    );
  }

  if (!customAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[40px] w-full max-w-md p-8 md:p-10 shadow-2xl shadow-black/5 border border-gray-100"
        >
          <div className="text-center space-y-4 mb-10">
            <div className="w-20 h-20 bg-[#ff6b00]/10 rounded-[30px] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-[#ff6b00]" />
            </div>
            <h1 className="text-3xl font-black text-[#121212]">Admin Panel</h1>
            <p className="text-sm text-gray-400 font-medium">Gunakan kredensial admin & OTP WhatsApp</p>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-400 ml-1">Username</Label>
              <Input 
                placeholder="Masukkan username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="h-14 rounded-2xl border-gray-200 focus:border-[#ff6b00] focus:ring-[#ff6b00]/20 font-bold"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-400 ml-1">Kata Sandi</Label>
              <Input 
                type="password"
                placeholder="Masukkan kata sandi"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="h-14 rounded-2xl border-gray-200 focus:border-[#ff6b00] focus:ring-[#ff6b00]/20 font-bold"
                required
              />
            </div>
            
            <AnimatePresence>
              {otpSent ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-gray-400 ml-1">Kode OTP (WhatsApp)</Label>
                    <Input 
                      placeholder="6 Digit Kode OTP"
                      value={loginForm.otp}
                      onChange={(e) => setLoginForm({ ...loginForm, otp: e.target.value })}
                      className="h-14 rounded-2xl border-gray-200 focus:border-[#ff6b00] focus:ring-[#ff6b00]/20 font-black text-center text-2xl tracking-widest"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-14 bg-[#ff6b00] hover:bg-[#e66000] text-white font-black rounded-2xl shadow-xl shadow-[#ff6b00]/20 transition-all">
                    Verifikasi & Masuk
                  </Button>
                </motion.div>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="w-full h-14 bg-[#ff6b00] hover:bg-[#e66000] text-white font-black rounded-2xl shadow-xl shadow-[#ff6b00]/20 transition-all"
                >
                  {sendingOtp ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Kirim OTP ke WhatsApp
                </Button>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    );
  }

  const handleSync = async () => {
    if (!digiflazzUsername || !digiflazzApiKey) {
      toast.error('Lengkapi API Digiflazz di pengaturan');
      return;
    }

    setSyncing(true);
    try {
      const res = await axios.post('/api/digiflazz');
      if (res.data.success) {
        toast.success(`Sinkronisasi berhasil ${res.data.total} produk`);
      } else {
        toast.error(res.data.message || 'Gagal sinkronisasi produk');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Gagal sinkronisasi produk');
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!whatsapp || !/^\d+$/.test(whatsapp)) {
      toast.error('WhatsApp harus berupa angka');
      return;
    }

    try {
      const response = await axios.post('/api/settings', {
        digiflazzUsername,
        digiflazzApiKey,
        vipaymentMerchantId,
        vipaymentApiKey,
        whatsapp,
        margin: {
          low: marginLow,
          mid: marginMid,
          high: marginHigh
        }
      });
      
      if (response.data.success) {
        toast.success('Berhasil disimpan');
      } else {
        toast.error('Gagal menyimpan');
      }
    } catch (error) {
      toast.error('Gagal menyimpan');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.post('/api/admin/update-status', { id, status });
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      toast.success('Status diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui status');
    }
  };

  return (
    <div className="space-y-10 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-[#121212]">Admin Dashboard</h1>
          <p className="text-gray-500 font-medium">Kelola transaksi, produk, dan pengaturan sistem.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleLogout} variant="outline" className="h-12 rounded-xl border-red-100 text-red-500 hover:bg-red-50 font-bold">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          <Button onClick={handleSync} disabled={syncing} className="h-12 rounded-xl bg-[#ff6b00] hover:bg-[#e66000] text-white font-black shadow-lg shadow-[#ff6b00]/20">
            {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Sync Produk
          </Button>
        </div>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-2xl mb-8">
          <TabsTrigger value="transactions" className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm font-black text-sm">
            <ListOrdered className="w-4 h-4 mr-2" />
            Transaksi
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm font-black text-sm">
            <Settings className="w-4 h-4 mr-2" />
            Pengaturan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">ID / Waktu</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Produk / User</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Harga / Payment</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-6">
                        <div className="font-black text-[#121212] text-xs">{t.id}</div>
                        <div className="text-gray-400 text-[10px] font-medium">{new Date(t.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="p-6">
                        <div className="font-black text-[#121212]">{t.productName}</div>
                        <div className="text-gray-500 text-xs font-bold">{t.userId}</div>
                      </td>
                      <td className="p-6">
                        <div className="font-black text-[#ff6b00]">Rp {t.price.toLocaleString()}</div>
                        <div className="text-gray-400 text-[10px] font-bold uppercase">{t.paymentMethod}</div>
                      </td>
                      <td className="p-6">
                        <Badge className={`font-black rounded-full px-4 py-1 ${
                          t.status === 'success' ? 'bg-green-500 text-white' : 
                          t.status === 'failed' ? 'bg-red-500 text-white' : 'bg-[#ff6b00] text-white'
                        }`}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className="p-6">
                        <div className="flex gap-2">
                          <Button size="sm" className="h-9 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-[10px]" onClick={() => updateStatus(t.id, 'success')}>Success</Button>
                          <Button size="sm" className="h-9 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-[10px]" onClick={() => updateStatus(t.id, 'failed')}>Failed</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><RefreshCw className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-[#121212]">API Digiflazz</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-400 ml-1">Username</Label>
                  <Input 
                    value={digiflazzUsername} 
                    onChange={(e) => setDigiflazzUsername(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#ff6b00] font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-400 ml-1">API Key</Label>
                  <Input 
                    type="password"
                    value={digiflazzApiKey} 
                    onChange={(e) => setDigiflazzApiKey(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#ff6b00] font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center"><Settings className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-[#121212]">API VIPayment</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-400 ml-1">Merchant ID</Label>
                  <Input 
                    value={vipaymentMerchantId} 
                    onChange={(e) => setVipaymentMerchantId(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#ff6b00] font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-400 ml-1">API Key</Label>
                  <Input 
                    type="password"
                    value={vipaymentApiKey} 
                    onChange={(e) => setVipaymentApiKey(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#ff6b00] font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center"><MessageCircle className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-[#121212]">Notifikasi Admin</h3>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-400 ml-1">WhatsApp Admin (OTP)</Label>
                <Input 
                  placeholder="Contoh: 628123456789"
                  value={whatsapp} 
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="h-12 rounded-xl border-gray-200 focus:border-[#ff6b00] font-bold"
                />
                <p className="text-[10px] text-gray-400 font-medium">Nomor ini akan menerima kode OTP setiap login admin.</p>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6 lg:col-span-2">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-orange-50 text-[#ff6b00] rounded-2xl flex items-center justify-center"><Save className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-[#121212]">Margin Keuntungan Otomatis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-400 ml-1">Margin &lt; 10k</Label>
                  <Input 
                    type="number"
                    value={marginLow} 
                    onChange={(e) => setMarginLow(Number(e.target.value))}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#ff6b00] font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-400 ml-1">Margin 10k - 50k</Label>
                  <Input 
                    type="number"
                    value={marginMid} 
                    onChange={(e) => setMarginMid(Number(e.target.value))}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#ff6b00] font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-400 ml-1">Margin &gt; 50k</Label>
                  <Input 
                    type="number"
                    value={marginHigh} 
                    onChange={(e) => setMarginHigh(Number(e.target.value))}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#ff6b00] font-bold"
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button className="w-full h-14 bg-[#ff6b00] hover:bg-[#e66000] text-white font-black rounded-2xl shadow-xl shadow-[#ff6b00]/20 transition-all" onClick={handleSaveSettings}>
                  <Save className="w-5 h-5 mr-2" />
                  Simpan Semua Pengaturan
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
