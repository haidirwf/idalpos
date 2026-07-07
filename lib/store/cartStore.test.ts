import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cartStore';

describe('Zustand Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('starts with an empty cart', () => {
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('adds items correctly and updates quantity when adding again', () => {
    const store = useCartStore.getState();
    store.addToCart({ productId: 'p1', productName: 'Bakso', price: 15000 });
    
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]).toEqual({
      productId: 'p1',
      productName: 'Bakso',
      price: 15000,
      quantity: 1,
      note: '',
    });

    // Add again to increment quantity
    useCartStore.getState().addToCart({ productId: 'p1', productName: 'Bakso', price: 15000 });
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('updates quantity correctly', () => {
    const store = useCartStore.getState();
    store.addToCart({ productId: 'p1', productName: 'Bakso', price: 15000 });
    
    useCartStore.getState().updateQuantity('p1', 3);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('removes item if quantity is updated to 0 or less', () => {
    const store = useCartStore.getState();
    store.addToCart({ productId: 'p1', productName: 'Bakso', price: 15000 });
    
    useCartStore.getState().updateQuantity('p1', 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('updates notes correctly', () => {
    const store = useCartStore.getState();
    store.addToCart({ productId: 'p1', productName: 'Bakso', price: 15000 });
    
    useCartStore.getState().updateNote('p1', 'No spicy, please');
    expect(useCartStore.getState().items[0].note).toBe('No spicy, please');
  });

  it('removes items correctly', () => {
    const store = useCartStore.getState();
    store.addToCart({ productId: 'p1', productName: 'Bakso', price: 15000 });
    store.addToCart({ productId: 'p2', productName: 'Es Teh', price: 5000 });
    
    expect(useCartStore.getState().items).toHaveLength(2);
    useCartStore.getState().removeItem('p1');
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].productId).toBe('p2');
  });

  it('clears cart correctly', () => {
    const store = useCartStore.getState();
    store.addToCart({ productId: 'p1', productName: 'Bakso', price: 15000 });
    store.addToCart({ productId: 'p2', productName: 'Es Teh', price: 5000 });
    
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
