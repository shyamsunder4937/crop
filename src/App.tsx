import React, { useState, useEffect, useRef } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { generateAdvice } from './aiClient';
import { Home, Cloud, TrendingUp, Bot, Bell, MapPin, Thermometer, Droplets, Wind, Sun, CloudRain, Zap, Send, Loader, ArrowUp, ArrowDown, Minus, CheckCircle, AlertTriangle, Info, Phone, Globe, Calendar, Languages, Moon, SunIcon } from 'lucide-react';

interface WeatherData {
  location: string;
  current: {
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    description: string;
    icon: string;
  }>;
  alerts: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

interface MarketPrice {
  crop: string;
  price: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface CropRecommendation {
  crop: string;
  confidence: number;
  yield: number;
  profit: number;
  fertilizer: string[];
  tips: string[];
}

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

type Language = 'hi' | 'en' | 'te' | 'ta';
type Theme = 'light' | 'dark';

const translations = {
  hi: {
    appTitle: "स्मार्ट कृषि सलाहकार",
    welcome: "स्वागत है, किसान भाई!",
    goodDay: "आज का दिन खेती के लिए अच्छा है",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    windSpeed: "हवा की गति",
    cropRecommendation: "फसल सुझाव प्रणाली",
    nitrogen: "नाइट्रोजन (N) - ppm",
    phosphorus: "फॉस्फोरस (P) - ppm",
    potassium: "पोटेशियम (K) - ppm",
    phLevel: "pH स्तर",
    area: "भूमि क्षेत्र (हेक्टेयर)",
    getRecommendation: "फसल सुझाव प्राप्त करें",
    analyzing: "विश्लेषण हो रहा है...",
    suggestedCrop: "सुझावित फसल",
    confidence: "विश्वसनीयता",
    estimatedYield: "अनुमानित उत्पादन",
    estimatedProfit: "अनुमानित लाभ",
    fertilizerSuggestion: "उर्वरक सुझाव",
    farmingTips: "खेती के सुझाव",
    tabs: {
      dashboard: "मुख्य पृष्ठ",
      weather: "मौसम",
      market: "बाजार भाव",
      ai: "AI सलाहकार",
      advisory: "सलाह और अलर्ट"
    },
    weatherForecast: "5 दिन का मौसम पूर्वानुमान",
    agriculturalWarning: "कृषि चेतावनी",
    marketPrices: "आज के बाजार भाव",
    priceAlerts: "मूल्य अलर्ट",
    aiAdvisor: "AI कृषि सलाहकार",
    askQuestion: "आपके सवालों का जवाब तुरंत",
    typeMessage: "अपना सवाल यहां लिखें...",
    commonQuestions: "आम सवाल",
    generalAdvice: "सामान्य खेती सलाह",
    govSchemes: "सरकारी योजनाएं",
    emergencyContacts: "आपातकालीन संपर्क"
  },
  en: {
    appTitle: "Smart Agricultural Advisory",
    welcome: "Welcome, Farmer!",
    goodDay: "Today is a good day for farming",
    temperature: "Temperature",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    cropRecommendation: "Crop Recommendation System",
    nitrogen: "Nitrogen (N) - ppm",
    phosphorus: "Phosphorus (P) - ppm",
    potassium: "Potassium (K) - ppm",
    phLevel: "pH Level",
    area: "Land Area (hectares)",
    getRecommendation: "Get Crop Recommendation",
    analyzing: "Analyzing...",
    suggestedCrop: "Suggested Crop",
    confidence: "Confidence",
    estimatedYield: "Estimated Yield",
    estimatedProfit: "Estimated Profit",
    fertilizerSuggestion: "Fertilizer Suggestions",
    farmingTips: "Farming Tips",
    tabs: {
      dashboard: "Dashboard",
      weather: "Weather",
      market: "Market Prices",
      ai: "AI Advisor",
      advisory: "Advisory & Alerts"
    },
    weatherForecast: "5-Day Weather Forecast",
    agriculturalWarning: "Agricultural Warnings",
    marketPrices: "Today's Market Prices",
    priceAlerts: "Price Alerts",
    aiAdvisor: "AI Agricultural Advisor",
    askQuestion: "Get instant answers to your questions",
    typeMessage: "Type your question here...",
    commonQuestions: "Common Questions",
    generalAdvice: "General Farming Advice",
    govSchemes: "Government Schemes",
    emergencyContacts: "Emergency Contacts"
  },
  te: {
    appTitle: "స్మార్ట్ వ్యవసాయ సలహా",
    welcome: "స్వాగతం, రైతు గారు!",
    goodDay: "ఈ రోజు వ్యవసాయానికి మంచి రోజు",
    temperature: "ఉష్ణోగ్రత",
    humidity: "తేమ",
    windSpeed: "గాలి వేగం",
    cropRecommendation: "పంట సిఫార్సు వ్యవస్థ",
    nitrogen: "నైట్రోజన్ (N) - ppm",
    phosphorus: "ఫాస్ఫరస్ (P) - ppm",
    potassium: "పొటాషియం (K) - ppm",
    phLevel: "pH స్థాయి",
    area: "భూమి వైశాల్యం (హెక్టార్లు)",
    getRecommendation: "పంట సిఫార్సు పొందండి",
    analyzing: "విశ్లేషిస్తోంది...",
    suggestedCrop: "సిఫార్సు చేసిన పంట",
    confidence: "విశ్వసనీయత",
    estimatedYield: "అంచనా దిగుబడి",
    estimatedProfit: "అంచనా లాభం",
    fertilizerSuggestion: "ఎరువుల సిఫార్సులు",
    farmingTips: "వ్యవసాయ చిట్కాలు",
    tabs: {
      dashboard: "డాష్‌బోర్డ్",
      weather: "వాతావరణం",
      market: "మార్కెట్ ధరలు",
      ai: "AI సలహాదారు",
      advisory: "సలహా & హెచ్చరికలు"
    },
    weatherForecast: "5 రోజుల వాతావరణ సూచన",
    agriculturalWarning: "వ్యవసాయ హెచ్చరికలు",
    marketPrices: "నేటి మార్కెట్ ధరలు",
    priceAlerts: "ధర హెచ్చరికలు",
    aiAdvisor: "AI వ్యవసాయ సలహాదారు",
    askQuestion: "మీ ప్రశ్నలకు తక్షణ సమాధానాలు",
    typeMessage: "మీ ప్రశ్న ఇక్కడ టైప్ చేయండి...",
    commonQuestions: "సాధారణ ప్రశ్నలు",
    generalAdvice: "సాధారణ వ్యవసాయ సలహా",
    govSchemes: "ప్రభుత్వ పథకాలు",
    emergencyContacts: "అత్యవసర సంప్రదింపులు"
  },
  ta: {
    appTitle: "ஸ்மார்ட் வேளாண் ஆலோசனை",
    welcome: "வரவேற்கிறோம், விவசாயி!",
    goodDay: "இன்று விவசாயத்திற்கு நல்ல நாள்",
    temperature: "வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    windSpeed: "காற்றின் வேகம்",
    cropRecommendation: "பயிர் பரிந்துரை அமைப்பு",
    nitrogen: "நைட்ரஜன் (N) - ppm",
    phosphorus: "பாஸ்பரஸ் (P) - ppm",
    potassium: "பொட்டாசியம் (K) - ppm",
    phLevel: "pH அளவு",
    area: "நில பரப்பு (ஹெக்டேர்)",
    getRecommendation: "பயிர் பரிந்துரை பெறுங்கள்",
    analyzing: "பகுப்பாய்வு செய்கிறது...",
    suggestedCrop: "பரிந்துரைக்கப்பட்ட பயிர்",
    confidence: "நம்பகத்தன்மை",
    estimatedYield: "மதிப்பிடப்பட்ட விளைச்சல்",
    estimatedProfit: "மதிப்பிடப்பட்ட லாபம்",
    fertilizerSuggestion: "உர பரிந்துரைகள்",
    farmingTips: "விவசாய குறிப்புகள்",
    tabs: {
      dashboard: "டாஷ்போர்டு",
      weather: "வானிலை",
      market: "சந்தை விலைகள்",
      ai: "AI ஆலோசகர்",
      advisory: "ஆலோசனை & எச்சரிக்கைகள்"
    },
    weatherForecast: "5 நாள் வானிலை முன்னறிவிப்பு",
    agriculturalWarning: "வேளாண் எச்சரிக்கைகள்",
    marketPrices: "இன்றைய சந்தை விலைகள்",
    priceAlerts: "விலை எச்சரிக்கைகள்",
    aiAdvisor: "AI வேளாண் ஆலோசகர்",
    askQuestion: "உங்கள் கேள்விகளுக்கு உடனடி பதில்கள்",
    typeMessage: "உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யுங்கள்...",
    commonQuestions: "பொதுவான கேள்விகள்",
    generalAdvice: "பொதுவான விவசாய ஆலோசனை",
    govSchemes: "அரசு திட்டங்கள்",
    emergencyContacts: "அவசர தொடர்புகள்"
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('hi');
  const [theme, setTheme] = useState<Theme>('light');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    temperature: '',
    humidity: '',
    area: ''
  });
  const [recommendation, setRecommendation] = useState<CropRecommendation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const t = translations[language];

