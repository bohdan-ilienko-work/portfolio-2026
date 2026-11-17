import { useEffect, useRef, useState } from 'react';

const AVOIDANCE_GAP_PX = 12;
const FOOTER_SELECTOR = 'footer#contact';
const TARGET_SELECTOR = `[data-ask-bohdan-avoid], ${FOOTER_SELECTOR} > div:last-child`;
const CONTAINER_SELECTOR = `[data-ask-bohdan-avoid], ${FOOTER_SELECTOR}`;

const canChangeTargets = (node: Node) =>
  node instanceof Element && (node.matches(CONTAINER_SELECTOR) || node.querySelector(CONTAINER_SELECTOR) !== null);

/** Lifts the floating trigger above marked elements and the footer's bottom row when they overlap. */
export const useFooterAvoidance = (suspended: boolean) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offsetPx, setOffsetPx] = useState(0);

  useEffect(() => {
    if (suspended) {
      setOffsetPx(0);
      return;
    }

    const floating = ref.current;
    if (!floating) return;

    let frameId: number | null = null;
    let targets = new Set<HTMLElement>();
    const nearbyTargets = new Set<HTMLElement>();

    const update = () => {
      frameId = null;

      if (!nearbyTargets.size) {
        setOffsetPx(0);
        return;
      }

      const floatingRect = floating.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      let next = 0;

      for (const target of nearbyTargets) {
        const rect = target.getBoundingClientRect();
        const isVisible =
          rect.bottom > 0 && rect.top < viewportHeight && rect.right > 0 && rect.left < viewportWidth;
        const overlapsHorizontally =
          rect.left < floatingRect.right + AVOIDANCE_GAP_PX && rect.right > floatingRect.left - AVOIDANCE_GAP_PX;

        if (isVisible && overlapsHorizontally) {
          next = Math.max(next, Math.ceil(viewportHeight - rect.top + AVOIDANCE_GAP_PX));
        }
      }

      setOffsetPx(next);
    };

    const schedule = () => {
      if (frameId === null) frameId = window.requestAnimationFrame(update);
    };
    const scheduleIfNearby = () => {
      if (nearbyTargets.size) schedule();
    };

    const resizeObserver = new ResizeObserver(scheduleIfNearby);
    resizeObserver.observe(document.body);
    resizeObserver.observe(floating);

    // On the rest of the page, scroll events only do the Set check. Footer measurements start near the viewport.
    const intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        if (entry.isIntersecting && targets.has(target)) nearbyTargets.add(target);
        else nearbyTargets.delete(target);
      }
      schedule();
    }, { rootMargin: `${AVOIDANCE_GAP_PX}px 0px` });

    const syncTargets = () => {
      const next = new Set(document.querySelectorAll<HTMLElement>(TARGET_SELECTOR));
      for (const target of targets) {
        if (next.has(target)) continue;
        intersectionObserver.unobserve(target);
        resizeObserver.unobserve(target);
        if (nearbyTargets.delete(target)) schedule();
      }
      for (const target of next) {
        if (targets.has(target)) continue;
        intersectionObserver.observe(target);
        resizeObserver.observe(target);
      }
      targets = next;
    };

    syncTargets();

    const mutationObserver = new MutationObserver((records) => {
      for (const record of records) {
        if (
          record.type === 'attributes' ||
          (record.target instanceof Element && record.target.matches(FOOTER_SELECTOR)) ||
          Array.from(record.addedNodes).some(canChangeTargets) ||
          Array.from(record.removedNodes).some(canChangeTargets)
        ) {
          syncTargets();
          return;
        }
      }
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributeFilter: ['data-ask-bohdan-avoid']
    });

    window.addEventListener('scroll', scheduleIfNearby, { passive: true });
    window.addEventListener('resize', scheduleIfNearby);
    window.addEventListener('orientationchange', scheduleIfNearby);

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('scroll', scheduleIfNearby);
      window.removeEventListener('resize', scheduleIfNearby);
      window.removeEventListener('orientationchange', scheduleIfNearby);
    };
  }, [suspended]);

  return { ref, offsetPx };
};
