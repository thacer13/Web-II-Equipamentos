import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SolicitacaoService } from './solicitacao.service';

describe('SolicitacaoService', () => {
  let service: SolicitacaoService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SolicitacaoService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('conclui manutenção via API e envia os dados com a sessão', () => {
    let estado: string | undefined;
    service.concluirManutencao(7, 'Troca da tela', 'Evitar quedas')
      .subscribe((solicitacao) => (estado = solicitacao.estado));

    const request = httpTestingController.expectOne(
      'http://localhost:8080/api/solicitacoes/7/manutencao'
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      descricaoManutencao: 'Troca da tela',
      orientacoesCliente: 'Evitar quedas',
    });
    expect(request.request.withCredentials).toBe(true);

    request.flush({
      id: 7,
      dataHora: '2026-11-09T15:30:00',
      descricaoEquipamento: 'Notebook',
      descricaoDefeito: 'Tela quebrada',
      categoriaEquipamento: 'Notebook',
      estado: 'ARRUMADA',
      precoOrcado: null,
    });
    expect(estado).toBe('ARRUMADA');
  });

  it('redireciona manutenção via API com destino e credenciais', () => {
    let estado: string | undefined;
    service.redirecionar(7, 2).subscribe((solicitacao) => (estado = solicitacao.estado));

    const request = httpTestingController.expectOne(
      'http://localhost:8080/api/solicitacoes/7/redirecionamento'
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ funcionarioDestinoId: 2 });
    expect(request.request.withCredentials).toBe(true);

    request.flush({
      id: 7,
      dataHora: '2026-11-09T15:30:00',
      descricaoEquipamento: 'Notebook',
      descricaoDefeito: 'Tela quebrada',
      categoriaEquipamento: 'Notebook',
      estado: 'REDIRECIONADA',
      precoOrcado: null,
    });
    expect(estado).toBe('REDIRECIONADA');
  });
});
