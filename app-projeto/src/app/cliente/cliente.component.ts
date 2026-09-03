import { Component } from '@angular/core';
import { ClienteSolicitacaoComponent } from "./cliente-solicitacao/cliente-solicitacao.component";

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [ClienteSolicitacaoComponent],
  templateUrl: './cliente.component.html',
})
export class ClienteComponent {
  mostrarFormulario = false;

  abrirFormulario() {
    this.mostrarFormulario = true;
  }

  fecharFormulario() {
    this.mostrarFormulario = false;
  }
}