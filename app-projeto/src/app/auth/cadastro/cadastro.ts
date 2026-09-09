import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { validarCpf } from './cpf.validator';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { ViacepService } from '../../shared/services/viacep.service';
import { UsuarioService } from '../../shared/services/usuario.service';
import { Cliente } from '../../shared/models/cliente.model';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.html',
  styleUrls: ['./cadastro.css'],
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, InputTextModule, InputMaskModule, ButtonModule]
})
export class CadastroComponent implements OnInit {
  cadastroForm!: FormGroup;

  private fb = inject(FormBuilder);
  private viaCepService = inject(ViacepService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  ngOnInit(): void {
    this.inicializarFormulario();   
  }

  private inicializarFormulario(): void {
    this.cadastroForm = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', [Validators.required, validarCpf()]],
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

  buscarCep(): void {
    const cep = this.cadastroForm.get('cep')?.value?.replace(/\D/g, '');
    if (cep && cep.length === 8) {
      this.viaCepService.consultarCep(cep).subscribe({
        next: (dados) => {
          if (dados) {
            this.cadastroForm.patchValue({
              logradouro: dados.logradouro,
              bairro: dados.bairro,
              cidade: dados.cidade,
              estado: dados.estado
            });
            document.getElementById('numero')?.focus();
          } else {
            alert('CEP não encontrado.');
          }
        },
        error: (err) => console.error('Erro ao buscar CEP', err)
      });
    }
  }

  onSubmit() {
    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      alert('Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    const dadosForm = this.cadastroForm.value;
    const cpfLimpo = dadosForm.cpf.replace(/\D/g, '');
    const telefoneLimpo = dadosForm.telefone.replace(/\D/g, '');
    const cepLimpo = dadosForm.cep.replace(/\D/g, '');

    if(this.usuarioService.buscarPorEmail(dadosForm.email)) {
      alert('E-mail já cadastrado.');
      return;
    }

    if(this.usuarioService.buscarPorCpf(dadosForm.cpf)) {
      alert('CPF já cadastrado.');
      return;
    }

    const novoCliente: Cliente = { // Mapeamento dos dados para o model
      nome: dadosForm.nome,
      email: dadosForm.email,
      cpf: cpfLimpo,
      telefone: telefoneLimpo,
      perfil: 'CLIENTE',
      endereco: {
        cep: cepLimpo,
        logradouro: dadosForm.logradouro,
        numero: dadosForm.numero,
        bairro: dadosForm.bairro,
        cidade: dadosForm.cidade,
        estado: dadosForm.estado
      }
    };

    this.usuarioService.cadastrarCliente(novoCliente);

    alert('Cadastro realizado com sucesso! Sua senha de 4 dígitos foi enviada para o e-mail cadastrado.');
    this.router.navigate(['/auth/login']);
  }
}