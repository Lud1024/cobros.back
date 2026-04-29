const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const isValidDateOnly = (value) => {
  if (typeof value !== 'string') return false;

  const match = value.match(DATE_ONLY_RE);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2100) return false;

  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
};

const parseDateOnlyLocal = (value) => {
  if (!isValidDateOnly(value)) return null;
  const [, year, month, day] = value.match(DATE_ONLY_RE);
  return new Date(Number(year), Number(month) - 1, Number(day), 12);
};

const todayDateOnly = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

module.exports = {
  isValidDateOnly,
  parseDateOnlyLocal,
  todayDateOnly,
};
