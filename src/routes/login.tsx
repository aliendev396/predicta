import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoFull } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { resolveLoginEmail } from "@/lib/auth.functions";
import { useServerFn } from "@tanstack/react-start";
import { AuthBackground } from "@/components/brand/AuthBackground";
import { checkLoginRateLimit, formatRetryAfter } from "@/lib/rateLimit";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log In — PREDICTA" },
      { name: "description", content: "Sign in to your PREDICTA workspace to access realtime virtual match predictions." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const resolveEmail = useServerFn(resolveLoginEmail);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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

        const [roleRes, profileRes, appRes] = await Promise.all([
          supabase.from("user_roles").select("role").eq("user_id", data.session.user.id),
          supabase.from("profiles").select("partner_applicant").eq("id", data.session.user.id).maybeSingle(),
          supabase.from("partner_applications").select("id, status").eq("user_id", data.session.user.id).maybeSingle(),
        ]);
        const roles = (roleRes.data ?? []).map((r) => r.role);
        const isApplicant =
          profileRes.data?.partner_applicant === true ||
          data.session.user.user_metadata?.["partner_applicant"] === "true" ||
          Boolean(appRes.data?.id);

        if (roles.includes("partner") && !roles.includes("admin")) {
          navigate({ to: "/partner", replace: true });
        } else if (!roles.includes("admin") && isApplicant) {
          navigate({ to: "/partner-apply", replace: true });
        } else {
          navigate({ to: "/dashboard", replace: true });
        }
      }
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const rl = checkLoginRateLimit();
    if (!rl.allowed) {
      return setError(`Too many login attempts. Please wait ${formatRetryAfter(rl.retryAfterSeconds)} before trying again.`);
    }

    const raw = identifier.trim();
    const cleanDigits = raw.replace(/\D/g, "");
    if (cleanDigits.length < 9) {
      return setError("Please enter a valid phone number (e.g. 024 123 4567).");
    }
    if (password.length < 6) return setError("Please enter your password.");

    setPending(true);
    const isEmail = raw.includes("@");

    let finalSignInData: { user: any } | null = null;
    let lastErrorMessage = "Invalid phone number or password.";

    if (isEmail) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: raw,
        password,
      });
      if (signInError) {
        setPending(false);
        return setError(signInError.message === "Invalid login credentials" ? "Invalid email or password." : signInError.message);
      }
      finalSignInData = signInData;
    } else {
      const candidateEmails: string[] = [];

      try {
        const resolved = await resolveEmail({ data: { phone: raw } });
        if (resolved.email) candidateEmails.push(resolved.email);
      } catch {
        // ignore
      }

      if (cleanDigits.startsWith("233") || cleanDigits.startsWith("02") || cleanDigits.startsWith("05")) {
        const ghDigits = cleanDigits.startsWith("233") ? cleanDigits : `233${cleanDigits.replace(/^0+/, "")}`;
        candidateEmails.push(`${ghDigits}@phone.PREDICTA.live`);
      }
      if (cleanDigits.startsWith("234") || cleanDigits.startsWith("08") || cleanDigits.startsWith("07") || cleanDigits.startsWith("09")) {
        const ngDigits = cleanDigits.startsWith("234") ? cleanDigits : `234${cleanDigits.replace(/^0+/, "")}`;
        candidateEmails.push(`${ngDigits}@phone.PREDICTA.live`);
      }

      candidateEmails.push(`${cleanDigits}@phone.PREDICTA.live`);
      if (cleanDigits.startsWith("0")) {
        candidateEmails.push(`${cleanDigits.replace(/^0+/, "")}@phone.PREDICTA.live`);
      }

      if (cleanDigits.length >= 9) {
        candidateEmails.push(`${cleanDigits.slice(-9)}@phone.PREDICTA.live`);
      }
      if (cleanDigits.length >= 10) {
        candidateEmails.push(`${cleanDigits.slice(-10)}@phone.PREDICTA.live`);
      }

      const uniqueCandidates = Array.from(new Set(candidateEmails));

      for (const emailToTry of uniqueCandidates) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: emailToTry,
          password,
        });
        if (!signInError && signInData.user) {
          finalSignInData = signInData;
          break;
        } else if (signInError) {
          lastErrorMessage = signInError.message === "Invalid login credentials" ? "Invalid phone number or password." : signInError.message;
        }
      }

      if (!finalSignInData?.user) {
        setPending(false);
        return setError(lastErrorMessage);
      }
    }

    setPending(false);

    if (finalSignInData.user) {
      const [roleRes, profileRes, appRes] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", finalSignInData.user.id),
        supabase.from("profiles").select("partner_applicant").eq("id", finalSignInData.user.id).maybeSingle(),
        supabase.from("partner_applications").select("id, status").eq("user_id", finalSignInData.user.id).maybeSingle(),
      ]);
      const roles = (roleRes.data ?? []).map((r) => r.role);
      const isApplicant =
        profileRes.data?.partner_applicant === true ||
        finalSignInData.user.user_metadata?.["partner_applicant"] === "true" ||
        Boolean(appRes.data?.id);

      if (roles.includes("partner") && !roles.includes("admin")) {
        navigate({ to: "/partner", replace: true });
        return;
      }
      if (!roles.includes("admin") && isApplicant) {
        navigate({ to: "/partner-apply", replace: true });
        return;
      }
    }
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <AuthBackground>
      <div className="space-y-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold tracking-widest border border-slate-800 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span>AUTHENTICATION GATEWAY // V4.2</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
            SIGN IN TO PREDICTA
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Enter your credentials to access your real-time virtual match intelligence workspace.
          </p>
        </div>

        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="024 123 4567"
              required
              className="bg-slate-50/80 border-slate-200 text-slate-950 focus:border-red-600 focus:ring-2 focus:ring-red-600/15 rounded-xl h-11 sm:h-12 text-sm transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                Password
              </Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating Session...
              </span>
            ) : (
              <>
                Authenticate Access
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 text-center text-xs text-slate-500 border-t border-slate-100">
          Do not have an account yet?{" "}
          <Link to="/register" className="font-bold text-red-600 hover:text-slate-950 uppercase tracking-wider transition-colors">
            Register Account
          </Link>
        </div>
      </div>
    </AuthBackground>
  );
}
