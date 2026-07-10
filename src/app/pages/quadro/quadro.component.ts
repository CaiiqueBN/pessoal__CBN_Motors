import { Component, inject } from '@angular/core';
import { PedidosComponent } from "../../components/pedidos/pedidos.component";
import { Router } from '@angular/router';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  selector: 'app-quadro',
  imports: [PedidosComponent, MenuComponent],
  templateUrl: './quadro.component.html',
  styleUrl: './quadro.component.css'
})
export class QuadroComponent {
  router = inject(Router);

  logout() {
    sessionStorage.clear();
    this.router.navigate([""]);
  }
}