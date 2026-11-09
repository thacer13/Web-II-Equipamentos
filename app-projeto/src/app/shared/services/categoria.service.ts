import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/categorias';

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

  // Categorias ativas do banco, usadas na abertura de solicitação (GET /api/categorias, T21)
  listarAtivasDaApi(): Observable<Categoria[]> {
    return this.http
      .get<Categoria[]>(this.apiUrl, { withCredentials: true })
      .pipe(map((categorias) => categorias.filter((categoria) => categoria.ativo)));
  }

  salvar(categorias: Categoria[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LS_CHAVE, JSON.stringify(categorias));
    }
  }
}
