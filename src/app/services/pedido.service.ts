import { Injectable, signal, computed } from '@angular/core';

export interface Servico { nome: string; preco: number; concluido: boolean; }

export interface Pedido {
  nome: string; sobrenome: string; cnh: string; email: string;
  telefone: string; contato: string; placa: string; modelo: string;
  cor: string; 
  servicosSelecionados: Servico[]; // Agora usa a interface Servico
  tempoTotal: string; 
  dataFimEstimada: Date; mecanico: string; observacao: string;
  valorTotal: number;
}

export interface Orcamento {
  cliente: string; placa: string;
  itens: { nome: string; quantidade: number; subtotal: number }[];
  valorTotal: number; data: Date;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  pedidos = signal<Pedido[]>([]);
  orcamentos = signal<Orcamento[]>([]);

  adicionarPedido(pedido: Pedido) { this.pedidos.update(lista => [...lista, pedido]); }
  removerPedido(index: number) { this.pedidos.update(lista => lista.filter((_, i) => i !== index)); }
  adicionarOrcamento(orcamento: Orcamento) { this.orcamentos.update(lista => [...lista, orcamento]); }

  gastoTotalPorCliente = computed(() => {
    return this.pedidos().map(p => {
      const orcamentosDoCliente = this.orcamentos().filter(o => o.placa === p.placa);
      const totalOrcamentos = orcamentosDoCliente.reduce((sum, o) => sum + o.valorTotal, 0);
      return {
        ...p,
        listaOrcamentos: orcamentosDoCliente,
        valorOrcamentos: totalOrcamentos,
        valorGeral: p.valorTotal + totalOrcamentos
      };
    });
  });
}