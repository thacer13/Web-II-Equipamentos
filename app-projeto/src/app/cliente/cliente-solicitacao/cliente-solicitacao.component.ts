import { Component, Output, EventEmitter } from '@angular/core';
import { ClienteComponent } from '../cliente.component';

@Component({
  selector: 'app-cliente-solicitacao',
  imports: [],
  templateUrl: './cliente-solicitacao.component.html',
  styleUrl: './cliente-solicitacao.component.css',
})
export class ClienteSolicitacaoComponent {
  @Output() aoCancelar = new EventEmitter<void>();

  botaoCancelar() {
    this.aoCancelar.emit();
  }

}
