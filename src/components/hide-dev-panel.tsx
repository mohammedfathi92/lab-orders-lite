"use client";

import { useEffect } from "react";

export function HideDevPanel() {
  useEffect(() => {
    // Function to remove Next.js dev panels
    const removeDevPanels = () => {
      // Remove by ID
      const buildWatcher = document.getElementById("__next-build-watcher");
      if (buildWatcher) {
        buildWatcher.remove();
      }

      // Remove by class
      const devOverlays = document.querySelectorAll(".__next-dev-overlay");
      devOverlays.forEach((el) => el.remove());

      // Remove by data attributes
      const nextjsDialogs = document.querySelectorAll("[data-nextjs-dialog]");
      nextjsDialogs.forEach((el) => el.remove());

      const nextjsOverlays = document.querySelectorAll("[data-nextjs-dialog-overlay]");
      nextjsOverlays.forEach((el) => el.remove());

      // Remove nextjs-portal elements
      const portals = document.querySelectorAll("nextjs-portal");
      portals.forEach((el) => el.remove());

      // Remove iframes
      const iframes = document.querySelectorAll('iframe[src*="__nextjs"]');
      iframes.forEach((el) => el.remove());

      // Remove any element with __next-dev in class/id
      const allElements = document.querySelectorAll("*");
      allElements.forEach((el) => {
        const id = el.id || "";
        const className = el.className || "";
        if (
          (typeof className === "string" && className.includes("__next-dev")) ||
          id.includes("__next-dev") ||
          id.includes("__next-build")
        ) {
          // Check if it's a dev panel element
          if (
            id.includes("watcher") ||
            id.includes("overlay") ||
            className.includes("overlay") ||
            className.includes("watcher")
          ) {
            el.remove();
          }
        }
      });
    };

    // Run immediately
    removeDevPanels();

    // Set up observer to watch for dynamically added elements
    const observer = new MutationObserver(() => {
      removeDevPanels();
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also run periodically as a fallback
    const interval = setInterval(removeDevPanels, 1000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
}

