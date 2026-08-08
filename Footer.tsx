import { Link } from 'react-router-dom';
import { Logo } from './Logo';
export function Footer(){return <footer className="site-footer"><div className="footer-inner"><div><Logo/><p>Loja oficial da equipe Tuffão Baja SAE. Cada peça vendida sustenta o protótipo e a participação da equipe nas competições.</p></div><nav><Link to="/colecao">Coleção</Link><Link to="/sobre">A Tuffão</Link><Link to="/carrinho">Carrinho</Link></nav></div><div className="footer-bottom">TUFFÃO BAJA SAE — PRODUTOS OFICIAIS</div></footer>}
