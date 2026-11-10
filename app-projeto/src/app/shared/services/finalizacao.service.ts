import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Solicitacao } from '../models/solicitacao.model';
import { EstadoSolicitacao } from '../models/estado-solicitacao.model';

interface SolicitacaoResumoApi {
  id: number;
  dataHora: string;
  descricaoEquipamento: string;
  descricaoDefeito: string;
  categoriaEquipamento: string;
  estado: EstadoSolicitacao;
  precoOrcado: number | null;
}

@Injectable({ providedIn: 'root' })
export class FinalizacaoService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/solicitacoes';

  listarDoFuncionario(): Observable<Solicitacao[]> {
    return this.http
      .get<SolicitacaoResumoApi[]>(`${this.apiUrl}/funcionario`, { withCredentials: true })
      .pipe(map(lista => lista.map(item => ({
        id: item.id,
        dataHora: item.dataHora,
        descricaoEquipamento: item.descricaoEquipamento,
        descricaoDefeito: item.descricaoDefeito,
        categoriaEquipamento: item.categoriaEquipamento,
        estado: item.estado,
        precoOrcado: item.precoOrcado ?? undefined,
        historico: []
      }))));
  }

  finalizar(id: number): Observable<SolicitacaoResumoApi> {
    return this.http.post<SolicitacaoResumoApi>(
      `${this.apiUrl}/${id}/finalizacao`, null, { withCredentials: true }
    );
  }
}