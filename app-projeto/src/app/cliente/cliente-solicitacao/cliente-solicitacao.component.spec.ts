import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteSolicitacaoComponent } from './cliente-solicitacao.component';

describe('ClienteSolicitacaoComponent', () => {
  let component: ClienteSolicitacaoComponent;
  let fixture: ComponentFixture<ClienteSolicitacaoComponent>;

  beforeEach(async () => {
    localStorage.setItem('categorias', JSON.stringify([
      { id: 1, nome: 'Notebook', ativo: true },
      { id: 2, nome: 'Desativada', ativo: false },
    ]));

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

  it('loads only active categories in the dropdown', () => {
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#categoria');
    const options = Array.from(select.options).map((option) => option.textContent?.trim());

    expect(options).toEqual(['Selecione uma categoria', 'Notebook']);
  });
});
