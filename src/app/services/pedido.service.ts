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

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  pedidos = signal<Pedido[]>([]);

  adicionarPedido(pedido: Pedido) {
    this.pedidos.update(lista => [...lista, pedido]);
  }

  // NOVA FUNÇÃO: Remove o pedido pelo índice da lista
  removerPedido(index: number) {
    this.pedidos.update(lista => lista.filter((_, i) => i !== index));
  }
}