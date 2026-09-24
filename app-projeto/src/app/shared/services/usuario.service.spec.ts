import { TestBed } from '@angular/core/testing';

import { UsuarioService } from './usuario.service';
import { Cliente } from '../models/cliente.model';

function novoCliente(dados: Partial<Cliente> = {}): Cliente {
  return {
    nome: 'Maria Souza',
    email: 'maria@email.com',
    cpf: '52998224725',
    telefone: '41999998888',
    perfil: 'CLIENTE',
    endereco: {
      cep: '80060000',
      logradouro: 'Rua XV de Novembro',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Curitiba',
      estado: 'PR'
    },
    ...dados
  };
}

describe('UsuarioService', () => {
  let service: UsuarioService;

  beforeEach(() => {
    // O service lê e grava direto como propriedade (localStorage[chave]),
    // então um objeto vazio basta como armazenamento isolado por teste.
    vi.stubGlobal('localStorage', {});
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuarioService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('retorna lista vazia quando não há usuários salvos', () => {
    expect(service.listarTodos()).toEqual([]);
  });

  it('cadastra cliente com id, perfil CLIENTE e senha de 4 dígitos', () => {
    service.cadastrarCliente(novoCliente());

    const [salvo] = service.listarTodos();
    expect(salvo.id).toBeDefined();
    expect(salvo.perfil).toBe('CLIENTE');
    expect(salvo.senha).toMatch(/^\d{4}$/);
  });

  it('gera senha sempre entre 1000 e 9999', () => {
    for (let i = 0; i < 100; i++) {
      const senha = Number(service.gerarSenhaAleatoria());
      expect(senha).toBeGreaterThanOrEqual(1000);
      expect(senha).toBeLessThanOrEqual(9999);
    }
  });

  it('busca por e-mail sem diferenciar maiúsculas', () => {
    service.cadastrarCliente(novoCliente());

    expect(service.buscarPorEmail('MARIA@Email.com')?.nome).toBe('Maria Souza');
    expect(service.buscarPorEmail('outra@email.com')).toBeUndefined();
  });

  it('busca por CPF com ou sem máscara', () => {
    service.cadastrarCliente(novoCliente());

    expect(service.buscarPorCpf('529.982.247-25')?.nome).toBe('Maria Souza');
    expect(service.buscarPorCpf('52998224725')?.nome).toBe('Maria Souza');
    expect(service.buscarPorCpf('111.444.777-35')).toBeUndefined();
  });

  it('remove apenas o usuário com o id informado', () => {
    // O id vem do timestamp, então os cadastros precisam de instantes diferentes.
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    service.cadastrarCliente(novoCliente());
    vi.setSystemTime(2000);
    service.cadastrarCliente(novoCliente({ email: 'joao@email.com', cpf: '11144477735' }));
    vi.useRealTimers();

    service.remover(1000);

    expect(service.listarTodos().map(u => u.email)).toEqual(['joao@email.com']);
  });
});
