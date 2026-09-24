import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { jsPDF } from 'jspdf';

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
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    const margem = 15;
    const larguraPagina = doc.internal.pageSize.getWidth();
    const alturaPagina = doc.internal.pageSize.getHeight();
    const larguraUtil = larguraPagina - margem * 2;
    const alturaLinha = 10;

    const colDataInicial = margem + 4;
    const colDataFinal = margem + larguraUtil * 0.3;
    const colQuantidade = margem + larguraUtil * 0.55;
    const colReceita = margem + larguraUtil - 4; 

    const moeda = (v: number) => this.formatarMoeda(v).replace(/\u00A0/g, ' ');

    let y = margem;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55);
    doc.text('Receita por Período', margem, y + 5);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(
      'Receita acumulada da empresa agrupada por dia, dentro do período selecionado.',
      margem,
      y
    );
    y += 10;

    const larguraCard = (larguraUtil - 6) / 2;
    const alturaCard = 22;

    const desenharCard = (x: number, titulo: string, valor: string) => {
      doc.setDrawColor(229, 231, 235);
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(x, y, larguraCard, alturaCard, 2, 2, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(titulo, x + 5, y + 8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(31, 41, 55);
      doc.text(valor, x + 5, y + 17);
    };

    desenharCard(margem, 'Total de Serviços', String(this.totalServicos));
    desenharCard(margem + larguraCard + 6, 'Receita Total', moeda(this.totalReceita));
    y += alturaCard + 10;

    const desenharCabecalho = () => {
      doc.setFillColor(249, 250, 251);
      doc.rect(margem, y, larguraUtil, alturaLinha, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text('Data Inicial', colDataInicial, y + 6.5);
      doc.text('Data Final', colDataFinal, y + 6.5);
      doc.text('Qtd. de Serviços', colQuantidade, y + 6.5);
      doc.text('Receita', colReceita, y + 6.5, { align: 'right' });

      y += alturaLinha;
    };

    const novaPaginaSeNecessario = () => {
      if (y + alturaLinha > alturaPagina - margem) {
        doc.addPage();
        y = margem;
        desenharCabecalho();
      }
    };

    desenharCabecalho();

    for (const item of this.receitas) {
      novaPaginaSeNecessario();

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      doc.text(item.data, colDataInicial, y + 6.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      doc.text(item.data, colDataFinal, y + 6.5);

      doc.setTextColor(75, 85, 99);
      doc.text(String(item.quantidade), colQuantidade, y + 6.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(moeda(item.receita), colReceita, y + 6.5, { align: 'right' });

      doc.setDrawColor(229, 231, 235);
      doc.line(margem, y + alturaLinha, margem + larguraUtil, y + alturaLinha);

      y += alturaLinha;
    }
    novaPaginaSeNecessario();

    doc.setFillColor(249, 250, 251);
    doc.rect(margem, y, larguraUtil, alturaLinha, 'F');
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.5);
    doc.line(margem, y, margem + larguraUtil, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Data Inicial', colDataInicial, y + 6.5);
    doc.text('Data Final', colDataFinal, y + 6.5);
    doc.text(String(this.totalServicos), colQuantidade, y + 6.5);
    doc.text(moeda(this.totalReceita), colReceita, y + 6.5, { align: 'right' });

    doc.save('relatorio-periodo.pdf');
  }

  voltar(): void {
    this.router.navigate(['/funcionario']);
  }
}