import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { UsuarioService } from '../../shared/services/usuario.service';
import { Funcionario } from '../../shared/models/funcionario.model';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule
  ],
  templateUrl: './lista-funcionarios.html',
})

export class ListaFuncionariosComponent implements OnInit {
  private location = inject(Location);

  funcionarios: Funcionario[] = [];
  funcionarioSelecionado: Funcionario | null = null;

  showFormulario = false;
  showConfirmacao = false;

  editandoId: number | null = null;

  nome = '';
  email = '';
  dataNascimento = '';
  mensagemErro = '';
  funcionarioLogadoId?: number;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.carregarFuncionarios();
    
    const usuarioLogado = this.usuarioService.obterUsuarioLogado();
    if (usuarioLogado) {
      this.funcionarioLogadoId = usuarioLogado.id;
    }
  }

  carregarFuncionarios(): void {
    this.funcionarios = this.usuarioService.listarFuncionarios();
  }

  voltar(): void {
    this.location.back();
  }

  abrirNovo(): void {
    this.editandoId = null;
    this.nome = '';
    this.email = '';
    this.dataNascimento = '';
    this.mensagemErro = '';
    this.showFormulario = true;
  }

  abrirEditar(funcionario: Funcionario): void {
    this.editandoId = funcionario.id!;
    this.nome = funcionario.nome;
    this.email = funcionario.email;
    this.dataNascimento = funcionario.dataNascimento;
    this.mensagemErro = '';
    this.showFormulario = true;
  }

  salvarFuncionario(): void {
    this.mensagemErro = '';

    if (!this.nome || this.nome.trim().length < 3) {
      this.mensagemErro = 'O nome deve ter pelo menos 3 caracteres.';
      return;
    }
    if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.mensagemErro = 'E-mail inválido.';
      return;
    }
    if (!this.dataNascimento) {
      this.mensagemErro = 'A data de nascimento é obrigatória.';
      return;
    }

    // Validação de E-mail Único (ignorando o próprio registro em caso de edição)
    const emailExistente = this.usuarioService.buscarPorEmail(this.email);
    if (emailExistente && emailExistente.id !== this.editandoId) {
      this.mensagemErro = 'Este e-mail já está cadastrado no sistema.';
      return;
    }

    // Prepara o objeto para salvar
    const funcionarioParaSalvar: Funcionario = {
      id: this.editandoId !== null ? this.editandoId : undefined,
      nome: this.nome,
      email: this.email,
      dataNascimento: this.dataNascimento,
      perfil: 'FUNCIONARIO',
      ativo: true // Será ignorado pelo Service caso seja edição, mantendo o status atual
    };

    // Salva via Service (LocalStorage) e atualiza a tela
    this.usuarioService.salvarFuncionario(funcionarioParaSalvar);
    this.carregarFuncionarios();
    this.showFormulario = false;
  }

  gerarNovaSenhaManual(): void {
    if (this.editandoId !== null) {
      const funcionario = this.funcionarios.find(f => f.id === this.editandoId);
      if (funcionario) {
        const novaSenha = this.usuarioService.gerarSenhaAleatoria();
        funcionario.senha = novaSenha; // Atualiza a senha no objeto atual
        
        // Salva a alteração
        this.usuarioService.salvarFuncionario(funcionario);
        
        // Feedback visual
        alert(`[SIMULAÇÃO] Nova senha (${novaSenha}) gerada e enviada para ${funcionario.email}`);
      }
    }
  }

  podeRemover(funcionario: Funcionario): boolean {
    if (funcionario.id === this.funcionarioLogadoId) {
      return false;
    } 
    return this.funcionarios.length > 1;
  }

  pedirRemocao(funcionario: Funcionario): void {
    if(!this.podeRemover(funcionario)) {
      return;
    }

    this.funcionarioSelecionado = funcionario;
    this.showConfirmacao = true;
  }

  confirmarRemocao(): void {
    if (this.funcionarioSelecionado && this.funcionarioSelecionado.id !== undefined) {
      if (this.funcionarioSelecionado.id === this.funcionarioLogadoId) {
        alert('Ação bloqueada: Você não pode excluir a si mesmo.');
        this.showConfirmacao = false;
        return;
      }

      this.usuarioService.remover(this.funcionarioSelecionado.id);
      
      this.carregarFuncionarios();
      this.showConfirmacao = false;
      this.funcionarioSelecionado = null;
    }
  }
}