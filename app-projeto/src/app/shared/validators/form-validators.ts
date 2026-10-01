import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const LIMITES = {
  nome: 150,
  email: 150,
  telefone: 20,
  logradouro: 150,
  numero: 10,
  bairro: 100,
  cidade: 100,
  categoria: 100,
  descricaoEquipamento: 150,
  descricaoDefeito: 2000,
  descricaoManutencao: 2000,
  orientacoesCliente: 2000,
  motivoRejeicao: 1000,
  senha: 50,
} as const;

export const VALOR_ORCAMENTO_MAX = 99999999.99;

export function normalizarTexto(valor: string | null | undefined): string {
  return (valor ?? '').trim().replace(/\s+/g, ' ');
}

export function somenteDigitos(valor: string | null | undefined): string {
  return (valor ?? '').replace(/\D/g, '');
}

export function naoVazio(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (valor === null || valor === undefined) {
      return { vazio: true };
    }
    if (typeof valor === 'string' && valor.trim().length === 0) {
      return { vazio: true };
    }
    return null;
  };
}

export function validarTelefone(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const digitos = somenteDigitos(control.value);
    if (digitos.length === 0) {
      return null;
    }
    return digitos.length === 10 || digitos.length === 11 ? null : { telefoneInvalido: true };
  };
}

export function validarCep(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const digitos = somenteDigitos(control.value);
    if (digitos.length === 0) {
      return null;
    }
    return digitos.length === 8 ? null : { cepInvalido: true };
  };
}

export function validarEstado(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = normalizarTexto(control.value).toUpperCase();
    if (valor.length === 0) {
      return null;
    }
    return /^[A-Z]{2}$/.test(valor) ? null : { estadoInvalido: true };
  };
}

export function validarDataNascimento(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (!valor) {
      return null;
    }
    const data = new Date(`${valor}T00:00:00`);
    if (Number.isNaN(data.getTime())) {
      return { dataInvalida: true };
    }
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (data > hoje || data.getFullYear() < 1900) {
      return { dataInvalida: true };
    }
    return null;
  };
}

export function validarValorOrcamento(max: number = VALOR_ORCAMENTO_MAX): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero <= 0 || numero > max) {
      return { valorInvalido: true };
    }
    if (Math.round(numero * 100) / 100 !== numero) {
      return { valorInvalido: true };
    }
    return null;
  };
}
