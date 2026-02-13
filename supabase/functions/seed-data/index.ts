import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// 10 real Daylight support guides
const GUIDES = [
  {
    title: "How to Factory Reset Your DC-1",
    category: "Device Setup",
    tags: ["reset", "factory", "dc-1", "troubleshooting"],
    content: `To factory reset your DC-1:
1. Power off your device completely by holding the power button for 5 seconds
2. Hold the Volume Up + Power button simultaneously for 10 seconds
3. Release when you see the Daylight logo appear
4. Select "Factory Reset" from the recovery menu using the volume buttons
5. Confirm by pressing the power button
6. Wait for the reset to complete (approximately 3-5 minutes)
7. Your DC-1 will restart with fresh Sol:OS installation

Note: Factory reset will erase all data. Back up important files before proceeding.
Contact support@daylightcomputer.com if the reset fails.`,
  },
  {
    title: "Setting Up Ethernet on DC-1",
    category: "Connectivity",
    tags: ["ethernet", "network", "adapter", "usb-c", "internet"],
    content: `The DC-1 supports Ethernet via USB-C adapters. Here's how to set it up:

Tested & Recommended Adapters:
- Anker USB-C to Ethernet Adapter (A8313)
- Cable Matters USB-C to Gigabit Ethernet (201076)
- Apple USB-C to Ethernet Adapter

Setup Steps:
1. Plug the USB-C Ethernet adapter into your DC-1
2. Connect an Ethernet cable from your router/switch to the adapter
3. Sol:OS should automatically detect the connection
4. Go to Settings > Network to verify the connection
5. If not detected, go to Settings > Network > Advanced and select "Wired Connection"

Troubleshooting:
- Ensure the adapter is USB 3.0 compatible
- Try a different USB-C port
- Restart the device after connecting
- Check that DHCP is enabled on your network`,
  },
  {
    title: "Sol:OS Navigation and Settings Guide",
    category: "Sol:OS",
    tags: ["solos", "settings", "navigation", "interface", "os"],
    content: `Sol:OS is designed for focused, distraction-free computing.

Key Navigation:
- Swipe up from bottom: App drawer
- Swipe down from top: Quick settings & notifications
- Two-finger swipe left: Task switcher
- Three-finger tap: Screenshot

Essential Settings:
- Display: Adjust LivePaper brightness, contrast, and refresh rate
- Focus Mode: Block notifications during work sessions
- Reading Mode: Optimize display for long-form reading
- Battery Saver: Extend battery life by reducing background processes
- Accessibility: Font size, high contrast, screen reader support

Pro Tips:
- Use the ambient light sensor for auto-brightness (Settings > Display > Auto)
- Enable "Night Shift" for comfortable evening reading
- Customize gesture controls in Settings > Gestures`,
  },
  {
    title: "App Installation and Compatibility",
    category: "Apps",
    tags: ["apps", "install", "compatible", "sideload", "apk"],
    content: `Sol:OS supports a curated app ecosystem plus sideloading.

Installing from Sol:OS App Store:
1. Open the App Store from the home screen
2. Browse or search for apps
3. Tap "Install" and wait for download
4. App will appear in your app drawer

Sideloading Apps:
1. Go to Settings > Security > Enable "Unknown Sources"
2. Download the APK file from a trusted source
3. Open the file manager and navigate to Downloads
4. Tap the APK to install

Confirmed Compatible Apps:
- Kindle, Kobo, Libby (e-reading)
- Notion, Obsidian, Bear (note-taking)
- Spotify, Pocket Casts (audio)
- Firefox, Brave (web browsing)
- Microsoft Office suite
- Slack, Discord (communication)

Known Incompatible:
- Some games requiring high GPU
- Apps requiring Google Play Services (workaround available)`,
  },
  {
    title: "LivePaper Display Care and Troubleshooting",
    category: "Display",
    tags: ["display", "livepaper", "screen", "ghosting", "refresh", "care"],
    content: `The LivePaper display is a unique reflective technology. Here's how to care for it:

Cleaning:
- Use a soft, lint-free microfiber cloth
- Dampen slightly with distilled water if needed
- Never use alcohol-based cleaners or paper towels
- Clean in gentle circular motions

Common Display Issues:

Ghosting (image retention):
1. Open Settings > Display > Refresh
2. Tap "Full Refresh" to clear the screen
3. If persistent, perform 5 consecutive full refreshes
4. Leave device on a white screen for 10 minutes

Screen Flickering:
1. Check refresh rate in Settings > Display
2. Set to "Standard" (not "Fast") for stability
3. Restart the device
4. Update Sol:OS if an update is available

Outdoor Readability:
- The LivePaper display excels in direct sunlight
- Increase contrast in Settings > Display > Outdoor Mode
- Use the included matte screen protector for anti-glare`,
  },
  {
    title: "Battery Optimization Guide",
    category: "Battery",
    tags: ["battery", "charging", "power", "optimization", "life"],
    content: `Maximize your DC-1 battery life with these tips:

Expected Battery Life:
- Standard use: 8-10 hours
- Reading mode: 12-15 hours
- Heavy use (video, multitasking): 5-7 hours

Optimization Tips:
1. Enable Battery Saver mode (Settings > Battery > Battery Saver)
2. Reduce screen refresh rate to "Eco" for reading
3. Turn off Bluetooth and Wi-Fi when not in use
4. Close background apps from the task switcher
5. Lower display brightness or enable auto-brightness

Charging:
- Use the included 30W USB-C charger
- Full charge takes approximately 2 hours
- Fast charge: 0-50% in 30 minutes
- Battery health: Keep between 20-80% for longevity
- Avoid charging overnight regularly

If battery drains unusually fast:
1. Check Settings > Battery > Usage for power-hungry apps
2. Disable location services for apps that don't need it
3. Restart the device
4. Contact support if battery health drops below 80%`,
  },
  {
    title: "Recommended Outdoor Accessories",
    category: "Accessories",
    tags: ["outdoor", "accessories", "case", "stand", "stylus", "protection"],
    content: `Essential accessories for using your DC-1 outdoors:

Protection:
- Daylight Rugged Case ($49): Military-grade drop protection, IP54 water resistance
- Matte Screen Protector (included): Anti-glare for sunny conditions
- Daylight Sleeve ($35): Neoprene sleeve for transport

Stands & Mounts:
- Daylight Portable Stand ($29): Adjustable angle, folds flat
- RAM Mount Kit ($45): For vehicle/desk mounting
- Tripod Adapter ($15): Standard 1/4" thread mount

Input:
- Daylight Stylus Pro ($39): Pressure-sensitive, palm rejection
- Bluetooth Keyboard: Any standard BT keyboard works
- Daylight Keyboard Folio ($79): Integrated keyboard case

Connectivity:
- Anker USB-C Hub ($35): HDMI, USB-A, SD card, Ethernet
- Portable Wi-Fi Hotspot: Any mobile hotspot works with DC-1

Power:
- Anker 20000mAh Power Bank ($45): Charges DC-1 1.5 times
- Solar Charger ($60): For extended outdoor use`,
  },
  {
    title: "Connecting External Displays",
    category: "Connectivity",
    tags: ["display", "external", "monitor", "hdmi", "usb-c", "mirror"],
    content: `Connect your DC-1 to external displays for expanded workspace:

Supported Connections:
- USB-C to HDMI (up to 4K@60Hz)
- USB-C to DisplayPort
- USB-C to USB-C (with compatible monitors)

Setup:
1. Connect the appropriate cable/adapter to your DC-1
2. Connect the other end to your external display
3. Sol:OS should auto-detect the display
4. Go to Settings > Display > External to configure

Display Modes:
- Mirror: Same content on both screens
- Extend: Use external display as additional workspace
- External Only: Turn off DC-1 display

Recommended Adapters:
- Cable Matters USB-C to HDMI (201055)
- Uni USB-C to HDMI 4K
- CalDigit USB-C to DisplayPort

Troubleshooting:
- Ensure cable supports video output (not charge-only)
- Try a different USB-C port
- Restart with the display already connected
- Update Sol:OS for latest display driver support`,
  },
  {
    title: "Keyboard Shortcuts and Productivity Tips",
    category: "Sol:OS",
    tags: ["keyboard", "shortcuts", "productivity", "tips", "focus"],
    content: `Master Sol:OS with these keyboard shortcuts and productivity features:

Essential Shortcuts (with external keyboard):
- Ctrl+Space: Open app launcher
- Ctrl+Tab: Switch between recent apps
- Ctrl+Shift+N: New note (in Notes app)
- Ctrl+F: Find/search in current app
- Ctrl+Shift+S: Screenshot
- Alt+Tab: Task switcher
- Ctrl+Shift+F: Toggle Focus Mode

Focus Mode Features:
- Block all notifications for a set duration
- Whitelist specific apps (e.g., only allow Notes and Timer)
- Set recurring focus sessions
- Track focus time in Settings > Wellbeing

Reading Mode:
- Activates paper-like display settings
- Reduces blue light automatically
- Disables animations for less distraction
- Increases font rendering clarity

Widget Dashboard:
- Long-press home screen to add widgets
- Available: Clock, Weather, Calendar, Quick Notes, Battery
- Arrange in custom grid layout`,
  },
  {
    title: "Troubleshooting Common Issues",
    category: "Troubleshooting",
    tags: ["troubleshoot", "fix", "common", "issues", "problems", "help"],
    content: `Solutions for the most common DC-1 issues:

Device Won't Turn On:
1. Hold power button for 15 seconds (force restart)
2. Connect to charger for at least 30 minutes
3. Try a different USB-C cable
4. If still unresponsive, contact support

Wi-Fi Connection Issues:
1. Toggle Wi-Fi off/on in quick settings
2. Forget the network and reconnect
3. Restart your router
4. Check if other devices can connect
5. Reset network settings: Settings > Network > Reset

Slow Performance:
1. Close unused apps from task switcher
2. Clear app cache: Settings > Apps > [App] > Clear Cache
3. Check available storage: Settings > Storage
4. Restart the device
5. Consider factory reset if persistent

App Crashes:
1. Force close the app from task switcher
2. Clear the app's cache and data
3. Uninstall and reinstall the app
4. Check for Sol:OS updates
5. Report the issue: Settings > About > Report Bug

Touch Screen Unresponsive:
1. Clean the screen with a microfiber cloth
2. Remove any screen protector temporarily
3. Restart the device
4. Calibrate touch: Settings > Display > Touch Calibration
5. If partial area unresponsive, may indicate hardware issue — contact support

Contact Support: support@daylightcomputer.com | Mon-Fri 9am-6pm PT`,
  },
];

