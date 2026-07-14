import { Routes } from '@angular/router';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [

  {
    path: "",
    pathMatch: "full",
    loadComponent: () => {
      return import('./pages/login/login.component')
        .then(c => c.LoginComponent);
    }
  },

  {
    path: "home",
    pathMatch: "full",
    canActivate: [loginGuard],
    loadComponent: () => {
      return import('./pages/home/home.component')
        .then(c => c.HomeComponent);
    }
  },

  {
    path: "quadro",
    pathMatch: "full",
    canActivate: [loginGuard],
    loadComponent: () => {
      return import('./pages/quadro/quadro.component')
        .then(c => c.QuadroComponent);
    }
  },

  {
    path: "orcamento",
    pathMatch: "full",
    canActivate: [loginGuard],
    loadComponent: () => {
      return import('./pages/orcamento/orcamento.component')
        .then(c => c.OrcamentoComponent);
    }
  },

  {
    path: "qualidade",
    pathMatch: "full",
    canActivate: [loginGuard],
    loadComponent: () => {
      return import('./pages/qualidade/qualidade.component')
        .then(c => c.QualidadeComponent);
    }
  }

];
