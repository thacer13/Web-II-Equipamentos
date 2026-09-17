import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redirecionamento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule
  ],
  templateUrl: './redirecionamento.html',
})
export class RedirecionamentoComponent {
  private router = inject(Router);

  // Dados da solicitação (viriam do backend)
  cliente: string = 'Nome do Cliente';
  produto: string = 'Notebook Dell Inspiron 15';
  descricaoProblema: string = 'Tela quebrada';
  dataSolicitacao: string = '26/08/2026 - 10:30';

  funcionarioOrigem: string = 'Funcionário Exemplo';

  // Lista de funcionários pra quem dá pra redirecionar (viria do backend)
  funcionarios: string[] = ['Mário', 'Ana', 'Carlos', 'Beatriz'];

  funcionarioDestino: string = '';

  get funcionariosDisponiveis(): string[] {
    return this.funcionarios.filter((f) => f !== this.funcionarioOrigem);
  }

  onConfirmarRedirecionamento() {
    if (!this.funcionarioDestino) {
      return;
    }

    console.log('Funcionário origem:', this.funcionarioOrigem);
    console.log('Funcionário destino:', this.funcionarioDestino);
    console.log('Data/Hora:', new Date());
    console.log('Status: REDIRECIONADA');

    this.router.navigate(['/funcionario']);
  }
}