import React, { useEffect } from "react";

/**
 * SilentErrorBoundary
 * -------------------
 * Swallows render-phase errors from its descendants and renders nothing.
 */
class SilentErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {}
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/**
 * Overlay
 * -------
 * 1. Adds a `.overlay` class to the `<body>` while mounted so you can dim/lock
 *    the background with CSS.
 * 2. Swallows **all** uncaught runtime errors (both `window.onerror` and
 *    `unhandledrejection`) so React's red error overlay never appears – even
 *    in development.
 *
 * If you still want to forward the errors to monitoring, hook into the
 * `onGlobalError` callback prop.
 */
const Overlay = ({ children, onGlobalError }) => {
  useEffect(() => {
    const body = typeof document !== "undefined" ? document.body : null;
    body?.classList.add("overlay");

    // ----- Runtime-error suppression (dev AND prod) -----
    const swallow = (evt) => {
      onGlobalError?.(evt.error ?? evt.reason, evt);
      // Prevent React-Refresh / Vite / CRA from showing the overlay
      if (evt.preventDefault) evt.preventDefault();
      return false; // for older browsers
    };

    if (typeof window !== "undefined") {
      window.addEventListener("error", swallow);
      window.addEventListener("unhandledrejection", swallow);
    }

    return () => {
      body?.classList.remove("overlay");
      if (typeof window !== "undefined") {
        window.removeEventListener("error", swallow);
        window.removeEventListener("unhandledrejection", swallow);
      }
    };
  }, [onGlobalError]);

  return (
    <SilentErrorBoundary>
      <div className="overlay">{children}</div>
    </SilentErrorBoundary>
  );
};

export default Overlay;
