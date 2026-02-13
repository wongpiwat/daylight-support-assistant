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

    const { force } = await req.json().catch(() => ({ force: false }));

    const { count } = await supabase.from("knowledge_base").select("*", { count: "exact", head: true });
    if (count && count > 0 && !force) {
      return new Response(JSON.stringify({ success: true, message: "Already seeded", guides: count }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clear existing knowledge base if forcing re-seed
    if (force && count && count > 0) {
      await supabase.from("knowledge_base").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    const guides = [
      {
        title: "Getting Started with the DC-1",
        category: "Device Setup",
        tags: ["getting-started", "basics", "setup", "buttons", "gestures"],
        source_url: "https://support.daylightcomputer.com/getting-started",
        content: `The Daylight DC-1 offers full functionality: web browsing, Spotify, spreadsheets, even YouTube. It's blue light free — turn the backlight off for a paper-like experience. Adjust the amber backlight using patented hardware for perfect screen warmth.

The Basics:
- Buttons: Power Button, Volume Button. Swipe left to go back.
- Drop down menu: Screen brightness, Amber brightness.
- Apps: See your apps and download new ones.
- Gestures: Swipe up to return home. Half swipe to see open apps.

Reader App: At 60fps, reading is very comfortable. Use infinite zoom for notes in tight spaces. Highlight with a long press, then tap outside to save. Swipe from right for scroll bar and saved highlights.

Stylus: The DC-1 has palm rejection. The anti-glare film gives a paper-like writing feel. No battery or Bluetooth required for the stylus pen.`
      },
      {
        title: "How to Factory Reset Your DC-1",
        category: "Device Setup",
        tags: ["reset", "factory-reset", "troubleshooting"],
        source_url: "https://support.daylightcomputer.com/getting-started/how-to-do-a-factory-reset",
        content: `How to factory reset your DC-1:
1. Go to Settings
2. Scroll down on the left side
3. Select System
4. Select Reset Options
5. Select Erase all data
6. Confirm Erase All Data

After the reset, the DC-1 runs through several automations automatically. DO NOT touch the DC-1 while it is setting up. When the device shuts itself off, power it back on and you're good to go.

If you've lost your password, visit the support page for instructions on resetting the DC-1 without a password.`
      },
      {
        title: "Accessories Guide - Compatible Devices",
        category: "Accessories",
        tags: ["case", "keyboard", "mouse", "stand", "accessories", "stylus"],
        source_url: "https://support.daylightcomputer.com/getting-started/accessories-guide-daylight-works-with-devices",
        content: `The DC-1 works with most wired and Bluetooth devices.

Cases: The Zenrich Universal Case provides good drop protection, doesn't cover buttons, and includes a stylus slot. Note: it has a tiny magnet that may create a small dead zone for the stylus.

Wireless keyboards: Logitech K780 (desktop, includes num-pad and stand), Cooper Nomad (travel-friendly, folds up with retractable stand and mousepad), Apple Magic Keyboard with Fintie Stand.

Wired keyboards: Belkin B2B130 (lightweight, built-in stand).

Mice: Rapique Ultra-Light Wireless Mouse, Perixx PERIMICE-209C wired mouse.

Stands: Yamazaki Rin Tablet Stand, LISEN Adjustable Portable Monitor Stand.

Adaptors: UGREEN USB-C multi-hub (USB, USB-C, ethernet), AmazonBasics Ethernet Adapter, USB-C to USB hub for multiple devices.

Stylus: Ships with King Write MR05 EMR Stylus Pen. Replacement available from kingwrite.com.`
      },
      {
        title: "Connect to Ethernet",
        category: "Connectivity",
        tags: ["ethernet", "network", "internet", "wired", "usb-c"],
        source_url: "https://support.daylightcomputer.com/getting-started/connect-to-ethernet",
        content: `To connect your DC-1 to ethernet, you need a USB-C to Ethernet adaptor. Recommended: AmazonBasics Aluminum Gigabit Ethernet Adapter.

Steps:
1. Connect your ethernet cord to your adaptor
2. Connect your adaptor to the DC-1
3. Swipe down from the top to see your menu
4. Long press the Wi-Fi option — you should see the ethernet connection registered there
5. This may take 5-30 seconds depending on the adaptor

Important notes:
- Ethernet adapters use different chipsets (Realtek, ASIX, Broadcom). Some devices may only have drivers for specific chipsets.
- Certain adapters require more power than the USB port provides. Low-power adapters are more likely to work with the DC-1.`
      },
      {
        title: "How to Update Your DC-1",
        category: "Software",
        tags: ["update", "software", "sol-os", "firmware"],
        source_url: "https://support.daylightcomputer.com/getting-started/how-to-update-your-dc-1",
        content: `The DC-1 updates automatically every two weeks. To update manually:

1. Make sure the DC-1 has more than 50% battery
2. Make sure Wi-Fi is connected
3. On the home screen, scroll along the right side to the 'S'
4. Select Software Update
5. Press Update Now
6. Allow up to 20 minutes for the update (first update takes longer)
7. Your device will automatically restart at the end of the update`
      },
      {
        title: "Sending PDFs and EPUBs to Reader",
        category: "Software",
        tags: ["pdf", "epub", "reader", "capture-app", "documents"],
        source_url: "https://support.daylightcomputer.com/getting-started/add-pdfs-to-the-reader-app",
        content: `Four methods to add PDFs/EPUBs to the Reader app. First, download the Daylight Capture app on any device.

Setup: Open the Capture app, select "Sign in to your Daylight Account", scan the QR code with your camera, and confirm the verification code.

Method 1 - Web Browser to Reader: The Capture app attaches to your browser. Press share and select the Daylight Capture App.

Method 2 - Copy URL: Copy a document link, open the Capture app, select "Open Library", paste the link in the search bar.

Method 3 - Download PDF from web: Search for a PDF (e.g. "Ansel Adams PDF"), press the link, it downloads automatically and opens in Reader.

Method 4 - EPUB to Reader: Download an EPUB (e.g. from gutenberg.org), open the Capture app, tap "Drop or select PDF and EPUB files", select your EPUB.

Files should appear in about 1 minute. You'll see "Incoming Documents from 🌐" as an upload indicator.`
      },
      {
        title: "Use the DC-1 as a Monitor (Windows)",
        category: "Connectivity",
        tags: ["monitor", "display", "windows", "superdisplay", "spacedesk"],
        source_url: "https://support.daylightcomputer.com/getting-started/use-the-dc-1-as-a-monitor",
        content: `Use the DC-1 as a second monitor for your Windows PC with SuperDisplay ($14.99, recommended) or SpaceDesk (free).

SuperDisplay Setup:
1. Open Google Play Store on tablet, search "SuperDisplay"
2. Download the Windows driver from superdisplay.app
3. Launch SuperDisplay Settings on Windows PC
4. Launch the app on your tablet
5. Wireless: Select "Connect via WiFi" and input the IP address (both devices on same WiFi)
5. Wired: Plug the tablet into the PC
6. In Windows Display Settings, set to 'extend' or 'duplicate'
7. Set resolution to 1584 x 1184 for fullscreen, adjust scale to your liking

SpaceDesk Setup:
1. Download SpaceDesk from Play Store
2. Download Windows driver from spacedesk.net
3. Launch Spacedesk Driver Console on PC
4. Click 'USB Cable Driver Android', enable it
5. Open SpaceDesk on tablet, set Auto-Rotation, Image Quality to max, FPS to 60
6. For wired: Plug tablet to PC, enable USB File Transfer
7. Connect via wireless or wired in the app

Currently only available for Windows PC users.`
      },
      {
        title: "How to Replace Stylus Nibs",
        category: "Accessories",
        tags: ["stylus", "nibs", "replacement", "pen"],
        source_url: "https://support.daylightcomputer.com/getting-started/whats-this-white-thing-in-the-box-how-to-replace-stylus-nibs",
        content: `If you're having issues with your stylus, try replacing the nib.

Steps:
1. Turn the nibs case to open and get the nibs out
2. Use the nibs case like tweezers to pull out the tip of your stylus pen
3. Insert a new nib with your fingers

Need more nibs? Purchase replacement stylus or nibs from Amazon:
- Full stylus: King Write MR05
- Replacement nibs: King Write Tip Set`
      },
      {
        title: "Split Screen Guide",
        category: "Software",
        tags: ["split-screen", "multitasking", "apps"],
        source_url: "https://support.daylightcomputer.com/getting-started/split-screen-guide",
        content: `Use split screen to view two apps simultaneously on the DC-1. Works with connected accessories like keyboard and mouse.

Steps:
1. Make sure you have two desired apps open
2. At the bottom of the display, slowly half swipe up
3. Tap "Split", then select your desired apps
4. Depending on apps, you may prefer rotating the DC-1 to landscape mode`
      },
      {
        title: "Daylight Kids Guide",
        category: "Kids",
        tags: ["kids", "parental-controls", "children", "safety"],
        source_url: "https://support.daylightcomputer.com/daylight-kids-guide",
        content: `The Daylight Computer for kids is designed for safe, engaging, and educational experiences.

Internet Setup: Swipe down from top, select "Internet", choose network, tap next.

Parental Controls (long-press to open):
- Create a 4-digit PIN password
- App List: Access apps on the right side, with age categories 3-5, 6-8, 9-12
- Reorder apps: Drag and swipe to place, minus (-) to remove, star (☆) to add to home screen
- Safety Settings: Toggle switches for Block mature content, Block ads and trackers, Block social media
- Select lock (🔒) icon when ready

Using the DC-1 (Kids):
- Drop down menu: Screen brightness (top), Amber brightness (bottom), Internet access, Auto-rotate
- Gestures: Swipe up to return home, half swipe for open apps, swipe left to go back
- Buttons: Power, Volume

If you forget your parental passcode, visit the support page for reset instructions. This is different from the device password — forgetting that requires a factory reset.`
      },
      {
        title: "Return Policy and Warranty",
        category: "Order",
        tags: ["return", "refund", "warranty", "policy"],
        source_url: "https://support.daylightcomputer.com",
        content: `The Daylight DC-1 comes with a 30-day return policy. To make a return:
1. Email hello@daylightcomputer.com
2. The team will email you a shipping label
3. Print the label and put it on a box
4. Once received and verified as undamaged, a full refund will be issued

Returns cannot be issued for damaged items or items no longer in sellable condition.

Contact Support:
- Email: hello@daylightcomputer.com
- Text: +1 (415) 599-1668
- Press inquiries: press@daylightcomputer.com`
      },
      {
        title: "Daylight DC-1 Contact and Support",
        category: "Company",
        tags: ["contact", "support", "help", "email", "phone"],
        source_url: "https://support.daylightcomputer.com",
        content: `Daylight Support is happy to help. Check the FAQs first, and if your question isn't answered, contact the support team.

Contact:
- Email: hello@daylightcomputer.com
- Text: +1 (415) 599-1668
- Press inquiries: press@daylightcomputer.com
- Onboarding Call: Schedule at calendly.com/d/cx72-zjm-kzf/chat-with-a-daylight-team-member

Resources:
- Getting Started Guide
- Download Daylight Capture App
- Daylight Kids Guide
- Press Kit

The DC-1 is in stock and ships in 3-5 business days.`
      },
    ];

    await supabase.from("knowledge_base").insert(guides);

    // Generate tickets
    const cats = ["Device Setup","Connectivity","Software","Apps","Display","Battery","Accessories","Kids"];
    const pris = ["low","medium","high","urgent"];
    const stats = ["open","resolved_by_ai","escalated","closed"];
    const srcs = ["ai","human","self_service"];
    const subjs = [
      "Can't connect to Wi-Fi","How to factory reset","Screen ghosting","Battery draining fast",
      "Install Kindle app","Ethernet adapter issue","Best case for DC-1","Software update stuck",
      "Use DC-1 as monitor","Split screen not working","Touch unresponsive","Device won't turn on",
      "Sideload APK help","Stylus not working","Send PDF to Reader","Parental controls setup",
      "Apps crashing","Stylus nib replacement","Keyboard not pairing","Amber backlight question",
    ];

    // 5 real tickets
    const real = [
      { subject:"Screen ghosting after reading PDFs", description:"Ghost images persist after switching apps.", category:"Display", status:"resolved_by_ai", priority:"medium", resolution_source:"ai", ai_confidence:0.92, user_satisfied:true, is_synthetic:false },
      { subject:"Ethernet adapter not recognized", description:"AmazonBasics adapter not detected via USB-C.", category:"Connectivity", status:"resolved_by_ai", priority:"high", resolution_source:"ai", ai_confidence:0.88, user_satisfied:true, is_synthetic:false },
      { subject:"Battery drains too fast", description:"100% to 60% in 2 hours of light reading.", category:"Battery", status:"escalated", priority:"high", resolution_source:"human", ai_confidence:0.45, user_satisfied:false, is_synthetic:false },
      { subject:"Factory reset stuck at logo", description:"Device stuck at Daylight logo after factory reset.", category:"Device Setup", status:"escalated", priority:"urgent", resolution_source:"human", ai_confidence:0.25, user_satisfied:null, is_synthetic:false },
      { subject:"Software update broke Bluetooth", description:"Bluetooth keyboard stopped working after latest update.", category:"Software", status:"escalated", priority:"high", resolution_source:"human", ai_confidence:0.30, user_satisfied:false, is_synthetic:false },
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

    return new Response(JSON.stringify({ success:true, guides_seeded: guides.length, real_tickets:5, synthetic_tickets:50 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Seed error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
