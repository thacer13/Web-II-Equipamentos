import { ChangeDetectorRef, Component, OnInit, Output, EventEmitter, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { LIMITES, naoVazio, normalizarTexto } from '../../shared/validators/form-validators';
import { SolicitacaoService } from '../../shared/services/solicitacao.service';
import { Categoria, CategoriaService } from '../../shared/services/categoria.service';

@Component({
  selector: 'app-cliente-solicitacao',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule, TextareaModule],
  templateUrl: './cliente-solicitacao.component.html',
  styleUrl: './cliente-solicitacao.component.css',
})
export class ClienteSolicitacaoComponent implements OnInit {
  @Output() aoSalvar = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private solicitacaoService = inject(SolicitacaoService);
  private categoriaService = inject(CategoriaService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  mensagemErro = '';
  enviando = false;
  categorias: Categoria[] = [];

  formulario: FormGroup = this.fb.group({
    descricaoEquipamento: ['', [Validators.required, naoVazio(), Validators.minLength(3), Validators.maxLength(LIMITES.descricaoEquipamento)]],
    categoriaId: [null, Validators.required],
    descricaoDefeito: ['', [Validators.required, naoVazio(), Validators.minLength(10), Validators.maxLength(LIMITES.descricaoDefeito)]],
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.categoriaService.listarAtivasDaApi().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensagemErro = 'Não foi possível carregar as categorias.';
        this.cdr.markForCheck();
      },
    });
  }

  enviar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensagemErro = 'Preencha todos os campos corretamente.';
      return;
    }

    const descricaoEquipamento = normalizarTexto(this.formulario.value.descricaoEquipamento);
    const descricaoDefeito = normalizarTexto(this.formulario.value.descricaoDefeito);
    const categoriaId = this.formulario.value.categoriaId as number;

    if (!descricaoEquipamento || !descricaoDefeito) {
      this.mensagemErro = 'Preencha todos os campos corretamente.';
      return;
    }

    this.enviando = true;
    this.solicitacaoService.abrir({ descricaoEquipamento, categoriaId, descricaoDefeito }).subscribe({
      next: () => {
        this.enviando = false;
        this.formulario.reset();
        this.mensagemErro = '';
        this.aoSalvar.emit();
        this.cdr.markForCheck();
      },
      error: (erro: HttpErrorResponse) => {
        this.enviando = false;
        this.mensagemErro = erro.error?.mensagem ?? 'Não foi possível criar a solicitação.';
        this.cdr.markForCheck();
      },
    });
  }
}
