import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatBRL } from '../catalog';
import type { CartItem, CartPiece } from '../types';

const WHATSAPP_NUMBER = '5521979239910';

function readLastOrder(){
  try {
    const raw = localStorage.getItem('tuffao-last-order-v2');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const describePiece = (p:CartPiece) => `${p.productName}${p.fit?` · ${p.fit}`:''}${p.size?` · Tam. ${p.size}`:''}`;

export function Confirmacao(){
  const order=readLastOrder();
  if(!order) return <main className="container page empty"><h1>NENHUM PEDIDO ENCONTRADO</h1><Link className="btn primary" to="/colecao">VER COLEÇÃO</Link></main>;

  const message=[
    `Olá! Finalizei o pedido ${order.id} na Loja Tuffão e gostaria de receber o link de pagamento.`,
    '',
    ...order.items.map((i:CartItem)=>`• ${i.quantity}x ${i.name} (${i.pieces.map(describePiece).join(' | ')})`),
    '',
    `Total: ${formatBRL(order.total)}`,
  ].join('\n');
  const whatsappUrl=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return <main className="container page confirmation">
    <small>OBRIGADO POR APOIAR A EQUIPE</small>
    <h1>PEDIDO CONFIRMADO.</h1>
    <div className="order-info">
      <div><span>NÚMERO</span><strong>{order.id}</strong></div>
      <div><span>VALOR TOTAL</span><strong>{formatBRL(order.total)}</strong></div>
      <div><span>PAGAMENTO</span><strong>{(order.paymentLabel??order.payment??'').toUpperCase()}</strong></div>
    </div>
    <section>
      <h2>RESUMO</h2>
      <ul className="review">{order.items.map((i:CartItem)=><li key={i.uid}><span>{i.quantity}× {i.name}<em>{i.pieces.map(describePiece).join(' | ')}</em></span><strong>{formatBRL(i.unitPrice*i.quantity)}</strong></li>)}</ul>
    </section>
    <section className="notice">
      <h2>PAGAMENTO</h2>
      <p>Chame a equipe no WhatsApp para receber o link de pagamento. O botão abaixo já abre a conversa com o resumo do seu pedido.</p>
    </section>
    <div className="actions">
      <a className="btn primary whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true"/> FALAR COM A TUFFÃO NO WHATSAPP</a>
      <Link className="btn outline" to="/colecao">VOLTAR À COLEÇÃO</Link>
    </div>
    <p className="whatsapp-fallback">Se o botão não abrir, chame no WhatsApp <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">+55 21 97923-9910</a>.</p>
  </main>;
}
