import { Component, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LIMITES, naoVazio, normalizarTexto } from '../../shared/validators/form-validators';
import { SolicitacaoService } from '../../shared/services/solicitacao.service';
import { Categoria, CategoriaService } from '../../shared/services/categoria.service';

@Component({
  selector: 'app-cliente-solicitacao',
  imports: [ReactiveFormsModule],
  templateUrl: './cliente-solicitacao.component.html',
  styleUrl: './cliente-solicitacao.component.css',
})
export class ClienteSolicitacaoComponent {
  @Output() aoSalvar = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private solicitacaoService = inject(SolicitacaoService);
  private categoriaService = inject(CategoriaService);

  mensagemErro = '';
  categorias: Categoria[] = this.categoriaService.listar().filter((categoria) => categoria.ativo);

  formulario: FormGroup = this.fb.group({
    descricaoEquipamento: ['', [Validators.required, naoVazio(), Validators.minLength(3), Validators.maxLength(LIMITES.descricaoEquipamento)]],
    categoriaEquipamento: ['', Validators.required],
    descricaoDefeito: ['', [Validators.required, naoVazio(), Validators.minLength(10), Validators.maxLength(LIMITES.descricaoDefeito)]],
  });

  enviar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensagemErro = 'Preencha todos os campos corretamente.';
      return;
    }

    const descricaoEquipamento = normalizarTexto(this.formulario.value.descricaoEquipamento);
    const categoriaEquipamento = normalizarTexto(this.formulario.value.categoriaEquipamento);
    const descricaoDefeito = normalizarTexto(this.formulario.value.descricaoDefeito);

    if (!descricaoEquipamento || !categoriaEquipamento || !descricaoDefeito) {
      this.mensagemErro = 'Preencha todos os campos corretamente.';
      return;
    }

    try {
      this.solicitacaoService.criar({ descricaoEquipamento, categoriaEquipamento, descricaoDefeito });
    } catch (erro) {
      this.mensagemErro = erro instanceof Error ? erro.message : 'Não foi possível criar a solicitação.';
      return;
    }
    this.formulario.reset();
    this.mensagemErro = '';
    this.aoSalvar.emit();
  }
}
