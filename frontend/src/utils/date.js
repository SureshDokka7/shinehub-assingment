export function defaultStartTime() {
  const date = new Date(Date.now() + 5 * 60_000);
  date.setSeconds(0, 0);
  return toDateTimeLocalValue(date);
}

export function toDateTimeLocalValue(date) {
  const pad = (value) => String(value).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
