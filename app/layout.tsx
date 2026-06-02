import type { Metadata } from "next";
import Script from "next/script";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { fontVariables } from "@/lib/fonts";
import { buildThemeCss } from "@/lib/site-config";
import { getSiteConfig } from "@/lib/site-config.server";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shopwithgg.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "ShopWithGG",
  category: "shopping",
  referrer: "origin-when-cross-origin",
  title: {
    default: "ShopWithGG | Smart Sourcing & Procurement Partner",
    template: "%s | ShopWithGG",
  },
  description:
    "ShopWithGG is your trusted global sourcing and procurement partner. We leverage a network of vetted international suppliers to deliver premium products at direct-from-supplier pricing.",
  keywords: [
    "ShopWithGG",
    "global sourcing",
    "procurement partner",
    "international suppliers",
    "premium products",
    "direct-from-supplier pricing",
    "smart sourcing",
    "preorder fulfillment",
    "quality products",
    "curated products",
  ],
  authors: [{ name: "ShopWithGG" }],
  creator: "ShopWithGG",
  publisher: "ShopWithGG",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    shortcut: [{ url: '/favicon.ico' }],
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', sizes: '64x64', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ShopWithGG",
  },
  formatDetection: {
    telephone: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    title: "ShopWithGG | Smart Sourcing & Procurement Partner",
    description:
      "Your trusted global sourcing and procurement partner. Carefully curated international products at direct-from-supplier pricing, delivered worldwide.",
    siteName: "ShopWithGG",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ShopWithGG logo and brand preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopWithGG | Smart Sourcing & Procurement Partner",
    description:
      "Your trusted global sourcing and procurement partner. Premium products from vetted international suppliers at direct-from-supplier pricing.",
    images: ["/twitter-image.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
// Google reCAPTCHA v3 Site Key
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteConfig = await getSiteConfig();
  const themeCss = buildThemeCss(siteConfig);
  const themeColor = siteConfig.theme.primary;

  return (
    <html lang="en">
      <head>
        {/* Runtime theme — injected at SSR so colours/fonts apply with no flash */}
        <style id="theme-vars" dangerouslySetInnerHTML={{ __html: themeCss }} />

        {/* PWA Meta Tags */}
        <meta name="theme-color" content={themeColor} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ShopWithGG" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content={themeColor} />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="384x384" href="/icons/icon-384x384.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />

        {/* Apple Splash Screens */}
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />

        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css"
          rel="stylesheet"
        />

        {/* Structured Data - Organization + Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${siteUrl}#organization`,
                  "name": "ShopWithGG",
                  "url": siteUrl,
                  "logo": `${siteUrl}/shopwithgg-logo.png`,
                  "image": `${siteUrl}/og-image.png`,
                  "description": "Your trusted global sourcing and procurement partner. Premium products from vetted international suppliers at direct-from-supplier pricing.",
                  "sameAs": ["https://www.instagram.com/_shopwithgg_", "https://wa.me/2348071363568", "https://chat.whatsapp.com/H2275EJgtYtDVahPIlHGJm"],
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer service",
                    "telephone": "+2348071363568",
                    "availableLanguage": "English"
                  }
                },
                {
                  "@type": "Store",
                  "@id": `${siteUrl}#store`,
                  "name": "ShopWithGG",
                  "url": siteUrl,
                  "image": `${siteUrl}/og-image.png`,
                  "telephone": "+2348071363568",
                  "priceRange": "$$",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Lagos",
                    "addressCountry": "NG"
                  },
                  "areaServed": "Nigeria"
                }
              ]
            })
          }}
        />
      </head>

      {/* Google Analytics */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* Google reCAPTCHA v3 */}
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      )}

      <body className={`antialiased overflow-x-hidden pwa-body ${fontVariables} font-sans`} style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:px-6 focus:py-3 focus:bg-gray-900 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg"
        >
          Skip to main content
        </a>
        <CartProvider>
          <WishlistProvider>
            <div id="main-content">
              {children}
            </div>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
