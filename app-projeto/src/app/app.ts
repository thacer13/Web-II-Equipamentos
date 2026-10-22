import { Component } from '@angular/core';
import {RouterModule} from '@angular/router';
import { DevNavComponent } from './shared/dev-nav/dev-nav.component';
import { TopbarComponent } from './shared/topbar/topbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterModule, DevNavComponent, TopbarComponent],
  standalone: true,
  providers: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {}
