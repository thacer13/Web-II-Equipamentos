import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { validarCpf } from './cpf.validator';
import {
  LIMITES,
  naoVazio,
  normalizarTexto,
  somenteDigitos,
  validarCep,
  validarEstado,
  validarTelefone,
} from '../../shared/validators/form-validators';
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
      nome: ['', [Validators.required, naoVazio(), Validators.minLength(3), Validators.maxLength(LIMITES.nome)]],
      cpf: ['', [Validators.required, validarCpf()]],
      email: ['', [Validators.required, naoVazio(), Validators.email, Validators.maxLength(LIMITES.email)]],
      telefone: ['', [Validators.required, naoVazio(), validarTelefone(), Validators.maxLength(LIMITES.telefone)]],
      cep: ['', [Validators.required, validarCep()]],
      logradouro: ['', [Validators.required, naoVazio(), Validators.minLength(2), Validators.maxLength(LIMITES.logradouro)]],
      numero: ['', [Validators.required, naoVazio(), Validators.maxLength(LIMITES.numero)]],
      bairro: ['', [Validators.required, naoVazio(), Validators.minLength(2), Validators.maxLength(LIMITES.bairro)]],
      cidade: ['', [Validators.required, naoVazio(), Validators.minLength(2), Validators.maxLength(LIMITES.cidade)]],
      estado: ['', [Validators.required, validarEstado()]]
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
    const nome = normalizarTexto(dadosForm.nome);
    const email = normalizarTexto(dadosForm.email).toLowerCase();
    const cpfLimpo = somenteDigitos(dadosForm.cpf);
    const telefoneLimpo = somenteDigitos(dadosForm.telefone);
    const cepLimpo = somenteDigitos(dadosForm.cep);
    const logradouro = normalizarTexto(dadosForm.logradouro);
    const numero = normalizarTexto(dadosForm.numero);
    const bairro = normalizarTexto(dadosForm.bairro);
    const cidade = normalizarTexto(dadosForm.cidade);
    const estado = normalizarTexto(dadosForm.estado).toUpperCase();

    if (!nome || !email || !logradouro || !numero || !bairro || !cidade || !estado) {
      alert('Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    if (this.usuarioService.buscarPorEmail(email)) {
      alert('E-mail já cadastrado.');
      return;
    }

    if(this.usuarioService.buscarPorCpf(cpfLimpo)) {
      alert('CPF já cadastrado.');
      return;
    }

    const novoCliente: Cliente = { // Mapeamento dos dados para o model
      nome,
      email,
      cpf: cpfLimpo,
      telefone: telefoneLimpo,
      perfil: 'CLIENTE',
      endereco: {
        cep: cepLimpo,
        logradouro,
        numero,
        bairro,
        cidade,
        estado
      }
    };

    this.usuarioService.cadastrarCliente(novoCliente);

    alert('Cadastro realizado com sucesso! Sua senha de 4 dígitos foi enviada para o e-mail cadastrado.');
    this.router.navigate(['/auth/login']);
  }
}