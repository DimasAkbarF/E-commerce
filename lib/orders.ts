import { supabase } from './supabase';

export interface Order {
  id: string;
  user_id: string;
  total_price: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

export async function getOrders(userId?: string): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
}

export async function getOrderById(orderId: string): Promise<{ order: Order | null; items: OrderItem[] }> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  if (orderError) {
    console.error('Error fetching order:', orderError);
    return { order: null, items: [] };
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    return { order, items: [] };
  }

  return { order, items: items || [] };
}

export async function createOrder(
  userId: string,
  cartItems: {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image_url: string;
  }[]
): Promise<Order | null> {
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total_price: totalPrice,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('Error creating order:', orderError);
    return null;
  }

  // Create order items
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image_url: item.image_url,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    return null;
  }

  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'processing' | 'completed' | 'rejected'
): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    return null;
  }

  return data;
}

export async function startProcessingOrder(orderId: string): Promise<Order | null> {
  return updateOrderStatus(orderId, 'processing');
}

export async function completeOrder(orderId: string): Promise<Order | null> {
  return updateOrderStatus(orderId, 'completed');
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  // Delete order items first (CASCADE should handle this, but being explicit)
  const { error: itemsError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', orderId);

  if (itemsError) {
    console.error('Error deleting order items:', itemsError);
    return false;
  }

  // Delete order
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) {
    console.error('Error deleting order:', error);
    return false;
  }

  return true;
}

export function subscribeToOrders(callback: (order: Order) => void) {
  return supabase
    .channel('orders-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      (payload) => {
        callback(payload.new as Order);
      }
    )
    .subscribe();
}

// ============================================
// ANALYTICS FUNCTIONS (ADMIN DASHBOARD)
// ============================================

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  processingOrders: number;
  rejectedOrders: number;
  dailyRevenue: { date: string; revenue: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  statusDistribution: { status: string; count: number }[];
}

export async function getAnalytics(
  dateRange?: { from: string; to: string }
): Promise<AnalyticsData> {
  let query = supabase.from('orders').select('*');

  if (dateRange) {
    query = query
      .gte('created_at', dateRange.from)
      .lte('created_at', dateRange.to);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error('Error fetching analytics:', error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      rejectedOrders: 0,
      dailyRevenue: [],
      monthlyRevenue: [],
      statusDistribution: [],
    };
  }

  const allOrders = orders || [];
  const completedOrders = allOrders.filter(o => o.status === 'completed');

  // Calculate totals
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total_price, 0);

  // Daily revenue
  const dailyMap = new Map<string, number>();
  completedOrders.forEach(order => {
    const date = new Date(order.created_at).toISOString().split('T')[0];
    dailyMap.set(date, (dailyMap.get(date) || 0) + order.total_price);
  });
  const dailyRevenue = Array.from(dailyMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Monthly revenue
  const monthlyMap = new Map<string, number>();
  completedOrders.forEach(order => {
    const month = new Date(order.created_at).toISOString().slice(0, 7); // YYYY-MM
    monthlyMap.set(month, (monthlyMap.get(month) || 0) + order.total_price);
  });
  const monthlyRevenue = Array.from(monthlyMap.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Status distribution
  const statusMap = new Map<string, number>();
  allOrders.forEach(order => {
    statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1);
  });
  const statusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }));

  return {
    totalRevenue,
    totalOrders: allOrders.length,
    completedOrders: completedOrders.length,
    pendingOrders: allOrders.filter(o => o.status === 'pending').length,
    processingOrders: allOrders.filter(o => o.status === 'processing').length,
    rejectedOrders: allOrders.filter(o => o.status === 'rejected').length,
    dailyRevenue,
    monthlyRevenue,
    statusDistribution,
  };
}

export async function getUserInfo(userId: string): Promise<{ name: string; email: string } | null> {
  const { data, error } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user info:', error);
    return null;
  }

  return data;
}

export async function getUserOrdersForAdmin(
  filters?: {
    userId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }

  return data || [];
}
