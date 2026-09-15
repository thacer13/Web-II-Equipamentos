import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-err',
  standalone: true,
  imports: [RouterModule, InputTextModule, FloatLabelModule, ButtonModule],
  templateUrl: './err.html',
  styleUrls: ['./err.css'],
})

export class ErrComponent {}