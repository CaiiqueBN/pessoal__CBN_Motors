import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginFormComponent } from "../../components/login-form/login-form.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginFormComponent, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  showWelcomeCard = false;
  router = inject(Router);

  onLoginSuccess() {
    this.showWelcomeCard = true;
  }

  onConfirmar() {
    this.router.navigate(["/home"]);
  }
}