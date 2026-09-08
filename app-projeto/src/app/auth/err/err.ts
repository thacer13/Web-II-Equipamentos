import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-err',
  standalone: true,
  imports: [InputTextModule, InputMaskModule, ButtonModule],
  templateUrl: './err.html',
  styleUrls: ['./err.css'],
})

export class ErrComponent {}