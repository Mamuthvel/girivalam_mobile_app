import { useMemo } from "react";

export const POURNAMI_DATES = [
  // 2025
  { date: "2025-12-04", name: "Margashirsha Purnima" },

  // 2026
  { date: "2026-01-03", name: "Pausha Purnima" },
  { date: "2026-02-01", name: "Magha Purnima" },
  { date: "2026-03-03", name: "Phalguna Purnima" },
  { date: "2026-04-01", name: "Chaitra Purnima" },
  { date: "2026-05-01", name: "Vaishakha Purnima" },
  { date: "2026-05-30", name: "Jyeshtha Purnima (Adhika Purnima)" },
  { date: "2026-06-29", name: "Jyeshtha Purnima" },
  { date: "2026-07-29", name: "Ashadha Purnima" },
  { date: "2026-08-27", name: "Shravana Purnima" },
  { date: "2026-09-26", name: "Bhadrapada Purnima" },
  { date: "2026-10-25", name: "Ashwin Purnima" },
  { date: "2026-11-24", name: "Kartik Purnima" },
  { date: "2026-12-23", name: "Margashirsha Purnima" }
];

function toDate(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function usePournamiDates() {
  return useMemo(() => {
    const today = new Date();

    const mapped = POURNAMI_DATES.map(item => ({
      ...item,
      dateObj: toDate(item.date)
    }));

    const nextItem =
      mapped.find(item => item.dateObj >= today) ?? mapped[0];

    const nextPournami = nextItem.dateObj;

    const daysUntilPournami = Math.ceil(
      (nextPournami.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    return {
      dates: mapped,
      nextPournami,
      daysUntilPournami
    };
  }, []);
}
