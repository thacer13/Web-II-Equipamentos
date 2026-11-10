import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, throwError } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { Cliente } from '../models/cliente.model';
import { Funcionario } from '../models/funcionario.model';

const LS_CHAVE = "usuarios"
const LS_USUARIO_LOGADO = "usuarioLogado";
const LS_EMAIL_LEMBRADO = "emailLembrado";
const LS_SENHA_LEMBRADA = "senhaLembrada";

export interface CredenciaisLembradas {
  email: string;
}

export const DADOS_INICIAIS_USUARIOS: Usuario[] = [
  {
    id: 1,
    nome: 'Joe Cliente',
    email: 'cliente@teste.com',
    cpf: '10110110110',
    telefone: '47999999999',
    senha: '123',
    perfil: 'CLIENTE',
    endereco: {
      cep: '80060000',
      logradouro: 'Rua XV de Novembro',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Curitiba',
      estado: 'PR'
    },
  } as Cliente,
];

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);

  // Mudar para 'true' quando quiser testar integrado com o Spring Boot real
  private usarBackend = true;
  private apiUrl = 'http://localhost:8080/api/clientes'; 
  private funcionariosUrl = 'http://localhost:8080/api/funcionarios';
  private loginUrl = 'http://localhost:8080/api/auth/login';
  private sessionUrl = 'http://localhost:8080/api/auth/session';
  private logoutUrl = 'http://localhost:8080/api/auth/logout';

  constructor() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LS_SENHA_LEMBRADA);
    }
  }

  obterCredenciaisLembradas(): CredenciaisLembradas | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const email = localStorage.getItem(LS_EMAIL_LEMBRADO);
    localStorage.removeItem(LS_SENHA_LEMBRADA);
    return email ? { email } : null;
  }

  lembrarCredenciais(email: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LS_EMAIL_LEMBRADO, email);
      localStorage.removeItem(LS_SENHA_LEMBRADA);
    }
  }

  esquecerCredenciais(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LS_EMAIL_LEMBRADO);
      localStorage.removeItem(LS_SENHA_LEMBRADA);
    }
  }

  listarTodos(): Usuario[] {
    if (typeof localStorage === 'undefined') {
      return DADOS_INICIAIS_USUARIOS;
    }
    const usuarios = localStorage.getItem(LS_CHAVE);
    // Se não houver usuários, salva os dados iniciais para ter com quem testar
    if (!usuarios) {
      localStorage.setItem(LS_CHAVE, JSON.stringify(DADOS_INICIAIS_USUARIOS));
      return DADOS_INICIAIS_USUARIOS;
    }
    return JSON.parse(usuarios);
  }

  salvarUsuarioLogado(usuario: Usuario): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LS_USUARIO_LOGADO, JSON.stringify(usuario));
    }  
  }

  obterUsuarioLogado(): Usuario | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const usr = localStorage.getItem(LS_USUARIO_LOGADO);
    return usr ? JSON.parse(usr) : null;
  }

  limparUsuarioLogado(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LS_USUARIO_LOGADO);
    }
  }

  validarSessao(): Observable<Usuario> {
    return this.http.get<Usuario>(this.sessionUrl, { withCredentials: true }).pipe(
      tap(usuario => this.salvarUsuarioLogado(usuario))
    );
  }

  logout(): Observable<void> {
    const request = this.usarBackend
      ? this.http.post<void>(this.logoutUrl, {})
      : of(undefined);

    return request.pipe(tap(() => this.limparUsuarioLogado()));
  }

  cadastrarCliente(cliente: Cliente): Observable<Usuario> {
    const nome = cliente.nome?.trim().replace(/\s+/g, ' ') ?? '';
    const email = cliente.email?.trim().toLowerCase() ?? '';
    const cpf = cliente.cpf?.replace(/\D/g, '') ?? '';
    const telefone = cliente.telefone?.replace(/\D/g, '') ?? '';
    const endereco = cliente.endereco;
    const cep = endereco?.cep?.replace(/\D/g, '') ?? '';
    const logradouro = endereco?.logradouro?.trim().replace(/\s+/g, ' ') ?? '';
    const numero = endereco?.numero?.trim() ?? '';
    const complemento = endereco?.complemento?.trim().replace(/\s+/g, ' ') ?? '';
    const bairro = endereco?.bairro?.trim().replace(/\s+/g, ' ') ?? '';
    const cidade = endereco?.cidade?.trim().replace(/\s+/g, ' ') ?? '';
    const estado = endereco?.estado?.trim().toUpperCase() ?? '';

    if (!nome || nome.length < 3 || nome.length > 150) {
      throw new Error('Nome inválido.');
    }
    if (!email || email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('E-mail inválido.');
    }
    if (cpf.length !== 11) {
      throw new Error('CPF inválido.');
    }
    if (telefone.length < 10 || telefone.length > 11) {
      throw new Error('Telefone inválido.');
    }
    if (cep.length !== 8 || !logradouro || logradouro.length > 150 || !numero || numero.length > 10 || complemento.length > 100 || !bairro || bairro.length > 100 || !cidade || cidade.length > 100 || !/^[A-Z]{2}$/.test(estado)) {
      throw new Error('Endereço inválido.');
    }

    cliente.nome = nome;
    cliente.email = email;
    cliente.cpf = cpf;
    cliente.telefone = telefone;
    endereco.cep = cep;
    endereco.logradouro = logradouro;
    endereco.numero = numero;
    endereco.complemento = complemento;
    endereco.bairro = bairro;
    endereco.cidade = cidade;
    endereco.estado = estado;

    if (this.usarBackend) {
      const payload = {
        cpf: cliente.cpf,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        senha: '', // senha é gerada no backend
        cep: cliente.endereco?.cep,
        logradouro: cliente.endereco?.logradouro,
        numero: cliente.endereco?.numero,
        complemento: cliente.endereco?.complemento || null,
        bairro: cliente.endereco?.bairro,
        cidade: cliente.endereco?.cidade,
        estado: cliente.endereco?.estado
      };
      return this.http.post<Usuario>(this.apiUrl, payload);
    }

    const usuarios = this.listarTodos();
    cliente.id = new Date().getTime();
    cliente.perfil = 'CLIENTE';
    cliente.senha = this.gerarSenhaAleatoria();
    usuarios.push(cliente);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LS_CHAVE, JSON.stringify(usuarios));
    }

    console.log(`[SIMULAÇÃO DE E-MAIL] Para: ${cliente.email} | Sua senha temporária é: ${cliente.senha}`);
    return of(cliente);
  }

  autenticar(email: string, senha: string): Observable<Usuario> {
    if (this.usarBackend) {
      return this.http.post<Usuario>(
        this.loginUrl,
        { email, senha },
        { withCredentials: true }
      );
    }

    const usuario = this.buscarPorEmail(email);
    if (!usuario || usuario.senha !== senha) {
      return throwError(() => new Error('E-mail ou senha inválidos.'));
    }
    return of(usuario);
  }

  buscarPorEmail(email: string): Usuario | undefined {
    const normalizado = email?.trim().toLowerCase() ?? '';
    if (!normalizado) {
      return undefined;
    }
    const usuarios = this.listarTodos();
    return usuarios.find((usuario: Usuario) => usuario.email.toLowerCase() === normalizado);
  }

  buscarPorCpf(cpf: string): Cliente | undefined {
    const cpfLimpo = (cpf ?? '').replace(/\D/g, ''); // Limpa o cpf que veio por parâmetro
    if (!cpfLimpo) {
      return undefined;
    }
    const usuarios = this.listarTodos();
    return usuarios.find((usuario: Usuario) => (usuario as Cliente).cpf?.replace(/\D/g, '') === cpfLimpo) as Cliente; // Retorna o Cliente Usuário que encontrar com o mesmo cpf
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.funcionariosUrl}/${id}`);
  }

  gerarSenhaAleatoria(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  listarFuncionarios(): Observable<Funcionario[]> {
    return this.http.get<Funcionario[]>(this.funcionariosUrl);
  }

  salvarFuncionario(funcionario: Funcionario): Observable<Funcionario> {
    const payload = {
      nome: funcionario.nome.trim().replace(/\s+/g, ' '),
      email: funcionario.email.trim().toLowerCase(),
      dataNascimento: funcionario.dataNascimento
    };

    return funcionario.id
      ? this.http.put<Funcionario>(`${this.funcionariosUrl}/${funcionario.id}`, payload)
      : this.http.post<Funcionario>(this.funcionariosUrl, payload);
  }

  redefinirSenhaFuncionario(id: number): Observable<void> {
    return this.http.post<void>(`${this.funcionariosUrl}/${id}/redefinir-senha`, {});
  }
}
