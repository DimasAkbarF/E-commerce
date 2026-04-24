'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductGallery from '@/components/product/ProductGallery';
import QuantityControl from '@/components/product/QuantityControl';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import CartDrawer from '@/components/cart/CartDrawer';
import Toast from '@/components/ui/Toast';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { getProductById } from '@/lib/products';
import { supabase } from '@/lib/supabase';
import { reviews } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/supabase';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    items,
    isOpen,
    totalItems,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    openCart,
    closeCart,
  } = useCart();

  const { toasts, removeToast, success, error } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  // Fetch product from Supabase
  const fetchProduct = useCallback(async () => {
    if (!params.id) return;
    
    try {
      setLoading(true);
      const data = await getProductById(params.id as string);
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err);
      error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  }, [params.id, error]);

  useEffect(() => {
    fetchProduct();

    // Subscribe to realtime changes for this product
    const channel = supabase
      .channel(`product-${params.id}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${params.id}`,
        },
        (payload) => {
          console.log('Product detail update:', payload);
          // Refetch product when any change occurs
          fetchProduct();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProduct, params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Convert Supabase Product to Cart Product type
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      category: product.category,
      rating: 4.5,
      soldCount: 0,
      variants: [],
    };
    
    console.log('PRODUCT PAGE - Adding to cart:', cartProduct);
    addToCart(cartProduct, quantity);
    console.log('PRODUCT PAGE - Added to cart, current items:', items);
    success(`${product.name} ditambahkan ke keranjang`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Navigate to checkout after adding to cart
    setTimeout(() => {
      router.push('/checkout');
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar cartCount={totalItems} />
        <main className="flex-1 bg-[#F5F5F5] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#03AC0E] border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar cartCount={totalItems} />
        <main className="flex-1 bg-[#F5F5F5] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Produk Tidak Ditemukan</h1>
            <Link href="/" className="text-[#03AC0E] hover:underline">
              Kembali ke Beranda
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Toast toasts={toasts} onRemove={removeToast} />
      <Navbar cartCount={totalItems} onCartClick={openCart} />

      <main className="flex-1 bg-[#F5F5F5]">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#03AC0E]">Beranda</Link>
            <span>/</span>
            <span className="text-gray-400">{product.category}</span>
            <span>/</span>
            <span className="text-gray-900 truncate">{product.name}</span>
          </nav>
        </div>

        {/* Product Detail */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-8 md:pb-12">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 p-4 md:p-6">
              {/* Gallery */}
              <ProductGallery
                images={[product.image_url]}
                productName={product.name}
              />

              {/* Info */}
              <div className="space-y-4">
                {/* Category & Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-[#6B7280]">{product.category}</span>
                  {product.stock === 0 && <Badge variant="danger">Stok Habis</Badge>}
                </div>

                {/* Name */}
                <h1 className="text-xl md:text-2xl font-bold text-[#1F1F1F]">{product.name}</h1>

                {/* Rating - Static for now */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold text-[#1F1F1F]">4.5</span>
                  </div>
                  <span className="text-[#6B7280]">(128 ulasan)</span>
                  <span className="text-[#6B7280]">•</span>
                  <span className="text-[#6B7280]">1,234 terjual</span>
                </div>

                {/* Price */}
                <div className="py-2 border-y border-gray-100">
                  <p className="text-2xl md:text-3xl font-bold text-[#EF4444]">
                    {formatPrice(product.price)}
                  </p>
                </div>

                {/* Stock */}
                <p className={`text-sm ${
                  product.stock > 10 ? 'text-green-600' : 
                  product.stock > 0 ? 'text-amber-600' : 
                  'text-red-600'
                }`}>
                  {product.stock > 10 ? `Stok: ${product.stock} tersedia` : 
                   product.stock > 0 ? `Stok terbatas: ${product.stock}` : 
                   'Stok habis'}
                </p>

                {/* Quantity */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-[#1F1F1F]">Jumlah</span>
                  <QuantityControl
                    quantity={quantity}
                    onIncrease={() => setQuantity(q => Math.min(q + 1, product.stock))}
                    onDecrease={() => setQuantity(q => Math.max(q - 1, 1))}
                    onChange={setQuantity}
                    max={product.stock}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleAddToCart}
                    className="flex-1"
                    disabled={product.stock === 0}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Keranjang
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleBuyNow}
                    className="flex-1"
                    disabled={product.stock === 0}
                  >
                    Beli Sekarang
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-200">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'description'
                      ? 'text-[#03AC0E] border-b-2 border-[#03AC0E]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Deskripsi
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'reviews'
                      ? 'text-[#03AC0E] border-b-2 border-[#03AC0E]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Ulasan (128)
                </button>
              </div>

              <div className="p-4 md:p-6">
                {activeTab === 'description' ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose max-w-none"
                  >
                    <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {review.userName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{review.userName}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'
                                  }`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 ml-auto">{review.date}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <CartDrawer
        isOpen={isOpen}
        onClose={closeCart}
        items={items}
        totalPrice={totalPrice}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
    </div>
  );
}
