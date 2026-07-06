const express = require('express');
const router = express.Router();

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

// Dictionary of agricultural translations for high-fidelity offline translation
const TRANSLATION_DICTIONARY = {
  'hi': {
    'Crop Predictor': 'फसल प्रेडिक्टर',
    'Disease Detector': 'रोग डिटेक्टर',
    'Market Intelligence': 'बाजार मूल्य',
    'Dashboard': 'डैशबोर्ड',
    'Soil Nutrients': 'मिट्टी के पोषक तत्व',
    'Nitrogen': 'नाइट्रोजन',
    'Phosphorus': 'फास्फोरस',
    'Potassium': 'पोटैशियम',
    'Temperature': 'तापमान',
    'Humidity': 'आर्द्रता',
    'pH Level': 'पीएच स्तर',
    'Rainfall': 'वर्षा',
    'Soil Type': 'मिट्टी का प्रकार',
    'Get Recommendation': 'सिफारिश प्राप्त करें',
    'Disease Analysis Report': 'रोग विश्लेषण रिपोर्ट',
    'Severity': 'तीव्रता',
    'Confidence': 'विश्वास स्कोर',
    'Treatment Recommendations': 'उपचार सिफारिशें',
    'Crop Recommendation': 'फसल की सिफारिश',
    'Select Language': 'भाषा चुनें',
    'Rice': 'धान (चावल)',
    'Maize': 'मक्का',
    'Wheat': 'गेहूं',
    'Cotton': 'कपास',
    'Tomato': 'टमाटर'
  },
  'ta': {
    'Crop Predictor': 'பயிர் கணிப்பான்',
    'Disease Detector': 'நோய் கண்டறிதல்',
    'Market Intelligence': 'சந்தை நிலவரம்',
    'Dashboard': 'டாஷ்போர்டு',
    'Soil Nutrients': 'மண் சத்துக்கள்',
    'Nitrogen': 'நைட்ரஜன்',
    'Phosphorus': 'பாஸ்பரஸ்',
    'Potassium': 'பொட்டாசியம்',
    'Temperature': 'வெப்பநிலை',
    'Humidity': 'ஈரப்பதம்',
    'pH Level': 'பி.எச் அளவு',
    'Rainfall': 'மழைப்பொழிவு',
    'Soil Type': 'மண் வகை',
    'Get Recommendation': 'பரிந்துரையை பெறுக',
    'Disease Analysis Report': 'நோய் பகுப்பாய்வு அறிக்கை',
    'Severity': 'தீவிரம்',
    'Confidence': 'நம்பிக்கை மதிப்பெண்',
    'Treatment Recommendations': 'சிகிச்சை பரிந்துரைகள்',
    'Crop Recommendation': 'பயிர் பரிந்துரை',
    'Select Language': 'மொழியைத் தேர்ந்தெடுக்கவும்',
    'Rice': 'நெல் (அரிசி)',
    'Maize': 'சோளம் (மக்காச்சோளம்)',
    'Wheat': 'கோதுமை',
    'Cotton': 'பருத்தி',
    'Tomato': 'தக்காளி'
  },
  'te': {
    'Crop Predictor': 'పంట సిఫార్సుదారు',
    'Disease Detector': 'తెగులు గుర్తింపు',
    'Market Intelligence': 'మార్కెట్ విశ్లేషణ',
    'Dashboard': 'డాష్‌బోర్డ్',
    'Soil Nutrients': 'నేల పోషకాలు',
    'Nitrogen': 'నైట్రోజన్',
    'Phosphorus': 'ఫాస్పరస్',
    'Potassium': 'పొటాషియం',
    'Temperature': 'ఉష్ణోగ్రత',
    'Humidity': 'తేమ',
    'pH Level': 'పి.హెచ్ స్థాయి',
    'Rainfall': 'వర్షపాతం',
    'Soil Type': 'నేల రకం',
    'Get Recommendation': 'సిఫార్సు పొందండి',
    'Disease Analysis Report': 'తెగులు విశ్లేషణ నివేదిక',
    'Severity': 'తీవ్రత',
    'Confidence': 'విశ్వసనీయత స్కోరు',
    'Treatment Recommendations': 'నివారణ చర్యలు',
    'Crop Recommendation': 'పంట సిఫార్సు',
    'Select Language': 'భాషను ఎంచుకోండి',
    'Rice': 'వరి (బియ్యం)',
    'Maize': 'మొక్కజొన్న',
    'Wheat': 'గోధుమ',
    'Cotton': 'ప్రత్తి',
    'Tomato': 'టమోటా'
  },
  'bn': {
    'Crop Predictor': 'ফসল সুপারিশকারী',
    'Disease Detector': 'রোগ সনাক্তকরণ',
    'Market Intelligence': 'বাজারের খবর',
    'Dashboard': 'ড্যাশবোর্ড',
    'Soil Nutrients': 'মাটির পুষ্টি উপাদান',
    'Nitrogen': 'নাইট্রোজেন',
    'Phosphorus': 'ফসফরাস',
    'Potassium': 'পটাশিয়াম',
    'Temperature': 'তাপমাত্রা',
    'Humidity': 'আর্দ্রতা',
    'pH Level': 'পিএইচ স্তর',
    'Rainfall': 'বৃষ্টিপাত',
    'Soil Type': 'মাটির ধরন',
    'Get Recommendation': 'সুপারিশ পান',
    'Disease Analysis Report': 'রোগ বিশ্লেষণ রিপোর্ট',
    'Severity': 'তীব্রতা',
    'Confidence': 'আত্মবিশ্বাস স্কোর',
    'Treatment Recommendations': 'চিকিত্সা সুপারিশ',
    'Crop Recommendation': 'ফসল সুপারিশ',
    'Select Language': 'ভাষা নির্বাচন করুন',
    'Rice': 'ধান',
    'Maize': 'ভুট্টা',
    'Wheat': 'গম',
    'Cotton': 'তুলা',
    'Tomato': 'টমেটো'
  }
};

