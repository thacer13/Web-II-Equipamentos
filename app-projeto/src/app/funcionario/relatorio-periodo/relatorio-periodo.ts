import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { jsPDF } from 'jspdf';
import { finalize } from 'rxjs';
import { hoje, paraIso } from '../../shared/utils/datas';
import { ReceitaDia, RelatorioReceitasService } from '../../shared/services/relatorio-receitas.service';

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
export class RelatorioPeriodoComponent implements OnInit {
  private readonly relatorioService = inject(RelatorioReceitasService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  dataInicio: Date | null = null;
  dataFim: Date | null = null;
  private periodoInicio: Date | null = null;
  private periodoFim: Date | null = null;
  readonly minDate = new Date(2020, 0, 1);
  readonly maxDate = hoje();

  receitas: ReceitaDia[] = [];
  carregando = false;
  erro = '';

  ngOnInit(): void {
    this.consultar();
  }

  consultar(): void {
    const foraDoLimite = (data: Date | null) => {
      if (!data) {
        return false;
      }
      const iso = paraIso(data);
      return iso < paraIso(this.minDate) || iso > paraIso(this.maxDate);
    };

    if (foraDoLimite(this.dataInicio) || foraDoLimite(this.dataFim)) {
      this.erro = 'As datas devem estar entre 01/01/2020 e hoje.';
      this.receitas = [];
      return;
    }

    const inicio = this.dataInicio ? paraIso(this.dataInicio) : undefined;
    const fim = this.dataFim ? paraIso(this.dataFim) : undefined;
    if (inicio && fim && inicio > fim) {
      this.erro = 'A data inicial não pode ser maior que a data final.';
      this.receitas = [];
      return;
    }

    this.periodoInicio = this.dataInicio ? new Date(this.dataInicio) : null;
    this.periodoFim = this.dataFim ? new Date(this.dataFim) : null;
    this.erro = '';
    this.carregando = true;
    this.receitas = [];

    this.relatorioService.listar(inicio, fim).pipe(
      finalize(() => {
        this.carregando = false;
        this.changeDetector.markForCheck();
      })
    ).subscribe({
      next: (receitas) => {
        this.receitas = receitas;
      },
      error: (erro: { error?: { mensagem?: unknown } }) => {
        const mensagem = erro.error?.mensagem;
        this.erro = typeof mensagem === 'string'
          ? mensagem
          : 'Não foi possível carregar o relatório de receitas.';
      },
    });
  }

  limpar(): void {
    this.dataInicio = null;
    this.dataFim = null;
    this.periodoInicio = null;
    this.periodoFim = null;
    this.consultar();
  }

  get totalServicos(): number {
    return this.receitas.reduce(
      (total, item) => total + item.quantidade,
      0
    );
  }

  get totalReceita(): number {
    const totalCentavos = this.receitas.reduce(
      (total, item) => total + Math.round(item.receita * 100),
      0
    );
    return totalCentavos / 100;
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
    if (this.carregando || this.erro) {
      return;
    }

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