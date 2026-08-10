import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FITS, SIZES, formatBRL, getProduct } from '../catalog';
import { useCart } from '../cart';
import type { Combo, Fit, Product, Size } from '../types';

type SlotState={productId:string;size?:Size;fit?:Fit};

export function ConfigureDialog({product,combo,onClose}:{product?:Product;combo?:Combo;onClose:()=>void}){
  const {addItem,openCart}=useCart();
  const slots=useMemo(()=>combo?combo.slots:product?[{label:product.name,kind:product.kind,options:[product.id],needsSize:product.needsSize}]:[],[combo,product]);
  const [state,setState]=useState<SlotState[]>(()=>slots.map(s=>({productId:s.options.length===1?s.options[0]:''})));
  const [isBoxMember,setIsBoxMember]=useState<boolean|null>(null);
  const [submitted,setSubmitted]=useState(false);
  const askBox=Boolean(product?.boxMemberPrice);
  const unitPrice=combo?combo.price:askBox&&isBoxMember?product!.boxMemberPrice!:product?.price??0;
  const invalid=slots.some((s,i)=>!state[i].productId||(s.needsSize&&!state[i].size)||(s.kind==='shirt'&&!state[i].fit))||(askBox&&isBoxMember===null);

  function add(){
    setSubmitted(true);
    if(invalid) return;
    const pieces=slots.map((s,i)=>{
      const ref=getProduct(state[i].productId);
      return {label:s.label,productId:state[i].productId,productName:ref?.name??s.label,...(state[i].size?{size:state[i].size}:{}),...(state[i].fit?{fit:state[i].fit}:{})};
    });
    addItem({kind:combo?'combo':'product',refId:combo?.id??product!.id,name:combo?`${combo.code} — ${combo.name}`:product!.name,badge:combo?'Combo':isBoxMember?'Membro do box':undefined,unitPrice,quantity:1,pieces,image:product?.image});
    onClose(); openCart();
  }

  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal-card" role="dialog" aria-modal="true">
      <header><div><small>CONFIGURAR PEDIDO</small><h2>{combo?`${combo.code} — ${combo.name}`:product?.name}</h2></div><button onClick={onClose} aria-label="Fechar"><X/></button></header>
      <div className="modal-body">
        {askBox&&<fieldset><legend>VOCÊ ESTÁ INSCRITO NO BOX?</legend><p>Valor promocional exclusivo para membros inscritos no box da competição.</p><div className="option-grid two"><button className={isBoxMember===true?'active':''} onClick={()=>setIsBoxMember(true)}>SIM <b>{formatBRL(product!.boxMemberPrice!)}</b></button><button className={isBoxMember===false?'active':''} onClick={()=>setIsBoxMember(false)}>NÃO <b>{formatBRL(product!.price)}</b></button></div>{submitted&&isBoxMember===null&&<em>Selecione uma opção.</em>}</fieldset>}
        {slots.map((slot,i)=><fieldset key={`${slot.label}-${i}`}><legend>{slot.label}</legend>{slot.options.length>1?<><p>Escolha o modelo</p><div className="option-grid">{slot.options.map(id=>{const ref=getProduct(id)!;return <button key={id} className={state[i].productId===id?'active':''} onClick={()=>setState(c=>c.map((s,idx)=>idx===i?{...s,productId:id}:s))}>{ref.name}</button>})}</div>{submitted&&!state[i].productId&&<em>Escolha um modelo.</em>}</>:<p>{getProduct(slot.options[0])?.name} — peça fixa deste kit.</p>}{slot.kind==='shirt'&&<><p>Modelagem</p><div className="option-grid two">{FITS.map(fit=><button key={fit} className={state[i].fit===fit?'active':''} onClick={()=>setState(c=>c.map((s,idx)=>idx===i?{...s,fit}:s))}>{fit.toUpperCase()}</button>)}</div>{submitted&&!state[i].fit&&<em>Escolha a modelagem.</em>}</>}{slot.needsSize&&<><p>Tamanho</p><div className="size-grid">{SIZES.map(size=><button key={size} className={state[i].size===size?'active':''} onClick={()=>setState(c=>c.map((s,idx)=>idx===i?{...s,size}:s))}>{size}</button>)}</div>{submitted&&!state[i].size&&<em>Selecione o tamanho.</em>}</>}</fieldset>)}
      </div>
      <footer><div><small>TOTAL DO ITEM</small><strong>{formatBRL(unitPrice)}</strong></div><button className="btn primary" onClick={add}>ADICIONAR AO CARRINHO</button></footer>
    </div>
  </div>
}
