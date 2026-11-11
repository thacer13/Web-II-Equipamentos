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
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UsuarioService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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

  it('mantém o e-mail lembrado apenas durante a sessão do serviço', () => {
    service.lembrarCredenciais('maria@email.com');

    expect(service.obterCredenciaisLembradas()).toEqual({
      email: 'maria@email.com'
    });

    service.esquecerCredenciais();

    expect(service.obterCredenciaisLembradas()).toBeNull();
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

  it('desativa funcionário usando o endpoint protegido', () => {
    service.remover(1000).subscribe();

    const request = httpTestingController.expectOne('http://localhost:8080/api/funcionarios/1000');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });

  it('cadastra funcionário pela API sem enviar senha gerada no cliente', () => {
    const funcionario = {
      nome: 'João da Silva',
      email: 'joao@email.com',
      dataNascimento: '1990-01-01',
      perfil: 'FUNCIONARIO' as const,
      ativo: true
    };
    service.salvarFuncionario(funcionario).subscribe();

    const request = httpTestingController.expectOne('http://localhost:8080/api/funcionarios');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      nome: 'João da Silva',
      email: 'joao@email.com',
      dataNascimento: '1990-01-01'
    });
    request.flush({ ...funcionario, id: 3 });
  });

  it('redefine a senha pela API e não expõe a senha temporária ao cliente', () => {
    service.redefinirSenhaFuncionario(3).subscribe();

    const request = httpTestingController.expectOne(
      'http://localhost:8080/api/funcionarios/3/redefinir-senha'
    );
    expect(request.request.method).toBe('POST');
    request.flush(null);
  });
});
