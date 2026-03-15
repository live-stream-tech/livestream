import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Mail, Lock, User, CheckCircle2, ShieldCheck, CreditCard, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type AuthStep = "login" | "signup" | "kyc" | "complete";

export default function Auth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>("signup");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleNext = () => {
    if (step === "signup") setStep("kyc");
    else if (step === "kyc") setStep("complete");
    else if (step === "login") navigate("/");
  };

  const handleComplete = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#334155] text-white p-6 flex flex-col">
      <button onClick={() => navigate(-1)} className="mb-8 p-2 hover:bg-slate-700 w-fit rounded-full transition-colors">
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl font-black italic tracking-tighter mb-2 italic">CREATE ACCOUNT</h1>
                <p className="text-slate-400 text-sm">LiveStockへようこそ。まずはアカウントを作成しましょう。</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="text"
                      placeholder="ユーザー名"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#0891B2] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="email"
                      placeholder="メールアドレス"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#0891B2] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="password"
                      placeholder="パスワード"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#0891B2] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-[#0891B2] hover:bg-[#0891B2]/90 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl shadow-[#0891B2]/20 transition-all flex items-center justify-center gap-2 group"
              >
                Sign Up
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-center text-xs text-slate-500">
                アカウントをお持ちの方は{" "}
                <button onClick={() => setStep("login")} className="text-[#0891B2] font-bold hover:underline">
                  ログイン
                </button>
              </p>
            </motion.div>
          )}

          {step === "kyc" && (
            <motion.div
              key="kyc"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="p-4 bg-[#0891B2]/10 border border-[#0891B2]/20 rounded-2xl flex items-start gap-4 mb-4">
                <ShieldCheck className="text-[#0891B2] shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-sm text-[#0891B2]">本人確認が必要です</h3>
                  <p className="text-[10px] text-slate-400 mt-1">投げ銭や収益の受け取り、有料コンテンツの購入には、マイナンバーカードによる本人確認が必須となります。</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-black italic tracking-tight">IDENTITY VERIFICATION</h2>
                
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-center py-8 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50 group cursor-pointer hover:border-[#0891B2]/50 transition-all">
                    <div className="text-center">
                      <CreditCard className="mx-auto mb-3 text-slate-500 group-hover:text-[#0891B2] transition-colors" size={40} />
                      <p className="text-xs font-bold text-slate-400">マイナンバーカードの表面を撮影</p>
                      <p className="text-[9px] text-slate-600 mt-1">カメラを起動します</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <CheckCircle2 size={14} className="text-green-500" />
                      <span>公的書類による年齢確認</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <CheckCircle2 size={14} className="text-green-500" />
                      <span>不正利用・多重アカウント防止</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <CheckCircle2 size={14} className="text-green-500" />
                      <span>税務処理に必要な情報の確認</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("complete")}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                >
                  後でする
                </button>
                <button
                  onClick={handleNext}
                  className="flex-[2] bg-[#0891B2] hover:bg-[#0891B2]/90 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl shadow-[#0891B2]/20 transition-all"
                >
                  認証を開始
                </button>
              </div>
            </motion.div>
          )}

          {step === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 py-12"
            >
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              
              <div>
                <h1 className="text-3xl font-black italic tracking-tighter mb-2">WELCOME ABOARD</h1>
                <p className="text-slate-400 text-sm">登録が完了しました！<br />最高のコミュニティ体験をお楽しみください。</p>
              </div>

              <button
                onClick={handleComplete}
                className="w-full bg-white text-slate-900 py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-100 transition-all"
              >
                Get Started
              </button>
            </motion.div>
          )}

          {step === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl font-black italic tracking-tighter mb-2 italic">WELCOME BACK</h1>
                <p className="text-slate-400 text-sm">おかえりなさい。ログインして続きを楽しみましょう。</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="email"
                      placeholder="メールアドレス"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#0891B2] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="password"
                      placeholder="パスワード"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#0891B2] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-[#0891B2] hover:bg-[#0891B2]/90 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl shadow-[#0891B2]/20 transition-all"
              >
                Login
              </button>

              <p className="text-center text-xs text-slate-500">
                アカウントをお持ちでない方は{" "}
                <button onClick={() => setStep("signup")} className="text-[#0891B2] font-bold hover:underline">
                  新規登録
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
