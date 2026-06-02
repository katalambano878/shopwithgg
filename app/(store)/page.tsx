'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useCMS } from '@/context/CMSContext';
import ProductCard, {
  type ColorVariant,
} from '@/components/ProductCard';
import { colorSwatchesFromProduct } from '@/lib/product-variants';
import AnimatedSection, { AnimatedGrid } from '@/components/AnimatedSection';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function Home() {
  usePageTitle('');
  const { getActiveBanners, config } = useCMS();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const heroSlides =
    config.hero.slides.length > 0
      ? config.hero.slides
      : [{ src: '/hero-1.png', position: '50% 40%' }];
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsResult, categoriesResult] = await Promise.all([
          supabase
            .from('products')
            .select('*, product_variants(*), product_images(*)')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(12),
          supabase
            .from('categories')
            .select('id, name, slug, parent_id, position, metadata')
            .eq('status', 'active')
            .contains('metadata', { featured: true })
            .is('parent_id', null)
            .order('position', { ascending: true })
            .limit(4),
        ]);

        if (productsResult.error) throw productsResult.error;
        setFeaturedProducts(productsResult.data || []);

        if (categoriesResult.error) throw categoriesResult.error;
        setFeaturedCategories(categoriesResult.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const heroBadge = config.hero.badge;
  const heroHeadline = config.hero.headline;
  const heroSubheadline = config.hero.subheadline;
  const heroPrimaryText = config.hero.primaryButtonText;
  const heroPrimaryLink = config.hero.primaryButtonLink;
  const heroSecondaryText = config.hero.secondaryButtonText;
  const heroSecondaryLink = config.hero.secondaryButtonLink;
  const heroOverlay = Math.min(80, Math.max(0, config.hero.overlayOpacity)) / 100;

  const activeBanners = getActiveBanners('top');

  const renderBanners = () => {
    if (activeBanners.length === 0) return null;
    return (
      <div className="bg-brand-brown text-white py-2 overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {activeBanners.concat(activeBanners).map((banner, index) => (
            <span
              key={index}
              className="mx-8 text-sm font-medium tracking-wide flex items-center"
            >
              {banner.title}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const popularProducts = featuredProducts.slice(0, 6);
  const latestProducts = featuredProducts;
  const defaultCategoryStyles = [
    {
      chip: 'Everyday comfort',
      icon: 'ri-shirt-line',
      color: 'from-brand-carton to-brand-brown',
    },
    {
      chip: 'Premium looks',
      icon: 'ri-vip-crown-line',
      color: 'from-[#AB9462] to-[#2C1D00]',
    },
    {
      chip: 'Event ready',
      icon: 'ri-t-shirt-air-line',
      color: 'from-brand-brown to-brand-gold',
    },
    {
      chip: 'Just landed',
      icon: 'ri-sparkling-line',
      color: 'from-[#2C1D00]/70 to-[#2C1D00]',
    },
  ];
  const fallbackCategories = [
    { name: 'Casual Wear', slug: 'casual-wear', metadata: {} },
    { name: 'Luxury Wear', slug: 'luxury-wear', metadata: {} },
    { name: 'Home & Living', slug: 'home-living', metadata: {} },
    { name: 'New Arrivals', slug: 'new-arrivals', metadata: {} },
  ];
  const vibeCategories = (featuredCategories.length > 0
    ? featuredCategories
    : fallbackCategories
  )
    .slice(0, 4)
    .map((category, index) => {
      const style = defaultCategoryStyles[index % defaultCategoryStyles.length];
      return {
        ...category,
        chip: category.metadata?.chip || style.chip,
        icon: category.metadata?.icon || style.icon,
        color: category.metadata?.color || style.color,
      };
    });

  return (
    <main className="flex-col items-center justify-between min-h-screen bg-white">
      {renderBanners()}

      <section className="relative w-full min-h-[92vh] sm:min-h-[83vmin] md:min-h-[93vmin] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.src}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentHeroSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={slide.src}
                alt=""
                fill
                priority={index === 0}
                quality={100}
                unoptimized
                sizes="100vw"
                className="object-cover"
                style={{
                  objectPosition: slide.position,
                  filter: 'contrast(1.06) saturate(1.05)',
                }}
              />
            </div>
          ))}
        </div>
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: heroOverlay }}
          aria-hidden="true"
        />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
          {heroBadge && (
            <span className="inline-flex items-center rounded-full bg-white/15 border border-white/25 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/95 mb-4 sm:mb-5">
              {heroBadge}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] font-extrabold leading-tight text-white drop-shadow-sm max-w-3xl mx-auto">
            {heroHeadline}
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-white/90 max-w-xl mx-auto px-2 sm:px-0">
            {heroSubheadline}
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href={heroPrimaryLink}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-brand-brown px-6 py-2.5 sm:px-9 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg hover:bg-[#3D2A00] transition-colors"
            >
              {heroPrimaryText}
              <i className="ri-arrow-right-up-line ml-2 text-base" />
            </Link>
            {heroSecondaryText && (
              <Link
                href={heroSecondaryLink}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border-2 border-white/50 px-6 py-2.5 sm:px-9 sm:py-3 text-sm sm:text-base font-semibold text-white hover:bg-white hover:text-gray-900 transition-colors"
              >
                {heroSecondaryText}
              </Link>
            )}
          </div>
          <div className="mt-5 flex items-center justify-center gap-2">
            {heroSlides.map((slide, index) => (
              <span
                key={`dot-${slide.src}`}
                className={`h-2 rounded-full transition-all ${
                  index === currentHeroSlide ? 'w-6 bg-white' : 'w-2 bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <AnimatedSection className="bg-white py-8 sm:py-10 border-b border-brand-carton/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-brand-carton uppercase">
                Shop by category
              </p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Find what you need
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center text-sm font-medium text-brand-brown hover:text-brand-carton"
            >
              Browse full catalogue
              <i className="ri-arrow-right-line ml-1" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {vibeCategories.map((item) => (
              <Link
                key={item.slug}
                href={`/shop?category=${encodeURIComponent(item.slug)}`}
                className="group relative overflow-hidden rounded-2xl border border-brand-carton/10 bg-brand-cream/40 p-4 hover:border-brand-carton transition-colors"
              >
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${item.color} opacity-70 blur-2xl group-hover:opacity-100 transition-opacity`}
                />
                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-brand-brown mb-2">
                      {item.chip}
                    </span>
                    <p className="text-sm font-semibold text-gray-900">
                      {item.name}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-brand-brown group-hover:translate-y-[-2px] group-hover:shadow-md transition-all">
                    <i className={`${item.icon} text-lg`} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-brand-carton uppercase">
                Trending now
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-gray-900">
                Products customers love most
              </h2>
            </div>
            <Link
              href="/shop?sort=bestsellers"
              className="inline-flex items-center text-sm font-medium text-gray-800 hover:text-brand-brown"
            >
              View bestselling products
              <i className="ri-arrow-right-line ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-2xl mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <AnimatedGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {popularProducts.map((product) => {
                const variants = product.product_variants || [];
                const hasVariants = variants.length > 0;
                const minVariantPrice = hasVariants
                  ? Math.min(
                      ...variants.map((v: any) => v.price || product.price)
                    )
                  : undefined;
                const totalVariantStock = hasVariants
                  ? variants.reduce(
                      (sum: number, v: any) => sum + (v.quantity || 0),
                      0
                    )
                  : 0;
                const effectiveStock = hasVariants
                  ? totalVariantStock
                  : product.quantity;

                const colorVariants: ColorVariant[] = colorSwatchesFromProduct(product);

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.compare_at_price}
                    image={
                      product.product_images?.[0]?.url ||
                      'https://via.placeholder.com/400x500'
                    }
                    rating={product.rating_avg || 5}
                    reviewCount={product.review_count || 0}
                    badge={product.featured ? 'Featured' : 'Trending'}
                    inStock={effectiveStock > 0}
                    maxStock={effectiveStock || 50}
                    moq={product.moq || 1}
                    hasVariants={hasVariants}
                    minVariantPrice={minVariantPrice}
                    colorVariants={colorVariants}
                  />
                );
              })}
            </AnimatedGrid>
          )}
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-brand-cream/55 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-brand-brown uppercase">
                Just landed
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-brand-brown">
                Fresh arrivals & restocks
              </h2>
            </div>
            <p className="text-sm text-brand-brown/85 max-w-md">
              Discover newly sourced products for personal use, resale,
              or business growth — all at affordable prices.
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex gap-4 animate-just-landed-scroll pb-2 [--card-width:240px] hover:[animation-play-state:paused]">
              {[...(latestProducts.length ? latestProducts : popularProducts), ...(latestProducts.length ? latestProducts : popularProducts)].map(
                (product, index) => (
                  <div
                    key={`${product.id}-${index}`}
                    className="min-w-[180px] sm:min-w-[220px] max-w-[260px] w-[var(--card-width)] flex-shrink-0 rounded-xl sm:rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden bg-brand-carton/10">
                      <Image
                        src={
                          product.product_images?.[0]?.url ||
                          'https://via.placeholder.com/400x500'
                        }
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-xs uppercase tracking-wide text-brand-carton mb-1">
                        New drop
                      </p>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {product.name}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">
                          ₦{Number(product.price || 0).toFixed(2)}
                        </span>
                        <Link
                          href={`/product/${product.slug}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-carton text-white hover:bg-brand-brown text-sm"
                        >
                          <i className="ri-arrow-right-line" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <p className="text-xs font-semibold tracking-[0.25em] text-brand-carton uppercase">
              Why customers stay with us
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">
              Your trusted sourcing partner
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600">
              We simplify the sourcing process — handling product selection, supplier coordination
              and logistics so you can shop confidently without stress or inflated costs.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
            {[
              {
                icon: 'ri-shield-check-line',
                title: 'Quality assured',
                body: 'Every product is sourced and inspected before it reaches you.',
              },
              {
                icon: 'ri-customer-service-2-line',
                title: 'Expert support',
                body: 'Product selection help, supplier coordination, and personalized guidance.',
              },
              {
                icon: 'ri-money-dollar-circle-line',
                title: 'Transparent pricing',
                body: 'Direct-from-supplier pricing — no inflated costs.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="relative overflow-hidden rounded-2xl border border-brand-carton/10 bg-brand-cream/40 p-6"
              >
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-carton/25 blur-2xl pointer-events-none" />
                <div className="relative">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-carton text-white shadow-md">
                    <i className={`${item.icon} text-xl`} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <section className="pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#AB9462] via-[#8A7750] to-[#2C1D00] text-white border border-[#AB9462]/30 shadow-[0_16px_45px_rgba(171,148,98,0.2)] flex flex-col md:flex-row items-center md:items-stretch">
            <div className="relative w-full md:w-3/5 px-5 sm:px-8 py-8 sm:py-10 flex flex-col justify-center space-y-3 text-center md:text-left">
              <span className="inline-flex items-center text-xs font-semibold tracking-[0.25em] uppercase text-white/80">
                Start sourcing with ShopWithGG
              </span>
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold">
                Quality and functionality, without breaking the bank.
              </h3>
              <p className="text-sm sm:text-base text-white/75 max-w-md mx-auto md:mx-0">
                Whether it&apos;s for personal use, resale, or business growth — we handle
                sourcing, logistics, and delivery so you don&apos;t have to.
              </p>
              <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                <Link
                  href="/shop"
                  className="inline-flex items-center rounded-full bg-white text-[#2C1D00] px-8 py-3 text-sm font-semibold shadow-lg hover:bg-[#F3F3F3] transition-colors"
                >
                  Start shopping
                  <i className="ri-arrow-right-up-line ml-2" />
                </Link>
                <Link
                  href="/account"
                  className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  Create an account
                </Link>
              </div>
            </div>
            <div className="relative w-full md:w-2/5 min-h-[14rem] md:min-h-0">
              <Image
                src="/hero-1.png"
                alt="ShopWithGG products"
                fill
                className="object-cover md:rounded-r-2xl sm:md:rounded-r-3xl rounded-b-2xl sm:rounded-b-3xl md:rounded-bl-none"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
