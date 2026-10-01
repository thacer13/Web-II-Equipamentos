import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';
import { Cliente } from '../models/cliente.model';
import { Funcionario } from '../models/funcionario.model';

const LS_CHAVE = "usuarios"
const LS_USUARIO_LOGADO = "usuarioLogado";
const LS_EMAIL_LEMBRADO = "emailLembrado";
const LS_SENHA_LEMBRADA = "senhaLembrada";

export interface CredenciaisLembradas {
  email: string;
  senha: string;
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
  {
    id: 2,
    nome: 'Maria Funcionária',
    email: 'funcionario@teste.com',
    senha: '123',
    perfil: 'FUNCIONARIO',
    dataNascimento: '09/09/2009',
    ativo: true,
  } as Funcionario
];

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
    obterCredenciaisLembradas(): CredenciaisLembradas | null {
      if (typeof localStorage === 'undefined') {
        return null;
      }

      const email = localStorage.getItem(LS_EMAIL_LEMBRADO);
      const senha = localStorage.getItem(LS_SENHA_LEMBRADA);
      return email && senha ? { email, senha } : null;
    }

    lembrarCredenciais(email: string, senha: string): void {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LS_EMAIL_LEMBRADO, email);
        localStorage.setItem(LS_SENHA_LEMBRADA, senha);
      }
    }

    esquecerCredenciais(): void {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(LS_EMAIL_LEMBRADO);
        localStorage.removeItem(LS_SENHA_LEMBRADA);
      }
    }

    listarTodos(): Usuario[] {
      const usuarios = localStorage[LS_CHAVE];
      // Se não houver usuários, salva os dados iniciais para ter com quem testar
      if (!usuarios) {
        localStorage[LS_CHAVE] = JSON.stringify(DADOS_INICIAIS_USUARIOS);
        return DADOS_INICIAIS_USUARIOS;
      }
      return JSON.parse(usuarios);
    }

    salvarUsuarioLogado(usuario: Usuario): void {
      localStorage.setItem(LS_USUARIO_LOGADO, JSON.stringify(usuario));
    }

    obterUsuarioLogado(): Usuario | null {
      const usr = localStorage.getItem(LS_USUARIO_LOGADO);
      return usr ? JSON.parse(usr) : null;
    }

    logout(): void {
      localStorage.removeItem(LS_USUARIO_LOGADO);
    }

    cadastrarCliente(cliente: Cliente): void { // Inserir
      const nome = cliente.nome?.trim().replace(/\s+/g, ' ') ?? '';
      const email = cliente.email?.trim().toLowerCase() ?? '';
      const cpf = cliente.cpf?.replace(/\D/g, '') ?? '';
      const telefone = cliente.telefone?.replace(/\D/g, '') ?? '';
      const endereco = cliente.endereco;
      const cep = endereco?.cep?.replace(/\D/g, '') ?? '';
      const logradouro = endereco?.logradouro?.trim().replace(/\s+/g, ' ') ?? '';
      const numero = endereco?.numero?.trim() ?? '';
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
      if (cep.length !== 8 || !logradouro || logradouro.length > 150 || !numero || numero.length > 10 || !bairro || bairro.length > 100 || !cidade || cidade.length > 100 || !/^[A-Z]{2}$/.test(estado)) {
        throw new Error('Endereço inválido.');
      }

      cliente.nome = nome;
      cliente.email = email;
      cliente.cpf = cpf;
      cliente.telefone = telefone;
      endereco.cep = cep;
      endereco.logradouro = logradouro;
      endereco.numero = numero;
      endereco.bairro = bairro;
      endereco.cidade = cidade;
      endereco.estado = estado;

      const usuarios = this.listarTodos();
      cliente.id = new Date().getTime();
      cliente.perfil = 'CLIENTE';
      cliente.senha = this.gerarSenhaAleatoria();
      usuarios.push(cliente);
      localStorage[LS_CHAVE] = JSON.stringify(usuarios);

      console.log(`[SIMULAÇÃO DE E-MAIL] Para: ${cliente.email} | Sua senha temporária é: ${cliente.senha}`);
      // Quando formos implementar o Backend (Spring Boot), substituir o localStorage por:
      // return this.http.post('http://localhost:8080/api/cadastro', cliente);
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

    remover(id: number): void {
      let usuarios = this.listarTodos();
      usuarios = usuarios.filter(usuario => usuario.id !== id);
      localStorage[LS_CHAVE] = JSON.stringify(usuarios);
    }

    gerarSenhaAleatoria(): string {
      return Math.floor(1000 + Math.random() * 9000).toString();
    }
}
