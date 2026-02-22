'use client';

import {useEffect, useRef, useState} from 'react';

import {cn} from '@/lib/utils';

type TestimonialItem = {
  quote: string;
  name: string;
  title: string;
};

export const InfiniteMovingCards = ({
  items,
  direction = 'left',
  speed = 'fast',
  pauseOnHover = true,
  className
}: {
  items: TestimonialItem[];
  direction?: 'left' | 'right';
  speed?: 'fast' | 'normal' | 'slow';
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  const addAnimation = () => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  };

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === 'left') {
        containerRef.current.style.setProperty('--animation-direction', 'forwards');
      } else {
        containerRef.current.style.setProperty('--animation-direction', 'reverse');
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === 'fast') {
        containerRef.current.style.setProperty('--animation-duration', '20s');
      } else if (speed === 'normal') {
        containerRef.current.style.setProperty('--animation-duration', '40s');
      } else {
        containerRef.current.style.setProperty('--animation-duration', '80s');
      }
    }
  };

  useEffect(() => {
    addAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'scroller relative z-20 w-screen overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]',
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          'flex w-max min-w-full shrink-0 flex-nowrap gap-16 py-4',
          start && 'animate-scroll',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
      >
        {items.map((item, idx) => (
          <li
            className="relative w-[90vw] max-w-full flex-shrink-0 rounded-2xl border border-b-0 p-5 md:w-[60vw] md:p-16"
            style={{
              borderColor: 'var(--moving-card-border)',
              background: 'var(--surface-card)',
              backgroundImage: 'var(--surface-card-gradient)',
              boxShadow: 'var(--shadow-card)'
            }}
            key={idx}
          >
            <blockquote>
              <div
                aria-hidden="true"
                className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
              />
              <span
                className="relative z-20 text-sm font-normal leading-[1.6] md:text-lg"
                style={{color: 'var(--text-primary)'}}
              >
                {item.quote}
              </span>

              <div className="relative z-20 mt-6 flex flex-row items-center">
                <div className="flex flex-col gap-1">
                  <span
                    className="text-xl font-bold leading-[1.6]"
                    style={{color: 'var(--text-primary)'}}
                  >
                    {item.name}
                  </span>

                  <span
                    className="text-sm font-normal leading-[1.6]"
                    style={{color: 'var(--text-secondary)'}}
                  >
                    {item.title}
                  </span>
                </div>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};
