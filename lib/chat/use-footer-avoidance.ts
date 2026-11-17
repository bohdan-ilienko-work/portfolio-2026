import { useEffect, useRef, useState } from 'react';

const AVOIDANCE_GAP_PX = 12;
const AVOIDANCE_SELECTOR = '[data-ask-bohdan-avoid]';
const SETTLE_DELAYS_MS = [120, 360, 900];

const getAvoidanceTargets = () => {
  const marked = Array.from(document.querySelectorAll<HTMLElement>(AVOIDANCE_SELECTOR));
  const footerBottomRow = document.querySelector<HTMLElement>('footer#contact > div:last-child');

  return Array.from(new Set([...marked, ...(footerBottomRow ? [footerBottomRow] : [])]));
};

/**
 * Lifts the floating trigger above the page elements marked `data-ask-bohdan-avoid` and the footer's bottom row
 * while they are on screen and overlap it horizontally. Pass `suspended` while the panel is open: the panel does
 * not move, so nothing is measured. Ported from the legacy chat.
 */
export const useFooterAvoidance = (suspended: boolean) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offsetPx, setOffsetPx] = useState(0);

  useEffect(() => {
    if (suspended) {
      setOffsetPx(0);
      return;
    }

    let frameId: number | null = null;
    const timeoutIds: number[] = [];

    const update = () => {
      frameId = null;

      const floatingRect = ref.current?.getBoundingClientRect();
      if (!floatingRect) return;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const next = getAvoidanceTargets().reduce((maxOffset, target) => {
        const rect = target.getBoundingClientRect();
        const isVisible =
          rect.bottom > 0 && rect.top < viewportHeight && rect.right > 0 && rect.left < viewportWidth;

        if (!isVisible) return maxOffset;

        const overlapsHorizontally =
          rect.left < floatingRect.right + AVOIDANCE_GAP_PX && rect.right > floatingRect.left - AVOIDANCE_GAP_PX;

        if (!overlapsHorizontally) return maxOffset;

        return Math.max(maxOffset, Math.ceil(viewportHeight - rect.top + AVOIDANCE_GAP_PX));
      }, 0);

      setOffsetPx((current) => (current === next ? current : next));
    };

    const schedule = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(update);
    };

    schedule();
    SETTLE_DELAYS_MS.forEach((delay) => timeoutIds.push(window.setTimeout(schedule, delay)));

    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.documentElement);
    resizeObserver.observe(document.body);
    getAvoidanceTargets().forEach((target) => resizeObserver.observe(target));

    const mutationObserver = new MutationObserver(schedule);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-ask-bohdan-avoid', 'class', 'style']
    });

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);

      timeoutIds.forEach((id) => window.clearTimeout(id));
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
    };
  }, [suspended]);

  return { ref, offsetPx };
};
