import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  private router = inject(Router);
  private location = inject(Location);
  private categoriaService = inject(CategoriaService);

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
    const nome = this.nome.trim().replace(/\s+/g, ' ');

    if (!nome) {
      this.mensagemErro = 'Informe o nome da categoria.';
      return;
    }

    if (nome.length < 2 || nome.length > 100) {
      this.mensagemErro = 'Informe um nome com 2 a 100 caracteres.';
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

  pedirRemocao(categoria: Categoria): void {
    this.categoriaSelecionada = categoria;
    this.showConfirmacao = true;
  }

  confirmarRemocao(): void {
    if (!this.categoriaSelecionada) {
      return;
    }

    this.categorias = this.categorias.filter((item) => item.id !== this.categoriaSelecionada?.id);

    this.salvarLocal();

    this.showConfirmacao = false;
    this.categoriaSelecionada = null;
  }

  ativar(categoria: Categoria): void {
    categoria.ativo = true;
    this.salvarLocal();
  }

  private carregar(): void {
    this.categorias = this.categoriaService.listar();
  }

  private salvarLocal(): void {
    this.categoriaService.salvar(this.categorias);
  }
}