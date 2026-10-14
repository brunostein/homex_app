export function todayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function displayDate(value) { return value ? value.split('-').reverse().join('/') : ''; }
export function parseDate(value) {
  if (!/^\d{2}\/\d{2}\/[1-9]\d{3}$/.test(value)) return null;
  const iso = value.split('/').reverse().join('-');
  return Number.isFinite(Date.parse(iso + 'T00:00:00Z')) && new Date(iso + 'T00:00:00Z').toISOString().slice(0, 10) === iso ? iso : null;
}
export function dateInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.slice(0, 2) + (digits.length > 2 ? '/' + digits.slice(2, 4) : '') + (digits.length > 4 ? '/' + digits.slice(4) : '');
}
export function timeInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.slice(0, 2) + (digits.length > 2 ? ':' + digits.slice(2) : '');
}
export function validTime(value) { return !value || /^([01]\d|2[0-3]):[0-5]\d$/.test(value); }
export function dateHeading(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

export function weekRange(date = todayDate()) {
  const start = new Date(date + 'T00:00:00Z');
  start.setUTCDate(start.getUTCDate() - (start.getUTCDay() + 6) % 7);
  const end = new Date(start); end.setUTCDate(end.getUTCDate() + 6);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}
