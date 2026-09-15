import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteOrcamentoComponent } from './cliente-orcamento.component';

describe('ClienteOrcamentoComponent', () => {
  let component: ClienteOrcamentoComponent;
  let fixture: ComponentFixture<ClienteOrcamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteOrcamentoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteOrcamentoComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('solicitacao', {
      id: 1,
      dataHora: '2026-03-15T14:30:00',
      descricaoEquipamento: 'Notebook Dell Inspiron 15',
      categoriaEquipamento: 'Notebook',
      descricaoDefeito: 'Tela piscando',
      estado: 'ORÇADA',
      precoOrcado: 250,
      historico: [],
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
