import React, { useEffect, useRef, useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const GoogleTranslate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const dropdownRef = useRef(null);

  // Get current language from Google Translate cookie
  const getCurrentLanguage = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'googtrans') {
        const langCode = value.split('/')[2];
        const language = languages.find(lang => lang.code === langCode);
        return language ? language.name : 'English';
      }
    }
    return 'English';
  };

  // Language options with their Google Translate codes and native names
  const languages = [
    { name: 'English', nativeName: 'English', code: 'en' },
    { name: 'Hindi', nativeName: 'हिन्दी', code: 'hi' },
    { name: 'Malayalam', nativeName: 'മലയാളം', code: 'ml' },
    { name: 'Tamil', nativeName: 'தமிழ்', code: 'ta' },
    { name: 'Kannada', nativeName: 'ಕನ್ನಡ', code: 'kn' },
    { name: 'Konkani', nativeName: 'कोंकणी', code: 'gom' },
    { name: 'Bengali', nativeName: 'বাংলা', code: 'bn' },
    { name: 'Telugu', nativeName: 'తెలుగు', code: 'te' },
    { name: 'Marathi', nativeName: 'मराठी', code: 'mr' },
    { name: 'Gujarati', nativeName: 'ગુજરાતી', code: 'gu' },
    { name: 'Oriya', nativeName: 'ଓଡ଼ିଆ', code: 'or' },
    { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', code: 'pa' },
    { name: 'Assamese', nativeName: 'অসমীয়া', code: 'as' },
    { name: 'Urdu', nativeName: 'اردو', code: 'ur' },
    { name: 'Nepali', nativeName: 'नेपाली', code: 'ne' }
  ];

  // Initialize Google Translate (hidden)
  const googleTranslateElementInit = () => {
    if (window.google && window.google.translate) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,ml,ta,kn,gom,bn,te,mr,gu,or,pa,as,ur,ne",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilangPage: true
        },
        "google_translate_element_hidden"
      );
      
      // Set up global translation function
      window.translatePage = (langCode) => {
        document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
        window.location.reload();
      };
    }
  };

  useEffect(() => {
    // Set initial language from cookie
    setSelectedLanguage(getCurrentLanguage());
    
    // Check if Google Translate script is already loaded
    if (!window.google || !window.google.translate) {
      const addScript = document.createElement("script");
      addScript.setAttribute(
        "src",
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      );
      document.body.appendChild(addScript);
      window.googleTranslateElementInit = googleTranslateElementInit;
    } else {
      googleTranslateElementInit();
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to trigger Google Translate
  const translatePage = (languageCode) => {
    // Method 1: Try to find and trigger the Google Translate select element
    setTimeout(() => {
      const selectElement = document.querySelector('#google_translate_element_hidden select');
      if (selectElement) {
        selectElement.value = languageCode;
        selectElement.dispatchEvent(new Event('change'));
        return;
      }

      // Method 2: Use Google Translate's direct API if available
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        const translateElement = window.google.translate.TranslateElement.getInstance();
        if (translateElement) {
          translateElement.showBanner(true);
          const event = new CustomEvent('translate', { detail: { language: languageCode } });
          document.dispatchEvent(event);
        }
      }

      // Method 3: Direct URL method (most reliable)
      if (languageCode !== 'en') {
        const currentUrl = window.location.href;
        const baseUrl = currentUrl.split('#')[0].split('?')[0];
        const translateUrl = `https://translate.google.com/translate?sl=auto&tl=${languageCode}&u=${encodeURIComponent(baseUrl)}`;
        
        // Create a cookie to remember the language preference
        document.cookie = `googtrans=/en/${languageCode}; path=/; domain=${window.location.hostname}`;
        
        // Reload the page to apply translation
        window.location.reload();
      } else {
        // Reset to English
        document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        window.location.reload();
      }
    }, 100);
  };

  // Handle language selection
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.name);
    setIsOpen(false);
    translatePage(language.code);
  };

  // Hide Google Translate UI and banner
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Hide Google Translate banner and UI */
      .goog-te-banner-frame {
        display: none !important;
      }
      body {
        top: 0 !important;
      }
      .skiptranslate {
        display: none !important;
      }
      #google_translate_element_hidden {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Custom Language Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
          isOpen 
            ? 'bg-green-50 text-green-600 border border-green-200' 
            : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
        }`}
        aria-label="Select Language"
      >
        <Globe className="w-4 h-4" />
        <div className="hidden sm:flex flex-col items-start">
          <span className="font-medium text-xs leading-tight">{selectedLanguage}</span>
          {(() => {
            const currentLang = languages.find(lang => lang.name === selectedLanguage);
            return currentLang && currentLang.name !== currentLang.nativeName ? (
              <span className="text-xs text-gray-500 leading-tight">{currentLang.nativeName}</span>
            ) : null;
          })()}
        </div>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Custom Language Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[200px] max-h-60 overflow-y-auto">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language)}
              className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-50 hover:text-green-600 ${
                selectedLanguage === language.name 
                  ? 'bg-green-50 text-green-600 font-medium' 
                  : 'text-gray-700'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{language.name}</span>
                {language.name !== language.nativeName && (
                  <span className="text-xs text-gray-500 mt-0.5">{language.nativeName}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Hidden Google Translate Element */}
      <div id="google_translate_element_hidden" style={{ display: 'none' }}></div>
    </div>
  );
};

export default GoogleTranslate;