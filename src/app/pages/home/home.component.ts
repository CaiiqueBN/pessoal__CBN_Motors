import { Component, inject } from '@angular/core';
import { MenuComponent } from '../../components/menu/menu.component';
import { Router } from '@angular/router';
import { WelcomeComponent } from '../../components/welcome/welcome.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [WelcomeComponent, MenuComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  router = inject(Router);

  logout() {
    sessionStorage.clear();
    this.router.navigate([""]);
  }
}