import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PagamentoResposta {
  id: number;
  estado: 'PAGA';
  precoOrcado: number | null;
}

@Injectable({ providedIn: 'root' })
export class PagamentoService {
  private http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8080/api/solicitacoes';

  pagar(solicitacaoId: number): Observable<PagamentoResposta> {
    return this.http.post<PagamentoResposta>(
      `${this.apiUrl}/${solicitacaoId}/pagamento`,
      null,
      { withCredentials: true }
    );
  }
}