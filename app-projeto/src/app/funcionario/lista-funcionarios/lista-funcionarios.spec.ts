import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { Funcionario } from '../../shared/models/funcionario.model';
import { UsuarioService } from '../../shared/services/usuario.service';
import { ListaFuncionariosComponent } from './lista-funcionarios';

describe('ListaFuncionariosComponent', () => {
  let component: ListaFuncionariosComponent;
  let funcionarios: Funcionario[];
  let usuarioService: {
    listarFuncionarios: ReturnType<typeof vi.fn>;
    obterUsuarioLogado: ReturnType<typeof vi.fn>;
    salvarFuncionario: ReturnType<typeof vi.fn>;
    redefinirSenhaFuncionario: ReturnType<typeof vi.fn>;
    remover: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    funcionarios = [
      {
        id: 1,
        nome: 'Maria',
        email: 'maria@email.com',
        perfil: 'FUNCIONARIO',
        dataNascimento: '1990-01-01',
        ativo: true
      },
      {
        id: 2,
        nome: 'João',
        email: 'joao@email.com',
        perfil: 'FUNCIONARIO',
        dataNascimento: '1991-02-02',
        ativo: true
      }
    ];
    usuarioService = {
      listarFuncionarios: vi.fn(() => of(funcionarios)),
      obterUsuarioLogado: vi.fn(() => null),
      salvarFuncionario: vi.fn(() => of(funcionarios[0])),
      redefinirSenhaFuncionario: vi.fn(() => of(undefined)),
      remover: vi.fn(() => of(undefined))
    };

    await TestBed.configureTestingModule({
      imports: [ListaFuncionariosComponent],
      providers: [{ provide: UsuarioService, useValue: usuarioService }]
    }).compileComponents();

    component = TestBed.createComponent(ListaFuncionariosComponent).componentInstance;
    component.ngOnInit();
  });

  it('solicita desativação à API e fecha a confirmação após sucesso', () => {
    const funcionario = component.funcionarios()[0];

    component.pedirRemocao(funcionario);
    component.confirmarRemocao();

    expect(usuarioService.remover).toHaveBeenCalledWith(funcionario.id);
    expect(component.showConfirmacao).toBe(false);
  });

  it('não permite desativar funcionários inativos ou o último funcionário ativo', () => {
    const ultimoAtivo = component.funcionarios()[0];
    component.funcionarios.set([ultimoAtivo]);
    expect(component.podeRemover(ultimoAtivo)).toBe(false);
    expect(component.podeRemover({ ...ultimoAtivo, ativo: false })).toBe(false);
  });

  it('exibe mensagem devolvida pela API ao falhar a desativação', () => {
    usuarioService.remover.mockReturnValue(
      throwError(() => ({ error: { mensagem: 'Não foi possível desativar.' } }))
    );
    component.pedirRemocao(component.funcionarios()[0]);
    component.confirmarRemocao();

    expect(component.mensagemErroConfirmacao).toBe('Não foi possível desativar.');
    expect(component.showConfirmacao).toBe(true);
  });

  it('renderiza os funcionários quando a resposta da API chega após a renderização inicial', async () => {
    const resposta = new Subject<Funcionario[]>();
    usuarioService.listarFuncionarios.mockReturnValue(resposta);

    const fixture = TestBed.createComponent(ListaFuncionariosComponent);
    fixture.detectChanges();
    resposta.next(funcionarios);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(2);
  });

  it('rejeita data de nascimento anterior ao limite permitido', () => {
    component.nome = 'Novo Funcionário';
    component.email = 'novo@teste.com';
    component.dataNascimento = new Date(1949, 11, 31);

    component.salvarFuncionario();

    expect(component.mensagemErro).toBe('A data de nascimento deve estar entre 01/01/1950 e hoje.');
    expect(usuarioService.salvarFuncionario).not.toHaveBeenCalled();
  });
});
