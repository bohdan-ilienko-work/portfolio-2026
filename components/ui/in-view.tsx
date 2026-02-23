'use client';

import {useEffect, useRef, useState, type PropsWithChildren} from 'react';

type InViewProps = PropsWithChildren<{
  rootMargin?: string;
  threshold?: number;
  className?: string;
}>;

export const InView = ({
  children,
  rootMargin = '120px',
  threshold = 0.1,
  className
}: InViewProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {root: null, rootMargin, threshold}
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isVisible, rootMargin, threshold]);

  return <div ref={wrapperRef} className={className}>{isVisible ? children : null}</div>;
};
