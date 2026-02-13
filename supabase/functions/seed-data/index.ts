import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if already seeded
    const { count } = await supabase.from("knowledge_base").select("*", { count: "exact", head: true });
    if (count && count > 0) {
      return new Response(JSON.stringify({ success: true, message: "Already seeded", guides: count }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4 guides (slim)
    const guides = [
      { title: "How to Factory Reset Your DC-1", category: "Device Setup", tags: ["reset","factory","dc-1"], content: "To factory reset: Power off, hold Volume Up + Power 10 seconds, select 'Factory Reset'. Erases all data. Contact support@daylightcomputer.com if stuck." },
      { title: "Setting Up Ethernet on DC-1", category: "Connectivity", tags: ["ethernet","network","usb-c"], content: "Use USB-C to Ethernet adapter (Anker A8313 recommended). Plug in, Sol:OS auto-detects. Verify in Settings > Network." },
      { title: "Battery Optimization Guide", category: "Battery", tags: ["battery","charging","power"], content: "Enable Battery Saver, reduce refresh to Eco, turn off BT/Wi-Fi when unused. Battery life: 8-10h standard, 12-15h reading mode." },
      { title: "Troubleshooting Common Issues", category: "Troubleshooting", tags: ["troubleshoot","fix","help"], content: "Won't turn on: Hold power 15s, charge 30min. Wi-Fi issues: Toggle off/on, restart router. Touch unresponsive: Clean screen, restart. Contact support@daylightcomputer.com Mon-Fri 9am-6pm PT." },
    ];

    await supabase.from("knowledge_base").insert(guides);

    // Generate tickets
    const cats = ["Device Setup","Connectivity","Sol:OS","Apps","Display","Battery","Accessories","Troubleshooting"];
    const pris = ["low","medium","high","urgent"];
    const stats = ["open","resolved_by_ai","escalated","closed"];
    const srcs = ["ai","human","self_service"];
    const subjs = [
      "Can't connect to Wi-Fi","How to reset device","Screen ghosting","Battery draining fast",
      "Install Kindle app","Ethernet adapter issue","Best outdoor case","Sol:OS update stuck",
      "Monitor not detected","Focus mode broken","Touch unresponsive","Device won't turn on",
      "Sideload apps help","Stylus not pairing","Reading mode setup","Charging too slow",
      "Apps crashing","Screen protector help","Keyboard shortcuts","Display flickering",
    ];

     // 5 real tickets (slim)
     const real = [
       { subject:"DC-1 ghosting after PDFs", description:"Ghost images persist.", category:"Display", status:"resolved_by_ai", priority:"medium", resolution_source:"ai", ai_confidence:0.92, user_satisfied:true, is_synthetic:false },
       { subject:"Anker ethernet not recognized", description:"Adapter not detected.", category:"Connectivity", status:"resolved_by_ai", priority:"high", resolution_source:"ai", ai_confidence:0.88, user_satisfied:true, is_synthetic:false },
       { subject:"Battery drains fast", description:"100 to 60 in 2 hours.", category:"Battery", status:"escalated", priority:"high", resolution_source:"human", ai_confidence:0.45, user_satisfied:false, is_synthetic:false },
       { subject:"Factory reset stuck", description:"Stuck at logo.", category:"Troubleshooting", status:"escalated", priority:"urgent", resolution_source:"human", ai_confidence:0.25, user_satisfied:null, is_synthetic:false },
       { subject:"Update broke Bluetooth", description:"BT keyboard stopped working.", category:"Sol:OS", status:"escalated", priority:"high", resolution_source:"human", ai_confidence:0.30, user_satisfied:false, is_synthetic:false },
     ];
    await supabase.from("support_tickets").insert(real);

    // 50 synthetic tickets
     const pick = (a: string[]) => a[Math.floor(Math.random()*a.length)];
     const batch = [];
     for (let i = 0; i < 50; i++) {
       const st = pick(stats);
       const resolved = st === "resolved_by_ai" || st === "closed";
       const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random()*90));
       batch.push({
         subject: pick(subjs), description: "Customer support inquiry.",
         category: pick(cats), status: st, priority: pick(pris),
         resolution_source: resolved ? pick(srcs) : null,
         ai_confidence: st === "resolved_by_ai" ? +(0.7+Math.random()*0.3).toFixed(2) : null,
         user_satisfied: resolved ? Math.random() > 0.15 : null,
         created_at: d.toISOString(),
         resolved_at: resolved ? new Date(d.getTime()+Math.random()*259200000).toISOString() : null,
         is_synthetic: true,
       });
     }
     await supabase.from("support_tickets").insert(batch);

     return new Response(JSON.stringify({ success:true, guides_seeded:4, real_tickets:5, synthetic_tickets:50 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Seed error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