  // Helper to create initial system message
  const createInitialMessage = (lang: Language): ChatMessage => {
    const initialMessages = {
      hi: "नमस्ते! मैं आपका कृषि सलाहकार हूं। मैं फसल, मिट्टी, उर्वरक और खेती से जुड़े किसी भी सवाल का जवाब दे सकता हूं।",
      en: "Hello! I'm your agricultural advisor. I can answer any questions related to crops, soil, fertilizers, and farming.",
      te: "నమస్కారం! నేను మీ వ్యవసాయ సలహాదారుని. పంటలు, మట్టి, ఎరువులు మరియు వ్యవసాయానికి సంబంధించిన ఏ ప్రశ్నకైనా నేను సమాధానం ఇవ్వగలను.",
      ta: "வணக்கம்! நான் உங்கள் வேளாண் ஆலோசகர். பயிர்கள், மண், உரங்கள் மற்றும் விவசாயம் தொடர்பான எந்த கேள்விக்கும் என்னால் பதிலளிக்க முடியும்."
    };
    return {
      id: 1,
      text: initialMessages[lang],
      isUser: false,
      timestamp: new Date()
    } as ChatMessage;
  };

  // Initialize messages based on language
  useEffect(() => {
    setMessages([createInitialMessage(language)]);
  }, [language]);

