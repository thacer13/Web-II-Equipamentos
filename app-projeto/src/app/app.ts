import { Component } from '@angular/core';
import {RouterModule} from '@angular/router';
import { TopbarComponent } from './shared/topbar/topbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterModule, TopbarComponent],
  standalone: true,
  providers: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {}