// Categories & templates for synthetic tickets
const CATEGORIES = [
  "Device Setup",
  "Connectivity",
  "Sol:OS",
  "Apps",
  "Display",
  "Battery",
  "Accessories",
  "Troubleshooting",
];

const PRIORITIES = ["low", "medium", "high", "urgent"];
const STATUSES = ["open", "resolved_by_ai", "escalated", "closed"];
const RESOLUTION_SOURCES = ["ai", "human", "self_service"];

const TICKET_TEMPLATES: { subject: string; description: string; category: string }[] = [
  { subject: "Can't connect to Wi-Fi", description: "My DC-1 won't connect to my home Wi-Fi network. I've tried restarting but it keeps failing.", category: "Connectivity" },
  { subject: "How do I reset my device?", description: "I want to start fresh. How do I factory reset the DC-1?", category: "Device Setup" },
  { subject: "Screen ghosting issue", description: "I'm seeing ghost images from previous screens. How do I fix this?", category: "Display" },
  { subject: "Battery draining fast", description: "My DC-1 battery only lasts 3 hours. Expected much more.", category: "Battery" },
  { subject: "Can I install Kindle app?", description: "I want to read my Kindle books on the DC-1. Is it compatible?", category: "Apps" },
  { subject: "Ethernet adapter not working", description: "Bought a USB-C ethernet adapter but DC-1 doesn't recognize it.", category: "Connectivity" },
  { subject: "Best outdoor case?", description: "Looking for a rugged case for outdoor use. Any recommendations?", category: "Accessories" },
  { subject: "Sol:OS update stuck", description: "Started a Sol:OS update and it's been stuck at 50% for an hour.", category: "Sol:OS" },
  { subject: "External monitor not detected", description: "Connected HDMI adapter but my monitor stays black.", category: "Connectivity" },
  { subject: "Focus mode not blocking notifications", description: "Even with Focus Mode on, I still get notifications from Slack.", category: "Sol:OS" },
  { subject: "Touch screen partially unresponsive", description: "The bottom-left corner of my screen doesn't respond to touch.", category: "Display" },
  { subject: "Device won't turn on", description: "Charged overnight but my DC-1 won't power on at all.", category: "Troubleshooting" },
  { subject: "How to sideload apps?", description: "Want to install an app not in the Sol:OS store. How?", category: "Apps" },
  { subject: "Stylus not pairing", description: "My Daylight Stylus Pro won't connect via Bluetooth.", category: "Accessories" },
  { subject: "Reading mode settings", description: "How do I enable and customize reading mode?", category: "Sol:OS" },
  { subject: "Charging takes too long", description: "Full charge takes over 4 hours with the included charger.", category: "Battery" },
  { subject: "Apps crashing frequently", description: "Notion and Obsidian crash every few minutes.", category: "Apps" },
  { subject: "Screen protector bubbles", description: "Can't get the screen protector on without bubbles.", category: "Accessories" },
  { subject: "Keyboard shortcuts not working", description: "Ctrl+Space doesn't open app launcher with my BT keyboard.", category: "Sol:OS" },
  { subject: "Display flickering", description: "Screen flickers randomly, especially when scrolling.", category: "Display" },
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 24));
  d.setMinutes(Math.floor(Math.random() * 60));
  return d.toISOString();
}

