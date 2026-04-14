import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Setup
let supabaseInstance: any = null;
const getSupabase = () => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in environment variables.');
    }
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
};

// Helper for JSON Database
const dbPath = (name: string) => path.join(process.cwd(), 'data', `${name}.json`);

const readJSON = (name: string, defaultValue: any = []) => {
  try {
    const filePath = dbPath(name);
    if (!fs.existsSync(filePath)) return defaultValue;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return defaultValue;
  }
};

const writeJSON = (name: string, data: any) => {
  const filePath = dbPath(name);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper for Digiflazz Sign
  const getDigiflazzSign = (username: string, apiKey: string, cmd: string) => {
    return crypto.createHash('md5').update(username + apiKey + cmd).digest('hex');
  };

  // Helper for WhatsApp (Fonnte)
  const sendWhatsApp = async (to: string, message: string) => {
    console.log(`[WA] Sending to ${to}: ${message.substring(0, 20)}...`);
    try {
      const apiKey = process.env.FONNTE_API_KEY;
      if (!apiKey) {
        console.error('[WA] Missing FONNTE_API_KEY');
        return;
      }
      await axios.post('https://api.fonnte.com/send', {
        target: to,
        message: message,
      }, {
        headers: { Authorization: apiKey }
      });
      console.log('[WA] Success');
    } catch (error: any) {
      console.error('[WA] Error:', error.response?.data || error.message);
    }
  };

  // Admin Session Management (Simple in-memory)
  let adminSession: { otp: string, expires: number } | null = null;
  const ADMIN_USER = 'Sufayadmin';
  const ADMIN_PASS = 'Sufay0102';

  // API: Get Settings
  app.get('/api/settings', (req, res) => {
    console.log('[GET] /api/settings');
    try {
      const settings = readJSON('settings', {
        digiflazzUsername: '',
        digiflazzApiKey: '',
        vipaymentMerchantId: '',
        vipaymentApiKey: '',
        whatsapp: '628123456789',
        margin: { low: 1000, mid: 2000, high: 3000 }
      });
      res.status(200).json(settings);
    } catch (error: any) {
      console.error('[SETTINGS] Get Error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API: Save Settings
  app.post('/api/settings', (req, res) => {
    console.log('[POST] /api/settings');
    try {
      const { 
        digiflazzUsername, digiflazzApiKey, 
        vipaymentMerchantId, vipaymentApiKey, 
        whatsapp, margin 
      } = req.body;

      if (!whatsapp || !/^\d+$/.test(whatsapp)) {
        return res.status(400).json({ success: false, error: 'WhatsApp harus berupa angka' });
      }

      const settingsData = {
        digiflazzUsername: digiflazzUsername || '',
        digiflazzApiKey: digiflazzApiKey || '',
        vipaymentMerchantId: vipaymentMerchantId || '',
        vipaymentApiKey: vipaymentApiKey || '',
        whatsapp: whatsapp,
        margin: {
          low: Number(margin?.low || 1000),
          mid: Number(margin?.mid || 2000),
          high: Number(margin?.high || 3000)
        }
      };

      writeJSON('settings', settingsData);
      console.log('[SETTINGS] Saved successfully');
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('[SETTINGS] Save Error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API: Send Admin OTP
  app.post('/api/send-otp', async (req, res) => {
    console.log('[POST] /api/send-otp');
    try {
      const { username, password } = req.body;
      if (username !== ADMIN_USER || password !== ADMIN_PASS) {
        return res.status(401).json({ success: false, error: 'Kredensial salah' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      adminSession = { otp, expires: Date.now() + 5 * 60 * 1000 };

      const settings = readJSON('settings', { whatsapp: '628123456789' });
      await sendWhatsApp(settings.whatsapp, `Kode OTP Admin Anda: ${otp}. Berlaku selama 5 menit.`);
      
      res.status(200).json({ success: true, message: 'OTP dikirim ke WhatsApp Admin' });
    } catch (error: any) {
      console.error('[OTP] Send Error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API: Verify Admin OTP
  app.post('/api/verify-otp', async (req, res) => {
    console.log('[POST] /api/verify-otp');
    const { username, password, otp } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      if (adminSession && adminSession.otp === otp && adminSession.expires > Date.now()) {
        adminSession = null;
        return res.status(200).json({ success: true });
      }
      return res.status(401).json({ success: false, error: 'OTP salah atau kadaluarsa' });
    }
    res.status(401).json({ success: false, error: 'Kredensial salah' });
  });

  // API: Admin Proxy - Get Transactions
  app.get('/api/admin/transactions', async (req, res) => {
    console.log('[GET] /api/admin/transactions');
    try {
      const transactions = readJSON('transactions', []);
      res.status(200).json(transactions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error: any) {
      console.error('[ADMIN] Get Transactions Error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API: Admin Proxy - Update Transaction Status
  app.post('/api/admin/update-status', async (req, res) => {
    console.log('[POST] /api/admin/update-status');
    try {
      const { id, status } = req.body;
      const transactions = readJSON('transactions', []);
      const index = transactions.findIndex((t: any) => t.id === id);
      if (index !== -1) {
        transactions[index].status = status;
        transactions[index].updatedAt = new Date().toISOString();
        writeJSON('transactions', transactions);
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ success: false, error: 'Transaction not found' });
      }
    } catch (error: any) {
      console.error('[ADMIN] Update Status Error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API: Sync Products from Digiflazz
  app.post('/api/digiflazz', async (req, res) => {
    console.log('[POST] /api/digiflazz');
    try {
      const settings = readJSON('settings', {});
      const { digiflazzUsername: username, digiflazzApiKey: apiKey } = settings;

      if (!username || !apiKey) {
        return res.status(400).json({ success: false, error: 'Username atau API Key Digiflazz kosong' });
      }

      const sign = crypto.createHash('md5').update(username + apiKey + 'pricelist').digest('hex');
      const response = await axios.post('https://api.digiflazz.com/v1/price-list', {
        cmd: 'pricelist',
        username,
        sign
      });

      const raw = response.data;
      console.log("DIGIFLAZZ RAW:", JSON.stringify(raw));

      let products = Array.isArray(raw?.data?.data) 
        ? raw.data.data 
        : (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []));

      console.log("JUMLAH ASLI:", products.length);

      if (products.length === 0) {
        return res.status(200).json({
          success: false,
          message: "Produk kosong dari Digiflazz",
          raw: raw
        });
      }

      // Loosen filter to ensure products appear
      const filtered = products.filter((p: any) => p?.buyer_product_status !== false);
      console.log("JUMLAH SETELAH FILTER:", filtered.length);

      writeJSON('products', filtered);
      
      return res.json({
        success: true,
        total: filtered.length,
        data: filtered
      });
    } catch (error: any) {
      console.error('[DIGIFLAZZ] Sync Error:', error.response?.data || error.message);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Gagal sinkronisasi Digiflazz"
      });
    }
  });

  // API: Get Raw Products (for sync verification)
  app.get('/api/digiflazz', (req, res) => {
    console.log('[GET] /api/digiflazz');
    try {
      const products = readJSON('products', []);
      res.status(200).json({
        success: true,
        total: products.length,
        data: products
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // API: Checkout (Codashop Style)
  app.post('/api/checkout', async (req, res) => {
    console.log("CHECKOUT REQUEST:", req.body);
    try {
      const { userId, zoneId, phoneNumber, sku, productName, nominal, metode } = req.body;
      const settings = readJSON('settings', {});
      
      if (!settings?.vipaymentApiKey || !settings?.vipaymentMerchantId) {
        return res.status(400).json({ status: "error", message: 'VIPayment API belum dikonfigurasi' });
      }

      const timestamp = Date.now();
      const ref_id = `INV${timestamp}`;
      
      const payload = {
        key: settings.vipaymentApiKey,
        merchant: settings.vipaymentMerchantId,
        ref_id: ref_id,
        nominal: nominal,
        metode: metode,
        customer_name: userId || "Guest",
        customer_phone: phoneNumber
      };

      console.log("VIP REQUEST:", payload);

      const response = await axios.post('https://zijddnkpfadirqwtxmmk.supabase.co/functions/v1/vip-payment', payload);
      console.log("VIP RESPONSE:", response.data);

      if (response.data?.success) {
        const paymentData = response.data.data;
        const paymentUrl = paymentData.checkout_url || paymentData.payment_url || paymentData.checkout_link;
        const qrString = paymentData.qr_string || paymentData.qr_data || paymentData.qr_code;

        // 1. Save to Supabase (Initial Record)
        const { error: dbError } = await getSupabase()
          .from('transaksi')
          .upsert({
            ref_id: ref_id,
            status_vip: 'pending',
            nominal: nominal,
            metode: metode,
            product_sku: sku,
            product_name: productName,
            customer_no: zoneId ? `${userId}(${zoneId})` : userId,
            phone_number: phoneNumber,
            updated_at: new Date().toISOString()
          }, { onConflict: 'ref_id' });

        if (dbError) console.error("SUPABASE ERROR:", dbError.message);

        // 2. Save to local JSON (Backup)
        const newTransaction = {
          id: ref_id,
          userId, zoneId, phoneNumber, sku, productName, price: nominal, paymentMethod: metode,
          status: 'pending',
          paymentUrl,
          qrString,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const transactions = readJSON('transactions', []);
        transactions.push(newTransaction);
        writeJSON('transactions', transactions);

        res.status(200).json({ 
          status: "ok", 
          payment_url: paymentUrl,
          qr: qrString,
          transactionId: ref_id
        });
      } else {
        res.status(400).json({ 
          status: "error", 
          message: response.data?.message || response.data?.error || 'Gagal membuat invoice VIPayment' 
        });
      }
    } catch (error: any) {
      console.log("CHECKOUT ERROR:", error.message);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      res.status(error.response?.status || 500).json({ 
        status: "error", 
        message: errorMessage
      });
    }
  });

  // API: VIPayment Callback (Backup/Local)
  app.all('/api/vip-callback', async (req, res) => {
    if (req.method === 'GET') {
      return res.status(200).json({ status: "ok", message: "API aktif" });
    }

    try {
      const data = req.body;
      console.log("[CALLBACK] Received:", JSON.stringify(data));

      if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ status: "error", message: "Data callback kosong" });
      }

      const { merchant_ref, status, ref_id } = data;
      const ref = merchant_ref || ref_id;

      if (!ref) {
        return res.status(400).json({ status: "error", message: "Reference ID tidak ditemukan" });
      }

      const transactions = readJSON('transactions', []);
      const index = transactions.findIndex((t: any) => t.id === ref);
      
      const isPaid = ['PAID', 'Success', 'success'].includes(status);
      const newStatus = isPaid ? 'success' : (['FAILED', 'failed'].includes(status) ? 'failed' : 'pending');
      
      if (index !== -1) {
        if (transactions[index].status === 'success') {
          return res.status(200).json({ status: "success", message: "Callback diterima (Sudah diproses)" });
        }

        transactions[index].status = newStatus;
        transactions[index].updatedAt = new Date().toISOString();
        transactions[index].raw_callback = data;
        writeJSON('transactions', transactions);

        if (isPaid) {
          const transData = transactions[index];
          const settings = readJSON('settings', {});
          if (settings?.digiflazzUsername && settings?.digiflazzApiKey) {
            const sign = crypto.createHash('md5').update(settings.digiflazzUsername + settings.digiflazzApiKey + ref).digest('hex');
            try {
              const digiRes = await axios.post('https://api.digiflazz.com/v1/transaction', {
                username: settings.digiflazzUsername,
                buyer_sku_code: transData.sku,
                customer_no: transData.zoneId ? `${transData.userId}${transData.zoneId}` : transData.userId,
                ref_id: ref,
                sign
              });
              console.log('[DIGIFLAZZ] Order Response:', digiRes.data);
            } catch (digiErr: any) {
              console.error('[DIGIFLAZZ] Order Error:', digiErr.response?.data || digiErr.message);
            }
            await sendWhatsApp(transData.phoneNumber, `Halo! Pembayaran INV ${ref} BERHASIL.\nPesanan ${transData.productName} sedang diproses.\nTerima kasih!`);
          }
        }
      } else {
        // Log unknown transaction but store it for audit
        const newEntry = {
          id: ref,
          status: newStatus,
          nominal: data.nominal || 0,
          metode: data.metode || 'Unknown',
          raw: data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        transactions.push(newEntry);
        writeJSON('transactions', transactions);
      }

      res.status(200).json({ status: "success", message: "Callback diterima" });
    } catch (error: any) {
      console.error('[CALLBACK] Fatal Error:', error.message);
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // API: Get All Products
  app.get('/api/products', (req, res) => {
    console.log(`[GET] /api/products - Brand: ${req.query.brand || 'All'}`);
    try {
      const { brand } = req.query;
      const data = readJSON('products', []);
      
      let products = Array.isArray(data) ? data : (data?.data || []);

      // Filter only active products
      products = products.filter((p: any) => p?.buyer_product_status === true);

      if (brand) {
        products = products.filter((p: any) => p.brand === brand);
      }
      
      const settings = readJSON('settings', { margin: { low: 1000, mid: 2000, high: 3000 } });
      const margins = settings.margin || { low: 1000, mid: 2000, high: 3000 };

      const mapped = products.map((p: any) => {
        const basePrice = Number(p.price || 0);
        let margin = margins.high;
        if (basePrice < 10000) margin = margins.low;
        else if (basePrice <= 50000) margin = margins.mid;
        
        // Normalize Category
        let category = p.category || '';
        if (category === 'Games') category = 'Game';
        if (category === 'E-Money') category = 'E-Wallet';

        return {
          id: p.buyer_sku_code,
          name: p.product_name,
          price: basePrice + margin,
          original_price: basePrice,
          category: category,
          brand: p.brand,
          status: (p.buyer_product_status && p.seller_product_status) ? 'active' : 'inactive'
        };
      });
      console.log(`[GET] /api/products - Found ${mapped.length} products`);
      res.status(200).json({
        success: true,
        data: mapped
      });
    } catch (error: any) {
      console.error('[PRODUCTS] Error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API: Get Single Transaction
  app.get('/api/transaction/:id', (req, res) => {
    console.log(`[GET] /api/transaction/${req.params.id}`);
    try {
      const transactions = readJSON('transactions', []);
      const transaction = transactions.find((t: any) => t.id === req.params.id);
      if (transaction) res.status(200).json(transaction);
      else res.status(404).json({ success: false, error: 'Not found' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API: Check Nickname
  app.post('/api/check-nickname', async (req, res) => {
    console.log('[POST] /api/check-nickname');
    try {
      const { sku, customer_no } = req.body;
      const settings = readJSON('settings', {});
      const { digiflazzUsername: username, digiflazzApiKey: apiKey } = settings;

      if (!username || !apiKey) return res.status(400).json({ success: false, error: 'API Digiflazz belum dikonfigurasi' });

      const sign = crypto.createHash('md5').update(username + apiKey + 'ceknama').digest('hex');
      const response = await axios.post('https://api.digiflazz.com/v1/transaction', {
        commands: 'pln-subscribe',
        username,
        buyer_sku_code: sku,
        customer_no,
        sign
      });
      res.status(200).json(response.data);
    } catch (error: any) {
      console.error('[NICKNAME] Error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
