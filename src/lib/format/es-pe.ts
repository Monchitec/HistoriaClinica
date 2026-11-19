const MONTHS_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export function formatClinicalDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;

  const day = date.getDate();
  const month = MONTHS_SHORT[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatClinicalDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${formatClinicalDate(isoString)}, ${hours}:${minutes}`;
}

export function formatShortAxisDate(isoString: string): {
  dayMonth: string;
  year: string;
} {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return { dayMonth: isoString, year: "" };
  }
  return {
    dayMonth: `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`,
    year: String(date.getFullYear()),
  };
}

export function formatNumericValue(value: number, decimals?: number): string {
  if (typeof decimals === "number") {
    return value.toFixed(decimals);
  }
  return Number.isInteger(value)
    ? String(value)
    : String(Number(value.toFixed(2)));
}
