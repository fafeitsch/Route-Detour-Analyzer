/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isTime } from '../+store/workbench';

export function timeFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const allowed = isTime(control.value);
    return allowed ? null : { invalidTimeFormat: true };
  };
}
