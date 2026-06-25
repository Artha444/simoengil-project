"use client";

const activeLocks = new Set<string>();
let savedPaddingRight = "";

const preventDefaultTouch = (e: TouchEvent) => {
  let target = e.target as HTMLElement | null;
  while (target && target !== document.body) {
    if (target.scrollHeight > target.clientHeight) {
      const overflowY = window.getComputedStyle(target).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return; // Allow scroll inside scrollable modal/drawer content
      }
    }
    target = target.parentElement;
  }
  if (e.cancelable) {
    e.preventDefault();
  }
};

export function lockBodyScroll(lock: boolean, key: string = 'default') {
  if (lock) {
    if (activeLocks.size === 0) {
      savedPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Lock desktop scrolling
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Lock iOS / mobile touch scrolling
      window.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    }
    activeLocks.add(key);
  } else {
    activeLocks.delete(key);
    if (activeLocks.size === 0) {
      // Unlock desktop scrolling
      document.body.style.overflow = "";
      document.body.style.paddingRight = savedPaddingRight;
      
      // Unlock mobile touch scrolling
      window.removeEventListener('touchmove', preventDefaultTouch);
    }
  }
}
