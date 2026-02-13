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

    // FAQ Q&A Pairs from daylightcomputer.com/faq
    const faqPairs = [
      // Order - Payments
      { title: "Can I pay in BTC?", category: "Order", tags: ["bitcoin", "payment", "crypto"], source_url: "https://daylightcomputer.com/faq", content: "Yes, we accept Bitcoin for payment. We currently use the Strike plugin through Shopify, which supports Lightning Network payments. Direct blockchain Bitcoin transactions are in development." },
      { title: "Can I get a discount code?", category: "Order", tags: ["discount", "promotion", "coupon"], source_url: "https://daylightcomputer.com/faq", content: "We currently do not have any discount codes available, but you can sign up for our newsletter to be the first to hear about upcoming promotions, releases, and other news." },
      { title: "Does Daylight take care of VAT?", category: "Order", tags: ["vat", "tax", "international"], source_url: "https://daylightcomputer.com/faq", content: "Currently, we do not take care of VAT. We are committed to improving our international shipping policies and streamlining this process as soon as we are able." },
      // Order - Policies
      { title: "What is the warranty on the DC-1?", category: "Order", tags: ["warranty", "guarantee", "protection"], source_url: "https://daylightcomputer.com/faq", content: "The DC-1 comes with a 1 year warranty as well as a 30 day return window." },
      { title: "What is your return policy?", category: "Order", tags: ["return", "refund", "policy"], source_url: "https://daylightcomputer.com/faq", content: "Our return policy is 30 days. Please reach out to hello@daylightcomputer.com if you have any other questions about the DC-1, or wish to make a return for a full refund." },
      // Order - Shipping
      { title: "Where do you ship?", category: "Order", tags: ["shipping", "delivery", "regions"], source_url: "https://daylightcomputer.com/faq", content: "We currently ship only to the USA, Canada, Europe, Australia, New Zealand, Malaysia, Singapore, and Japan. We are working on expanding our shipping options. Sign up for our newsletter to be notified when we broaden our shipping regions." },
      { title: "Do you ship to U.S. PO boxes?", category: "Order", tags: ["shipping", "po-box"], source_url: "https://daylightcomputer.com/faq", content: "Yes. We can ship your Daylight Computer to PO Boxes in the US." },
      { title: "How much is shipping?", category: "Order", tags: ["shipping", "cost", "fee"], source_url: "https://daylightcomputer.com/faq", content: "Shipping costs range from $6–$15 in the US, up to $25 for Europe, and up to $35 for Australia. This cost estimate excludes VAT and customs fees." },
      { title: "How can I edit my billing or shipping address?", category: "Order", tags: ["billing", "address", "order"], source_url: "https://daylightcomputer.com/faq", content: "If you need to make any changes to your order, please email us at hello@daylightcomputer.com" },
      // Device - Accessories
      { title: "Do you have any cases available?", category: "Device", tags: ["case", "protection", "accessories"], source_url: "https://daylightcomputer.com/faq", content: "We are currently working on our own line of cases, expected by mid 2026. We offer a kids case, a comfy sleeve, and recommend a 3rd party folio case. See Daylight Works with Devices for more recommendations." },
      { title: "Does the DC-1 come with a keyboard?", category: "Device", tags: ["keyboard", "accessories", "included"], source_url: "https://daylightcomputer.com/faq", content: "The Daylight Computer does not include a keyboard, but it can connect to both Bluetooth and wired keyboards. A keyboard is part of our roadmap. Learn about compatible devices at Daylight Works with Devices." },
      { title: "Does the DC-1 come with a stand?", category: "Device", tags: ["stand", "accessories", "included"], source_url: "https://daylightcomputer.com/faq", content: "The Daylight Computer does not include a stand, but it works with a wide variety of stands. We personally like the Moft Stand and the FinTie keyboard stand." },
      // Device - Connectivity
      { title: "Can I use a wired Ethernet connection instead of WiFi?", category: "Device", tags: ["ethernet", "connectivity", "wired"], source_url: "https://daylightcomputer.com/faq", content: "Yes, absolutely! You can connect your Ethernet cable to the Daylight Computer with a USB-C adapter." },
      { title: "How many devices can I pair with the tablet via Bluetooth or wired connection?", category: "Device", tags: ["bluetooth", "connectivity", "pairing"], source_url: "https://daylightcomputer.com/faq", content: "The DC-1 has no issue pairing two devices simultaneously via Bluetooth. You can also use a multiport adapter to connect 3-4 devices via wired connection. More external devices will affect battery performance." },
      { title: "How to use the tablet as my laptop display or mirror or second display?", category: "Device", tags: ["monitor", "display", "connectivity"], source_url: "https://daylightcomputer.com/faq", content: "You can learn how to set up the DC-1 as a monitor in our documentation. Use the DC-1 as a Monitor for detailed setup instructions." },
      { title: "Is there a 3.5mm audio jack?", category: "Device", tags: ["audio", "headphone", "jack"], source_url: "https://daylightcomputer.com/faq", content: "We do not currently offer a headphone jack. However, you can connect 3.5mm cables via a USB-C adapter." },
      { title: "Can I connect a wired mouse and a wired keyboard with a splitter through the USB-C port?", category: "Device", tags: ["usb-c", "keyboard", "mouse"], source_url: "https://daylightcomputer.com/faq", content: "Yes, the Daylight Computer can handle multiple devices plugged in with wires. This requires a USB-C multiport adapter, and should require no setup. Keyboard and mouse will connect automatically." },
      { title: "Can I hardwire it to Ethernet?", category: "Device", tags: ["ethernet", "wired", "connectivity"], source_url: "https://daylightcomputer.com/faq", content: "Yes, absolutely! You can connect your ethernet cable to the Daylight Computer with a USB-C adapter." },
      { title: "Does the DC-1 work with web-cams?", category: "Device", tags: ["webcam", "camera", "compatibility"], source_url: "https://daylightcomputer.com/faq", content: "The DC-1 is not easily compatible with cameras. This is something that we're working to fix in our next model." },
      // Device - Specs
      { title: "Is it possible to order the DC-1 with a plug type 1 (grounded)?", category: "Device", tags: ["charging", "power", "specs"], source_url: "https://daylightcomputer.com/faq", content: "The DC-1 comes with a USB-C to USB-C charging cable, but no wall outlet plug. This charging cable is compatible with any standard wall outlet plug meant for charging personal electronic devices, including three prong (type 1) plugs." },
      { title: "Does the tablet have a microphone?", category: "Device", tags: ["audio", "microphone", "speaker"], source_url: "https://daylightcomputer.com/faq", content: "Yes, the Daylight Computer comes with a stereo microphone for high quality recording, ideal for meetings or chatting. It also comes with stereo speakers for multiple audio sources." },
      { title: "What is the storage capacity of the Daylight Computer?", category: "Device", tags: ["storage", "specs", "sd-card"], source_url: "https://daylightcomputer.com/faq", content: "The Daylight Computer offers 128GB built-in storage with additional capacity available by using a microSD card. We've tested it with up to a 1TB microSD card." },
      { title: "Is the DC-1 waterproof? What's the water resistance rating?", category: "Device", tags: ["waterproof", "durability", "specs"], source_url: "https://daylightcomputer.com/faq", content: "The DC-1 is not currently waterproof. We are looking into improving water resistance/proofing for future products." },
      { title: "What are the dimensions of the DC-1?", category: "Device", tags: ["dimensions", "size", "specs"], source_url: "https://daylightcomputer.com/faq", content: "Screen: 10.5 inches. Product Width: 7.25 inches. Product Height: 10 inches. Weight: 580g." },
      { title: "What is the anticipated lifespan of the device?", category: "Device", tags: ["lifespan", "durability", "specs"], source_url: "https://daylightcomputer.com/faq", content: "The DC-1 will have a comparable lifespan to a standard consumer electronic tablet such as an iPad or a Kindle. We plan to prioritize software compatibility on older hardware and are against planned obsolescence." },
      { title: "What temperature limits can the DC-1 safely operate in?", category: "Device", tags: ["temperature", "specs", "operating"], source_url: "https://daylightcomputer.com/faq", content: "Our current advised temperature limits are between 0 and 45 degrees Celsius, or 32 to 95 °F. It is likely that we can perform slightly higher or colder (±5°C)." },
      { title: "What are the full specs of the DC-1?", category: "Device", tags: ["specifications", "hardware", "specs"], source_url: "https://daylightcomputer.com/faq", content: "8GB RAM, 128GB micro SD card with expandable storage, 8000mAh battery, Helio G99 chipset, 10.5in 4:3 display size, Android 13. We are working to create a culture that focuses more on the user experience than specs." },
      { title: "Does the tablet have lower EMF than the iPad?", category: "Device", tags: ["emf", "health", "radiation"], source_url: "https://daylightcomputer.com/faq", content: "The DC-1's main health benefit comes from its blue light and flicker free screen technology. The DC-1 has not been optimized at the hardware IC level to mitigate EMFs, but we plan to investigate this. A Smart Airplane Mode software update (early 2026) will significantly reduce RF EMF exposure. You can also hardwire via USB-C Ethernet and our stylus is Bluetooth free." },
      { title: "How is the DC-1 different from a Kindle?", category: "Device", tags: ["kindle", "comparison", "e-reader"], source_url: "https://daylightcomputer.com/faq", content: "While Kindle is great for reading, the DC-1 is a fully-fledged computer with access to the Play Store. The DC-1 runs at 60-120fps (60x faster than Kindle), has 8GB RAM and 128GB storage, and lets you read, write, browse, and run apps." },
      // Device - Display
      { title: "Does the DC-1 use e-ink display technology?", category: "Device", tags: ["display", "e-ink", "technology"], source_url: "https://daylightcomputer.com/faq", content: "No, the DC-1 uses our proprietary Live Paper display technology, which operates at 60-120 fps, providing a refresh rate that is 60x faster than traditional e-readers and e-ink screens. You can use it as a full computer with all your favorite apps and accessories." },
      { title: "How durable is the screen and would it be ok to use Wacom compatible pens?", category: "Device", tags: ["screen", "durability", "stylus"], source_url: "https://daylightcomputer.com/faq", content: "Our screen has a 2H hardness specification and ceramic tips generally exceed that hardness. For this reason, we would advise against using Wacom compatible pens with the DC-1." },
      { title: "What is DC dimming and why is it better than PWM?", category: "Device", tags: ["dimming", "display", "flicker"], source_url: "https://daylightcomputer.com/faq", content: "DC dimming (constant current reduction) adjusts brightness by varying the direct current supplied to the LEDs. This eliminates flicker compared to Pulse Width Modulation (PWM) which causes flickering, making the backlight much healthier for eyes and brain." },
      { title: "What is the screen resolution?", category: "Device", tags: ["resolution", "display", "specs"], source_url: "https://daylightcomputer.com/faq", content: "With 10.5 inch 4:3 display size and 1600 x 1200 resolution, the Daylight Computer offers sharp text and clear images - ideal for reading, taking notes, and video." },
      { title: "What is the amber backlight?", category: "Device", tags: ["amber", "backlight", "blue-light"], source_url: "https://daylightcomputer.com/faq", content: "The DC-1 has a custom made amber backlight, which illuminates the display with a very warm color, and 100% blue light free light spectrum." },
      { title: "Are pixels stable on static content?", category: "Device", tags: ["display", "flicker", "stability"], source_url: "https://daylightcomputer.com/faq", content: "Yes, the DC-1's pixels are very stable on static content through IGZO transistors (less leakage current) and variable refresh rate technology (as low as 1Hz). This eliminates flickering on static content, similar to e-ink but with full computer functionality." },
      // Device - Battery
      { title: "What is the battery capacity of the DC-1?", category: "Device", tags: ["battery", "capacity", "specs"], source_url: "https://daylightcomputer.com/faq", content: "The DC-1 has an 8,000 mAh battery capacity. The duration on a single charge varies from 15-60 hours depending on app and backlight usage." },
      { title: "What is the battery usage like?", category: "Device", tags: ["battery", "life", "usage"], source_url: "https://daylightcomputer.com/faq", content: "Our LivePaper display hits a sweet spot between traditional displays and e-Ink efficiency. Battery life: 15 hours active use with backlight on, 67 hours reading without backlight, 30 hours YouTube without backlight, 30 hours reading with 30% amber backlight brightness." },
      // Device - Hardware
      { title: "Does the DC-1 have physical buttons?", category: "Device", tags: ["buttons", "hardware", "controls"], source_url: "https://daylightcomputer.com/faq", content: "Yes, the Daylight Computer comes with physical buttons such as volume buttons and power. There are two buttons that currently do not have any functionality, but are designed to accommodate tailored features in future versions of SOL:OS." },
      { title: "What kind of processor does the DC-1 have?", category: "Device", tags: ["processor", "chipset", "hardware"], source_url: "https://daylightcomputer.com/faq", content: "The Daylight Computer uses a MediaTek Helio G99 chipset with multiple cores: Cortex-A76 cores at 2.2 GHz for high performance, and Cortex-A55 cores for energy-efficient less demanding tasks." },
      // Device - Repairability
      { title: "Do you have plans for upgradeability or recycling?", category: "Device", tags: ["recycling", "sustainability", "repair"], source_url: "https://daylightcomputer.com/faq", content: "We do not currently have support for recycling or upgradeability. However, it is a top priority to create products using sustainable and recyclable materials. We are committed to evolving into a company centered on modularity and recycling." },
      { title: "Is the battery user-replaceable?", category: "Device", tags: ["battery", "repair", "user-replaceable"], source_url: "https://daylightcomputer.com/faq", content: "Unfortunately, the battery is not user replaceable. We intend to improve on this aspect in future products." },
      { title: "Is the screen repairable?", category: "Device", tags: ["screen", "repair", "replacement"], source_url: "https://daylightcomputer.com/faq", content: "At the moment our computers do not have screen replaceability, but we are working to modularize this component in new versions." },
      // Device - Stylus
      { title: "Does the Stylus feature an eraser function?", category: "Device", tags: ["stylus", "pen", "eraser"], source_url: "https://daylightcomputer.com/faq", content: "Yes, the stylus has a dedicated button that switches the pen from writing to erasing." },
      { title: "How long will the stylus nibs last?", category: "Device", tags: ["stylus", "nib", "replacement"], source_url: "https://daylightcomputer.com/faq", content: "The stylus tip lifespan depends on usage. Constant usage may result in a tip lasting as long as a month, while occasional usage will allow a stylus tip to last years. We ship replacement stylus tips with the DC-1." },
      { title: "Does the Stylus support pressure and tilt sensitivity?", category: "Device", tags: ["stylus", "pressure", "sensitivity"], source_url: "https://daylightcomputer.com/faq", content: "Yes, the Daylight Computer supports tilt and pressure sensitivity, but not every app supports this. Make sure the app you're using does. For example, Concepts is an app that supports both." },
      // Software - OS
      { title: "What is your stance on open source?", category: "Software", tags: ["open-source", "os", "bootloader"], source_url: "https://daylightcomputer.com/faq", content: "We love open source and plan to make at least part of our OS source-available. We also plan to release bootloader unlock tools so you can use your favorite OS on the DC-1." },
      { title: "How deeply is Google embedded into your operating system?", category: "Software", tags: ["google", "android", "os"], source_url: "https://daylightcomputer.com/faq", content: "We built our operating system on Android 13, but heavily modified it so that Google is not deeply embedded on the device. You have the option of setting up your Google account with it, but it is by no means a requirement." },
      // Software - Specs
      { title: "Is GPS enabled?", category: "Software", tags: ["gps", "location", "features"], source_url: "https://daylightcomputer.com/faq", content: "The Daylight Computer does not come with GPS or location services." },
      { title: "Can the DC-1 do everything a normal Android tablet can do?", category: "Software", tags: ["android", "compatibility", "apps"], source_url: "https://daylightcomputer.com/faq", content: "Outside of having a webcam and having color, the DC-1 can do pretty much anything a standard Android tablet can do. It works with the vast majority of apps including: Kindle, Excel, Duolingo, Youtube, Whatsapp, Spotify, and much more." },
      { title: "Does the DC-1 have airplane mode?", category: "Software", tags: ["airplane-mode", "connectivity"], source_url: "https://daylightcomputer.com/faq", content: "The Daylight Computer comes equipped with Bluetooth, WiFi, as well as airplane mode - all of which can be turned on or off as you need." },
      // Software - Apps
      { title: "Can I use Obsidian on the DC-1?", category: "Software", tags: ["obsidian", "apps", "productivity"], source_url: "https://daylightcomputer.com/faq", content: "Yes! The devs at Obsidian are working on optimizations for the DC-1 and have some great themes to make the most of our display." },
      { title: "How many apps are natively designed for the DC-1?", category: "Software", tags: ["native-apps", "app-store"], source_url: "https://daylightcomputer.com/faq", content: "We developed our own best-in-class PDF Reader app for the DC-1. More top-notch native apps are on the way. There are also a number of apps like Obsidian that have been optimized to work well with our device." },
      { title: "Does the DC-1 support signing into the Play Store to accept invites to custom apps?", category: "Software", tags: ["play-store", "google", "apps"], source_url: "https://daylightcomputer.com/faq", content: "You can sign into the Google Play Store and accept invites, yes." },
      { title: "What apps does the DC-1 run?", category: "Software", tags: ["apps", "android", "compatibility"], source_url: "https://daylightcomputer.com/faq", content: "The Daylight Computer runs on our own modified version of Android, and works with all Android apps including: Kindle, Excel, Duolingo, Youtube, Whatsapp, Spotify, and much more." },
      { title: "Can I draw on the DC-1?", category: "Software", tags: ["drawing", "apps", "stylus"], source_url: "https://daylightcomputer.com/faq", content: "Yes, you can use any Android or web app on it, including our built-in drawing app." },
      { title: "How well do photo apps work on the DC-1?", category: "Software", tags: ["photos", "apps", "display"], source_url: "https://daylightcomputer.com/faq", content: "Thanks to our high refresh rate display, picture-heavy apps work smoothly. Our paper-like screen doesn't display colors - you get a focused experience in grayscale, which is ideal for knowledge work." },
      { title: "Do video calls like Zoom work?", category: "Software", tags: ["zoom", "video-calls", "apps"], source_url: "https://daylightcomputer.com/faq", content: "You can attend Zoom calls, but the DC-1 doesn't have a camera of its own. Web cams won't automatically be recognized by the device, so you'll need to use workarounds like calling in with your phone serving as a camera." },
      { title: "Can I install apps via APK files?", category: "Software", tags: ["apk", "sideload", "apps"], source_url: "https://daylightcomputer.com/faq", content: "Yes, you can install apps without using the Play Store. We support APK files and we support alternative app stores like Aurora Store, which you can access without a Google account." },
      // Software - Developers
      { title: "What alternate app stores are you supporting?", category: "Software", tags: ["app-stores", "developers", "aurora-store"], source_url: "https://daylightcomputer.com/faq", content: "The DC-1 supports all alternative app stores that are generally supported on Android, like the Aurora Store or F-Droid." },
      { title: "What IDE and language should I use to develop apps natively for the DC-1?", category: "Software", tags: ["development", "android", "ide"], source_url: "https://daylightcomputer.com/faq", content: "We recommend the normal Android development stack: IDE: Android Studio or VS Code (with Android Plugins). Native Frameworks: Jetpack Compose, XML. Languages: Kotlin, Java. Non-native Frameworks: Flutter, React Native, PWA." },
      { title: "Do you have developer guidelines & documentation?", category: "Software", tags: ["developers", "documentation", "guidelines"], source_url: "https://daylightcomputer.com/faq", content: "We are in the process of building out our developer documentation. It will include guidance on how to think about developing an app for the DC-1 from a technical and philosophical perspective. Reach out to hello@daylightcomputer.com if you need specific guidance." },
      { title: "Are you making the source code of Sol:OS available to the public?", category: "Software", tags: ["sol-os", "open-source", "developers"], source_url: "https://daylightcomputer.com/faq", content: "Sol:OS will likely be source-available. This means we'll be sharing the source code with our community of users and developers. This promotes transparency, enables security research, and fosters a collaborative environment. Join us on daylighthacker.wiki for more." },
      { title: "Why can't I connect two gmail accounts to my DC-1?", category: "Software", tags: ["google", "accounts", "android"], source_url: "https://daylightcomputer.com/faq", content: "Android has a requirement that devices need a screen-lock in order to allow multiple accounts. Please reach out to our customer success team if you have any questions about getting set up." },
      // Software - Kids
      { title: "Does the DC-1 have parental controls?", category: "Software", tags: ["kids", "parental-controls"], source_url: "https://daylightcomputer.com/faq", content: "At this moment the DC-1 does not have any further parental controls outside of what is possible on Android 13. However, this is a high priority for us to address in the future as we plan to invest heavily in making Daylight Computer the best option for kids/learning." },
      // Software - Privacy
      { title: "Can a firewall and vpn be installed?", category: "Software", tags: ["vpn", "firewall", "security", "privacy"], source_url: "https://daylightcomputer.com/faq", content: "Yes. Just install your favorite VPN app from the Play Store (or alternative app store) and follow instructions. Alternatively, you can go into the Settings and set up your VPN connection. Android supports VPNs at a system level." },
      { title: "Would this be compatible with something more secure, such as GrapheneOS?", category: "Software", tags: ["grapheneos", "custom-rom", "security"], source_url: "https://daylightcomputer.com/faq", content: "We're unlocking the device's bootloader, so you can experiment with flashing your own custom Android ROMs. However GrapheneOS specifically only supports Google's pixel devices at the moment." },
      { title: "Is the version of Android you're using de-Googled?", category: "Software", tags: ["google", "privacy", "data"], source_url: "https://daylightcomputer.com/faq", content: "We use a heavily modified version of Android, and we have shut off all the data collection processes that we are aware of. As a result, you do not need to sign up with Google to use the DC-1." },
      { title: "Is there any tracking features in the OS?", category: "Software", tags: ["tracking", "privacy", "data"], source_url: "https://daylightcomputer.com/faq", content: "We do track basic usage data to improve our apps and services — all the data is anonymized and stored securely. You can choose to disable this." },
      // Software - Reader App
      { title: "Can I export my highlights from the Reader app?", category: "Software", tags: ["reader", "app", "export"], source_url: "https://daylightcomputer.com/faq", content: "Not yet, but it is on our roadmap." },
      { title: "When I upload files onto the Reader app, where are those files stored?", category: "Software", tags: ["reader", "storage", "cloud"], source_url: "https://daylightcomputer.com/faq", content: "All files opened on the Reader app are stored locally. There is a cloud service which allows you to see your uploaded files on other devices - these cloud-stored files are simply copies of the local storage." },
      { title: "What happens to my cloud-saved Reader app files if I delete files saved locally?", category: "Software", tags: ["reader", "cloud", "deletion"], source_url: "https://daylightcomputer.com/faq", content: "Because the cloud storage is looking at the local files and copying what is there, the cloud will delete files if they are deleted locally." },
      { title: "Is there a backup to my Reader app files?", category: "Software", tags: ["reader", "backup", "cloud"], source_url: "https://daylightcomputer.com/faq", content: "There is not a system in place yet to back up files, but our software team is working on a back-up system that will allow people to delete their files locally, while saving it on a backup system." },
      { title: "Can I bring the books I bought via Kindle to the Daylight Reader app?", category: "Software", tags: ["reader", "kindle", "import"], source_url: "https://daylightcomputer.com/faq", content: "The Reader app currently does not support Kindle books as they are only accessible through the Kindle app. However, you can easily download and log in to the Kindle app, just as you would on any Android device." },
      // Company
      { title: "What other products do you offer?", category: "Company", tags: ["products", "roadmap", "future"], source_url: "https://daylightcomputer.com/faq", content: "The DC-1 is just the beginning! We're working to make a whole suite of healthier phones, monitors, laptops, and more. Sign up for our newsletter to stay up to date on the latest news from Daylight." },
      { title: "Where is Daylight based?", category: "Company", tags: ["company", "location", "headquarters"], source_url: "https://daylightcomputer.com/faq", content: "Daylight Computer Co. is based in San Francisco, California." },
      { title: "Why did you start Daylight Computer Company?", category: "Company", tags: ["mission", "company", "story"], source_url: "https://daylightcomputer.com/faq", content: "Daylight began with a fundamental question: why can't technology work in harmony with our wellbeing? Founder Anjan Katta, living with ADHD, experienced firsthand how screens fueled distraction. After six years developing a different vision, the result is technology that adapts to human nature - making computing more calm, natural, and healthy." },
      { title: "What are your vision, mission, values?", category: "Company", tags: ["mission", "values", "company"], source_url: "https://daylightcomputer.com/faq", content: "Our public benefit purpose: To help technology and humanity live happily ever after. This embodies our vision, mission, and values fairly well." },
      { title: "Who is the CEO of Daylight?", category: "Company", tags: ["ceo", "leadership"], source_url: "https://daylightcomputer.com/faq", content: "Anjan Katta is the CEO of Daylight Computer Co." },
      // Health
      { title: "What does flicker-free mean?", category: "Health", tags: ["flicker", "health", "eyes"], source_url: "https://daylightcomputer.com/faq", content: "Most screens at home flash on and off thousands of times per minute. This flickering, though invisible to the naked eye, places unnecessary strain on your eyes over time. The DC-1 eliminates this issue, giving your eyes a much-needed break." },
      { title: "How does the DC-1 help people who are blue light sensitive?", category: "Health", tags: ["blue-light", "health", "eyes"], source_url: "https://daylightcomputer.com/faq", content: "Many people struggle with eye irritation due to staring at a blue-light source all day, which can have a stressful effect on vision comfort and sleep health. The Daylight Computer is a great solution as the screen does not emit blue light at a hardware level." },
      { title: "Can't you already remove the blue light from your phone / computer?", category: "Health", tags: ["blue-light", "night-mode", "health"], source_url: "https://daylightcomputer.com/faq", content: "Yes, you can remove blue light manually in settings, but you have to turn your screen completely red, resulting in a very poor visual experience. Our custom amber backlight has a broad light spectrum (green, yellow, orange, red) - still 100% blue light free, but far more visible. We also use DC dimming instead of PWM to eliminate flicker." },
      { title: "Why is blue light bad?", category: "Health", tags: ["blue-light", "health", "circadian"], source_url: "https://daylightcomputer.com/faq", content: "Blue light from artificial sources disrupts the body's natural rhythms. Exposure tricks the brain into thinking it's daytime, suppressing melatonin and disrupting sleep. It causes eye strain, headaches, anxiety, and plays a role in myopia development. Reducing blue light exposure, particularly in the evening, is essential for maintaining a healthy circadian rhythm and protecting long-term health." },
      // Work With Us
      { title: "Are you hiring? Do you have job openings?", category: "Work With Us", tags: ["hiring", "careers", "jobs"], source_url: "https://daylightcomputer.com/faq", content: "You can find job postings and opportunities to work with us on our careers page. We're a small team growing intentionally, so there may not always be roles available. We are always seeking talented individuals who align with our mission. Reach out to hello@daylightcomputer.com." },
      { title: "Can I collaborate with Daylight?", category: "Work With Us", tags: ["partnerships", "collaboration"], source_url: "https://daylightcomputer.com/faq", content: "Email us at hello@daylightcomputer.com and let's talk!" },
      { title: "Can I have an affiliate link?", category: "Work With Us", tags: ["affiliate", "partnerships"], source_url: "https://daylightcomputer.com/faq", content: "Yes! Please visit our registration page. We will confirm your signup and provide resources to help you speak effectively to your audience." },
      { title: "Can I review a Daylight Computer?", category: "Work With Us", tags: ["review", "partnerships", "press"], source_url: "https://daylightcomputer.com/faq", content: "Email us at hello@daylightcomputer.com and let's talk!" },
      // oj section - Health
      { title: "What does blue light-free mean?", category: "Company", tags: ["blue-light", "display", "amber"], source_url: "https://daylightcomputer.com/faq", content: "Daylight Computer offers a unique feature where the backlight can be completely turned off, providing a paperlike experience without exposing you to artificial blue light. For low-light settings, the DC-1 can be adjusted to our signature amber glow, which is also free of blue light." },
    ];

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
        source_url: "https://daylightcomputer.com/faq",
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
        source_url: "https://daylightcomputer.com/faq",
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

    // RAG-ready FAQ Q&A pairs (question = title, key answer = content)
    const faqEntries = [
      // Order / Payments
      { title: "Can I pay in BTC?", category: "Payments", tags: ["payment", "bitcoin", "crypto", "strike", "lightning"], source_url: "https://daylightcomputer.com/faq", content: `Yes, we accept Bitcoin for payment. We use the Strike plugin through Shopify, which supports Lightning Network payments only. We are working on integrating direct Bitcoin transactions on the blockchain in the future.` },
      { title: "Can I get a discount code?", category: "Payments", tags: ["discount", "promo", "newsletter"], source_url: "https://daylightcomputer.com/faq", content: `We currently do not have any discount codes available. You can sign up for our newsletter to be the first to hear about upcoming promotions, releases, and other news.` },
      { title: "Does Daylight take care of VAT?", category: "Payments", tags: ["vat", "tax", "international"], source_url: "https://daylightcomputer.com/faq", content: `Currently we do not take care of VAT. We are committed to improving our international shipping policies and streamlining this process as soon as we are able.` },
      // Policies
      { title: "What is the warranty on the DC-1?", category: "Policies", tags: ["warranty", "dc-1"], source_url: "https://daylightcomputer.com/faq", content: `The DC-1 comes with a 1 year warranty as well as a 30 day return window.` },
      { title: "What is your return policy?", category: "Policies", tags: ["return", "refund", "policy"], source_url: "https://daylightcomputer.com/faq", content: `Our return policy is 30 days. Reach out to Hello@daylightcomputer.com if you have any other questions about the DC-1 or wish to make a return for a full refund.` },
      // Shipping
      { title: "Where do you ship?", category: "Shipping", tags: ["shipping", "regions", "countries"], source_url: "https://daylightcomputer.com/faq", content: `We currently ship only to the USA, Canada, Europe, Australia, New Zealand, Malaysia, Singapore, and Japan. We are working on expanding our shipping options. Sign up for our newsletter to be notified when we broaden our shipping regions.` },
      { title: "Do you ship to U.S. PO boxes?", category: "Shipping", tags: ["shipping", "po-box", "usa"], source_url: "https://daylightcomputer.com/faq", content: `Yes. We can ship your Daylight Computer to PO Boxes in the US.` },
      { title: "How much is shipping?", category: "Shipping", tags: ["shipping", "cost", "price"], source_url: "https://daylightcomputer.com/faq", content: `Shipping depends on location. Costs range from $6–$15 in the US, up to $25 for Europe, and up to $35 for Australia. This excludes VAT and customs fees.` },
      { title: "How can I edit my billing or shipping address?", category: "Shipping", tags: ["address", "edit", "order"], source_url: "https://daylightcomputer.com/faq", content: `If you need to make any changes to your order, please email us at hello@daylightcomputer.com.` },
      // Accessories
      { title: "Do you have any cases available?", category: "Accessories", tags: ["case", "kids-case", "sleeve", "folio"], source_url: "https://daylightcomputer.com/faq", content: `We are currently working on our own line of cases, and hope to have these completed by mid 2026. We offer a kids case, a comfy sleeve, and we recommend a 3rd party folio case. You can find other devices we recommend at Daylight Works with Devices.` },
      { title: "Does the DC-1 come with a keyboard?", category: "Accessories", tags: ["keyboard", "bluetooth", "wired"], source_url: "https://daylightcomputer.com/faq", content: `The Daylight Computer does not include a keyboard, but it can connect to both Bluetooth and wired keyboards. A keyboard is part of our roadmap. Learn about how the DC-1 works with devices at Daylight Works with Devices.` },
      { title: "Does the DC-1 come with a stand?", category: "Accessories", tags: ["stand", "moft", "fintie"], source_url: "https://daylightcomputer.com/faq", content: `The Daylight Computer does not include a stand, but it works with a wide variety of stands. We personally like the Moft Stand and the FinTie keyboard stand. Learn more at Daylight Works with Devices.` },
      // Connectivity
      { title: "Can I use a wired Ethernet connection instead of WiFi?", category: "Connectivity", tags: ["ethernet", "wired", "usb-c", "adapter"], source_url: "https://daylightcomputer.com/faq", content: `Yes, absolutely. You can connect your Ethernet cable to the Daylight Computer with a USB-C adapter. See Daylight Works with Devices for recommendations.` },
      { title: "How many devices can I pair with the tablet via Bluetooth or wired connection?", category: "Connectivity", tags: ["bluetooth", "pairing", "multiport", "battery"], source_url: "https://daylightcomputer.com/faq", content: `The DC-1 has no issue pairing two devices simultaneously via Bluetooth. You can also use a multiport adapter to connect 3-4 devices via wired connection. More external devices connected will affect battery performance to some degree.` },
      { title: "How to use the tablet as my laptop display or mirror or second display?", category: "Connectivity", tags: ["monitor", "display", "second-screen"], source_url: "https://support.daylightcomputer.com/getting-started/use-the-dc-1-as-a-monitor", content: `You can learn how to set up the DC-1 as a monitor in our doc: Use the DC-1 as a Monitor.` },
      { title: "Is there a 3.5mm audio jack?", category: "Connectivity", tags: ["audio", "headphone", "usb-c"], source_url: "https://daylightcomputer.com/faq", content: `We do not currently offer a headphone jack. You can connect 3.5mm cables via a USB-C adapter.` },
      { title: "Can I connect a wired mouse and a wired keyboard with a splitter through the USB-C port?", category: "Connectivity", tags: ["keyboard", "mouse", "usb-c", "multiport"], source_url: "https://daylightcomputer.com/faq", content: `Yes. The Daylight Computer can handle multiple devices plugged in with wires. This requires a USB-C multiport adapter, and should require no setup. Keyboard and mouse will connect automatically.` },
      { title: "Can I hardwire it to Ethernet?", category: "Connectivity", tags: ["ethernet", "wired", "usb-c"], source_url: "https://daylightco.notion.site/Connect-to-Ethernet-12d0b673e0bf8038b570d078384290f6", content: `Yes, absolutely. You can connect your ethernet cable to the Daylight Computer with a USB-C adapter. See our recommendations for how the DC-1 works with devices, including Ethernet.` },
      { title: "Does the DC-1 work with webcams?", category: "Connectivity", tags: ["webcam", "camera"], source_url: "https://daylightcomputer.com/faq", content: `The DC-1 is not easily compatible with cameras. This is something we're working to fix in our next model.` },
      // Specs (device)
      { title: "Is it possible to order the DC-1 with a plug type 1 (grounded)?", category: "Specs", tags: ["plug", "charging", "type-1", "grounded"], source_url: "https://daylightcomputer.com/faq", content: `The DC-1 comes with a USB-C to USB-C charging cable but no wall outlet plug. This cable is compatible with any standard wall outlet plug for charging personal electronic devices, including three prong (type 1) plugs.` },
      { title: "Does the tablet have a microphone?", category: "Specs", tags: ["microphone", "audio", "speakers"], source_url: "https://daylightcomputer.com/faq", content: `The Daylight Computer comes with a stereo microphone for high quality recording and multiple microphones to capture sound. It also comes with stereo speakers for depth in music, work calls, and videos.` },
      { title: "What is the storage capacity of the Daylight Computer?", category: "Specs", tags: ["storage", "128gb", "microsd"], source_url: "https://daylightcomputer.com/faq", content: `The Daylight Computer offers 128GB built-in storage with additional capacity via microSD card. We've tested up to a 1TB microSD card; it can likely accommodate all microSD cards.` },
      { title: "Is the DC-1 waterproof? What's the water resistance rating?", category: "Specs", tags: ["waterproof", "water-resistance"], source_url: "https://daylightcomputer.com/faq", content: `The DC-1 is not currently waterproof. We are looking into improving water resistance/proofing for future products.` },
      { title: "What are the dimensions of the DC-1?", category: "Specs", tags: ["dimensions", "size", "weight"], source_url: "https://daylightcomputer.com/faq", content: `Screen: 10.5 inches. Product Width: 7.25 inches. Product Height: 10 inches. Weight: 580g.` },
      { title: "What is the anticipated lifespan of the device?", category: "Specs", tags: ["lifespan", "durability"], source_url: "https://daylightcomputer.com/faq", content: `The DC-1 will have a comparable lifespan to a standard consumer electronic tablet such as an iPad or a Kindle. We plan to prioritize software compatibility on older hardware and are against planned obsolescence at a company principles level.` },
      { title: "What temperature limits can the DC-1 safely operate in?", category: "Specs", tags: ["temperature", "operating"], source_url: "https://daylightcomputer.com/faq", content: `Our current advised temperature limits are between 0 and 45 degrees Celsius, or 32 to 95 °F. It may perform slightly higher or colder (±5 °C).` },
      { title: "What are the specs?", category: "Specs", tags: ["specs", "ram", "battery", "chipset"], source_url: "https://daylightcomputer.com/faq", content: `8GB RAM, 128GB storage with expandable microSD, 8000mAh battery, Helio G99 chipset, 10.5in 4:3 display, Android 13. We are working to focus more on user experience than specs.` },
      { title: "Does the tablet have lower EMF than the iPad?", category: "Specs", tags: ["emf", "health", "rf", "airplane-mode"], source_url: "https://daylightcomputer.com/faq", content: `The DC-1's main health benefit is blue light and flicker-free screen technology. For RF-EMFs from the device, the DC-1 has not been optimized at the hardware IC level to mitigate EMFs; we plan to investigate this on future products. We can mitigate a lot of EMFs with "Smart Airplane Mode" (launching early 2026), which keeps the device in Airplane mode when not needing internet. You can also hardwire via USB-C to Ethernet. Our stylus is Bluetooth free.` },
      { title: "How is the DC-1 different from a Kindle?", category: "Specs", tags: ["kindle", "comparison", "livepaper"], source_url: "https://daylightcomputer.com/faq", content: `The Daylight Computer is a fully-fledged computer with Play Store access: browse the web, email, notes, stream music or videos on an easy-on-the-eyes screen. With LivePaper, the DC-1 runs at 60-120fps (about 60x faster than a Kindle). It has 8GB RAM, 128GB storage, and a full browser. It's for reading, productivity, and entertainment in one.` },
      // Display
      { title: "Does the DC-1 use e-ink display technology?", category: "Display", tags: ["e-ink", "livepaper", "refresh-rate"], source_url: "https://daylightcomputer.com/faq", content: `The DC-1 does not use e-ink. It uses our proprietary Live Paper display technology at 60-120 fps, about 60x faster than traditional e-readers. You can use it as a full computer with apps, websites, keyboard, mouse, and speakers—and as a good e-reader.` },
      { title: "How durable is the screen and would it be ok to use Wacom compatible pens with a ceramic tip?", category: "Display", tags: ["screen", "durability", "stylus", "wacom", "ceramic"], source_url: "https://daylightcomputer.com/faq", content: `Our screen has a 2H hardness specification. Ceramic tips generally exceed that hardness, so we advise against using them with the DC-1.` },
      { title: "What is DC dimming and why is it better than PWM?", category: "Display", tags: ["dc-dimming", "pwm", "flicker", "backlight"], source_url: "https://daylightcomputer.com/faq", content: `Traditional devices use PWM LED drivers for brightness, which can cause flickering. DC dimming (constant current reduction) varies the direct current to the LEDs instead, eliminating flicker and making the backlight healthier for eyes and brain.` },
      { title: "What is the screen resolution?", category: "Display", tags: ["resolution", "display"], source_url: "https://daylightcomputer.com/faq", content: `10.5", 4:3 display with 1600 x 1200 resolution—sharp text and clear images for reading, notes, and video.` },
      { title: "What is the amber backlight?", category: "Display", tags: ["amber", "backlight", "blue-light-free"], source_url: "https://daylightcomputer.com/faq", content: `The DC-1 has a custom amber backlight that illuminates the display with a very warm color and 100% blue light free spectrum.` },
      { title: "Are pixels stable on static content?", category: "Display", tags: ["pixels", "static", "igzo", "refresh-rate"], source_url: "https://daylightcomputer.com/faq", content: `Yes. The DC-1 uses IGZO transistors (less leakage than amorphous silicon) and variable refresh rate (as low as 1Hz/10Hz for static content), so there's no 60Hz flicker. Many users with sensitive eyes report excellent comfort.` },
      { title: "What is the battery capacity of the DC-1?", category: "Battery", tags: ["battery", "capacity", "8000mah"], source_url: "https://daylightcomputer.com/faq", content: `The DC-1 has an 8,000 mAh battery. Duration on a single charge varies from 15-60 hours depending on app and backlight usage.` },
      { title: "What is the battery usage like?", category: "Battery", tags: ["battery", "runtime", "backlight"], source_url: "https://daylightcomputer.com/faq", content: `Approximate single-charge runtimes: 15 hours active use with backlight on; 67 hours reading without backlight; 30 hours YouTube without backlight; 30 hours reading at 30% amber backlight. The display draws power while showing content (unlike bistable e-Ink).` },
      // Hardware
      { title: "Does the DC-1 have physical buttons?", category: "Hardware", tags: ["buttons", "volume", "power"], source_url: "https://daylightcomputer.com/faq", content: `Yes. The Daylight Computer has physical buttons such as volume and power. Two buttons currently have no functionality but are designed for tailored features in future SOL:OS versions.` },
      { title: "What kind of processor does the DC-1 have?", category: "Hardware", tags: ["processor", "mediatek", "helio-g99"], source_url: "https://daylightcomputer.com/faq", content: `The Daylight Computer uses a MediaTek Helio G99 chipset: Cortex-A76 cores at 2.2 GHz for performance, and Cortex-A55 cores for energy-efficient tasks and better battery life.` },
      // Repairability
      { title: "Do you have plans for upgradeability or recycling?", category: "Repairability", tags: ["recycling", "upgrade", "sustainability"], source_url: "https://daylightcomputer.com/faq", content: `We do not currently support recycling or upgradeability. It is a top priority to create products with sustainable and recyclable materials and to evolve toward modularity and recycling; we are actively exploring these initiatives.` },
      { title: "Is the battery user-replaceable?", category: "Repairability", tags: ["battery", "replaceable"], source_url: "https://daylightcomputer.com/faq", content: `The battery is not user replaceable. We intend to improve on this in future products.` },
      { title: "Is the screen repairable?", category: "Repairability", tags: ["screen", "repair", "modular"], source_url: "https://daylightcomputer.com/faq", content: `Our computers do not have screen replaceability at the moment, but we are working to modularize this component in new versions.` },
      // Stylus
      { title: "Does the Stylus feature an eraser function?", category: "Stylus", tags: ["stylus", "eraser"], source_url: "https://daylightcomputer.com/faq", content: `Yes. It has a dedicated button that switches the pen from writing to erasing.` },
      { title: "How long will the stylus nibs last?", category: "Stylus", tags: ["stylus", "nibs", "replacement"], source_url: "https://daylightcomputer.com/faq", content: `Tip lifespan depends on usage: constant use may mean a tip lasts about a month; occasional use can allow a tip to last years. We ship replacement stylus tips with the DC-1.` },
      { title: "Does the Stylus support pressure and tilt sensitivity?", category: "Stylus", tags: ["stylus", "pressure", "tilt"], source_url: "https://daylightcomputer.com/faq", content: `Yes. The Daylight Computer supports tilt and pressure sensitivity, but not every app supports it. Use an app that does—for example, Concepts supports both.` },
      // Software - OS
      { title: "What is your stance on open source?", category: "Software", tags: ["open-source", "bootloader", "os"], source_url: "https://daylightcomputer.com/faq", content: `We love open source and plan to make at least part of our OS source-available. We also plan to release bootloader unlock tools so you can use your favorite OS on the DC-1.` },
      { title: "How deeply is Google embedded into your operating system?", category: "Software", tags: ["google", "android", "account"], source_url: "https://daylightcomputer.com/faq", content: `We built our OS on Android 13 but heavily modified it so Google is not deeply embedded. You can optionally set up a Google account; it is not required.` },
      // Software - Specs
      { title: "Is GPS enabled?", category: "Software", tags: ["gps", "location"], source_url: "https://daylightcomputer.com/faq", content: `The Daylight Computer does not come with GPS or location services.` },
      { title: "Can the DC-1 do everything a normal Android tablet can do?", category: "Software", tags: ["android", "apps", "capabilities"], source_url: "https://daylightcomputer.com/faq", content: `Outside of having a webcam and color, the DC-1 can do pretty much anything a standard Android tablet can do. It works with the vast majority of apps including Kindle, Excel, Duolingo, YouTube, WhatsApp, Spotify, and more.` },
      { title: "Does the DC-1 have airplane mode?", category: "Software", tags: ["airplane-mode", "bluetooth", "wifi"], source_url: "https://daylightcomputer.com/faq", content: `Yes. The Daylight Computer has Bluetooth, WiFi, and airplane mode—all can be turned on or off as needed.` },
      // Apps
      { title: "Can I use Obsidian on the DC-1?", category: "Apps", tags: ["obsidian", "apps"], source_url: "https://daylightcomputer.com/faq", content: `Yes. The Obsidian team is working on optimizations for the DC-1 and has themes to make the most of our display.` },
      { title: "How many apps are natively designed for the DC-1?", category: "Apps", tags: ["native", "apps", "pdf-reader"], source_url: "https://daylightcomputer.com/faq", content: `We developed our own best-in-class PDF Reader for the DC-1. More native apps are on the way. There are also apps like Obsidian that have been optimized for our device.` },
      { title: "Does the DC-1 support signing into the Play Store to accept invites to custom apps?", category: "Apps", tags: ["play-store", "google", "invites"], source_url: "https://daylightcomputer.com/faq", content: `Yes. You can sign into the Google Play Store and accept invites.` },
      { title: "What apps does the DC-1 run?", category: "Apps", tags: ["android", "apps"], source_url: "https://daylightcomputer.com/faq", content: `The Daylight Computer runs our modified Android and works with all Android apps, including Kindle, Excel, Duolingo, YouTube, WhatsApp, Spotify, and more.` },
      { title: "Can I draw on the DC-1?", category: "Apps", tags: ["drawing", "apps"], source_url: "https://daylightcomputer.com/faq", content: `Yes. You can use any Android or web app on it, including our built-in drawing app.` },
      { title: "How well do photo apps work on the DC-1?", category: "Apps", tags: ["photo", "grayscale", "display"], source_url: "https://daylightcomputer.com/faq", content: `Thanks to our high refresh rate display, picture-heavy apps work smoothly. The paper-like screen doesn't display colors—you get a focused grayscale experience, ideal for knowledge work.` },
      { title: "Do video calls like Zoom work?", category: "Apps", tags: ["zoom", "video-call", "camera"], source_url: "https://daylightcomputer.com/faq", content: `You can attend Zoom calls, but the DC-1 doesn't have its own camera. Webcams won't automatically be recognized, so you may need workarounds like using your phone as a camera.` },
      { title: "Can I install apps via APK files?", category: "Apps", tags: ["apk", "sideload", "aurora"], source_url: "https://daylightcomputer.com/faq", content: `Yes. You can install apps without the Play Store. We support APK files and alternative app stores like Aurora Store (no Google account required).` },
      // Developers
      { title: "What alternate app stores are you supporting?", category: "Developers", tags: ["app-stores", "aurora", "f-droid"], source_url: "https://daylightcomputer.com/faq", content: `The DC-1 supports all alternative app stores generally supported on Android, such as Aurora Store or F-Droid.` },
      { title: "What IDE and language should I use to develop apps natively for the DC-1?", category: "Developers", tags: ["ide", "android-studio", "kotlin", "flutter"], source_url: "https://daylightcomputer.com/faq", content: `We recommend the standard Android stack: IDE: Android Studio or VS Code (with Android plugins). Native: Jetpack Compose, XML (Kotlin, Java). Non-native: Flutter, React Native, PWA.` },
      { title: "Do you have developer guidelines & documentation?", category: "Developers", tags: ["documentation", "developers"], source_url: "https://daylightcomputer.com/faq", content: `We are building out our developer documentation, including guidance on developing for the DC-1 from technical and philosophical perspectives. Check back or email hello@daylightcomputer.com for specific guidance.` },
      { title: "Are you making the source code of Sol:OS available to the public?", category: "Developers", tags: ["sol-os", "source", "open-source"], source_url: "https://daylightcomputer.com/faq", content: `Sol:OS will likely be source-available: we'll share the source with our community to promote transparency, enable security review, and let developers contribute. There will be some limitations on use/modification. Learn more at daylighthacker.wiki.` },
      { title: "Why can't I connect two Gmail accounts to my DC-1?", category: "Developers", tags: ["gmail", "accounts", "screen-lock"], source_url: "https://daylightcomputer.com/faq", content: `Android requires a screen lock to allow multiple accounts. Reach out to our customer success team if you need help getting set up.` },
      // Kids
      { title: "Does the DC-1 have parental controls?", category: "Kids", tags: ["parental-controls", "kids"], source_url: "https://daylightcomputer.com/faq", content: `At this moment the DC-1 does not have further parental controls beyond what is possible on Android 13. This is a high priority for us as we plan to invest in making Daylight the best option for kids and learning.` },
      // Privacy
      { title: "Can a firewall and VPN be installed?", category: "Privacy", tags: ["vpn", "firewall"], source_url: "https://daylightcomputer.com/faq", content: `Yes. Install your preferred VPN app from the Play Store or alternative app store, or set up a VPN in Settings. Android supports VPNs at the system level. See e.g. RethinkDNS + Firewall on F-Droid.` },
      { title: "Would this be compatible with something more secure, such as GrapheneOS?", category: "Privacy", tags: ["grapheneos", "bootloader", "custom-rom"], source_url: "https://daylightcomputer.com/faq", content: `We're unlocking the bootloader so you can flash custom Android ROMs. GrapheneOS specifically only supports Google Pixel devices at the moment.` },
      { title: "Is the version of Android de-Googled? Does the company collect or share my data?", category: "Privacy", tags: ["privacy", "google", "data"], source_url: "https://daylightcomputer.com/faq", content: `We use a heavily modified Android and have shut off all data collection we are aware of. You do not need to sign up with Google to use the DC-1.` },
      { title: "Is there any tracking in the OS?", category: "Privacy", tags: ["tracking", "analytics"], source_url: "https://daylightcomputer.com/faq", content: `We track basic anonymized usage data to improve our apps and services; it is stored securely. You can choose to disable this.` },
      // Reader App
      { title: "Can I export my highlights from the Reader app?", category: "Reader App", tags: ["reader", "highlights", "export"], source_url: "https://daylightcomputer.com/faq", content: `Not yet; export of highlights is on our roadmap.` },
      { title: "When I upload files onto the Reader app, where are those files stored?", category: "Reader App", tags: ["reader", "storage", "cloud"], source_url: "https://daylightcomputer.com/faq", content: `All files opened in the Reader app are stored locally. A cloud service lets you see uploaded files on other devices (e.g. phone or computer); cloud-stored files are copies of local storage.` },
      { title: "What happens to my cloud-saved Reader app files if I delete files saved locally?", category: "Reader App", tags: ["reader", "cloud", "delete"], source_url: "https://daylightcomputer.com/faq", content: `Cloud storage mirrors local files. If you delete files locally, they will be deleted from the cloud as well.` },
      { title: "Is there a backup for my Reader app files?", category: "Reader App", tags: ["reader", "backup"], source_url: "https://daylightcomputer.com/faq", content: `There is not a backup system yet. Our software team is working on one that will let you delete files locally while keeping them in a backup system.` },
      { title: "Can I bring Kindle books to the Daylight Reader app?", category: "Reader App", tags: ["reader", "kindle", "books"], source_url: "https://daylightcomputer.com/faq", content: `The Reader app does not support Kindle books; they are only accessible through the Kindle app. You can download and log in to the Kindle app on the DC-1 as on any Android device.` },
      // Company
      { title: "What other products do you offer?", category: "Company", tags: ["products", "roadmap", "newsletter"], source_url: "https://daylightcomputer.com/faq", content: `The DC-1 is just the beginning. We're working on a suite of healthier phones, monitors, laptops, and more. Sign up for our newsletter to stay up to date.` },
      { title: "Where is Daylight based?", category: "Company", tags: ["location", "san-francisco"], source_url: "https://daylightcomputer.com/faq", content: `Daylight Computer Co. is based in San Francisco, California.` },
      { title: "Why did you start Daylight Computer Company?", category: "Company", tags: ["about", "founder", "mission"], source_url: "https://daylightcomputer.com/faq", content: `Daylight began with the question: why can't technology work in harmony with our wellbeing? Founder Anjan Katta, living with ADHD, experienced how screens fueled distraction. He spent six years developing technology that adapts to human nature—calm, natural, healthy computing for students, parents, and everyone.` },
      { title: "What are your vision, mission, values?", category: "Company", tags: ["vision", "mission", "values"], source_url: "https://daylightcomputer.com/faq", content: `Our website and Anjan's public letter capture this well. Our public benefit purpose: "To help technology and humanity live happily ever after."` },
      { title: "Who is the CEO of Daylight?", category: "Company", tags: ["ceo", "anjan-katta"], source_url: "https://daylightcomputer.com/faq", content: `Anjan Katta is the CEO.` },
      // Health
      { title: "What does flicker-free mean?", category: "Health", tags: ["flicker", "eyes", "screen"], source_url: "https://daylightcomputer.com/faq", content: `Most screens flash on and off thousands of times per minute. This flickering can strain your eyes. The DC-1 eliminates this, giving your eyes a break from constant mini-strobe effects.` },
      { title: "How does the DC-1 help people who are blue light sensitive?", category: "Health", tags: ["blue-light", "eyes", "sleep"], source_url: "https://daylightcomputer.com/faq", content: `The DC-1 is a great solution for limiting blue light exposure: the screen does not emit blue light at a hardware level. Many people have eye irritation and sleep issues from blue-light sources; our screen avoids that.` },
      { title: "Can't you already remove blue light from your phone or computer?", category: "Health", tags: ["blue-light", "night-mode", "amber"], source_url: "https://daylightcomputer.com/faq", content: `Software filters and "night mode" don't remove all blue light—doing so usually means a very red screen and poor experience. Our amber backlight is 100% blue light free at the hardware level, with a broader spectrum (green, yellow, orange, red) that stays visible at lower intensity. We also use DC-controlled LEDs instead of PWM, so the backlight is flicker-free. Hardware-level approach is more effective than software filters.` },
      { title: "Why is blue light bad?", category: "Health", tags: ["blue-light", "circadian", "sleep", "health"], source_url: "https://daylightcomputer.com/faq", content: `Blue light from screens can disrupt circadian rhythms and suppress melatonin, especially after sunset, leading to poor sleep, fatigue, and long-term health risks. It's also linked to eye strain, headaches, anxiety, and myopia. Reducing blue light exposure (e.g. with amber screens or blue light–blocking tools) supports healthier rhythm and eye health.` },
      { title: "What does blue light-free mean?", category: "Health", tags: ["blue-light-free", "amber", "backlight"], source_url: "https://daylightcomputer.com/faq", content: `Daylight offers a backlight that can be turned off completely for a paperlike experience with no artificial blue light, or adjusted to our signature amber glow, which is also free of blue light.` },
      // Work With Us / Partnerships
      { title: "Are you hiring? Do you have job openings or a careers page?", category: "Company", tags: ["jobs", "careers", "hiring"], source_url: "https://daylightcomputer.com/faq", content: `Job postings and opportunities are on our careers page. We're a small team growing intentionally, so roles may not always be available. We welcome talented people who align with our mission—reach out at hello@daylightcomputer.com.` },
      { title: "Can I collaborate with Daylight?", category: "Partnerships", tags: ["partnership", "collaborate"], source_url: "https://daylightcomputer.com/faq", content: `Email us at hello@daylightcomputer.com and let's talk.` },
      { title: "Can I have an affiliate link?", category: "Partnerships", tags: ["affiliate"], source_url: "https://daylightcomputer.com/faq", content: `Yes. Please visit our registration page. We will confirm your signup and provide resources to help you speak effectively to your audience.` },
      { title: "Can I review a Daylight Computer?", category: "Partnerships", tags: ["review", "press"], source_url: "https://daylightcomputer.com/faq", content: `Email us at hello@daylightcomputer.com and let's talk.` },
    ];

    const allEntries = [...guides, ...faqEntries];
    await supabase.from("knowledge_base").insert(allEntries);
    await supabase.from("knowledge_base").insert([...guides, ...faqPairs]);

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

    return new Response(JSON.stringify({ success: true, guides_seeded: guides.length, faq_seeded: faqEntries.length, real_tickets: 5, synthetic_tickets: 50 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Seed error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
