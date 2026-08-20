import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.html',
  styleUrls: ['./cadastro.css'],
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, InputMaskModule, ButtonModule]
})
export class CadastroComponent {
  cadastroForm: FormGroup;

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  constructor() {
    this.cadastroForm = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', Validators.required],
      cep: ['', Validators.required],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', Validators.required]
    });
  }

  buscarCep() {
    const cep = this.cadastroForm.get('cep')?.value?.replace(/\D/g, '');
    if (cep && cep.length === 8) {
      this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
        next: (dados) => {
          if (!dados.erro) {
            this.cadastroForm.patchValue({
              logradouro: dados.logradouro,
              bairro: dados.bairro,
              cidade: dados.localidade,
              estado: dados.uf
            });
            document.getElementById('numero')?.focus();
          }
        },
        error: (err) => console.error('Erro ao buscar CEP', err)
      });
    }
  }

  onSubmit() {
    if (this.cadastroForm.invalid) {
      return;
    }

    const dados = {
      ...this.cadastroForm.value,
      cpf: this.cadastroForm.value.cpf.replace(/\D/g, ''),
      telefone: this.cadastroForm.value.telefone.replace(/\D/g, ''),
      cep: this.cadastroForm.value.cep.replace(/\D/g, '')
    };

    this.http.post('http://localhost:8080/api/cadastro', dados).subscribe({
      next: (res) => console.log('Cadastrado com sucesso', res),
      error: (err) => console.error('Erro ao cadastrar', err)
    });
  }
}