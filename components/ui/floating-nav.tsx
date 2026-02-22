'use client';

import {AnimatePresence, motion, useMotionValueEvent, useScroll} from 'framer-motion';
import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {useState} from 'react';
import {HiBars3, HiXMark} from 'react-icons/hi2';

import {navItems} from '@/data';
import {cn} from '@/lib/utils';

import {LanguageSwitcher} from './language-switcher';
import {ThemeSwitcher} from './theme-switcher';

type FloatingNavProps = {
  navItems: typeof navItems;
  className?: string;
};

export const FloatingNav = ({navItems, className}: FloatingNavProps) => {
  const {scrollY} = useScroll();
  const t = useTranslations('common');

  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (current) => {
    if (typeof current === 'number') {
      if (current < 50) {
        setVisible(true);
      } else if (current > lastScrollY) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      setLastScrollY(current);
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.nav
        initial={{
          opacity: 1,
          y: -100
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0
        }}
        transition={{
          duration: 0.2
        }}
        className={cn(
          'fixed inset-x-0 top-4 z-[5000] mx-auto flex max-w-fit items-center justify-center space-x-4 rounded-3xl border px-3 py-3 md:top-10 md:py-5',
          'border-[--border-medium] bg-[--surface-1] shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]',
          'w-[calc(100vw-1rem)] md:w-auto',
          className
        )}
      >
        <div className="hidden items-center space-x-4 md:flex">
          {navItems.map((navItem, idx) => (
            <Link
              key={`desktop-link-${idx}`}
              href={navItem.link}
              className="relative flex items-center space-x-1 text-[--text-secondary] transition-colors hover:text-[--text-primary]"
            >
              <span className="!cursor-pointer text-sm">{t(navItem.nameKey)}</span>
            </Link>
          ))}

          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>

        <div className="flex w-full items-center justify-between md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[--border-medium] bg-[--surface-card] text-[--text-secondary] transition hover:text-[--text-primary]"
          >
            {isMobileMenuOpen ? <HiXMark className="h-5 w-5" /> : <HiBars3 className="h-5 w-5" />}
          </button>

          <LanguageSwitcher />
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{opacity: 0, y: -8}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -8}}
              transition={{duration: 0.18}}
              className="absolute left-0 right-0 top-[calc(100%+0.55rem)] rounded-2xl border border-[--border-medium] bg-[--surface-1] p-3 shadow-[0px_10px_25px_rgba(0,0,0,0.2)] md:hidden"
            >
              <div className="flex flex-col gap-1.5">
                {navItems.map((navItem, idx) => (
                  <Link
                    key={`mobile-link-${idx}`}
                    href={navItem.link}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm text-[--text-secondary] transition hover:bg-[--surface-card] hover:text-[--text-primary]"
                  >
                    {t(navItem.nameKey)}
                  </Link>
                ))}
              </div>

              <div className="mt-3 border-t border-[--border-medium] pt-3">
                <ThemeSwitcher />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </AnimatePresence>
  );
};
