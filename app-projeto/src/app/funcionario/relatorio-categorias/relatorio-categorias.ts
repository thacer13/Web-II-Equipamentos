import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

interface ReceitaCategoria {
  categoria: string;
  quantidade: number;
  receita: number;
}

@Component({
  selector: 'app-relatorio-categorias',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule
  ],
  templateUrl: './relatorio-categorias.html',
})
export class RelatorioCategoriasComponent {
  private router = inject(Router);

  receitas: ReceitaCategoria[] = [
    {
      categoria: 'Notebook',
      quantidade: 4,
      receita: 1250
    },
    {
      categoria: 'Desktop',
      quantidade: 3,
      receita: 890
    },
    {
      categoria: 'Impressora',
      quantidade: 5,
      receita: 1100
    },
    {
      categoria: 'Mouse',
      quantidade: 2,
      receita: 180
    },
    {
      categoria: 'Teclado',
      quantidade: 3,
      receita: 350
    }
  ];

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