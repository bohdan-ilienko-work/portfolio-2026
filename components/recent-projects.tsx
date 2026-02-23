'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {useEffect, useRef, useState} from 'react';
import {FaLocationArrow} from 'react-icons/fa6';

import {projects} from '@/data';

import {PinContainer} from './ui/3d-pin';

type PopupState = null | {
  projectId: number;
  projectTitle: string;
  options: Array<{label: string; href: string}>;
};

export const RecentProjects = () => {
  const [activeSourcePopup, setActiveSourcePopup] = useState<PopupState>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const t = useTranslations('projects');

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!activeSourcePopup) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      const isPopupClick = popupRef.current?.contains(target);
      const isTriggerClick = Boolean(target.closest('[data-source-trigger]'));
      if (!isPopupClick && !isTriggerClick) {
        setActiveSourcePopup(null);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [activeSourcePopup]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveSourcePopup(null);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <section id="projects" className="py-20">
      <h2 className="heading">
        {t('headingPrefix')} <span className="text-purple">{t('headingHighlight')}</span>
      </h2>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-24 gap-y-24 p-4">
        {projects.map(
          ({
            id,
            desKey,
            iconLists,
            img,
            link,
            sourceCode,
            sourceOptions,
            titleKey,
            visitLinks
          }) => {
            const title = t(titleKey);
            const description = t(desKey);
            const mappedVisitLinks = visitLinks.map((visitLink) => ({
              label: t(visitLink.labelKey),
              href: visitLink.href
            }));

            const mappedSourceOptions = sourceOptions.map((sourceOption) => ({
              label: t(sourceOption.labelKey),
              href: sourceOption.href
            }));

            return (
              <div
                key={id}
                className="flex h-[31rem] w-[90vw] items-center justify-center sm:h-[35rem] sm:w-[570px] lg:min-h-[31rem]"
              >
                <PinContainer
                  title={t('visit')}
                  href={link}
                  ctaLinks={[...mappedVisitLinks]}
                  containerClassName="h-full w-full"
                >
                  <div className="relative mb-8 flex aspect-[16/10] w-[80vw] items-center justify-center overflow-hidden sm:w-[570px]">
                    <div
                      className="relative h-full w-full overflow-hidden lg:rounded-3xl"
                      style={{backgroundColor: 'var(--project-bg)'}}
                    >
                      <Image
                        height={330}
                        width={552}
                        src="/bg.png"
                        alt="Project card background"
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <Image
                      height={300}
                      width={464}
                      src={img}
                      alt={title}
                      className="absolute bottom-0 z-10 h-auto w-[86%]"
                    />
                  </div>

                  <h3
                    className="line-clamp-1 text-base font-bold md:text-xl lg:text-2xl"
                    style={{color: 'var(--text-primary)'}}
                  >
                    {title}
                  </h3>

                  <p
                    className="line-clamp-2 text-sm font-light lg:text-xl lg:font-normal"
                    style={{color: 'var(--text-secondary)'}}
                  >
                    {description}
                  </p>

                  <div className="mb-3 mt-7 flex items-center justify-between">
                    <div className="flex items-center">
                      {iconLists.map((icon, i) => (
                        <div
                          key={icon}
                          className="flex h-8 w-8 items-center justify-center rounded-full border lg:h-10 lg:w-10"
                          style={{
                            transform: `translateX(-${5 * i * 2}px)`,
                            borderColor: 'var(--border-medium)',
                            backgroundColor: 'var(--surface-card)'
                          }}
                        >
                          <Image
                            height={40}
                            width={40}
                            src={icon}
                            alt="Technology icon"
                            unoptimized
                            className="p-2"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="relative flex items-center justify-center">
                      {mappedSourceOptions.length > 0 ? (
                        <div className="relative">
                          <button
                            type="button"
                            data-source-trigger
                            onClick={() =>
                              setActiveSourcePopup((prev) =>
                                prev?.projectId === id
                                  ? null
                                  : {
                                      projectId: id,
                                      projectTitle: title,
                                      options: [...mappedSourceOptions]
                                    }
                              )
                            }
                            className="flex text-sm text-purple transition-opacity hover:opacity-80 md:text-xs lg:text-xl"
                          >
                            <span>{t('sourceCode')}</span>
                            <FaLocationArrow
                              className="ms-3 mt-[2px] h-3 w-3 md:h-2.5 md:w-2.5 lg:h-4 lg:w-4"
                              color="#cbacf9"
                            />
                          </button>

                          {activeSourcePopup?.projectId === id && (
                            <div
                              ref={popupRef}
                              className="absolute bottom-full right-0 z-[220] mb-3 w-72 rounded-2xl border p-4 backdrop-blur-sm"
                              style={{
                                borderColor: 'var(--border-medium)',
                                background: 'linear-gradient(to bottom, var(--popup-from), var(--popup-to))',
                                boxShadow: 'var(--shadow-popup)'
                              }}
                            >
                              <div
                                className="absolute -bottom-2 right-7 h-4 w-4 rotate-45 border-b border-r"
                                style={{
                                  borderColor: 'var(--border-medium)',
                                  backgroundColor: 'var(--popup-arrow)'
                                }}
                              />
                              <p
                                className="mb-2 text-[10px] uppercase tracking-[0.18em]"
                                style={{color: 'var(--text-faint)'}}
                              >
                                {t('sourceSelection')}
                              </p>
                              <p
                                className="mb-3 truncate text-sm font-semibold"
                                style={{color: 'var(--text-primary)'}}
                              >
                                {activeSourcePopup.projectTitle}
                              </p>

                              <div className="space-y-2">
                                {activeSourcePopup.options.map((option) => (
                                  <Link
                                    key={option.label}
                                    href={option.href}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    onClick={() => setActiveSourcePopup(null)}
                                    className="flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs transition hover:border-purple/70 hover:text-purple"
                                    style={{
                                      borderColor: 'var(--border-medium)',
                                      backgroundColor: 'var(--popup-item)',
                                      color: 'var(--text-primary)'
                                    }}
                                  >
                                    <span>{option.label}</span>
                                    <FaLocationArrow className="h-3 w-3" />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={sourceCode}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="flex items-center text-sm text-purple md:text-xs lg:text-xl"
                        >
                          <span>{t('sourceCode')}</span>
                          <FaLocationArrow
                            className="ms-3 mt-[2px] h-3 w-3 md:h-2.5 md:w-2.5 lg:h-4 lg:w-4"
                            color="#cbacf9"
                          />
                        </Link>
                      )}
                    </div>
                  </div>
                </PinContainer>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
};