const LOCALIZED_CROP_INFO = {
  'Rice': {
    'en': {
      description: 'Rice is a tropical aquatic grass requiring substantial standing water and clayey-loam soils.',
      sowingTime: 'June - July (Kharif season)',
      irrigation: 'High (requires standing water)',
      advisory: 'Ensure fields have leveled bunds to hold standing water during the first 45 days after transplanting.'
    },
    'hi': {
      description: 'धान एक उष्णकटिबंधीय जलीय घास है जिसके लिए पर्याप्त खड़े पानी और दोमट मिट्टी की आवश्यकता होती है।',
      sowingTime: 'जून - जुलाई (खरीफ का मौसम)',
      irrigation: 'अधिक (खड़े पानी की आवश्यकता है)',
      advisory: 'यह सुनिश्चित करें कि रोपाई के पहले 45 दिनों के दौरान खड़े पानी को रोकने के लिए खेतों में मेड़ें बनी हों।'
    },
    'ta': {
      description: 'நெல் என்பது களிமண் கலந்த வண்டல் மண் மற்றும் கணிசமான தேங்கி நிற்கும் நீர் தேவைப்படும் ஒரு வெப்பமண்டல நீர்வாழ் புல் ஆகும்.',
      sowingTime: 'ஜூன் - ஜூலை (காரீஃப் பருவம்)',
      irrigation: 'அதிகம் (தேங்கி நிற்கும் நீர் தேவைப்படுகிறது)',
      advisory: 'நாற்று நட்ட முதல் 45 நாட்களுக்கு தேங்கி நிற்கும் நீரைத் தக்கவைக்க வயல்களில் வரப்புகள் சமமாக இருப்பதை உறுதி செய்யவும்.'
    }
  },
  'Maize': {
    'en': {
      description: 'Maize is a versatile cereal crop requiring well-drained loamy soils and warm temperatures.',
      sowingTime: 'June - July (Kharif), Oct - Nov (Rabi)',
      irrigation: 'Moderate',
      advisory: 'Prevent waterlogging as maize roots are highly sensitive to standing water.'
    },
    'hi': {
      description: 'मक्का एक बहुमुखी अनाज की फसल है जिसके लिए अच्छी जलनिकास वाली दोमट मिट्टी और गर्म तापमान की आवश्यकता होती है।',
      sowingTime: 'जून - जुलाई (खरीफ), अक्टूबर - नवंबर (रबी)',
      irrigation: 'मध्यम',
      advisory: 'जलभराव को रोकें क्योंकि मक्के की जड़ें खड़े पानी के प्रति अत्यधिक संवेदनशील होती हैं।'
    }
  }
};

// @route   GET /api/nlp/languages
// @desc    Get all supported languages
// @access  Public
router.get('/languages', (req, res) => {
  res.json({ success: true, count: LANGUAGES.length, data: LANGUAGES });
});

// @route   POST /api/nlp/translate
// @desc    Translate text keys
// @access  Public
router.post('/translate', (req, res) => {
  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ success: false, error: 'Text and targetLanguage are required' });
  }

  const langDict = TRANSLATION_DICTIONARY[targetLanguage];
  if (!langDict || targetLanguage === 'en') {
    return res.json({ success: true, translatedText: text }); // Return original if language not in dict or English
  }

  // If text is a string
  if (typeof text === 'string') {
    return res.json({ success: true, translatedText: langDict[text] || text });
  }

  // If text is an object/dictionary of key-values
  const translatedMap = {};
  for (const key in text) {
    translatedMap[key] = langDict[text[key]] || text[key];
  }

  res.json({ success: true, translatedText: translatedMap });
});

// @route   POST /api/nlp/local-recommendations
// @desc    Translate a recommendation object (crop and treatments)
// @access  Public
router.post('/local-recommendations', (req, res) => {
  const { crop, treatments, targetLanguage } = req.body;

  if (!crop || !targetLanguage) {
    return res.status(400).json({ success: false, error: 'Crop and targetLanguage are required' });
  }

  const langDict = TRANSLATION_DICTIONARY[targetLanguage];
  const localizedCrop = langDict && langDict[crop] ? langDict[crop] : crop;

  // Real translations could be added here. We fallback to standard dictionary mappings
  const localizedTreatments = (treatments || []).map(t => {
    // In production we can run a machine translation. Here we mock it or return original.
    return t; 
  });

  res.json({
    success: true,
    data: {
      crop: localizedCrop,
      treatments: localizedTreatments
    }
  });
});

// @route   GET /api/nlp/crop-info/:crop/:language
// @desc    Get localized crop details
// @access  Public
router.get('/crop-info/:crop/:language', (req, res) => {
  const { crop, language } = req.params;

  const cropInfo = LOCALIZED_CROP_INFO[crop];
  if (!cropInfo) {
    return res.json({
      success: true,
      data: {
        description: `${crop} is a widely cultivated crop with high nutritional value and market demand.`,
        sowingTime: 'Varies by region',
        irrigation: 'Moderate',
        advisory: 'Follow regional crop calendar and maintain standard weeding schedules.'
      }
    });
  }

  const localizedData = cropInfo[language] || cropInfo['en'];
  res.json({ success: true, data: localizedData });
});

module.exports = router;
