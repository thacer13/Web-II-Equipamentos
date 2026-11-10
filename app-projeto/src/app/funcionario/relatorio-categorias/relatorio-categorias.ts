import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { jsPDF } from 'jspdf';
import { finalize } from 'rxjs';
import {
  ReceitaCategoria,
  RelatorioReceitasCategoriaService,
} from '../../shared/services/relatorio-receitas-categoria.service';

@Component({
  selector: 'app-relatorio-categorias',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './relatorio-categorias.html',
})
export class RelatorioCategoriasComponent implements OnInit {
  private readonly relatorioService = inject(RelatorioReceitasCategoriaService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  receitas: ReceitaCategoria[] = [];
  carregando = false;
  erro = '';

  ngOnInit(): void {
    this.consultar();
  }

  consultar(): void {
    this.carregando = true;
    this.erro = '';
    this.receitas = [];

    this.relatorioService.listar().pipe(
      finalize(() => {
        this.carregando = false;
        this.changeDetector.markForCheck();
      })
    ).subscribe({
      next: (receitas) => {
        this.receitas = receitas;
        this.changeDetector.markForCheck();
      },
      error: (erro: { error?: { mensagem?: unknown } }) => {
        const mensagem = erro.error?.mensagem;
        this.erro = typeof mensagem === 'string'
          ? mensagem
          : 'Não foi possível carregar o relatório de receitas por categoria.';
        this.changeDetector.markForCheck();
      },
    });
  }

  get totalServicos(): number {
    return this.receitas.reduce((total, item) => total + item.quantidade, 0);
  }

  get totalReceita(): number {
    const totalCentavos = this.receitas.reduce(
      (total, item) => total + Math.round(item.receita * 100),
      0
    );
    return totalCentavos / 100;
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
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

    const colCategoria = margem + 4;
    const colQuantidade = margem + larguraUtil * 0.55;
    const colReceita = margem + larguraUtil - 4;

    const moeda = (v: number) => this.formatarMoeda(v).replace(/\u00A0/g, ' ');

    let y = margem;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55);
    doc.text('Receita por Categoria', margem, y + 5);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(
      'Receita acumulada da empresa agrupada por categoria de equipamento.',
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
      doc.text('Categoria', colCategoria, y + 6.5);
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
      doc.text(item.categoria, colCategoria, y + 6.5);

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
    doc.text('Total', colCategoria, y + 6.5);
    doc.text(String(this.totalServicos), colQuantidade, y + 6.5);
    doc.text(moeda(this.totalReceita), colReceita, y + 6.5, { align: 'right' });

    doc.save('relatorio-categorias.pdf');
  }
}