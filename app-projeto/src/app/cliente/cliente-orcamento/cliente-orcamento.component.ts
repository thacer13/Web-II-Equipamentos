import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Solicitacao } from '../../shared/models/solicitacao.model';

@Component({
  selector: 'app-cliente-orcamento',
  imports: [FormsModule, CommonModule],
  templateUrl: './cliente-orcamento.component.html',
  styleUrl: './cliente-orcamento.component.css',
})
export class ClienteOrcamentoComponent {
  @Input({ required: true }) solicitacao!: Solicitacao;
  @Output() aoResponder = new EventEmitter<'APROVADA' | 'REJEITADA'>();
  @Output() aoCancelar = new EventEmitter<void>();

  mostrandoRejeicao = false;
  motivoRejeicao = '';

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  aprovar() {
    alert(`Serviço Aprovado no Valor ${this.formatarValor(this.solicitacao.precoOrcado ?? 0)}`);
    this.aoResponder.emit('APROVADA');
  }

  iniciarRejeicao() {
    this.mostrandoRejeicao = true;
  }

  cancelarRejeicao() {
    this.mostrandoRejeicao = false;
    this.motivoRejeicao = '';
  }

  // Confirma a rejeição (RF007)
  confirmarRejeicao() {
    const motivo = this.motivoRejeicao.trim().replace(/\s+/g, ' ');

    if (motivo.length < 3) {
      alert('Por favor, informe um motivo para a rejeição.');
      return;
    }

    if (motivo.length > 1000) {
      alert('O motivo deve ter no máximo 1000 caracteres.');
      return;
    }

    this.solicitacao.justificativaRejeicao = motivo;
    alert('Serviço Rejeitado'); // Mensagem exigida pelo RF007
    this.aoResponder.emit('REJEITADA');
  }
}