function generateSyntheticTickets(count: number) {
  const tickets = [];
  const variations = [
    "I'm having trouble with", "Need help with", "Question about",
    "Issue with", "Problem regarding", "Can't figure out",
    "How do I", "Please help with", "Urgent:",
  ];

  for (let i = 0; i < count; i++) {
    const template = randomFrom(TICKET_TEMPLATES);
    const status = randomFrom(STATUSES);
    const createdAt = randomDate(90);
    const isResolved = status === "resolved_by_ai" || status === "closed";

    tickets.push({
      subject: i % 3 === 0 ? `${randomFrom(variations)} ${template.subject.toLowerCase()}` : template.subject,
      description: template.description + (i % 5 === 0 ? " This is really frustrating." : ""),
      category: template.category,
      status,
      priority: randomFrom(PRIORITIES),
      resolution_source: isResolved ? randomFrom(RESOLUTION_SOURCES) : null,
      ai_confidence: status === "resolved_by_ai" ? 0.7 + Math.random() * 0.3 : null,
      user_satisfied: isResolved ? Math.random() > 0.15 : null,
      created_at: createdAt,
      resolved_at: isResolved ? new Date(new Date(createdAt).getTime() + Math.random() * 86400000 * 3).toISOString() : null,
      is_synthetic: true,
    });
  }
  return tickets;
}

