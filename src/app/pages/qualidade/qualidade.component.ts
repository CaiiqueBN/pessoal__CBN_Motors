import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-qualidade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qualidade.component.html',
  styleUrl: './qualidade.component.css'
})
export class QualidadeComponent {
  pedidoService = inject(PedidoService);
  clientesResumo = this.pedidoService.gastoTotalPorCliente;
  
  faturamentoGlobal = computed(() => {
    const totalPedidos = this.pedidoService.pedidos().reduce((acc, p) => acc + p.valorTotal, 0);
    const totalOrcamentos = this.pedidoService.orcamentos().reduce((acc, o) => acc + o.valorTotal, 0);
    return totalPedidos + totalOrcamentos;
  });

  // Método auxiliar para checar conclusão
  todosConcluidos(servicos: any[]): boolean {
    if (!servicos || servicos.length === 0) return false;
    return servicos.every(s => s.concluido === true);
  }
}