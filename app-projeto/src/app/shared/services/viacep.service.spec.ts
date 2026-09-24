import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ViacepService } from './viacep.service';
import { Endereco } from '../models/endereco.model';

describe('ViacepService', () => {
  let service: ViacepService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ViacepService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('remove a máscara do CEP antes de consultar', () => {
    service.consultarCep('80060-000').subscribe();

    http.expectOne('https://viacep.com.br/ws/80060000/json/').flush({ erro: true });
  });

  it('converte localidade/uf da resposta em cidade/estado', () => {
    let resultado: Endereco | null = null;
    service.consultarCep('80060000').subscribe(dados => (resultado = dados));

    http.expectOne('https://viacep.com.br/ws/80060000/json/').flush({
      cep: '80060-000',
      logradouro: 'Rua XV de Novembro',
      bairro: 'Centro',
      localidade: 'Curitiba',
      uf: 'PR'
    });

    expect(resultado).toEqual({
      cep: '80060-000',
      logradouro: 'Rua XV de Novembro',
      bairro: 'Centro',
      cidade: 'Curitiba',
      estado: 'PR'
    });
  });

  it('retorna null quando o ViaCEP não encontra o CEP', () => {
    let resultado: Endereco | null | undefined;
    service.consultarCep('00000000').subscribe(dados => (resultado = dados));

    http.expectOne('https://viacep.com.br/ws/00000000/json/').flush({ erro: true });

    expect(resultado).toBeNull();
  });
});
