export type Size = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XGG';
export type Fit = 'Tradicional' | 'Baby Look';
export type ProductKind = 'shirt' | 'hoodie' | 'cup';

export type Product = {
  id: string;
  name: string;
  category: 'camisas' | 'moletom' | 'acessorios';
  kind: ProductKind;
  price: number;
  boxMemberPrice?: number;
  description: string;
  needsSize: boolean;
  available: boolean;
  image?: string;
  imageLabel: string;
};

export type ComboSlot = {
  label: string;
  kind: ProductKind;
  options: string[];
  needsSize: boolean;
};

export type Combo = {
  id: string;
  code: string;
  name: string;
  price: number;
  description: string;
  slots: ComboSlot[];
  available: boolean;
  image?: string;
};

export type CartPiece = {
  label: string;
  productId: string;
  productName: string;
  size?: Size;
  fit?: Fit;
};

export type CartItem = {
  uid: string;
  kind: 'product' | 'combo';
  refId: string;
  name: string;
  badge?: string;
  unitPrice: number;
  quantity: number;
  pieces: CartPiece[];
  image?: string;
};
