export const DISEASE_MAP = {
  'Chilli __Whitefly': {
    en: 'Chili Whitefly',
    id: 'Hama Kutu Kebul (Kutu Putih)'
  },
  'Chilli __Yellowish': {
    en: 'Chili Yellowish Leaf',
    id: 'Daun Menguning'
  },
  'Chilli__Damping_Off': {
    en: 'Damping Off',
    id: 'Rebah Semai (Busuk Batang Muda)'
  },
  'Chilli__Leaf_Curl_Virus': {
    en: 'Chili Leaf Curl Virus',
    id: 'Virus Keriting Daun'
  },
  'Chilli__Leaf_Spot': {
    en: 'Leaf Spot',
    id: 'Bercak Daun (Cercospora)'
  },
  'Chilli__Veinal_Mottle_Virus': {
    en: 'Chili Veinal Mottle Virus',
    id: 'Virus Mosaik Daun'
  },
  'Chilli___healthy': {
    en: 'Healthy Chili Leaf',
    id: 'Daun Sehat'
  }
};

export function getDiseaseTranslation(rawName) {
  if (!rawName) return { en: 'Unknown', id: 'Tidak Diketahui' };
  
  // Clean rawName (normalizes whitespace and potential casing)
  const cleaned = rawName.trim().replace(/\s+/g, ' ');
  
  if (DISEASE_MAP[rawName]) {
    return DISEASE_MAP[rawName];
  }
  if (DISEASE_MAP[cleaned]) {
    return DISEASE_MAP[cleaned];
  }
  
  // Fallbacks for pattern matches
  const lower = rawName.toLowerCase();
  if (lower.includes('whitefly')) return DISEASE_MAP['Chilli __Whitefly'];
  if (lower.includes('yellow')) return DISEASE_MAP['Chilli __Yellowish'];
  if (lower.includes('damping')) return DISEASE_MAP['Chilli__Damping_Off'];
  if (lower.includes('curl')) return DISEASE_MAP['Chilli__Leaf_Curl_Virus'];
  if (lower.includes('spot')) return DISEASE_MAP['Chilli__Leaf_Spot'];
  if (lower.includes('mottle')) return DISEASE_MAP['Chilli__Veinal_Mottle_Virus'];
  if (lower.includes('healthy') || lower.includes('sehat')) return DISEASE_MAP['Chilli___healthy'];

  return { en: rawName, id: rawName };
}

export function formatDiseaseName(rawName) {
  const trans = getDiseaseTranslation(rawName);
  return `${trans.en} (${trans.id})`;
}
