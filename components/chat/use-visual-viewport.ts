import { useEffect, useState } from 'react';

export type VisualViewportBox = { bottom: number; height: number };

/**
 * The part of the screen not covered by the on-screen keyboard, as an inset from the bottom of the layout viewport
 * and a height. iOS Safari and Android Chrome keep the layout viewport where it is and only shrink the visual one,
 * so a `fixed bottom-0` sheet would end up under the keyboard. Returns null when there is nothing to correct.
 */
export const useVisualViewport = (active: boolean): VisualViewportBox | null => {
  const [box, setBox] = useState<VisualViewportBox | null>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!active || !viewport) return;

    const update = () => {
      // Pinch-zoomed: the visual viewport is smaller on purpose, leave the layout alone.
      if (viewport.scale > 1.01) return;

      const bottom = Math.max(0, Math.round(window.innerHeight - viewport.offsetTop - viewport.height));
      setBox(bottom > 0 ? { bottom, height: Math.round(viewport.height) } : null);
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);

    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      setBox(null);
    };
  }, [active]);

  return box;
};