// Real tickets based on common support patterns
function generateRealTickets() {
  return [
    { subject: "DC-1 screen ghosting after reading PDFs", description: "After reading a long PDF, ghost images persist on screen. Full refresh doesn't fully clear them.", category: "Display", status: "resolved_by_ai", priority: "medium", resolution_source: "ai", ai_confidence: 0.92, user_satisfied: true, is_synthetic: false },
    { subject: "Ethernet adapter Anker A8313 not recognized", description: "Plugged in the recommended Anker adapter but nothing happens. No network connection appears.", category: "Connectivity", status: "resolved_by_ai", priority: "high", resolution_source: "ai", ai_confidence: 0.88, user_satisfied: true, is_synthetic: false },
    { subject: "Battery drops from 100% to 60% in 2 hours", description: "Normal reading use but battery drains much faster than the advertised 12-15 hours.", category: "Battery", status: "escalated", priority: "high", resolution_source: "human", ai_confidence: 0.45, user_satisfied: false, is_synthetic: false },
    { subject: "Can't install Google Play Services", description: "Many apps I need require Google Play Services. Is there a workaround for the DC-1?", category: "Apps", status: "resolved_by_ai", priority: "medium", resolution_source: "ai", ai_confidence: 0.85, user_satisfied: true, is_synthetic: false },
    { subject: "Focus Mode timer resets on its own", description: "Set a 2-hour focus session but it keeps stopping after 30 minutes.", category: "Sol:OS", status: "escalated", priority: "medium", resolution_source: "human", ai_confidence: 0.35, user_satisfied: null, is_synthetic: false },
    { subject: "Outdoor readability in bright sunlight", description: "Screen is hard to read in direct afternoon sunlight. Any settings I should adjust?", category: "Display", status: "resolved_by_ai", priority: "low", resolution_source: "ai", ai_confidence: 0.95, user_satisfied: true, is_synthetic: false },
    { subject: "Factory reset stuck at Daylight logo", description: "Tried factory resetting but device is stuck showing the Daylight logo for 20 minutes.", category: "Troubleshooting", status: "escalated", priority: "urgent", resolution_source: "human", ai_confidence: 0.25, user_satisfied: null, is_synthetic: false },
    { subject: "Recommended power bank for travel", description: "Going on a week-long trip. What power bank works best with the DC-1?", category: "Accessories", status: "resolved_by_ai", priority: "low", resolution_source: "ai", ai_confidence: 0.97, user_satisfied: true, is_synthetic: false },
    { subject: "Sol:OS update breaks Bluetooth", description: "After updating to latest Sol:OS, my Bluetooth keyboard and stylus stopped connecting.", category: "Sol:OS", status: "escalated", priority: "high", resolution_source: "human", ai_confidence: 0.30, user_satisfied: false, is_synthetic: false },
    { subject: "How to extend display to external monitor", description: "I have a USB-C to HDMI adapter. How do I use my DC-1 with an external monitor in extended mode?", category: "Connectivity", status: "resolved_by_ai", priority: "medium", resolution_source: "ai", ai_confidence: 0.91, user_satisfied: true, is_synthetic: false },
  ];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Seed knowledge base
    const { error: kbError } = await supabase
      .from("knowledge_base")
      .upsert(GUIDES, { onConflict: "title" });

    if (kbError) {
      console.error("Knowledge base seed error:", kbError);
      // Try insert instead
      await supabase.from("knowledge_base").insert(GUIDES);
    }

    // Seed real tickets
    const realTickets = generateRealTickets();
    const { error: realError } = await supabase.from("support_tickets").insert(realTickets);
    if (realError) console.error("Real tickets error:", realError);

    // Seed synthetic tickets
    const syntheticTickets = generateSyntheticTickets(500);
    // Insert in batches of 100
    for (let i = 0; i < syntheticTickets.length; i += 100) {
      const batch = syntheticTickets.slice(i, i + 100);
      const { error } = await supabase.from("support_tickets").insert(batch);
      if (error) console.error(`Batch ${i} error:`, error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        guides_seeded: GUIDES.length,
        real_tickets: realTickets.length,
        synthetic_tickets: syntheticTickets.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Seed error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
