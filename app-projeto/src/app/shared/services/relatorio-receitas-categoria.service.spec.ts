import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RelatorioReceitasCategoriaService } from './relatorio-receitas-categoria.service';

describe('RelatorioReceitasCategoriaService', () => {
  let service: RelatorioReceitasCategoriaService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RelatorioReceitasCategoriaService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('consulta a rota do RF020 com as credenciais da sessão', () => {
    const resultado = [
      { categoria: 'Notebook', quantidade: 2, receita: 450 },
      { categoria: 'Teclado', quantidade: 1, receita: 75.5 },
    ];
    let recebido: unknown;

    service.listar().subscribe((receitas) => (recebido = receitas));

    const request = httpTestingController.expectOne(
      'http://localhost:8080/api/relatorios/receitas-categoria'
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush(resultado);
    expect(recebido).toEqual(resultado);
  });
});
