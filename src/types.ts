export interface CurrencyStrengthItem {
  currency: string; // e.g. "USD", "EUR", "JPY", "GBP", "AUD", "CAD", "CHF", "NZD"
  name: string; // e.g. "日本円", "米ドル", "ユーロ", etc.
  flag: string; // Flag/Symbol representation
  score: number; // -100 ~ +100 relative strength score
  normalizedScore: number; // 0 ~ 100 for gauge
  rank: number; // 1 (Strongest) ~ 8 (Weakest)
  status: "STRONGEST" | "STRONG" | "NEUTRAL" | "WEAK" | "WEAKEST";
  statusLabel: string;
  return2dAvg: number; // 2-day average return against all peers %
  bullishPairsCount: number;
  bearishPairsCount: number;
}

export interface CrossMatrixCell {
  base: string; // e.g. "EUR"
  quote: string; // e.g. "JPY"
  pairName: string; // "EUR/JPY" or "JPY/EUR"
  isStandardPair: boolean; // true if standard tradeable pair in list
  actualPairName: string; // tradeable pair name (e.g. "EUR/JPY")
  relativeScore: number; // % relative performance
  direction: "BUY" | "SELL" | "NEUTRAL" | "SAME";
  currentPrice: number | null;
  probability: number | null;
  winRate: number | null;
  targetPips: number | null;
  isGoldenPair?: boolean;
}

export interface GoldenPairRecommendation {
  pair: string;
  action: "LONG (買い)" | "SHORT (売り)";
  type: "BUY" | "SELL";
  strongestCurrency: string;
  weakestCurrency: string;
  probability: number;
  winRate: number;
  expectedPips: number;
  targetPips: number;
  reason: string;
}

export interface CurrencyStrengthData {
  currencies: CurrencyStrengthItem[];
  currencyList: string[];
  matrixGrid: CrossMatrixCell[][];
  goldenPairs: GoldenPairRecommendation[];
  strongest: CurrencyStrengthItem | null;
  weakest: CurrencyStrengthItem | null;
  updatedAt: string;
}

export interface OptimalTimeSession {
  sessionName: string;
  timeRange: string;
  winRate: number;
  status: "BEST" | "GOOD" | "MODERATE" | "LOW";
  description: string;
}

export interface OptimalStrategyPrediction {
  optimalPipsRange: {
    bestPips: number;
    rangeLabel: string;
    highestProb: number;
    expectedReturnPips: number;
    reasoning: string;
  };
  optimalTimeSession: {
    bestSession: string;
    bestSessionWinRate: number;
    volatilityPips: number;
    recommendation: string;
  };
  sessionsRanking: OptimalTimeSession[];
}

export interface TradeReasoningDetails {
  directionText: string;
  summaryReason: string;
  trendReason: string;
  indicatorReason: string;
  volatilityReason: string;
}

