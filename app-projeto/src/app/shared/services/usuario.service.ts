import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';
import { Cliente } from '../models/cliente.model';

const LS_CHAVE = "usuarios"

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
    listarTodos(): Usuario[] {
      const usuarios = localStorage[LS_CHAVE];
      return usuarios ? JSON.parse(usuarios) : [];
    }

    cadastrarCliente(cliente: Cliente): void { // Inserir
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
      const usuarios = this.listarTodos();
      return usuarios.find(usuario => usuario.email.toLowerCase() === email.toLowerCase());
    }

    buscarPorCpf(cpf: string): Cliente | undefined {
      const usuarios = this.listarTodos();
      const cpfLimpo = cpf.replace(/\D/g, ''); // Limpa o cpf que veio por parâmetro
      return usuarios.find(usuario => (usuario as Cliente).cpf?.replace(/\D/g, '') === cpfLimpo) as Cliente; // Retorna o Cliente Usuário que encontrar com o mesmo cpf
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
