import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Obligatorio que no acepta solo espacios en blanco. */
export const requiredText: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: unknown = control.value;
  return typeof value === 'string' && value.trim().length > 0 ? null : { required: true };
};

/**
 * Valida a nivel de grupo que la fecha de finalización no sea anterior a la de inicio.
 * Replica el `CHECK (fecha_fin >= fecha_inicio)` de `public.proyecto`; solo aplica si ambas existen.
 * Las fechas llegan como `YYYY-MM-DD`, que se comparan correctamente como texto.
 */
export function dateRangeValidator(startKey: string, endKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start: unknown = group.get(startKey)?.value;
    const end: unknown = group.get(endKey)?.value;
    if (typeof start !== 'string' || typeof end !== 'string' || !start || !end) {
      return null;
    }
    return end < start ? { dateRange: true } : null;
  };
}