export interface ForexPairResult {
  pair: string;
  ticker: string;
  type: "JPY" | "USD";
  currentPrice: number;
  probability: number;
  recommendation: string;
  trendLabel: string;
  targetPips: string;
  targetPrice: number;
  atrPips: number;
  rsi: number;
  macd: number;
  sma200: number;
  lastCandleDate: string;
  // ポジション種別 (LONG: 買い, SHORT: 売り, RANGE: 中立)
  positionType: "LONG" | "SHORT" | "RANGE";
  // 売買理由解説 (WHY recommended for BUY or SELL)
  reasoningDetails: TradeReasoningDetails;
  // 120,000回(12万回)ハイスピードシミュレーション学習結果
  winRate1000: number; // 120,000回シミュレーション勝率 %
  simWinTrades: number; // 120,000回中の勝利トレード数
  expectedPipsTrade: number; // トレード期待値(pips)
  // 120,000回モンテカルロシミュレーション一貫性 & AI予測信頼度スコア (Confidence Score)
  confidenceScore?: number; // AI信頼度スコア % (0-100%)
  confidenceLevel?: "VERY HIGH" | "HIGH" | "MODERATE" | "LOW"; // 信頼度レベル判定
  confidenceDesc?: string; // 信頼度の根拠解説
  simConsistencyRatio?: number; // 120,000回シミュレーション一貫性・収束率 %
  // 過去2日間(90%) & それ以前(10%) 分析指標
  return2dPercent?: number; // 過去2日間の騰落率 %
  range2dPips?: number; // 過去2日間の実効値幅 pips
  recent2dWeightPercent?: number; // 過去2日間の重み % (90%)
  priorWeightPercent?: number; // それ以前の重み % (10%)
  // 本日および過去14日間のレンジ内位置 (安値・高値からの乖離率 %)
  todayHigh?: number; // 本日高値
  todayLow?: number; // 本日安値
  todayRangePips?: number; // 本日値幅 (pips)
  todayPosFromLow?: number; // {{現在値} - {本日安値}} ÷ {{本日高値} - {本日安値}} × 100 (0%〜100%)
  todayPosFromHigh?: number; // {{現在値} - {本日高値}} ÷ {{本日高値} - {本日安値}} × 100 (-100%〜0%)
  high14d?: number; // 過去14日間の最高値
  low14d?: number; // 過去14日間の最安値
  range14dPips?: number; // 過去14日間の値幅 (pips)
  pos14dFromLow?: number; // {{現在値} - {14日最安値}} ÷ {{14日最高値} - {14日最安値}} × 100 (0%〜100%)
  pos14dFromHigh?: number; // {{現在値} - {14日最高値}} ÷ {{14日最高値} - {14日最安値}} × 100 (-100%〜0%)
  // エントリータイミング品質判定 (押し目買い・戻り売り・ツッコミ警戒)
  entryQuality?: {
    status: "GOLDEN_DIP_BUY" | "GOLDEN_RALLY_SELL" | "DIP_SELL_WARNING" | "PEAK_BUY_WARNING" | "BREAKOUT_FOLLOW" | "NORMAL";
    label: string;
    subLabel: string;
    advice: string;
    winRateImpact: "BOOST" | "PENALTY" | "NEUTRAL";
    badgeClass: string;
  };
  // 突き抜ける大相場・爆発初動検知シグナル (BIG EXPLOSION ALERT)
  bigBreakoutSignal?: {
    isExploding: boolean; // 突き抜ける大相場が発生中 (ブレイク追随)
    isCoiling: boolean; // エネルギー極限充填中 (爆発寸前のスクイーズ)
    squeezeScore: number; // エネルギー充填度 (0%〜100%)
    breakoutType: "UPWARD_EXPLOSION" | "DOWNWARD_EXPLOSION" | "COILING_SQUEEZE" | "NORMAL";
    label: string; // 表示ラベル
    subLabel: string; // 補足
    advice: string; // アクション助言
    badgeClass: string; // UI用スタイル
  };
  // AI予測: 個別最適pips & 最高勝率時間帯
  pairOptimalPips: number;
  pairBestSession: string;
  pairBestSessionWinRate: number;
}

export interface JstInfo {
  formattedJST: string;
  dateOnlyJST: string;
  weekday: string;
  hour: number;
  minute: number;
  second: number;
  isWeekendClosed: boolean;
  isOperatingHours?: boolean;
  operatingHoursText?: string;
  activeSessionName: string;
  activeSessionDesc: string;
  activeSessionCategory: "GOLDEN" | "LONDON" | "TOKYO" | "NY_LATE" | "CLOSED";
}

export interface ThreeYenTopPair {
  rank: number; // 1, 2, 3
  pair: string; // e.g. "GBP/JPY"
  type: "JPY" | "USD";
  currentPrice: number;
  targetPrice: number;
  direction: "BUY" | "SELL";
  directionLabel: "LONG (3円以上 買い狙い)" | "SHORT (3円以上 売り狙い)";
  probability: number; // 3円以上(300pips) 到達確率 %
  winRate: number; // 120,000回シミュレーション期待勝率 %
  expectedPips: number; // 期待獲得pips
  expectedYenGain: number; // 期待獲得円幅 (例: 2.46円)
  targetYen: number; // 目標値幅 (3.00円 / 300pips)
  estimatedDays: number; // 到達予想日数 (例: 2〜4日)
  atrDailyPips: number; // 日足ATR (pips)
  range2dPips: number; // 直近2日間の実効値幅 (pips)
  return2dPercent: number; // 直近2日間の騰落率 %
  confidenceScore: number; // AI信頼度 %
  reasonTitle: string; // 3円以上狙える根拠タイトル
  detailedRationale: string; // 詳細な相場力学・ボラティリティ解説
  riskRewardRatio: string; // リスクリワード (例: 1:3.2)
  stopLossPrice: number; // 目安損切り価格
}

