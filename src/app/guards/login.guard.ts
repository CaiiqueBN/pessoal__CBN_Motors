import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  if (typeof window !== 'undefined') {

    const email = sessionStorage.getItem("email");

    if (!email) {
      alert("Você precisa estar logado para acessar essa página!");
      router.navigate([""]);
      return false;
    }
    return true;
  }
  return false;
};