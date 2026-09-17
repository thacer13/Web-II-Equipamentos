import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

interface ReceitaDia {
  data: string;
  quantidade: number;
  receita: number;
}

@Component({
  selector: 'app-relatorio-periodo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule
  ],
  templateUrl: './relatorio-periodo.html',
})
export class RelatorioPeriodoComponent {
  private router = inject(Router);

  dataInicio = '';
  dataFim = '';

  receitasOriginais: ReceitaDia[] = [
    {
      data: '2026-09-10',
      quantidade: 3,
      receita: 650
    },
    {
      data: '2026-09-11',
      quantidade: 5,
      receita: 1120
    },
    {
      data: '2026-09-12',
      quantidade: 2,
      receita: 430
    },
    {
      data: '2026-09-13',
      quantidade: 4,
      receita: 980
    },
    {
      data: '2026-09-14',
      quantidade: 3,
      receita: 720
    },
    {
      data: '2026-09-15',
      quantidade: 4,
      receita: 1350
    },
    {
      data: '2026-09-16',
      quantidade: 2,
      receita: 540
    }
  ];

  receitas: ReceitaDia[] = [...this.receitasOriginais];

  consultar(): void {
    if (
      this.dataInicio &&
      this.dataFim &&
      this.dataInicio > this.dataFim
    ) {
      alert('A data inicial não pode ser maior que a data final.');
      return;
    }

    this.receitas = this.receitasOriginais.filter((item) => {
      const depoisDoInicio =
        !this.dataInicio || item.data >= this.dataInicio;

      const antesDoFim =
        !this.dataFim || item.data <= this.dataFim;

      return depoisDoInicio && antesDoFim;
    });
  }

  limpar(): void {
    this.dataInicio = '';
    this.dataFim = '';
    this.receitas = [...this.receitasOriginais];
  }

  get totalServicos(): number {
    return this.receitas.reduce(
      (total, item) => total + item.quantidade,
      0
    );
  }

  get totalReceita(): number {
    return this.receitas.reduce(
      (total, item) => total + item.receita,
      0
    );
  }

  formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');

    return `${dia}/${mes}/${ano}`;
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  gerarPdf(): void {
    alert('A geração do PDF será implementada na versão final.');
  }

  voltar(): void {
    this.router.navigate(['/funcionario']);
  }
}