import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';

interface Categoria {
  id: number;
  nome: string;
  ativo: boolean;
}

const LS_CHAVE = 'categorias';

const CATEGORIAS_INICIAIS: Categoria[] = [
  { id: 1, nome: 'Notebook', ativo: true },
  { id: 2, nome: 'Desktop', ativo: true },
  { id: 3, nome: 'Impressora', ativo: true },
  { id: 4, nome: 'Mouse', ativo: true },
  { id: 5, nome: 'Teclado', ativo: true },
];

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
  private router = inject(Router);

  categorias: Categoria[] = [];
  showFormulario = false;
  showConfirmacao = false;
  editandoId: number | null = null;
  nome = '';
  mensagemErro = '';
  categoriaSelecionada: Categoria | null = null;

  constructor() {
    this.carregar();
  }

  voltar(): void {
    this.router.navigate(['/funcionario']);
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
    const nome = this.nome.trim();

    if (!nome) {
      this.mensagemErro = 'Informe o nome da categoria.';
      return;
    }

    const duplicada = this.categorias.some((categoria) =>
      categoria.nome.toLowerCase() === nome.toLowerCase() &&
      categoria.id !== this.editandoId
    );

    if (duplicada) {
      this.mensagemErro = 'Já existe uma categoria com esse nome.';
      return;
    }

    if (this.editandoId === null) {
      const proximoId =
        this.categorias.length > 0
          ? Math.max(...this.categorias.map((categoria) => categoria.id)) + 1
          : 1;

      this.categorias.push({
        id: proximoId,
        nome,
        ativo: true
      });
    } else {
      const categoria =
        this.categorias.find((item) => item.id === this.editandoId);

      if (categoria) {
        categoria.nome = nome;
      }
    }

    this.salvarLocal();
    this.showFormulario = false;
  }

  pedirDesativacao(categoria: Categoria): void {
    this.categoriaSelecionada = categoria;
    this.showConfirmacao = true;
  }

  confirmarDesativacao(): void {
    if (!this.categoriaSelecionada) {
      return;
    }

    this.categoriaSelecionada.ativo = false;

    this.salvarLocal();

    this.showConfirmacao = false;
    this.categoriaSelecionada = null;
  }

  ativar(categoria: Categoria): void {
    categoria.ativo = true;
    this.salvarLocal();
  }

  private carregar(): void {
    if (typeof localStorage === 'undefined') {
      this.categorias =
        CATEGORIAS_INICIAIS.map((categoria) => ({ ...categoria }));
      return;
    }

    const dados = localStorage.getItem(LS_CHAVE);

    this.categorias = dados
      ? JSON.parse(dados)
      : CATEGORIAS_INICIAIS.map((categoria) => ({ ...categoria }));

    this.salvarLocal();
  }

  private salvarLocal(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        LS_CHAVE,
        JSON.stringify(this.categorias)
      );
    }
  }
}