import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { Categoria, CategoriaService } from '../../shared/services/categoria.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule
  ],
  templateUrl: './categorias.html',
})
export class CategoriasComponent {
  private categoriaService = inject(CategoriaService);

  categorias: Categoria[] = [];
  showFormulario = false;
  showConfirmacao = false;
  editandoId: number | null = null;
  nome = '';
  mensagemErro = '';
  mensagemErroConfirmacao = '';
  categoriaSelecionada: Categoria | null = null;

  constructor() {
    this.carregar();
  }

  abrirNova(): void {
    this.editandoId = null;
    this.nome = '';
    this.mensagemErro = '';
    this.showFormulario = true;
  }

  abrirEditar(categoria: Categoria): void {
    this.editandoId = categoria.id;
    this.nome = categoria.nome;
    this.mensagemErro = '';
    this.showFormulario = true;
  }

  salvarCategoria(): void {
    this.mensagemErro = '';
    const nome = this.nome.trim().replace(/\s+/g, ' ');

    if (!nome) {
      this.mensagemErro = 'Informe o nome da categoria.';
      return;
    }

    if (nome.length < 2 || nome.length > 100) {
      this.mensagemErro = 'Informe um nome com 2 a 100 caracteres.';
      return;
    }

    this.categoriaService.salvar({
      id: this.editandoId ?? undefined,
      nome
    }).subscribe({
      next: () => {
        this.showFormulario = false;
        this.carregar();
      },
      error: erro => {
        this.mensagemErro = this.mensagemErroApi(erro, 'Não foi possível salvar a categoria.');
      }
    });
  }

  pedirRemocao(categoria: Categoria): void {
    this.categoriaSelecionada = categoria;
    this.mensagemErroConfirmacao = '';
    this.showConfirmacao = true;
  }

  confirmarRemocao(): void {
    if (!this.categoriaSelecionada) {
      return;
    }

    this.categoriaService.desativar(this.categoriaSelecionada.id).subscribe({
      next: () => {
        this.showConfirmacao = false;
        this.categoriaSelecionada = null;
        this.carregar();
      },
      error: erro => {
        this.mensagemErroConfirmacao = this.mensagemErroApi(erro, 'Não foi possível desativar a categoria.');
      }
    });
  }

  private carregar(): void {
    this.categoriaService.listar().subscribe({
      next: categorias => {
        this.categorias = categorias;
      },
      error: erro => {
        this.mensagemErro = this.mensagemErroApi(erro, 'Não foi possível carregar as categorias.');
      }
    });
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