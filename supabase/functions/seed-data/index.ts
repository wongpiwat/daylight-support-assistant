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

    // 10 guides
    const guides = [
      { title: "How to Factory Reset Your DC-1", category: "Device Setup", tags: ["reset","factory","dc-1"], content: "To factory reset your DC-1:\n1. Power off by holding power button 5 seconds\n2. Hold Volume Up + Power for 10 seconds\n3. Release at Daylight logo\n4. Select 'Factory Reset' from recovery menu\n5. Confirm with power button\n6. Wait 3-5 minutes for completion\n\nNote: This erases all data. Back up first. Contact support@daylightcomputer.com if reset fails." },
      { title: "Setting Up Ethernet on DC-1", category: "Connectivity", tags: ["ethernet","network","usb-c"], content: "DC-1 supports Ethernet via USB-C adapters.\n\nRecommended: Anker A8313, Cable Matters 201076, Apple USB-C Ethernet.\n\nSetup:\n1. Plug USB-C adapter into DC-1\n2. Connect Ethernet cable\n3. Sol:OS auto-detects connection\n4. Verify in Settings > Network\n\nTroubleshooting: Ensure USB 3.0 adapter, try different port, restart device, check DHCP." },
      { title: "Sol:OS Navigation and Settings Guide", category: "Sol:OS", tags: ["solos","settings","navigation"], content: "Key Navigation:\n- Swipe up: App drawer\n- Swipe down: Quick settings\n- Two-finger swipe left: Task switcher\n- Three-finger tap: Screenshot\n\nSettings: Display (brightness, contrast, refresh), Focus Mode, Reading Mode, Battery Saver, Accessibility.\n\nTips: Use ambient light sensor, enable Night Shift, customize gestures in Settings > Gestures." },
      { title: "App Installation and Compatibility", category: "Apps", tags: ["apps","install","sideload"], content: "Sol:OS App Store: Browse, search, tap Install.\n\nSideloading: Settings > Security > Unknown Sources, download APK, open from file manager.\n\nCompatible: Kindle, Kobo, Notion, Obsidian, Spotify, Firefox, Brave, MS Office, Slack.\n\nIncompatible: GPU-heavy games, apps requiring Google Play Services (workaround available)." },
      { title: "LivePaper Display Care and Troubleshooting", category: "Display", tags: ["display","livepaper","ghosting"], content: "Cleaning: Soft microfiber cloth, distilled water only. No alcohol cleaners.\n\nGhosting: Settings > Display > Refresh > Full Refresh. Do 5 consecutive if persistent. Leave on white screen 10 min.\n\nFlickering: Set refresh to Standard, restart, update Sol:OS.\n\nOutdoor: Display excels in sunlight. Use Settings > Display > Outdoor Mode." },
      { title: "Battery Optimization Guide", category: "Battery", tags: ["battery","charging","power"], content: "Battery life: Standard 8-10h, Reading 12-15h, Heavy 5-7h.\n\nTips: Enable Battery Saver, reduce refresh rate to Eco, turn off BT/Wi-Fi when unused, close background apps.\n\nCharging: 30W USB-C, full in 2h, 0-50% in 30min. Keep 20-80% for longevity.\n\nFast drain? Check Settings > Battery > Usage, disable location services, restart." },
      { title: "Recommended Outdoor Accessories", category: "Accessories", tags: ["outdoor","case","stand"], content: "Protection: Rugged Case ($49) IP54, Matte Screen Protector (included), Sleeve ($35).\n\nStands: Portable Stand ($29), RAM Mount ($45), Tripod Adapter ($15).\n\nInput: Stylus Pro ($39), any BT keyboard, Keyboard Folio ($79).\n\nPower: Anker 20000mAh ($45), Solar Charger ($60)." },
      { title: "Connecting External Displays", category: "Connectivity", tags: ["monitor","hdmi","external"], content: "Supports USB-C to HDMI (4K@60Hz), DisplayPort, USB-C.\n\nSetup: Connect adapter, Sol:OS auto-detects, configure in Settings > Display > External.\n\nModes: Mirror, Extend, External Only.\n\nRecommended: Cable Matters 201055, Uni USB-C HDMI 4K.\n\nTroubleshooting: Use video-capable cable, try different port, restart with display connected." },
      { title: "Keyboard Shortcuts and Productivity", category: "Sol:OS", tags: ["keyboard","shortcuts","productivity"], content: "Shortcuts: Ctrl+Space (launcher), Ctrl+Tab (switch apps), Ctrl+Shift+N (new note), Ctrl+F (find), Ctrl+Shift+S (screenshot), Ctrl+Shift+F (Focus Mode).\n\nFocus Mode: Block notifications, whitelist apps, recurring sessions, track time.\n\nReading Mode: Paper-like display, reduced blue light, no animations." },
      { title: "Troubleshooting Common Issues", category: "Troubleshooting", tags: ["troubleshoot","fix","help"], content: "Won't turn on: Hold power 15s, charge 30min, try different cable.\n\nWi-Fi: Toggle off/on, forget & reconnect, restart router, reset network settings.\n\nSlow: Close apps, clear cache, check storage, restart.\n\nApp crashes: Force close, clear cache/data, reinstall, update Sol:OS.\n\nTouch unresponsive: Clean screen, remove protector, restart, calibrate in Settings > Display.\n\nSupport: support@daylightcomputer.com Mon-Fri 9am-6pm PT." },
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

    // 10 real tickets
    const real = [
      { subject:"DC-1 ghosting after PDFs", description:"Ghost images persist after reading PDF.", category:"Display", status:"resolved_by_ai", priority:"medium", resolution_source:"ai", ai_confidence:0.92, user_satisfied:true, is_synthetic:false },
      { subject:"Anker ethernet not recognized", description:"Recommended adapter not detected.", category:"Connectivity", status:"resolved_by_ai", priority:"high", resolution_source:"ai", ai_confidence:0.88, user_satisfied:true, is_synthetic:false },
      { subject:"Battery 100 to 60 in 2hrs", description:"Drains much faster than advertised.", category:"Battery", status:"escalated", priority:"high", resolution_source:"human", ai_confidence:0.45, user_satisfied:false, is_synthetic:false },
      { subject:"Google Play Services needed", description:"Many apps require Play Services.", category:"Apps", status:"resolved_by_ai", priority:"medium", resolution_source:"ai", ai_confidence:0.85, user_satisfied:true, is_synthetic:false },
      { subject:"Focus timer resets itself", description:"2hr session stops after 30min.", category:"Sol:OS", status:"escalated", priority:"medium", resolution_source:"human", ai_confidence:0.35, user_satisfied:null, is_synthetic:false },
      { subject:"Outdoor readability help", description:"Hard to read in direct sunlight.", category:"Display", status:"resolved_by_ai", priority:"low", resolution_source:"ai", ai_confidence:0.95, user_satisfied:true, is_synthetic:false },
      { subject:"Factory reset stuck on logo", description:"Stuck at Daylight logo 20min.", category:"Troubleshooting", status:"escalated", priority:"urgent", resolution_source:"human", ai_confidence:0.25, user_satisfied:null, is_synthetic:false },
      { subject:"Power bank recommendation", description:"Need portable charging for travel.", category:"Accessories", status:"resolved_by_ai", priority:"low", resolution_source:"ai", ai_confidence:0.97, user_satisfied:true, is_synthetic:false },
      { subject:"Update broke Bluetooth", description:"BT keyboard and stylus stopped after update.", category:"Sol:OS", status:"escalated", priority:"high", resolution_source:"human", ai_confidence:0.30, user_satisfied:false, is_synthetic:false },
      { subject:"Extend display to monitor", description:"How to use extended mode with HDMI?", category:"Connectivity", status:"resolved_by_ai", priority:"medium", resolution_source:"ai", ai_confidence:0.91, user_satisfied:true, is_synthetic:false },
    ];
    await supabase.from("support_tickets").insert(real);

    // 500 synthetic
    const pick = (a: string[]) => a[Math.floor(Math.random()*a.length)];
    for (let b = 0; b < 5; b++) {
      const batch = [];
      for (let i = 0; i < 100; i++) {
        const st = pick(stats);
        const resolved = st === "resolved_by_ai" || st === "closed";
        const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random()*90));
        batch.push({
          subject: pick(subjs), description: "Customer needs help with this issue.",
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
    }

    return new Response(JSON.stringify({ success:true, guides_seeded:10, real_tickets:10, synthetic_tickets:500 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Seed error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
