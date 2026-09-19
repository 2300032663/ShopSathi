import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import { createRoot } from "react-dom/client";

import "./styles.css";

/* =========================================================
   DEMO SHOP DATA
========================================================= */

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Rice",
    category: "Grains",
    quantity: 30,
    unit: "bags",
    minimum: 10,
    maximum: 60,
    expiry: "",
    salesWeek: 5
  },
  {
    id: 2,
    name: "Sugar",
    category: "Groceries",
    quantity: 5,
    unit: "bags",
    minimum: 8,
    maximum: 30,
    expiry: "",
    salesWeek: 8
  },
  {
    id: 3,
    name: "Oil",
    category: "Groceries",
    quantity: 5,
    unit: "bottles",
    minimum: 8,
    maximum: 30,
    expiry: "",
    salesWeek: 20
  },
  {
    id: 4,
    name: "Biscuits",
    category: "Snacks",
    quantity: 80,
    unit: "boxes",
    minimum: 20,
    maximum: 60,
    expiry: "2026-10-09",
    salesWeek: 10
  },
  {
    id: 5,
    name: "Milk Powder",
    category: "Dairy",
    quantity: 15,
    unit: "packs",
    minimum: 8,
    maximum: 30,
    expiry: "2026-09-23",
    salesWeek: 6
  },
  {
    id: 6,
    name: "Dal",
    category: "Pulses",
    quantity: 18,
    unit: "kg",
    minimum: 8,
    maximum: 40,
    expiry: "",
    salesWeek: 4
  },
  {
    id: 7,
    name: "Soap",
    category: "Personal Care",
    quantity: 12,
    unit: "pieces",
    minimum: 10,
    maximum: 40,
    expiry: "",
    salesWeek: 5
  },
  {
    id: 8,
    name: "Tea",
    category: "Beverages",
    quantity: 22,
    unit: "boxes",
    minimum: 10,
    maximum: 40,
    expiry: "",
    salesWeek: 4
  }
];

const INITIAL_DELIVERIES = [
  {
    id: 1,
    supplier: "Ravi",
    product: "Rice",
    quantity: 20,
    unit: "bags",
    expected: "2026-09-20",
    status: "Pending"
  },
  {
    id: 2,
    supplier: "Kumar",
    product: "Oil",
    quantity: 15,
    unit: "bottles",
    expected: "2026-09-22",
    status: "Pending"
  }
];

const INITIAL_ACTIONS = [
  {
    id: 1,
    time: "Today, 10:20 AM",
    type: "Inventory",
    description: "Rice stock checked",
    confidence: 96,
    status: "Completed"
  },
  {
    id: 2,
    time: "Today, 09:45 AM",
    type: "Recommendation",
    description:
      "Oil reorder recommendation viewed",
    confidence: 92,
    status: "Viewed"
  }
];

/* =========================================================
   LANGUAGE CONFIGURATION

   IMPORTANT:
   These are only UI labels.

   AI RESPONSES ARE NOT HARD-CODED.
   The AI response comes from the backend.
========================================================= */

