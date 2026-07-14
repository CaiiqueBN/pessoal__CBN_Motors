import { Component, signal, computed, inject, LOCALE_ID, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';

// Importações para geração do PDF
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements AfterViewInit {
  pedidoService = inject(PedidoService);
  router = inject(Router);

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

  ngAfterViewInit() {
    if (this.telefoneInput) {
      const maskOptions = {
        mask: '(00) 00000-0000'
      };
      
      const phoneMask = IMask(this.telefoneInput.nativeElement, maskOptions);

      phoneMask.on('accept', () => {
        this.formulario.telefone = phoneMask.value;
      });
    }
  }

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

    return dadosObrigatoriosPreenchidos && servicoSelecionado;
  }

  // Tornamos a função assíncrona para aguardar a renderização do PDF com a logo
  async enviar() {
    if (!this.formValido) {
      alert('Por favor, preencha todos os campos obrigatórios e selecione ao menos um serviço.');
      return;
    }

    const dataAtual = new Date();
    const novoPedido = {
      ...this.formulario,
      servicosSelecionados: this.resumo().itensDetalhados.map(item => ({
        nome: item.nome,
        preco: item.preco,
        concluido: false
      })),
      tempoTotal: this.resumo().textoTempo,
      dataFimEstimada: new Date(dataAtual.getTime() + this.resumo().minutosTotais * 60000),
      valorTotal: this.resumo().valorTotal
    };

    // 1. Salva o pedido no service
    this.pedidoService.adicionarPedido(novoPedido as any);
    
    // 2. Aguarda a geração do PDF com a imagem carregada
    try {
      await this.gerarPDFOrdemServico(novoPedido, dataAtual);
      alert('Pedido enviado com sucesso! O PDF com o Termo da LGPD foi gerado.');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Pedido enviado com sucesso, mas houve uma falha técnica ao gerar o arquivo PDF.');
    }

    // 3. Limpa o formulário
    this.formulario = {
      nome: '', sobrenome: '', cnh: '', email: '', telefone: '', contato: '',
      placa: '', modelo: '', cor: '', mecanico: '', observacao: ''
    };
    this.selecionados.set([]);
    
    if (this.telefoneInput) {
      this.telefoneInput.nativeElement.value = '';
    }
  }

  /**
   * Função auxiliar para pré-carregar a imagem local e transformá-la num elemento HTMLImage
   */
  private carregarImagem(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  }

/**
   * Gera o PDF de forma assíncrona garantindo proporções perfeitas para a logo
   */
  private async gerarPDFOrdemServico(pedido: any, dataEmissao: Date) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const blueColor = [0, 52, 120];      // #003478
    const darkGray = [30, 41, 59];        // #1e293b
    const lightGray = [241, 245, 249];    // #f1f5f9
    const greenBorder = [22, 163, 74];    // #16a34a
    const greenBG = [240, 253, 244];      // #f0fdf4

    // --- RENDERIZAÇÃO DA LOGO SEM DISTORÇÃO (Proportional Fit) ---
    try {
      const logoElement = await this.carregarImagem('/img/Logo.png');
      
      const imgWidth = logoElement.naturalWidth;
      const imgHeight = logoElement.naturalHeight;

      // Definimos os limites máximos do espaço reservado para a logo no cabeçalho
      const maxWidth = 32; 
      const maxHeight = 14;

      // 1. Começamos assumindo que vamos usar a largura máxima permitida
      let finalWidth = maxWidth;
      let finalHeight = (imgHeight * maxWidth) / imgWidth;

      // 2. Se a altura proporcional passar do limite máximo, recalculamos com base na altura
      if (finalHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = (imgWidth * maxHeight) / imgHeight;
      }
      
      // Centraliza um pouco verticalmente no espaço de 15mm se a logo for muito deitada
      const yOffset = 10 + (maxHeight - finalHeight) / 2;

      // Desenha a logo preservando a proporção matemática original (sem distorção!)
      doc.addImage(logoElement, 'PNG', 15, yOffset, finalWidth, finalHeight);

    } catch (e) {
      console.warn("Não foi possível carregar a imagem da logo. Aplicando texto alternativo.", e);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.text('OFICINA', 15, 20);
    }

    // --- CABEÇALHO (TEXTOS) ---
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text('ORDEM DE SERVIÇO & CONSENTIMENTO', 200 - 15, 17, { align: 'right' });
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Agendamento de Oficina - Controle de Atendimento', 200 - 15, 22, { align: 'right' });

    // Linha azul divisória
    doc.setDrawColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setLineWidth(0.8);
    doc.line(15, 26, 200 - 15, 26);

    // --- SEÇÃO 1: INFORMAÇÕES DO CONDUTOR E VEÍCULO ---
    const colWidth = 82;
    const col1X = 15;
    const col2X = 113;
    const cardsY = 32;

    // Caixa Esquerda: Condutor
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(col1X, cardsY, colWidth, 48, 2, 2, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text('1. Informações do Condutor', col1X + 4, cardsY + 6);
    doc.line(col1X + 4, cardsY + 8, col1X + colWidth - 4, cardsY + 8);

    doc.setFontSize(8.5);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    
    doc.setFont('Helvetica', 'bold'); doc.text('Nome:', col1X + 4, cardsY + 14);
    doc.setFont('Helvetica', 'normal'); doc.text(`${pedido.nome} ${pedido.sobrenome}`, col1X + 22, cardsY + 14);

    doc.setFont('Helvetica', 'bold'); doc.text('CNH:', col1X + 4, cardsY + 21);
    doc.setFont('Helvetica', 'normal'); doc.text(pedido.cnh, col1X + 22, cardsY + 21);

    doc.setFont('Helvetica', 'bold'); doc.text('E-mail:', col1X + 4, cardsY + 28);
    doc.setFont('Helvetica', 'normal'); doc.text(pedido.email, col1X + 22, cardsY + 28);

    doc.setFont('Helvetica', 'bold'); doc.text('Telefone:', col1X + 4, cardsY + 35);
    doc.setFont('Helvetica', 'normal'); doc.text(pedido.telefone, col1X + 22, cardsY + 35);

    doc.setFont('Helvetica', 'bold'); doc.text('Contato:', col1X + 4, cardsY + 42);
    doc.setFont('Helvetica', 'normal'); doc.text(pedido.contato, col1X + 22, cardsY + 42);

    // Caixa Direita: Veículo
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(col2X, cardsY, colWidth, 48, 2, 2, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text('2. Informações do Veículo', col2X + 4, cardsY + 6);
    doc.line(col2X + 4, cardsY + 8, col2X + colWidth - 4, cardsY + 8);

    doc.setFontSize(8.5);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

    doc.setFont('Helvetica', 'bold'); doc.text('Placa:', col2X + 4, cardsY + 14);
    doc.setFont('Helvetica', 'normal'); doc.text(pedido.placa.toUpperCase(), col2X + 28, cardsY + 14);

    doc.setFont('Helvetica', 'bold'); doc.text('Modelo:', col2X + 4, cardsY + 21);
    doc.setFont('Helvetica', 'normal'); doc.text(pedido.modelo.toUpperCase(), col2X + 28, cardsY + 21);

    doc.setFont('Helvetica', 'bold'); doc.text('Cor:', col2X + 4, cardsY + 28);
    doc.setFont('Helvetica', 'normal'); doc.text(pedido.cor.toUpperCase(), col2X + 28, cardsY + 28);

    doc.setFont('Helvetica', 'bold'); doc.text('Mecânico:', col2X + 4, cardsY + 35);
    doc.setFont('Helvetica', 'normal'); doc.text(pedido.mecanico.toUpperCase(), col2X + 28, cardsY + 35);

    doc.setFont('Helvetica', 'bold'); doc.text('Obs:', col2X + 4, cardsY + 42);
    const obsLimitado = pedido.observacao ? (pedido.observacao.substring(0, 35) + (pedido.observacao.length > 35 ? '...' : '')) : 'Nenhuma';
    doc.setFont('Helvetica', 'normal'); doc.text(obsLimitado, col2X + 28, cardsY + 42);

    // --- SEÇÃO 2: LISTA DE SERVIÇOS ---
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text('3. Serviços Solicitados', 15, 90);

    const colunasTabela = ['Serviço', 'Tempo Estimado', 'Preço Unitário (R$)'];
    const linhasTabela = this.resumo().itensDetalhados.map(item => [
      item.nome,
      `${item.tempoMinutos} min`,
      `R$ ${item.preco.toFixed(2).replace('.', ',')}`
    ]);

    autoTable(doc, {
      startY: 94,
      margin: { left: 15, right: 15 },
      head: [colunasTabela],
      body: linhasTabela,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 52, 120],
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [15, 23, 42]
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' }
      }
    });

    const finalTableY = (doc as any).lastAutoTable.finalY;

    // --- BLOCO DE TOTAIS ---
    const totalBoxY = finalTableY + 5;
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(120, totalBoxY, 75, 22, 1.5, 1.5, 'F');

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text('Tempo Total + Setup:', 124, totalBoxY + 6);
    doc.text('Subtotal:', 124, totalBoxY + 12);
    
    doc.setFont('Helvetica', 'bold');
    doc.text(pedido.tempoTotal, 190, totalBoxY + 6, { align: 'right' });
    doc.text(`R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}`, 190, totalBoxY + 12, { align: 'right' });
    
    doc.line(124, totalBoxY + 15, 191, totalBoxY + 15);
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(9.5);
    doc.text('TOTAL GERAL:', 124, totalBoxY + 20);
    doc.text(`R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}`, 190, totalBoxY + 20, { align: 'right' });

    // --- SEÇÃO 3: TERMO DE CONSENTIMENTO LGPD (LEI 13.709/2018) ---
    const lgpdY = totalBoxY + 28;
    doc.setFillColor(greenBG[0], greenBG[1], greenBG[2]);
    doc.setDrawColor(greenBorder[0], greenBorder[1], greenBorder[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, lgpdY, 170, 42, 2, 2, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(greenBorder[0], greenBorder[1], greenBorder[2]);
    doc.text('TERMO DE CONSENTIMENTO SOBRE A LEI GERAL DE PROTEÇÃO DE DADOS (LGPD)', 19, lgpdY + 6);
    doc.line(19, lgpdY + 8, 181, lgpdY + 8);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);

    const textoLGPD = 
      `Em estrita conformidade com a Lei Federal nº 13.709/2018 (Lei Geral de Proteção de Dados - LGPD), ao assinar digitalmente ou presencialmente esta Ordem de Serviço, o Titular consente livremente que a concessionária colete, trate e armazene seus dados pessoais (Nome, CNH, E-mail, Telefone) e os dados de seu veículo (Placa, Modelo, Cor) em ambiente seguro e controlado. ` +
      `Estes dados possuem a finalidade exclusiva de operacionalizar o agendamento de serviços, faturar as ordens de serviço correspondentes, manter o histórico do ciclo de manutenções mecânicas, e viabilizar contatos essenciais de segurança física, como chamadas de campanhas técnicas de Recall. ` +
      `Os dados não serão compartilhados comercialmente com terceiros não autorizados. Fica resguardado o direito do titular de retificar, atualizar ou revogar este consentimento e solicitar a exclusão de seus dados a qualquer momento pelos canais oficiais de DPO do estabelecimento.`;

    const linhasDivididas = doc.splitTextToSize(textoLGPD, 162);
    doc.text(linhasDivididas, 19, lgpdY + 12);

    // --- SEÇÃO 4: CAMPOS DE ASSINATURA ---
    const signY = lgpdY + 54;
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.2);

    // Assinatura do Cliente
    doc.line(15, signY, 90, signY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text('ASSINATURA DO CLIENTE (CONDUTOR)', 52.5, signY + 4, { align: 'center' });
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`${pedido.nome} ${pedido.sobrenome}`, 52.5, signY + 8, { align: 'center' });
    doc.text(`Doc/CNH: ${pedido.cnh}`, 52.5, signY + 11, { align: 'center' });

    // Assinatura da Concessionária/Oficina
    doc.line(110, signY, 185, signY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('REPRESENTANTE DA CONCESSIONÁRIA', 147.5, signY + 4, { align: 'center' });
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Responsável Técnico: ${pedido.mecanico.toUpperCase()}`, 147.5, signY + 8, { align: 'center' });
    doc.text(`Data de Emissão: ${dataEmissao.toLocaleDateString('pt-BR')}`, 147.5, signY + 11, { align: 'center' });

    // --- SALVAR/DOWNLOAD ---
    const dataFormatada = dataEmissao.toISOString().slice(0, 10);
    const nomeArquivo = `Ordem_de_Servico_${pedido.placa.toUpperCase()}_${dataFormatada}.pdf`;
    doc.save(nomeArquivo);
  }
}