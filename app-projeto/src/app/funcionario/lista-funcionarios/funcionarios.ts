import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';

interface FuncionarioCrud {
  id: number;
  nome: string;
  email: string;
  dataNascimento: string;
  senha: string;
  ativo: boolean;
}

const LS_CHAVE = 'funcionarios-crud';

const FUNCIONARIOS_INICIAIS: FuncionarioCrud[] = [
  {
    id: 1,
    nome: 'Maria',
    email: 'maria@teste.com',
    dataNascimento: '1990-05-10',
    senha: '1234',
    ativo: true
  },
  {
    id: 2,
    nome: 'Mário',
    email: 'mario@teste.com',
    dataNascimento: '1992-08-20',
    senha: '1234',
    ativo: true
  },
];

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
  templateUrl: './funcionarios.html',
})
export class FuncionariosComponent {
  private router = inject(Router);

  funcionarioAtual = 'Mário';

  funcionarios: FuncionarioCrud[] = [];

  showFormulario = false;
  showConfirmacao = false;

  editandoId: number | null = null;

  nome = '';
  email = '';
  dataNascimento = '';
  senha = '';
  mensagemErro = '';

  funcionarioSelecionado: FuncionarioCrud | null = null;

  constructor() {
    this.carregar();
  }

  voltar(): void {
    this.router.navigate(['/funcionario']);
  }

  abrirNovo(): void {
    this.editandoId = null;
    this.nome = '';
    this.email = '';
    this.dataNascimento = '';
    this.senha = '';
    this.mensagemErro = '';
    this.showFormulario = true;
  }

  abrirEditar(funcionario: FuncionarioCrud): void {
    this.editandoId = funcionario.id;
    this.nome = funcionario.nome;
    this.email = funcionario.email;
    this.dataNascimento = funcionario.dataNascimento;
    this.senha = funcionario.senha;
    this.mensagemErro = '';
    this.showFormulario = true;
  }

  salvarFuncionario(): void {
    const nome = this.nome.trim();
    const email = this.email.trim().toLowerCase();
    const senha = this.senha.trim();

    if (!nome || !email || !this.dataNascimento || !senha) {
      this.mensagemErro = 'Preencha todos os campos.';
      return;
    }

    const emailDuplicado =
      this.funcionarios.some((funcionario) =>
        funcionario.email.toLowerCase() === email &&
        funcionario.id !== this.editandoId
      );

    if (emailDuplicado) {
      this.mensagemErro =
        'Já existe um funcionário com esse e-mail.';
      return;
    }

    if (this.editandoId === null) {
      const proximoId =
        this.funcionarios.length > 0
          ? Math.max(
              ...this.funcionarios.map(
                (funcionario) => funcionario.id
              )
            ) + 1
          : 1;

      this.funcionarios.push({
        id: proximoId,
        nome,
        email,
        dataNascimento: this.dataNascimento,
        senha,
        ativo: true
      });
    } else {
      const funcionario =
        this.funcionarios.find(
          (item) => item.id === this.editandoId
        );

      if (funcionario) {
        funcionario.nome = nome;
        funcionario.email = email;
        funcionario.dataNascimento = this.dataNascimento;
        funcionario.senha = senha;
      }
    }

    this.salvarLocal();
    this.showFormulario = false;
  }

  podeDesativar(funcionario: FuncionarioCrud): boolean {
    if (!funcionario.ativo) {
      return false;
    }

    if (funcionario.nome === this.funcionarioAtual) {
      return false;
    }

    return this.funcionarios.filter(
      (item) => item.ativo
    ).length > 1;
  }

  pedirDesativacao(funcionario: FuncionarioCrud): void {
    if (!this.podeDesativar(funcionario)) {
      return;
    }

    this.funcionarioSelecionado = funcionario;
    this.showConfirmacao = true;
  }

  confirmarDesativacao(): void {
    if (
      !this.funcionarioSelecionado ||
      !this.podeDesativar(this.funcionarioSelecionado)
    ) {
      return;
    }

    this.funcionarioSelecionado.ativo = false;

    this.salvarLocal();

    this.showConfirmacao = false;
    this.funcionarioSelecionado = null;
  }

  ativar(funcionario: FuncionarioCrud): void {
    funcionario.ativo = true;
    this.salvarLocal();
  }

  formatarData(data: string): string {
    if (!data) {
      return '';
    }

    const [ano, mes, dia] = data.split('-');

    return `${dia}/${mes}/${ano}`;
  }

  private carregar(): void {
    if (typeof localStorage === 'undefined') {
      this.funcionarios =
        FUNCIONARIOS_INICIAIS.map(
          (funcionario) => ({ ...funcionario })
        );

      return;
    }

    const dados = localStorage.getItem(LS_CHAVE);

    this.funcionarios = dados
      ? JSON.parse(dados)
      : FUNCIONARIOS_INICIAIS.map(
          (funcionario) => ({ ...funcionario })
        );

    this.salvarLocal();
  }

  private salvarLocal(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        LS_CHAVE,
        JSON.stringify(this.funcionarios)
      );
    }
  }
}