export interface ThreeYenTargetData {
  targetYenAmount: number; // 3.00 (3円)
  targetPips: number; // 300 pips
  top3: ThreeYenTopPair[];
  marketOverview: string; // 3円以上の大波（ビッグスイング）相場環境解説
  updatedAt: string;
}

export interface EvolutionRecord {
  id: string;
  timestamp: string;
  jstDate: string;
  cycleNumber: number;
  generation: number;
  sessionName: string;
  runSlot: 1 | 2 | 3;
  step1_dataRefresh: {
    status: "SUCCESS";
    pairsCount: number;
    fetchedAt: string;
    details: string;
  };
  step2_selfVerification: {
    status: "SUCCESS";
    auditedSignalsCount: number;
    hitRate: number; // %
    avgPipsDeviation: number; // pips
    confidenceReliability: number; // %
    details: string;
  };
  step3_selfCorrection: {
    status: "SUCCESS";
    weightAdjustments: {
      recent2dWeight: number; // e.g. 91.5%
      priorWeight: number; // e.g. 8.5%
      atrMultiplier: number;
      driftSensitivity: number;
    };
    parameterCalibrations: string[];
    details: string;
  };
  step4_selfEvolution: {
    status: "SUCCESS";
    newGeneration: number;
    accuracyGain: string;
    intelligenceScore: number;
    adaptiveFocus: string;
    evolutionSummary: string;
  };
}

export interface EvolutionState {
  generation: number;
  totalCyclesRun: number;
  lastExecutedAt: string | null;
  todayDate: string;
  todayCompletedSlots: number[]; // e.g. [1, 2]
  scheduledTimes: [string, string, string]; // e.g. ["08:30", "16:30", "21:30"]
  autoScheduleEnabled: boolean;
  accuracyScore: number; // Overall accuracy %
  intelligenceIndex: number; // 0-100
  weights: {
    recent2dWeight: number;
    priorWeight: number;
    atrMultiplier: number;
    confidenceThreshold: number;
    simDriftFactor: number;
  };
  history: EvolutionRecord[];
}

export interface ScheduleSlotInfo {
  slot: 1 | 2 | 3;
  time: string;
  isCompleted: boolean;
  isNext: boolean;
  minuteOfDay: number;
}

export interface AutonomousStatusResponse {
  jstInfo: JstInfo;
  evolutionState: EvolutionState;
  nextScheduledRun: ScheduleSlotInfo;
  scheduleSlots: ScheduleSlotInfo[];
  todayProgress: string;
}

export interface GmoCoinDipRallyPair extends ForexPairResult {
  rank: number; // 1 to 3
  setupType: "DIP_BUY" | "RALLY_SELL";
  setupLabel: string; // e.g. "🔄 下落→上昇転換確定 (初押し目買い)"
  trendReversalType?: "BULLISH_REVERSAL" | "BEARISH_REVERSAL" | "CONTINUATION";
  trendReversalLabel?: string; // "🔄 下落→上昇トレンド転換確定 (底打ちブレイク)"
  reversalSignals?: string[]; // e.g. ["20日SMA上抜けゴールデン転換", "直近安値からの明確な反発ブレイク", "通貨強弱の買い優勢シフト"]
  reversalClarityScore?: number; // 転換明確度スコア % (e.g. 92)
  firstPullbackStatus?: string; // "第1波・初押し目ゾーン形成完了"
  isStrictReversal?: boolean;
  gmoCoinLotInfo: string; // e.g. "1通貨単位〜 (約100円から取引可能)" or "10通貨単位〜" or "100通貨単位〜"
  leverageInfo: string; // "最大レバレッジ 25倍"
  riskRewardRatio: string; // e.g. "1 : 3.4"
  stopLossPrice: number;
  takeProfitPrice: number;
  pullbackDepth: string; // e.g. "押し目深度: 安値から+32% (フィボナッチ 61.8%押し)"
  dipRallyRationale: string; // Detailed technical rationale for GMO Coin trading
  gmoCategory?: "CROSS_JPY" | "HIGH_YIELD" | "DOLLAR_STRAIGHT" | "FOREIGN_CROSS";
  spreadInfo?: string;
  spreadPipValue?: number;
  swapInfo?: string;
}

export interface GmoCoinTop5Data {
  title: string;
  description: string;
  pairs: GmoCoinDipRallyPair[];
  lowSpreadFilterApplied?: boolean;
  excludedHighSpreadCount?: number;
  updatedAt: string;
}

