export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

export type ResponseProduct = Omit<Product, 'amount'>;

export interface Stock {
  id: number;
  amount: number;
}
