import { Component, inject, computed, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';

// Registra os dados de formatação do Brasil (pt-BR)
registerLocaleData(localePt);

@Component({
  selector: 'app-qualidade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // Define o idioma padrão do componente como pt-BR
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
  templateUrl: './qualidade.component.html',
  styleUrl: './qualidade.component.css'
})
export class QualidadeComponent {
  pedidoService = inject(PedidoService);
  
  clientesResumo = this.pedidoService.gastoTotalPorCliente;
  historicoLiberados = this.pedidoService.veiculosLiberados;
  
  faturamentoGlobal = computed(() => {
    const totalAtivos = this.clientesResumo().reduce((acc, c) => acc + c.valorGeral, 0);
    const totalLiberados = this.historicoLiberados().reduce((acc, l) => acc + l.valorGeral, 0);
    return totalAtivos + totalLiberados;
  });

  todosConcluidos(servicos: any[]): boolean {
    if (!servicos || servicos.length === 0) return false;
    return servicos.every(s => s.concluido === true);
  }

  liberarVeiculo(item: any) {
    this.pedidoService.liberarVeiculo(item.placa);
    alert(`VEÍCULO LIBERADO COM SUCESSO!\n\nUma mensagem foi enviada para o cliente ${item.nome} no contato (${item.telefone}) informando que o veículo de placa ${item.placa} já está pronto para retirada.`);
  }
}