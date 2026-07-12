import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';

interface Item {
  id: number;
  nome: string;
  tempoMinutos: number;
  preco: number;
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
  pedidoService = inject(PedidoService);
  router = inject(Router);

  formulario = {
    nome: '', sobrenome: '', cnh: '', email: '', telefone: '', contato: '',
    placa: '', modelo: '', cor: '', mecanico: '', observacao: ''
  };

  itens: Item[] = [
    { id: 1, nome: 'Revisão', tempoMinutos: 30, preco: 150 },
    { id: 2, nome: 'Diagnóstico', tempoMinutos: 60, preco: 250 },
    { id: 3, nome: 'Campanha/Recall', tempoMinutos: 45, preco: 0 },
    { id: 4, nome: 'Alinhamento/Balanceamento', tempoMinutos: 15, preco: 120 },
    { id: 5, nome: 'Calibração Nitrogênio', tempoMinutos: 10, preco: 50 },
    { id: 6, nome: 'Oxisanitização', tempoMinutos: 20, preco: 80 },
    { id: 7, nome: 'Troca de peça', tempoMinutos: 45, preco: 200 },
    { id: 8, nome: 'Lavagem', tempoMinutos: 30, preco: 70 },
    { id: 9, nome: 'Extra (30min)', tempoMinutos: 30, preco: 100 },
    { id: 10, nome: 'Extra (60min)', tempoMinutos: 60, preco: 200 }
  ];

  selecionados = signal<number[]>([]);

  resumo = computed(() => {
    const itensSelecionados = this.selecionados().map(id => this.itens.find(i => i.id === id)!);
    const somaTempo = itensSelecionados.reduce((total, i) => total + i.tempoMinutos, 0);
    const somaPreco = itensSelecionados.reduce((total, i) => total + i.preco, 0);
    
    const totalMinutos = somaTempo > 0 ? somaTempo + 10 : 0;
    const horas = Math.floor(totalMinutos / 60);
    const min = totalMinutos % 60;

    let textoTempo = '0 min';
    if (totalMinutos > 0) {
        textoTempo = `${horas > 0 ? horas + 'h ' : ''}${min > 0 ? min + 'min' : ''}`;
    }

    return { textoTempo, valorTotal: somaPreco, minutosTotais: totalMinutos };
  });

  toggleItem(id: number) {
    this.selecionados.update(ids => 
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  }

  enviar() {
    const novoPedido = {
      ...this.formulario,
      // Mapeamento alterado para salvar nome e preço dos serviços
      servicosSelecionados: this.selecionados().map(id => { 
  const item = this.itens.find(i => i.id === id)!; 
  return { nome: item.nome, preco: item.preco, concluido: false }; 
}),
      tempoTotal: this.resumo().textoTempo,
      dataFimEstimada: new Date(new Date().getTime() + this.resumo().minutosTotais * 60000),
      valorTotal: this.resumo().valorTotal
    };

    this.pedidoService.adicionarPedido(novoPedido as any);
    
    // Limpar formulário e seleções
    this.formulario = {
      nome: '', sobrenome: '', cnh: '', email: '', telefone: '', contato: '',
      placa: '', modelo: '', cor: '', mecanico: '', observacao: ''
    };
    this.selecionados.set([]);
    
    alert('Pedido enviado com sucesso!');
  }
}