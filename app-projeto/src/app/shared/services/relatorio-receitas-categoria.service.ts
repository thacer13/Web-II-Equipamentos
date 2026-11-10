import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReceitaCategoria {
  categoria: string;
  quantidade: number;
  receita: number;
}

@Injectable({ providedIn: 'root' })
export class RelatorioReceitasCategoriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/relatorios/receitas-categoria';

  listar(): Observable<ReceitaCategoria[]> {
    return this.http.get<ReceitaCategoria[]>(this.apiUrl, { withCredentials: true });
  }
}
