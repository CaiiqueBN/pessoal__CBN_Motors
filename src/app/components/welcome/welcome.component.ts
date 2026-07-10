import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service'; // AJUSTE ESTE CAMINHO SE NECESSÁRIO

interface Item {
  id: number;
  nome: string;
  tempoMinutos: number;
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
    { id: 1, nome: 'Revisão (+30min)', tempoMinutos: 30 },
    { id: 2, nome: 'Diagnóstico (+60min)', tempoMinutos: 60 },
    { id: 3, nome: 'Campanha/Recall (+45min)', tempoMinutos: 45 },
    { id: 4, nome: 'Alinhamento/Balanceamento (+15min)', tempoMinutos: 15 },
    { id: 5, nome: 'Calibração dos pneus com nitrogênio (+10min)', tempoMinutos: 10 },
    { id: 6, nome: 'Oxisanitização (+20min)', tempoMinutos: 20 },
    { id: 7, nome: 'Troca de peça (+45min)', tempoMinutos: 45 },
    { id: 8, nome: 'Lavagem (+30min)', tempoMinutos: 30 },
  ];

  selecionados = signal<number[]>([]);

  tempoTotal = computed(() => {
    const soma = this.selecionados().reduce((total, id) => {
      const item = this.itens.find(i => i.id === id);
      return total + (item?.tempoMinutos || 0);
    }, 0);

    if (soma === 0) return { texto: '0 min', minutos: 0 };

    const totalMinutos = soma + 10; // +10min de preparo
    const horas = Math.floor(totalMinutos / 60);
    const minutosRestantes = totalMinutos % 60;

    let texto = '';
    if (horas > 0 && minutosRestantes > 0) texto = `${horas}h e ${minutosRestantes}min`;
    else if (horas > 0) texto = `${horas}h`;
    else texto = `${minutosRestantes}min`;

    return { texto, minutos: totalMinutos };
  });

  // A função que estava faltando!
  toggleItem(id: number) {
    this.selecionados.update(ids => 
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  }

  enviar() {
    const nomesServicos = this.selecionados().map(id => {
      return this.itens.find(i => i.id === id)?.nome || '';
    });

    const minutosCalculados = this.tempoTotal().minutos;
    const agora = new Date();
    const dataFinal = new Date(agora.getTime() + minutosCalculados * 60000);

    const novoPedido = {
      ...this.formulario,
      servicosSelecionados: nomesServicos,
      tempoTotal: this.tempoTotal().texto,
      dataFimEstimada: dataFinal
    };

    this.pedidoService.adicionarPedido(novoPedido);
    
    alert('Pedido salvo com sucesso! (Você já pode conferir na aba de pedidos)');
  }
}