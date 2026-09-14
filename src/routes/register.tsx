import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/PhoneInput";
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
      { title: "Create Account — PREDICTA" },
      { name: "description", content: "Create your PREDICTA account to access realtime virtual verdicts." },
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
  const labels = ["Weak", "Fair", "Good", "Strong", "Excellent"];
  const colors = ["bg-red-500", "bg-amber-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-600"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const rl = checkRegisterRateLimit();
    if (!rl.allowed) {
      return setError(`Too many registration attempts. Please wait ${formatRetryAfter(rl.retryAfterSeconds)} before trying again.`);
    }

    if (fullName.trim().length < 2) return setError("Please enter your full name.");

    const phoneVal = validateMobileNumber(phone);
    if (!phoneVal.isValid) {
      return setError(phoneVal.error ?? "Please enter a valid Ghana (10 digits) or Nigeria (11 digits) mobile number.");
    }

    if (password.length < 8) return setError("Passwords must be at least 8 characters.");

    const syntheticEmail = phoneVal.syntheticEmail;
    const finalReferralCode = isPartnerInvite ? "" : urlRef;

    setPending(true);

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
      // If email rate limit was exceeded or user already exists, attempt direct password sign-in fallback
      if (
        signUpError.message.toLowerCase().includes("rate limit") ||
        signUpError.message.toLowerCase().includes("already registered") ||
        signUpError.message.toLowerCase().includes("user already")
      ) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: syntheticEmail,
          password,
        });

        if (!signInError && signInData?.session) {
          setPending(false);
          setNotice("Signed in successfully.");
          navigate({ to: isPartnerInvite ? "/partner-apply" : "/dashboard", replace: true });
          return;
        }
      }

      setPending(false);
      if (signUpError.message.toLowerCase().includes("rate limit")) {
        return setError("Supabase email rate limit reached. If your account was already created, try logging in on the Sign In page, or disable 'Confirm Email' in Supabase Dashboard -> Auth settings.");
      }
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
        await supabase.rpc("register_partner_applicant" as never, {
          _user_id: newUserId,
          _phone: phoneVal.formattedDisplay,
        } as never);

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
      setNotice("Partner account created — awaiting approval...");
      navigate({ to: "/partner-apply", replace: true });
      return;
    }

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
    setNotice("Account created — continuing to registration...");
    navigate({ to: "/registration", replace: true });
  }

  return (
    <AuthBackground>
      <div className="space-y-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold tracking-widest border border-slate-800 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
            <span>{isPartnerInvite ? "PARTNER ONBOARDING // V4.2" : "WORKSPACE REGISTRATION // V4.2"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
            {isPartnerInvite ? "PARTNER ACCESS" : "CREATE ACCOUNT"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isPartnerInvite
              ? "Join as an authorized PREDICTA partner analyst to earn revenue shares."
              : "Register your mobile number to unlock instant AI vision predictions."}
          </p>
          {urlRef && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold mt-1">
              <span>INVITATION CODE:</span>
              <span className="font-bold tracking-wider">{urlRef}</span>
            </div>
          )}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
              Full Name
            </Label>
            <Input
              id="name"
              value={fullName}
              maxLength={80}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ama Mensah"
              required
              className="bg-slate-50/80 border-slate-200 text-slate-950 focus:border-red-600 focus:ring-2 focus:ring-red-600/15 rounded-xl h-11 sm:h-12 text-sm transition-all"
            />
          </div>

          <PhoneInput
            id="phone"
            label="Mobile Number"
            value={phone}
            onChange={(val) => setPhone(val)}
            required
          />

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-50/80 border-slate-200 text-slate-950 focus:border-red-600 focus:ring-2 focus:ring-red-600/15 rounded-xl h-11 sm:h-12 text-sm pr-11 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 px-3.5 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                        idx <= score ? colors[score] : "bg-slate-200"
                      )}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
                  <span>Security Strength:</span>
                  <span className="font-bold">{labels[score]}</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div role="alert" className="rounded-xl p-3 text-xs font-medium bg-red-50/90 border border-red-200 text-red-700 flex items-start gap-2">
              <span className="font-bold font-mono shrink-0">[ERROR]</span>
              <span>{error}</span>
            </div>
          )}
          {notice && (
            <div role="status" className="rounded-xl p-3 text-xs font-medium bg-emerald-50/90 border border-emerald-200 text-emerald-700 flex items-start gap-2">
              <span className="font-bold font-mono shrink-0">[INFO]</span>
              <span>{notice}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-11 sm:h-12 rounded-full bg-red-600 hover:bg-slate-950 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-red-600/20 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Creating Workspace...
              </span>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 text-center text-xs text-slate-500 border-t border-slate-100">
          Already registered?{" "}
          <Link to="/login" className="font-bold text-red-600 hover:text-slate-950 uppercase tracking-wider transition-colors">
            Log In Here
          </Link>
        </div>
      </div>
    </AuthBackground>
  );
}
