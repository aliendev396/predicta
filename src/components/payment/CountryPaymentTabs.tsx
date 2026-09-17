import { cn } from "@/lib/utils";

export type PaymentCountry = "ghana" | "nigeria";

export interface CountryPaymentTabsProps {
  country: PaymentCountry;
  onChange: (country: PaymentCountry) => void;
  className?: string;
}

export function CountryPaymentTabs({ country, onChange, className }: CountryPaymentTabsProps) {
  return (
    <div className={cn("w-full max-w-md mx-auto space-y-1.5 text-center", className)}>
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 block">
        SELECT PAYMENT REGION
      </span>
      <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-200/70 rounded-full border border-slate-300/80 shadow-inner">
        <button
          type="button"
          onClick={() => onChange("ghana")}
          className={cn(
            "flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-full text-xs font-mono font-extrabold uppercase transition-all duration-300 cursor-pointer select-none",
            country === "ghana"
              ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-[1.02]"
              : "text-slate-700 hover:text-slate-950 hover:bg-white/50"
          )}
        >
          <span className="text-base leading-none">🇬🇭</span>
          <span>Ghanaians</span>
        </button>

        <button
          type="button"
          onClick={() => onChange("nigeria")}
          className={cn(
            "flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-full text-xs font-mono font-extrabold uppercase transition-all duration-300 cursor-pointer select-none",
            country === "nigeria"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]"
              : "text-slate-700 hover:text-slate-950 hover:bg-white/50"
          )}
        >
          <span className="text-base leading-none">🇳🇬</span>
          <span>Nigerians</span>
        </button>
      </div>
    </div>
  );
}
