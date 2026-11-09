const PROJECT_DATE_FORMAT = new Intl.DateTimeFormat('es', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/**
 * Convierte `YYYY-MM-DD` en una fecha legible, p. ej. «09 nov 2026».
 * Se construye en hora local para que la zona horaria no mueva el día.
 */
export function formatProjectDate(value: string | null): string {
  if (!value) {
    return 'Sin definir';
  }
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) {
    return value;
  }
  return PROJECT_DATE_FORMAT.format(new Date(year, month - 1, day)).replace('.', '');
}
