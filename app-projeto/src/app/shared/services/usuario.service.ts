import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { Cliente } from '../models/cliente.model';
import { Funcionario } from '../models/funcionario.model';

export interface CredenciaisLembradas {
  email: string;
}
@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);
  private usuarioLogado: Usuario | null = null;
  private emailLembrado: string | null = null;

  private apiUrl = 'http://localhost:8080/api/clientes'; 
  private funcionariosUrl = 'http://localhost:8080/api/funcionarios';
  private loginUrl = 'http://localhost:8080/api/auth/login';
  private sessionUrl = 'http://localhost:8080/api/auth/session';
  private logoutUrl = 'http://localhost:8080/api/auth/logout';

  obterCredenciaisLembradas(): CredenciaisLembradas | null {
    return this.emailLembrado ? { email: this.emailLembrado } : null;
  }

  lembrarCredenciais(email: string): void {
    this.emailLembrado = email;
  }

  esquecerCredenciais(): void {
    this.emailLembrado = null;
  }

  salvarUsuarioLogado(usuario: Usuario): void {
    this.usuarioLogado = usuario;
  }

  obterUsuarioLogado(): Usuario | null {
    return this.usuarioLogado;
  }

  limparUsuarioLogado(): void {
    this.usuarioLogado = null;
  }

  validarSessao(): Observable<Usuario> {
    return this.http.get<Usuario>(this.sessionUrl, { withCredentials: true }).pipe(
      tap(usuario => this.salvarUsuarioLogado(usuario))
    );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(this.logoutUrl, {}, { withCredentials: true })
      .pipe(tap(() => this.limparUsuarioLogado()));
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
    if (!/^(?:[1-9]\d[2-5]\d{7}|[1-9]\d9\d{8})$/.test(telefone)) {
      throw new Error('Telefone inválido.');
    }
    if (!/^(?!0{8})\d{8}$/.test(cep) || !logradouro || logradouro.length > 150 || !numero || numero.length > 10 || complemento.length > 100 || !bairro || bairro.length > 100 || !cidade || cidade.length > 100 || !/^[A-Z]{2}$/.test(estado)) {
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

    const payload = {
      cpf: cliente.cpf,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      senha: '',
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

  autenticar(email: string, senha: string): Observable<Usuario> {
    return this.http.post<Usuario>(
      this.loginUrl,
      { email, senha },
      { withCredentials: true }
    );
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.funcionariosUrl}/${id}`);
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
