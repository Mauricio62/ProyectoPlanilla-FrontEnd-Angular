import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class CustomValidators {
  static passwordMatch(password: string, confirmPassword: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const passwordControl = control.get(password);
      const confirmPasswordControl = control.get(confirmPassword);

      if (!passwordControl || !confirmPasswordControl) {
        return null;
      }

      if (passwordControl.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }

      if (confirmPasswordControl.hasError('passwordMismatch')) {
        delete confirmPasswordControl.errors!['passwordMismatch'];
        if (Object.keys(confirmPasswordControl.errors!).length === 0) {
          confirmPasswordControl.setErrors(null);
        }
      }

      return null;
    };
  }

  static salarioMinimo(minAmount: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = parseFloat(control.value);
      if (isNaN(value) || value < minAmount) {
        return { salarioMinimo: { min: minAmount, actual: value } };
      }
      return null;
    };
  }
}
