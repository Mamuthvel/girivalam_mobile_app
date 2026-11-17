/**
 * Editorial crowd expectation per Purnima — festival months draw the largest
 * crowds. Shared by the full calendar and the per-month pages so a date is
 * never described as "Very High" on one page and "High" on another.
 */
export type CrowdLevel = "Very High" | "High" | "Medium";

export const CROWD_BY_NAME: Record<string, CrowdLevel> = {
    "Kartik Purnima": "Very High",      // Karthigai Deepam
    "Vaishakha Purnima": "Very High",   // Buddha Purnima
    "Magha Purnima": "Very High",
    "Phalguna Purnima": "Very High",    // Holi / Masi Magam
    "Ashadha Purnima": "Very High",     // Guru Purnima
    "Ashwin Purnima": "High",           // Sharad Purnima
    "Chaitra Purnima": "High",
    "Shravana Purnima": "High",
    "Margashirsha Purnima": "High",
    "Pausha Purnima": "High",
    "Bhadrapada Purnima": "Medium",
    "Jyeshtha Purnima": "Medium",
};

export const crowdFor = (name: string): CrowdLevel => {
    // An intercalary month is named "Adhika Jyeshtha Purnima" — match the base name.
    const base = name.replace(/^Adhika /, "");
    const key = Object.keys(CROWD_BY_NAME).find((k) => base.startsWith(k));
    return key ? CROWD_BY_NAME[key] : "High";
};
