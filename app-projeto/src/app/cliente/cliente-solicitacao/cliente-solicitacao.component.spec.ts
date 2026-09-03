import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteSolicitacaoComponent } from './cliente-solicitacao.component';

describe('ClienteSolicitacaoComponent', () => {
  let component: ClienteSolicitacaoComponent;
  let fixture: ComponentFixture<ClienteSolicitacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteSolicitacaoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteSolicitacaoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