const LANGUAGES = {
  English: {
    code: "en-IN",
    aiCode: "en",

    hello: "Good afternoon",
    shopkeeper: "Shopkeeper",

    talk: "Talk to Assistant",
    startVoice: "Start Voice Input",
    listening: "Listening...",
    tapSpeak: "Tap and speak",
    typeMessage: "or type your message",
    understand: "Understand Message",

    detected: "Detected language",
    confirmation: "Confirmation required",
    confirmationText:
      "Nothing is changed until you confirm these actions.",

    confirm: "Confirm Actions",
    cancel: "Cancel",

    dashboard: "Dashboard",
    voiceAssistant: "Voice Assistant",
    inventory: "Inventory",
    alerts: "Alerts",
    recommendations: "AI Recommendations",
    askAssistant: "Ask Assistant",
    history: "Action History",
    settings: "Settings",

    shopOpen: "SHOP OPEN",
    totalProducts: "Total Products",
    lowCritical: "Low / Critical",
    excessStock: "Excess Stock",
    expiringSoon: "Expiring Soon",

    recentAlerts: "Recent Alerts",
    viewAll: "View all",
    noAlerts: "No alerts right now.",

    yourShop: "Your shop at a glance",
    manageInventory: "Manage Inventory",
    addStockVoice: "Add Stock by Voice",
    askYourShop: "Ask Your Shop",
    seeRecommendations: "See Recommendations",

    aiUnderstanding: "AI Understanding",
    reviewBefore:
      "Review before any shop data is changed",

    extractedActions:
      "Your extracted actions will appear here.",

    howWorks: "How this works",
    conversation: "Conversation",
    understanding: "Understanding",
    validation: "Validation",
    shopData: "Shop Data",

    inventoryDescription:
      "Identify product, quantity, supplier and intent.",

    validationDescription:
      "Show extracted actions and confidence before changing data.",

    shopDataDescription:
      "Apply only after confirmation.",

    conversationDescription:
      "Speak naturally in your preferred language.",

    searchProduct: "Search product...",
    addProduct: "Add Product",
    product: "Product",
    category: "Category",
    stock: "Stock",
    minimum: "Minimum",
    expiry: "Expiry",
    status: "Status",
    quickUpdate: "Quick update",

    pendingDeliveries: "Pending Deliveries",
    expected: "Expected",

    reviewInventory: "Review inventory",

    askShopTitle: "Ask Your Shop",
    askShopDescription:
      "Ask questions about stock, expiry, sales or deliveries.",

    ask: "Ask",
    readAloud: "Read aloud",

    languageVoice: "Language & Voice",
    preferredLanguage: "Preferred language",

    languageDescription:
      "Voice input uses the browser Speech Recognition API. AI response speech uses the browser Speech Synthesis API.",

    demoData: "Demo Data",
    backendIntegration: "Backend Integration",

    resetDemo: "Reset demo data",
    restoreDemo: "Restore demo data",

    productName: "Product name",
    quantity: "Quantity",
    unit: "Unit",
    minimumStock: "Minimum stock",
    maximumStock: "Maximum stock",
    expiryDate: "Expiry date",
    weeklySales: "Weekly sales",

    completed: "Completed",
    confidence: "Confidence",

    productAdded: "Product added.",
    actionsCancelled: "Actions cancelled.",
    demoRestored: "Demo data restored.",

    noActions:
      "There are no AI actions to confirm.",

    noPendingDeliveries:
      "No pending deliveries.",

    noCategory:
      "Nothing in this category.",

    criticalStock: "Critical Stock",
    lowStock: "Low Stock",
    excess: "Excess Stock",

    pending: "Pending",

    aiRecommendationDescription:
      "Recommendations are based on current stock, weekly sales, expiry dates and pending deliveries."
  },

  Telugu: {
    code: "te-IN",
    aiCode: "te",

    hello: "నమస్కారం",
    shopkeeper: "దుకాణదారు",

    talk: "అసిస్టెంట్‌తో మాట్లాడండి",
    startVoice: "వాయిస్ ఇన్‌పుట్ ప్రారంభించండి",
    listening: "వింటున్నాను...",
    tapSpeak: "మాట్లాడటానికి నొక్కండి",
    typeMessage:
      "లేదా మీ సందేశాన్ని టైప్ చేయండి",
    understand: "సందేశాన్ని అర్థం చేసుకోండి",

    detected: "గుర్తించిన భాష",
    confirmation: "నిర్ధారణ అవసరం",
    confirmationText:
      "మీరు నిర్ధారించే వరకు షాప్ డేటాలో ఎటువంటి మార్పు జరగదు.",

    confirm: "చర్యలను నిర్ధారించండి",
    cancel: "రద్దు చేయండి",

    dashboard: "డాష్‌బోర్డ్",
    voiceAssistant: "వాయిస్ అసిస్టెంట్",
    inventory: "ఇన్వెంటరీ",
    alerts: "హెచ్చరికలు",
    recommendations: "AI సిఫార్సులు",
    askAssistant: "అసిస్టెంట్‌ను అడగండి",
    history: "చర్యల చరిత్ర",
    settings: "సెట్టింగ్స్",

    shopOpen: "షాప్ తెరిచి ఉంది",
    totalProducts: "మొత్తం ఉత్పత్తులు",
    lowCritical: "తక్కువ / అత్యవసరం",
    excessStock: "అధిక స్టాక్",
    expiringSoon: "త్వరలో గడువు ముగిసేవి",

    recentAlerts: "ఇటీవలి హెచ్చరికలు",
    viewAll: "అన్నీ చూడండి",
    noAlerts:
      "ప్రస్తుతం ఎటువంటి హెచ్చరికలు లేవు.",

    yourShop: "మీ షాప్ సమాచారం",
    manageInventory: "ఇన్వెంటరీ నిర్వహించండి",
    addStockVoice: "వాయిస్‌తో స్టాక్ జోడించండి",
    askYourShop: "మీ షాప్‌ను అడగండి",
    seeRecommendations: "సిఫార్సులు చూడండి",

    aiUnderstanding: "AI అర్థం చేసుకున్నది",
    reviewBefore:
      "షాప్ డేటాను మార్చే ముందు పరిశీలించండి",

    extractedActions:
      "AI గుర్తించిన చర్యలు ఇక్కడ కనిపిస్తాయి.",

    howWorks: "ఇది ఎలా పనిచేస్తుంది",
    conversation: "సంభాషణ",
    understanding: "అర్థం చేసుకోవడం",
    validation: "ధృవీకరణ",
    shopData: "షాప్ డేటా",

    conversationDescription:
      "మీకు ఇష్టమైన భాషలో సహజంగా మాట్లాడండి.",

    inventoryDescription:
      "ఉత్పత్తి, పరిమాణం, సరఫరాదారు మరియు ఉద్దేశ్యాన్ని గుర్తిస్తుంది.",

    validationDescription:
      "డేటా మార్చే ముందు గుర్తించిన చర్యలు మరియు నమ్మక స్థాయిని చూపిస్తుంది.",

    shopDataDescription:
      "నిర్ధారణ తర్వాత మాత్రమే వర్తింపజేస్తుంది.",

    searchProduct: "ఉత్పత్తిని వెతకండి...",
    addProduct: "ఉత్పత్తిని జోడించండి",
    product: "ఉత్పత్తి",
    category: "వర్గం",
    stock: "స్టాక్",
    minimum: "కనిష్టం",
    expiry: "గడువు",
    status: "స్థితి",
    quickUpdate: "త్వరిత నవీకరణ",

    pendingDeliveries:
      "పెండింగ్ డెలివరీలు",
    expected: "అంచనా",

    reviewInventory:
      "ఇన్వెంటరీని పరిశీలించండి",

    askShopTitle: "మీ షాప్‌ను అడగండి",
    askShopDescription:
      "స్టాక్, గడువు, అమ్మకాలు లేదా డెలివరీల గురించి అడగండి.",

    ask: "అడగండి",
    readAloud: "చదివి వినిపించండి",

    languageVoice: "భాష & వాయిస్",
    preferredLanguage: "ఇష్టమైన భాష",

    languageDescription:
      "వాయిస్ ఇన్‌పుట్ కోసం బ్రౌజర్ Speech Recognition API మరియు AI స్పందన కోసం Speech Synthesis API ఉపయోగించబడుతుంది.",

    demoData: "డెమో డేటా",
    backendIntegration: "బ్యాక్‌ఎండ్ ఇంటిగ్రేషన్",

    resetDemo: "డెమో డేటాను రీసెట్ చేయండి",
    restoreDemo: "డెమో డేటాను పునరుద్ధరించండి",

    productName: "ఉత్పత్తి పేరు",
    quantity: "పరిమాణం",
    unit: "యూనిట్",
    minimumStock: "కనిష్ట స్టాక్",
    maximumStock: "గరిష్ట స్టాక్",
    expiryDate: "గడువు తేదీ",
    weeklySales: "వారపు అమ్మకాలు",

    completed: "పూర్తయింది",
    confidence: "నమ్మక స్థాయి",

    productAdded: "ఉత్పత్తి జోడించబడింది.",
    actionsCancelled: "చర్యలు రద్దు చేయబడ్డాయి.",
    demoRestored:
      "డెమో డేటా పునరుద్ధరించబడింది.",

    noActions:
      "నిర్ధారించడానికి AI చర్యలు లేవు.",

    noPendingDeliveries:
      "పెండింగ్ డెలివరీలు లేవు.",

    noCategory:
      "ఈ విభాగంలో ఏమీ లేదు.",

    criticalStock: "అత్యవసర స్టాక్",
    lowStock: "తక్కువ స్టాక్",
    excess: "అధిక స్టాక్",

    pending: "పెండింగ్",

    aiRecommendationDescription:
      "ప్రస్తుత స్టాక్, వారపు అమ్మకాలు, గడువు తేదీలు మరియు పెండింగ్ డెలివరీల ఆధారంగా సిఫార్సులు ఇవ్వబడతాయి."
  },

  Hindi: {
    code: "hi-IN",
    aiCode: "hi",

    hello: "नमस्ते",
    shopkeeper: "दुकानदार",

    talk: "असिस्टेंट से बात करें",
    startVoice: "वॉइस इनपुट शुरू करें",
    listening: "सुन रहा हूँ...",
    tapSpeak: "बोलने के लिए दबाएँ",
    typeMessage:
      "या अपना संदेश टाइप करें",
    understand: "संदेश समझें",

    detected: "पहचानी गई भाषा",
    confirmation: "पुष्टि आवश्यक है",
    confirmationText:
      "आपकी पुष्टि होने तक दुकान के डेटा में कोई बदलाव नहीं होगा।",

    confirm: "कार्रवाई की पुष्टि करें",
    cancel: "रद्द करें",

    dashboard: "डैशबोर्ड",
    voiceAssistant: "वॉइस असिस्टेंट",
    inventory: "इन्वेंटरी",
    alerts: "अलर्ट",
    recommendations: "AI सुझाव",
    askAssistant: "असिस्टेंट से पूछें",
    history: "कार्रवाई का इतिहास",
    settings: "सेटिंग्स",

    shopOpen: "दुकान खुली है",
    totalProducts: "कुल उत्पाद",
    lowCritical: "कम / गंभीर",
    excessStock: "अधिक स्टॉक",
    expiringSoon: "जल्द समाप्त होने वाले",

    recentAlerts: "हाल के अलर्ट",
    viewAll: "सभी देखें",
    noAlerts:
      "अभी कोई अलर्ट नहीं है।",

    yourShop: "आपकी दुकान की जानकारी",
    manageInventory: "इन्वेंटरी प्रबंधित करें",
    addStockVoice: "वॉइस से स्टॉक जोड़ें",
    askYourShop: "अपनी दुकान से पूछें",
    seeRecommendations: "सुझाव देखें",

    aiUnderstanding: "AI की समझ",
    reviewBefore:
      "दुकान का डेटा बदलने से पहले जाँच करें",

    extractedActions:
      "AI द्वारा पहचानी गई कार्रवाइयाँ यहाँ दिखाई देंगी।",

    howWorks: "यह कैसे काम करता है",
    conversation: "बातचीत",
    understanding: "समझ",
    validation: "सत्यापन",
    shopData: "दुकान डेटा",

    conversationDescription:
      "अपनी पसंदीदा भाषा में स्वाभाविक रूप से बोलें।",

    inventoryDescription:
      "उत्पाद, मात्रा, सप्लायर और उद्देश्य की पहचान करता है।",

    validationDescription:
      "डेटा बदलने से पहले पहचानी गई कार्रवाइयाँ और भरोसे का स्तर दिखाता है।",

    shopDataDescription:
      "पुष्टि के बाद ही लागू करता है।",

    searchProduct: "उत्पाद खोजें...",
    addProduct: "उत्पाद जोड़ें",
    product: "उत्पाद",
    category: "श्रेणी",
    stock: "स्टॉक",
    minimum: "न्यूनतम",
    expiry: "समाप्ति",
    status: "स्थिति",
    quickUpdate: "त्वरित अपडेट",

    pendingDeliveries:
      "लंबित डिलीवरी",
    expected: "अपेक्षित",

    reviewInventory:
      "इन्वेंटरी की समीक्षा करें",

    askShopTitle: "अपनी दुकान से पूछें",
    askShopDescription:
      "स्टॉक, समाप्ति, बिक्री या डिलीवरी के बारे में पूछें।",

    ask: "पूछें",
    readAloud: "ज़ोर से पढ़ें",

    languageVoice: "भाषा और वॉइस",
    preferredLanguage: "पसंदीदा भाषा",

    languageDescription:
      "वॉइस इनपुट के लिए ब्राउज़र Speech Recognition API और AI प्रतिक्रिया के लिए Speech Synthesis API का उपयोग किया जाता है।",

    demoData: "डेमो डेटा",
    backendIntegration: "बैकएंड इंटीग्रेशन",

    resetDemo: "डेमो डेटा रीसेट करें",
    restoreDemo: "डेमो डेटा पुनर्स्थापित करें",

    productName: "उत्पाद का नाम",
    quantity: "मात्रा",
    unit: "इकाई",
    minimumStock: "न्यूनतम स्टॉक",
    maximumStock: "अधिकतम स्टॉक",
    expiryDate: "समाप्ति तिथि",
    weeklySales: "साप्ताहिक बिक्री",

    completed: "पूरा हुआ",
    confidence: "विश्वास स्तर",

    productAdded: "उत्पाद जोड़ा गया।",
    actionsCancelled: "कार्रवाई रद्द की गई।",
    demoRestored:
      "डेमो डेटा पुनर्स्थापित किया गया।",

    noActions:
      "पुष्टि करने के लिए कोई AI कार्रवाई नहीं है।",

    noPendingDeliveries:
      "कोई लंबित डिलीवरी नहीं है।",

    noCategory:
      "इस श्रेणी में कुछ नहीं है।",

    criticalStock: "गंभीर स्टॉक",
    lowStock: "कम स्टॉक",
    excess: "अधिक स्टॉक",

    pending: "लंबित",

    aiRecommendationDescription:
      "सुझाव वर्तमान स्टॉक, साप्ताहिक बिक्री, समाप्ति तिथियों और लंबित डिलीवरी के आधार पर दिए जाते हैं।"
  }
};

