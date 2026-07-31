
export interface Landmark {
  id: number;
  name: string;
  lat: number;
  lng: number;
  direction?: "E" | "SE" | "S" | "SW" | "W" | "NW" | "N" | "NE";
  type: "temple" | "water" | "food" | "rest" | "toilet" | "medical" | "parking";
  description?: string;
  timings?: string;
  facilities?: string[];
  animationType: "glow" | "pulse" | "bounce";
  // Aṣṭa Lingam specific fields (admin-controlled)
  isAshtaLingam?: boolean;
  enableGlow?: boolean;
  enableAuraPulse?: boolean;
  enableSnakeAnimation?: boolean;
  premiumGlow?: boolean;
  glowColor?: string;
  auraColor?: string;
  iconSize?: "small" | "medium" | "large";
  imageUrl?: string;
}

export const ashtalingamTemples: Landmark[] = [
  { 
    id: 1, 
    name: "Indra Lingam", 
    lat: 12.229483310073505, 
    lng: 79.0703430098629, 
    direction: "E",
    type: "temple",
    description: "Eastern guardian temple dedicated to Indra.",
    timings: "5:00 AM - 12:00 PM, 4:00 PM - 9:00 PM",
    animationType: "glow"
  },
  { 
    id: 2, 
    name: "Agni Lingam", 
    lat: 12.224080028561055, 
    lng: 79.05944602335678, 
    direction: "SE",
    type: "temple",
    description: "Temple of fire in the southeast direction.",
    timings: "5:00 AM - 12:00 PM, 4:00 PM - 9:00 PM",
    animationType: "pulse"
  },
  { 
    id: 3, 
    name: "Yama Lingam", 
    lat: 12.226667712197772, 
    lng: 79.04440479452147, 
    direction: "S",
    type: "temple",
    description: "Southern temple dedicated to Yama, the god of death and dharma.",
    timings: "5:00 AM - 12:00 PM, 4:00 PM - 9:00 PM",
    animationType: "glow"
  },
  { 
    id: 4, 
    name: "Nirruti Lingam", 
    lat: 12.234797661555527, 
    lng: 79.0326646080156, 
    direction: "SW",
    type: "temple",
    description: "Southwest temple symbolizing protection from evil forces.",
    timings: "5:00 AM - 12:00 PM, 4:00 PM - 9:00 PM",
    animationType: "pulse"
  },
  { 
    id: 5, 
    name: "Varuna Lingam", 
    lat: 12.249635972006539, 
    lng: 79.03468761349393, 
    direction: "W",
    type: "temple",
    description: "Western temple dedicated to Varuna, the water deity.",
    timings: "5:00 AM - 12:00 PM, 4:00 PM - 9:00 PM",
    animationType: "glow"
  },
  { 
    id: 6, 
    name: "Vayu Lingam", 
    lat: 12.257855057137512, 
    lng: 79.04724113685128, 
    direction: "NW",
    type: "temple",
    description: "Northwest temple dedicated to Vayu, the wind god.",
    timings: "5:00 AM - 12:00 PM, 4:00 PM - 9:00 PM",
    animationType: "pulse"
  },
  { 
    id: 7, 
    name: "Kubera Lingam", 
    lat: 12.255457643485244, 
    lng: 79.06105515219264, 
    direction: "N",
    type: "temple",
    description: "Northern temple dedicated to Kubera, the lord of wealth.",
    timings: "5:00 AM - 12:00 PM, 4:00 PM - 9:00 PM",
    animationType: "glow"
  },
  { 
    id: 8, 
    name: "Esanya Lingam", 
    lat: 12.245425841039294, 
    lng: 79.07448486511593, 
    direction: "NE",
    type: "temple",
    description: "Northeast temple dedicated to Lord Shiva in Esanya direction.",
    timings: "5:00 AM - 12:00 PM, 4:00 PM - 9:00 PM",
    animationType: "pulse"
  },
];


