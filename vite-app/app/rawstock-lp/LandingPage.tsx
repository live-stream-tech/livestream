import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { 
  Radio, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  Award, 
  Zap,
  Camera,
  Edit3,
  ShoppingBag,
  Bell,
  Globe,
  Music,
  Heart,
  Mail,
  CheckCircle2,
  BarChart3,
  Flame,
  Layers,
  Settings2
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

// Assets (Using the specific Figma asset IDs provided)
import logoAsset from "figma:asset/da32ce1180d23d5a28e8ffcb227e16a2155b7d56.png";
import heroBgAsset from "figma:asset/309842f0ad72149da798df32c7ca400d2c1a681c.png";
import finalBgAsset from "figma:asset/7297cac4224d17f6386dfb8b7fc7e6ebcd88fab4.png";
import metalPatternAsset from "figma:asset/69679f731dbb4e472bf4a5e49e335dcaded790ad.png";

export default function LandingPage() {
  const navigate = useNavigate();

  const ecosystemRoles = [
    {
      title: "インディーズアーティスト / 地下アイドル",
      desc: "現場の熱量を動画レポートにして世界に届ける",
      icon: <Music size={24} className="text-[#0891B2]" />
    },
    {
      title: "ライバー",
      desc: "生配信で最大95%還元",
      icon: <Radio size={24} className="text-[#0891B2]" />
    },
    {
      title: "メンタルコーチ・講師",
      desc: "有料ライブ販売・個別セッションで直接収益化",
      icon: <Heart size={24} className="text-[#0891B2]" />
    },
    {
      title: "動画編集者",
      desc: "現場動画の編集依頼を受けて稼ぐ",
      icon: <Edit3 size={24} className="text-[#0891B2]" />
    },
    {
      title: "コミュニティ管理人",
      desc: "広告収益の70%がコミュニティへ還元",
      icon: <Users size={24} className="text-[#0891B2]" />
    },
    {
      title: "コンテスト賞金・イベント積立",
      desc: "コミュニティに貯まった資金でリアルイベント開催",
      icon: <Award size={24} className="text-[#0891B2]" />
    }
  ];

  const processFlow = [
    { step: "01", title: "現場でスマホ撮影", desc: "その場の生の熱気と一瞬を切り取る", icon: <Camera size={24} /> },
    { step: "02", title: "編集者に依頼", desc: "登録編集者に直接オーダー可能", icon: <Edit3 size={24} /> },
    { step: "03", title: "映像を販売", desc: "ライブレポート記事やセトリを動線に自然に導線", icon: <ShoppingBag size={24} /> },
    { step: "04", title: "次のライブ告知・集客", desc: "外部サイトへ導引して音源販売も", icon: <Bell size={24} /> }
  ];

  const revenueCases = [
    { name: "標準例", poster: "20%", artist: "60%", photographer: "10%", editor: "-", platform: "10%" },
    { name: "ファン重視", poster: "10%", artist: "50%", photographer: "30%", editor: "-", platform: "10%" },
    { name: "編集込み", poster: "10%", artist: "60%", photographer: "10%", editor: "10%", platform: "10%" },
    { name: "個人独占", poster: "90%", artist: "-", photographer: "-", editor: "-", platform: "10%" },
  ];

  const liveLevels = [
    { level: "Level 4", agency: "95%", individual: "75%", note: "最高ランク（基準クリア）" },
    { level: "Level 3", agency: "90%", individual: "70%", note: "上位基準クリア" },
    { level: "Level 2", agency: "80%", individual: "60%", note: "中間レベル" },
    { level: "Level 1", agency: "70%", individual: "50%", note: "初心者・新規" },
  ];

  const genres = ["ロック", "HIP-HOP", "アイドル", "ダンサー", "演劇", "芸人", "日常", "飲食店レポ", "海外旅行"];

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white selection:bg-[#0891B2]/30 font-sans overflow-x-hidden">
      {/* 
          Main Container: 
          Blue-gray (#334155) based industrial UI.
          Mobile-centric (max-w 540px).
      */}
      <div className="w-full max-w-[540px] mx-auto min-h-screen bg-[#334155] relative flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border-x border-white/5">
        
        {/* Layer 1: Background Infrastructure */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-noise opacity-20" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
          
          {/* Coordinate Annotations */}
          <div className="absolute top-20 left-4 text-[7px] font-black opacity-30 vertical-text tracking-widest uppercase">
            X_COORD_SYS_V4 // REF_MARKER_001
          </div>
          <div className="absolute top-20 right-4 text-[7px] font-black opacity-30 vertical-text tracking-widest uppercase">
            Y_COORD_SYS_V4 // REF_MARKER_002
          </div>
        </div>

        {/* Header - Centered Logo */}
        <header className="absolute top-0 left-0 right-0 z-[100] px-8 pt-[53px] flex flex-col items-center gap-2">
           <ImageWithFallback 
             src={logoAsset} 
             fallback={<div className="text-[#0891B2] font-black italic text-2xl tracking-tighter uppercase">RawStock</div>}
             className="h-[70px] w-auto object-contain"
             alt="RawStock Logo"
           />
           <div className="h-px w-24 bg-[#0891B2] mt-2" />
        </header>

        {/* Hero Section */}
        <section className="relative h-[90vh] min-h-[750px] flex flex-col items-center justify-start text-center px-8 pt-[190px]">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Repeating background pattern to show full width while filling height */}
            <div 
              className="absolute inset-0 opacity-80"
              style={{ 
                backgroundImage: `url(${heroBgAsset})`,
                backgroundSize: '120% auto',
                backgroundRepeat: 'repeat-y',
                backgroundPosition: 'center top'
              }}
            />
            {/* Overlay grid for industrial feel */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
            
            {/* Navy tint overlay */}
            <div className="absolute inset-0 bg-[#0a0f16]/20 mix-blend-multiply z-[5]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0f16]/90 z-10" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-30 flex flex-col items-center"
          >
            <div className="px-5 py-2 border border-[#0891B2] bg-white/10 text-[#0891B2] text-[11px] font-black tracking-[0.2em] uppercase mb-6 rounded-lg backdrop-blur-sm">
              Phase_01: Raw Protocol Enabled
            </div>
            
            <h1 className="font-black italic tracking-[-0.1em] uppercase leading-none mb-6 drop-shadow-2xl text-center">
              <span className="text-[42px] block text-white">
                <span className="bg-[#0891B2]/50 px-2 inline-block">ライブレポートを</span>
              </span>
              <span className="text-[32px] block mt-1 text-white">
                <span className="bg-[#0891B2]/50 px-2 inline-block">
                  <span className="text-[#ea580c] text-[46px] underline decoration-[8px] decoration-[#0891B2]/60 underline-offset-[-2px]">動画</span>にして売りませんか？
                </span>
              </span>
            </h1>

            <div className="flex flex-col items-center gap-12 w-full">
              <div className="h-14 w-[3px] bg-gradient-to-b from-transparent via-[#0891B2] to-transparent" />
              
              <div className="space-y-4 -mt-[110px]">
                <p className="text-xl text-white font-light italic leading-none tracking-[-0.05em] uppercase bg-[#0891B2]/10 px-6 py-2 border-y border-[#0891B2]/30">
                  個人開発で90%還元を実現しました
                </p>
              </div>

              <div className="bg-[#0a0f16]/50 border border-white/10 p-10 rounded-2xl max-w-[400px] text-center relative z-20">
                <p className="text-[13px] text-white/90 font-light leading-snug tracking-tight text-center">
                  生成AIで誰でも大量のコンテンツを作れる時代だから。<br />
                  AIには絶対に量産できない<span className="text-white font-bold">「生の熱量」</span>にこそ、<br />
                  本当の価値があると考えています。<br />
                  <span className="block mt-4 text-white/90">
                    現場の空気感、叫び、胸が熱くなる瞬間——<br />
                    それをRawのまま切り取りストックし、<br />
                    いつか世界に届ける。<br />
                    そんな場所を、今、作っています。
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Ecosystem - High Density */}
        <section className="py-24 px-8 bg-[#0a0f16] relative flex flex-col items-center">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black italic tracking-[-0.08em] uppercase mb-6 text-[#7dd3fc] leading-none">
              <span className="bg-[#0891B2]/20 px-2 inline-block">私たちが創る</span><br />
              <span className="bg-[#0891B2]/20 px-2 inline-block mt-1">共同経済圏</span>
            </h2>
            <div className="flex flex-col items-center">
              <div className="h-8 w-[2px] bg-[#0891B2] opacity-50" />
              <div className="px-6 py-2 border border-[#0891B2]/40 inline-block rounded-lg mb-4">
                <p className="text-[11px] font-black text-[#7dd3fc] tracking-[0.3em] uppercase">自分たちで回す、新しいエコシステム</p>
              </div>
              <div className="h-12 w-[2px] bg-gradient-to-b from-[#0891B2] to-transparent opacity-50" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full">
            {ecosystemRoles.map((role, i) => (
              <div key={i} className="bg-[#1a2331] border border-[#0891B2]/30 p-8 flex flex-col items-center text-center gap-6 group hover:bg-[#0891B2]/20 transition-all relative overflow-hidden">
                {/* Industrial Metal Pattern Overlay */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-35 mix-blend-overlay">
                  <ImageWithFallback 
                    src={metalPatternAsset} 
                    className="w-full h-full object-cover" 
                    alt="" 
                  />
                </div>
                
                <div className="w-14 h-14 bg-black border border-[#0891B2]/20 flex items-center justify-center group-hover:border-[#0891B2] transition-colors relative overflow-hidden z-10">
                   <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                   {role.icon}
                </div>
                <div className="relative z-10">
                  <h4 className="text-[18px] font-black italic uppercase tracking-tight mb-2 text-[#0891B2] transition-colors">{role.title}</h4>
                  <p className="text-[13px] opacity-60 font-bold leading-relaxed">{role.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Value Loop */}
        <section className="py-24 px-8 bg-[#334155] border-y border-white/10 relative flex flex-col items-center">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-5xl font-black italic tracking-[-0.08em] uppercase mb-2 leading-none">エコシステムの流れ</h2>
            <div className="h-2 w-16 bg-[#0891B2] mx-auto mb-4" />
          </div>

          <div className="relative w-full max-w-[380px] flex flex-col items-center">
            {/* Center Line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-10 bottom-10 w-[2px] bg-gradient-to-b from-[#0891B2] via-white to-[#0891B2] opacity-20" />
            
            <div className="space-y-16 w-full">
              {processFlow.map((p, i) => (
                <div key={i} className="flex flex-col items-center relative z-10 group">
                   <div className="w-16 h-16 bg-black border-4 border-white/10 flex flex-col items-center justify-center group-hover:border-[#0891B2] transition-colors shadow-2xl mb-4 relative">
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#0891B2] flex items-center justify-center text-[11px] font-black italic shadow-xl">
                        {p.step}
                      </div>
                      {p.icon}
                   </div>
                   <div className="text-center px-4">
                     <h4 className="text-2xl font-black italic tracking-[-0.05em] uppercase mb-1 leading-tight">{p.title}</h4>
                     <p className="text-[14px] text-white/60 font-bold leading-snug group-hover:text-white transition-colors">{p.desc}</p>
                   </div>
                </div>
              ))}
            </div>

            <div className="mt-16 flex flex-col items-center w-full max-w-[400px]">
               <div className="w-full flex flex-col items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-[#0891B2]/50 to-transparent" />
                  <div className="py-3 px-8 flex items-center gap-4 justify-center">
                    <span className="text-[14px] font-black tracking-[-0.05em] text-[#7dd3fc] uppercase whitespace-nowrap text-center">
                      資産がぐるぐる回り続ける<br />循環型モデル
                    </span>
                  </div>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-[#0891B2]/50 to-transparent" />
               </div>
               <div className="mt-4 flex flex-col items-center gap-1 opacity-20">
                  <div className="w-1 h-1 bg-[#0891B2] rounded-full" />
                  <div className="w-1 h-1 bg-[#0891B2] rounded-full" />
                  <div className="w-1 h-1 bg-[#0891B2] rounded-full" />
               </div>
            </div>
          </div>
        </section>

        {/* Revenue Details Section - Technical Dashboard */}
        <section className="py-24 px-6 bg-[#0a0f16] flex flex-col items-center overflow-hidden">
          <div className="mb-16 text-center">
             <h2 className="text-4xl font-black italic tracking-[-0.08em] uppercase leading-none">収益化の仕組み<span className="text-[#0891B2] block text-xl mt-2 tracking-[0.1em]">（詳細版）</span></h2>
          </div>

          {/* 1. Content Sales */}
          <div className="w-full space-y-12">
            <div className="border-l-8 border-[#0891B2] pl-6 py-2">
              <h3 className="text-2xl font-black italic tracking-[-0.05em] uppercase mb-1 leading-tight">1. コンテンツ販売</h3>
              <p className="text-[12px] font-bold text-white/50 uppercase tracking-widest leading-relaxed">動画レポート・写真・記事など</p>
            </div>

            <div className="bg-[#1a2331] border border-white/10 p-8 rounded-xl space-y-8">
              <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <span className="text-[13px] font-black uppercase text-white/40">基本還元率</span>
                <span className="text-6xl font-black italic tracking-tighter">90<span className="text-2xl text-[#0891B2]">%</span></span>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle2 size={18} className="text-[#0891B2] shrink-0 mt-1" />
                  <p className="text-[14px] font-bold leading-snug">売上の<span className="text-red-500">90%</span>が投稿者側へ<br /><span className="text-white/40 text-[12px]">（プラットフォーム手数料10%のみ）</span></p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 size={18} className="text-[#0891B2] shrink-0 mt-1" />
                  <p className="text-[14px] font-bold leading-snug">投稿時に<span className="text-red-500">自由に</span>協力者へ分配比率を設定可能</p>
                </div>
                <div className="flex items-start gap-4">
                  <Zap size={18} className="text-[#0891B2] shrink-0 mt-1" />
                  <p className="text-[14px] font-bold leading-snug text-[#0891B2]">AIが売上発生後、自動で分配（手動振込不要）</p>
                </div>
              </div>
            </div>

            {/* Case Table */}
            <div className="space-y-6">
              <p className="text-[12px] font-black text-[#0891B2] uppercase tracking-[0.3em] text-center">分配比率具体例（売上総額に対する比率）</p>
              <div className="bg-black border border-white/10 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                      <th className="p-4 border-r border-white/10">ケース</th>
                      <th className="p-4 border-r border-white/10">投稿者</th>
                      <th className="p-4 border-r border-white/10">アーティスト</th>
                      <th className="p-4 border-r border-white/10">撮影者</th>
                      <th className="p-4 border-r border-white/10">編集者</th>
                      <th className="p-4">PLATFORM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueCases.map((c, i) => (
                      <tr key={i} className="border-b border-white/5 text-[11px] font-bold hover:bg-white/5 transition-colors">
                        <td className="p-4 border-r border-white/10 bg-[#1a2331]">{c.name}</td>
                        <td className="p-4 border-r border-white/10">{c.poster}</td>
                        <td className="p-4 border-r border-white/10">{c.artist}</td>
                        <td className="p-4 border-r border-white/10">{c.photographer}</td>
                        <td className="p-4 border-r border-white/10">{c.editor}</td>
                        <td className="p-4 text-[#0891B2]">{c.platform}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[12px] text-white/50 font-bold leading-relaxed px-4 text-center">
                → 売上1万円の場合、標準例ならアーティストに6,000円、全体で合計9,000円（90%）が投稿者側に分配されるイメージ
              </p>
            </div>
          </div>

          {/* 2. Live Streaming */}
          <div className="w-full mt-24 space-y-12">
            <div className="border-l-8 border-[#0891B2] pl-6 py-2">
              <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">2. ライブ配信収益分配</h3>
              <p className="text-[12px] font-bold text-white/50 uppercase tracking-widest leading-relaxed">レベルと所属形態で還元率が決まります</p>
            </div>

            <div className="space-y-6">
              <div className="bg-black border border-white/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                      <th className="p-4 border-r border-white/10">レベル</th>
                      <th className="p-4 border-r border-white/10">事務所所属</th>
                      <th className="p-4 border-r border-white/10">個人活動</th>
                      <th className="p-4">備考</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveLevels.map((l, i) => (
                      <tr key={i} className="border-b border-white/5 text-[10px] font-bold hover:bg-white/5 transition-colors">
                        <td className="p-4 border-r border-white/10 bg-[#1a2331] font-black italic">{l.level}</td>
                        <td className="p-4 border-r border-white/10 text-white text-[12px]">{l.agency}</td>
                        <td className="p-4 border-r border-white/10 text-[#0891B2] text-[12px]">{l.individual}</td>
                        <td className="p-4 text-white/40">{l.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-[#1a2331]/50 p-8 space-y-6 text-[13px] leading-relaxed font-bold border border-white/5">
                 <p><span className="text-[#0891B2]">事務所所属の場合：</span>タレントマネジメントコスト（宣材写真、トラブル対応、契約管理など）を考慮した設計</p>
                 <p><span className="text-[#0891B2]">個人活動の場合：</span>手数料を抑えつつ、事務所並みのサポート（集客ツール・決済代行）を提供</p>
                 <p className="text-white/40 text-[11px] italic underline underline-offset-4">レベルアップ条件（例）：視聴維持率、売上継続、コミュニティ貢献度などで自動判定</p>
              </div>
            </div>
          </div>

          {/* 3. Community Ads */}
          <div className="w-full mt-24 space-y-12">
            <div className="border-l-8 border-[#0891B2] pl-6 py-2">
              <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2 leading-tight">3. アルゴリズムに依存しない、<br />自分で選ぶコミュニティ</h3>
              <p className="text-[12px] font-bold text-white/50 uppercase tracking-widest leading-relaxed">バナー広告枠の透明な収益分配</p>
            </div>

            <div className="bg-[#1a2331] border border-white/10 p-8 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                 <Settings2 size={40} className="text-white/5" />
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-black/40 border-l-2 border-[#0891B2]">
                  <p className="text-[14px] font-bold leading-relaxed italic">
                    「管理人＋モデレーターによる目利き選定で質を担保。アルゴリズム偏重ではなく、人間による推薦で本当に良いコンテンツが届く」
                  </p>
                </div>
                <div className="bg-black border border-white/10 p-6 space-y-4">
                   <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-[11px] font-black uppercase text-white/40 tracking-widest">広告単価目安</span>
                      <span className="text-xl font-black italic">メンバー数 × 7円 / 日</span>
                   </div>
                   <p className="text-[11px] text-[#0891B2] text-right italic font-bold">※最低保証 10,000円 / 月〜</p>
                </div>
                <div className="grid grid-cols-1 gap-4 text-[12px] font-black italic">
                   <div className="flex justify-between bg-white/5 p-4 items-center">
                      <span className="text-white/40">イベント積立</span>
                      <span>10%</span>
                   </div>
                   <div className="flex justify-between bg-[#0891B2] p-4 items-center text-black">
                      <span>管理人・モデレーター</span>
                      <span>70%</span>
                   </div>
                   <div className="flex justify-between bg-white/5 p-4 items-center">
                      <span className="text-white/40">PLATFORM</span>
                      <span>20%</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Genres & Global Management */}
          <div className="w-full mt-24 bg-[#334155] border-4 border-black p-10 space-y-10 shadow-[20px_20px_0_rgba(0,0,0,0.4)]">
             <div className="text-center">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-4">ジャンル別管理プロトコル</h3>
                <div className="flex flex-wrap justify-center gap-3">
                   {genres.map((g, i) => (
                     <span key={i} className="px-3 py-1 bg-black text-[#0891B2] text-[10px] font-black italic uppercase tracking-tighter border border-[#0891B2]/20">
                       {g}
                     </span>
                   ))}
                </div>
             </div>
             
             <div className="space-y-6 text-[13px] font-bold leading-relaxed text-center opacity-80">
                <p>上の階層には各ジャンル別のページを設けます。</p>
                <div className="bg-black border border-white/10 p-6 space-y-4 text-left">
                   <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-[11px] font-black uppercase text-white/40 tracking-widest">Genre Global Ads</span>
                      <span className="text-xl font-black italic">総メンバー数 × 5円 / 日</span>
                   </div>
                   <p className="text-[11px] text-[#0891B2] text-right italic font-bold">※ジャンル全体での合算単価</p>
                </div>
                <p className="text-white/60">
                  毎月1日、そのジャンルで最もメンバーが多いコミュニティの管理人が自動でジャンル管理人に就任。<br />
                  収益分配はコミュニティ同様の比率が適用されます。
                </p>
             </div>
          </div>
        </section>

        {/* Final Message Section */}
        <section className="relative py-32 px-10 flex flex-col items-center text-center overflow-hidden min-h-[600px] bg-[#0a0f16]">
          <div className="absolute inset-0 z-0 overflow-hidden flex items-start justify-center">
             <div className="w-full h-full relative">
               <ImageWithFallback 
                 src={finalBgAsset} 
                 fallback={<div className="w-full h-full bg-[#0a0f16]" />}
                 className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1] brightness-[0.7] opacity-40 scale-[0.85] shrink-0"
                 style={{ 
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)' 
                 }}
                 alt="Final Background"
               />
               <div className="absolute inset-0 bg-[#334155]/20 mix-blend-multiply" />
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0f16]/40 to-[#0a0f16]" />
             </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative z-20 max-w-[420px]"
          >
            <h2 className="text-2xl font-normal italic tracking-[0.1em] mb-12 text-white/90 underline decoration-[#0891B2]/40 underline-offset-8">最後に</h2>
            
            <div className="space-y-10 text-[16px] font-medium leading-relaxed text-white/90">
              <p className="text-[20px] font-medium italic tracking-tight mb-8 text-white">
                <span className="bg-[#0891B2]/40 px-2 py-1">まだ見ぬ世界の誰かに、この音を届けたい。</span>
              </p>
              
              <p>
                今はまだ小さい。でも最初から世界を狙っています。<br />
                運営の力がついたら、日本のインディーズが、<br />
                ベルリンの夜に、ソウルの路地に、ニューヨークの部屋に響く未来。
              </p>
              
              <div className="py-6 border-y border-white/10 bg-white/5">
                <p>
                  言葉はAIが繋いでくれる。<br />
                  でも震えとか、叫びとか、胸が熱くなる瞬間は——<br />
                  絶対に機械じゃ再現できない。
                </p>
              </div>

              <p className="text-lg text-white">
                RawStockは、それを、そのまま届ける場所です。<br />
                一緒に、このシーンをデカくしていきませんか？
              </p>
            </div>

            <div className="mt-20">
               <a 
                 href="mailto:rawstock.infomation@gmail.com" 
                 className="inline-block w-full bg-[#0891B2] text-white py-8 text-2xl font-black italic tracking-tighter uppercase hover:bg-white hover:text-black transition-all shadow-[0_20px_50px_rgba(8,145,178,0.3)] active:scale-[0.98] border-2 border-transparent hover:border-black"
               >
                 Contact Project
               </a>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-16 bg-black px-8 text-center border-t border-white/10">
           <div className="opacity-30 space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[1em]">RAWSTOCK_SYSTEM_v4.0</p>
              <p className="text-[10px] font-bold">© 2026 RAWSTOCK // SHIBUYA_NODE_2F</p>
           </div>
        </footer>
      </div>

      <style>{`
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
        .vertical-text {
          writing-mode: vertical-rl;
        }
      `}</style>
    </div>
  );
}
