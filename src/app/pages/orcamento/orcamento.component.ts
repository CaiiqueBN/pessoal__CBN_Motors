import { Component, inject, signal, computed, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuComponent } from '../../components/menu/menu.component'; 
import { PedidoService, Pedido, Orcamento } from '../../services/pedido.service';

registerLocaleData(localePt);

interface ItemOrcamento {
  id: number;
  nome: string;
  preco: number;
}

@Component({
  selector: 'app-orcamento',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
  templateUrl: './orcamento.component.html',
  styleUrl: './orcamento.component.css'
})
export class OrcamentoComponent {
  pedidoService = inject(PedidoService);
  router = inject(Router);

  listaPedidos = this.pedidoService.pedidos; 
  pedidoSelecionado = signal<Pedido | null>(null);

  catalogoItens: ItemOrcamento[] = [
    { id: 1, nome: 'Líquido Aditivo (Arrefecimento)', preco: 65.00 },
    { id: 2, nome: 'Kit Lubrificação (Óleo + Filtro)', preco: 280.00 },
    { id: 3, nome: 'Limpeza de TBI', preco: 150.00 },
    { id: 4, nome: 'Alinhamento e Balanceamento', preco: 180.00 },
    { id: 5, nome: 'Pneu Aro 15 (Unidade)', preco: 450.00 },
    { id: 6, nome: 'Pastilha de Freio (Par)', preco: 190.00 },
    { id: 7, nome: 'Filtro de Ar do Motor', preco: 55.00 },
    { id: 8, nome: 'Filtro de Ar Condicionado', preco: 45.00 },
    { id: 9, nome: 'Bateria 60Ah', preco: 420.00 },
    { id: 10, nome: 'Higienização Interna', preco: 120.00 }
  ];

  itensSelecionados = signal<{peca: ItemOrcamento, quantidade: number}[]>([]);

  valorTotal = computed(() => {
    return this.itensSelecionados().reduce((total, item) => total + (item.peca.preco * item.quantidade), 0);
  });

  obterImagemVeiculo(modelo?: string, cor?: string): string | null {
    if (modelo && cor) {
      const modeloFormatado = modelo.toLowerCase();
      return `/img/${modeloFormatado}${cor}.png`;
    }
    return null;
  }

  aoSelecionarPedido(event: any) {
    const index = event.target.value;
    if (index !== '') {
      this.pedidoSelecionado.set(this.listaPedidos()[index]);
    } else {
      this.pedidoSelecionado.set(null);
    }
    this.itensSelecionados.set([]);
  }

  adicionarItem(peca: ItemOrcamento) {
    this.itensSelecionados.update(itens => {
      const itemExistente = itens.find(i => i.peca.id === peca.id);
      if (itemExistente) {
        itemExistente.quantidade++;
        return [...itens];
      }
      return [...itens, { peca, quantidade: 1 }];
    });
  }

  removerItem(id: number) {
    this.itensSelecionados.update(itens => {
      const itemExistente = itens.find(i => i.peca.id === id);
      if (itemExistente && itemExistente.quantidade > 1) {
        itemExistente.quantidade--;
        return [...itens];
      }
      return itens.filter(i => i.peca.id !== id);
    });
  }

  listaOrcamentos = this.pedidoService.orcamentos;

  salvarOrcamento() {
    const pedido = this.pedidoSelecionado();
    if (pedido) {
      const novoOrcamento: Orcamento = {
        cliente: `${pedido.nome} ${pedido.sobrenome}`,
        placa: pedido.placa,
        itens: this.itensSelecionados().map(i => ({
          nome: i.peca.nome,
          quantidade: i.quantidade,
          subtotal: i.peca.preco * i.quantidade
        })),
        valorTotal: this.valorTotal(),
        data: new Date()
      };

      this.pedidoService.adicionarOrcamento(novoOrcamento);
      alert('Orçamento salvo com sucesso!');
      this.itensSelecionados.set([]); 
    }
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate([""]);
  }
}