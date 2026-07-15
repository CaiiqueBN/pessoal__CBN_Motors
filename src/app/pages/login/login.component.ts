import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoginFormComponent } from "../../components/login-form/login-form.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginFormComponent, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  showWelcomeCard = false;
  
  router = inject(Router);
  platformId = inject(PLATFORM_ID);

  // --- CARROSSEL ---
  carouselItems = [
    // --- GOL ---
    { image: 'img/golBranco.png', title: 'Gol Branco — Conforto, economia e o design que você já confia.' },
    { image: 'img/golPrata.png', title: 'Gol Prata — Modernidade e excelente valor de revenda.' },
    { image: 'img/golPreto.png', title: 'Gol Preto — Atitude e sofisticação para o seu dia a dia.' },
    { image: 'img/golVermelho.png', title: 'Gol Vermelho — Destaque-se por onde passar com muita esportividade.' },
    
    // --- CELTA ---
    { image: 'img/celtaVermelho.png', title: 'Celta Vermelho — Compacto, ágil e com um estilo marcante.' },
    { image: 'img/celtaPreto.png', title: 'Celta Preto — O queridinho das ruas com um visual totalmente Black.' },
    { image: 'img/celtaPrata.png', title: 'Celta Prata — Praticidade e economia imbatíveis para a cidade.' },
    { image: 'img/celtaBranco.png', title: 'Celta Branco — Visual clean com o melhor custo-benefício.' },

    // --- FIESTA ---
    { image: 'img/fiestaPreto.png', title: 'Fiesta Preto — Conforto superior, tecnologia e excelente desempenho.' },
    { image: 'img/fiestaPrata.png', title: 'Fiesta Prata — Espaço interno de sobra e linhas modernas.' },
    { image: 'img/fiestaBranco.png', title: 'Fiesta Branco — O design refinado que sua família merece.' },
    { image: 'img/fiestaVermelho.png', title: 'Fiesta Vermelho — Performance aliada a uma cor cheia de energia.' },

    // --- UNO ---
    { image: 'img/unoPrata.png', title: 'Uno Prata — A lenda da resistência e economia de combustível.' },
    { image: 'img/unoVermelho.png', title: 'Uno Vermelho — Visual jovem e robustez para aguentar qualquer rotina.' },
    { image: 'img/unoPreto.png', title: 'Uno Preto — Discreto, compacto por fora e gigante por dentro.' },
    { image: 'img/unoBranco.png', title: 'Uno Branco — Pau para toda obra, com a manutenção mais barata do mercado.' }
  ];
  
  currentIndex = 0;
  private intervalId: any;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startTimer();
    }
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.carouselItems.length;
    if (isPlatformBrowser(this.platformId)) this.resetTimer();
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.carouselItems.length) % this.carouselItems.length;
    if (isPlatformBrowser(this.platformId)) this.resetTimer();
  }

  startTimer() {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.carouselItems.length;
    }, 5000);
  }

  clearTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  resetTimer() {
    this.clearTimer();
    this.startTimer();
  }

  onLoginSuccess() {
    this.showWelcomeCard = true;
  }

  onConfirmar() {
    this.router.navigate(["/home"]);
  }
}