'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
    DEFAULT_SITE_CONFIG,
    DEFAULT_THEME,
    DEFAULT_TYPOGRAPHY,
    FONT_OPTIONS,
    SiteConfig,
    fontStack,
    normalizeSiteConfig,
} from '@/lib/site-config';

type TabId = 'branding' | 'colors' | 'typography' | 'hero' | 'social';

const TABS: { id: TabId; label: string; icon: string }[] = [
    { id: 'branding', label: 'Branding', icon: 'ri-store-2-line' },
    { id: 'colors', label: 'Colors', icon: 'ri-palette-line' },
    { id: 'typography', label: 'Typography', icon: 'ri-font-size-2' },
    { id: 'hero', label: 'Hero', icon: 'ri-image-line' },
    { id: 'social', label: 'Social', icon: 'ri-share-line' },
];

const POSITION_PRESETS = [
    { label: 'Center', value: '50% 50%' },
    { label: 'Top', value: '50% 20%' },
    { label: 'Upper', value: '50% 35%' },
    { label: 'Lower', value: '50% 65%' },
    { label: 'Bottom', value: '50% 80%' },
];

export default function SiteSettingsPage() {
    const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
    const [savedConfig, setSavedConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
    const [token, setToken] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState<TabId>('branding');
    const [uploading, setUploading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    // ── Load current config ──────────────────────────────────────────────
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const accessToken = session?.access_token || '';
                if (active) setToken(accessToken);
                const res = await fetch('/api/admin/settings', {
                    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
                    credentials: 'include',
                    cache: 'no-store',
                });
                if (!res.ok) throw new Error('Failed to load settings');
                const data = await res.json();
                const merged = normalizeSiteConfig(data);
                if (active) {
                    setConfig(merged);
                    setSavedConfig(merged);
                }
            } catch {
                if (active) setToast({ type: 'error', msg: 'Could not load settings. Showing defaults.' });
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(t);
    }, [toast]);

    const dirty = useMemo(
        () => JSON.stringify(config) !== JSON.stringify(savedConfig),
        [config, savedConfig],
    );

    // Warn before leaving with unsaved changes
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (dirty) { e.preventDefault(); e.returnValue = ''; }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [dirty]);

    // ── Patch helpers ────────────────────────────────────────────────────
    const patchBranding = (p: Partial<SiteConfig['branding']>) =>
        setConfig((c) => ({ ...c, branding: { ...c.branding, ...p } }));
    const patchTheme = (p: Partial<SiteConfig['theme']>) =>
        setConfig((c) => ({ ...c, theme: { ...c.theme, ...p } }));
    const patchTypography = (p: Partial<SiteConfig['typography']>) =>
        setConfig((c) => ({ ...c, typography: { ...c.typography, ...p } }));
    const patchHero = (p: Partial<SiteConfig['hero']>) =>
        setConfig((c) => ({ ...c, hero: { ...c.hero, ...p } }));
    const patchSocial = (p: Partial<SiteConfig['social']>) =>
        setConfig((c) => ({ ...c, social: { ...c.social, ...p } }));

    // ── Image upload ─────────────────────────────────────────────────────
    const uploadFile = useCallback(async (file: File): Promise<string | null> => {
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('bucket', 'site-media');
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                credentials: 'include',
                body: fd,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            return data.url as string;
        } catch (e: any) {
            setToast({ type: 'error', msg: e?.message || 'Upload failed' });
            return null;
        }
    }, [token]);

    const handleLogoUpload = async (file: File) => {
        setUploading('logo');
        const url = await uploadFile(file);
        if (url) patchBranding({ logoUrl: url });
        setUploading(null);
    };

    const handleAddSlide = async (file: File) => {
        setUploading('slide');
        const url = await uploadFile(file);
        if (url) {
            setConfig((c) => ({
                ...c,
                hero: { ...c.hero, slides: [...c.hero.slides, { src: url, position: '50% 50%' }].slice(0, 6) },
            }));
        }
        setUploading(null);
    };

    const updateSlide = (idx: number, p: Partial<SiteConfig['hero']['slides'][number]>) =>
        setConfig((c) => ({
            ...c,
            hero: { ...c.hero, slides: c.hero.slides.map((s, i) => (i === idx ? { ...s, ...p } : s)) },
        }));

    const removeSlide = (idx: number) =>
        setConfig((c) => ({ ...c, hero: { ...c.hero, slides: c.hero.slides.filter((_, i) => i !== idx) } }));

    const moveSlide = (idx: number, dir: -1 | 1) =>
        setConfig((c) => {
            const slides = [...c.hero.slides];
            const j = idx + dir;
            if (j < 0 || j >= slides.length) return c;
            [slides[idx], slides[j]] = [slides[j], slides[idx]];
            return { ...c, hero: { ...c.hero, slides } };
        });

    // ── Save ─────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: 'include',
                body: JSON.stringify(config),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to save');
            const saved = normalizeSiteConfig(data.config);
            setConfig(saved);
            setSavedConfig(saved);
            setToast({ type: 'success', msg: 'Settings saved. Refresh the storefront to see changes.' });
        } catch (e: any) {
            setToast({ type: 'error', msg: e?.message || 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32 text-gray-500">
                <i className="ri-loader-4-line animate-spin text-2xl mr-2" /> Loading site settings…
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-28">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Control your storefront branding, colors, fonts and hero — no code required.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {dirty && (
                        <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500" /> Unsaved changes
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving || !dirty}
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-save-line" />}
                        {saving ? 'Saving…' : 'Save changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Editor */}
                <div className="lg:col-span-3 space-y-5">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex-1 min-w-[90px] inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                <i className={t.icon} /> {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                        {tab === 'branding' && (
                            <Section title="Brand identity" desc="Your store name, tagline and logo.">
                                <Field label="Store name">
                                    <input
                                        type="text"
                                        value={config.branding.siteName}
                                        onChange={(e) => patchBranding({ siteName: e.target.value })}
                                        className={inputCls}
                                        placeholder="e.g. ShopWithGG"
                                    />
                                </Field>
                                <Field label="Tagline" hint="Short line shown in the footer and meta description.">
                                    <input
                                        type="text"
                                        value={config.branding.tagline}
                                        onChange={(e) => patchBranding({ tagline: e.target.value })}
                                        className={inputCls}
                                    />
                                </Field>
                                <Field label="Logo">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 shrink-0 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                            {config.branding.logoUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={config.branding.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                                            ) : (
                                                <i className="ri-image-line text-gray-300 text-2xl" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <UploadButton
                                                busy={uploading === 'logo'}
                                                label="Upload logo"
                                                onFile={handleLogoUpload}
                                            />
                                            <input
                                                type="text"
                                                value={config.branding.logoUrl}
                                                onChange={(e) => patchBranding({ logoUrl: e.target.value })}
                                                className={`${inputCls} mt-2 text-xs`}
                                                placeholder="or paste an image URL"
                                            />
                                        </div>
                                    </div>
                                </Field>
                            </Section>
                        )}

                        {tab === 'colors' && (
                            <Section
                                title="Color scheme"
                                desc="These drive your buttons, headers and brand accents across the storefront."
                                action={
                                    <button
                                        onClick={() => patchTheme({ ...DEFAULT_THEME })}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                    >
                                        <i className="ri-refresh-line" /> Reset to default colors
                                    </button>
                                }
                            >
                                <ColorField label="Primary" hint="Main brand color (buttons, header)." value={config.theme.primary} onChange={(v) => patchTheme({ primary: v })} />
                                <ColorField label="Secondary" hint="Supporting accents and highlights." value={config.theme.secondary} onChange={(v) => patchTheme({ secondary: v })} />
                                <ColorField label="Accent" hint="Calls to action and badges." value={config.theme.accent} onChange={(v) => patchTheme({ accent: v })} />

                                <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                                    <p className="text-xs font-medium text-gray-500 mb-3">Presets</p>
                                    <div className="flex flex-wrap gap-2">
                                        {COLOR_PRESETS.map((p) => (
                                            <button
                                                key={p.name}
                                                onClick={() => patchTheme({ primary: p.primary, secondary: p.secondary, accent: p.accent })}
                                                className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:border-gray-300"
                                                title={p.name}
                                            >
                                                <span className="flex -space-x-1">
                                                    <span className="h-4 w-4 rounded-full border border-white" style={{ background: p.primary }} />
                                                    <span className="h-4 w-4 rounded-full border border-white" style={{ background: p.secondary }} />
                                                    <span className="h-4 w-4 rounded-full border border-white" style={{ background: p.accent }} />
                                                </span>
                                                {p.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </Section>
                        )}

                        {tab === 'typography' && (
                            <Section
                                title="Typography"
                                desc="Pick the fonts used across your storefront."
                                action={
                                    <button
                                        onClick={() => patchTypography({ ...DEFAULT_TYPOGRAPHY })}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                    >
                                        <i className="ri-refresh-line" /> Reset fonts
                                    </button>
                                }
                            >
                                <FontPicker
                                    label="Heading font"
                                    value={config.typography.headingFont}
                                    onChange={(v) => patchTypography({ headingFont: v })}
                                />
                                <FontPicker
                                    label="Body font"
                                    value={config.typography.bodyFont}
                                    onChange={(v) => patchTypography({ bodyFont: v })}
                                />
                            </Section>
                        )}

                        {tab === 'hero' && (
                            <Section title="Homepage hero" desc="The banner, headline and call-to-action at the top of your homepage.">
                                <Field label="Badge" hint="Small pill above the headline. Leave empty to hide.">
                                    <input type="text" value={config.hero.badge} onChange={(e) => patchHero({ badge: e.target.value })} className={inputCls} />
                                </Field>
                                <Field label="Headline">
                                    <textarea value={config.hero.headline} onChange={(e) => patchHero({ headline: e.target.value })} rows={2} className={inputCls} />
                                </Field>
                                <Field label="Subtext">
                                    <textarea value={config.hero.subheadline} onChange={(e) => patchHero({ subheadline: e.target.value })} rows={3} className={inputCls} />
                                </Field>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Primary button text">
                                        <input type="text" value={config.hero.primaryButtonText} onChange={(e) => patchHero({ primaryButtonText: e.target.value })} className={inputCls} />
                                    </Field>
                                    <Field label="Primary button link">
                                        <input type="text" value={config.hero.primaryButtonLink} onChange={(e) => patchHero({ primaryButtonLink: e.target.value })} className={inputCls} placeholder="/shop" />
                                    </Field>
                                    <Field label="Secondary button text" hint="Leave empty to hide.">
                                        <input type="text" value={config.hero.secondaryButtonText} onChange={(e) => patchHero({ secondaryButtonText: e.target.value })} className={inputCls} />
                                    </Field>
                                    <Field label="Secondary button link">
                                        <input type="text" value={config.hero.secondaryButtonLink} onChange={(e) => patchHero({ secondaryButtonLink: e.target.value })} className={inputCls} placeholder="/shop" />
                                    </Field>
                                </div>

                                <Field label={`Overlay darkness — ${config.hero.overlayOpacity}%`} hint="Darkens the image so text stays readable.">
                                    <input
                                        type="range" min={0} max={80} value={config.hero.overlayOpacity}
                                        onChange={(e) => patchHero({ overlayOpacity: Number(e.target.value) })}
                                        className="w-full accent-gray-900"
                                    />
                                </Field>

                                <Field label="Hero images" hint="First image shows first; multiple images auto-rotate. Up to 6.">
                                    <div className="space-y-3">
                                        {config.hero.slides.map((slide, idx) => (
                                            <div key={`${slide.src}-${idx}`} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                                                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={slide.src} alt="" className="h-full w-full object-cover" style={{ objectPosition: slide.position }} />
                                                </div>
                                                <select
                                                    value={slide.position}
                                                    onChange={(e) => updateSlide(idx, { position: e.target.value })}
                                                    className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-700"
                                                >
                                                    {POSITION_PRESETS.map((p) => (
                                                        <option key={p.value} value={p.value}>{p.label}</option>
                                                    ))}
                                                </select>
                                                <div className="ml-auto flex items-center gap-1">
                                                    <IconBtn icon="ri-arrow-up-line" disabled={idx === 0} onClick={() => moveSlide(idx, -1)} title="Move up" />
                                                    <IconBtn icon="ri-arrow-down-line" disabled={idx === config.hero.slides.length - 1} onClick={() => moveSlide(idx, 1)} title="Move down" />
                                                    <IconBtn icon="ri-delete-bin-line" danger onClick={() => removeSlide(idx)} title="Remove" />
                                                </div>
                                            </div>
                                        ))}
                                        {config.hero.slides.length < 6 && (
                                            <UploadButton busy={uploading === 'slide'} label="Add hero image" onFile={handleAddSlide} />
                                        )}
                                    </div>
                                </Field>
                            </Section>
                        )}

                        {tab === 'social' && (
                            <Section title="Social links" desc="Used in your footer and structured data. Usernames or full URLs.">
                                <Field label="Instagram"><input type="text" value={config.social.instagram} onChange={(e) => patchSocial({ instagram: e.target.value })} className={inputCls} placeholder="username" /></Field>
                                <Field label="Facebook"><input type="text" value={config.social.facebook} onChange={(e) => patchSocial({ facebook: e.target.value })} className={inputCls} /></Field>
                                <Field label="Twitter / X"><input type="text" value={config.social.twitter} onChange={(e) => patchSocial({ twitter: e.target.value })} className={inputCls} /></Field>
                                <Field label="TikTok"><input type="text" value={config.social.tiktok} onChange={(e) => patchSocial({ tiktok: e.target.value })} className={inputCls} /></Field>
                            </Section>
                        )}
                    </div>
                </div>

                {/* Live preview */}
                <div className="lg:col-span-2">
                    <div className="lg:sticky lg:top-24 space-y-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Live preview</p>
                        <HeroPreview config={config} />
                        <PalettePreview config={config} />
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    <i className={toast.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'} />
                    {toast.msg}
                </div>
            )}
        </div>
    );
}

// ─── Presets ────────────────────────────────────────────────────────────────

const COLOR_PRESETS = [
    { name: 'Classic Brown', primary: '#2C1D00', secondary: '#AB9462', accent: '#FFCC00' },
    { name: 'Midnight', primary: '#0F172A', secondary: '#334155', accent: '#38BDF8' },
    { name: 'Emerald', primary: '#064E3B', secondary: '#10B981', accent: '#FBBF24' },
    { name: 'Rose', primary: '#831843', secondary: '#DB2777', accent: '#FB7185' },
    { name: 'Royal', primary: '#1E1B4B', secondary: '#6366F1', accent: '#C084FC' },
    { name: 'Mono', primary: '#111827', secondary: '#6B7280', accent: '#F59E0B' },
];

// ─── Small building blocks ───────────────────────────────────────────────────

const inputCls =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10';

function Section({ title, desc, action, children }: { title: string; desc?: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                    {desc && <p className="text-sm text-gray-500 mt-0.5">{desc}</p>}
                </div>
                {action}
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1.5">{label}</span>
            {children}
            {hint && <span className="block text-xs text-gray-400 mt-1">{hint}</span>}
        </label>
    );
}

function ColorField({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] cursor-pointer border-0 bg-transparent p-0"
                />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-28 rounded-md border border-gray-200 px-2 py-1 text-right text-xs font-mono uppercase text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                </div>
                {hint && <span className="text-xs text-gray-400">{hint}</span>}
            </div>
        </div>
    );
}

function FontPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">{label}</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FONT_OPTIONS.map((f) => {
                    const active = f.id === value;
                    return (
                        <button
                            key={f.id}
                            onClick={() => onChange(f.id)}
                            className={`rounded-xl border px-3 py-3 text-left transition-colors ${active ? 'border-gray-900 ring-2 ring-gray-900/10 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <span className="block text-lg leading-tight text-gray-900" style={{ fontFamily: fontStack(f.id) }}>Aa</span>
                            <span className="block text-xs text-gray-500 mt-1 truncate">{f.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function UploadButton({ label, busy, onFile }: { label: string; busy: boolean; onFile: (f: File) => void }) {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <>
            <button
                type="button"
                onClick={() => ref.current?.click()}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-60"
            >
                {busy ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-upload-2-line" />}
                {busy ? 'Uploading…' : label}
            </button>
            <input
                ref={ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFile(f);
                    e.target.value = '';
                }}
            />
        </>
    );
}

function IconBtn({ icon, onClick, disabled, danger, title }: { icon: string; onClick: () => void; disabled?: boolean; danger?: boolean; title?: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors disabled:opacity-30 ${danger ? 'hover:border-red-200 hover:bg-red-50 hover:text-red-600' : 'hover:bg-gray-50 hover:text-gray-800'}`}
        >
            <i className={icon} />
        </button>
    );
}

// ─── Preview panels ──────────────────────────────────────────────────────────

function HeroPreview({ config }: { config: SiteConfig }) {
    const slide = config.hero.slides[0];
    const overlay = Math.min(80, Math.max(0, config.hero.overlayOpacity)) / 100;
    const headingFont = fontStack(config.typography.headingFont);
    const bodyFont = fontStack(config.typography.bodyFont);
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden bg-gray-900 px-6 py-10 text-center">
                {slide?.src && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slide.src} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: slide.position }} />
                )}
                <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
                <div className="relative z-10 w-full">
                    {config.hero.badge && (
                        <span className="mb-3 inline-flex items-center rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/95">
                            {config.hero.badge}
                        </span>
                    )}
                    <h3 className="mx-auto max-w-md text-xl font-extrabold leading-tight text-white" style={{ fontFamily: headingFont }}>
                        {config.hero.headline}
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-xs text-white/90" style={{ fontFamily: bodyFont }}>
                        {config.hero.subheadline}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                        {config.hero.primaryButtonText && (
                            <span className="rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow" style={{ backgroundColor: config.theme.primary, fontFamily: bodyFont }}>
                                {config.hero.primaryButtonText}
                            </span>
                        )}
                        {config.hero.secondaryButtonText && (
                            <span className="rounded-full border-2 border-white/50 px-4 py-1.5 text-xs font-semibold text-white" style={{ fontFamily: bodyFont }}>
                                {config.hero.secondaryButtonText}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PalettePreview({ config }: { config: SiteConfig }) {
    const swatches = [
        { label: 'Primary', value: config.theme.primary },
        { label: 'Secondary', value: config.theme.secondary },
        { label: 'Accent', value: config.theme.accent },
    ];
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="mb-3 text-xs font-medium text-gray-500">Palette &amp; buttons</p>
            <div className="grid grid-cols-3 gap-2">
                {swatches.map((s) => (
                    <div key={s.label}>
                        <div className="h-12 w-full rounded-lg border border-gray-100" style={{ background: s.value }} />
                        <p className="mt-1 text-[10px] font-medium text-gray-500">{s.label}</p>
                        <p className="text-[10px] font-mono uppercase text-gray-400">{s.value}</p>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ background: config.theme.primary }}>Primary</span>
                <span className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ background: config.theme.secondary }}>Secondary</span>
                <span className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-900" style={{ background: config.theme.accent }}>Accent</span>
            </div>
        </div>
    );
}
