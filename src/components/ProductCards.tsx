import { useState } from 'react';
import { comboListPrice, formatBRL } from '../catalog';
import type { Combo, Product } from '../types';
import { ConfigureDialog } from './ConfigureDialog';
import { ProductImage } from './ProductImage';

export function ProductCard({product}:{product:Product}){
  const [open,setOpen]=useState(false);
  return <article className="card"><div className="card-media"><ProductImage src={product.image} label={product.imageLabel}/>{product.boxMemberPrice&&<span className="badge">PREÇO DE BOX</span>}</div><div className="card-body"><h3>{product.name}</h3><p>{product.description}</p><div className="price-row"><strong>{formatBRL(product.price)}</strong><small>DISPONÍVEL</small></div>{product.boxMemberPrice&&<p className="member-price">{formatBRL(product.boxMemberPrice)} para membros inscritos no box.</p>}<button className="btn light" onClick={()=>setOpen(true)}>COMPRAR</button><button className="btn outline" onClick={()=>setOpen(true)}>ADICIONAR AO CARRINHO</button></div>{open&&<ConfigureDialog product={product} onClose={()=>setOpen(false)}/>}</article>
}

export function ComboCard({combo}:{combo:Combo}){
  const [open,setOpen]=useState(false); const list=comboListPrice(combo); const saving=list-combo.price;
  return <article className="card combo"><div className="combo-top"><strong>{combo.code}</strong>{saving>0&&<small>ECONOMIZE {formatBRL(saving)}</small>}</div><ProductImage src={combo.image} label={`Combo ${combo.code}`} wide/><div className="card-body"><h3>{combo.name}</h3><p>{combo.description}</p><ul>{combo.slots.map((s,i)=><li key={i}>{s.label}{s.options.length>1?' — à sua escolha':''}</li>)}</ul><div className="price-row"><div>{saving>0&&<del>{formatBRL(list)}</del>}<strong>{formatBRL(combo.price)}</strong></div><small>DISPONÍVEL</small></div><button className="btn primary" onClick={()=>setOpen(true)}>COMPRAR</button><button className="btn outline" onClick={()=>setOpen(true)}>MONTAR E ADICIONAR</button></div>{open&&<ConfigureDialog combo={combo} onClose={()=>setOpen(false)}/>}</article>
}
