import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-funcionario',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './funcionario.html',
})
export class FuncionarioComponent {}