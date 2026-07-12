import { Injectable, signal } from '@angular/core';

export interface Pedido {
  nome: string;
  sobrenome: string;
  cnh: string;
  email: string;
  telefone: string;
  contato: string;
  placa: string;
  modelo: string;
  cor: string;
  servicosSelecionados: string[];
  tempoTotal: string; 
  dataFimEstimada: Date;
  mecanico: string;
  observacao: string;
}

export interface Orcamento {
  cliente: string;
  placa: string;
  itens: { nome: string; quantidade: number; subtotal: number }[];
  valorTotal: number;
  data: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  pedidos = signal<Pedido[]>([]);

  orcamentos = signal<Orcamento[]>([]);

  adicionarPedido(pedido: Pedido) {
    this.pedidos.update(lista => [...lista, pedido]);
  }

  // NOVA FUNÇÃO: Remove o pedido pelo índice da lista
  removerPedido(index: number) {
    this.pedidos.update(lista => lista.filter((_, i) => i !== index));
  }

  adicionarOrcamento(orcamento: Orcamento) {
    this.orcamentos.update(lista => [...lista, orcamento]);
  }
}