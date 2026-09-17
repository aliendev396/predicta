import { useState, useRef } from "react";
import { Check, Copy, Upload, X, ShieldCheck, ArrowUpRight, Loader2, Landmark, Smartphone, FileCheck } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NIGERIAN_PAYMENT_DETAILS, ngn } from "@/lib/data";
import { cn } from "@/lib/utils";

export interface NigerianPaymentFormProps {
  amountNgn: number;
  amountGhs: number;
  packageName?: string | null | undefined;
  isPending: boolean;
  onSubmit: (payload: { senderName: string; reference: string; proofFile: File | null }) => void;
  className?: string;
}

export function NigerianPaymentForm({
  amountNgn,
  amountGhs,
  packageName,
  isPending,
  onSubmit,
  className,
}: NigerianPaymentFormProps) {
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [reference, setReference] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyAccount = async () => {
    const acc = NIGERIAN_PAYMENT_DETAILS.accountNumber;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(acc);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = acc;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedAcc(true);
      toast.success("Account number copied!");
      setTimeout(() => setCopiedAcc(false), 2200);
    } catch {
      toast.error("Please copy account number manually.");
    }
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setProofFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP) of your receipt.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Receipt screenshot must be smaller than 15MB.");
      return;
    }

    setProofFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = senderName.trim();
    if (name.length < 2 || name.length > 80) {
      toast.error("Enter the bank account name you transferred from (2-80 characters).");
      return;
    }
    onSubmit({
      senderName: name,
      reference: reference.trim(),
      proofFile,
    });
  };

  return (
    <div className={cn("space-y-4 sm:space-y-5 text-slate-950", className)}>
      {/* Top Nigerian Payment Destination Box */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-2">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold block flex items-center gap-1.5">
              <span className="text-sm">🇳🇬</span> NIGERIAN BANK TRANSFER
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-200">
              {packageName ? `${packageName} Package` : "Account Activation"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyAccount}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
          >
            {copiedAcc ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" /> COPIED!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> COPY ACCOUNT
              </>
            )}
          </button>
        </div>

        {/* Big Amount Highlighted Banner */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase font-semibold">EXPECTED AMOUNT</p>
            <p className="text-3xl sm:text-4xl font-black font-sans text-emerald-400 tracking-tight">
              {ngn(amountNgn)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase">GHANA EQUIV:</span>
            <p className="text-sm font-bold font-mono text-slate-300">GH₵{amountGhs}</p>
          </div>
        </div>

        {/* Bank Account Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs font-mono">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[9px] text-slate-400 uppercase block font-semibold">BANK NAME</span>
            <span className="text-sm font-extrabold text-white tracking-wider">
              {NIGERIAN_PAYMENT_DETAILS.bankName}
            </span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[9px] text-slate-400 uppercase block font-semibold">ACCOUNT NUMBER</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono tracking-widest">
              {NIGERIAN_PAYMENT_DETAILS.accountNumber}
            </span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[9px] text-slate-400 uppercase block font-semibold">RECEIVER NAME</span>
            <span className="text-sm font-extrabold text-white uppercase tracking-wider">
              {NIGERIAN_PAYMENT_DETAILS.receiverName}
            </span>
          </div>
        </div>
      </div>

      {/* Guided Info Step-by-Step Card */}
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <Smartphone className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-950 font-mono">
              PAYMENT GUIDANCE & STEPS
            </h4>
            <p className="text-[11px] text-emerald-800 font-medium">
              Follow these simple steps to complete your bank transfer
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {NIGERIAN_PAYMENT_DETAILS.guidedSteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5 bg-white/90 p-2.5 rounded-xl border border-emerald-100 text-xs font-mono">
              <span className="size-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 shadow-xs">
                {idx + 1}
              </span>
              <span className="text-slate-800 font-medium text-[11px] leading-relaxed pt-0.5">
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* User Input & Proof Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-4">
        <div className="space-y-1.5 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900 flex items-center gap-2">
            <FileCheck className="size-4 text-emerald-600" />
            SUBMIT PAYMENT PROOF & DETAILS
          </h3>
          <p className="text-xs text-slate-500">
            Upload your receipt screenshot and enter your bank account sender name for instant admin verification.
          </p>
        </div>

        {/* Screenshot Upload Input Zone */}
        <div className="space-y-2">
          <Label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block">
            Payment Receipt Screenshot (Proof) <span className="text-emerald-600 font-bold">*</span>
          </Label>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />

          {previewUrl ? (
            <div className="relative rounded-2xl border-2 border-emerald-500/60 bg-emerald-50/30 p-3 flex items-center gap-3">
              <img
                src={previewUrl}
                alt="Receipt proof preview"
                className="size-16 object-cover rounded-xl border border-emerald-200 shadow-sm shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-xs font-bold text-slate-900 truncate">{proofFile?.name}</p>
                <p className="text-[10px] font-mono text-slate-500">
                  {proofFile ? (proofFile.size / 1024).toFixed(0) : 0} KB · Ready to submit
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 font-mono">
                  <Check className="size-3 text-emerald-600" /> Screenshot Attached
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleFileChange(null)}
                className="size-8 rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-600 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Remove screenshot"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition-all bg-slate-50/60 hover:bg-emerald-50/30 space-y-2"
            >
              <div className="size-10 rounded-full bg-white border border-slate-200 group-hover:border-emerald-300 flex items-center justify-center mx-auto text-slate-500 group-hover:text-emerald-600 shadow-xs transition-colors">
                <Upload className="size-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                  Click to attach payment receipt screenshot
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  PNG, JPG, or WebP screenshot of your bank transfer receipt
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sender Name Input */}
        <div className="space-y-2">
          <Label htmlFor="nigerian-sender" className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
            Your Bank Account Name (Paid From) <span className="text-red-600">*</span>
          </Label>
          <Input
            id="nigerian-sender"
            value={senderName}
            maxLength={80}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="e.g. FRANK CHINEDU / Full Name on your bank app"
            required
            className="bg-slate-50 border-slate-200 text-slate-950 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl h-12 text-sm"
          />
        </div>

        {/* Optional Reference Input */}
        <div className="space-y-2">
          <Label htmlFor="nigerian-ref" className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
            Bank Transaction Reference / Session ID (Optional)
          </Label>
          <Input
            id="nigerian-ref"
            value={reference}
            maxLength={80}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. NIP Session ID or Ref Number"
            className="bg-slate-50 border-slate-200 text-slate-950 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl h-12 text-sm"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 rounded-full bg-emerald-600 hover:bg-slate-950 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-emerald-600/20 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-4"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading Proof & Submitting...
            </span>
          ) : (
            <>
              Confirm & Submit Payment of {ngn(amountNgn)}
              <ArrowUpRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
