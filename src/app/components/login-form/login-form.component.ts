import { Component, inject, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  loginService = inject(LoginService);
  
  @Output() loginSuccess = new EventEmitter<void>();

  hidePassword = true;
  loginForm = new FormGroup({
    nome: new FormControl("", [Validators.required]),
    senha: new FormControl("", [Validators.required])
  });

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit() {
    if(!this.loginForm.valid) {
      alert("Existem campos não preenchidos!");
      return;
    }

    const { nome, senha } = this.loginForm.value;
    this.loginService.login(nome!, senha!).subscribe({
      error: (err) => {
        if(err.status === 401) alert("Usuário ou senha inválidos!");
        else alert("Erro interno do servidor.");
      },
      next: () => {
        this.loginSuccess.emit();
      }
    });
  }
}