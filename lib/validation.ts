export const NAME_RE = /^[A-Za-z][A-Za-z\s.'-]{2,49}$/;
export const PHONE_RE = /^[6-9]\d{9}$/;
export const PIN_RE = /^[1-9]\d{5}$/;

export const sanitizePhone = (val: string) => {
  let d = val.replace(/\D/g, "");
  if (d.length > 10 && d.startsWith("91")) d = d.slice(2);
  return d.slice(0, 10);
};

export const sanitizeName = (val: string) =>
  val.replace(/[^A-Za-z\s.'-]/g, "").slice(0, 50);

export const sanitizeDigits = (val: string, max: number) =>
  val.replace(/\D/g, "").slice(0, max);

export const sanitizeDecimal = (val: string) => {
  const s = val.replace(/[^\d.]/g, "");
  const i = s.indexOf(".");
  if (i === -1) return s.slice(0, 12);
  return (s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, "")).slice(0, 12);
};

export const isNumericPos = (val?: string) => {
  if (!val) return false;
  const n = Number(val.replace(/,/g, ""));
  return !isNaN(n) && n > 0;
};

export const isPriceValid = (val?: string) => {
  if (!val) return false;
  const n = Number(val.replace(/,/g, ""));
  return !isNaN(n) && n >= 1000;
};