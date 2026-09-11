import { cn } from "@/lib/utils";

// Logos are served from /public so they work on any host (Vercel, Lovable, etc.)
const FULL_LOGO = "/predicta-full.png";
const FULL_LOGO_WHITE = "/predicta-full-white.png";
const SYMBOL_LOGO = "/predicta-symbol.png";
const WORDMARK_LOGO = "/predicta-wordmark.png";
const WORDMARK_LOGO_WHITE = "/predicta-wordmark-white.png";

type LogoProps = {
  className?: string;
  variant?: "dark" | "light";
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">;

export function LogoFull({ className, variant = "light", ...rest }: LogoProps) {
  return (
    <img
      src={variant === "dark" ? FULL_LOGO : FULL_LOGO_WHITE}
      alt="PREDICTA"
      loading="eager"
      decoding="async"
      className={cn("h-7 w-auto select-none object-contain", className)}
      {...rest}
    />
  );
}

export function LogoSymbol({ className, ...rest }: Omit<LogoProps, "variant">) {
  return (
    <img
      src={SYMBOL_LOGO}
      alt="PREDICTA"
      loading="eager"
      decoding="async"
      className={cn("h-9 w-auto select-none object-contain", className)}
      {...rest}
    />
  );
}

export function LogoWordmark({ className, variant = "light", ...rest }: LogoProps) {
  return (
    <img
      src={variant === "dark" ? WORDMARK_LOGO : WORDMARK_LOGO_WHITE}
      alt="PREDICTA"
      loading="eager"
      decoding="async"
      className={cn("h-6 w-auto select-none object-contain", className)}
      {...rest}
    />
  );
}

/**
 * Large faint PREDICTA symbol used as a watermark inside cards.
 */
export function LogoWatermark({ className, ...rest }: Omit<LogoProps, "variant">) {
  return (
    <img
      src={SYMBOL_LOGO}
      alt=""
      aria-hidden
      className={cn(
        "pointer-events-none absolute select-none brightness-0 invert",
        "-right-8 -bottom-10 h-64 w-auto opacity-[0.08] sm:h-80 sm:-right-10 sm:-bottom-14",
        className,
      )}
      {...rest}
    />
  );
}