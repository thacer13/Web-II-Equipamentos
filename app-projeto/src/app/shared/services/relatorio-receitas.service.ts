import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReceitaDia {
  data: string;
  quantidade: number;
  receita: number;
}

@Injectable({ providedIn: 'root' })
export class RelatorioReceitasService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/relatorios/receitas';

  listar(inicio?: string, fim?: string): Observable<ReceitaDia[]> {
    let params = new HttpParams();
    if (inicio) {
      params = params.set('inicio', inicio);
    }
    if (fim) {
      params = params.set('fim', fim);
    }

    return this.http.get<ReceitaDia[]>(this.apiUrl, {
      params,
      withCredentials: true,
    });
  }
}
