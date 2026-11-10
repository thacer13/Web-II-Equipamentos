import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RelatorioReceitasService } from './relatorio-receitas.service';

describe('RelatorioReceitasService', () => {
  let service: RelatorioReceitasService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RelatorioReceitasService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('consulta no backend com intervalo inclusivo e credenciais da sessão', () => {
    let resultado: unknown;
    service.listar('2026-11-01', '2026-11-10').subscribe((receitas) => (resultado = receitas));

    const request = httpTestingController.expectOne(
      (req) => req.url === 'http://localhost:8080/api/relatorios/receitas'
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('inicio')).toBe('2026-11-01');
    expect(request.request.params.get('fim')).toBe('2026-11-10');
    expect(request.request.withCredentials).toBe(true);

    const receitas = [{ data: '2026-11-10', quantidade: 2, receita: 325.5 }];
    request.flush(receitas);
    expect(resultado).toEqual(receitas);
  });

  it('omite os limites de data que não foram informados', () => {
    service.listar(undefined, '2026-11-10').subscribe();

    const request = httpTestingController.expectOne(
      (req) => req.url === 'http://localhost:8080/api/relatorios/receitas'
    );
    expect(request.request.params.has('inicio')).toBe(false);
    expect(request.request.params.get('fim')).toBe('2026-11-10');
    request.flush([]);
  });
});
