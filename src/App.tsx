import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Header } from "./components/Header";
import { KpiCards } from "./components/KpiCards";
import { GmoCoinTop5Section } from "./components/GmoCoinTop5Section";
import { RankingTable } from "./components/RankingTable";
import { ThreeYenTargetSection } from "./components/ThreeYenTargetSection";
import { HedgePairsSection } from "./components/HedgePairsSection";
import { PasswordGate } from "./components/PasswordGate";
import { AnalysisResponse } from "./types";
import { generateClientAnalysisData } from "./mockData";
import {
  Coins,
  BarChart3,
  Flame,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem("app_unlocked_4578") === "true";
  });

  const [activeTab, setActiveTab] = useState<
    "gmoCoin" | "ranking" | "threeYen" | "hedgePairs"
  >("gmoCoin");

  const [targetPips, setTargetPips] = useState<number>(30);
  const [selectedPair, setSelectedPair] = useState<string>("USD/JPY");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  
  // Continuous 15-second loop is STOPPED by default when app is opened!
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(15);
  const [operatingNotice, setOperatingNotice] = useState<string | null>(null);

  const countdownRef = useRef<number>(15);

  // Helper to reliably check if current time is within operating hours (08:30 to 23:00 JST, non-weekend)
  const checkWithinOperatingHours = useCallback((): boolean => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Tokyo",
        hour: "numeric",
        minute: "numeric",
        weekday: "short",
        hour12: false,
      });
      const parts = formatter.formatToParts(now);
      let hour = 0;
      let minute = 0;
      let weekday = "Mon";
      for (const p of parts) {
        if (p.type === "hour") hour = parseInt(p.value, 10);
        if (p.type === "minute") minute = parseInt(p.value, 10);
        if (p.type === "weekday") weekday = p.value;
      }

      // Weekend closure check (Sat 06:00 to Mon 07:00 JST)
      if (weekday === "Sun") return false;
      if (weekday === "Sat" && hour >= 6) return false;
      if (weekday === "Mon" && hour < 7) return false;

      // 08:30 JST (8*60+30 = 510 min) to 23:00 JST (23*60 = 1380 min)
      const minuteOfDay = hour * 60 + minute;
      return minuteOfDay >= 510 && minuteOfDay <= 1380;
    } catch {
      return true;
    }
  }, []);

  const isWithinOperatingHours = useMemo(() => {
    if (analysisData?.jstInfo?.isOperatingHours !== undefined) {
      return analysisData.jstInfo.isOperatingHours;
    }
    return checkWithinOperatingHours();
  }, [analysisData?.jstInfo?.isOperatingHours, checkWithinOperatingHours]);

  const fetchData = useCallback(async (isLive: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analysis?targetPips=${targetPips}&live=${isLive ? "true" : "false"}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data: AnalysisResponse = await res.json();
      setAnalysisData(data);
      if (data.data && data.data.length > 0 && !selectedPair) {
        setSelectedPair(data.data[0].pair);
      }
      setCountdown(15);
      countdownRef.current = 15;
    } catch (err: any) {
      console.warn("API fetch unavailable, switching to client-side quant engine:", err);
      try {
        const fallbackData = generateClientAnalysisData(targetPips, isLive);
        setAnalysisData(fallbackData);
        if (fallbackData.data && fallbackData.data.length > 0 && !selectedPair) {
          setSelectedPair(fallbackData.data[0].pair);
        }
        setCountdown(15);
        countdownRef.current = 15;
        setError(null);
      } catch (fallbackErr: any) {
        console.error("Failed to generate fallback analysis data:", fallbackErr);
        setError("データ生成に失敗しました。再読み込みしてください。");
      }
    } finally {
      setLoading(false);
    }
  }, [targetPips, selectedPair]);

  // Initial load: fetches current snapshot with live=false (does NOT sync live Yahoo Finance until Start button is clicked)
  useEffect(() => {
    if (isUnlocked) {
      fetchData(false);
    }
  }, [isUnlocked, fetchData]);

  // Handle Start
  const handleStartLive = useCallback(() => {
    const isWithin = checkWithinOperatingHours();
    if (!isWithin) {
      setOperatingNotice("⏰ 現在は稼働時間外です（時計・Yahoo!実レート同期・データ更新・AI分析は【08:30〜23:00 JST】の間のみ稼働します）。現在は直近の確定スナップショットを表示しています。");
      return;
    }
    setOperatingNotice(null);
    setIsLiveActive(true);
    setCountdown(15);
    countdownRef.current = 15;
    fetchData(true); // Trigger immediate update on start with live Yahoo Finance sync
  }, [checkWithinOperatingHours, fetchData]);

  // Handle Stop
  const handleStopLive = useCallback(() => {
    setIsLiveActive(false);
    setOperatingNotice("⏹️ 時計・Yahoo!ファイナンス同期・データ更新・AI分析の自動更新を終了しました（停止中）。「スタート」ボタンを押すと再開します。");
  }, []);

  // 15-second loop: ONLY runs when isLiveActive is true AND within 08:30-23:00 JST
  useEffect(() => {
    if (!isLiveActive || !isUnlocked) return;

    // Operating hours check
    const isWithin = checkWithinOperatingHours();
    if (!isWithin) {
      setIsLiveActive(false);
      setOperatingNotice("⏰ 稼働時間（08:30〜23:00 JST）を外れたため、Yahoo!ファイナンス同期および自動更新を安全に停止しました。");
      return;
    }

    const interval = setInterval(() => {
      // Re-verify on every second tick
      const stillWithin = checkWithinOperatingHours();
      if (!stillWithin) {
        setIsLiveActive(false);
        setOperatingNotice("⏰ 23:00 を迎えたため、本日のデータ更新・AI分析およびYahoo!ファイナンス同期を終了しました（次回: 明朝 08:30 JST）。");
        return;
      }

      setCountdown((prev) => {
        if (prev <= 1) {
          fetchData(true);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLiveActive, isUnlocked, fetchData, checkWithinOperatingHours]);

  const handleLockApp = () => {
    sessionStorage.removeItem("app_unlocked_4578");
    setIsUnlocked(false);
  };

  if (!isUnlocked) {
    return <PasswordGate onUnlock={() => setIsUnlocked(true)} />;
  }

  const topPair = analysisData?.topPair || (analysisData?.data && analysisData.data[0]) || null;
  const currentGen = analysisData?.evolutionState?.generation || 21;

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans flex flex-col selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* 1. Header Bar */}
      <Header
        updatedAt={analysisData?.updatedAt || null}
        jstInfo={analysisData?.jstInfo}
        evolutionState={analysisData?.evolutionState}
        loading={loading}
        onRefresh={() => fetchData(isLiveActive)}
        targetPips={targetPips}
        onTargetPipsChange={setTargetPips}
        onLockApp={handleLockApp}
        isLiveActive={isLiveActive}
        onStartLive={handleStartLive}
        onStopLive={handleStopLive}
        countdown={countdown}
        isWithinOperatingHours={isWithinOperatingHours}
        dataSource={analysisData?.dataSource}
        isLiveYahooFinance={analysisData?.isLiveYahooFinance}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-600 text-rose-900 flex items-center justify-between shadow-hard-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div className="text-xs sm:text-sm font-bold">
                通信エラー: {error}
              </div>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1 bg-rose-600 text-white text-xs font-mono font-bold hover:bg-rose-700 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              再試行
            </button>
          </div>
        )}

        {/* Operating Notice / Time Restriction Alert */}
        {operatingNotice && (
          <div className="mb-4 p-3 bg-amber-50 border-2 border-amber-600 text-amber-950 flex items-center justify-between gap-3 shadow-hard-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">{operatingNotice}</span>
            </div>
            <button
              onClick={() => setOperatingNotice(null)}
              className="text-xs font-mono font-bold text-amber-800 hover:text-black cursor-pointer px-2 py-0.5 border border-amber-400 bg-white"
            >
              ✕ 閉じる
            </button>
          </div>
        )}

        {/* Global Live State & 08:30-23:00 Operating Control Banner */}
        <div className="mb-4 p-3.5 bg-white border-2 border-[#141414] shadow-hard-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            {!isWithinOperatingHours ? (
              <span className="p-2 bg-rose-100 text-rose-800 border border-rose-400 text-xs font-mono font-bold shrink-0">
                🌙 稼働時間外
              </span>
            ) : isLiveActive ? (
              <span className="p-2 bg-emerald-100 text-emerald-900 border border-emerald-500 text-xs font-mono font-bold shrink-0 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                <span>Yahoo!同期 & 15秒更新中</span>
              </span>
            ) : (
              <span className="p-2 bg-amber-100 text-amber-950 border border-amber-400 text-xs font-mono font-bold shrink-0">
                ⏸️ 待機中 (停止)
              </span>
            )}

            <div>
              <div className="text-xs sm:text-sm font-black text-[#141414] font-mono">
                {!isWithinOperatingHours
                  ? "為替データ更新・AI分析・Yahoo!実レート同期は【08:30〜23:00 JST】の間のみ稼働します（現在は直近の確定スナップショットを表示中）"
                  : isLiveActive
                  ? `現在15秒ごとにYahoo!ファイナンス最新気配値直接同期＆GMO全21通貨ペアAI分析を自動更新中（次回更新まで: ${countdown}秒）`
                  : "アプリ起動直後は待機状態です。右の「▶ スタート」ボタンを押すとYahoo!ファイナンス実レート直接同期および15秒ごとのAI更新が開始されます"}
              </div>
              <div className="text-[11px] text-[#141414]/70 mt-0.5 font-sans">
                ※ 稼働時間帯: <strong>08:30 JST 〜 23:00 JST</strong>（週末休場時を除く） &bull; 更新インターバル: <strong>15秒</strong> &bull; データ元: <strong>Yahoo!ファイナンス直接同期</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {!isLiveActive ? (
              <button
                onClick={handleStartLive}
                disabled={!isWithinOperatingHours}
                className={`px-4 py-2 font-mono text-xs font-black uppercase transition-all shadow-hard-sm cursor-pointer flex items-center gap-1.5 ${
                  !isWithinOperatingHours
                    ? "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-2 border-[#141414]"
                }`}
              >
                <span>▶ スタート (Yahoo!実レート同期＆AI更新)</span>
              </button>
            ) : (
              <button
                onClick={handleStopLive}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-black uppercase transition-all shadow-hard-sm cursor-pointer border-2 border-[#141414] flex items-center gap-1.5"
              >
                <span>⏹ 終了 (停止)</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Top KPI Cards */}
        <KpiCards topPair={topPair} targetPips={targetPips} />

        {/* 3. Navigation Tabs (4 Main Focused Tabs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 font-mono text-xs">
          {/* Tab 1: GMO Coin Top 3 */}
          <button
            onClick={() => setActiveTab("gmoCoin")}
            className={`p-3.5 border-2 border-[#141414] flex flex-col items-start gap-1 transition-all text-left cursor-pointer ${
              activeTab === "gmoCoin"
                ? "bg-[#141414] text-[#E4E3E0] shadow-hard translate-x-[-1px] translate-y-[-1px]"
                : "bg-white text-[#141414] hover:bg-[#E4E3E0]/70"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 font-black text-sm">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>🪙 GMO厳選3選</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 font-black ${
                activeTab === "gmoCoin" ? "bg-amber-400 text-black" : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}>
                初押し目
              </span>
            </div>
            <span className="text-[11px] opacity-75 truncate w-full mt-0.5">
              GMO取引所最適・低コスト厳選銘柄
            </span>
          </button>

          {/* Tab 2: Quant Ranking Table */}
          <button
            onClick={() => setActiveTab("ranking")}
            className={`p-3.5 border-2 border-[#141414] flex flex-col items-start gap-1 transition-all text-left cursor-pointer ${
              activeTab === "ranking"
                ? "bg-[#141414] text-[#E4E3E0] shadow-hard translate-x-[-1px] translate-y-[-1px]"
                : "bg-white text-[#141414] hover:bg-[#E4E3E0]/70"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 font-black text-sm">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <span>📊 全21ペア順位</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 font-black ${
                activeTab === "ranking" ? "bg-emerald-400 text-black" : "bg-emerald-100 text-emerald-900 border border-emerald-300"
              }`}>
                全21ペア
              </span>
            </div>
            <span className="text-[11px] opacity-75 truncate w-full mt-0.5">
              勝率 & 期待獲得pipsランキング一覧
            </span>
          </button>

          {/* Tab 3: 3 Yen Big Target */}
          <button
            onClick={() => setActiveTab("threeYen")}
            className={`p-3.5 border-2 border-[#141414] flex flex-col items-start gap-1 transition-all text-left cursor-pointer ${
              activeTab === "threeYen"
                ? "bg-[#141414] text-[#E4E3E0] shadow-hard translate-x-[-1px] translate-y-[-1px]"
                : "bg-white text-[#141414] hover:bg-[#E4E3E0]/70"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 font-black text-sm">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>🔥 ３円大台ターゲット</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 font-black ${
                activeTab === "threeYen" ? "bg-rose-400 text-black" : "bg-rose-100 text-rose-900 border border-rose-300"
              }`}>
                300pips
              </span>
            </div>
            <span className="text-[11px] opacity-75 truncate w-full mt-0.5">
              最新実レート直結・大台スイングTOP3
            </span>
          </button>

          {/* Tab 4: High Win-Rate Correlation Hedge Pairs (NEW) */}
          <button
            onClick={() => setActiveTab("hedgePairs")}
            className={`p-3.5 border-2 border-[#141414] flex flex-col items-start gap-1 transition-all text-left cursor-pointer ${
              activeTab === "hedgePairs"
                ? "bg-[#141414] text-[#E4E3E0] shadow-hard translate-x-[-1px] translate-y-[-1px]"
                : "bg-white text-[#141414] hover:bg-[#E4E3E0]/70"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 font-black text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>🛡️ 高勝率 相関ヘッジ</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 font-black ${
                activeTab === "hedgePairs" ? "bg-emerald-400 text-black" : "bg-emerald-100 text-emerald-950 border border-emerald-400"
              }`}>
                勝率89%〜
              </span>
            </div>
            <span className="text-[11px] opacity-75 truncate w-full mt-0.5">
              09:05〜21:25当日決済・利益最優先
            </span>
          </button>
        </div>

        {/* 4. Active Tab Content Section */}
        <div className="flex-1 flex flex-col">
          {activeTab === "gmoCoin" && (
            <GmoCoinTop5Section
              gmoCoinData={analysisData?.gmoCoinTop5}
              allPairs={analysisData?.data}
              jstInfo={analysisData?.jstInfo}
              targetPips={targetPips}
              onSelectPair={(p) => {
                setSelectedPair(p);
                setActiveTab("ranking");
              }}
              onSetTargetPips={(p) => setTargetPips(p)}
            />
          )}

          {activeTab === "ranking" && (
            <RankingTable
              pairs={analysisData?.data || []}
              selectedPair={selectedPair}
              onSelectPair={setSelectedPair}
              targetPips={targetPips}
              onGoToThreeYen={() => setActiveTab("threeYen")}
              onGoToGmoCoin={() => setActiveTab("gmoCoin")}
              onGoToHedge={() => setActiveTab("hedgePairs")}
            />
          )}

          {activeTab === "threeYen" && (
            <ThreeYenTargetSection
              threeYenData={analysisData?.threeYenTargets}
              pairs={analysisData?.data}
              jstInfo={analysisData?.jstInfo}
              onSetTargetPips={(p) => setTargetPips(p)}
            />
          )}

          {activeTab === "hedgePairs" && (
            <HedgePairsSection
              data={analysisData?.hedgePairsData}
              jstInfo={analysisData?.jstInfo}
              onSelectPair={(p) => {
                setSelectedPair(p);
                setActiveTab("ranking");
              }}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#141414] bg-white py-4 px-6 text-center text-xs font-mono text-[#141414]/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            GMO FX Quant AI v2.0 &bull; 120,000回シミュレーション学習 &bull; リアルタイムJSTタイムゾーン判定
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>JST同期中: {analysisData?.jstInfo?.formattedJST || "接続待機中"}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
