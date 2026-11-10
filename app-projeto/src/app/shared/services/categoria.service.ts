import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Categoria {
  id: number;
  nome: string;
  ativo: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/categorias';

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  listarAtivasDaApi(): Observable<Categoria[]> {
    return this.listar().pipe(
      map((categorias) => categorias.filter((categoria) => categoria.ativo))
    );
  }

  salvar(categoria: Pick<Categoria, 'nome'> & { id?: number }): Observable<Categoria> {
    const payload = { nome: categoria.nome.trim().replace(/\s+/g, ' ') };
    return categoria.id
      ? this.http.put<Categoria>(`${this.apiUrl}/${categoria.id}`, payload)
      : this.http.post<Categoria>(this.apiUrl, payload);
  }

  desativar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
