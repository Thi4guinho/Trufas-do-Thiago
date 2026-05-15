/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  X, 
  CheckCircle2, 
  Flame, 
  MapPin, 
  Phone, 
  ChevronRight,
  ArrowRight,
  Sparkles,
  Heart,
  Search,
  Star,
  Zap,
  Gift,
  Clock,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react';
import { FLAVORS, CATEGORIES, calculatePricing } from './constants';
import { CartItem, Order } from './types';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderSent, setOrderSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredFlavorId, setHoveredFlavorId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering logic
  const filteredFlavors = useMemo(() => {
    return FLAVORS.filter(flavor => {
      const matchesCategory = selectedCategory === 'all' || flavor.category === selectedCategory;
      const matchesSearch = flavor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           flavor.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const bestSellers = useMemo(() => FLAVORS.filter(f => f.isBestSeller), []);

  // Scroll to menu when searching or switching categories
  useEffect(() => {
    if (searchQuery.trim() !== '' || selectedCategory !== 'all') {
      const menuElement = document.getElementById('menu');
      if (menuElement) {
        // Smooth scroll to the results section.
        menuElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [searchQuery, selectedCategory]);

  // Persistence Hook
  useEffect(() => {
    const savedCart = localStorage.getItem('truffle-cart');
    const savedFavorites = localStorage.getItem('truffle-favorites');
    
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }

    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('truffle-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('truffle-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const totalQuantity = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const pricing = useMemo(() => calculatePricing(totalQuantity), [totalQuantity]);

  const addToCart = (flavor: typeof FLAVORS[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === flavor.id);
      if (existing) {
        return prev.map(item => item.id === flavor.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...flavor, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing?.quantity === 1) {
        return prev.filter(item => item.id !== id);
      }
      return prev.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item);
    });
  };

  const clearCart = () => setCart([]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleSubmitOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || cart.length === 0) return;

    setIsSubmitting(true);
    
    const orderData: Order = {
      customerName,
      customerPhone,
      items: cart,
      totalQuantity,
      totalPrice: pricing.totalPrice,
      savings: pricing.savings
    };

    try {
      // 1. Enviar para o servidor (Registro/Log)
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      if (response.ok) {
        // 2. Formatar e Abrir WhatsApp
        const itemsText = cart.map(item => `• *${item.quantity}x* ${item.name}`).join('%0A');
        const waMessage = `*NOVO PEDIDO - TRUFINHAS DO THIAGO*%0A%0A` +
          `*Cliente:* ${customerName}%0A` +
          `*Telefone:* ${customerPhone}%0A%0A` +
          `*Itens:*%0A${itemsText}%0A%0A` +
          `*Total de Trufas:* ${totalQuantity}%0A` +
          `*Economia:* R$ ${pricing.savings.toFixed(2)}%0A` +
          `*TOTAL FINAL: R$ ${pricing.totalPrice.toFixed(2)}*%0A%0A` +
          `_Poderia confirmar meu pedido?_`;

        // Seu número de WhatsApp configurado
        const myPhoneNumber = '5511934011936'; 
        const waUrl = `https://wa.me/${myPhoneNumber}?text=${waMessage}`;
        
        window.open(waUrl, '_blank');

        setOrderSent(true);
        clearCart();
        setCustomerName('');
        setCustomerPhone('');
      }
    } catch (error) {
      console.error('Submit Error:', error);
      alert('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream selection:bg-gold selection:text-white">
      {/* Navbar - Dakingo Style */}
      <header className="sticky top-0 z-50 bg-white border-b border-cocoa/5 px-4 md:px-12 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Logo and Main Nav */}
            <div className="flex items-center justify-between md:justify-start gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-red text-white flex items-center justify-center rounded-xl font-serif text-2xl font-black shadow-lg">
                  T
                </div>
                <h1 className="font-serif text-2xl font-black tracking-tight text-cocoa leading-none">
                  Trufinhas
                </h1>
              </div>

              <nav className="hidden xl:flex items-center gap-6">
                {["Sabores", "Kits", "Presentes", "Eventos", "Contato"].map((item) => (
                  <a key={item} href="#" className="text-[13px] font-bold text-cocoa/60 hover:text-brand-red transition-colors">
                    {item}
                  </a>
                ))}
              </nav>
            </div>

            {/* Search and User Actions */}
            <div className="flex items-center gap-3 md:gap-6">
              <div className="relative group flex-1 md:flex-none md:min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa/30 group-focus-within:text-brand-red transition-colors" />
                <input 
                  type="text" 
                  placeholder="Qual sabor você deseja hoje?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-beige/20 border border-cocoa/5 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-brand-red focus:ring-1 ring-brand-red/10 transition-all shadow-inner"
                />
              </div>

              <div className="flex items-center gap-3">
                <button className="hidden sm:flex items-center gap-2 text-xs font-bold text-brand-red uppercase tracking-widest bg-brand-red/5 px-4 py-2.5 rounded-full hover:bg-brand-red/10 transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                  Pedir Agora
                </button>
                
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="group relative flex items-center justify-center w-10 h-10 bg-cocoa text-white rounded-full hover:bg-cocoa-light transition-all shadow-lg"
                >
                  <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {totalQuantity > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
                      {totalQuantity}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Dakingo Style */}
      <section className="relative overflow-hidden pt-8 pb-12 px-4 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto rounded-[2.5rem] md:rounded-[4rem] bg-brand-red relative overflow-hidden flex flex-col lg:flex-row items-center min-h-[500px]">
          {/* Decorative Pattern - Abstract dots or circles */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          </div>

          <div className="relative z-10 flex-1 p-10 md:p-20 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-serif text-4xl md:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                Puro Prazer <br />
                em Forma de <br />
                Chocolate!
              </h2>
              <p className="text-white/80 text-lg md:text-xl font-medium mb-10 max-w-md mx-auto lg:mx-0">
                Trufas artesanais feitas com ingredientes nobres para os paladares mais exigentes.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <button 
                  onClick={() => {
                    const el = document.getElementById('menu');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-brand-gold text-brand-cocoa px-10 py-5 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/20 group"
                >
                  Ver Cardápio
                  <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/50">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold">Feito com Amor</p>
                    <p className="text-white font-bold text-xl uppercase italic">100% ARTESANAL</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 relative p-10 md:p-20 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-white/10 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-2xl animate-pulse" />
              <img 
                src="https://images.unsplash.com/photo-1549007994-cb92cd87dd36?auto=format&fit=crop&q=80&w=800" 
                alt="Featured Truffle"
                className="relative z-10 w-[280px] md:w-[420px] drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] rounded-[3rem] transform rotate-3"
              />
              
              {/* Secondary floating images like in the screenshot */}
              <div className="absolute -top-10 -right-4 w-24 h-24 md:w-36 md:h-36 bg-white p-2 rounded-2xl shadow-2xl rotate-12 hidden md:block">
                <img src={FLAVORS[0].image} className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="absolute -bottom-10 -left-4 w-24 h-24 md:w-36 md:h-36 bg-white p-2 rounded-2xl shadow-2xl -rotate-12 hidden md:block">
                <img src={FLAVORS[1].image} className="w-full h-full object-cover rounded-xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto pb-20">
        
        {/* Categories Menu */}
        <section className="px-4 md:px-12 py-12">
          <div className="flex flex-col items-center mb-10">
            <h3 className="font-serif text-3xl font-bold text-brand-cocoa mb-2">Menu</h3>
            <p className="text-cocoa/50 text-xs font-bold uppercase tracking-[0.3em]">O que você deseja hoje?</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              // Map icons to actual components
              const IconComp = { Sparkles, Heart, Flame, CheckCircle2, Plus }[cat.icon] || Sparkles;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group flex flex-col items-center gap-3 transition-all ${isActive ? 'scale-110' : 'hover:scale-105'}`}
                >
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all shadow-sm ${isActive ? 'bg-brand-red text-white shadow-xl rotate-3' : 'bg-white text-cocoa/40 border border-cocoa/5 hover:border-brand-red/20 hover:text-brand-red'}`}>
                    <IconComp className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${isActive ? 'text-brand-red' : 'text-cocoa/40'}`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Bestsellers Header */}
        {(selectedCategory === 'all' || selectedCategory === 'Classic') && (
          <section className="px-4 md:px-12 py-12">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-serif text-3xl font-bold text-brand-cocoa mb-4">A Doçura que faltava no seu dia</h3>
              <p className="text-cocoa/50 font-medium">Não é apenas uma trufa, é um momento de prazer.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {bestSellers.slice(0, 4).map((flavor, index) => {
                const itemInCart = cart.find(i => i.id === flavor.id);
                return (
                  <motion.div
                    key={`best-${flavor.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="bg-white rounded-[2rem] p-4 border border-cocoa/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all relative overflow-hidden">
                      {/* Tags */}
                      <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                        {flavor.isBestSeller && (
                          <div className="bg-brand-red text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg">
                            Mais Vendida
                          </div>
                        )}
                        <button 
                          onClick={() => toggleFavorite(flavor.id)}
                          className={`w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-colors ${favorites.includes(flavor.id) ? 'text-brand-red' : 'text-cocoa/20 hover:text-brand-red'}`}
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(flavor.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <div className="aspect-square rounded-2xl overflow-hidden bg-beige/10 mb-5 relative">
                        <img 
                          src={flavor.image} 
                          alt={flavor.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        {itemInCart && (
                          <div className="absolute inset-0 bg-brand-red/10 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="bg-brand-red text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-4 border-white shadow-xl">
                              {itemInCart.quantity}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`w-3 h-3 ${star <= Math.floor(flavor.rating) ? 'fill-brand-gold text-brand-gold' : 'text-cocoa/10'}`} />
                          ))}
                          <span className="text-[10px] text-cocoa/30 font-bold ml-1">{flavor.reviews}</span>
                        </div>
                        
                        <div>
                          <h4 className="font-serif text-lg font-bold text-brand-cocoa leading-none mb-1">{flavor.name}</h4>
                          <p className="text-[10px] text-cocoa/40 uppercase tracking-widest font-black">{flavor.category} • Trufa Nobre</p>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p className="font-black text-xl text-brand-red leading-none">
                            R$ {flavor.price.toFixed(2)}
                          </p>
                          <button 
                            onClick={() => addToCart(flavor)}
                            className="bg-cocoa text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-brand-red transition-all active:scale-90 shadow-lg"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Main Grid Section */}
        <section id="menu" className="px-4 md:px-12 py-12 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-brand-red font-black uppercase tracking-[0.3em] text-[10px] mb-3">Cardápio Completo</p>
              <h3 className="font-serif text-3xl md:text-5xl font-black text-brand-cocoa">Encontre seu sabor</h3>
            </div>
            {/* Search filter inline */}
            {searchQuery && (
              <div className="bg-brand-red/5 px-4 py-2 rounded-full flex items-center gap-2">
                <span className="text-xs font-bold text-brand-red">Resultados para: "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-brand-red/10 rounded-full transition-colors"><X className="w-3 h-3 text-brand-red" /></button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {filteredFlavors.map((flavor, index) => {
              const itemInCart = cart.find(i => i.id === flavor.id);
              return (
                <motion.div
                  key={flavor.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex flex-col"
                >
                  <div className="bg-white rounded-3xl p-3 border border-cocoa/5 shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-beige/5 mb-4 relative">
                      <img src={flavor.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      
                      <button 
                        onClick={() => toggleFavorite(flavor.id)}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg transition-all ${favorites.includes(flavor.id) ? 'text-brand-red' : 'text-cocoa/20 hover:text-brand-red'}`}
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(flavor.id) ? 'fill-current' : ''}`} />
                      </button>

                      <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        <button 
                          onClick={() => addToCart(flavor)}
                          className="w-full bg-brand-red text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-red/30"
                        >
                          Rápido +1
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col px-1 pb-1">
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3 h-3 fill-brand-gold text-brand-gold" />
                        <span className="text-[10px] font-bold text-cocoa/40">{flavor.rating} ({flavor.reviews})</span>
                      </div>
                      <h5 className="font-serif text-lg font-bold text-brand-cocoa leading-tight mb-1">{flavor.name}</h5>
                      <p className="text-[11px] text-cocoa/50 line-clamp-2 mb-4 leading-relaxed">{flavor.description}</p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <span className="font-black text-brand-red text-lg">R$ {flavor.price.toFixed(2)}</span>
                        
                        <div className="flex items-center gap-2">
                          {itemInCart ? (
                            <div className="flex items-center gap-3 bg-brand-red/5 px-2 py-1 rounded-xl">
                              <button onClick={() => removeFromCart(flavor.id)} className="p-1 hover:bg-brand-red/10 rounded-lg text-brand-red"><Minus className="w-4 h-4" /></button>
                              <span className="text-sm font-black text-brand-red">{itemInCart.quantity}</span>
                              <button onClick={() => addToCart(flavor)} className="p-1 hover:bg-brand-red/10 rounded-lg text-brand-red"><Plus className="w-4 h-4" /></button>
                            </div>
                          ) : (
                          <button 
                            onClick={() => addToCart(flavor)}
                            className="bg-cocoa text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-red transition-all"
                          >
                            Adicionar
                          </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredFlavors.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-cocoa/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-cocoa/20" />
              </div>
              <h4 className="text-xl font-bold text-brand-cocoa mb-2">Nenhum sabor encontrado</h4>
              <p className="text-cocoa/40 max-w-xs mx-auto">Tente ajustar sua busca ou mudar de categoria.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="mt-6 text-brand-red font-black uppercase tracking-widest text-[10px] underline decoration-brand-red/30 underline-offset-4"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </section>

        {/* Promise Section */}
        <section className="px-4 md:px-12 py-12">
          <div className="bg-white rounded-[3rem] p-10 md:p-20 border border-cocoa/5 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             
             <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
               <div className="space-y-8">
                 <div>
                   <h3 className="font-serif text-3xl md:text-5xl font-black text-brand-cocoa mb-4">Nossa Promessa</h3>
                   <p className="text-cocoa/50 font-medium">Não é segredo - apenas paixão pelo que fazemos!</p>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                   {[
                     { icon: Clock, title: "Entrega Rápida", sub: "Chega fresquinho" },
                     { icon: Sparkles, title: "Sabores Únicos", sub: "Receitas exclusivas" },
                     { icon: CheckCircle2, title: "Qualidade Premium", sub: "Chocolate Nobre" },
                     { icon: Flame, title: "Feito à Mão", sub: "Cada trufa é única" }
                   ].map((item, i) => (
                     <div key={i} className="flex flex-col gap-3">
                       <div className="w-14 h-14 bg-brand-red/5 rounded-2xl flex items-center justify-center text-brand-red">
                         <item.icon className="w-7 h-7" />
                       </div>
                       <div>
                         <h5 className="font-bold text-brand-cocoa">{item.title}</h5>
                         <p className="text-[10px] text-cocoa/40 uppercase font-black tracking-widest">{item.sub}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 {[
                   "https://images.unsplash.com/photo-1541783245831-57d690705267?auto=format&fit=crop&q=80&w=400",
                   "https://images.unsplash.com/photo-1623157523133-72216441ea65?auto=format&fit=crop&q=80&w=400",
                   "https://images.unsplash.com/photo-1548332062-8e7c10b27e69?auto=format&fit=crop&q=80&w=400",
                   "https://images.unsplash.com/photo-1582294157159-994334336c84?auto=format&fit=crop&q=80&w=400"
                 ].map((img, i) => (
                   <motion.div
                    key={i}
                    whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                    className={`aspect-square rounded-2xl overflow-hidden shadow-xl ${i % 2 === 0 ? 'mt-4' : '-mt-4'}`}
                   >
                     <img src={img} className="w-full h-full object-cover" />
                   </motion.div>
                 ))}
               </div>
             </div>
          </div>
        </section>

        {/* O Bilhete Mágico - Promoção Especial */}
        <section className="px-4 md:px-12 py-12">
          <div className="bg-brand-red rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
            
            <div className="relative z-10 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
                <Zap className="w-4 h-4 text-brand-gold animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Promoção exclusiva</span>
              </div>
              <h3 className="font-serif text-3xl md:text-5xl font-black text-white mb-6 leading-tight">O BILHETE MÁGICO</h3>
              <p className="text-white/70 text-lg mb-10">
                Adicione 3 ou mais trufas ao seu carrinho e ganhe a chance de encontrar o bilhete dourado valendo R$ 100 em produtos!
              </p>
              <button 
                onClick={() => {
                  const el = document.getElementById('menu');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-brand-gold text-brand-cocoa px-10 py-5 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-black/20"
              >
                Tentar a Sorte
              </button>
            </div>

            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 6 }}
                className="bg-brand-gold p-8 md:p-12 rounded-[2rem] shadow-[0_20px_50px_rgba(212,175,55,0.4)] relative"
              >
                <div className="absolute inset-2 border-2 border-dashed border-brand-cocoa/20 rounded-[1.5rem]" />
                <Gift className="w-20 h-20 md:w-32 md:h-32 text-brand-cocoa opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="relative text-center">
                  <p className="font-black text-brand-cocoa text-4xl mb-1">R$ 100</p>
                  <p className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-cocoa/60">Cartão Presente</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Catchy Phrase Section */}

        {/* Instagram/Social Section */}
        <section className="px-4 md:px-12 py-12">
            <div className="flex flex-col items-center text-center mb-12">
              <p className="text-brand-red font-black uppercase tracking-[0.3em] text-[10px] mb-3">#TrufinhasDoThiago</p>
              <h3 className="font-serif text-3xl md:text-4xl font-black text-brand-cocoa mb-4">Siga nossa doçura nas redes</h3>
              <div className="flex items-center gap-4">
                <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-brand-red hover:text-white transition-all"><Instagram className="w-6 h-6" /></button>
                <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-brand-red hover:text-white transition-all"><Facebook className="w-6 h-6" /></button>
                <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-brand-red hover:text-white transition-all"><Twitter className="w-6 h-6" /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                "https://images.unsplash.com/photo-1541783245831-57d690705267",
                "https://images.unsplash.com/photo-1548332062-8e7c10b27e69",
                "https://images.unsplash.com/photo-1594910413528-9430d8bbec9d",
                "https://images.unsplash.com/photo-1553530666-ca0c452f4842",
                "https://images.unsplash.com/photo-1582294157159-994334336c84",
                "https://images.unsplash.com/photo-1581636625402-29b2a704ef13"
              ].map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-md group relative">
                  <img src={`${img}?auto=format&fit=crop&q=80&w=300`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-brand-red/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Instagram className="text-white w-8 h-8" />
                  </div>
                </div>
              ))}
            </div>
        </section>
      </div>

      {/* Footer Custom Section */}
      <footer className="bg-cocoa text-white pt-20 pb-10 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-red text-white flex items-center justify-center rounded-xl font-serif text-2xl font-black">T</div>
                <h2 className="font-serif text-2xl font-black">Thiago</h2>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                As melhores trufas artesanais feitas com chocolate nobre e recheios premium que derretem na boca.
              </p>
            </div>
            
            <div>
              <h5 className="font-bold uppercase tracking-widest text-xs text-brand-gold mb-6">Conheça</h5>
              <ul className="space-y-4 text-sm text-white/60">
                {["Início", "Nossa História", "Sabores", "Combos", "Suporte"].map(link => (
                  <li key={link}><a href="#" className="hover:text-brand-gold transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-bold uppercase tracking-widest text-xs text-brand-gold mb-6">Ajuda</h5>
              <ul className="space-y-4 text-sm text-white/60">
                {["Privacidade", "Termos de Uso", "FAQs", "Prazos", "Contato"].map(link => (
                  <li key={link}><a href="#" className="hover:text-brand-gold transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-bold uppercase tracking-widest text-xs text-brand-gold mb-6">Novidades</h5>
              <p className="text-sm text-white/40 mb-6">Receba ofertas exclusivas e novos sabores toda semana.</p>
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 focus-within:border-brand-gold transition-colors">
                <input type="email" placeholder="Seu e-mail" className="bg-transparent flex-1 px-4 py-2 text-sm outline-none" />
                <button className="bg-brand-red text-white px-6 py-2 rounded-xl text-xs font-black uppercase">Ok</button>
              </div>
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            <p>© 2024 Trufinhas do Thiago • Todos os direitos reservados</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> São Paulo, SP</span>
              <span className="flex items-center gap-2"><Phone className="w-3 h-3" /> (11) 93401-1936</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-cocoa/40 backdrop-blur-sm z-[100]"
            />
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-cream z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-cocoa/5 flex justify-between items-center bg-white">
                <h2 className="font-display text-2xl font-bold text-cocoa">Seu Carrinho</h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-beige rounded-full transition-colors"
                ><X className="w-6 h-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Favorites Section in Cart */}
                {favorites.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gold">
                      <Heart className="w-3 h-3 fill-gold" />
                      Seus Favoritos
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                      {FLAVORS.filter(f => favorites.includes(f.id)).map(fav => (
                        <button
                          key={fav.id}
                          onClick={() => addToCart(fav)}
                          className="flex-shrink-0 group relative w-20 text-center"
                        >
                          <div className="aspect-square rounded-full overflow-hidden border-2 border-gold/20 mb-1 group-hover:border-gold transition-colors relative">
                            <img src={fav.image} alt={fav.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/10 transition-colors" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="bg-cocoa/60 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-[2px] shadow-sm ring-2 ring-white/10 group-hover:bg-cocoa/90 group-hover:scale-110 transition-all">
                                +1
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="h-px bg-cocoa/5 w-full" />
                  </div>
                )}

                {cart.length > 0 ? (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="relative">
                        <img src={item.image} className="w-20 h-20 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform" />
                        <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-bold text-cocoa">{item.name}</h4>
                          <span className="text-[8px] bg-brand-red/5 text-brand-red px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                           <Star className="w-2.5 h-2.5 fill-brand-gold text-brand-gold" />
                           <span className="text-[9px] font-bold text-cocoa/40">{item.rating}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-beige/30 px-3 py-1.5 rounded-xl border border-cocoa/5 shadow-inner">
                            <button onClick={() => removeFromCart(item.id)} className="hover:text-brand-red transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="text-xs font-black text-cocoa">{item.quantity}</span>
                            <button onClick={() => addToCart(item)} className="hover:text-brand-red transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                          <p className="font-black text-brand-red">R$ {(item.quantity * 4).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20">
                    <ShoppingBag className="w-16 h-16 text-cocoa/10 mb-4" />
                    <p className="text-cocoa/60 font-medium">Seu carrinho está vazio</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 text-gold font-bold hover:underline"
                    >Ver sabores</button>
                  </div>
                )}

                {/* Promo Box in Cart */}
                {totalQuantity > 0 && (
                  <div className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden ${pricing.promoApplied ? 'bg-brand-red text-white border-brand-red shadow-xl shadow-brand-red/20' : 'bg-white border-cocoa/5 border-dashed shadow-sm'}`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                         {pricing.promoApplied ? (
                           <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">✨</div>
                         ) : (
                           <div className="w-8 h-8 bg-brand-red/5 text-brand-red rounded-full flex items-center justify-center animate-bounce"><Zap className="w-4 h-4" /></div>
                         )}
                         <p className="text-sm font-black uppercase tracking-widest">
                          {pricing.promoApplied ? 'PROMOÇÃO ATIVADA' : 'OFERTA DISPONÍVEL'}
                         </p>
                      </div>
                      <p className={`text-xs leading-relaxed ${pricing.promoApplied ? 'text-white/80' : 'text-cocoa/50 font-medium'}`}>
                        {pricing.promoApplied 
                          ? `Incrível! Sua economia agora é de R$ ${pricing.savings.toFixed(2)}. Leve mais ${pricing.nextPromoIn} trufas para otimizar ainda mais seu pedido!`
                          : `Complete seu combo! Faltam apenas ${pricing.nextPromoIn} trufas para você pagar apenas R$ 10,00 no conjunto de 3 unidades.`
                        }
                      </p>
                      {!pricing.promoApplied && (
                        <div className="mt-4 h-1.5 bg-brand-red/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(totalQuantity % 3) * 33.33}%` }}
                            className="h-full bg-brand-red"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-white border-t border-cocoa/5 space-y-6 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
                <div className="space-y-3">
                  <div className="flex justify-between text-cocoa/40 text-[10px] font-black uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>R$ {(totalQuantity * 4).toFixed(2)}</span>
                  </div>
                  {pricing.promoApplied && (
                    <div className="flex justify-between text-brand-red font-black text-[10px] uppercase tracking-widest">
                      <span>Desconto Especial</span>
                      <span className="bg-brand-red text-white px-2 py-0.5 rounded-md">- R$ {pricing.savings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-3xl font-serif font-black text-brand-cocoa pt-2">
                    <span className="text-xl">Total</span>
                    <span>R$ {pricing.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    disabled={cart.length === 0}
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full bg-brand-red text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:bg-brand-red/90 transition-all disabled:opacity-30 disabled:grayscale group shadow-xl shadow-brand-red/20 active:scale-95"
                  >
                    Confirmar Pedido <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="w-full py-4 text-cocoa/40 text-[10px] font-black uppercase tracking-widest hover:text-cocoa transition-colors"
                  >
                    Continuar Comprando
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Selection View (Modal-like) */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-cocoa/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl md:rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {!orderSent ? (
                <div className="p-6 md:p-12">
                  <div className="text-center mb-6 md:mb-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <ShoppingBag className="text-gold w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <h2 className="font-serif text-2xl md:text-4xl font-bold text-cocoa mb-2 tracking-tight">Finalizar Pedido</h2>
                    <p className="text-cocoa/50 text-xs md:text-base">Preencha seus dados para concluir pelo WhatsApp.</p>
                  </div>

                  <form onSubmit={handleSubmitOrder} className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cocoa/30 ml-1">Seu Nome</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Ex: Maria"
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          className="w-full bg-cream border border-cocoa/10 px-4 md:px-5 py-3.5 md:py-4 rounded-2xl focus:outline-none focus:ring-1 ring-gold shadow-sm text-sm"
                        />
                      </div>
                      <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cocoa/30 ml-1">WhatsApp</label>
                        <input 
                          required
                          type="tel" 
                          placeholder="(00) 00000-0000"
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          className="w-full bg-cream border border-cocoa/10 px-4 md:px-5 py-3.5 md:py-4 rounded-2xl focus:outline-none focus:ring-1 ring-gold shadow-sm text-sm"
                        />
                      </div>
                    </div>

                    <div className="bg-beige/20 rounded-2xl p-4 md:p-6 border border-cocoa/5">
                      <div className="space-y-2 md:space-y-3">
                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="text-cocoa/40 font-bold uppercase">Itens</span>
                          <span className="font-black text-cocoa">{totalQuantity}</span>
                        </div>
                        {pricing.promoApplied && (
                          <div className="flex justify-between text-xs md:text-sm text-green-600">
                            <span className="font-bold uppercase">Economia</span>
                            <span className="font-black">- R$ {pricing.savings.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="pt-2 md:pt-3 border-t border-cocoa/5 flex justify-between items-center text-lg md:text-xl font-black">
                          <span className="text-cocoa font-serif">Total</span>
                          <span className="text-cocoa">R$ {pricing.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-cocoa text-white py-4 md:py-5 rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-cocoa-light shadow-xl shadow-cocoa/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? 'Enviando...' : 'Pedir pelo WhatsApp'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 1 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </motion.div>
                  <h2 className="font-display text-4xl font-bold text-cocoa mb-4">Pedido Enviado!</h2>
                  <p className="text-cocoa/60 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
                    Olá <span className="font-bold text-cocoa">{customerName}</span>! Recebemos seu pedido com sucesso. Em breve entraremos em contato via WhatsApp.
                  </p>
                  <button 
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setIsCartOpen(false);
                      setOrderSent(false);
                    }}
                    className="bg-cocoa text-white px-12 py-4 rounded-2xl font-bold hover:bg-cocoa-light transition-all shadow-lg"
                  >Voltar à Loja</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Line Decorative */}
      <footer className="h-4 bg-gold w-full"></footer>

      {/* Floating CTA for Mobile if cart has items */}
      <AnimatePresence>
        {totalQuantity > 0 && !isCartOpen && !isCheckoutOpen && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 inset-x-4 z-40 md:hidden"
          >
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-gold text-white p-5 rounded-[2rem] shadow-2xl flex items-center justify-between font-display text-lg font-bold promo-glow active:scale-95 transition-all"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 animate-bounce" />
                <span>Ver Carrinho ({totalQuantity})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm font-normal line-through">R$ {(totalQuantity * 4).toFixed(2)}</span>
                <span>R$ {pricing.totalPrice.toFixed(2)}</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