export interface HedgePairItem {
  id: string;
  rank: number;
  // 主軸ペア (攻め・利益エンジン)
  primaryPair: string; // e.g. "GBP/JPY"
  primaryTicker: string;
  primaryDirection: "LONG" | "SHORT";
  primaryPrice: number;
  primaryLotRatio: number; // e.g. 0.70
  primaryAtr: number; // e.g. 135.0
  primaryRole: string; // e.g. "主軸・利益エンジン (欧州ボラティリティ急伸追随)"

  // ヘッジペア (守り・相殺)
  hedgePair: string; // e.g. "EUR/JPY"
  hedgeTicker: string;
  hedgeDirection: "LONG" | "SHORT";
  hedgePrice: number;
  hedgeLotRatio: number; // e.g. 1.00
  hedgeAtr: number; // e.g. 88.0
  hedgeRole: string; // e.g. "円高ショック防衛 (日銀・有事急変を85%相殺)"

  // クオンツ評価・勝率・ヘッジ有効性
  winRate: number; // e.g. 89.4 (%) - 120,000回シミュレーション勝率
  hedgeEfficiency: number; // e.g. 86.5 (%) - リスク相殺・分散削減効果
  correlation: number; // e.g. 0.88 - 過去相関係数
  correlationType: "POSITIVE" | "INVERSE"; // 正相関 or 逆相関
  
  // 利益率・pips期待値
  expectedDailyProfitPips: number; // e.g. +48.5 pips (1日想定純利益pips)
  expectedMonthlyReturnPercent: number; // e.g. +14.8 % (月間期待利益率)
  riskRewardRatio: string; // e.g. "1 : 3.6"
  maxDrawdownExpected: number; // e.g. -12.4 pips (ヘッジによる最小DD)
  
  // 推奨時間枠・決済ルール
  recommendedTimeWindow: string; // e.g. "09:05 〜 21:25 (当日完全決済)"
  isDayTradingOptimal: boolean;
  timeWindowReason: string; // e.g. "21:30の米重要指標の直前(21:25)に逃げ切り、スプレッド急拡大リスクを完全回避"

  // 戦略カテゴリと解説
  strategyCategory: "CROSS_JPY_VOLATILITY" | "INVERSE_USD_NEUTRAL" | "OCEANIA_SPREAD" | "EUROPE_DIVERGENCE";
  categoryBadge: string; // e.g. "クロス円・ボラティリティ格差型"
  rationale: string;
  keyWinFactors: string[];
}

export interface HedgePairsData {
  title: string;
  description: string;
  pairs: HedgePairItem[];
  marketOverview: string;
  bestSessionTime: string;
  recommendedWindow: string;
  updatedAt: string;
  aiEngineGeneration?: number;
  aiIntelligenceScore?: number;
  aiAccuracyScore?: number;
  isRealtimeAnalyzed?: boolean;
}

export interface AnalysisResponse {
  updatedAt: string;
  jstInfo?: JstInfo;
  targetPips: number;
  pairsCount: number;
  topPair: ForexPairResult | null;
  optimalStrategy: OptimalStrategyPrediction;
  currencyStrength?: CurrencyStrengthData;
  threeYenTargets?: ThreeYenTargetData;
  gmoCoinTop5?: GmoCoinTop5Data;
  hedgePairsData?: HedgePairsData;
  evolutionState?: EvolutionState;
  data: ForexPairResult[];
  isLiveYahooFinance?: boolean;
  dataSource?: string;
}

export interface HistoricalTradePoint {
  id: string;
  type: "BUY" | "SELL";
  entryDate: string;
  entryPrice: number;
  exitDate: string;
  exitPrice: number;
  pipsWon: number;
  holdingDays: number;
  exitReason: string;
  status: "WIN";
}

export interface HistoricalTradeStats {
  totalTrades: number;
  totalPips: number;
  winRate: number;
  avgHoldingDays: number;
  buyTradesCount: number;
  sellTradesCount: number;
}

export interface ChartCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  tradePoint?: {
    tradeId: string;
    action: "ENTRY" | "EXIT";
    type: "BUY" | "SELL";
    price: number;
    pipsWon?: number;
    label: string;
  };
}

export interface ChartResponse {
  pair: string;
  ticker: string;
  candles: ChartCandle[];
  successfulTrades: HistoricalTradePoint[];
  tradeStats: HistoricalTradeStats;
}
