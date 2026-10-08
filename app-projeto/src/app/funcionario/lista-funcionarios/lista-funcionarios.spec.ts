import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ListaFuncionariosComponent } from './lista-funcionarios';

describe('ListaFuncionariosComponent', () => {
  let component: ListaFuncionariosComponent;
  let storage: Record<string, string>;

  beforeEach(async () => {
    storage = {};
    Object.defineProperties(storage, {
      getItem: { value: (key: string) => storage[key] ?? null },
      setItem: { value: (key: string, value: string) => { storage[key] = value; } },
      removeItem: { value: (key: string) => { delete storage[key]; } }
    });
    vi.stubGlobal('localStorage', storage);

    await TestBed.configureTestingModule({
      imports: [ListaFuncionariosComponent],
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: Location, useValue: { back: vi.fn() } }
      ]
    }).compileComponents();

    component = TestBed.createComponent(ListaFuncionariosComponent).componentInstance;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exclui o funcionário da lista e persiste a remoção', () => {
    const funcionario = component.funcionarios.find((item) => item.nome === 'Maria')!;

    component.pedirRemocao(funcionario);
    component.confirmarRemocao();

    expect(component.funcionarios.some((item) => item.id === funcionario.id)).toBe(false);
    expect(JSON.parse(storage['funcionarios-crud']).some((item: { id: number }) => item.id === funcionario.id)).toBe(false);
    expect(component.showConfirmacao).toBe(false);
  });

  it('permite excluir um funcionário que já estava inativo', () => {
    const funcionario = component.funcionarios.find((item) => item.nome === 'Maria')!;
    funcionario.ativo = false;

    component.pedirRemocao(funcionario);
    component.confirmarRemocao();

    expect(component.funcionarios.some((item) => item.id === funcionario.id)).toBe(false);
  });
});
