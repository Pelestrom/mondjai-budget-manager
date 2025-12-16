// @/lib/currencies.ts

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  searchTerms: string;
}

// Liste principale des devises standard (pays individuels)
export const currencies: Currency[] = [
  { code: 'FCFA', symbol: 'FCFA', name: 'Franc CFA', flag: '🌍', searchTerms: 'XAF FCFA Franc CFA Afrique Centrale Ouest' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', searchTerms: 'EUR Euro Europe €' },
  { code: 'USD', symbol: '$', name: 'Dollar américain', flag: '🇺🇸', searchTerms: 'USD Dollar USA US $' },
  { code: 'GBP', symbol: '£', name: 'Livre sterling', flag: '🇬🇧', searchTerms: 'GBP Livre Sterling Royaume-Uni UK £' },
  { code: 'JPY', symbol: '¥', name: 'Yen japonais', flag: '🇯🇵', searchTerms: 'JPY Yen Japon ¥' },
  { code: 'CNY', symbol: '¥', name: 'Yuan chinois', flag: '🇨🇳', searchTerms: 'CNY Yuan Chine ¥' },
  { code: 'MXN', symbol: '$', name: 'Peso mexicain', flag: '🇲🇽', searchTerms: 'MXN Peso Mexique $' },
  { code: 'ARS', symbol: '$', name: 'Peso argentin', flag: '🇦🇷', searchTerms: 'ARS Peso Argentine $' },
  { code: 'COP', symbol: '$', name: 'Peso colombien', flag: '🇨🇴', searchTerms: 'COP Peso Colombie $' },
  { code: 'ZAR', symbol: 'R', name: 'Rand sud-africain', flag: '🇿🇦', searchTerms: 'ZAR Rand Afrique Sud RSA' },
  { code: 'NGN', symbol: '₦', name: 'Naira nigérian', flag: '🇳🇬', searchTerms: 'NGN Naira Nigeria ₦' },
  { code: 'GHS', symbol: '₵', name: 'Cedi ghanéen', flag: '🇬🇭', searchTerms: 'GHS Cedi Ghana ₵' },
  { code: 'KES', symbol: 'KSh', name: 'Shilling kényan', flag: '🇰🇪', searchTerms: 'KES Shilling Kenya KSh' },
  { code: 'MAD', symbol: 'DH', name: 'Dirham marocain', flag: '🇲🇦', searchTerms: 'MAD Dirham Maroc DH' },
  { code: 'EGP', symbol: 'E£', name: 'Livre égyptienne', flag: '🇪🇬', searchTerms: 'EGP Livre Egypte E£' },
  { code: 'TND', symbol: 'DT', name: 'Dinar tunisien', flag: '🇹🇳', searchTerms: 'TND Dinar Tunisie DT' },
  { code: 'DZD', symbol: 'DA', name: 'Dinar algérien', flag: '🇩🇿', searchTerms: 'DZD Dinar Algerie DA' },
  { code: 'INR', symbol: '₹', name: 'Roupie indienne', flag: '🇮🇳', searchTerms: 'INR Roupie Inde ₹' },
  { code: 'BRL', symbol: 'R$', name: 'Real brésilien', flag: '🇧🇷', searchTerms: 'BRL Real Bresil R$' },
  { code: 'CAD', symbol: 'C$', name: 'Dollar canadien', flag: '🇨🇦', searchTerms: 'CAD Dollar Canada C$' },
  { code: 'AUD', symbol: 'A$', name: 'Dollar australien', flag: '🇦🇺', searchTerms: 'AUD Dollar Australie A$' },
  { code: 'CHF', symbol: 'CHF', name: 'Franc suisse', flag: '🇨🇭', searchTerms: 'CHF Franc Suisse' },
  { code: 'RUB', symbol: '₽', name: 'Rouble russe', flag: '🇷🇺', searchTerms: 'RUB Rouble Russie ₽' },
  { code: 'KRW', symbol: '₩', name: 'Won sud-coréen', flag: '🇰🇷', searchTerms: 'KRW Won Coree Sud ₩' },
  { code: 'SGD', symbol: 'S$', name: 'Dollar singapourien', flag: '🇸🇬', searchTerms: 'SGD Dollar Singapour S$' },
  { code: 'HKD', symbol: 'HK$', name: 'Dollar de Hong Kong', flag: '🇭🇰', searchTerms: 'HKD Dollar Hong Kong HK$' },
  { code: 'SEK', symbol: 'kr', name: 'Couronne suédoise', flag: '🇸🇪', searchTerms: 'SEK Couronne Suede kr' },
  { code: 'NOK', symbol: 'kr', name: 'Couronne norvégienne', flag: '🇳🇴', searchTerms: 'NOK Couronne Norvege kr' },
  { code: 'DKK', symbol: 'kr', name: 'Couronne danoise', flag: '🇩🇰', searchTerms: 'DKK Couronne Danemark kr' },
  { code: 'PLN', symbol: 'zł', name: 'Zloty polonais', flag: '🇵🇱', searchTerms: 'PLN Zloty Pologne zł' },
  { code: 'TRY', symbol: '₺', name: 'Livre turque', flag: '🇹🇷', searchTerms: 'TRY Livre Turquie ₺' },
  { code: 'THB', symbol: '฿', name: 'Baht thaïlandais', flag: '🇹🇭', searchTerms: 'THB Baht Thailande ฿' },
  { code: 'IDR', symbol: 'Rp', name: 'Roupie indonésienne', flag: '🇮🇩', searchTerms: 'IDR Roupie Indonesie Rp' },
  { code: 'MYR', symbol: 'RM', name: 'Ringgit malaisien', flag: '🇲🇾', searchTerms: 'MYR Ringgit Malaisie RM' },
  { code: 'PHP', symbol: '₱', name: 'Peso philippin', flag: '🇵🇭', searchTerms: 'PHP Peso Philippines ₱' },
  { code: 'VND', symbol: '₫', name: 'Dong vietnamien', flag: '🇻🇳', searchTerms: 'VND Dong Vietnam ₫' },
  { code: 'AED', symbol: 'AED', name: 'Dirham des EAU', flag: '🇦🇪', searchTerms: 'AED Dirham EAU Emirats' },
  { code: 'SAR', symbol: 'SR', name: 'Riyal saoudien', flag: '🇸🇦', searchTerms: 'SAR Riyal Arabie Saoudite SR' },
  { code: 'ILS', symbol: '₪', name: 'Shekel israélien', flag: '🇮🇱', searchTerms: 'ILS Shekel Israel ₪' },
  { code: 'CLP', symbol: '$', name: 'Peso chilien', flag: '🇨🇱', searchTerms: 'CLP Peso Chili $' },
  { code: 'PEN', symbol: 'S/', name: 'Sol péruvien', flag: '🇵🇪', searchTerms: 'PEN Sol Perou S/' },
  { code: 'UYU', symbol: '$', name: 'Peso uruguayen', flag: '🇺🇾', searchTerms: 'UYU Peso Uruguay $' },
  { code: 'CRC', symbol: '₡', name: 'Colon costaricain', flag: '🇨🇷', searchTerms: 'CRC Colon Costa Rica ₡' },
  { code: 'GTQ', symbol: 'Q', name: 'Quetzal guatémaltèque', flag: '🇬🇹', searchTerms: 'GTQ Quetzal Guatemala Q' },
  { code: 'HNL', symbol: 'L', name: 'Lempira hondurien', flag: '🇭🇳', searchTerms: 'HNL Lempira Honduras L' },
  { code: 'NIO', symbol: 'C$', name: 'Córdoba nicaraguayen', flag: '🇳🇮', searchTerms: 'NIO Cordoba Nicaragua C$' },
  { code: 'PAB', symbol: 'B/', name: 'Balboa panaméen', flag: '🇵🇦', searchTerms: 'PAB Balboa Panama B/' },
  { code: 'DOP', symbol: 'RD$', name: 'Peso dominicain', flag: '🇩🇴', searchTerms: 'DOP Peso Republique Dominicaine RD$' },
  { code: 'JMD', symbol: 'J$', name: 'Dollar jamaïcain', flag: '🇯🇲', searchTerms: 'JMD Dollar Jamaique J$' },
  { code: 'HTG', symbol: 'G', name: 'Gourde haïtienne', flag: '🇭🇹', searchTerms: 'HTG Gourde Haiti G' },
  { code: 'CUP', symbol: '₱', name: 'Peso cubain', flag: '🇨🇺', searchTerms: 'CUP Peso Cuba ₱' },
  { code: 'BSD', symbol: 'B$', name: 'Dollar bahaméen', flag: '🇧🇸', searchTerms: 'BSD Dollar Bahamas B$' },
  { code: 'TTD', symbol: 'TT$', name: 'Dollar de Trinité-et-Tobago', flag: '🇹🇹', searchTerms: 'TTD Dollar Trinite Tobago TT$' },
  { code: 'BBD', symbol: 'Bds$', name: 'Dollar barbadien', flag: '🇧🇧', searchTerms: 'BBD Dollar Barbade Bds$' },
  { code: 'XCD', symbol: 'EC$', name: 'Dollar des Caraïbes orientales', flag: '🇦🇬', searchTerms: 'XCD Dollar Caraibes EC$' },
  { code: 'GNF', symbol: 'FG', name: 'Franc guinéen', flag: '🇬🇳', searchTerms: 'GNF Franc Guinee FG' },
  { code: 'MGA', symbol: 'Ar', name: 'Ariary malgache', flag: '🇲🇬', searchTerms: 'MGA Ariary Madagascar Ar' },
  { code: 'MUR', symbol: '₨', name: 'Roupie mauricienne', flag: '🇲🇺', searchTerms: 'MUR Roupie Maurice ₨' },
  { code: 'SCR', symbol: '₨', name: 'Roupie seychelloise', flag: '🇸🇨', searchTerms: 'SCR Roupie Seychelles ₨' },
  { code: 'TZS', symbol: 'TSh', name: 'Shilling tanzanien', flag: '🇹🇿', searchTerms: 'TZS Shilling Tanzanie TSh' },
  { code: 'UGX', symbol: 'USh', name: 'Shilling ougandais', flag: '🇺🇬', searchTerms: 'UGX Shilling Ouganda USh' },
  { code: 'RWF', symbol: 'FRw', name: 'Franc rwandais', flag: '🇷🇼', searchTerms: 'RWF Franc Rwanda FRw' },
  { code: 'ETB', symbol: 'Br', name: 'Birr éthiopien', flag: '🇪🇹', searchTerms: 'ETB Birr Ethiopie Br' },
  { code: 'BWP', symbol: 'P', name: 'Pula botswanais', flag: '🇧🇼', searchTerms: 'BWP Pula Botswana P' },
  { code: 'NAD', symbol: 'N$', name: 'Dollar namibien', flag: '🇳🇦', searchTerms: 'NAD Dollar Namibie N$' },
  { code: 'MZN', symbol: 'MT', name: 'Metical mozambicain', flag: '🇲🇿', searchTerms: 'MZN Metical Mozambique MT' },
  { code: 'ZMW', symbol: 'ZK', name: 'Kwacha zambien', flag: '🇿🇲', searchTerms: 'ZMW Kwacha Zambie ZK' },
  { code: 'AOA', symbol: 'Kz', name: 'Kwanza angolais', flag: '🇦🇴', searchTerms: 'AOA Kwanza Angola Kz' },
  { code: 'CVE', symbol: '$', name: 'Escudo cap-verdien', flag: '🇨🇻', searchTerms: 'CVE Escudo Cap Vert $' },
  { code: 'GMD', symbol: 'D', name: 'Dalasi gambien', flag: '🇬🇲', searchTerms: 'GMD Dalasi Gambie D' },
  { code: 'LRD', symbol: 'L$', name: 'Dollar libérien', flag: '🇱🇷', searchTerms: 'LRD Dollar Liberia L$' },
  { code: 'SLL', symbol: 'Le', name: 'Leone sierra-léonais', flag: '🇸🇱', searchTerms: 'SLL Leone Sierra Leone Le' },
  { code: 'SDG', symbol: 'ج.س', name: 'Livre soudanaise', flag: '🇸🇩', searchTerms: 'SDG Livre Soudan' },
  { code: 'SSP', symbol: '£', name: 'Livre sud-soudanaise', flag: '🇸🇸', searchTerms: 'SSP Livre Soudan Sud £' },
  { code: 'SOS', symbol: 'Sh', name: 'Shilling somalien', flag: '🇸🇴', searchTerms: 'SOS Shilling Somalie Sh' },
  { code: 'DJF', symbol: 'Fdj', name: 'Franc djiboutien', flag: '🇩🇯', searchTerms: 'DJF Franc Djibouti Fdj' },
  { code: 'ERN', symbol: 'Nfk', name: 'Nakfa érythréen', flag: '🇪🇷', searchTerms: 'ERN Nakfa Erythree Nfk' },
  { code: 'BIF', symbol: 'FBu', name: 'Franc burundais', flag: '🇧🇮', searchTerms: 'BIF Franc Burundi FBu' },
  { code: 'CDF', symbol: 'FC', name: 'Franc congolais', flag: '🇨🇩', searchTerms: 'CDF Franc Congo RDC FC' },
  { code: 'STN', symbol: 'Db', name: 'Dobra santoméen', flag: '🇸🇹', searchTerms: 'STN Dobra Sao Tome Db' },
  { code: 'KMF', symbol: 'CF', name: 'Franc comorien', flag: '🇰🇲', searchTerms: 'KMF Franc Comores CF' },
  { code: 'MWK', symbol: 'MK', name: 'Kwacha malawite', flag: '🇲🇼', searchTerms: 'MWK Kwacha Malawi MK' },
  { code: 'SZL', symbol: 'E', name: 'Lilangeni eswatinien', flag: '🇸🇿', searchTerms: 'SZL Lilangeni Eswatini E' },
  { code: 'LSL', symbol: 'L', name: 'Loti lesothan', flag: '🇱🇸', searchTerms: 'LSL Loti Lesotho L' },
];

// Fonction utilitaire pour obtenir toutes les devises "affichables"
export interface DisplayCurrency {
  id: string;
  symbol: string;
  name: string;
  flag: string;
  searchTerms: string;
}

export const getAllDisplayCurrencies = (): DisplayCurrency[] => {
  const currenciesList: DisplayCurrency[] = currencies.map(curr => ({
    id: curr.code,
    symbol: curr.symbol,
    name: curr.name,
    flag: curr.flag,
    searchTerms: curr.searchTerms
  }));
  
  return currenciesList;
};