import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { UsuarioService } from '../../shared/services/usuario.service';
import { Funcionario } from '../../shared/models/funcionario.model';
import { hoje, paraIso } from '../../shared/utils/datas';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    DatePickerModule
  ],
  templateUrl: './lista-funcionarios.html',
})

export class ListaFuncionariosComponent implements OnInit {
  funcionarios: Funcionario[] = [];
  funcionarioSelecionado: Funcionario | null = null;

  showFormulario = false;
  showConfirmacao = false;

  editandoId: number | null = null;

  nome = '';
  email = '';
  dataNascimento: Date | null = null;
  readonly minDate = new Date(1950, 0, 1);
  readonly maxDate = hoje();
  mensagemErro = '';
  mensagemErroConfirmacao = '';
  mensagemSucesso = '';
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
    this.usuarioService.listarFuncionarios().subscribe({
      next: funcionarios => {
        this.funcionarios = funcionarios;
      },
      error: erro => {
        this.mensagemErro = this.mensagemErroApi(erro, 'Não foi possível carregar os funcionários.');
      }
    });
  }

  abrirNovo(): void {
    this.editandoId = null;
    this.nome = '';
    this.email = '';
    this.dataNascimento = null;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.showFormulario = true;
  }

  abrirEditar(funcionario: Funcionario): void {
    this.editandoId = funcionario.id!;
    this.nome = funcionario.nome;
    this.email = funcionario.email;
    if (funcionario.dataNascimento) {
      // Tenta converter de forma segura independentemente do formato da string ISO
      const valorData = typeof funcionario.dataNascimento === 'string' 
        ? funcionario.dataNascimento.split('T')[0] 
        : funcionario.dataNascimento;

      const partes = String(valorData).split('-');
      if (partes.length === 3) {
        const ano = Number(partes[0]);
        const mes = Number(partes[1]) - 1; // Meses no JS começam em 0 (0 = janeiro)
        const dia = Number(partes[2]);
        this.dataNascimento = new Date(ano, mes, dia);
      } else {
        this.dataNascimento = new Date(funcionario.dataNascimento);
      }
    } else {
      this.dataNascimento = null;
    }
    this.mensagemErro = '';
    this.mensagemSucesso = '';
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
    if (this.dataNascimento < this.minDate || this.dataNascimento > this.maxDate) {
      this.mensagemErro = 'A data de nascimento deve estar entre 01/01/1950 e hoje.';
      return;
    }

    const funcionarioParaSalvar: Funcionario = {
      id: this.editandoId !== null ? this.editandoId : undefined,
      nome: this.nome.trim().replace(/\s+/g, ' '),
      email: this.email.trim().toLowerCase(),
      dataNascimento: paraIso(this.dataNascimento),
      perfil: 'FUNCIONARIO',
      ativo: true
    };

    this.usuarioService.salvarFuncionario(funcionarioParaSalvar).subscribe({
      next: funcionarioSalvo => {
        const usuarioLogado = this.usuarioService.obterUsuarioLogado();
        if (usuarioLogado?.id === funcionarioSalvo.id) {
          this.usuarioService.salvarUsuarioLogado({
            ...usuarioLogado,
            nome: funcionarioSalvo.nome,
            email: funcionarioSalvo.email
          });
        }
        this.showFormulario = false;
        this.carregarFuncionarios();
      },
      error: erro => {
        this.mensagemErro = this.mensagemErroApi(erro, 'Não foi possível salvar o funcionário.');
      }
    });
  }

  gerarNovaSenhaManual(): void {
    if (this.editandoId === null) {
      return;
    }
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.usuarioService.redefinirSenhaFuncionario(this.editandoId).subscribe({
      next: () => {
        this.mensagemSucesso = 'Uma nova senha temporária foi enviada para o e-mail do funcionário.';
      },
      error: erro => {
        this.mensagemErro = this.mensagemErroApi(erro, 'Não foi possível redefinir a senha.');
      }
    });
  }

  podeRemover(funcionario: Funcionario): boolean {
    if (funcionario.id === this.funcionarioLogadoId) {
      return false;
    } 
    return funcionario.ativo && this.funcionarios.filter(item => item.ativo).length > 1;
  }

  pedirRemocao(funcionario: Funcionario): void {
    if(!this.podeRemover(funcionario)) {
      return;
    }

    this.funcionarioSelecionado = funcionario;
    this.mensagemErroConfirmacao = '';
    this.showConfirmacao = true;
  }

  confirmarRemocao(): void {
    if (this.funcionarioSelecionado && this.funcionarioSelecionado.id !== undefined) {
      this.usuarioService.remover(this.funcionarioSelecionado.id).subscribe({
        next: () => {
          this.carregarFuncionarios();
          this.showConfirmacao = false;
          this.funcionarioSelecionado = null;
        },
        error: erro => {
          this.mensagemErroConfirmacao = this.mensagemErroApi(erro, 'Não foi possível desativar o funcionário.');
        }
      });
    }
  }

  private mensagemErroApi(erro: unknown, padrao: string): string {
    if (typeof erro === 'object' && erro !== null && 'error' in erro) {
      const resposta = erro.error;
      if (typeof resposta === 'object' && resposta !== null
          && 'mensagem' in resposta && typeof resposta.mensagem === 'string') {
        return resposta.mensagem;
      }
    }
    return padrao;
  }
}