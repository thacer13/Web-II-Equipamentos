import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-manutencao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule
  ],
  templateUrl: './manutencao.html',
})
export class ManutencaoComponent {
  // Dados da solicitação (viriam do backend)
  cliente: string = 'Nome do Cliente';
  produto: string = 'Notebook Dell Inspiron 15';
  descricaoProblema: string = 'Tela quebrada';
  dataSolicitacao: string = '26/08/2026 - 10:30';

  funcionarioLogado: string = 'Funcionário Exemplo';

  descricaoManutencao: string = '';
  orientacoesCliente: string = '';

  onConfirmarManutencao() {
    const dataHoraManutencao = new Date();

    console.log('Descrição:', this.descricaoManutencao);
    console.log('Orientações:', this.orientacoesCliente);
    console.log('Funcionário:', this.funcionarioLogado);
    console.log('Data/Hora da Manutenção:', dataHoraManutencao);
    console.log('Status: ARRUMADA');
  }

  onRedirecionarClick() {
    // RF015 - Redirecionar Manutenção
    console.log('Redirecionar manutenção');
  }
}