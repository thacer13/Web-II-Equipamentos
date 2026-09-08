import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Remove máscara e retorna só os dígitos.
export function normalizarCpf(valor: string | null | undefined): string {
  return (valor ?? '').replace(/\D/g, '');
}

// Rejeita CPFs com todos os dígitos iguais (ex.: 000.000.000-00).
function temDigitosRepetidos(digitos: string): boolean {
  return digitos.split('').every((d) => d === digitos[0]);
}

// Calcula um dígito verificador do CPF (módulo 11).
function calcularDigito(base: string, pesoInicial: number): number {
  let soma = 0;
  for (let i = 0; i < base.length; i++) {
    soma += parseInt(base[i], 10) * (pesoInicial - i);
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

// Validação pura: facilita reuso e teste unitário.
export function isValidCpf(valor: string | null | undefined): boolean {
  const digitos = normalizarCpf(valor);

  if (digitos.length !== 11) {
    return false;
  }

  if (temDigitosRepetidos(digitos)) {
    return false;
  }

  const base = digitos.slice(0, 9);
  const primeiro = calcularDigito(base, 10);
  const segundo = calcularDigito(base + primeiro, 11);

  return digitos === `${base}${primeiro}${segundo}`;
}

// ValidatorFn para uso com Reactive Forms. Campo vazio passa
// (Validators.required continua responsável pela obrigatoriedade).
export function validarCpf(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value as string | null | undefined;
    if (!valor || normalizarCpf(valor).length === 0) {
      return null;
    }
    return isValidCpf(valor) ? null : { cpfInvalido: true };
  };
}
