'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {useEffect, useRef, useState} from 'react';
import {FaTelegramPlane} from 'react-icons/fa';
import {FaLocationArrow} from 'react-icons/fa6';
import {MdOutlineEmail} from 'react-icons/md';

import {MagicButton} from '@/components/ui/magic-button';
import {links} from '@/config';
import {socialMedia} from '@/data';

export const Footer = () => {
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const t = useTranslations('footer');
  const tCommon = useTranslations('common');

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!isContactPopupOpen) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      const isPopupClick = popupRef.current?.contains(target);
      const isTriggerClick = Boolean(target.closest('[data-contact-trigger]'));

      if (!isPopupClick && !isTriggerClick) {
        setIsContactPopupOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsContactPopupOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isContactPopupOpen]);

  return (
    <footer id="contact" className="mb-[100px] w-full pb-10 md:mb-auto">
      <div className="absolute -bottom-72 left-0 min-h-96 w-full">
        <Image
          src="/footer-grid.svg"
          alt="Decorative footer grid background"
          className="h-full w-full opacity-50"
          style={{filter: 'var(--footer-grid-filter)'}}
          width={1260}
          height={863}
        />
      </div>

      <div className="flex flex-col items-center">
        <h2 className="heading lg:max-w-[45vw]">
          {t('headingPrefix')} <span className="text-purple">{t('headingHighlight')}</span>{' '}
          {t('headingSuffix')}
        </h2>

        <p className="mb-4 mt-5 text-center md:mb-3 md:mt-6" style={{color: 'var(--text-secondary)'}}>
          {t('description')}
        </p>

        <div className="relative mt-2 md:mt-4">
          <MagicButton
            title={t('contactButton')}
            icon={<FaLocationArrow />}
            position="right"
            otherClasses="relative"
          />

          <button
            type="button"
            aria-label={t('contactMethod')}
            data-contact-trigger
            onClick={() => setIsContactPopupOpen((prev) => !prev)}
            className="absolute inset-0"
          />

          {isContactPopupOpen && (
            <div
              ref={popupRef}
              className="absolute bottom-full left-1/2 z-[300] mb-0 w-[min(92vw,22rem)] -translate-x-1/2 rounded-2xl border p-3 backdrop-blur-sm"
              style={{
                borderColor: 'var(--border-medium)',
                background: 'linear-gradient(to bottom, var(--popup-from), var(--popup-to))',
                boxShadow: 'var(--shadow-popup)'
              }}
            >
              <div
                className="absolute -bottom-[8px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r"
                style={{borderColor: 'var(--border-medium)', backgroundColor: 'var(--popup-arrow)'}}
              />
              <p className="mb-2 text-[10px] uppercase tracking-[0.18em]" style={{color: 'var(--text-faint)'}}>
                {t('contactMethod')}
              </p>

              <div className="space-y-2">
                <Link
                  href={links.ownerTelegram}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => setIsContactPopupOpen(false)}
                  className="flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition hover:border-purple/70 hover:text-purple"
                  style={{
                    borderColor: 'var(--border-medium)',
                    backgroundColor: 'var(--popup-item)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <span className="flex items-center gap-2">
                    <FaTelegramPlane className="h-4 w-4" />
                    {t('telegram')}
                  </span>
                  <FaLocationArrow className="h-3 w-3" />
                </Link>

                <Link
                  href={`mailto:${links.ownerEmail}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => setIsContactPopupOpen(false)}
                  className="flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition hover:border-purple/70 hover:text-purple"
                  style={{
                    borderColor: 'var(--border-medium)',
                    backgroundColor: 'var(--popup-item)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <span className="flex items-center gap-2">
                    <MdOutlineEmail className="h-4 w-4" />
                    {t('email')}
                  </span>
                  <FaLocationArrow className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-[999] mt-16 flex flex-col items-center justify-between md:flex-row">
        <p className="text-sm font-light md:text-base md:font-normal">
          {t('copyright', {year: new Date().getFullYear()})}{' '}
          <Link
            href={links.ownerInsta}
            target="_blank"
            rel="noreferrer noopener"
            className="text-purple"
          >
            {tCommon('profile.ownerName')}
          </Link>{' '}
          |{' '}
          <Link href={links.sourceCode} className="underline" target="_blank" rel="noreferrer noopener">
            {t('sourceCode')}
          </Link>
        </p>

        <div className="flex items-center gap-6 md:gap-3">
          {socialMedia.map((profile) => {
            const socialName = t(profile.nameKey);

            return (
              <Link
                key={profile.nameKey}
                href={profile.link}
                target="_blank"
                rel="me noreferrer noopener"
                className="saturate-180 flex size-10 items-center justify-center rounded-lg border backdrop-blur-lg backdrop-filter"
                style={{
                  borderColor: 'var(--social-border)',
                  backgroundColor: 'var(--social-bg)'
                }}
                title={socialName}
              >
                <Image
                  src={profile.img}
                  alt={`profile-${socialName}`}
                  width={20}
                  height={20}
                  className="dark:invert-0 invert"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
};
