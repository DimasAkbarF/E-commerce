import { supabase } from './supabase';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  created_at: string;
}

export async function getCartItems(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cart:', error);
    return [];
  }

  return data || [];
}

export async function addToCart(
  userId: string,
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  },
  quantity: number = 1
): Promise<CartItem | null> {
  // Check if item already exists in cart
  const { data: existing } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', product.id)
    .maybeSingle();

  if (existing) {
    // Update quantity
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating cart item:', error);
      return null;
    }

    return data;
  }

  // Insert new item
  const { data, error } = await supabase
    .from('cart_items')
    .insert({
      user_id: userId,
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image_url: product.image_url,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding to cart:', error);
    return null;
  }

  return data;
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<CartItem | null> {
  if (quantity <= 0) {
    await removeCartItem(itemId);
    return null;
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Error updating cart item:', error);
    return null;
  }

  return data;
}

export async function removeCartItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error removing cart item:', error);
  }
}

export async function clearCart(userId: string): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error clearing cart:', error);
  }
}

export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
