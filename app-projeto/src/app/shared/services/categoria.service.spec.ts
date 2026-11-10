import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CategoriaService } from './categoria.service';

describe('CategoriaService', () => {
  let service: CategoriaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(CategoriaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista categorias pela API', () => {
    service.listar().subscribe(categorias => expect(categorias).toEqual([]));
    const request = http.expectOne('http://localhost:8080/api/categorias');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('cria e edita categorias pela API', () => {
    service.salvar({ nome: 'Notebook' }).subscribe();
    const criacao = http.expectOne('http://localhost:8080/api/categorias');
    expect(criacao.request.method).toBe('POST');
    criacao.flush({ id: 1, nome: 'Notebook', ativo: true });

    service.salvar({ id: 1, nome: 'Notebooks' }).subscribe();
    const edicao = http.expectOne('http://localhost:8080/api/categorias/1');
    expect(edicao.request.method).toBe('PUT');
    edicao.flush({ id: 1, nome: 'Notebooks', ativo: true });
  });

  it('desativa categoria sem removê-la localmente', () => {
    service.desativar(1).subscribe();
    const request = http.expectOne('http://localhost:8080/api/categorias/1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
