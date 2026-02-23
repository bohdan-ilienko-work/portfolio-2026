'use client';

import dynamic from 'next/dynamic';
import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {FaDownload, FaEye} from 'react-icons/fa6';

import {links} from '@/config';

const CvLoading = () => {
  const t = useTranslations('cv');

  return (
    <div
      className="flex h-[320px] items-center justify-center text-sm sm:h-[360px] md:h-[420px]"
      style={{color: 'var(--text-muted)'}}
    >
      {t('loadingPreview')}
    </div>
  );
};

const CvPdfPreview = dynamic(() => import('./cv-pdf-preview').then((m) => m.CvPdfPreview), {
  ssr: false,
  loading: () => <CvLoading />
});

export const Cv = () => {
  const t = useTranslations('cv');

  return (
    <section id="cv" className="py-20">
      <h2 className="heading">
        {t('headingPrefix')} <span className="text-purple">{t('headingHighlight')}</span>
      </h2>

      <p className="mx-auto mt-4 max-w-3xl text-center" style={{color: 'var(--text-secondary)'}}>
        {t('description')}
      </p>

      <div
        className="mt-10 w-full overflow-hidden rounded-3xl border"
        style={{
          borderColor: 'var(--border-medium)',
          background: 'linear-gradient(to bottom, var(--overlay-subtle), transparent)',
          boxShadow: 'var(--shadow-heavy)'
        }}
      >
        <div
          className="relative border-b px-5 py-4"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--cv-header-bg)'
          }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div
              className="absolute inset-0 bg-[size:44px_44px]"
              style={{
                backgroundImage: `linear-gradient(to right, var(--cv-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--cv-grid-line) 1px, transparent 1px)`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-transparent" />
          </div>

          <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <div>
              <div className="text-sm font-semibold md:text-base" style={{color: 'var(--text-primary)'}}>
                {t('resumePreview')}
              </div>
              <div className="mt-0.5 text-xs" style={{color: 'var(--text-muted)'}}>
                {t('resumePreviewHint')}
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:w-auto md:flex md:items-center">
              <Link href={links.ownerCvFile} target="_blank" rel="noreferrer noopener" className="w-full">
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold transition md:w-auto"
                  style={{
                    borderColor: 'var(--border-medium)',
                    backgroundColor: 'var(--overlay-subtle)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <FaEye className="opacity-90" />
                  {t('open')}
                </button>
              </Link>

              <Link href={links.ownerCvGoogle} target="_blank" rel="noreferrer noopener" className="w-full">
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold transition md:w-auto"
                  style={{
                    borderColor: 'var(--border-medium)',
                    backgroundColor: 'var(--overlay-subtle)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <FaDownload className="opacity-90" />
                  {t('download')}
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="relative p-2 md:p-3">
          <div
            className="pointer-events-none absolute inset-0"
            style={{background: 'linear-gradient(to bottom, transparent, transparent, rgba(var(--surface-1-rgb), 0.3))'}}
          />

          <div
            className="relative overflow-hidden rounded-2xl border"
            style={{
              borderColor: 'var(--border-medium)',
              backgroundColor: 'var(--cv-preview-bg)'
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16"
              style={{background: `linear-gradient(to bottom, transparent, var(--cv-fade-to))`}}
            />
            <CvPdfPreview fileUrl={links.ownerCvFile} />
          </div>
        </div>
      </div>
    </section>
  );
};