  // Mock weather data with translations
  const getWeatherData = (): WeatherData => {
    const locations = {
      hi: "कृष्णन कोविल, भारत",
      en: "krishnankoil, India",
      te: "కృష్ణన్ కోవిల్, భారతదేశం",
      ta: "கிருஷ்ணன் கோவில் , இந்தியா"
    };

    const descriptions = {
      hi: ["धूप", "बादल", "बारिश", "तूफान", "साफ"],
      en: ["Sunny", "Cloudy", "Rainy", "Stormy", "Clear"],
      te: ["ఎండ", "మేఘాలు", "వర్షం", "తుఫాను", "స్పష్టం"],
      ta: ["வெயில்", "மேகமூட்டம்", "மழை", "புயல்", "தெளிவு"]
    };

    const days = {
      hi: ["आज", "कल", "परसों", "शुक्रवार", "शनिवार"],
      en: ["Today", "Tomorrow", "Day After", "Friday", "Saturday"],
      te: ["ఈరోజు", "రేపు", "ఎల్లుండి", "శుక్రవారం", "శనివారం"],
      ta: ["இன்று", "நாளை", "நாளை மறுநாள்", "வெள்ளி", "சனி"]
    };

    return {
      location: locations[language],
      current: {
        temperature: 28,
        description: descriptions[language][0],
        humidity: 65,
        windSpeed: 12,
        icon: "partly-cloudy"
      },
      forecast: days[language].map((day, index) => ({
        day,
        high: 30 + index,
        low: 22 - index,
        description: descriptions[language][index],
        icon: ["sunny", "cloudy", "rainy", "stormy", "clear"][index]
      })),
      alerts: [
        {
          type: language === 'hi' ? "मानसून चेतावनी" : language === 'en' ? "Monsoon Warning" : language === 'te' ? "వర్షాకాల హెచ్చరిక" : "பருவமழை எச்சரிக்கை",
          message: language === 'hi' ? "अगले 48 घंटों में भारी बारिश की संभावना" : language === 'en' ? "Heavy rainfall expected in next 48 hours" : language === 'te' ? "రాబోయే 48 గంటల్లో భారీ వర్షాలు" : "அடுத்த 48 மணி நேரத்தில் கனமழை",
          severity: "high" as const
        }
      ]
    };
  };

  // Mock market prices with translations
  const getMarketPrices = (): MarketPrice[] => {
    const crops = {
      hi: ["गेहूं", "चावल", "मक्का", "सरसों", "सोयाबीन", "दालें", "आलू", "प्याज"],
      en: ["Wheat", "Rice", "Corn", "Mustard", "Soybean", "Pulses", "Potato", "Onion"],
      te: ["గోధుమలు", "వరి", "మొక్కజొన్న", "ఆవాలు", "సోయాబీన్", "పప్పులు", "బంగాళాదుంపలు", "ఉల్లిపాయలు"],
      ta: ["கோதுமை", "அரிசி", "சோளம்", "கடுகு", "சோயாபீன்", "பருப்பு", "உருளைக்கிழங்கு", "வெங்காயம்"]
    };

    const prices = [2150, 1890, 1650, 5200, 4100, 6500, 1200, 2800];
    const changes = [50, -30, 25, 0, 75, -100, 40, -80];
    const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'up', 'stable', 'up', 'down', 'up', 'down'];

    return crops[language].map((crop, index) => ({
      crop,
      price: prices[index],
      unit: language === 'hi' ? "प्रति क्विंटल" : language === 'en' ? "per quintal" : language === 'te' ? "క్వింటల్‌కు" : "ஒரு குவிண்டலுக்கு",
      change: changes[index],
      trend: trends[index]
    }));
  };

  const weatherData = getWeatherData();
  const marketPrices = getMarketPrices();

