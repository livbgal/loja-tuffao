import type { Combo, ComboSlot, Product, Size } from './types';

export const SIZES: Size[] = ['PP', 'P', 'M', 'G', 'GG', 'XGG'];

export const PRODUCTS: Product[] = [
  {
    id: 'camisa-box',
    name: 'Camisa Box',
    category: 'camisas',
    kind: 'shirt',
    price: 60,
    boxMemberPrice: 45,
    description: 'Camisa oficial de box da equipe. Imagem em breve.',
    needsSize: true,
    available: true,
    imageLabel: 'Camisa Box',
  },
  {
    id: 'camisa-torcida-preta',
    name: 'Camisa Torcida Preta',
    category: 'camisas',
    kind: 'shirt',
    price: 60,
    description: 'Camisa de torcida preta da coleção oficial.',
    needsSize: true,
    available: true,
    image: '/camisa-torcida-preta.jpeg',
    imageLabel: 'Camisa Torcida Preta',
  },
  {
    id: 'camisa-torcida-branca',
    name: 'Camisa Torcida Branca',
    category: 'camisas',
    kind: 'shirt',
    price: 60,
    description: 'Camisa de torcida branca da coleção oficial.',
    needsSize: true,
    available: true,
    image: '/camisa-torcida-branca.jpeg',
    imageLabel: 'Camisa Torcida Branca',
  },
  {
    id: 'moletom',
    name: 'Moletom Tuffão',
    category: 'moletom',
    kind: 'hoodie',
    price: 130,
    description: 'Moletom oficial da equipe, com identidade Tuffão.',
    needsSize: true,
    available: true,
    image: '/moletom.jpeg',
    imageLabel: 'Moletom Tuffão',
  },
  {
    id: 'copo-termico',
    name: 'Copo Térmico da Tuffão',
    category: 'acessorios',
    kind: 'cup',
    price: 40,
    description: 'Copo térmico personalizado com a marca da equipe.',
    needsSize: false,
    available: true,
    image: '/copo-termico.jpeg',
    imageLabel: 'Copo Térmico',
  },
];

export const SHIRT_IDS = ['camisa-box', 'camisa-torcida-preta', 'camisa-torcida-branca'];
export const TORCIDA_IDS = ['camisa-torcida-preta', 'camisa-torcida-branca'];

const shirtSlot = (n: number, options = SHIRT_IDS): ComboSlot => ({
  label: n === 0 ? 'Camisa' : `Camisa ${n}`,
  kind: 'shirt',
  options: [...options],
  needsSize: true,
});

const hoodieSlot: ComboSlot = {
  label: 'Moletom', kind: 'hoodie', options: ['moletom'], needsSize: true,
};
const cupSlot: ComboSlot = {
  label: 'Copo térmico', kind: 'cup', options: ['copo-termico'], needsSize: false,
};

export const COMBOS: Combo[] = [
  { id:'k1', code:'K1', name:'1 camisa + copo', price:89, description:'Escolha uma camisa e leve o copo térmico.', slots:[shirtSlot(0), cupSlot], available:true },
  { id:'k2', code:'K2', name:'2 camisas + copo', price:147, description:'Duas camisas à sua escolha mais o copo.', slots:[shirtSlot(1), shirtSlot(2), cupSlot], available:true },
  { id:'k3', code:'K3', name:'3 camisas', price:159, description:'Monte o trio de camisas do seu jeito.', slots:[shirtSlot(1), shirtSlot(2), shirtSlot(3)], available:true },
  { id:'k4', code:'K4', name:'2 camisas de torcida', price:109, description:'Preta + branca.', slots:[{label:'Camisa Torcida Preta',kind:'shirt',options:['camisa-torcida-preta'],needsSize:true},{label:'Camisa Torcida Branca',kind:'shirt',options:['camisa-torcida-branca'],needsSize:true}], available:true },
  { id:'k5', code:'K5', name:'1 torcida + 1 box', price:109, description:'Escolha a camisa de torcida; a Box vem junto.', slots:[{label:'Camisa Torcida',kind:'shirt',options:[...TORCIDA_IDS],needsSize:true},{label:'Camisa Box',kind:'shirt',options:['camisa-box'],needsSize:true}], available:true },
  { id:'k6', code:'K6', name:'Moletom + 1 camisa', price:175, description:'Moletom com uma camisa à sua escolha.', slots:[hoodieSlot, shirtSlot(0)], available:true },
  { id:'k7', code:'K7', name:'Moletom + 2 camisas', price:224, description:'Moletom com duas camisas à sua escolha.', slots:[hoodieSlot, shirtSlot(1), shirtSlot(2)], available:true },
  { id:'k8', code:'K8', name:'Moletom + 3 camisas', price:273, description:'Kit completo de vestuário.', slots:[hoodieSlot, shirtSlot(1), shirtSlot(2), shirtSlot(3)], available:true },
  { id:'k9', code:'K9', name:'1 camisa + moletom + copo', price:199.9, description:'Camisa, moletom e copo térmico.', slots:[shirtSlot(0), hoodieSlot, cupSlot], available:true },
  { id:'k10', code:'K10', name:'2 camisas + moletom + copo', price:254.9, description:'Duas camisas, moletom e copo.', slots:[shirtSlot(1), shirtSlot(2), hoodieSlot, cupSlot], available:true },
  { id:'k11', code:'K11', name:'3 camisas + moletom + copo', price:305.9, description:'O kit mais completo da coleção.', slots:[shirtSlot(1), shirtSlot(2), shirtSlot(3), hoodieSlot, cupSlot], available:true },
];

export const TEAM_RESULTS = ['1º Lugar Geral','1º Lugar Suspensão','2º Lugar Enduro','3º Lugar Skid Pad','3º Lugar Velocidade Final','3º Lugar Aceleração'];
export const getProduct = (id:string) => PRODUCTS.find(p => p.id === id);
export const formatBRL = (value:number) => value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export const comboListPrice = (combo:Combo) => combo.slots.reduce((sum,s)=>sum+(getProduct(s.options[0])?.price ?? 0),0);
