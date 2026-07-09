import { Component, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importante para o @for e @if

interface Item {
  id: number;
  nome: string;
  tempoMinutos: number;
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
  // Lista de itens
  itens: Item[] = [
    { id: 1, nome: 'Revisão', tempoMinutos: 30 },
    { id: 2, nome: 'Diagnóstico', tempoMinutos: 60 },
    { id: 3, nome: 'Campanha/RECALL', tempoMinutos: 45 },
    { id: 4, nome: 'Alinhamento/Balanceamento', tempoMinutos: 15 },
    { id: 5, nome: 'Calibração dos pneus com nitrogênio', tempoMinutos: 10 },
    { id: 6, nome: 'Oxisanitização', tempoMinutos: 20 },
    { id: 7, nome: 'Troca de peça', tempoMinutos: 45 },
    { id: 8, nome: 'Lavagem', tempoMinutos: 30 },
  ];

  // Estado dos itens selecionados
  selecionados = signal<number[]>([]);

  // Cálculo reativo do tempo total
  tempoTotal = computed(() => {
    return this.selecionados().reduce((total, id) => {
      const item = this.itens.find(i => i.id === id);
      return total + (item?.tempoMinutos || 0);
    }, 0);
  });

  // Função para alternar seleção
  toggleItem(id: number) {
    this.selecionados.update(ids => 
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  }
}