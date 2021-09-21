import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, ResponseProduct, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const {data: product} = await api.get<ResponseProduct>(`products/${productId}`)
      const {data: stock} = await api.get<Stock>(`stock/${productId}`)
      let updatedCart = [] as Product[]
      const cartItem = cart.find(cartItem => productId === cartItem.id)
      if(stock?.amount > 0){
        if(cartItem){
          if(cartItem.amount < stock?.amount){
            updatedCart = cart.map(cartItem => cartItem.id === productId ? {...cartItem, amount: cartItem.amount+1}: cartItem)
          }else{
            toast.error('Quantidade solicitada fora de estoque');
            return
          }
        }else{
          updatedCart = [...cart, {...product, amount:1}]
        }
      }
      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      let newCart = []
      const cartItems = [...cart]
      const isCartItem = cartItems.find(cartItem => cartItem.id === productId)
      if(isCartItem){
        console.log('Entrei');
        
        newCart = cart.filter(cartItem=> cartItem?.id !== productId)
        setCart(newCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      }else{
        toast.error('Erro na remoção do produto');
      }
    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if(amount <= 0) return
      const {data: stock} = await api.get<Stock>(`stock/${productId}`)
      if(stock.amount >= amount){
        const newCart = cart.map(cartItem => cartItem.id === productId ? {...cartItem, amount}: cartItem) 
        setCart(newCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      }
      else{
        toast.error('Quantidade solicitada fora de estoque');
      }
      return
    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
