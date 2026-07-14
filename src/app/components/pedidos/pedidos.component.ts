import { Component, inject, signal, OnInit, OnDestroy, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { PedidoService } from '../../services/pedido.service';

// Registra os dados de formatação do Brasil (pt-BR)
registerLocaleData(localePt);

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule],
  // Define o idioma de formatação do componente como pt-BR para as moedas
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent implements OnInit, OnDestroy {
  pedidoService = inject(PedidoService);
  
  // Consome a lista com os totais gerais (serviço inicial + orçamentos)
  listaPedidos = this.pedidoService.gastoTotalPorCliente; 
  
  agora = signal(new Date());
  intervalId: any;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.agora.set(new Date());
    }, 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Método para gerar o caminho da imagem dinamicamente
  obterImagemVeiculo(modelo: string, cor: string): string | null {
    if (modelo && cor) {
      const modeloFormatado = modelo.toLowerCase();
      return `/img/${modeloFormatado}${cor}.png`;
    }
    return null;
  }

  getTempoRestante(dataFim: any): string {
    // Garante que o parâmetro recebido seja convertido em uma data válida
    const fimData = dataFim instanceof Date ? dataFim : new Date(dataFim);
    const tempoAtual = this.agora().getTime();
    const fim = fimData.getTime();
    const diferenca = fim - tempoAtual;

    if (diferenca <= 0) return 'Tempo esgotado! 🔴';
    
    const horas = Math.floor(diferenca / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

    const hTexto = horas > 0 ? `${horas}h ` : '';
    const mTexto = minutos.toString().padStart(2, '0') + 'm ';
    const sTexto = segundos.toString().padStart(2, '0') + 's';
    
    return hTexto + mTexto + sTexto + ' ⏱️';
  }

  excluirPedido(index: number) {
    const confirmar = confirm('Tem certeza que deseja remover este pedido? Esta ação não pode ser desfeita.');
    if (confirmar) {
      this.pedidoService.removerPedido(index);
    }
  }
}