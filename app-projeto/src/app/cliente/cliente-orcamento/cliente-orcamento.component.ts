import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Solicitacao } from '../../shared/models/solicitacao.model';

export interface RespostaOrcamento {
  decisao: 'APROVADA' | 'REJEITADA';
  motivo?: string;
}

@Component({
  selector: 'app-cliente-orcamento',
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente-orcamento.component.html',
  styleUrl: './cliente-orcamento.component.css',
})
export class ClienteOrcamentoComponent {
  @Input({ required: true }) solicitacao!: Solicitacao;
  @Output() aoResponder = new EventEmitter<RespostaOrcamento>();
  @Output() aoCancelar = new EventEmitter<void>();

  mostrandoRejeicao = false;
  motivoRejeicao = '';

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  aprovar(): void {
    if (this.solicitacao.estado !== 'ORÇADA' || !this.solicitacao.precoOrcado || this.solicitacao.precoOrcado <= 0) {
      alert('Esta solicitação não possui um orçamento válido.');
      return;
    }

    this.aoResponder.emit({ decisao: 'APROVADA' });
  }

  iniciarRejeicao(): void {
    this.mostrandoRejeicao = true;
  }

  cancelarRejeicao(): void {
    this.mostrandoRejeicao = false;
    this.motivoRejeicao = '';
  }

  confirmarRejeicao(): void {
    const motivo = this.motivoRejeicao.trim().replace(/\s+/g, ' ');

    if (motivo.length < 3 || motivo.length > 1000) {
      alert('O motivo deve ter entre 3 e 1000 caracteres.');
      return;
    }

    this.aoResponder.emit({ decisao: 'REJEITADA', motivo });
  }
}