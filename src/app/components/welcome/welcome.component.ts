import { Component, signal, computed, inject, LOCALE_ID, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';

// Registra os dados de formatação do Brasil (pt-BR)
registerLocaleData(localePt);

// Declaração do IMask global provido pelo <script>
declare var IMask: any;

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
  // Define o idioma padrão do componente como pt-BR
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements AfterViewInit {
  pedidoService = inject(PedidoService);
  router = inject(Router);

  // Captura a referência do input de telefone no HTML
  @ViewChild('telefoneInput') telefoneInput!: ElementRef;

  formulario = {
    nome: '', sobrenome: '', cnh: '', email: '', telefone: '', contato: '',
    placa: '', modelo: '', cor: '', mecanico: '', observacao: ''
  };

  itens: Item[] = [
    { id: 1, nome: 'Revisão', tempoMinutos: 30, preco: 150 },
    { id: 2, nome: 'Diagnóstico', tempoMinutos: 60, preco: 250 },
    { id: 3, nome: 'Campanha/Recall', tempoMinutos: 45, preco: 0 },
    { id: 4, nome: 'Alinhamento', tempoMinutos: 15, preco: 120 },
    { id: 5, nome: 'Calibração dos pneus com nitrogênio', tempoMinutos: 10, preco: 50 },
    { id: 6, nome: 'Oxisanitização', tempoMinutos: 20, preco: 80 },
    { id: 7, nome: 'Troca de peça', tempoMinutos: 45, preco: 200 },
    { id: 8, nome: 'Lavagem', tempoMinutos: 30, preco: 70 },
    { id: 9, nome: 'Troca de Óleo', tempoMinutos: 30, preco: 180 },
    { id: 10, nome: 'Balanceamento', tempoMinutos: 20, preco: 80 },
    { id: 11, nome: 'Extra (30min)', tempoMinutos: 30, preco: 0 },
    { id: 12, nome: 'Extra (60min)', tempoMinutos: 60, preco: 0 }
  ];

  selecionados = signal<number[]>([]);

  // Inicializa o IMask após a visualização do componente carregar
  ngAfterViewInit() {
    if (this.telefoneInput) {
      const maskOptions = {
        mask: '(00) 00000-0000'
      };
      
      const phoneMask = IMask(this.telefoneInput.nativeElement, maskOptions);

      // Atualiza o ngModel com o valor mascarado
      phoneMask.on('accept', () => {
        this.formulario.telefone = phoneMask.value;
      });
    }
  }

  // Getter que monta o caminho da imagem dinamicamente com base no modelo e cor
  get imagemVeiculo(): string | null {
    const modelo = this.formulario.modelo;
    const cor = this.formulario.cor;

    if (modelo && cor) {
      const modeloFormatado = modelo.toLowerCase();
      return `/img/${modeloFormatado}${cor}.png`;
    }
    return null;
  }

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

    return { 
      textoTempo, 
      valorTotal: somaPreco, 
      minutosTotais: totalMinutos,
      itensDetalhados: itensSelecionados 
    };
  });

  toggleItem(id: number) {
    this.selecionados.update(ids => 
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  }

  // Verifica se todos os campos obrigatórios e serviços foram preenchidos
  get formValido(): boolean {
    const f = this.formulario;
    
    const dadosObrigatoriosPreenchidos = !!(
      f.nome.trim() && 
      f.sobrenome.trim() && 
      f.cnh.trim() && 
      f.email.trim() && 
      f.telefone.trim() && 
      f.contato !== '' && 
      f.placa.trim() && 
      f.modelo !== '' && 
      f.cor !== '' && 
      f.mecanico !== ''
    );

    const servicoSelecionado = this.selecionados().length > 0;

    // Retorna true apenas se os dados do cliente/veículo E os serviços estiverem preenchidos
    return dadosObrigatoriosPreenchidos && servicoSelecionado;
  }

  enviar() {
    // Dupla verificação de segurança: caso consigam clicar, impede o envio se inválido
    if (!this.formValido) {
      alert('Por favor, preencha todos os campos obrigatórios e selecione ao menos um serviço.');
      return;
    }

    const novoPedido = {
      ...this.formulario,
      servicosSelecionados: this.selecionados().map(id => { 
        const item = this.itens.find(i => i.id === id)!; 
        return { nome: item.nome, preco: item.preco, concluido: false }; 
      }),
      tempoTotal: this.resumo().textoTempo,
      dataFimEstimada: new Date(new Date().getTime() + this.resumo().minutosTotais * 60000),
      valorTotal: this.resumo().valorTotal
    };

    this.pedidoService.adicionarPedido(novoPedido as any);
    
    // Limpa o formulário
    this.formulario = {
      nome: '', sobrenome: '', cnh: '', email: '', telefone: '', contato: '',
      placa: '', modelo: '', cor: '', mecanico: '', observacao: ''
    };
    this.selecionados.set([]);
    
    // Limpa a máscara visualmente no input após o envio, se necessário
    if (this.telefoneInput) {
      this.telefoneInput.nativeElement.value = '';
    }
    
    alert('Pedido enviado com sucesso!');
    
    // O redirecionamento que estava aqui foi removido para você continuar na mesma página
  }
}