/**
 * Language Converter for Rural Education Hub
 * Supports translation of UI text to multiple languages
 */

// Current active language
let currentLanguage = 'en';

// Translation dictionaries
const translations = {
    en: {
        'signup': 'Sign Up',
        'govt-schemes': 'Government Educational Schemes',
        'select-state': 'Select State',
        'all-india': 'All India (Central Schemes)',
        'central-schemes': 'Central Government Schemes',
        'state-schemes': 'State Government Schemes',
        'learn-more': 'Learn More'
    },
    hi: {
        'signup': 'साइन अप',
        'govt-schemes': 'सरकारी शैक्षिक योजनाएं',
        'select-state': 'राज्य चुनें',
        'all-india': 'अखिल भारतीय (केंद्रीय योजनाएं)',
        'central-schemes': 'केंद्र सरकार की योजनाएं',
        'state-schemes': 'राज्य सरकार की योजनाएं',
        'learn-more': 'और जानें'
    },
    kn: {
        'signup': 'ಸೈನ್ ಅಪ್',
        'govt-schemes': 'ಸರ್ಕಾರಿ ಶೈಕ್ಷಣಿಕ ಯೋಜನೆಗಳು',
        'select-state': 'ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        'all-india': 'ಅಖಿಲ ಭಾರತ (ಕೇಂದ್ರ ಯೋಜನೆಗಳು)',
        'central-schemes': 'ಕೇಂದ್ರ ಸರ್ಕಾರದ ಯೋಜನೆಗಳು',
        'state-schemes': 'ರಾಜ್ಯ ಸರ್ಕಾರದ ಯೋಜನೆಗಳು',
        'learn-more': 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ'
    },
    te: {
        'signup': 'సైన్ అప్',
        'govt-schemes': 'ప్రభుత్వ విద్యా పథకాలు',
        'select-state': 'రాష్ట్రాన్ని ఎంచుకోండి',
        'all-india': 'అఖిల భారత (కేంద్ర పథకాలు)',
        'central-schemes': 'కేంద్ర ప్రభుత్వ పథకాలు',
        'state-schemes': 'రాష్ట్ర ప్రభుత్వ పథకాలు',
        'learn-more': 'మరింత తెలుసుకోండి'
    }
};

// Initialize language selection on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if language is stored in localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
        changeLanguage(savedLanguage);
    }
});

/**
 * Change the UI language
 * @param {string} lang - Language code ('en', 'hi', 'kn', 'te')
 */
function changeLanguage(lang) {
    if (!translations[lang]) {
        console.error(`Language ${lang} not supported`);
        return;
    }
    
    currentLanguage = lang;
    
    // Save language preference
    localStorage.setItem('selectedLanguage', lang);
    
    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Show toast notification for language change
    showLanguageChangeNotification(lang);
}

/**
 * Display a toast notification for language change
 * @param {string} lang - Language code
 */
function showLanguageChangeNotification(lang) {
    const languageNames = {
        'en': 'English',
        'hi': 'हिंदी (Hindi)',
        'kn': 'ಕನ್ನಡ (Kannada)',
        'te': 'తెలుగు (Telugu)'
    };
    
    const alertContainer = document.getElementById('mainAlertContainer');
    if (!alertContainer) return;
    
    const alertHTML = `
        <div class="alert alert-info alert-dismissible fade show" role="alert">
            Language changed to ${languageNames[lang]}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertContainer.innerHTML = alertHTML;
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        const alert = document.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 3000);
}

/**
 * Get translated text for a key
 * @param {string} key - Translation key
 * @returns {string} - Translated text
 */
function getTranslation(key) {
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
        return translations[currentLanguage][key];
    }
    
    // Fallback to English if translation not found
    return translations.en[key] || key;
} 