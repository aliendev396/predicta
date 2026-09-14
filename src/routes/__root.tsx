import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Component, useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

import { Toaster } from "../components/ui/sonner";
import { supabase } from "../integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <img src="/predicta-symbol.png" alt="" className="mx-auto h-14 w-auto animate-pulse mb-6" />
        <h2 className="text-lg font-semibold text-foreground">Taking you home...</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page doesn't exist. Redirecting you automatically.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home now
          </Link>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `setTimeout(function(){window.location.href='/'},2000)` }} />
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    // Auto-retry once after 1.5 seconds to silently recover from transient SSR errors
    const timer = setTimeout(() => {
      void router.invalidate().then(() => reset());
    }, 1500);
    return () => clearTimeout(timer);
  }, [error, router, reset]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <img src="/predicta-symbol.png" alt="" className="mx-auto h-14 w-auto animate-pulse mb-6" />
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Loading PREDICTA...
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Reconnecting to the server. This should only take a moment.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Refresh
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0, viewport-fit=cover" },
      { title: "PREDICTA — AI Visual Analytics" },
      {
        name: "description",
        content:
          "PREDICTA turns screenshots into intelligent, structured insight reports using AI image analysis.",
      },
      { name: "author", content: "PREDICTA" },
      { name: "theme-color", content: "#ffffff" },
      { property: "og:title", content: "PREDICTA — AI Visual Analytics" },
      {
        property: "og:description",
        content: "Upload visual information and let PREDICTA's AI analyze and explain what it sees.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "PREDICTA",
              url: "https://PREDICTA.lovable.app",
              logo: "https://PREDICTA.lovable.app/icon-512.png",
            },
            {
              "@type": "WebSite",
              name: "PREDICTA",
              url: "https://PREDICTA.lovable.app",
            },
          ],
        }),
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png", sizes: "any" },
      { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/icon-192.png", sizes: "192x192" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preload", href: "/predicta-symbol.png", as: "image", type: "image/png" },
      { rel: "preload", href: "/predicta-full.png", as: "image", type: "image/png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* Splash screen: pure HTML/CSS/JS — no React dependency, no hydration issues */}
        <div
          id="predicta-splash"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
            cursor: "pointer",
          }}
        >
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div style={{ position: "relative", overflow: "hidden", padding: "8px 16px", borderRadius: "12px" }}>
              <img
                src="/predicta-wordmark.png"
                alt="PREDICTA"
                style={{ height: "40px", width: "auto", objectFit: "contain", userSelect: "none" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to right, transparent, rgba(255,255,255,0.85), rgba(220,38,38,0.15), transparent)",
                  animation: "shimmer-wave 4s cubic-bezier(0.4,0,0.2,1) infinite",
                  transform: "translateX(-160%) skewX(-25deg)",
                  pointerEvents: "none",
                }}
              />
            </div>
            <div style={{ position: "relative", height: "2px", width: "160px", overflow: "hidden", borderRadius: "9999px", backgroundColor: "#f1f5f9", marginTop: "4px" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent, #dc2626, transparent)", animation: "shimmer-wave 4s cubic-bezier(0.4,0,0.2,1) infinite" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#dc2626", boxShadow: "0 0 8px #e41827", animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.25em", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>
                AI VISION ENGINE
              </span>
            </div>
          </div>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var el = document.getElementById('predicta-splash');
  if (!el) return;
  // Already seen: hide immediately before paint
  try { if (localStorage.getItem('predicta-splash') === '1') { el.style.display = 'none'; return; } } catch(e) {}
  // First visit: show for 1.2s, fade out, then remove
  function dismiss() {
    if (el._done) return;
    el._done = true;
    el.style.opacity = '0';
    el.style.transform = 'scale(1.02)';
    el.style.pointerEvents = 'none';
    setTimeout(function() { el.style.display = 'none'; }, 350);
    try { localStorage.setItem('predicta-splash', '1'); } catch(e) {}
  }
  el.addEventListener('click', dismiss);
  setTimeout(dismiss, 4000);
  // Hard safety fallback
  setTimeout(function() { el.style.display = 'none'; }, 6000);
})();
`,
          }}
        />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      void router.invalidate();
      if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <AppErrorBoundary>
        <Outlet />
      </AppErrorBoundary>
      <Toaster />
    </QueryClientProvider>
  );
}

// Last-resort boundary: router boundaries ignore falsy thrown values (e.g. `throw undefined`),
// which loops into a blank screen. This catches anything and always renders a recovery screen.
class AppErrorBoundary extends Component<{ children: ReactNode }, { crashed: boolean }> {
  override state = { crashed: false };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  override componentDidCatch(error: unknown) {
    console.error("App error boundary:", error);
    reportLovableError(error, { boundary: "app_root_boundary" });
    // Auto-reload after 2s to silently recover
    setTimeout(() => window.location.reload(), 2000);
  }

  override render() {
    if (!this.state.crashed) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <img src="/predicta-symbol.png" alt="" className="mx-auto h-14 w-auto animate-pulse mb-6" />
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Loading PREDICTA...
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please wait while we reconnect.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Refresh now
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

