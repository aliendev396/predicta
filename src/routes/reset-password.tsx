import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoFull } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { AuthBackground } from "@/components/brand/AuthBackground";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — PREDICTA" },
      { name: "description", content: "Choose a new password for your PREDICTA account." },
      { property: "og:title", content: "Reset Password — PREDICTA" },
      { property: "og:description", content: "Set a new password and get back into your PREDICTA workspace." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");
    setPending(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (updateError) return setError(updateError.message);
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <AuthBackground>
      <div className="space-y-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold tracking-widest border border-slate-800 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
            <span>CREDENTIAL RECOVERY // V4.2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
            Set New Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Choose a strong password with at least 8 characters to secure your workspace.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">New Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-50/80 border-slate-200 text-slate-950 focus:border-red-600 focus:ring-2 focus:ring-red-600/15 rounded-xl h-11 sm:h-12 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">Confirm Password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="bg-slate-50/80 border-slate-200 text-slate-950 focus:border-red-600 focus:ring-2 focus:ring-red-600/15 rounded-xl h-11 sm:h-12 text-sm"
            />
          </div>
          {error && (
            <div role="alert" className="rounded-xl p-3 text-xs font-medium bg-red-50/90 border border-red-200 text-red-700 flex items-start gap-2">
              <span className="font-bold font-mono shrink-0">[ERROR]</span>
              <span>{error}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full h-11 sm:h-12 rounded-full bg-red-600 hover:bg-slate-950 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-red-600/20 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </AuthBackground>
  );
}
