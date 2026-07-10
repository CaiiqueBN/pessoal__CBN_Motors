import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  router = inject(Router);

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToQuadro() {
    this.router.navigate(['/quadro']);
  }

  goToOrcamento() {
    this.router.navigate(['/orcamento']);
  }

  goToQualidade() {
    this.router.navigate(['/qualidade']);
  }
}