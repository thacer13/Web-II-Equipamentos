import type { AbstractControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { isValidCpf, validarCpf } from './cpf.validator';

// Controle mínimo sem importar @angular/forms em runtime.
function controle(valor: string | null) {
  return { value: valor } as AbstractControl;
}

describe('isValidCpf', () => {
  it('aceita CPF válido com máscara', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
  });

  it('aceita outro CPF válido sem máscara', () => {
    expect(isValidCpf('11144477735')).toBe(true);
  });

  it('rejeita CPF com dígito verificador errado', () => {
    expect(isValidCpf('529.982.247-26')).toBe(false);
  });

  it('rejeita CPF com todos os dígitos iguais', () => {
    expect(isValidCpf('000.000.000-00')).toBe(false);
    expect(isValidCpf('111.111.111-11')).toBe(false);
  });

  it('rejeita CPF incompleto ou vazio', () => {
    expect(isValidCpf('123.456')).toBe(false);
    expect(isValidCpf('')).toBe(false);
    expect(isValidCpf(null)).toBe(false);
  });
});

describe('validarCpf', () => {
  const validator = validarCpf();

  it('retorna null para CPF válido', () => {
    expect(validator(controle('529.982.247-25'))).toBeNull();
  });

  it('retorna erro cpfInvalido para CPF inválido', () => {
    expect(validator(controle('123.456.789-00'))).toEqual({ cpfInvalido: true });
  });

  it('retorna null para campo vazio (required trata)', () => {
    expect(validator(controle(''))).toBeNull();
  });
});
