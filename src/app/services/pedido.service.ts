import { Injectable, signal, computed } from '@angular/core';

export interface Servico { nome: string; preco: number; concluido: boolean; }

export interface Pedido {
  nome: string; sobrenome: string; cnh: string; email: string;
  telefone: string; contato: string; placa: string; modelo: string;
  cor: string; 
  servicosSelecionados: Servico[]; 
  tempoTotal: string; 
  dataFimEstimada: Date; mecanico: string; observacao: string;
  valorTotal: number;
}

export interface Orcamento {
  cliente: string; placa: string;
  itens: { nome: string; quantidade: number; subtotal: number }[];
  valorTotal: number; data: Date;
}

// NOVA INTERFACE PARA O HISTÓRICO
export interface VeiculoLiberado {
  cor: string;
  cliente: string;
  telefone: string;
  placa: string;
  modelo: string;
  valorGeral: number; // Valor do pedido + orçamentos extras
  dataLiberacao: Date;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  pedidos = signal<Pedido[]>([]);
  orcamentos = signal<Orcamento[]>([]);
  veiculosLiberados = signal<VeiculoLiberado[]>([]); // NOVO SIGNAL PARA O HISTÓRICO

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

  // NOVA FUNÇÃO QUE MOVE O PEDIDO PARA O HISTÓRICO
  liberarVeiculo(placa: string) {
    const veiculo = this.gastoTotalPorCliente().find(v => v.placa === placa);
    if (veiculo) {
      const registroLiberado: VeiculoLiberado = {
        cliente: `${veiculo.nome} ${veiculo.sobrenome}`,
        telefone: veiculo.telefone,
        placa: veiculo.placa,
        modelo: veiculo.modelo,
        cor: veiculo.cor,
        valorGeral: veiculo.valorGeral,
        dataLiberacao: new Date()
      };
      
      // Adiciona ao histórico de liberados
      this.veiculosLiberados.update(lista => [registroLiberado, ...lista]);
      
      // Remove da lista de pedidos em andamento
      this.pedidos.update(lista => lista.filter(p => p.placa !== placa));
    }
  }
}