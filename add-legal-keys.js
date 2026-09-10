const fs = require('fs');
const path = require('path');

function addLegalKeys(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find all locale exports and add legal keys before the closing };
  // We need to add them before the last }; of each locale object
  
  const legalKeysMap = {
    // Arabic
    ar: {
      legalTitular: "خوان كاميلو ياماس كارديناس (شخص طبيعي)",
      legalJurisdiction: "جمهورية كولومبيا",
      legalFramework: "القانون 1581 لعام 2012 (حماية البيانات / هابياس داتا) والقانون 527 لعام 1999 (التجارة الإلكترونية)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Hebrew
    he: {
      legalTitular: "חואן קמילו יאמאס קרדנאס (אדם טבעי)",
      legalJurisdiction: "רפובליקת קולומביה",
      legalFramework: "חוק 1581 של 2012 (הגנת מידע / Habeas Data) וחוק 527 של 1999 (מסחר אלקטרוני)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Farsi
    fa: {
      legalTitular: "خوان کامیلو یاماس کاردناس (شخص حقیقی)",
      legalJurisdiction: "جمهوری کلمبیا",
      legalFramework: "قانون ۱۵۸۱ سال ۲۰۱۲ (حفظ داده‌ها / Habeas Data) و قانون ۵۲۷ سال ۱۹۹۹ (تجارت الکترونیکی)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Turkish
    tr: {
      legalTitular: "Juan Camilo Llamas Cárdenas (Gerçek Kişi)",
      legalJurisdiction: "Kolombiya Cumhuriyeti",
      legalFramework: "2012 Yılında 1581 Sayılı Kanun (Veri Koruma / Habeas Data) ve 1999 Yılında 527 Sayılı Kanun (Elektronik Ticaret)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Georgian
    ka: {
      legalTitular: "ხუან კამილო јამას კარდენას (ფიზიკური პირი)",
      legalJurisdiction: "კოლუმბიის რესპუბლიკა",
      legalFramework: "2012 წლის 1581-ე კანონი (პირადი მონაცემთა დაცვა / Habeas Data) და 1999 წლის 527-ე კანონი (ელექტრონული კომერცია)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Armenian
    hy: {
      legalTitular: "Յուան Կամիլո Լյամաս Կարդենաս (Անձնականordo)",
      legalJurisdiction: "Կոլումբիայի Հանրապետություն",
      legalFramework: "2012 թ. 1581-ի օրենքը (Անձնական տվյալների պահպանություն / Habeas Data) և 1999 թ. 527-ի օրենքը (Էլեկտրոնական Գործունեություն)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Hindi
    hi: {
      legalTitular: "जुआन कैमिलो लामास कार्डेनास (प्राकृतिक व्यक्ति)",
      legalJurisdiction: "कोलंबिया गणराज्य",
      legalFramework: "2012 का कानून 1581 (डेटा सुरक्षा / Habeas Data) और 1999 का कानून 527 (इलेक्ट्रॉनिक कॉमर्स)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Urdu
    ur: {
      legalTitular: "جوان کیملو یاماس کارڈیناس (طبعی شخص)",
      legalJurisdiction: "جمہوریہ کولمبیا",
      legalFramework: "2012 کا قانون 1581 (ڈیٹا تحفظ / Habeas Data) اور 1999 کا قانون 527 (الیکٹرانکBiz)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Marathi
    mr: {
      legalTitular: "जुआन कॅमिलो ल्लामास कार्डेनास (सैसव व्यक्ती)",
      legalJurisdiction: "कोलंबिया गणराज्य",
      legalFramework: "2012 चा कायदा 1581 (डेटा संरक्षण / Habeas Data) आणि 1999 चा कायदा 527 (इलेक्ट्रॉनिक कॉमर्स)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Tamil
    ta: {
      legalTitular: "ஜுவான் காமிலோ யாமாஸ் கார்டெனாஸ் (இயற்கை நபர்)",
      legalJurisdiction: "கொலம்பியா குடியரசு",
      legalFramework: "2012 ஆம் ஆண்டின் சட்டம் 1581 (தரவு பாதுகாப்பு / Habeas Data) மற்றும் 1999 ஆம் ஆண்டின் சட்டம் 527 (மின்னணு வணிகம்)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Telugu
    te: {
      legalTitular: "జువాన్ కామిలో యామాస్ కార్డెనాస్ (సహజ వ్యక్తి)",
      legalJurisdiction: "కొలంబియా గణరాజ్యం",
      legalFramework: "2012వ.ts చట్టం 1581 (డేటా రక్షణ / Habeas Data) మరియు 1999వ.ts చట్టం 527 (విద్యుత్ వాణిజ్యం)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Bengali
    bn: {
      legalTitular: "জুয়ান কামিলো ল্লামাস কার্ডেনাস (প্রাকৃতিক ব্যক্তি)",
      legalJurisdiction: "কোলোম্বিয়া প্রজাতন্ত্র",
      legalFramework: "২০১২ সালের আইন ১৫৮১ (ডেটা সুরক্ষা / Habeas Data) এবং ১৯৯৯ সালের আইন ৫২৭ (ইলেকট্রনিক কমার্স)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Punjabi
    pa: {
      legalTitular: "ਜੁਆਨ ਕੈਮੀਲੋ ਲਾਮਾਸ ਕਾਰਡੇਨਾਸ (ਕੁਦਰਤੀ ਵਿਅਕਤੀ)",
      legalJurisdiction: "ਕੋਲੰਬੀਆ ਗਣਤੰਤਰ",
      legalFramework: "2012 ਦਾ ਕਾਨੂੰਨ 1581 (ਡੇਟਾ ਸੁਰੱਖਿਆ / Habeas Data) ਅਤੇ 1999 ਦਾ ਕਾਨੂੰਨ 527 (ਇਲੈਕਟ੍ਰੋਨਿਕ ਵਪਾਰ)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Gujarati
    gu: {
      legalTitular: "જુઆન કેમિલો લ્લામાસ કાર્ડેનાસ (કુદરતી વ્યક્તિ)",
      legalJurisdiction: "કોલોમ્બિયા ગણરાજ્ય",
      legalFramework: "2012નો કાયદો 1581 (ડેટા સુરક્ષા / Habeas Data) અને 1999નો કાયદો 527 (ઇલેક્ટ્રોનિક વ્યાપાર)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Kannada
    kn: {
      legalTitular: "ಜುವಾನ್ ಕಾಮಿಲೋ ಯಾಮಾಸ್ ಕಾರ್ಡೆನಾಸ್ (ಪ್ರಾಕೃತಿಕ ವ್ಯಕ್ತಿ)",
      legalJurisdiction: "ಕೊಲಂಬಿಯಾ ಗಣರಾಜ್ಯ",
      legalFramework: "2012ರ ಕಾನೂನು 1581 (ಡೇಟಾ ರಕ್ಷಣೆ / Habeas Data) ಮತ್ತು 1999ರ ಕಾನೂನು 527 (ವಿದ್ಯುತ್ ವ್ಯಾಪಾರ)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Malayalam
    ml: {
      legalTitular: "ജുാൻ കാമിലോ ല്ലാമാസ് കാർഡനാസ് (സ്വാഭാവിക വ്യക്തി)",
      legalJurisdiction: "കോളומ׬ബിയ ഗണരാജ്യം",
      legalFramework: "2012 ലെ നിയമം 1581 (ഡേറ്റ സംരക്ഷണം / Habeas Data) ആണ് 1999 ലെ നിയമം 527 (ഇലക്ട്രോണിക് കомер്സ്)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Nepali
    ne: {
      legalTitular: "जुअन क्यामिलो ल्लामास कार्डेनास (प्राकृतिक व्यक्ति)",
      legalJurisdiction: "कोलम्बिया गणतन्त्र",
      legalFramework: "२०१२ को ऐन १५८१ (डेटा सुरक्षा / Habeas Data) र १९९९ को ऐन ५२७ (इलेक्ट्रोनिक कमर्स)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Sinhala
    si: {
      legalTitular: "ජුවාන් කැමිලෝ ල්ලාමාස් කාර්ඩෙනාස් (ස්වභාවික ව්‍යක්තිය)",
      legalJurisdiction: "කොලම්බියා ජනරජය",
      legalFramework: "2012 අංක 1581 පනත (දත්ත ආරක්ෂාව / Habeas Data) සහ 1999 අංක 527 පනත (විද්‍යුත් වාණිජය)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Chinese
    zh: {
      legalTitular: "胡安·卡米洛·利亚马斯·卡德纳斯 (自然人)",
      legalJurisdiction: "哥伦比亚共和国",
      legalFramework: "2012年第1581号法律 (数据保护 / Habeas Data) 和1999年第527号法律 (电子商务)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Japanese
    ja: {
      legalTitular: "フアン・カミロ・リャマス・カルデナス (自然人)",
      legalJurisdiction: "コロンビア共和国",
      legalFramework: "2012年法律第1581号 (データ保護 / Habeas Data) および1999年法律第527号 (電子商取引)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Korean
    ko: {
      legalTitular: "후안 카밀로 리야마스 카르데나스 (자연인)",
      legalJurisdiction: "콜롬비아 공화국",
      legalFramework: "2012년 법률 제1581호 (데이터 보호 / Habeas Data) 및 1999년 법률 제527호 (전자상거래)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Vietnamese
    vi: {
      legalTitular: "Juan Camilo Llamas Cárdenas (Cá nhân tự nhiên)",
      legalJurisdiction: "Cộng hòa Colombia",
      legalFramework: "Luật số 1581 năm 2012 (Bảo vệ dữ liệu / Habeas Data) và Luật số 527 năm 1999 (Thương mại điện tử)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Thai
    th: {
      legalTitular: "จูอัน คาเมโญ โลลามาส คาร์เดนาส (บุคคลธรรมดา)",
      legalJurisdiction: "สาธารณรัฐโคลอมเบีย",
      legalFramework: "พระราชบัญญัติ 1581 พ.ศ. 2555 (การคุ้มครองข้อมูล / Habeas Data) และพระราชบัญญัติ 527 พ.ศ. 2542 (พาณิชย์อิเล็กทรอนิกส์)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Indonesian
    id: {
      legalTitular: "Juan Camilo Llamas Cárdenas (Orang Alami)",
      legalJurisdiction: "Republik Kolombia",
      legalFramework: "Undang-Undang No. 1581 Tahun 2012 (Perlindungan Data / Habeas Data) dan Undang-Undang No. 527 Tahun 1999 (Perdagangan Elektronik)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Malay
    ms: {
      legalTitular: "Juan Camilo Llamas Cárdenas (Orang Semulajadi)",
      legalJurisdiction: "Republik Colombia",
      legalFramework: "Akta 1581 Tahun 2012 (Perlindungan Data / Habeas Data) dan Akta 527 Tahun 1999 (Perdagangan Elektronik)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Mongolian
    mn: {
      legalTitular: "Хуан Камило Лламас Карденас (Эргэн Хүний Хувь)",
      legalJurisdiction: "Колंबын Бүгд Найрамдах Улс",
      legalFramework: "2012 оны 1581-р Хууль (Мэдээлэл Хамгаалалт / Habeas Data) болон 1999 оны 527-р Хууль (Электрон Худалдаа)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Burmese
    my: {
      legalTitular: "ဂျွန် ကက်မီလို လ်လာမစ်ကာဒီနာစ် (သဘာဝက<MyEntity> -- (ရှင်အားဂျင်စားစရာ / Habeas Data) နှင့် ၁၉၉၉ ခုနှစ် ၅၂၇ သီး (လက်ညွှန်ဇينيျပန္တတ်စီး)",
      legalJurisdiction: "ကိုလံဘီယာ ပြည်ထောင်စု",
      legalFramework: "၂၀၁၂ ခုနှစ် ၁၅၈၁ ဥပဒေ (ဒေတာဘာသာ സംရ العظمى / Habeas Data) နဲ ၁၉၉၉ ခုနှစ် ၅၂၇ ဥပဒေ (ဧလက်ထရိွနစ်စီးပွားရေး)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Khmer
    km: {
      legalTitular: "ហ៊ុយអាន កាមីលូ ល្មាស កាត្រីណាស (មនុស្សធម្មតា)",
      legalJurisdiction: "សាធារណរដ្ឋកូឡោះប៊ី",
      legalFramework: "ច្បាប់លេខ ១៥៨១ ឆ្នាំ ២០១២ (ការការពារទិន្នន័យ / Habeas Data) និង ច្បាប់លេខ ៥២៧ ឆ្នាំ ១៩៩៩ (វិបាយអេឡិចត្រូនិច)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Lao
    lo: {
      legalTitular: "ຈວານ ຄາມິລໍ ລາມາສ ກາດເນສ (ຄົນທົ່ວປະຕິທານ)",
      legalJurisdiction: "ສາທາລະນະລັດ ປະຊາທິປະໄຕ ຄົນໂລມເບຍ",
      legalFramework: "ກົດມະຍາດ 1581 ປີ 2012 (ການປ້ອງກັນຂໍ້ມູນ / Habeas Data) ແລະ ກົດມະຍາດ 527 ປີ 1999 (ການຄ້າຕ່າງໆອິເລັກໂຕຣນິກ)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Swahili
    sw: {
      legalTitular: "Juan Camilo Llamas Cárdenas (Mtu wa Asili)",
      legalJurisdiction: "Jamhuri ya Kolombia",
      legalFramework: "Sheria ya 1581 ya 2012 (Ulinzi wa Data / Habeas Data) na Sheria ya 527 ya 1999 (Biashara ya Electroniki)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
    // Afrikaans
    af: {
      legalTitular: "Juan Camilo Llamas Cárdenas (Natuurlike Persoon)",
      legalJurisdiction: "Republiek van Colombia",
      legalFramework: "Wet 1581 van 2012 (Databeskerming / Habeas Data) en Wet 527 van 1999 (Elektroniese Handel)",
      legalAuthority: "Superintendencia de Industria y Comercio (SIC)",
    },
  };

  const locales = Object.keys(legalKeysMap);
  
  locales.forEach(locale => {
    const keys = legalKeysMap[locale];
    const localeRegex = new RegExp(`export const ${locale}: Dict = \\{[\\s\\S]*?\\n\\};`, 'g');
    
    content = content.replace(localeRegex, (match) => {
      // Remove the trailing }; and add legal keys
      const withoutClosing = match.replace(/\n\};$/, '');
      return `${withoutClosing}
  legalTitular: "${keys.legalTitular}",
  legalJurisdiction: "${keys.legalJurisdiction}",
  legalFramework: "${keys.legalFramework}",
  legalAuthority: "${keys.legalAuthority}",
};
`;
    });
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added legal keys to:', filePath);
}

const dictDir = path.join(__dirname, 'services', 'frontend', 'src', 'lib', 'i18n', 'dictionaries');
['dict_lang4.ts', 'dict_lang5.ts', 'dict_lang6.ts'].forEach(f => {
  addLegalKeys(path.join(dictDir, f));
});