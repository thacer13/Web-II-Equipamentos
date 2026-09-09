import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Endereco } from '../models/endereco.model';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViacepService {
  private http = inject(HttpClient);

  consultarCep(cep: string): Observable<Endereco | null> {
    const cepLimpo = cep.replace(/\D/g, '');
    return this.http.get<any>(`https://viacep.com.br/ws/${cepLimpo}/json/`).pipe(
      map(dados => {
        if (dados.erro) {
          return null;
        }
        return {
          cep: dados.cep,
          logradouro: dados.logradouro,
          bairro: dados.bairro,
          cidade: dados.localidade,
          estado: dados.uf
        } as Endereco;
      })
    );
  }
}
