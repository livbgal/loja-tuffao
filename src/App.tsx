import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from './cart';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Carrinho } from './pages/Carrinho';
import { Checkout } from './pages/Checkout';
import { Colecao } from './pages/Colecao';
import { Confirmacao } from './pages/Confirmacao';
import { Home } from './pages/Home';
import { Sobre } from './pages/Sobre';

export default function App(){return <BrowserRouter><CartProvider><Header/><Routes><Route path="/" element={<Home/>}/><Route path="/colecao" element={<Colecao/>}/><Route path="/sobre" element={<Sobre/>}/><Route path="/carrinho" element={<Carrinho/>}/><Route path="/checkout" element={<Checkout/>}/><Route path="/confirmacao" element={<Confirmacao/>}/><Route path="*" element={<Home/>}/></Routes><Footer/><CartDrawer/></CartProvider></BrowserRouter>}
