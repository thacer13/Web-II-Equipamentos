import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

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
  showDescricaoDesktopDialog: boolean = false;
  showAdicionarFuncionario: boolean = false;

  constructor(private router: Router) {}
   
 

  onAdicionarFuncionario() {
    this.showAdicionarFuncionario = true;
  }
  onOrcamentoClick() {

    const solicitacao = {

      id: 1,

      dataHora: '2026-09-08T10:30:00',

      equipamento: 'Notebook Dell Inspiron 15',

      categoria: 'Notebook',

      descricaoDefeito: 'A tela fica piscando e algumas vezes apaga completamente.',

      estado: 'ABERTA',

      cliente: {

        id: 1,

        nome: 'João Lino',

        cpf: '868.255.910-29',

        email: 'joaolino@email.com',

        telefone: '(46) 3421-9601',

        endereco: {

          logradouro: 'Rua das Flores',

          numero: '123',

          bairro: 'Centro',

          cidade: 'Curitiba',

          uf: 'PR',

          cep: '80000-000'

        }

      }

    };


    this.router.navigate(

      ['/efetuar-orcamento', solicitacao.id],

      {

        state: {

          solicitacao: solicitacao

        }

      }

    );

  }

}