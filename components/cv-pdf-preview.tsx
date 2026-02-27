"use client";

import {useState, useEffect} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';

export const CvPdfPreview = ({ fileUrl }: { fileUrl: string }) => {
    const t = useTranslations('cv');
    const [showIframe, setShowIframe] = useState(false);

    useEffect(() => {
        setShowIframe(window.innerWidth >= 768);
    }, []);

    return (
        <div className="h-[320px] w-full overflow-hidden sm:h-[360px] md:h-[420px]" style={{ backgroundColor: "var(--cv-preview-bg)" }}>
            {showIframe ? (
                <iframe
                    src={`${fileUrl}#view=FitH`}
                    title="CV PDF preview"
                    className="h-full w-full"
                />
            ) : (
                <div className="relative h-full w-full">
                    <Image
                        src="/cv_preview.png"
                        alt="CV preview"
                        fill
                        className="object-cover object-top"
                        style={{ filter: 'blur(3px)', transform: 'scale(1.06)' }}
                        sizes="100vw"
                    />
                    <div
                        className="absolute inset-0"
                        style={{ background: 'var(--cv-mobile-overlay)' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative px-10 py-8">
                            <div
                                className="pointer-events-none absolute inset-0"
                                style={{
                                    background: 'var(--cv-mobile-vignette)',
                                    filter: 'blur(22px)',
                                    transform: 'scale(1.6)',
                                }}
                            />
                            <p
                                className="relative text-center text-sm font-medium"
                                style={{ color: '#1a1d2e' }}
                            >
                                {t('mobilePreviewUnavailable')}{' '}
                                <span style={{ color: '#CBACF9' }}>{t('mobilePreviewHighlight')}</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
