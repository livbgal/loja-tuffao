import { Link } from 'react-router-dom';
import { COMBOS, PRODUCTS, TEAM_RESULTS } from '../catalog';
import { ComboCard, ProductCard } from '../components/ProductCards';
import { ProductImage } from '../components/ProductImage';

export function Home(){return <>
<section className="hero"><div className="container hero-grid"><div><small>LOJA OFICIAL · BAJA SAE BRASIL</small><h1>VISTA A<br/>TUFFÃO.</h1><p>Produtos oficiais da equipe Tuffão Baja SAE.</p><div className="actions"><Link className="btn primary" to="/colecao">VER COLEÇÃO</Link><Link className="btn outline" to="/sobre">CONHEÇA A TUFFÃO</Link></div></div><ProductImage label="Protótipo Baja da Tuffão" wide/></div></section>
<section className="support"><div className="container support-grid"><div><h2>CADA PEÇA SUSTENTA O PROJETO</h2><p>A receita da coleção é revertida para o desenvolvimento do protótipo e para a participação da equipe nas etapas do Baja SAE Brasil. Comprar aqui é entrar no box com a gente.</p></div><dl>{[['Etapa Sudeste','Campeã geral'],['Peças',`${PRODUCTS.length} avulsas`],['Combos',`${COMBOS.length} kits`],['Tamanhos','PP ao XGG']].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div></section>
<section className="container section"><div className="section-head"><div><small>COLEÇÃO</small><h2>PRODUTOS AVULSOS</h2></div><Link to="/colecao">VER TUDO</Link></div><div className="card-grid">{PRODUCTS.slice(0,3).map(p=><ProductCard key={p.id} product={p}/>)}</div></section>
<section className="section alt"><div className="container"><small>COMBOS TUFFÃO</small><h2>MONTE SEU KIT E PAGUE MENOS</h2><div className="card-grid">{COMBOS.slice(0,3).map(c=><ComboCard key={c.id} combo={c}/>)}</div><Link className="btn light" to="/colecao">VER TODOS OS COMBOS</Link></div></section>
<section className="container section"><small>RESULTADO</small><h2>CAMPEÃ GERAL DA ETAPA SUDESTE DO BAJA SAE BRASIL</h2><ul className="results">{TEAM_RESULTS.map(r=><li key={r}>{r}</li>)}</ul><Link className="btn outline" to="/sobre">CONHEÇA A EQUIPE</Link></section>
</>}