// Water points and facilities along the path
export const waterPoints: Landmark[] = [
  { id: 101, name: "Sacred Water Point 1", lat: 12.2310, lng: 79.0635, type: 'water', animationType: 'bounce' },
  { id: 102, name: "Public Tap", lat: 12.2315, lng: 79.0665, type: 'water', animationType: 'bounce' },
  { id: 103, name: "Temple Water", lat: 12.2285, lng: 79.0695, type: 'water', animationType: 'bounce' },
  { id: 104, name: "Drinking Water", lat: 12.2250, lng: 79.0720, type: 'water', animationType: 'bounce' },
  { id: 105, name: "Fresh Water Point", lat: 12.2210, lng: 79.0705, type: 'water', animationType: 'bounce' },
  { id: 106, name: "Community Tap", lat: 12.2180, lng: 79.0650, type: 'water', animationType: 'bounce' },
  { id: 107, name: "Well Water", lat: 12.2190, lng: 79.0590, type: 'water', animationType: 'bounce' },
  { id: 108, name: "Sacred Spring", lat: 12.2230, lng: 79.0575, type: 'water', animationType: 'bounce' },
];

// Rest areas and shelters
export const restAreas: Landmark[] = [
  { 
    id: 201, 
    name: "Pilgrim Rest Shelter 1", 
    lat: 12.2320, 
    lng: 79.0660, 
    type: 'rest',
    facilities: ['Seating', 'Shade', 'Water'],
    animationType: 'pulse'
  },
  { 
    id: 202, 
    name: "Community Rest Area", 
    lat: 12.2290, 
    lng: 79.0690, 
    type: 'rest',
    facilities: ['Benches', 'Roof', 'Clean restrooms'],
    animationType: 'pulse'
  },
  { 
    id: 203, 
    name: "Dharamshala Rest", 
    lat: 12.2260, 
    lng: 79.0710, 
    type: 'rest',
    facilities: ['Rooms available', 'Free stay', 'Basic amenities'],
    animationType: 'pulse'
  },
  { 
    id: 204, 
    name: "Pilgrim Shelter", 
    lat: 12.2200, 
    lng: 79.0680, 
    type: 'rest',
    facilities: ['Covered area', 'Seating', 'Water nearby'],
    animationType: 'pulse'
  },
];

// Food stalls and restaurants
export const foodPoints: Landmark[] = [
  { 
    id: 301, 
    name: "Prasadam Stall", 
    lat: 12.2308, 
    lng: 79.0642, 
    type: 'food',
    description: "Free temple prasadam distribution",
    timings: "6:00 AM - 8:00 PM",
    animationType: 'glow'
  },
  { 
    id: 302, 
    name: "Annadhanam Center", 
    lat: 12.2295, 
    lng: 79.0675, 
    type: 'food',
    description: "Free meals for pilgrims",
    timings: "11:00 AM - 2:00 PM, 7:00 PM - 9:00 PM",
    animationType: 'glow'
  },
  { 
    id: 303, 
    name: "Tea Stall", 
    lat: 12.2275, 
    lng: 79.0700, 
    type: 'food',
    description: "Hot tea and light snacks",
    timings: "5:00 AM - 11:00 PM",
    animationType: 'pulse'
  },
  { 
    id: 304, 
    name: "South Indian Restaurant", 
    lat: 12.2240, 
    lng: 79.0715, 
    type: 'food',
    description: "Traditional vegetarian meals",
    timings: "7:00 AM - 10:00 PM",
    animationType: 'glow'
  },
];

