import { Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../cart';
import { Logo } from './Logo';

export function Header(){
  const [open,setOpen]=useState(false); const {count,openCart}=useCart();
  return <header className="site-header"><div className="header-inner"><Link to="/"><Logo/></Link><nav className="desktop-nav"><NavLink to="/">Home</NavLink><NavLink to="/colecao">Coleção</NavLink><NavLink to="/sobre">A Tuffão</NavLink></nav><div className="header-actions"><button className="icon-btn" onClick={openCart}><ShoppingBag/>{count>0&&<span>{count}</span>}</button><button className="icon-btn mobile-menu" onClick={()=>setOpen(v=>!v)}>{open?<X/>:<Menu/>}</button></div></div>{open&&<nav className="mobile-nav"><NavLink to="/" onClick={()=>setOpen(false)}>Home</NavLink><NavLink to="/colecao" onClick={()=>setOpen(false)}>Coleção</NavLink><NavLink to="/sobre" onClick={()=>setOpen(false)}>A Tuffão</NavLink><NavLink to="/carrinho" onClick={()=>setOpen(false)}>Carrinho</NavLink></nav>}</header>
}
