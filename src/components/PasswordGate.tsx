import React, { useState } from "react";
import { Lock, KeyRound, ShieldAlert, ArrowRight, Eye, EyeOff } from "lucide-react";

interface PasswordGateProps {
  onUnlock: () => void;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({ onUnlock }) => {
  const [inputCode, setInputCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputCode.trim();
    // パスワード 4578 (および互換パスコード)
    if (cleanCode === "4578" || cleanCode === "238923") {
      setErrorMsg("");
      sessionStorage.setItem("app_unlocked_4578", "true");
      onUnlock();
    } else {
      setAttempts((prev) => prev + 1);
      setErrorMsg("パスワードが正しくありません。");
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-mono flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border-2 border-[#141414] shadow-hard p-6 sm:p-8 relative">
        {/* Top Header Tag */}
        <div className="flex items-center justify-between border-b-2 border-[#141414] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#141414] text-[#E4E3E0]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight uppercase">
                QUANT-AI ACCESS GATE
              </h1>
              <p className="text-[10px] opacity-70">
                パスワード保護システム // AUTHORIZATION REQUIRED
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-[#E4E3E0] border border-[#141414] px-2 py-0.5 uppercase">
            PROTECTED
          </span>
        </div>

        {/* Lock Icon Banner */}
        <div className="bg-[#E4E3E0]/60 border border-[#141414] p-4 text-center mb-6">
          <div className="inline-flex p-3 bg-[#141414] text-[#E4E3E0] mb-2 shadow-hard-sm">
            <KeyRound className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#141414]">
            パスワードを入力してログイン
          </p>
          <p className="text-[11px] text-[#141414]/70 mt-1">
            本システムは保護されています。パスワード（4578）を入力してください。
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-1.5 flex justify-between">
              <span>ENTER PASSCODE</span>
              <span className="text-[10px] text-emerald-800 font-bold">SECURE GATE (非表示入力)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="••••"
                autoFocus
                maxLength={20}
                className="w-full bg-[#E4E3E0]/30 border-2 border-[#141414] text-[#141414] font-mono text-center text-2xl tracking-[0.3em] py-3 pr-10 focus:outline-none focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#141414] p-1 cursor-pointer transition-colors"
                title={showPassword ? "パスワードを非表示にする" : "パスワードを表示する"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-100 border border-[#141414] text-xs font-bold text-red-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setInputCode("");
                setErrorMsg("");
              }}
              className="w-1/3 bg-[#E4E3E0] hover:bg-[#141414] hover:text-[#E4E3E0] border border-[#141414] py-2 text-[11px] font-bold uppercase transition-all cursor-pointer"
            >
              クリア
            </button>
            <button
              type="submit"
              className="w-2/3 bg-[#141414] hover:bg-[#141414]/90 text-[#E4E3E0] border border-[#141414] py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-hard-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <span>ログイン (UNLOCK)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-[#141414]/20 text-center text-[10px] opacity-60">
          GMO FX AI Quant System | Protected Session
        </div>
      </div>
    </div>
  );
};