/* =========================================================
   PAGE LABELS
========================================================= */

const PAGE_LABELS = {
  English: {
    Dashboard: "Dashboard",
    "Voice Assistant": "Voice Assistant",
    Inventory: "Inventory",
    Alerts: "Alerts",
    "AI Recommendations":
      "AI Recommendations",
    "Ask Assistant": "Ask Assistant",
    "Action History": "Action History",
    Settings: "Settings"
  },

  Telugu: {
    Dashboard: "డాష్‌బోర్డ్",
    "Voice Assistant": "వాయిస్ అసిస్టెంట్",
    Inventory: "ఇన్వెంటరీ",
    Alerts: "హెచ్చరికలు",
    "AI Recommendations":
      "AI సిఫార్సులు",
    "Ask Assistant":
      "అసిస్టెంట్‌ను అడగండి",
    "Action History":
      "చర్యల చరిత్ర",
    Settings: "సెట్టింగ్స్"
  },

  Hindi: {
    Dashboard: "डैशबोर्ड",
    "Voice Assistant":
      "वॉइस असिस्टेंट",
    Inventory: "इन्वेंटरी",
    Alerts: "अलर्ट",
    "AI Recommendations":
      "AI सुझाव",
    "Ask Assistant":
      "असिस्टेंट से पूछें",
    "Action History":
      "कार्रवाई का इतिहास",
    Settings: "सेटिंग्स"
  }
};

const NAV_ITEMS = [
  {
    key: "Dashboard",
    icon: "▦"
  },
  {
    key: "Voice Assistant",
    icon: "🎙️"
  },
  {
    key: "Inventory",
    icon: "📦"
  },
  {
    key: "Alerts",
    icon: "🔔"
  },
  {
    key: "AI Recommendations",
    icon: "✨"
  },
  {
    key: "Ask Assistant",
    icon: "💬"
  },
  {
    key: "Action History",
    icon: "🕘"
  },
  {
    key: "Settings",
    icon: "⚙️"
  }
];

/* =========================================================
   LOCAL STORAGE
========================================================= */