// Toilet facilities
export const toiletFacilities: Landmark[] = [
  { id: 401, name: "Public Toilet 1", lat: 12.226011, lng: 79.045325, type: 'toilet', animationType: 'pulse' },
  { id: 402, name: "Public Toilet 2", lat: 12.224477, lng: 79.050760, type: 'toilet', animationType: 'pulse' },
  { id: 403, name: "Public Toilet 3", lat: 12.229939, lng: 79.039918, type: 'toilet', animationType: 'pulse' },
  { id: 404, name: "Public Toilet 4", lat: 12.232596, lng: 79.037723, type: 'toilet', animationType: 'pulse' },
  { id: 405, name: "Public Toilet 5", lat: 12.236004, lng: 79.032281, type: 'toilet', animationType: 'pulse' },
  { id: 406, name: "Public Toilet 6", lat: 12.237833, lng: 79.031868, type: 'toilet', animationType: 'pulse' },
  { id: 407, name: "Public Toilet 7", lat: 12.241237, lng: 79.031278, type: 'toilet', animationType: 'pulse' },
  { id: 408, name: "Public Toilet 8", lat: 12.250984, lng: 79.035850, type: 'toilet', animationType: 'pulse' },
  { id: 409, name: "Public Toilet 9", lat: 12.255791, lng: 79.044634, type: 'toilet', animationType: 'pulse' },
  { id: 410, name: "Public Toilet 10", lat: 12.257241, lng: 79.057436, type: 'toilet', animationType: 'pulse' },
  { id: 411, name: "Public Toilet 11", lat: 12.251318, lng: 79.067869, type: 'toilet', animationType: 'pulse' },
  { id: 412, name: "Public Toilet 12", lat: 12.248157, lng: 79.073393, type: 'toilet', animationType: 'pulse' },
  { id: 413, name: "Public Toilet 13", lat: 12.240493, lng: 79.073557, type: 'toilet', animationType: 'pulse' },
  { id: 414, name: "Public Toilet 14", lat: 12.239366, lng: 79.073820, type: 'toilet', animationType: 'pulse' },
  { id: 415, name: "Public Toilet 15", lat: 12.229205, lng: 79.068563, type: 'toilet', animationType: 'pulse' },
  { id: 416, name: "Public Toilet 16", lat: 12.225769, lng: 79.064526, type: 'toilet', animationType: 'pulse' },
  { id: 417, name: "Public Toilet 17", lat: 12.224905, lng: 79.063053, type: 'toilet', animationType: 'pulse' },
  { id: 418, name: "Public Toilet 18", lat: 12.223188, lng: 79.053931, type: 'toilet', animationType: 'pulse' },
  { id: 419, name: "Public Toilet 19", lat: 12.223946, lng: 79.052699, type: 'toilet', animationType: 'pulse' },
  { id: 420, name: "Public Toilet 20", lat: 12.232887, lng: 79.066886, type: 'toilet', animationType: 'pulse' },
  { id: 421, name: "Public Toilet 21", lat: 12.233094, lng: 79.066372, type: 'toilet', animationType: 'pulse' },
];

// Medical facilities
export const medicalPoints: Landmark[] = [
  { 
    id: 501, 
    name: "First Aid Center", 
    lat: 12.2305, 
    lng: 79.0655, 
    type: 'medical',
    description: "24/7 emergency medical assistance",
    facilities: ['Basic first aid', 'Emergency contact', 'Ambulance service'],
    animationType: 'pulse'
  },
  { 
    id: 502, 
    name: "Medical Camp", 
    lat: 12.2270, 
    lng: 79.0690, 
    type: 'medical',
    description: "Temporary medical camp during festivals",
    facilities: ['Doctor available', 'Free consultation', 'Basic medicines'],
    animationType: 'pulse'
  },
];

// Parking areas
export const parkingAreas: Landmark[] = [
  { 
    id: 601, 
    name: "Main Parking Area", 
    lat: 12.2300, 
    lng: 79.0630, 
    type: 'parking',
    description: "Large vehicle parking near temple entrance",
    facilities: ['Car parking', 'Bus parking', 'Security'],
    animationType: 'pulse'
  },
  { 
    id: 602, 
    name: "Two Wheeler Stand", 
    lat: 12.2280, 
    lng: 79.0680, 
    type: 'parking',
    description: "Motorcycle and bicycle parking",
    facilities: ['Two wheeler parking', 'Cycle stand'],
    animationType: 'pulse'
  },
];

// Combine all landmarks
export const allLandmarks: Landmark[] = [
  ...ashtalingamTemples,
  ...waterPoints,
  ...restAreas,
  ...foodPoints,
  ...toiletFacilities,
  ...medicalPoints,
  ...parkingAreas,
];

export const getLandmarksByType = (type: Landmark['type']) => {
  return allLandmarks.filter(landmark => landmark.type === type);
};