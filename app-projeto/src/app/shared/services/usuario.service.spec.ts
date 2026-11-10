import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UsuarioService } from './usuario.service';
import { Cliente } from '../models/cliente.model';
import { Usuario } from '../models/usuario.model';

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
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const storage: Record<string, string> = {};
    Object.defineProperties(storage, {
      getItem: { value: (key: string) => storage[key] ?? null },
      setItem: { value: (key: string, value: string) => { storage[key] = value; } },
      removeItem: { value: (key: string) => { delete storage[key]; } }
    });
    vi.stubGlobal('localStorage', storage);
    localStorage.setItem('usuarios', '[]');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UsuarioService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    vi.unstubAllGlobals();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('retorna lista vazia quando não há usuários salvos', () => {
    expect(service.listarTodos()).toEqual([]);
  });

  it('envia os dados cadastrais e o complemento para o backend', () => {
    let response: Usuario | undefined;
    service.cadastrarCliente(novoCliente({
      endereco: {
        ...novoCliente().endereco,
        complemento: 'Sala 2'
      }
    })).subscribe(resultado => (response = resultado));

    const request = httpTestingController.expectOne('http://localhost:8080/api/clientes');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      cpf: '52998224725',
      nome: 'Maria Souza',
      email: 'maria@email.com',
      telefone: '41999998888',
      senha: '',
      cep: '80060000',
      logradouro: 'Rua XV de Novembro',
      numero: '100',
      complemento: 'Sala 2',
      bairro: 'Centro',
      cidade: 'Curitiba',
      estado: 'PR'
    });
    const usuario: Usuario = {
      id: 12,
      nome: 'Maria Souza',
      email: 'maria@email.com',
      perfil: 'CLIENTE'
    };
    request.flush(usuario);

    expect(response).toEqual(usuario);
  });

  it('gera senha sempre entre 1000 e 9999', () => {
    for (let i = 0; i < 100; i++) {
      const senha = Number(service.gerarSenhaAleatoria());
      expect(senha).toBeGreaterThanOrEqual(1000);
      expect(senha).toBeLessThanOrEqual(9999);
    }
  });

  it('busca por e-mail sem diferenciar maiúsculas', () => {
    localStorage.setItem('usuarios', JSON.stringify([novoCliente()]));

    expect(service.buscarPorEmail('MARIA@Email.com')?.nome).toBe('Maria Souza');
    expect(service.buscarPorEmail('outra@email.com')).toBeUndefined();
  });

  it('lembra e remove as credenciais localmente', () => {
    service.lembrarCredenciais('maria@email.com');

    expect(service.obterCredenciaisLembradas()).toEqual({
      email: 'maria@email.com'
    });

    service.esquecerCredenciais();

    expect(service.obterCredenciaisLembradas()).toBeNull();
  });

  it('remove senhas lembradas anteriormente sem restaurá-las', () => {
    localStorage.setItem('emailLembrado', 'maria@email.com');
    localStorage.setItem('senhaLembrada', 'senha-antiga');

    expect(service.obterCredenciaisLembradas()).toEqual({ email: 'maria@email.com' });
    expect(localStorage.getItem('senhaLembrada')).toBeNull();
  });

  it('revalida a sessão no servidor e atualiza o usuário em cache', () => {
    const usuario: Usuario = {
      id: 2,
      nome: 'Maria Funcionária',
      email: 'funcionario@email.com',
      perfil: 'FUNCIONARIO'
    };

    service.validarSessao().subscribe(resultado => {
      expect(resultado).toEqual(usuario);
    });

    const request = httpTestingController.expectOne('http://localhost:8080/api/auth/session');
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush(usuario);

    expect(service.obterUsuarioLogado()).toEqual(usuario);
  });

  it('busca por CPF com ou sem máscara', () => {
    localStorage.setItem('usuarios', JSON.stringify([novoCliente()]));

    expect(service.buscarPorCpf('529.982.247-25')?.nome).toBe('Maria Souza');
    expect(service.buscarPorCpf('52998224725')?.nome).toBe('Maria Souza');
    expect(service.buscarPorCpf('111.444.777-35')).toBeUndefined();
  });

  it('remove apenas o usuário com o id informado', () => {
    localStorage.setItem('usuarios', JSON.stringify([
      { ...novoCliente(), id: 1000 },
      { ...novoCliente({ email: 'joao@email.com', cpf: '11144477735' }), id: 2000 }
    ]));

    service.remover(1000);

    expect(service.listarTodos().map(u => u.email)).toEqual(['joao@email.com']);
  });
});
