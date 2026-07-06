import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const LanguageContext = createContext(null);

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' }
];

const LOCAL_TRANSLATIONS = {
  en: {
    // Nav
    dashboard: 'Dashboard',
    predictor: 'Crop Predictor',
    detector: 'Disease Detector',
    market: 'Market Intelligence',
    profile: 'Profile Settings',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    brand: 'CropAI',
    
    // Common
    loading: 'Loading...',
    save: 'Save Changes',
    submit: 'Submit',
    cancel: 'Cancel',
    delete: 'Delete',
    back: 'Back',
    severity: 'Severity',
    confidence: 'Confidence',
    status: 'Status',
    date: 'Date',
    treatments: 'Treatment Recommendations',
    
    // Home
    heroTitle: 'Intelligent Farming for a Better Yield',
    heroSub: 'AI-powered crop recommendation, instant disease detection, and real-time market intelligence designed for modern agriculture.',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    featurePredictorTitle: 'Crop Recommendations',
    featurePredictorDesc: 'Input soil nutrients and weather conditions to find the optimal crops for your land.',
    featureDetectorTitle: 'Disease Detection',
    featureDetectorDesc: 'Upload a picture of your crops to diagnose pests and diseases instantly with treatments.',
    featureMarketTitle: 'Market Intelligence',
    featureMarketDesc: 'Track live prices across Indian states, forecast demand, and plan your harvest.',
    
    // Predictor Page
    soilHeader: 'Soil & Environment Analysis',
    soilSub: 'Provide soil and environmental metrics to get the best-suited crop recommendation.',
    nitrogen: 'Nitrogen (N)',
    phosphorus: 'Phosphorus (P)',
    potassium: 'Potassium (K)',
    temperature: 'Temperature (°C)',
    humidity: 'Humidity (%)',
    ph: 'pH Level (0-14)',
    rainfall: 'Rainfall (mm)',
    soilType: 'Soil Type',
    predictBtn: 'Run Recommendation Analysis',
    predicting: 'Processing Metrics...',
    resultTitle: 'Optimal Crop Recommended',
    matchScore: 'Confidence Score',
    altCrops: 'Alternative Recommendations',
    
    // Detector Page
    detectHeader: 'AI Crop Disease Diagnosis',
    detectSub: 'Upload a photo of crop leaves or stems to scan for pests, infections, and disease anomalies.',
    uploadArea: 'Drag & drop your crop image here, or click to browse files',
    uploadHint: 'Supports JPG, PNG up to 5MB',
    scanning: 'Scanning Leaf Tissue...',
    reportTitle: 'Diagnostic Report',
    detectedIssue: 'Detected Issue',
    remedies: 'Actionable Treatments',
    
    // Market Page
    marketHeader: 'Agricultural Market Intelligence',
    marketSub: 'Live pricing indexes, forward forecasts, and seasonal weather impact reports.',
    priceIndex: 'Live Mandi Prices',
    crop: 'Crop',
    state: 'State',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    avgPrice: 'Modal Price',
    trends: '6-Month Price Trends',
    forecasts: 'Market Demand Forecasts',
    sentiment: 'Sentiment',
    weatherImpact: 'Weather Market Impact Reports',
    
    // Profile Page
    profileHeader: 'Farmer Profile & Settings',
    profileSub: 'Manage your credentials, localization preferences, and farm dimensions.',
    username: 'Farmer Name',
    email: 'Email Address',
    farmLocation: 'Farm Location',
    farmSize: 'Farm Size (Acres)',
    cropsGrown: 'Active Crops Grown',
    dangerZone: 'Danger Zone',
    deleteAcc: 'Delete Account Permanently',
    feedback: 'Feedback',
    feedbackHeader: 'Farmer Feedback Board',
    feedbackSub: 'Help us improve CropAI. Share your experience using star ratings, text, or voice.',
    feedbackRating: 'Overall Rating',
    feedbackComment: 'Write your feedback',
    feedbackVoice: 'Voice Feedback',
    feedbackRecord: 'Record Voice Note',
    feedbackRecording: 'Recording... Click to Stop',
    feedbackPlaying: 'Playing Voice Note...',
    feedbackDeleteVoice: 'Delete Audio',
    feedbackSubmit: 'Submit Feedback',
    feedbackSuccess: 'Feedback submitted successfully!',
    feedbackRecent: 'Recent Farmer Reviews',
    feedbackDictate: 'Speech to Text Dictation',
    feedbackDictating: 'Listening... Speak now.',
    feedbackListen: 'Listen to Voice Feedback'
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    predictor: 'फसल प्रेडिक्टर',
    detector: 'रोग डिटेक्टर',
    market: 'बाजार मूल्य',
    profile: 'प्रोफाइल सेटिंग्स',
    logout: 'लॉगआउट',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    brand: 'क्रॉप-एआई',
    loading: 'लोड हो रहा है...',
    save: 'बदलाव सहेजें',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    back: 'पीछे जाएं',
    severity: 'तीव्रता',
    confidence: 'आत्मविश्वास',
    status: 'स्थिति',
    date: 'तारीख',
    treatments: 'उपचार सिफारिशें',
    heroTitle: 'बेहतर उपज के लिए स्मार्ट खेती',
    heroSub: 'आधुनिक कृषि के लिए डिज़ाइन की गई एआई-संचालित फसल सिफारिश, तत्काल बीमारी का पता लगाने और वास्तविक समय के बाजार की जानकारी।',
    getStarted: 'शुरू करें',
    learnMore: 'अधिक जानें',
    featurePredictorTitle: 'फसल की सिफारिशें',
    featurePredictorDesc: 'अपनी भूमि के लिए इष्टतम फसलों को खोजने के लिए मिट्टी के पोषक तत्वों और मौसम की स्थिति दर्ज करें।',
    featureDetectorTitle: 'बीमारी का पता लगाना',
    featureDetectorDesc: 'उपचार के साथ तुरंत कीटों और बीमारियों का निदान करने के लिए अपनी फसलों की एक तस्वीर अपलोड करें।',
    featureMarketTitle: 'बाजार की जानकारी',
    featureMarketDesc: 'भारतीय राज्यों में लाइव कीमतों को ट्रैक करें, मांग का पूर्वानुमान लगाएं और अपनी फसल की योजना बनाएं।',
    soilHeader: 'मिट्टी और पर्यावरण विश्लेषण',
    soilSub: 'सबसे उपयुक्त फसल की सिफारिश प्राप्त करने के लिए मिट्टी और पर्यावरणीय मेट्रिक्स प्रदान करें।',
    nitrogen: 'नाइट्रोजन (N)',
    phosphorus: 'फास्फोरस (P)',
    potassium: 'पोटेशियम (K)',
    temperature: 'तापमान (°C)',
    humidity: 'आर्द्रता (%)',
    ph: 'पीएच स्तर (0-14)',
    rainfall: 'वर्षा (mm)',
    soilType: 'मिट्टी का प्रकार',
    predictBtn: 'सिफारिश विश्लेषण चलाएं',
    predicting: 'मेट्रिक्स संसाधित हो रहे हैं...',
    resultTitle: 'अनुशंसित इष्टतम फसल',
    matchScore: 'आत्मविश्वास स्कोर',
    altCrops: 'वैकल्पिक सिफारिशें',
    detectHeader: 'एआई फसल रोग निदान',
    detectSub: 'कीटों, संक्रमणों और बीमारी की विसंगतियों को स्कैन करने के लिए फसल की पत्तियों या तनों की एक तस्वीर अपलोड करें।',
    uploadArea: 'अपनी फसल की छवि यहाँ खींचें और छोड़ें, या फ़ाइलें ब्राउज़ करने के लिए क्लिक करें',
    uploadHint: '5MB तक JPG, PNG का समर्थन करता है',
    scanning: 'पत्ती के ऊतकों को स्कैन किया जा रहा है...',
    reportTitle: 'नैदानिक रिपोर्ट',
    detectedIssue: 'पता चली बीमारी',
    remedies: 'उपयोगी उपचार',
    marketHeader: 'कृषि बाजार खुफिया जानकारी',
    marketSub: 'लाइव मूल्य सूचकांक, भविष्य के पूर्वानुमान और मौसमी मौसम प्रभाव रिपोर्ट।',
    priceIndex: 'लाइव मंडी दरें',
    crop: 'फसल',
    state: 'राज्य',
    minPrice: 'न्यूनतम मूल्य',
    maxPrice: 'अधिकतम मूल्य',
    avgPrice: 'औसत मूल्य',
    trends: '6-महीने का मूल्य रुझान',
    forecasts: 'बाजार की मांग का पूर्वानुमान',
    sentiment: 'मार्केट सेंटिमेंट',
    weatherImpact: 'मौसम बाजार प्रभाव रिपोर्ट',
    profileHeader: 'किसान प्रोफाइल और सेटिंग्स',
    profileSub: 'अपनी साख, स्थानीयकरण प्राथमिकताओं और खेत के आयामों का प्रबंधन करें।',
    username: 'किसान का नाम',
    email: 'ईमेल पता',
    farmLocation: 'खेत का स्थान',
    farmSize: 'खेत का आकार (एकड़)',
    cropsGrown: 'सक्रिय उगाई जाने वाली फसलें',
    dangerZone: 'खतरे का क्षेत्र',
    deleteAcc: 'खाता स्थायी रूप से हटाएं',
    feedback: 'प्रतिक्रिया',
    feedbackHeader: 'किसान प्रतिक्रिया बोर्ड',
    feedbackSub: 'क्रॉप-एआई को बेहतर बनाने में हमारी सहायता करें। स्टार रेटिंग, टेक्स्ट या वॉयस का उपयोग करके अपना अनुभव साझा करें।',
    feedbackRating: 'समग्र रेटिंग',
    feedbackComment: 'अपनी प्रतिक्रिया लिखें',
    feedbackVoice: 'वॉयस प्रतिक्रिया',
    feedbackRecord: 'वॉयस नोट रिकॉर्ड करें',
    feedbackRecording: 'रिकॉर्डिंग हो रही है... रोकने के लिए क्लिक करें',
    feedbackPlaying: 'वॉयस नोट चल रहा है...',
    feedbackDeleteVoice: 'ऑडियो हटाएं',
    feedbackSubmit: 'प्रतिक्रिया जमा करें',
    feedbackSuccess: 'प्रतिक्रिया सफलतापूर्वक जमा हो गई!',
    feedbackRecent: 'हालिया किसान समीक्षाएं',
    feedbackDictate: 'आवाज से टेक्स्ट श्रुतलेख',
    feedbackDictating: 'सुन रहा है... अब बोलें।',
    feedbackListen: 'वॉयस फीडबैक सुनें'
  },
  ta: {
    dashboard: 'டாஷ்போர்டு',
    predictor: 'பயிர் கணிப்பான்',
    detector: 'நோய் கண்டறிதல்',
    market: 'சந்தை நிலவரம்',
    profile: 'சுயவிவர அமைப்புகள்',
    logout: 'வெளியேறு',
    login: 'உள்நுழை',
    register: 'பதிவுசெய்',
    brand: 'கிராப்-ஏஐ',
    loading: 'ஏற்றப்படுகிறது...',
    save: 'மாற்றங்களைச் சேமி',
    submit: 'சமர்ப்பி',
    cancel: 'ரத்துசெய்',
    delete: 'நீக்கு',
    back: 'பின்னால்',
    severity: 'தீவிரம்',
    confidence: 'நம்பகத்தன்மை स्कोर',
    status: 'நிலை',
    date: 'தேதி',
    treatments: 'சிகிச்சை பரிந்துரைகள்',
    heroTitle: 'சிறந்த மகசூலுக்கு புத்திசாலித்தனமான விவசாயம்',
    heroSub: 'நவீன விவசாயத்திற்காக வடிவமைக்கப்பட்ட AI-இயங்கும் பயிர் பரிந்துரை, உடனடி நோய் கண்டறிதல் மற்றும் நிகழ்நேர சந்தை நுண்ணறிவு.',
    getStarted: 'தொடங்குங்கள்',
    learnMore: 'மேலும் அறிய',
    featurePredictorTitle: 'பயிர் பரிந்துரைகள்',
    featurePredictorDesc: 'உங்கள் நிலத்திற்கு உகந்த பயிர்களைக் கண்டறிய மண்ணின் ஊட்டச்சத்துக்கள் மற்றும் வானிலை நிலைமைகளை உள்ளிடவும்.',
    featureDetectorTitle: 'நோய் கண்டறிதல்',
    featureDetectorDesc: 'பூச்சிகள் மற்றும் நோய்களை உடனடியாகக் கண்டறிந்து சிகிச்சையளிக்க உங்கள் பயிர்களின் படத்தை பதிவேற்றவும்.',
    featureMarketTitle: 'சந்தை நுண்ணறிவு',
    featureMarketDesc: 'இந்திய மாநிலங்களில் நேரடி விலைகளைக் கண்காணிக்கவும், தேவையைக் கணிக்கவும், உங்கள் அறுவடையைத் திட்டமிடவும்.',
    soilHeader: 'மண் மற்றும் சுற்றுச்சூழல் பகுப்பாய்வு',
    soilSub: 'மிகவும் பொருத்தமான பயிர் பரிந்துரையைப் பெற மண் மற்றும் சுற்றுச்சூழல் அளவீடுகளை வழங்கவும்.',
    nitrogen: 'நைட்ரஜன் (N)',
    phosphorus: 'பாஸ்பரஸ் (P)',
    potassium: 'பொட்டாசியம் (K)',
    temperature: 'வெப்பநிலை (°C)',
    humidity: 'ஈரப்பதம் (%)',
    ph: 'pH அளவு (0-14)',
    rainfall: 'மழைப்பொழிவு (mm)',
    soilType: 'மண் வகை',
    predictBtn: 'பரிந்துரை பகுப்பாய்வை இயக்கு',
    predicting: 'அளவீடுகள் செயலாக்கப்படுகின்றன...',
    resultTitle: 'பரிந்துரைக்கப்பட்ட உகந்த பயிர்',
    matchScore: 'நம்பிக்கை மதிப்பெண்',
    altCrops: 'மாற்று பரிந்துரைகள்',
    detectHeader: 'AI பயிர் நோய் கண்டறிதல்',
    detectSub: 'பூச்சிகள், தொற்றுநோய்கள் மற்றும் நோய் முரண்பாடுகளை ஸ்கேன் செய்ய பயிர் இலைகள் அல்லது தண்டுகளின் புகைப்படத்தைப் பதிவேற்றவும்.',
    uploadArea: 'உங்கள் பயிர் படத்தை இங்கே இழுத்து விடவும் அல்லது கோப்புகளை உலாவ கிளிக் செய்யவும்',
    uploadHint: '5MB வரை JPG, PNG ஐ ஆதரிக்கிறது',
    scanning: 'இலை திசுக்களை ஸ்கேன் செய்கிறது...',
    reportTitle: 'நோய் பகுப்பாய்வு அறிக்கை',
    detectedIssue: 'கண்டறியப்பட்ட நோய்',
    remedies: 'செயல்படக்கூடிய சிகிச்சைகள்',
    marketHeader: 'விவசாய சந்தை நுண்ணறிவு',
    marketSub: 'நேரடி விலை குறியீடுகள், எதிர்கால கணிப்புகள் மற்றும் வானிலை தாக்க அறிக்கைகள்.',
    priceIndex: 'நேரடி மண்டி விலைகள்',
    crop: 'பயிர்',
    state: 'மாநிலம்',
    minPrice: 'குறைந்தபட்ச விலை',
    maxPrice: 'அதிகபட்ச விலை',
    avgPrice: 'சராசரி விலை',
    trends: '6 மாத விலை போக்குகள்',
    forecasts: 'சந்தை தேவை கணிப்புகள்',
    sentiment: 'சந்தை உணர்வு',
    weatherImpact: 'வானிலை சந்தை தாக்க அறிக்கைகள்',
    profileHeader: 'விவசாயி சுயவிவரம் மற்றும் அமைப்புகள்',
    profileSub: 'உங்கள் சான்றுகள், மொழியமைப்பு மற்றும் பண்ணை பரிமாணங்களை நிர்வகிக்கவும்.',
    username: 'விவசாயி பெயர்',
    email: 'மின்னஞ்சல் முகவரி',
    farmLocation: 'பண்ணை அமைவிடம்',
    farmSize: 'பண்ணை அளவு (ஏக்கர்)',
    cropsGrown: 'பயிரிடப்படும் செயலில் உள்ள பயிர்கள்',
    dangerZone: 'ஆபத்தான பகுதி',
    deleteAcc: 'கணக்கை நிரந்தரமாக நீக்கு',
    feedback: 'கருத்து',
    feedbackHeader: 'விவசாயி கருத்து பலகை',
    feedbackSub: 'CropAI ஐ மேம்படுத்த எங்களுக்கு உதவுங்கள். நட்சத்திர மதிப்பீடுகள், உரை அல்லது குரல் மூலம் உங்கள் அனுபவத்தைப் பகிர்ந்து கொள்ளுங்கள்.',
    feedbackRating: 'ஒட்டுமொத்த மதிப்பீடு',
    feedbackComment: 'உங்கள் கருத்தை எழுதுங்கள்',
    feedbackVoice: 'குரல் கருத்து',
    feedbackRecord: 'குரல் குறிப்பை பதிவுசெய்',
    feedbackRecording: 'பதிவு செய்யப்படுகிறது... நிறுத்த கிளிக் செய்யவும்',
    feedbackPlaying: 'குரல் குறிப்பு ஒலிக்கிறது...',
    feedbackDeleteVoice: 'ஆடியோவை நீக்கு',
    feedbackSubmit: 'கருத்தைச் சமர்ப்பி',
    feedbackSuccess: 'கருத்து வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
    feedbackRecent: 'சமீபத்திய விவசாயி மதிப்புரைகள்',
    feedbackDictate: 'குரலில் இருந்து உரை தட்டச்சு',
    feedbackDictating: 'கேட்கிறது... இப்போது பேசுங்கள்.',
    feedbackListen: 'குரல் கருத்தைக் கேளுங்கள்'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(localStorage.getItem('language') || 'en');

  const setLanguage = (langCode) => {
    localStorage.setItem('language', langCode);
    setLanguageState(langCode);
  };

  const t = (key) => {
    const dict = LOCAL_TRANSLATIONS[language] || LOCAL_TRANSLATIONS['en'];
    return dict[key] || LOCAL_TRANSLATIONS['en'][key] || key;
  };

  // Text-to-Speech Helper Function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Match voice language
      const langMapping = {
        en: 'en-US',
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        bn: 'bn-IN',
        gu: 'gu-IN',
        mr: 'mr-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        pa: 'pa-IN'
      };

      utterance.lang = langMapping[language] || 'en-US';
      utterance.rate = 0.9; // Slightly slower for clarity
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported in this browser.');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languages: LANGUAGES, t, speakText, stopSpeaking }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export { LANGUAGES };
