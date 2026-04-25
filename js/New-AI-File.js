// Corrected and optimized JavaScript file

let quranData = [];
let currentLanguage = 'arabic'; // Default language
let currentLanguageAdditionnal = '';

let Arabic = false;
let contextSwitch = true;

const HijryMonths = [
    "Muḥarram (مُحَرَّم)", "Ṣafar (صَفَر)", "Rabīʿ al-Awwal (رَبِيع ٱلْأَوَّل)", 
    "Rabīʿ ath-Thānī (رَبِيع ٱلثَّانِي)", "Jumādá al-Awwal (جُمَادَىٰ ٱلْأَوَّل)",
    "Jumādá ath-Thānī (جُمَادَىٰ ٱلثَّانِي)", "Rajab (رَجَب)", "Shaʿbān (شَعْبَان)",
    "Ramaḍān (رَمَضَان)", "Shawwāl (شَوَّال)", "Dhū al-Qaʿdah (ذُو ٱلْقَعْدَة)", "Dhū al-Ḥijjah (ذُو ٱلْحِجَّة)"
];

// Language translations
const translations = {
    en: {
        toggleOrder: "Revelation Order",
        context: "Surah Context",
        searchbutton: "Quran Search",
        searchbuttonSourat: "Surat Search",
        language: "Quran Language"
    },
    es: {
        toggleOrder: "Orden de revelación",
        context: "Contexto de la sura",
        searchbutton: "Búsqueda en el Corán",
        searchbuttonSourat: "Búsqueda de Surat",
        language: "Idioma del Corán"
    },
    fr: {
        toggleOrder: "Ordre de révélation",
        context: "Contexte de la sourate",
        searchbutton: "Recherche dans le Coran",
        searchbuttonSourat: "Recherche dans la sourate",
        language: "Langue du Coran"
    },
    ar: {
        toggleOrder: "ترتيب الوحي",
        context: "سياق السورة",
        searchbutton: "بحث في القرآن",
        searchbuttonSourat: "البحث في السورة",
        language: "لغة القرآن"
    }
};

// Detect browser language
const browserLanguage = navigator.language || navigator.userLanguage;

function changeLabelLanguage(language) {
    const langCode = language.split('-')[0];
    const toggleOrder = document.getElementById('toggleOrder');
    const context = document.getElementById('context');
    const searchbutton = document.getElementById('searchbutton');

    if (translations[langCode]) {
        toggleOrder.textContent = translations[langCode].toggleOrder;
        context.textContent = translations[langCode].context;
        searchbutton.textContent = translations[langCode].searchbutton;
    } else {
        toggleOrder.textContent = translations['en'].toggleOrder;
        context.textContent = translations['en'].context;
        searchbutton.textContent = translations['en'].searchbutton;
    }
}

changeLabelLanguage(browserLanguage);

async function loadQuranData() {
    const suraContext = document.getElementById('suraContent');
    suraContext.classList.replace("sura-contexte", "eraseDiv");

    const xmlFile = `data/quran-${currentLanguage}.xml`;
    Arabic = (currentLanguage === 'arabic');

    const currentDisplayedSura = document.getElementById('quranContainer');
    if (currentDisplayedSura.textContent.trim().length > 0) {
        const orgSurah = document.querySelector('.sura');
        const desSurahIndex = +orgSurah.getAttribute('id');
        return fetchAndParseQuran(xmlFile).then(() => {
            generateTOC();
            displaySingleSura(desSurahIndex);
            toggleArabicOptions();
        });
    } else {
        return fetchAndParseQuran(xmlFile).then(() => {
            generateTOC();
            displaySingleSura('0');
            toggleArabicOptions();
        });
    }
}

async function fetchAndParseQuran(xmlFile) {
    try {
        const response = await fetch(xmlFile);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const xmlString = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        const surahs = xmlDoc.getElementsByTagName("sura");
        quranData = Array.from(surahs).map((sura, index) => ({
            id: `${index}`,
            name: sura.getAttribute("name"),
            city: sura.getAttribute("city"),
            verses: Array.from(sura.getElementsByTagName("aya")).map(verse => ({
                number: verse.getAttribute("index"),
                text: verse.getAttribute("text")
            }))
        }));
    } catch (error) {
        console.error("Error fetching or parsing Quran XML:", error);
    }
}

function generateTOC() {
    const tocContainer = document.getElementById('tocContainer');
    tocContainer.innerHTML = '';

    const iconMapping = {
        Makkah: 'img/makkah-icon.png',
        Madinah: 'img/madinah-icon.png'
    };

    quranData.forEach((sura, index) => {
        const tocItem = document.createElement('div');
        tocItem.classList.add('toc-item');

        const icon = document.createElement('img');
        icon.src = iconMapping[sura.city];
        icon.alt = `${sura.city} icon`;
        icon.classList.add('city-icon');

        tocItem.textContent = `${index + 1}. ${sura.name}`;
        tocItem.appendChild(icon);
        tocItem.dataset.target = `${index}`;

        tocItem.addEventListener('click', function () {
            const suraContext = document.getElementById('suraContent');
            suraContext.classList.replace("sura-contexte", "eraseDiv");
            displaySingleSura(this.dataset.target);
        });

        tocContainer.appendChild(tocItem);
    });
}

function displaySingleSura(suraId) {
    const sura = quranData.find(sura => sura.id === suraId);
    if (!sura) return;

    const quranContainer = document.getElementById("quranContainer");
    quranContainer.innerHTML = "";

    const suraContainer = document.createElement("div");
    suraContainer.classList.add("sura");
    suraContainer.id = sura.id;

    const suraTitle = document.createElement("h2");
    suraTitle.id = 'suraTitle';
    suraTitle.textContent = `${+sura.id + 1} - ${sura.name}`;
    suraContainer.appendChild(suraTitle);

    sura.verses.forEach(verse => {
        const verseContainer = document.createElement("p");
        verseContainer.classList.add("verse");
        if (Arabic) {
            verseContainer.classList.add('right-align');
        }
        verseContainer.innerHTML = highlightText(verse.text, "");

        const verseIcon = document.createElement("span");
        verseIcon.classList.add("verse-icon");
        verseIcon.innerHTML = `<span class="icon-number">${verse.number}</span>`;
        verseContainer.appendChild(verseIcon);
        suraContainer.appendChild(verseContainer);
    });

    quranContainer.appendChild(suraContainer);
    quranContainer.classList.replace("eraseDiv", "textContainer");
    quranContainer.scrollTop = 0;
}

function highlightText(text, term) {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function toggleArabicOptions() {
    document.getElementById('arabic-options').style.display = Arabic ? 'block' : 'none';
}

window.addEventListener("load", async () => {
    const contentDiv = document.getElementById("quranContainer");
    const savedContent = localStorage.getItem("quranContainer");

    if (savedContent) {
        try {
            contentDiv.innerHTML = savedContent;
        } catch (error) {
            console.error("Failed to load saved content:", error);
            await loadQuranData();
        }
    } else {
        await loadQuranData();
    }
});

window.addEventListener("beforeunload", () => {
    const contentDiv = document.getElementById("quranContainer");
    localStorage.setItem("quranContainer", contentDiv.innerHTML);
});
