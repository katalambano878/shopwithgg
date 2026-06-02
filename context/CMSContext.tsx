'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    DEFAULT_SITE_CONFIG,
    SiteConfig,
    configToSettings,
    normalizeSiteConfig,
    themeVarMap,
} from '@/lib/site-config';

interface SiteSettings {
    site_name: string;
    site_tagline: string;
    site_logo: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    social_facebook: string;
    social_instagram: string;
    social_twitter: string;
    primary_color: string;
    secondary_color: string;
    currency: string;
    currency_symbol: string;
    [key: string]: string;
}

interface CMSContent {
    id: string;
    section: string;
    block_key: string;
    title: string | null;
    subtitle: string | null;
    content: string | null;
    image_url: string | null;
    button_text: string | null;
    button_url: string | null;
    metadata: Record<string, any>;
    is_active: boolean;
}

interface Banner {
    id: string;
    name: string;
    type: string;
    title: string | null;
    subtitle: string | null;
    image_url: string | null;
    background_color: string;
    text_color: string;
    button_text: string | null;
    button_url: string | null;
    is_active: boolean;
    position: string;
    start_date: string | null;
    end_date: string | null;
}

interface CMSContextType {
    settings: SiteSettings;
    config: SiteConfig;
    content: CMSContent[];
    banners: Banner[];
    loading: boolean;
    getContent: (section: string, blockKey: string) => CMSContent | undefined;
    getSetting: (key: string) => string;
    getActiveBanners: (position?: string) => Banner[];
    refreshCMS: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
    site_name: 'ShopWithGG',
    site_tagline: 'Your trusted sourcing and procurement partner.',
    site_logo: '/shopwithgg-logo.png',
    contact_email: 'hello@shopwithgg.com',
    contact_phone: '08071363568',
    contact_address: 'Lagos, Nigeria',
    social_facebook: '',
    social_instagram: '_shopwithgg_',
    social_twitter: '',
    primary_color: '#2C1D00',
    secondary_color: '#AB9462',
    currency: 'NGN',
    currency_symbol: '₦',
};

const CMSContext = createContext<CMSContextType>({
    settings: defaultSettings,
    config: DEFAULT_SITE_CONFIG,
    content: [],
    banners: [],
    loading: true,
    getContent: () => undefined,
    getSetting: () => '',
    getActiveBanners: () => [],
    refreshCMS: async () => { },
});

export function CMSProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [content] = useState<CMSContent[]>([]);
    const [banners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    // Pulls the live branding/theme/hero config the admin manages under
    // Settings. Colours + fonts are already applied at SSR (root layout); this
    // hydrates hero copy, site name, logo, etc. for client components.
    const fetchCMSData = async () => {
        try {
            const res = await fetch('/api/site-config', { cache: 'no-store' });
            if (!res.ok) return;
            const data = await res.json();
            const merged = normalizeSiteConfig(data);
            setConfig(merged);
            setSettings((prev) => ({ ...prev, ...configToSettings(merged) }));
            // Apply the live theme at runtime so colour/font changes take effect
            // immediately, independent of any static/CDN caching of the SSR markup.
            if (typeof document !== 'undefined') {
                const root = document.documentElement;
                Object.entries(themeVarMap(merged)).forEach(([k, v]) => root.style.setProperty(k, v));
            }
        } catch {
            // keep defaults
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCMSData();
    }, []);

    const getContent = (section: string, blockKey: string): CMSContent | undefined => {
        return content.find(c => c.section === section && c.block_key === blockKey);
    };

    const getSetting = (key: string): string => {
        return settings[key] || defaultSettings[key] || '';
    };

    const getActiveBanners = (position?: string): Banner[] => {
        const now = new Date();
        return banners.filter(b => {
            if (position && b.position !== position) return false;
            if (b.start_date && new Date(b.start_date) > now) return false;
            if (b.end_date && new Date(b.end_date) < now) return false;
            return b.is_active;
        });
    };

    return (
        <CMSContext.Provider
            value={{
                settings,
                config,
                content,
                banners,
                loading,
                getContent,
                getSetting,
                getActiveBanners,
                refreshCMS: fetchCMSData,
            }}
        >
            {children}
        </CMSContext.Provider>
    );
}

export function useCMS() {
    const context = useContext(CMSContext);
    if (!context) {
        throw new Error('useCMS must be used within a CMSProvider');
    }
    return context;
}

export default CMSContext;