  const tabs = [
    { id: 'dashboard', name: t.tabs.dashboard, icon: Home },
    { id: 'weather', name: t.tabs.weather, icon: Cloud },
    { id: 'market', name: t.tabs.market, icon: TrendingUp },
    { id: 'ai', name: t.tabs.ai, icon: Bot },
    { id: 'advisory', name: t.tabs.advisory, icon: Bell }
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const crops = {
        hi: [
          {
            crop: "गेहूं",
            confidence: 92,
            yield: 45,
            profit: 25000,
            fertilizer: ["यूरिया 120 किग्रा/हेक्टेयर", "DAP 100 किग्रा/हेक्टेयर", "MOP 60 किग्रा/हेक्टेयर"],
            tips: ["बुवाई नवंबर के दूसरे सप्ताह में करें", "सिंचाई 21 दिन के अंतराल पर करें", "कटाई अप्रैल में करें"]
          },
          {
            crop: "चावल",
            confidence: 87,
            yield: 55,
            profit: 30000,
            fertilizer: ["यूरिया 150 किग्रा/हेक्टेयर", "SSP 125 किग्रा/हेक्टेयर", "MOP 50 किग्रा/हेक्टेयर"],
            tips: ["पानी की उपलब्धता सुनिश्चित करें", "रोपाई जुलाई में करें", "खरपतवार नियंत्रण जरूरी"]
          }
        ],
        en: [
          {
            crop: "Wheat",
            confidence: 92,
            yield: 45,
            profit: 25000,
            fertilizer: ["Urea 120 kg/hectare", "DAP 100 kg/hectare", "MOP 60 kg/hectare"],
            tips: ["Sow in second week of November", "Irrigate at 21-day intervals", "Harvest in April"]
          },
          {
            crop: "Rice",
            confidence: 87,
            yield: 55,
            profit: 30000,
            fertilizer: ["Urea 150 kg/hectare", "SSP 125 kg/hectare", "MOP 50 kg/hectare"],
            tips: ["Ensure water availability", "Transplant in July", "Weed control is essential"]
          }
        ],
        te: [
          {
            crop: "గోధుమలు",
            confidence: 92,
            yield: 45,
            profit: 25000,
            fertilizer: ["యూరియా 120 కిలోలు/హెక్టార్", "DAP 100 కిలోలు/హెక్టార్", "MOP 60 కిలోలు/హెక్టార్"],
            tips: ["నవంబర్ రెండవ వారంలో విత్తండి", "21 రోజుల వ్యవధిలో నీరు పెట్టండి", "ఏప్రిల్‌లో కోత"]
          },
          {
            crop: "వరి",
            confidence: 87,
            yield: 55,
            profit: 30000,
            fertilizer: ["యూరియా 150 కిలోలు/హెక్టార్", "SSP 125 కిలోలు/హెక్టార్", "MOP 50 కిలోలు/హెక్టార్"],
            tips: ["నీటి లభ్యత నిర్ధారించండి", "జూలైలో మార్పిడి", "కలుపు నియంత్రణ అవసరం"]
          }
        ],
        ta: [
          {
            crop: "கோதுமை",
            confidence: 92,
            yield: 45,
            profit: 25000,
            fertilizer: ["யூரியா 120 கிலோ/ஹெக்டேர்", "DAP 100 கிலோ/ஹெக்டேர்", "MOP 60 கிலோ/ஹெக்டேர்"],
            tips: ["நவம்பர் இரண்டாம் வாரத்தில் விதைக்கவும்", "21 நாள் இடைவெளியில் நீர்ப்பாசனம்", "ஏப்ரலில் அறுவடை"]
          },
          {
            crop: "அரிசி",
            confidence: 87,
            yield: 55,
            profit: 30000,
            fertilizer: ["யூரியா 150 கிலோ/ஹெக்டேர்", "SSP 125 கிலோ/ஹெக்டேர்", "MOP 50 கிலோ/ஹெக்டேர்"],
            tips: ["நீர் கிடைக்கும் தன்மையை உறுதி செய்யவும்", "ஜூலையில் நடவு", "களை கட்டுப்பாடு அவசியம்"]
          }
        ]
      };
      
      const selectedCrop = Math.random() > 0.5 ? crops[language][0] : crops[language][1];
      setRecommendation(selectedCrop);
      setLoading(false);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const newMessage: ChatMessage = {
      id: messages.length + 1,
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setChatLoading(true);

    try {
      const localeHint = language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : language === 'ta' ? 'Tamil' : 'English';
      const systemHint = `You are an agricultural advisor. Reply concisely in ${localeHint}.`;
      const prompt = `${systemHint}\n\nUser: ${inputMessage}`;
      const text = await generateAdvice(prompt);
      const aiResponse: ChatMessage = {
        id: messages.length + 2,
        text: text || (language === 'en' ? 'Sorry, I could not generate a response.' : 'क्षमा करें, मैं उत्तर उत्पन्न नहीं कर सका.'),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (err: any) {
      const fallback = language === 'en' ? 'There was an error contacting the AI service.' : 'AI सेवा से संपर्क करने में त्रुटि हुई।';
      const aiResponse: ChatMessage = {
        id: messages.length + 2,
        text: fallback,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setChatLoading(false);
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  // Track scroll to toggle the scroll-to-bottom button
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const handler = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      setShowScrollButton(!nearBottom);
    };
    el.addEventListener('scroll', handler);
    handler();
    return () => el.removeEventListener('scroll', handler);
  }, [messagesContainerRef.current]);

  const clearChat = () => {
    setMessages([createInitialMessage(language)]);
  };

  const getWeatherIcon = (iconType: string) => {
    switch(iconType) {
      case 'sunny':
      case 'clear':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'cloudy':
      case 'partly-cloudy':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'stormy':
        return <Zap className="w-8 h-8 text-purple-500" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-lg ${theme === 'dark' ? 'shadow-lg' : 'shadow-md'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t.welcome}</h1>
            <p className="opacity-90 mt-1">{t.goodDay}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm opacity-90">
              <MapPin className="w-4 h-4 mr-1" />
              {weatherData.location}
            </div>
            <div className="text-2xl font-bold mt-1">
              {weatherData.current.temperature}°C
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-4 rounded-lg shadow-md border-l-4 border-green-500`}>
          <div className="flex items-center">
            <Thermometer className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{t.temperature}</p>
              <p className="text-xl font-bold">{weatherData.current.temperature}°C</p>
            </div>
          </div>
        </div>
        
        <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-4 rounded-lg shadow-md border-l-4 border-blue-500`}>
          <div className="flex items-center">
            <Droplets className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{t.humidity}</p>
              <p className="text-xl font-bold">{weatherData.current.humidity}%</p>
            </div>
          </div>
        </div>
        
        <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-4 rounded-lg shadow-md border-l-4 border-purple-500`}>
          <div className="flex items-center">
            <Wind className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{t.windSpeed}</p>
              <p className="text-xl font-bold">{weatherData.current.windSpeed} km/h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Recommendation System */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg shadow-md`}>
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
          <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
          {t.cropRecommendation}
        </h2>
        
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {t.nitrogen}
              </label>
              <input
                type="number"
                value={formData.nitrogen}
                onChange={(e) => setFormData({...formData, nitrogen: e.target.value})}
                className={`w-full p-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
                placeholder="80"
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {t.phosphorus}
              </label>
              <input
                type="number"
                value={formData.phosphorus}
                onChange={(e) => setFormData({...formData, phosphorus: e.target.value})}
                className={`w-full p-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
                placeholder="40"
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {t.potassium}
              </label>
              <input
                type="number"
                value={formData.potassium}
                onChange={(e) => setFormData({...formData, potassium: e.target.value})}
                className={`w-full p-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
                placeholder="20"
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {t.phLevel}
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.ph}
                onChange={(e) => setFormData({...formData, ph: e.target.value})}
                className={`w-full p-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
                placeholder="6.5"
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {t.temperature} (°C)
              </label>
              <input
                type="number"
                value={formData.temperature}
                onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                className={`w-full p-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
                placeholder="25"
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {t.humidity} (%)
              </label>
              <input
                type="number"
                value={formData.humidity}
                onChange={(e) => setFormData({...formData, humidity: e.target.value})}
                className={`w-full p-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
                placeholder="80"
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {t.area}
              </label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
                className={`w-full p-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
                placeholder="2"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-3 px-6 rounded-md hover:bg-green-600 transition duration-200 flex items-center justify-center font-medium"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                {t.analyzing}
              </>
            ) : (
              t.getRecommendation
            )}
          </button>
        </form>

        {/* Recommendation Results */}
        {recommendation && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-bold text-green-800 mb-3">
              {t.suggestedCrop}: {recommendation.crop}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>{t.confidence}:</strong> {recommendation.confidence}%
                </p>
                <p className="text-sm text-gray-600">
                  <strong>{t.estimatedYield}:</strong> {recommendation.yield} {language === 'hi' ? 'क्विंटल/हेक्टेयर' : language === 'en' ? 'quintal/hectare' : language === 'te' ? 'క్వింటల్/హెక్టార్' : 'குவிண்டல்/ஹெக்டேர்'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>{t.estimatedProfit}:</strong> ₹{recommendation.profit.toLocaleString()}/{language === 'hi' ? 'हेक्टेयर' : language === 'en' ? 'hectare' : language === 'te' ? 'హెక్టార్' : 'ஹெக்டேர்'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">{t.fertilizerSuggestion}:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {recommendation.fertilizer.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-gray-800 mb-2">{t.farmingTips}:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {recommendation.tips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderWeather = () => (
    <div className="space-y-6">
      {/* Current Weather */}
      <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <MapPin className="w-5 h-5 mr-2" />
              <span className="text-lg">{weatherData.location}</span>
            </div>
            <div className="text-4xl font-bold mb-2">{weatherData.current.temperature}°C</div>
            <p className="text-blue-100">{weatherData.current.description}</p>
          </div>
          <div className="text-right">
            {getWeatherIcon(weatherData.current.icon)}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-blue-300">
          <div className="flex items-center">
            <Droplets className="w-5 h-5 mr-2" />
            <span>{t.humidity}: {weatherData.current.humidity}%</span>
          </div>
          <div className="flex items-center">
            <Wind className="w-5 h-5 mr-2" />
            <span>{t.windSpeed}: {weatherData.current.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg shadow-md`}>
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
          <Calendar className="w-6 h-6 text-blue-500 mr-2" />
          {t.weatherForecast}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {weatherData.forecast.map((day, index) => (
            <div key={index} className={`text-center p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>{day.day}</div>
              <div className="flex justify-center mb-2">
                {getWeatherIcon(day.icon)}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{day.description}</div>
              <div className="text-sm">
                <span className="font-bold">{day.high}°</span>
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} ml-1`}>{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agricultural Warnings */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg shadow-md`}>
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
          <AlertTriangle className="w-6 h-6 text-orange-500 mr-2" />
          {t.agriculturalWarning}
        </h2>
        
        <div className="space-y-3">
          {weatherData.alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'high'
                  ? 'bg-red-50 border-red-500'
                  : alert.severity === 'medium'
                  ? 'bg-orange-50 border-orange-500'
                  : 'bg-yellow-50 border-yellow-500'
              } ${theme === 'dark' ? 'bg-opacity-20' : ''}`}
            >
              <div className="flex items-center mb-1">
                <AlertTriangle
                  className={`w-5 h-5 mr-2 ${
                    alert.severity === 'high'
                      ? 'text-red-500'
                      : alert.severity === 'medium'
                      ? 'text-orange-500'
                      : 'text-yellow-500'
                  }`}
                />
                <span className="font-medium">{alert.type}</span>
              </div>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{alert.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMarket = () => (
    <div className="space-y-6">
      {/* Market Prices */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg shadow-md`}>
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
          <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
          {t.marketPrices}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketPrices.map((item, index) => (
            <div key={index} className={`border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200'} rounded-lg p-4 hover:shadow-md transition duration-200`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{item.crop}</h3>
                {getTrendIcon(item.trend)}
              </div>
              
              <div className="text-2xl font-bold text-green-600 mb-1">
                ₹{item.price.toLocaleString()}
              </div>
              
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{item.unit}</div>
              
              <div className={`text-sm font-medium ${
                item.change > 0
                  ? 'text-green-600'
                  : item.change < 0
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}>
                {item.change > 0 ? '+' : ''}₹{item.change}
                {item.change !== 0 && (language === 'hi' ? ' आज' : language === 'en' ? ' today' : language === 'te' ? ' ఈరోజు' : ' இன்று')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAI = () => (
    <div className="space-y-4">
      <div className="max-w-4xl mx-auto w-full">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg h-[34rem] overflow-hidden flex flex-col border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>        
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center">
              <Bot className="w-6 h-6 mr-2" />
              {t.aiAdvisor}
            </h2>
            <p className="text-sm opacity-90">{t.askQuestion}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={clearChat} className="text-xs px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition">
              {language === 'en' ? 'New chat' : 'नया चैट'}
            </button>
          </div>
        </div>

        {/* Quick suggestion chips - sticky under header */}
        <div className={`px-4 pt-3 flex flex-wrap gap-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} sticky top-0 z-10 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          {[t.generalAdvice, t.marketPrices, t.weatherForecast].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => setInputMessage((prev) => (prev ? prev + '\n' + chip : chip))}
              className={`text-xs px-3 py-1 rounded-full border ${theme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'} transition`}
            >
              {chip}
            </button>
          ))}
        </div>

        <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 relative">
          {messages.map((message, idx) => {
            const isUser = message.isUser;
            const bubbleBase = isUser
              ? 'bg-green-500 text-white'
              : theme === 'dark'
              ? 'bg-gray-700 text-white'
              : 'bg-gray-100 text-gray-800';
            const isLatestAI = !isUser && idx === messages.length - 1;
            return (
              <div key={message.id} className={`flex items-start ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="mr-2 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold shadow">AI</div>
                )}
                <div className={`max-w-2xl ${bubbleBase} px-4 py-2 rounded-2xl shadow ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs ${isUser ? 'text-white/80' : 'text-gray-500'} font-medium`}>{isUser ? (language === 'en' ? 'You' : 'आप') : (language === 'en' ? 'Advisor' : 'सलाहकार')}</span>
                    <span className={`text-[10px] ${isUser ? 'text-white/70' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString(language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : language === 'ta' ? 'ta-IN' : 'en-IN')}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  {isLatestAI && (
                    <div className={`mt-2 flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <button
                        onClick={() => navigator.clipboard?.writeText(message.text)}
                        className={`text-xs px-2 py-1 rounded-full border ${theme === 'dark' ? 'border-gray-500 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-200'} transition`}
                        title={language === 'en' ? 'Copy' : 'कॉपी'}
                      >
                        {language === 'en' ? 'Copy' : 'कॉपी'}
                      </button>
                      <button
                        onClick={() => {
                          const lastUser = [...messages].reverse().find(m => m.isUser)?.text || '';
                          if (lastUser) {
                            setInputMessage(lastUser);
                            setTimeout(() => handleSendMessage(), 0);
                          }
                        }}
                        className={`text-xs px-2 py-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition`}
                        title={language === 'en' ? 'Regenerate' : 'पुनः उत्पन्न करें'}
                      >
                        {language === 'en' ? 'Regenerate' : 'पुनः उत्पन्न करें'}
                      </button>
                    </div>
                  )}
                </div>
                {isUser && (
                  <div className="ml-2 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold shadow">You</div>
                )}
              </div>
            );
          })}

          {chatLoading && (
            <div className="flex items-start justify-start">
              <div className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2`}>
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  {language === 'hi' ? 'सलाह तैयार की जा रही है…' : language === 'en' ? 'Preparing advice…' : language === 'te' ? 'సలహా సిద్ధమవుతోంది…' : 'ஆலோசனை தயாராகிறது…'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

          {showScrollButton && (
            <button
              onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className={`absolute bottom-4 right-4 rounded-full shadow-lg px-3 py-2 text-xs ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
              title={language === 'en' ? 'Scroll to bottom' : 'नीचे जाएँ'}
            >
              {language === 'en' ? 'Jump to latest' : 'नवीनतम पर जाएँ'}
            </button>
          )}
        </div>

        <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
              }}
              placeholder={t.typeMessage}
              rows={1}
              className={`flex-1 resize-none p-3 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'} rounded-full focus:ring-green-500 focus:border-green-500`}
            />
            <button
              onClick={handleSendMessage}
              disabled={chatLoading || !inputMessage.trim()}
              className="bg-green-500 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-green-600 transition duration-200 disabled:opacity-50"
              title={language === 'en' ? 'Send' : 'भेजें'}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{language === 'en' ? 'Press Enter to send, Shift+Enter for a new line' : 'भेजने के लिए Enter दबाएँ, नई पंक्ति के लिए Shift+Enter'}</p>
        </div>
        </div>
      </div>
    </div>
  );

  const renderAdvisory = () => (
    <div className="space-y-6">
      {/* General Farming Advice */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg shadow-md`}>
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
          <Info className="w-6 h-6 text-blue-500 mr-2" />
          {t.generalAdvice}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className={`p-4 ${theme === 'dark' ? 'bg-blue-900 bg-opacity-30 border-blue-400' : 'bg-blue-50 border-blue-200'} border rounded-lg`}>
              <h3 className={`font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'} mb-2`}>
                {language === 'hi' ? 'मानसून की तैयारी' : language === 'en' ? 'Monsoon Preparation' : language === 'te' ? 'వర్షాకాల తయారీ' : 'பருவமழை தயாரிப்பு'}
              </h3>
              <ul className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                <li>• {language === 'hi' ? 'खेत में उचित जल निकासी व्यवस्था करें' : language === 'en' ? 'Ensure proper drainage in fields' : language === 'te' ? 'పొలాల్లో సరైన నీటి నిష్కాసన వ్యవస్థ చేయండి' : 'வயல்களில் சரியான வடிகால் அமைப்பை உறுதி செய்யுங்கள்'}</li>
                <li>• {language === 'hi' ? 'बीजों का उपचार करके रखें' : language === 'en' ? 'Treat and store seeds properly' : language === 'te' ? 'విత్తనాలను శుద్ధి చేసి భద్రపరచండి' : 'விதைகளை சுத்தம் செய்து பாதுகாப்பாக வைக்கவும்'}</li>
                <li>• {language === 'hi' ? 'मिट्टी में जैविक खाद मिलाएं' : language === 'en' ? 'Add organic fertilizer to soil' : language === 'te' ? 'మట్టిలో సేంద్రీయ ఎరువులు కలపండి' : 'மண்ணில் இயற்கை உரங்களை கலக்கவும்'}</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className={`p-4 ${theme === 'dark' ? 'bg-green-900 bg-opacity-30 border-green-400' : 'bg-green-50 border-green-200'} border rounded-lg`}>
              <h3 className={`font-bold ${theme === 'dark' ? 'text-green-300' : 'text-green-800'} mb-2`}>
                {language === 'hi' ? 'जैविक खेती' : language === 'en' ? 'Organic Farming' : language === 'te' ? 'సేంద్రీయ వ్యవసాయం' : 'இயற்கை விவசாயம்'}
              </h3>
              <ul className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                <li>• {language === 'hi' ? 'गोबर खाद और कंपोस्ट का प्रयोग करें' : language === 'en' ? 'Use cow dung and compost' : language === 'te' ? 'పశు గోబర మరియు కంపోస్ట్ వాడండి' : 'மாட்டு எரு மற்றும் கம்போஸ்ட் பயன்படுத்துங்கள்'}</li>
                <li>• {language === 'hi' ? 'नीम तेल से कीट नियंत्रण' : language === 'en' ? 'Use neem oil for pest control' : language === 'te' ? 'కీటకాల నియంత్రణకు వేప నూనె వాడండి' : 'பூச்சி கட்டுப்பாட்டுக்கு வேப்ப எண்ணெய் பயன்படுத்துங்கள்'}</li>
                <li>• {language === 'hi' ? 'फसल चक्र अपनाएं' : language === 'en' ? 'Practice crop rotation' : language === 'te' ? 'పంట మార్పిడి చేయండి' : 'பயிர் சுழற்சி முறையை பின்பற்றுங்கள்'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Government Schemes */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg shadow-md`}>
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
          <Globe className="w-6 h-6 text-green-500 mr-2" />
          {t.govSchemes}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} rounded-lg p-4 hover:shadow-md transition duration-200`}>
            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>
              {language === 'hi' ? 'प्रधानमंत्री किसान सम्मान निधि' : language === 'en' ? 'PM Kisan Samman Nidhi' : language === 'te' ? 'ప్రధానమంత్రి కిసాన్ సమ్మాన్ నిధి' : 'பிரதமர் கிசான் சம்மான் நிதி'}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
              {language === 'hi' ? 'सभी किसान परिवारों को ₹6000 प्रति वर्ष की आर्थिक सहायता' : language === 'en' ? '₹6000 per year financial assistance to all farmer families' : language === 'te' ? 'అన్ని రైతు కుటుంబాలకు సంవత్సరానికి ₹6000 ఆర్థిక సహాయం' : 'அனைத்து விவசாயி குடும்பங்களுக்கும் ஆண்டுக்கு ₹6000 நிதி உதவி'}
            </p>
            <div className={`flex items-center text-sm text-blue-600`}>
              <Phone className="w-4 h-4 mr-1" />
              14447
            </div>
          </div>
          
          <div className={`border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} rounded-lg p-4 hover:shadow-md transition duration-200`}>
            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>
              {language === 'hi' ? 'प्रधानमंत्री फसल बीमा योजना' : language === 'en' ? 'PM Fasal Bima Yojana' : language === 'te' ? 'ప్రధానమంత్రి ఫసల్ బీమా యోజన' : 'பிரதமர் பசல் பீமா யோஜனா'}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
              {language === 'hi' ? 'प्राकृतिक आपदाओं से होने वाले नुकसान का बीमा' : language === 'en' ? 'Insurance for losses due to natural disasters' : language === 'te' ? 'ప్రకృతి వైపరీత్యాల వల్ల కలిగే నష్టాలకు బీమా' : 'இயற்கை பேரிடர்களால் ஏற்படும் இழப்புகளுக்கு காப்பீடு'}
            </p>
            <div className={`flex items-center text-sm text-blue-600`}>
              <Phone className="w-4 h-4 mr-1" />
              14447
            </div>
          </div>
          
          <div className={`border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} rounded-lg p-4 hover:shadow-md transition duration-200`}>
            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>
              {language === 'hi' ? 'किसान क्रेडिट कार्ड' : language === 'en' ? 'Kisan Credit Card' : language === 'te' ? 'కిసాన్ క్రెడిట్ కార్డ్' : 'கிசான் கிரெடிட் கார்டு'}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
              {language === 'hi' ? 'कम ब्याज दर पर कृषि ऋण की सुविधा' : language === 'en' ? 'Agricultural loan facility at low interest rates' : language === 'te' ? 'తక్కువ వడ్డీ రేటుతో వ్యవసాయ రుణ సౌకర్యం' : 'குறைந்த வட்டி விகிதத்தில் விவசாய கடன் வசதி'}
            </p>
            <div className={`flex items-center text-sm text-blue-600`}>
              <Phone className="w-4 h-4 mr-1" />
              180030001090
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className={`${theme === 'dark' ? 'bg-red-900 bg-opacity-30 border-red-400' : 'bg-red-50 border-red-200'} border p-6 rounded-lg`}>
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-red-300' : 'text-red-800'} mb-4 flex items-center`}>
          <Phone className="w-6 h-6 mr-2" />
          {t.emergencyContacts}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>
              {language === 'hi' ? 'किसान हेल्पलाइन' : language === 'en' ? 'Farmer Helpline' : language === 'te' ? 'రైతు హెల్ప్‌లైన్' : 'விவசாயி உதவி எண்'}
            </h3>
            <p className="text-2xl font-bold text-green-600">1800-180-1551</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {language === 'hi' ? '24×7 निःशुल्क सेवा' : language === 'en' ? '24×7 Free Service' : language === 'te' ? '24×7 ఉచిత సేవ' : '24×7 இலவச சேவை'}
            </p>
          </div>
          
          <div>
            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>
              {language === 'hi' ? 'मौसम चेतावनी' : language === 'en' ? 'Weather Warning' : language === 'te' ? 'వాతావరణ హెచ్చరిక' : 'வானிலை எச்சரிக்கை'}
            </h3>
            <p className="text-2xl font-bold text-blue-600">1800-180-1547</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {language === 'hi' ? 'IMD हेल्पलाइन' : language === 'en' ? 'IMD Helpline' : language === 'te' ? 'IMD హెల్ప్‌లైన్' : 'IMD உதவி எண்'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'weather':
        return renderWeather();
      case 'market':
        return renderMarket();
      case 'ai':
        return renderAI();
      case 'advisory':
        return renderAdvisory();
      default:
        return renderDashboard();
    }
  };

  return (
    <>
    <SignedIn>
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-200`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">स्मा</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t.appTitle}</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className={`appearance-none ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500`}
                >
                  <option value="hi">हिंदी</option>
                  <option value="en">English</option>
                  <option value="te">తెలుగు</option>
                  <option value="ta">தமிழ்</option>
                </select>
                <Languages className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} pointer-events-none`} />
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className={`p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors duration-200`}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
              </button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-green-600 border-green-600'
                      : theme === 'dark'
                      ? 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>
    </div>
    </SignedIn>
    <SignedOut>
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} shadow-lg rounded-xl p-8 w-full max-w-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h1 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Smart Agricultural Advisory</h1>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>Sign in to continue</p>
          <SignInButton mode="modal">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-md py-2 font-medium">Sign in</button>
          </SignInButton>
        </div>
      </div>
    </SignedOut>
    </>
  );
}

export default App;