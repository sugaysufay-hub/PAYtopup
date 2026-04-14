import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { RefreshCw, Settings, ListOrdered, Save, Loader2, Lock, LogOut } from 'lucide-react';
import axios from 'axios';

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
        // Fetch Transactions
        const transRes = await axios.get('/api/admin/transactions');
        setTransactions(transRes.data);

        // Fetch Settings
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
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-slate-400">Memuat data...</p>
      </div>
    );
  }

  if (!customAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] px-4">
        <Card className="glass-card w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Lock className="w-8 h-8 text-orange-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <p className="text-sm text-slate-400">Gunakan Username, Password & OTP WhatsApp</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input 
                  placeholder="Masukkan username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="glass border-white/10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Kata Sandi</Label>
                <Input 
                  type="password"
                  placeholder="Masukkan kata sandi"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="glass border-white/10"
                  required
                />
              </div>
              
              {otpSent ? (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label>Kode OTP (Cek WhatsApp)</Label>
                  <Input 
                    placeholder="6 Digit Kode OTP"
                    value={loginForm.otp}
                    onChange={(e) => setLoginForm({ ...loginForm, otp: e.target.value })}
                    className="glass border-white/10"
                    required
                  />
                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 mt-4">
                    Verifikasi & Masuk
                  </Button>
                </div>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="w-full bg-orange-500 hover:bg-orange-600 mt-4"
                >
                  {sendingOtp ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Kirim OTP ke WhatsApp
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
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
      console.error('Sync Error:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Gagal sinkronisasi produk');
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveSettings = async () => {
    // Validation
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
      console.error('Save Settings Error:', error);
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="flex gap-4">
          <Button onClick={handleLogout} variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          <Button onClick={handleSync} disabled={syncing} className="bg-orange-500">
            {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Sync Digiflazz
          </Button>
        </div>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="glass mb-8">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4" />
            Transaksi
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Pengaturan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="glass-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
                    <tr>
                      <th className="p-4">ID / Waktu</th>
                      <th className="p-4">Produk / User</th>
                      <th className="p-4">Harga / Payment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((t) => (
                      <tr key={t.id} className="text-sm hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="font-mono text-xs">{t.id}</div>
                          <div className="text-slate-500 text-[10px]">{new Date(t.createdAt).toLocaleString()}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold">{t.productName}</div>
                          <div className="text-slate-400 text-xs">{t.userId}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-orange-400">Rp {t.price.toLocaleString()}</div>
                          <div className="text-slate-500 text-xs">{t.paymentMethod}</div>
                        </td>
                        <td className="p-4">
                          <Badge className={
                            t.status === 'success' ? 'bg-green-500' : 
                            t.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                          }>
                            {t.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8 text-[10px]" onClick={() => updateStatus(t.id, 'success')}>Success</Button>
                            <Button size="sm" variant="outline" className="h-8 text-[10px]" onClick={() => updateStatus(t.id, 'failed')}>Failed</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>API Digiflazz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input 
                    value={digiflazzUsername} 
                    onChange={(e) => setDigiflazzUsername(e.target.value)}
                    className="glass border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input 
                    type="password"
                    value={digiflazzApiKey} 
                    onChange={(e) => setDigiflazzApiKey(e.target.value)}
                    className="glass border-white/10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>API VIPayment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Merchant ID</Label>
                  <Input 
                    value={vipaymentMerchantId} 
                    onChange={(e) => setVipaymentMerchantId(e.target.value)}
                    className="glass border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input 
                    type="password"
                    value={vipaymentApiKey} 
                    onChange={(e) => setVipaymentApiKey(e.target.value)}
                    className="glass border-white/10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Notifikasi Admin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>WhatsApp Admin (Untuk OTP)</Label>
                  <Input 
                    placeholder="Contoh: 628123456789"
                    value={whatsapp} 
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="glass border-white/10"
                  />
                  <p className="text-[10px] text-slate-500">Nomor ini akan menerima kode OTP setiap kali Anda login ke panel admin.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card md:col-span-2">
              <CardHeader>
                <CardTitle>Margin Keuntungan (Otomatis)</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Margin &lt; 10k</Label>
                  <Input 
                    type="number"
                    value={marginLow} 
                    onChange={(e) => setMarginLow(Number(e.target.value))}
                    className="glass border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Margin 10k - 50k</Label>
                  <Input 
                    type="number"
                    value={marginMid} 
                    onChange={(e) => setMarginMid(Number(e.target.value))}
                    className="glass border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Margin &gt; 50k</Label>
                  <Input 
                    type="number"
                    value={marginHigh} 
                    onChange={(e) => setMarginHigh(Number(e.target.value))}
                    className="glass border-white/10"
                  />
                </div>
                <div className="md:col-span-3 pt-4">
                  <Button className="w-full bg-orange-500" onClick={handleSaveSettings}>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Pengaturan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
