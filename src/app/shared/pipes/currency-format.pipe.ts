import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat'
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number, currency: string = 'PEN', locale: string = 'es-PE'): string {
    if (value === null || value === undefined || isNaN(value)) {
      return 'S/ 0.00';
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    } catch (error) {
      // Fallback si hay error con Intl
      return `S/ ${value.toFixed(2)}`;
    }
  }
}
