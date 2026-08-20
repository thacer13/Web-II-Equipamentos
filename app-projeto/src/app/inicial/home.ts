import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [ButtonModule, RouterLink],
  standalone: true,
  templateUrl: './home.html'
})
export class HomeComponent {}
