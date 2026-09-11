import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { LogoFull } from "@/components/brand/Logo";
import { AuthBackground } from "@/components/brand/AuthBackground";
import { supabase } from "@/integrations/supabase/client";
import { validateMobileNumber } from "@/lib/phone";
import { checkRegisterRateLimit, formatRetryAfter } from "@/lib/rateLimit";
import { cn } from "@/lib/utils";

type SearchParams = {
  ref?: string | undefined;
  partner?: boolean | undefined;
};

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const rawPartner = search["partner"];
    const isPartner =
      rawPartner === true ||
      rawPartner === 1 ||
      rawPartner === "1" ||
      rawPartner === "true" ||
      rawPartner === "";
    return {
      ref: typeof search["ref"] === "string" ? search["ref"] : undefined,
      partner: isPartner ? true : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Create Account â€” PREDICTA" },
      { name: "description", content: "Create your PREDICTA account, complete registration and get instant virtual verdicts from PREDICTA." },
      { property: "og:title", content: "Create Account â€” PREDICTA" },
      { property: "og:description", content: "Join PREDICTA and start analyzing screenshots with AI." },
    ],
  }),
  component: RegisterPage,
});

function strength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function RegisterPage() {
  const navigate = useNavigate();
  const { ref, partner } = Route.useSearch();
  const isPartnerInvite = partner === true;
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const urlRef = (ref ?? "").trim().toUpperCase().slice(0, 16);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.session.user.id)
          .maybeSingle();

        if (!profile) {
          // Zombie session from a deleted account: wipe it so registration is fresh!
          await supabase.auth.signOut();
          return;
        }

        if (isPartnerInvite) {
          navigate({ to: "/partner-apply", replace: true });
        } else {
          navigate({ to: "/dashboard", replace: true });
        }
      }
    });
  }, [navigate, isPartnerInvite]);

  const score = strength(password);
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];
  const colors = ["bg-destructive", "bg-destructive", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const rl = checkRegisterRateLimit();
    if (!rl.allowed) {
      return setError(`Too many registration attempts. Please wait ${formatRetryAfter(rl.retryAfterSeconds)} before trying again.`);
    }

    if (fullName.trim().length < 2) return setError("Please enter your full name.");

    // Validate Ghana or Nigeria mobile phone
    const phoneVal = validateMobileNumber(phone);
    if (!phoneVal.isValid) {
      return setError(phoneVal.error ?? "Please enter a valid Ghana (10 digits) or Nigeria (11 digits) mobile number.");
    }

    if (password.length < 8) return setError("Passwords must be at least 8 characters.");

    const syntheticEmail = phoneVal.syntheticEmail;
    const finalReferralCode = isPartnerInvite ? "" : urlRef;

    setPending(true);

    // Clear any previous session first so new signup is 100% clean
    await supabase.auth.signOut().catch(() => {});

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: syntheticEmail,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName.trim().slice(0, 80),
          phone: phoneVal.formattedDisplay,
          referral_code: finalReferralCode,
          partner_applicant: isPartnerInvite ? "true" : undefined,
        },
      },
    });

    if (signUpError) {
      setPending(false);
      return setError(signUpError.message);
    }

    if (isPartnerInvite) {
      let newUserId = data.user?.id ?? data.session?.user?.id ?? "";
      if (!data.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: syntheticEmail,
          password,
        });
        if (signInError) {
          setPending(false);
          return setError(signInError.message);
        }
        newUserId = signInData.user?.id ?? newUserId;
      }

      if (newUserId) {
        // 1. Call secure RPC to mark as partner applicant and waive registration fee
        await supabase.rpc("register_partner_applicant" as never, {
          _user_id: newUserId,
          _phone: phoneVal.formattedDisplay,
        } as never);

        // 2. Direct upsert fallback
        await Promise.allSettled([
          supabase
            .from("profiles")
            .update({
              partner_applicant: true,
              registration_paid: true,
              phone: phoneVal.formattedDisplay,
            })
            .eq("id", newUserId),
          supabase.from("partner_applications").upsert(
            {
              user_id: newUserId,
              audience: "Partner link invite",
              motivation: "Registered via partner invitation link",
              payout_method: phoneVal.country === "GH" ? "MTN MoMo" : "Bank transfer",
              payout_details: phoneVal.formattedDisplay,
              status: "pending",
            },
            { onConflict: "user_id" },
          ),
        ]);
      }

      setPending(false);
      setNotice("Partner account created â€” awaiting approvalâ€¦");
      navigate({ to: "/partner-apply", replace: true });
      return;
    }

    // Log the new regular member straight in â€” the registration fee screen follows.
    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password,
      });
      if (signInError) {
        setPending(false);
        return setError(signInError.message);
      }
    }
    setPending(false);
    setNotice("Account created â€” continuing to your registrationâ€¦");
    navigate({ to: "/registration", replace: true });
  }

  return (
    <AuthBackground>
      <Link to="/" className="flex justify-center" aria-label="PREDICTA home">
        <div
          className="inline-flex items-center rounded-xl px-5 py-2.5 transition-all hover:scale-[1.02]"
          style={{ background: "#FFFFFF", border: "1px solid #E8EDF3", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <LogoFull className="h-7" />
        </div>
      </Link>

      {/* Status chip */}
      <div className="mt-5 flex justify-center">
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[10px] font-bold tracking-widest"
          style={{ border: "1px solid #D1FAE5", background: "#F0FDF4", color: "#059669" }}
        >
          <span className="size-1.5 rounded-full bg-emerald-400 animate-status-blink" />
          SECURE REGISTRATION CHANNEL
        </div>
      </div>

      <div
        className="mt-6 rounded-2xl p-6 sm:p-8"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E8EDF3",
          boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 20px 50px rgba(0,0,0,0.07), 0 0 0 1px rgba(228,24,39,0.06)",
          backdropFilter: "blur(16px)",
        }}
      >
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#F0F0F0" }}>
          {isPartnerInvite ? "Partner registration" : "Create your account"}
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: "rgba(240,240,240,0.50)" }}>
          {isPartnerInvite
            ? "Create your account to access your partner hub immediately â€” no registration fee."
            : "Create your account with your mobile phone number to continue."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name" style={{ color: "rgba(240,240,240,0.70)" }}>Full name</Label>
            <Input id="name" value={fullName} maxLength={80} onChange={(e) => setFullName(e.target.value)} placeholder="Ama Mensah" required
              style={{ background: "#F8F9FB", border: "1px solid #E2E8F0", color: "#0F172A" }}
            />
          </div>

          <PhoneInput
            id="phone"
            label="Mobile number"
            value={phone}
            onChange={(val) => setPhone(val)}
            required
          />

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors",
                        idx <= score ? colors[score] : "bg-muted",
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{labels[score]}</span>
              </div>
            )}
          </div>
          {error && (
            <p role="alert" className="rounded-xl px-3 py-2.5 text-sm" style={{ background: "rgba(228,24,39,0.12)", border: "1px solid #E8EDF3", color: "#f87171" }}>
              {error}
            </p>
          )}
          {notice && <p className="rounded-xl px-3 py-2.5 text-sm border border-emerald-200 bg-emerald-50 text-emerald-700">{notice}</p>}
          <button
            type="submit"
            className="w-full rounded-xl py-3 text-sm font-bold font-mono tracking-widest text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            disabled={pending}
            style={{ background: "linear-gradient(135deg, #E41827, #B00D1A)", border: "1px solid rgba(228,24,39,0.5)", boxShadow: "0 6px 20px rgba(228,24,39,0.25)" }}
          >
            {pending && <Loader2 className="mr-2 size-4 animate-spin inline" />}
            CREATE ACCOUNT
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "rgba(240,240,240,0.45)" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-medium transition-colors hover:text-red-400" style={{ color: "#f87171" }}>
            Log in
          </Link>
        </p>
      </div>
    </AuthBackground>
  );
}


