import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { crypto } from "https://deno.land/std/crypto/mod.ts";

// Helper for MD5 (Deno style)
async function md5(text: string) {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("MD5", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  try {
    if (req.method === "GET") {
      return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
    }

    // ===== AMBIL RAW =====
    const raw = await req.text();
    console.log("RAW VIP:", raw);

    let data: any = {};

    // ===== PARSE SUPER AMAN =====
    if (!raw || raw.trim() === "") {
      data = { kosong: true };
    } else {
      try {
        data = JSON.parse(raw);
      } catch {
        try {
          // Fallback to form-urlencoded
          const params = new URLSearchParams(raw);
          data = Object.fromEntries(params.entries());
          // Check if it actually parsed something
          if (Object.keys(data).length === 0) data = { raw };
        } catch {
          data = { raw };
        }
      }
    }

    console.log("PARSED VIP:", data);

    // ===== INIT SUPABASE =====
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ===== AMBIL DATA FLEXIBLE =====
    const ref_id =
      data.ref_id ||
      data.reference_id ||
      data.trxid ||
      data.id ||
      "UNKNOWN_" + Date.now();

    const status_vip = (
      data.status ||
      data.status_transaksi ||
      data.status_code ||
      "unknown"
    ).toUpperCase();

    const nominal = data.amount || data.nominal || 0;

    const metode =
      data.payment_method ||
      data.metode ||
      data.channel ||
      "unknown";

    // ===== SIMPAN DATABASE (UPSERT) =====
    await supabase.from("transaksi").upsert(
      {
        ref_id,
        status_vip,
        nominal,
        metode,
        data_mentah: data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "ref_id" }
    );

    // ===== AUTOMATION LOGIC (DIGIFLAZZ + FONNTE) =====
    // Only process if status is PAID or SUCCESS
    if (status_vip === "PAID" || status_vip === "SUCCESS") {
      // 1. Check double order and get transaction details
      const { data: existing } = await supabase
        .from('transaksi')
        .select('*')
        .eq('ref_id', ref_id)
        .single();

      if (existing && existing.status_digiflazz !== 'success') {
        const digiUser = Deno.env.get("DIGIFLAZZ_USERNAME");
        const digiKey = Deno.env.get("DIGIFLAZZ_API_KEY");
        const sku = existing.product_sku;
        const customer_no = existing.customer_no;

        if (digiUser && digiKey && sku && customer_no) {
          const sign = await md5(digiUser + digiKey + ref_id);
          
          console.log("SENDING TO DIGIFLAZZ:", { sku, customer_no, ref_id });
          
          const digiRes = await fetch("https://api.digiflazz.com/v1/transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: digiUser,
              buyer_sku_code: sku,
              customer_no: customer_no,
              ref_id: ref_id,
              sign: sign
            })
          });
          
          const digiData = await digiRes.json();
          console.log("DIGIFLAZZ RESPONSE:", digiData);

          const digiStatus = digiData.data?.status || "failed";
          const sn = digiData.data?.sn || "";
          const message = digiData.data?.message || "";

          // Update Database with Digiflazz Result
          await supabase
            .from('transaksi')
            .update({
              status_digiflazz: digiStatus,
              sn: sn,
              digi_message: message,
              updated_at: new Date().toISOString()
            })
            .eq('ref_id', ref_id);

          // WhatsApp Notification (Fonnte)
          const fonnteToken = Deno.env.get("FONNTE_TOKEN");
          const userPhone = existing.phone_number;

          if (fonnteToken && userPhone && digiStatus === "success") {
            const msg = `✅ Topup Berhasil\nRef: ${ref_id}\nProduk: ${existing.product_name || sku}\nTujuan: ${customer_no}\n\nSN:\n${sn}\n\nTerima kasih 🙏`;
            
            const formData = new URLSearchParams();
            formData.append('target', userPhone);
            formData.append('message', msg);

            await fetch("https://api.fonnte.com/send", {
              method: "POST",
              headers: { "Authorization": fonnteToken },
              body: formData
            });
          }
        }
      } else if (existing?.status_digiflazz === 'success') {
        console.log("ALREADY SUCCESS IN DIGIFLAZZ, STOPPING.");
      }
    }

    // ===== WAJIB RETURN 200 =====
    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
    });

  } catch (err: any) {
    console.log("GLOBAL ERROR:", err.message);

    // ❗ tetap return 200 agar VIP tidak spam callback
    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
    });
  }
});
