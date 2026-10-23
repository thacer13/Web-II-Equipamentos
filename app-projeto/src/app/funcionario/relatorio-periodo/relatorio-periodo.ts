import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { jsPDF } from 'jspdf';
import { hoje, paraIso } from '../../shared/utils/datas';
import { SolicitacaoService } from '../../shared/services/solicitacao.service';

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
    ButtonModule,
    DatePickerModule
  ],
  templateUrl: './relatorio-periodo.html',
})
export class RelatorioPeriodoComponent {
  private router = inject(Router);
  private location = inject(Location);
  private solicitacaoService = inject(SolicitacaoService);

  dataInicio: Date | null = null;
  dataFim: Date | null = null;
  private periodoInicio: Date | null = null;
  private periodoFim: Date | null = null;
  readonly minDate = new Date(2020, 0, 1);
  readonly maxDate = hoje();

  receitasOriginais: ReceitaDia[] = [];
  receitas: ReceitaDia[] = [];

  constructor() {
    this.receitasOriginais = this.calcularReceitasPorDia();
    this.receitas = [...this.receitasOriginais];
  }

  private calcularReceitasPorDia(): ReceitaDia[] {
    const lista: ReceitaDia[] = [];

    for (const pagamento of this.solicitacaoService.listarReceitas()) {
      const data = this.diaLocal(pagamento.dataPagamento);
      let dia = lista.find((item) => item.data === data);

      if (!dia) {
        dia = { data, quantidade: 0, receita: 0 };
        lista.push(dia);
      }

      dia.quantidade++;
      dia.receita += pagamento.valor;
    }

    return lista.sort((a, b) => a.data.localeCompare(b.data));
  }

  // Converte a data/hora do pagamento para o dia (aaaa-mm-dd) no horário local
  private diaLocal(dataHora: string): string {
    const d = new Date(dataHora);
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');

    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  consultar(): void {
    const foraDoLimite = (data: Date | null) =>
      !!data && (data < this.minDate || data > this.maxDate);

    if (foraDoLimite(this.dataInicio) || foraDoLimite(this.dataFim)) {
      alert('As datas devem estar entre 01/01/2020 e hoje.');
      return;
    }

    if (
      this.dataInicio &&
      this.dataFim &&
      this.dataInicio > this.dataFim
    ) {
      alert('A data inicial não pode ser maior que a data final.');
      return;
    }

    this.periodoInicio = this.dataInicio;
    this.periodoFim = this.dataFim;

    const inicio = this.dataInicio ? paraIso(this.dataInicio) : '';
    const fim = this.dataFim ? paraIso(this.dataFim) : '';

    this.receitas = this.receitasOriginais.filter((item) => {
      const depoisDoInicio =
        !inicio || item.data >= inicio;

      const antesDoFim =
        !fim || item.data <= fim;

      return depoisDoInicio && antesDoFim;
    });
  }

  limpar(): void {
    this.dataInicio = null;
    this.dataFim = null;
    this.periodoInicio = null;
    this.periodoFim = null;
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

  // Texto do período usado no PDF (datas em branco = sem limite)
  private descricaoPeriodo(): string {
    const formatar = (data: Date) => data.toLocaleDateString('pt-BR');

    if (this.periodoInicio && this.periodoFim) {
      return `${formatar(this.periodoInicio)} a ${formatar(this.periodoFim)}`;
    }

    if (this.periodoInicio) {
      return `a partir de ${formatar(this.periodoInicio)}`;
    }

    if (this.periodoFim) {
      return `até ${formatar(this.periodoFim)}`;
    }

    return 'todo o período';
  }

  gerarPdf(): void {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    const margem = 15;
    const larguraPagina = doc.internal.pageSize.getWidth();
    const alturaPagina = doc.internal.pageSize.getHeight();
    const larguraUtil = larguraPagina - margem * 2;
    const alturaLinha = 10;

    const colData = margem + 4;
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
    y += 6;
    doc.text(`Período: ${this.descricaoPeriodo()}`, margem, y);
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
      doc.text('Data', colData, y + 6.5);
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
      doc.text(this.formatarData(item.data), colData, y + 6.5);

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
    doc.text('Total', colData, y + 6.5);
    doc.text(String(this.totalServicos), colQuantidade, y + 6.5);
    doc.text(moeda(this.totalReceita), colReceita, y + 6.5, { align: 'right' });

    doc.save('relatorio-periodo.pdf');
  }
}