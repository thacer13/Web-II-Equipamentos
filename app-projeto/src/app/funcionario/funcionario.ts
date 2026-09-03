import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-funcionario',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    DialogModule
  ],
  templateUrl: './funcionario.html',
})
export class FuncionarioComponent {
  showOrcamentoInput: boolean = false;
  showDescricaoDialog: boolean = false;

  onOrcamentoClick() {
    this.showOrcamentoInput = true;
  }

  onDescricaoClick() {
    this.showDescricaoDialog = true;
  }
}