function useStored(
  key,
  initialValue
) {
  const [value, setValue] =
    useState(() => {
      try {
        const stored =
          localStorage.getItem(key);

        if (stored) {
          return JSON.parse(stored);
        }

        return initialValue;
      } catch {
        return initialValue;
      }
    });

  useEffect(() => {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [key, value]);

  return [
    value,
    setValue
  ];
}

/* =========================================================
   DATE / STATUS HELPERS
========================================================= */

function daysUntil(dateString) {
  if (!dateString) {
    return null;
  }

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const expiry =
    new Date(
      dateString +
        "T00:00:00"
    );

  return Math.ceil(
    (expiry - today) /
      86400000
  );
}

function statusOf(product) {
  const days =
    daysUntil(
      product.expiry
    );

  if (
    days !== null &&
    days <= 7
  ) {
    return "Expiring Soon";
  }

  if (
    product.quantity <=
    Math.max(
      1,
      Math.floor(
        product.minimum / 2
      )
    )
  ) {
    return "Critical";
  }

  if (
    product.quantity <
    product.minimum
  ) {
    return "Low";
  }

  if (
    product.quantity >
    product.maximum
  ) {
    return "Excess";
  }

  return "Normal";
}

function alertsCount(products) {
  return products.filter(
    product =>
      statusOf(product) !==
      "Normal"
  ).length;
}

/* =========================================================
   LOCAL DEMO PARSER
========================================================= */

function parseSentence(
  text,
  products
) {
  const lower =
    text.toLowerCase();

  const actions = [];

  const rice =
    products.find(
      p =>
        p.name
          .toLowerCase() ===
        "rice"
    );

  const oil =
    products.find(
      p =>
        p.name
          .toLowerCase() ===
        "oil"
    );

  const sugar =
    products.find(
      p =>
        p.name
          .toLowerCase() ===
        "sugar"
    );

  const deliveryMatch =
    lower.match(
      /(?:ravi|రవి).*?(\d+)\s*(?:rice|బియ్యం|bags?|బ్యాగ్)/i
    ) ||
    lower.match(
      /(\d+)\s*(?:rice|బియ్యం|bags?)/i
    );

  const reserveMatch =
    lower.match(
      /(?:reserve|reserved|kosam|కోసం).*?(\d+)\s*(?:bags?|bag|బ్యాగ్)/i
    );

  const oilMatch =
    lower.match(
      /(\d+)\s*(?:oil|bottles?|బాటిల్స్?)/i
    );

  const sugarMatch =
    lower.match(
      /(\d+)\s*(?:sugar|bags?|బస్తాలు)/i
    );

  if (
    deliveryMatch &&
    rice
  ) {
    const quantity =
      Number(
        deliveryMatch[1]
      );

    actions.push({
      id:
        crypto.randomUUID(),

      type:
        "Delivery Received",

      subject: "Rice",

      detail:
        `Add ${quantity} ${rice.unit} of Rice from Ravi`,

      delta: quantity,

      productId: rice.id,

      confidence: 96
    });
  }

  if (
    reserveMatch &&
    rice
  ) {
    const quantity =
      Number(
        reserveMatch[1]
      );

    actions.push({
      id:
        crypto.randomUUID(),

      type:
        "Reservation",

      subject: "Rice",

      detail:
        `Reserve ${quantity} ${rice.unit} for Ramesh`,

      delta:
        -quantity,

      productId: rice.id,

      confidence: 93
    });
  }

  if (
    !actions.length &&
    oilMatch &&
    oil
  ) {
    const quantity =
      Number(
        oilMatch[1]
      );

    actions.push({
      id:
        crypto.randomUUID(),

      type:
        "Stock In",

      subject: "Oil",

      detail:
        `Add ${quantity} bottles of Oil`,

      delta: quantity,

      productId: oil.id,

      confidence: 91
    });
  }

  if (
    !actions.length &&
    sugarMatch &&
    sugar
  ) {
    const quantity =
      Number(
        sugarMatch[1]
      );

    actions.push({
      id:
        crypto.randomUUID(),

      type:
        "Stock In",

      subject: "Sugar",

      detail:
        `Add ${quantity} bags of Sugar`,

      delta: quantity,

      productId: sugar.id,

      confidence: 90
    });
  }

  if (!actions.length) {
    return [
      {
        id:
          crypto.randomUUID(),

        type:
          "Needs clarification",

        subject: "Shop",

        detail:
          "I could not confidently identify a product and quantity.",

        delta: 0,

        productId: null,

        confidence: 62
      }
    ];
  }

  return actions;
}

/* =========================================================
   ASK SHOP - LOCAL FALLBACK
========================================================= */

function answerQuestion(
  question,
  products,
  deliveries,
  language
) {
  const q =
    question.toLowerCase();

  const oil =
    products.find(
      p =>
        p.name === "Oil"
    );

  const low =
    products.filter(
      p =>
        [
          "Low",
          "Critical"
        ].includes(
          statusOf(p)
        )
    );

  const expiring =
    products.filter(
      p =>
        statusOf(p) ===
        "Expiring Soon"
    );

  if (
    q.includes("oil")
  ) {
    return `Oil has ${
      oil?.quantity ?? 0
    } bottles in stock and average weekly sales are ${
      oil?.salesWeek ?? 0
    } bottles. It is below the minimum level of ${
      oil?.minimum ?? 0
    }, so a purchase of about 15–20 bottles would restore a safer stock level.`;
  }

  if (
    q.includes("low") ||
    q.includes("stock") ||
    q.includes("worry")
  ) {
    return `Today you should check ${
      low
        .map(
          p =>
            `${p.name} (${p.quantity} ${p.unit})`
        )
        .join(", ") ||
      "no low-stock items"
    }. ${
      expiring.length
        ? `Also prioritize ${
            expiring
              .map(
                p => p.name
              )
              .join(", ")
          } because of expiry.`
        : ""
    }`;
  }

  if (
    q.includes("expire")
  ) {
    if (
      expiring.length
    ) {
      return expiring
        .map(
          p =>
            `${p.name} expires in ${daysUntil(
              p.expiry
            )} day(s).`
        )
        .join(" ");
    }

    return "There are no products expiring within the next 7 days.";
  }

  if (
    q.includes("delivery")
  ) {
    const pending =
      deliveries.filter(
        d =>
          d.status ===
          "Pending"
      );

    if (
      pending.length
    ) {
      return pending
        .map(
          d =>
            `${d.supplier} has ${d.quantity} ${d.unit} of ${d.product} pending.`
        )
        .join(" ");
    }

    return "There are no pending deliveries.";
  }

  return "I can answer questions about your shop.";
}

/* =========================================================
   RECOMMENDATIONS
========================================================= */

function recommendations(
  products,
  deliveries
) {
  const result = [];

  const oil =
    products.find(
      p =>
        p.name === "Oil"
    );

  const biscuits =
    products.find(
      p =>
        p.name ===
        "Biscuits"
    );

  const milk =
    products.find(
      p =>
        p.name ===
        "Milk Powder"
    );

  if (
    oil &&
    oil.quantity <
      oil.minimum
  ) {
    result.push({
      title:
        "Oil stock is low",

      body:
        `Current stock is ${oil.quantity} bottles vs minimum ${oil.minimum}. Suggested purchase: 15–20 bottles.`,

      tag: "Purchase"
    });
  }

  if (
    biscuits &&
    biscuits.quantity >
      biscuits.maximum
  ) {
    result.push({
      title:
        "Biscuits have excess stock",

      body:
        `${biscuits.quantity} boxes are available. Consider reducing the next purchase.`,

      tag:
        "Reduce purchase"
    });
  }

  if (
    milk &&
    daysUntil(
      milk.expiry
    ) !== null &&
    daysUntil(
      milk.expiry
    ) <= 7
  ) {
    result.push({
      title:
        "Milk Powder expires soon",

      body:
        `Only ${daysUntil(
          milk.expiry
        )} day(s) remain. Prioritize existing stock in sales.`,

      tag: "Expiry"
    });
  }

  const pending =
    deliveries.filter(
      d =>
        d.status ===
        "Pending"
    );

  if (
    pending.length
  ) {
    result.push({
      title:
        "Pending supplier delivery",

      body:
        pending
          .map(
            d =>
              `${d.supplier}: ${d.quantity} ${d.unit} ${d.product}`
          )
          .join(" • "),

      tag: "Supplier"
    });
  }

  return result;
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  const [
    detectedLanguage,
    setDetectedLanguage
  ] = useState("en");

  const [
    languageScores,
    setLanguageScores
  ] = useState({});

  const [
    aiResponse,
    setAiResponse
  ] = useState("");

  const [
    page,
    setPage
  ] = useState(
    "Dashboard"
  );

  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  const [
    deliveries,
    setDeliveries
  ] = useStored(
    "shopsathi_deliveries",
    INITIAL_DELIVERIES
  );

  const [
    actions,
    setActions
  ] = useStored(
    "shopsathi_actions",
    INITIAL_ACTIONS
  );

  const [
    language,
    setLanguage
  ] = useStored(
    "shopsathi_language",
    "English"
  );

  const [
    query,
    setQuery
  ] = useState("");

  const [
    assistantText,
    setAssistantText
  ] = useState("");

  const [
    parsed,
    setParsed
  ] = useState([]);

  const [
    backendActions,
    setBackendActions
  ] = useState([]);

  const [
    listening,
    setListening
  ] = useState(false);

  const [
    toast,
    setToast
  ] = useState("");

  const [
    showAdd,
    setShowAdd
  ] = useState(false);

  const [
    newProduct,
    setNewProduct
  ] = useState({
    name: "",
    category: "Groceries",
    quantity: 0,
    unit: "pieces",
    minimum: 5,
    maximum: 50,
    expiry: "",
    salesWeek: 0
  });

  const [
    ask,
    setAsk
  ] = useState("");

  const [
    answer,
    setAnswer
  ] = useState("");

  /* =======================================================
     CURRENT LANGUAGE
  ======================================================= */

  const t =
    LANGUAGES[
      language
    ] || LANGUAGES.English;

  /* =======================================================
     FILTERED PRODUCTS
  ======================================================= */

  const filteredProducts =
    useMemo(
      () =>
        products.filter(
          p =>
            p.name
              .toLowerCase()
              .includes(
                query.toLowerCase()
              )
        ),
      [
        products,
        query
      ]
    );

  const lowCount =
    products.filter(
      p =>
        [
          "Low",
          "Critical"
        ].includes(
          statusOf(p)
        )
    ).length;

  const excessCount =
    products.filter(
      p =>
        statusOf(p) ===
        "Excess"
    ).length;

  const expiryCount =
    products.filter(
      p =>
        statusOf(p) ===
        "Expiring Soon"
    ).length;

  const recs =
    recommendations(
      products,
      deliveries
    );

  /* =======================================================
     NOTIFICATION
  ======================================================= */

  function notify(message) {
    setToast(message);

    setTimeout(
      () =>
        setToast(""),
      2800
    );
  }

  /* =======================================================
     ACTION HISTORY
  ======================================================= */

  function addAction(
    type,
    description,
    confidence = 100,
    status = "Completed"
  ) {
    setActions(
      previous => [
        {
          id: Date.now(),

          time:
            new Date().toLocaleString(
              "en-IN",
              {
                dateStyle:
                  "medium",
                timeStyle:
                  "short"
              }
            ),

          type,

          description,

          confidence,

          status
        },

        ...previous
      ]
    );
  }

  
  /* =======================================================
     AI SPEECH

     IMPORTANT:
     The language is selected from the AI's detected
     language, not from hard-coded response text.
  ======================================================= */

  function speakResponse(
    text,
    lang
  ) {
    if (!text) {
      console.log(
        "No AI response to speak"
      );
      return;
    }

    if (
      !(
        "speechSynthesis" in
        window
      )
    ) {
      console.error(
        "Speech synthesis is not supported."
      );
      return;
    }

    const languageMap = {
      en: "en-IN",
      te: "te-IN",
      hi: "hi-IN"
    };

    const langCode =
      languageMap[
        lang
      ] ||
      t.code ||
      "en-IN";

    const speakNow =
      () => {
        window.speechSynthesis.cancel();

        const utterance =
          new SpeechSynthesisUtterance(
            text
          );

        utterance.lang =
          langCode;

        utterance.rate =
          0.9;

        utterance.pitch =
          1;

        utterance.volume =
          1;

        const voices =
          window.speechSynthesis.getVoices();

        let voice =
          voices.find(
            v =>
              v.lang &&
              v.lang.toLowerCase() ===
                langCode.toLowerCase()
          );

        if (!voice) {
          voice =
            voices.find(
              v =>
                v.lang &&
                v.lang
                  .toLowerCase()
                  .startsWith(
                    langCode
                      .split(
                        "-"
                      )[0]
                      .toLowerCase()
                  )
            );
        }

        if (voice) {
          utterance.voice =
            voice;

          console.log(
            "Using voice:",
            voice.name,
            voice.lang
          );
        } else {
          console.warn(
            "No matching voice found for:",
            langCode
          );
        }

        utterance.onstart =
          () => {
            console.log(
              "AI SPEECH STARTED:",
              langCode
            );
          };

        utterance.onend =
          () => {
            console.log(
              "AI SPEECH FINISHED"
            );
          };

        utterance.onerror =
          event => {
            console.error(
              "AI SPEECH ERROR:",
              event.error
            );
          };

        window.speechSynthesis.speak(
          utterance
        );
      };

    const voices =
      window.speechSynthesis.getVoices();

    if (
      voices.length > 0
    ) {
      speakNow();
    } else {
      window.speechSynthesis.onvoiceschanged =
        () => {
          speakNow();

          window.speechSynthesis.onvoiceschanged =
            null;
        };
    }
  }

  /* =======================================================
     UNDERSTAND MESSAGE
  ======================================================= */

  async function understandMessage() {
    if (
      !assistantText.trim()
    ) {
      notify(
        language ===
          "Telugu"
          ? "దయచేసి ముందుగా సందేశాన్ని టైప్ చేయండి."
          : language ===
            "Hindi"
          ? "कृपया पहले संदेश टाइप करें।"
          : "Please type a message first."
      );

      return;
    }

    try {
      const response =
        await fetch(
          "http://127.0.0.1:8000/api/parse-action",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                text:
                  assistantText,

                /*
                 IMPORTANT:
                 Send the selected language to the backend.
                */
                language:
                  t.aiCode
              })
          }
        );

      if (!response.ok) {
        throw new Error(
          "AI parser failed"
        );
      }

      const data =
        await response.json();

      console.log(
        "AI RESPONSE:",
        data
      );

      /* -----------------------------
         BACKEND ACTIONS
      ----------------------------- */

      setBackendActions(
        data.actions || []
      );

      /* -----------------------------
         DETECTED LANGUAGE
      ----------------------------- */

      const selectedLanguage =
        data.detected_language ||
        t.aiCode ||
        "en";

      setDetectedLanguage(
        selectedLanguage
      );

      /* -----------------------------
         LANGUAGE SCORES
      ----------------------------- */

      setLanguageScores(
        data.language_scores ||
          {}
      );

      /* -----------------------------
         AI RESPONSE

         This is completely dynamic.
         Nothing is hard-coded here.
      ----------------------------- */

      const aiText =
        data.response ||
        data.message ||
        "";

      if (!aiText) {
        throw new Error(
          "Backend returned no AI response"
        );
      }

      setAiResponse(
        aiText
      );

      /* -----------------------------
         SPEAK AI RESPONSE
      ----------------------------- */

      speakResponse(
        aiText,
        selectedLanguage
      );

      /* -----------------------------
         CONVERT BACKEND ACTIONS
      ----------------------------- */

      const frontendActions =
        (
          data.actions ||
          []
        ).map(
          (
            action,
            index
          ) => ({
            id:
              `${Date.now()}-${index}`,

            type:
              action.action_type ===
              "delivery_received"
                ? "Delivery Received"
                : action.action_type ===
                  "reservation"
                ? "Reservation"
                : action.action_type,

            subject:
              action.product ||
              "Shop",

            detail:
              action.description ||
              "Action detected",

            delta:
              action.stock_delta ||
              0,

            productId:
              null,

            confidence:
              Math.round(
                (
                  action.confidence ||
                  0
                ) * 100
              )
          })
        );

      setParsed(
        frontendActions
      );
    } catch (error) {
      console.error(
        "UNDERSTAND MESSAGE ERROR:",
        error
      );

      notify(
        language ===
          "Telugu"
          ? "AI బ్యాక్‌ఎండ్‌కు కనెక్ట్ కాలేకపోయాము."
          : language ===
            "Hindi"
          ? "AI बैकएंड से कनेक्ट नहीं हो सका।"
          : "Could not connect to AI backend. Make sure FastAPI is running."
      );
    }
  }

  /* =======================================================
     CONFIRM BACKEND ACTIONS
  ======================================================= */

  async function applyParsed() {
    if (
      !backendActions.length
    ) {
      notify(
        t.noActions
      );

      return;
    }

    try {
      const response =
        await fetch(
          "http://127.0.0.1:8000/api/actions/confirm",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                actions:
                  backendActions,

                original_text:
                  assistantText,

                language:
                  detectedLanguage
              })
          }
        );

      if (!response.ok) {
        throw new Error(
          "Failed to confirm actions"
        );
      }

      const data =
        await response.json();

      console.log(
        "CONFIRM RESPONSE:",
        data
      );

      /* -----------------------------
         REFRESH PRODUCTS
      ----------------------------- */

      const productsResponse =
        await fetch(
          "http://127.0.0.1:8000/api/products/"
        );

      if (
        productsResponse.ok
      ) {
        const backendProducts =
          await productsResponse.json();

        setProducts(
          backendProducts.map(
            product => ({
              id:
                product.id,

              name:
                product.name,

              category:
                product.category ||
                "Groceries",

              quantity:
                product.stock,

              unit:
                product.unit,

              minimum:
                product.reorder_level,

              maximum:
                product.max_level,

              expiry:
                product.expiry_date ||
                "",

              salesWeek: 0
            })
          )
        );
      }

      /* -----------------------------
         ADD HISTORY
      ----------------------------- */

      parsed.forEach(
        action => {
          addAction(
            action.type,
            action.detail,
            action.confidence,
            "Completed"
          );
        }
      );

      setParsed([]);

      setBackendActions([]);

      notify(
        data.message ||
          (
            language ===
            "Telugu"
              ? "చర్యలు విజయవంతంగా నిర్ధారించబడ్డాయి."
              : language ===
                "Hindi"
              ? "कार्रवाइयों की सफलतापूर्वक पुष्टि की गई।"
              : "Confirmed. Shop data updated successfully."
          )
      );
    } catch (error) {
      console.error(
        "CONFIRM ACTION ERROR:",
        error
      );

      notify(
        language ===
          "Telugu"
          ? "చర్యలను నిర్ధారించలేకపోయాము."
          : language ===
            "Hindi"
          ? "कार्रवाई की पुष्टि नहीं हो सकी।"
          : "Could not confirm the actions. Make sure FastAPI is running."
      );
    }
  }

  /* =======================================================
     VOICE INPUT
  ======================================================= */

  function startVoice() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      notify(
        language ===
          "Telugu"
          ? "ఈ బ్రౌజర్‌లో వాయిస్ గుర్తింపు అందుబాటులో లేదు."
          : language ===
            "Hindi"
          ? "इस ब्राउज़र में वॉइस पहचान उपलब्ध नहीं है।"
          : "Speech recognition is not supported in this browser."
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    /*
      The selected language controls
      the browser's speech recognition.
    */

    recognition.lang =
      t.code;

    recognition.interimResults =
      false;

    recognition.maxAlternatives =
      1;

    recognition.onstart =
      () =>
        setListening(true);

    recognition.onend =
      () =>
        setListening(false);

    recognition.onerror =
      event => {
        console.error(
          "VOICE ERROR:",
          event.error
        );

        setListening(
          false
        );

        notify(
          language ===
            "Telugu"
            ? "వాయిస్ ఇన్‌పుట్ వినబడలేదు."
            : language ===
              "Hindi"
            ? "वॉइस इनपुट सुनाई नहीं दिया।"
            : "Could not hear the voice input."
        );
      };

    recognition.onresult =
      event => {
        const text =
          event.results[0][0]
            .transcript;

        console.log(
          "VOICE INPUT:",
          text
        );

        setAssistantText(
          text
        );

        /*
          Local parser is only a temporary
          preview. The real AI parsing happens
          when Understand Message is clicked.
        */

        const result =
          parseSentence(
            text,
            products
          );

        setParsed(
          result
        );
      };

    recognition.start();
  }

  /* =======================================================
     GENERAL SPEECH
  ======================================================= */

  function speak(
    text,
    lang = null
  ) {
    if (
      !(
        "speechSynthesis" in
        window
      )
    ) {
      return;
    }

    const speechLanguage =
      lang ||
      detectedLanguage ||
      t.aiCode;

    speakResponse(
      text,
      speechLanguage
    );
  }

  /* =======================================================
     ADD PRODUCT
  ======================================================= */

  function addProduct(
    event
  ) {
    event.preventDefault();

    if (
      !newProduct.name.trim()
    ) {
      return;
    }

    const item = {
      ...newProduct,

      id: Date.now(),

      quantity:
        Number(
          newProduct.quantity
        ),

      minimum:
        Number(
          newProduct.minimum
        ),

      maximum:
        Number(
          newProduct.maximum
        ),

      salesWeek:
        Number(
          newProduct.salesWeek
        )
    };

    setProducts(
      previous => [
        ...previous,
        item
      ]
    );

    addAction(
      "Inventory",
      `Added ${item.name}`,
      100
    );

    setNewProduct({
      name: "",
      category:
        "Groceries",
      quantity: 0,
      unit: "pieces",
      minimum: 5,
      maximum: 50,
      expiry: "",
      salesWeek: 0
    });

    setShowAdd(false);

    notify(
      t.productAdded
    );
  }

  /* =======================================================
     CHANGE STOCK
  ======================================================= */

  function changeStock(
    id,
    delta
  ) {
    setProducts(
      previous =>
        previous.map(
          product =>
            product.id === id
              ? {
                  ...product,

                  quantity:
                    Math.max(
                      0,
                      product.quantity +
                        delta
                    )
                }
              : product
        )
    );

    const product =
      products.find(
        p =>
          p.id === id
      );

    if (product) {
      addAction(
        "Inventory",
        `${
          delta > 0
            ? "Added"
            : "Removed"
        } ${Math.abs(
          delta
        )} ${product.unit} ${product.name}`,
        100
      );
    }
  }

  /* =======================================================
     ASK SHOP
  ======================================================= */

  function askShop(
    event
  ) {
    event.preventDefault();

    const result =
      answerQuestion(
        ask,
        products,
        deliveries,
        language
      );

    setAnswer(
      result
    );

    addAction(
      "Assistant",
      `Answered: ${ask}`,
      91,
      "Answered"
    );
  }

  /* =======================================================
     RESET DEMO
  ======================================================= */

  function resetDemo() {
    setProducts(
      INITIAL_PRODUCTS
    );

    setDeliveries(
      INITIAL_DELIVERIES
    );

    setActions(
      INITIAL_ACTIONS
    );

    setParsed([]);

    setBackendActions([]);

    setAssistantText("");

    setAiResponse("");

    setDetectedLanguage(
      "en"
    );

    setLanguageScores(
      {}
    );

    setAnswer("");

    notify(
      t.demoRestored
    );
  }

  /* =======================================================
     LANGUAGE CHANGE
  ======================================================= */

  function handleLanguageChange(
    newLanguage
  ) {
    setLanguage(
      newLanguage
    );

    /*
      Stop currently playing speech when
      the user changes language.
    */

    if (
      "speechSynthesis" in
      window
    ) {
      window.speechSynthesis.cancel();
    }

    /*
      Clear the previous AI response so
      the new language doesn't appear mixed
      with the old response.
    */

    setAiResponse("");

    setAnswer("");

    setDetectedLanguage(
      LANGUAGES[
        newLanguage
      ]?.aiCode || "en"
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="app">

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            🛍️
          </div>

          <div>

            <strong>
              ShopSathi
            </strong>

            <span>
              AI Shop Assistant
            </span>

          </div>

        </div>

        <nav>

          {NAV_ITEMS.map(
            item => (

              <button
                key={
                  item.key
                }

                className={
                  page ===
                  item.key
                    ? "nav active"
                    : "nav"
                }

                onClick={() =>
                  setPage(
                    item.key
                  )
                }
              >

                <span>
                  {
                    item.icon
                  }
                </span>

                {
                  PAGE_LABELS[
                    language
                  ]?.[
                    item.key
                  ] ||
                  item.key
                }

                {item.key ===
                  "Alerts" &&
                  alertsCount(
                    products
                  ) >
                    0 && (

                    <b className="nav-badge">

                      {
                        alertsCount(
                          products
                        )
                      }

                    </b>

                  )}

              </button>

            )
          )}

        </nav>

        <div className="sidebar-bottom">

          <div className="shop-mini">

            <span>
              🏪
            </span>

            <div>

              <strong>
                Demo Grocery Shop
              </strong>

              <small>
                Open · Local data
              </small>

            </div>

          </div>

          <button
            className="reset-btn"
            onClick={
              resetDemo
            }
          >
            ↻ {t.resetDemo}
          </button>

        </div>

      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="main">

        <header className="topbar">

          <div>

            <div className="eyebrow">
              MULTILINGUAL CONVERSATIONAL AI
            </div>

            <h1>
              {
                PAGE_LABELS[
                  language
                ]?.[
                  page
                ] ||
                page
              }
            </h1>

          </div>

          <div className="top-actions">

            <select
              value={
                language
              }
              onChange={event =>
                handleLanguageChange(
                  event.target
                    .value
                )
              }
            >

              <option>
                English
              </option>

              <option>
                Telugu
              </option>

              <option>
                Hindi
              </option>

            </select>

            <button className="avatar">
              S
            </button>

          </div>

        </header>

        {toast && (
          <div className="toast">
            ✓ {toast}
          </div>
        )}

        {/* =================================================
            DASHBOARD
        ================================================= */}

        {page ===
          "Dashboard" && (

          <section>

            <div className="welcome">

              <div>

                <span className="pill">
                  ● {t.shopOpen}
                </span>

                <h2>
                  {t.hello},{" "}
                  {t.shopkeeper} 👋
                </h2>

                <p>
                  {
                    language ===
                    "Telugu"
                      ? "ఇంగ్లీష్, తెలుగు, హిందీ లేదా మిశ్రమ భాషలో సహజంగా మాట్లాడండి. ShopSathi మీ సంభాషణను ధృవీకరించబడిన షాప్ చర్యలుగా మారుస్తుంది."
                      : language ===
                        "Hindi"
                      ? "अंग्रेज़ी, हिंदी, तेलुगु या मिश्रित भाषा में स्वाभाविक रूप से बोलें। ShopSathi आपकी बातचीत को सत्यापित दुकान कार्रवाइयों में बदलता है।"
                      : "Talk naturally in English, Telugu, Hindi, or mixed language. ShopSathi turns conversation into validated shop actions."
                  }
                </p>

                <button
                  className="primary"
                  onClick={() =>
                    setPage(
                      "Voice Assistant"
                    )
                  }
                >
                  🎙️{" "}
                  {t.talk}
                </button>

              </div>

              <div className="hero-art">
                🤖
                <span>
                  🛒
                </span>
              </div>

            </div>

            <div className="stats">

              <Stat
                label={
                  t.totalProducts
                }
                value={
                  products.length
                }
                icon="📦"
              />

              <Stat
                label={
                  t.lowCritical
                }
                value={
                  lowCount
                }
                icon="⚠️"
              />

              <Stat
                label={
                  t.excessStock
                }
                value={
                  excessCount
                }
                icon="📈"
              />

              <Stat
                label={
                  t.expiringSoon
                }
                value={
                  expiryCount
                }
                icon="⏰"
              />

            </div>

            <div className="grid-2">

              <Card
                title={
                  t.recentAlerts
                }
                action={
                  t.viewAll
                }
                onAction={() =>
                  setPage(
                    "Alerts"
                  )
                }
              >

                <div className="alert-list">

                  {products
                    .filter(
                      p =>
                        statusOf(
                          p
                        ) !==
                        "Normal"
                    )
                    .slice(
                      0,
                      5
                    )
                    .map(
                      product => (

                        <div
                          className="alert-row"
                          key={
                            product.id
                          }
                        >

                          <span
                            className={`status-dot ${statusOf(
                              product
                            )
                              .toLowerCase()
                              .replaceAll(
                                " ",
                                "-"
                              )}`}
                          />

                          <div>

                            <strong>
                              {
                                product.name
                              }
                            </strong>

                            <small>
                              {
                                product.quantity
                              }{" "}
                              {
                                product.unit
                              }
                              {" · "}
                              {
                                statusOf(
                                  product
                                )
                              }
                            </small>

                          </div>

                        </div>

                      )
                    )}

                  {!alertsCount(
                    products
                  ) && (
                    <Empty
                      text={
                        t.noAlerts
                      }
                    />
                  )}

                </div>

              </Card>

              <Card
                title={
                  t.recommendations
                }
                action={
                  t.viewAll
                }
                onAction={() =>
                  setPage(
                    "AI Recommendations"
                  )
                }
              >

                {recs
                  .slice(
                    0,
                    3
                  )
                  .map(
                    recommendation => (

                      <div
                        className="recommend-mini"
                        key={
                          recommendation.title
                        }
                      >

                        <span>
                          ✨
                        </span>

                        <div>

                          <strong>
                            {
                              recommendation.title
                            }
                          </strong>

                          <small>
                            {
                              recommendation.body
                            }
                          </small>

                        </div>

                      </div>

                    )
                  )}

              </Card>

            </div>

            <Card
              title={
                t.yourShop
              }
            >

              <div className="quick-actions">

                <button
                  onClick={() =>
                    setPage(
                      "Inventory"
                    )
                  }
                >
                  📦{" "}
                  {
                    t.manageInventory
                  }
                </button>

                <button
                  onClick={() =>
                    setPage(
                      "Voice Assistant"
                    )
                  }
                >
                  🎙️{" "}
                  {
                    t.addStockVoice
                  }
                </button>

                <button
                  onClick={() =>
                    setPage(
                      "Ask Assistant"
                    )
                  }
                >
                  💬{" "}
                  {
                    t.askYourShop
                  }
                </button>

                <button
                  onClick={() =>
                    setPage(
                      "AI Recommendations"
                    )
                  }
                >
                  ✨{" "}
                  {
                    t.seeRecommendations
                  }
                </button>

              </div>

            </Card>

          </section>

        )}

        {/* =================================================
            VOICE ASSISTANT
        ================================================= */}

        {page ===
          "Voice Assistant" && (

          <section>

            <div className="assistant-layout">

              <div className="voice-card">

                <div className="voice-orb">
                  {
                    listening
                      ? "🔴"
                      : "🎙️"
                  }
                </div>

                <h2>
                  {
                    listening
                      ? t.listening
                      : t.tapSpeak
                  }
                </h2>

                <p>
                  {
                    language ===
                    "Telugu"
                      ? "మీ షాప్‌కు సంబంధించిన సూచనను సహజంగా మాట్లాడండి."
                      : language ===
                        "Hindi"
                      ? "अपनी दुकान से संबंधित निर्देश स्वाभाविक रूप से बोलें।"
                      : "Speak your shop instruction naturally."
                  }
                </p>

                <button
                  className="primary mic-btn"
                  onClick={
                    startVoice
                  }
                >
                  {
                    listening
                      ? t.listening
                      : t.startVoice
                  }
                </button>

                <div className="or">
                  {
                    t.typeMessage
                  }
                </div>

                <textarea
                  value={
                    assistantText
                  }
                  onChange={event =>
                    setAssistantText(
                      event.target
                        .value
                    )
                  }
                  placeholder={
                    language ===
                    "Telugu"
                      ? "మీ షాప్ సూచనను ఇక్కడ టైప్ చేయండి..."
                      : language ===
                        "Hindi"
                      ? "अपनी दुकान का निर्देश यहाँ टाइप करें..."
                      : "Type your shop instruction here..."
                  }
                />

                <button
                  className="secondary full"
                  onClick={
                    understandMessage
                  }
                >
                  {
                    t.understand
                  }
                </button>

                {/* AI RESPONSE */}

                {aiResponse && (
                  <div
                    className="answer"
                    style={{
                      marginTop:
                        "16px"
                    }}
                  >

                    <div className="answer-avatar">
                      🤖
                    </div>

                    <div>

                      <strong>
                        ShopSathi AI
                      </strong>

                      <p>
                        {
                          aiResponse
                        }
                      </p>

                      <small>
                        {
                          t.detected
                        }
                        :{" "}
                        {
                          detectedLanguage ===
                          "te"
                            ? "Telugu"
                            : detectedLanguage ===
                              "hi"
                            ? "Hindi"
                            : "English"
                        }
                      </small>

                      <br />

                      <button
                        className="link-btn"
                        onClick={() =>
                          speakResponse(
                            aiResponse,
                            detectedLanguage
                          )
                        }
                      >
                        🔊{" "}
                        {
                          t.readAloud
                        }
                      </button>

                    </div>

                  </div>
                )}

              </div>

              <div>

                <Card
                  title={
                    t.aiUnderstanding
                  }
                  subtitle={
                    t.reviewBefore
                  }
                >

                  {parsed.length ? (

                    parsed.map(
                      action => (

                        <div
                          className="understanding"
                          key={
                            action.id
                          }
                        >

                          <div className="check">
                            ✓
                          </div>

                          <div className="under-main">

                            <strong>
                              {
                                action.type
                              }
                            </strong>

                            <span>
                              {
                                action.detail
                              }
                            </span>

                          </div>

                          <div className="confidence">

                            <b>
                              {
                                action.confidence
                              }%
                            </b>

                            <small>
                              {
                                t.confidence
                              }
                            </small>

                          </div>

                        </div>

                      )
                    )

                  ) : (

                    <Empty
                      text={
                        t.extractedActions
                      }
                    />

                  )}

                  {parsed.length >
                    0 &&
                    !parsed.some(
                      action =>
                        action.type ===
                        "Needs clarification"
                    ) && (

                      <div className="confirm-box">

                        <div>

                          <strong>
                            {
                              t.confirmation
                            }
                          </strong>

                          <span>
                            {
                              t.confirmationText
                            }
                          </span>

                        </div>

                        <div className="button-row">

                          <button
                            className="primary"
                            onClick={
                              applyParsed
                            }
                          >
                            ✓{" "}
                            {
                              t.confirm
                            }
                          </button>

                          <button
                            className="secondary"
                            onClick={() => {

                              setParsed(
                                []
                              );

                              setBackendActions(
                                []
                              );

                              notify(
                                t.actionsCancelled
                              );

                            }}
                          >
                            {
                              t.cancel
                            }
                          </button>

                        </div>

                      </div>

                    )}

                </Card>

                <Card
                  title={
                    t.howWorks
                  }
                >

                  <div className="steps">

                    <Step
                      n="1"
                      title={
                        t.conversation
                      }
                      text={
                        t.conversationDescription
                      }
                    />

                    <Step
                      n="2"
                      title={
                        t.understanding
                      }
                      text={
                        t.inventoryDescription
                      }
                    />

                    <Step
                      n="3"
                      title={
                        t.validation
                      }
                      text={
                        t.validationDescription
                      }
                    />

                    <Step
                      n="4"
                      title={
                        t.shopData
                      }
                      text={
                        t.shopDataDescription
                      }
                    />

                  </div>

                </Card>

              </div>

            </div>

          </section>

        )}

        {/* =================================================
            INVENTORY
        ================================================= */}

        {page ===
          "Inventory" && (

          <section>

            <div className="page-tools">

              <div className="search">

                <span>
                  ⌕
                </span>

                <input
                  value={
                    query
                  }
                  onChange={event =>
                    setQuery(
                      event.target
                        .value
                    )
                  }
                  placeholder={
                    t.searchProduct
                  }
                />

              </div>

              <button
                className="primary"
                onClick={() =>
                  setShowAdd(
                    true
                  )
                }
              >
                ＋{" "}
                {
                  t.addProduct
                }
              </button>

            </div>

            <Card>

              <div className="table-wrap">

                <table>

                  <thead>

                    <tr>

                      <th>
                        {
                          t.product
                        }
                      </th>

                      <th>
                        {
                          t.category
                        }
                      </th>

                      <th>
                        {
                          t.stock
                        }
                      </th>

                      <th>
                        {
                          t.minimum
                        }
                      </th>

                      <th>
                        {
                          t.expiry
                        }
                      </th>

                      <th>
                        {
                          t.status
                        }
                      </th>

                      <th>
                        {
                          t.quickUpdate
                        }
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredProducts.map(
                      product => (

                        <tr
                          key={
                            product.id
                          }
                        >

                          <td>
                            <strong>
                              {
                                product.name
                              }
                            </strong>
                          </td>

                          <td>
                            {
                              product.category
                            }
                          </td>

                          <td>

                            <b>
                              {
                                product.quantity
                              }
                            </b>{" "}

                            {
                              product.unit
                            }

                          </td>

                          <td>

                            {
                              product.minimum
                            }{" "}

                            {
                              product.unit
                            }

                          </td>

                          <td>

                            {
                              product.expiry
                                ? `${daysUntil(
                                    product.expiry
                                  )} day(s)`
                                : "—"
                            }

                          </td>

                          <td>

                            <span
                              className={`status ${statusOf(
                                product
                              )
                                .toLowerCase()
                                .replaceAll(
                                  " ",
                                  "-"
                                )}`}
                            >
                              {
                                statusOf(
                                  product
                                )
                              }
                            </span>

                          </td>

                          <td>

                            <div className="stock-buttons">

                              <button
                                onClick={() =>
                                  changeStock(
                                    product.id,
                                    -1
                                  )
                                }
                              >
                                −
                              </button>

                              <button
                                onClick={() =>
                                  changeStock(
                                    product.id,
                                    1
                                  )
                                }
                              >
                                ＋
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </Card>

            {showAdd && (

              <Modal
                title={
                  t.addProduct
                }
                onClose={() =>
                  setShowAdd(
                    false
                  )
                }
              >

                <form
                  onSubmit={
                    addProduct
                  }
                  className="form-grid"
                >

                  <label>

                    {
                      t.productName
                    }

                    <input
                      required
                      value={
                        newProduct.name
                      }
                      onChange={event =>
                        setNewProduct({
                          ...newProduct,

                          name:
                            event.target
                              .value
                        })
                      }
                    />

                  </label>

                  <label>

                    {
                      t.category
                    }

                    <input
                      value={
                        newProduct.category
                      }
                      onChange={event =>
                        setNewProduct({
                          ...newProduct,

                          category:
                            event.target
                              .value
                        })
                      }
                    />

                  </label>

                  <label>

                    {
                      t.quantity
                    }

                    <input
                      type="number"
                      min="0"
                      value={
                        newProduct.quantity
                      }
                      onChange={event =>
                        setNewProduct({
                          ...newProduct,

                          quantity:
                            event.target
                              .value
                        })
                      }
                    />

                  </label>

                  <label>

                    {
                      t.unit
                    }

                    <select
                      value={
                        newProduct.unit
                      }
                      onChange={event =>
                        setNewProduct({
                          ...newProduct,

                          unit:
                            event.target
                              .value
                        })
                      }
                    >

                      <option>
                        pieces
                      </option>

                      <option>
                        kg
                      </option>

                      <option>
                        bags
                      </option>

                      <option>
                        boxes
                      </option>

                      <option>
                        bottles
                      </option>

                      <option>
                        packs
                      </option>

                      <option>
                        litres
                      </option>

                      <option>
                        cartons
                      </option>

                    </select>

                  </label>

                  <label>

                    {
                      t.minimumStock
                    }

                    <input
                      type="number"
                      min="0"
                      value={
                        newProduct.minimum
                      }
                      onChange={event =>
                        setNewProduct({
                          ...newProduct,

                          minimum:
                            event.target
                              .value
                        })
                      }
                    />

                  </label>

                  <label>

                    {
                      t.maximumStock
                    }

                    <input
                      type="number"
                      min="1"
                      value={
                        newProduct.maximum
                      }
                      onChange={event =>
                        setNewProduct({
                          ...newProduct,

                          maximum:
                            event.target
                              .value
                        })
                      }
                    />

                  </label>

                  <label>

                    {
                      t.expiryDate
                    }

                    <input
                      type="date"
                      value={
                        newProduct.expiry
                      }
                      onChange={event =>
                        setNewProduct({
                          ...newProduct,

                          expiry:
                            event.target
                              .value
                        })
                      }
                    />

                  </label>

                  <label>

                    {
                      t.weeklySales
                    }

                    <input
                      type="number"
                      min="0"
                      value={
                        newProduct.salesWeek
                      }
                      onChange={event =>
                        setNewProduct({
                          ...newProduct,

                          salesWeek:
                            event.target
                              .value
                        })
                      }
                    />

                  </label>

                  <div className="modal-actions">

                    <button
                      type="button"
                      className="secondary"
                      onClick={() =>
                        setShowAdd(
                          false
                        )
                      }
                    >
                      {
                        t.cancel
                      }
                    </button>

                    <button
                      className="primary"
                    >
                      {
                        t.addProduct
                      }
                    </button>

                  </div>

                </form>

              </Modal>

            )}

          </section>

        )}

        {/* =================================================
            ALERTS
        ================================================= */}

        {page ===
          "Alerts" && (

          <section className="cards-stack">

            <AlertGroup
              title={`🔴 ${t.criticalStock}`}
              items={
                products.filter(
                  p =>
                    statusOf(
                      p
                    ) ===
                    "Critical"
                )
              }
              emptyText={
                t.noCategory
              }
            />

            <AlertGroup
              title={`🟠 ${t.lowStock}`}
              items={
                products.filter(
                  p =>
                    statusOf(
                      p
                    ) ===
                    "Low"
                )
              }
              emptyText={
                t.noCategory
              }
            />

            <AlertGroup
              title={`📈 ${t.excess}`}
              items={
                products.filter(
                  p =>
                    statusOf(
                      p
                    ) ===
                    "Excess"
                )
              }
              emptyText={
                t.noCategory
              }
            />

            <AlertGroup
              title={`⏰ ${t.expiringSoon}`}
              items={
                products.filter(
                  p =>
                    statusOf(
                      p
                    ) ===
                    "Expiring Soon"
                )
              }
              expiry
              emptyText={
                t.noCategory
              }
            />

            <Card
              title={
                `📦 ${t.pendingDeliveries}`
              }
            >

              {deliveries
                .filter(
                  delivery =>
                    delivery.status ===
                    "Pending"
                )
                .map(
                  delivery => (

                    <div
                      className="delivery-row"
                      key={
                        delivery.id
                      }
                    >

                      <div>

                        <strong>
                          {
                            delivery.supplier
                          }
                        </strong>

                        <span>
                          {
                            delivery.quantity
                          }{" "}
                          {
                            delivery.unit
                          }{" "}
                          of{" "}
                          {
                            delivery.product
                          }
                        </span>

                      </div>

                      <span className="status pending">

                        {
                          t.expected
                        }{" "}

                        {
                          delivery.expected
                        }

                      </span>

                    </div>

                  )
                )}

              {!deliveries.filter(
                d =>
                  d.status ===
                  "Pending"
              ).length && (

                <Empty
                  text={
                    t.noPendingDeliveries
                  }
                />

              )}

            </Card>

          </section>

        )}

        {/* =================================================
            RECOMMENDATIONS
        ================================================= */}

        {page ===
          "AI Recommendations" && (

          <section>

            <div className="recommend-hero">

              <span>
                ✨
              </span>

              <div>

                <h2>
                  {
                    t.recommendations
                  }
                </h2>

                <p>
                  {
                    t.aiRecommendationDescription
                  }
                </p>

              </div>

            </div>

            <div className="recommend-grid">

              {recs.map(
                recommendation => (

                  <div
                    className="recommend-card"
                    key={
                      recommendation.title
                    }
                  >

                    <div className="rec-icon">
                      ✨
                    </div>

                    <span className="tag">
                      {
                        recommendation.tag
                      }
                    </span>

                    <h3>
                      {
                        recommendation.title
                      }
                    </h3>

                    <p>
                      {
                        recommendation.body
                      }
                    </p>

                    <button
                      className="secondary"
                      onClick={() =>
                        setPage(
                          "Inventory"
                        )
                      }
                    >
                      {
                        t.reviewInventory
                      }
                    </button>

                  </div>

                )
              )}

            </div>

          </section>

        )}

        {/* =================================================
            ASK ASSISTANT
        ================================================= */}

        {page ===
          "Ask Assistant" && (

          <section className="ask-page">

            <div className="ask-head">

              <div className="big-chat">
                💬
              </div>

              <h2>
                {
                  t.askShopTitle
                }
              </h2>

              <p>
                {
                  t.askShopDescription
                }
              </p>

            </div>

            <form
              className="ask-box"
              onSubmit={
                askShop
              }
            >

              <input
                value={
                  ask
                }
                onChange={event =>
                  setAsk(
                    event.target
                      .value
                  )
                }
                placeholder={
                  language ===
                  "Telugu"
                    ? "మీ షాప్ గురించి ప్రశ్న అడగండి..."
                    : language ===
                      "Hindi"
                    ? "अपनी दुकान के बारे में प्रश्न पूछें..."
                    : "Ask a question about your shop..."
                }
              />

              <button className="primary">
                {
                  t.ask
                }
              </button>

            </form>

            {answer && (

              <div className="answer">

                <div className="answer-avatar">
                  🤖
                </div>

                <div>

                  <strong>
                    ShopSathi AI
                  </strong>

                  <p>
                    {
                      answer
                    }
                  </p>

                  <button
                    className="link-btn"
                    onClick={() =>
                      speak(
                        answer
                      )
                    }
                  >
                    🔊{" "}
                    {
                      t.readAloud
                    }
                  </button>

                </div>

              </div>

            )}

          </section>

        )}

        {/* =================================================
            ACTION HISTORY
        ================================================= */}

        {page ===
          "Action History" && (

          <section>

            <Card
              title={
                t.history
              }
              subtitle={
                language ===
                "Telugu"
                  ? "పారదర్శకత కోసం ప్రతి ముఖ్యమైన చర్య నమోదు చేయబడుతుంది."
                  : language ===
                    "Hindi"
                  ? "पारदर्शिता के लिए हर महत्वपूर्ण कार्रवाई दर्ज की जाती है।"
                  : "Every important action is recorded for transparency."
              }
            >

              <div className="history">

                {actions.map(
                  action => (

                    <div
                      className="history-row"
                      key={
                        action.id
                      }
                    >

                      <div className="history-icon">
                        ✓
                      </div>

                      <div>

                        <strong>
                          {
                            action.description
                          }
                        </strong>

                        <span>
                          {
                            action.type
                          }
                          {" · "}
                          {
                            action.time
                          }
                        </span>

                      </div>

                      <div className="history-confidence">

                        {
                          action.confidence
                        }%

                        <small>
                          {
                            action.status
                          }
                        </small>

                      </div>

                    </div>

                  )
                )}

              </div>

            </Card>

          </section>

        )}

        {/* =================================================
            SETTINGS
        ================================================= */}

        {page ===
          "Settings" && (

          <section className="settings-grid">

            <Card
              title={
                t.languageVoice
              }
            >

              <label className="setting-label">

                {
                  t.preferredLanguage
                }

                <select
                  value={
                    language
                  }
                  onChange={event =>
                    handleLanguageChange(
                      event.target
                        .value
                    )
                  }
                >

                  <option>
                    English
                  </option>

                  <option>
                    Telugu
                  </option>

                  <option>
                    Hindi
                  </option>

                </select>

              </label>

              <p className="muted">
                {
                  t.languageDescription
                }
              </p>

            </Card>

            <Card
              title={
                t.demoData
              }
            >

              <p className="muted">

                {
                  language ===
                  "Telugu"
                    ? "ఈ ఫ్రంట్‌ఎండ్ డెమో షాప్ డేటాను మీ బ్రౌజర్ LocalStorageలో నిల్వ చేస్తుంది."
                    : language ===
                      "Hindi"
                    ? "यह फ्रंटएंड डेमो दुकान डेटा को आपके ब्राउज़र के LocalStorage में रखता है।"
                    : "This frontend stores demo shop data in your browser's LocalStorage."
                }

              </p>

              <button
                className="secondary"
                onClick={
                  resetDemo
                }
              >
                {
                  t.restoreDemo
                }
              </button>

            </Card>

            <Card
              title={
                t.backendIntegration
              }
            >

              <p className="muted">

                {
                  language ===
                  "Telugu"
                    ? "FastAPI AI parsing, product data మరియు confirmation అందిస్తుంది."
                    : language ===
                      "Hindi"
                    ? "FastAPI AI parsing, product data और confirmation प्रदान करता है।"
                    : "FastAPI provides AI parsing, product data and confirmation."
                }

              </p>

              <code>
                POST /api/parse-action
              </code>

              <code>
                GET /api/products/
              </code>

              <code>
                POST /api/actions/confirm
              </code>

            </Card>

          </section>

        )}

      </main>

    </div>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function Stat({
  label,
  value,
  icon
}) {
  return (
    <div className="stat">

      <span className="stat-icon">
        {icon}
      </span>

      <div>

        <strong>
          {value}
        </strong>

        <small>
          {label}
        </small>

      </div>

    </div>
  );
}

function Card({
  title,
  subtitle,
  action,
  onAction,
  children
}) {
  return (
    <div className="card">

      {(title ||
        subtitle) && (

        <div className="card-head">

          <div>

            <h3>
              {title}
            </h3>

            {subtitle && (
              <p>
                {subtitle}
              </p>
            )}

          </div>

          {action && (

            <button
              className="link-btn"
              onClick={
                onAction
              }
            >
              {action} →
            </button>

          )}

        </div>

      )}

      {children}

    </div>
  );
}

function Empty({
  text
}) {
  return (
    <div className="empty">
      {text}
    </div>
  );
}

function Step({
  n,
  title,
  text
}) {
  return (
    <div className="step">

      <b>
        {n}
      </b>

      <div>

        <strong>
          {title}
        </strong>

        <span>
          {text}
        </span>

      </div>

    </div>
  );
}

function AlertGroup({
  title,
  items,
  expiry,
  emptyText
}) {
  return (
    <Card
      title={title}
    >

      {items.length
        ? items.map(
            product => (

              <div
                className="delivery-row"
                key={
                  product.id
                }
              >

                <div>

                  <strong>
                    {
                      product.name
                    }
                  </strong>

                  <span>

                    {
                      product.quantity
                    }{" "}

                    {
                      product.unit
                    }

                    {expiry &&
                      product.expiry
                        ? ` · ${daysUntil(
                            product.expiry
                          )} day(s) left`
                        : ""}

                  </span>

                </div>

                <span
                  className={`status ${statusOf(
                    product
                  )
                    .toLowerCase()
                    .replaceAll(
                      " ",
                      "-"
                    )}`}
                >
                  {
                    statusOf(
                      product
                    )
                  }
                </span>

              </div>

            )
          )
        : (
          <Empty
            text={
              emptyText ||
              "Nothing in this category."
            }
          />
        )}

    </Card>
  );
}

function Modal({
  title,
  onClose,
  children
}) {
  return (
    <div className="overlay">

      <div className="modal">

        <div className="modal-head">

          <h2>
            {title}
          </h2>

          <button
            onClick={
              onClose
            }
          >
            ×
          </button>

        </div>

        {children}

      </div>

    </div>
  );
}

/* =========================================================
   START REACT
========================================================= */

createRoot(
  document.getElementById(
    "root"
  )
).render(
  <App />
);