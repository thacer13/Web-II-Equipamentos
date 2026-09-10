import { Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import { DevNavComponent } from './shared/dev-nav/dev-nav.component';

@Component({
  selector: 'app-root',
  imports: [RouterModule, DevNavComponent],
  standalone: true,
  providers: [],
  templateUrl: './app.html',
})

export class App {
  
}
