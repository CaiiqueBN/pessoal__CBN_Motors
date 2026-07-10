import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../services/pedido.service'; // AJUSTE ESTE CAMINHO SE NECESSÁRIO

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent implements OnInit, OnDestroy {
  pedidoService = inject(PedidoService);
  listaPedidos = this.pedidoService.pedidos; 
  
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

  getTempoRestante(dataFim: Date): string {
    const tempoAtual = this.agora().getTime();
    const fim = dataFim.getTime();
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

  // NOVA FUNÇÃO: Pergunta se o usuário quer mesmo remover e chama o serviço
  excluirPedido(index: number) {
    const confirmar = confirm('Tem certeza que deseja remover este pedido? Esta ação não pode ser desfeita.');
    if (confirmar) {
      this.pedidoService.removerPedido(index);
    }
  }
}