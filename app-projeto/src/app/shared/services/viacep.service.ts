import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Endereco } from '../models/endereco.model';
import { Observable, map } from 'rxjs';

interface ViaCepResponse {
  erro?: boolean;
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
}

@Injectable({
  providedIn: 'root',
})
export class ViacepService {
  private http = inject(HttpClient);

  consultarCep(cep: string): Observable<Endereco | null> {
    const cepLimpo = cep.replace(/\D/g, '');
    return this.http.get<ViaCepResponse>(`https://viacep.com.br/ws/${cepLimpo}/json/`).pipe(
      map(dados => {
        if (dados.erro) {
          return null;
        }
        return {
          cep: dados.cep,
          logradouro: dados.logradouro,
          complemento: dados.complemento,
          bairro: dados.bairro,
          cidade: dados.localidade,
          estado: dados.uf
        };
      })
    );
  }
}
