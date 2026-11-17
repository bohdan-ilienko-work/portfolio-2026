import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;
const getIsMac = () => /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);

/** Decides the shortcut label (⌘K or Ctrl K). The platform does not change, so there is nothing to subscribe to. */
export const useIsMac = (): boolean => useSyncExternalStore(subscribe, getIsMac, () => false);
