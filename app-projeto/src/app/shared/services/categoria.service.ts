import { Injectable } from '@angular/core';

export interface Categoria {
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

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  listar(): Categoria[] {
    if (typeof localStorage === 'undefined') {
      return CATEGORIAS_INICIAIS.map((categoria) => ({ ...categoria }));
    }

    const dados = localStorage.getItem(LS_CHAVE);
    const categorias = dados
      ? JSON.parse(dados) as Categoria[]
      : CATEGORIAS_INICIAIS.map((categoria) => ({ ...categoria }));

    this.salvar(categorias);
    return categorias;
  }

  salvar(categorias: Categoria[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LS_CHAVE, JSON.stringify(categorias));
    }
  }
}
