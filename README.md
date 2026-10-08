# 🤖 GMO FX AI Quant - 大局トレンド & 200〜300pips到達確率判定システム

本プロジェクトは、GMO為替メイン10銘柄を対象とし、Yahoo Financeからの最新マーケットデータ取得、移動平均線・MACD・ATR等を用いた特徴量エンジニアリング、機械学習（Random Forest）による**200〜300pips（2.0〜3.0円）利益幅ターゲットの確率判定**、および**SMTPメール自動通知**を行うプロフェッショナルなクオンツ・トレード分析システムです。

---

## 🌟 主な機能・特徴

1. **GMO為替メイン10通貨ペアに対応**
   - JPYペア: `USD/JPY`, `EUR/JPY`, `GBP/JPY`, `AUD/JPY`, `NZD/JPY`, `CAD/JPY`, `CHF/JPY`
   - USDペア: `EUR/USD`, `GBP/USD`, `AUD/USD`
2. **リアルタイムデータ取得 & 手動更新**
   - `yfinance` を利用し最新のOHLCV価格データを取得。画面上の「最新データ手動更新」ボタンで最新値とAI確率を再計算。
3. **マクロトレンド & 確率判定AI**
   - 200日移動平均線 (SMA200)、MACD、ATR (14日ボラティリティ)、RSI、ボリンジャーバンド等を組み合わせた特徴量エンジニアリング。
   - 今後数営業日以内に200〜300pips (2.0〜3.0円幅) のターゲットに到達する確率（0〜100%）を算出しランキング表示。
4. **洗練された Streamlit フロントエンド UI**
   - 確率順ランキングテーブル、推奨エントリー時期（「即時ロング」「即時ショート」「待機」など）、インタラクティブなPlotlyテクニカルチャート（ローソク足・MACD・ATR）。
5. **自動メール通知機能 (SMTP / Gmail / Yahoo Mail)**
   - 判定確率が設定しきい値（例: 65%〜75%以上）を超えた場合に、詳細なHTMLアラートメールを自動送信。

---

## 📁 ファイル構成

```text
.
├── requirements.txt  # 依存ライブラリ一覧
├── model.py          # Yahoo Financeデータ取得、特徴量生成、機械学習(Random Forest)モデル処理
├── notifier.py       # SMTPメール送信 & HTMLテンプレート生成
├── app.py            # Streamlit メインUIアプリケーション
└── README.md         # 本ドキュメント
```

---

## 🛠️ 環境構築と起動方法

### 1. リポジトリのクローン
```bash
git clone https://github.com/your-username/gmo-fx-ai-quant.git
cd gmo-fx-ai-quant
```

### 2. 仮想環境の作成とライブラリインストール
```bash
python -m venv venv
source venv/bin/activate  # Windowsの場合は venv\Scripts\activate
pip install -r requirements.txt
```

### 3. アプリケーションの起動 (Streamlit)
```bash
streamlit run app.py
```
起動後、ブラウザで `http://localhost:8501` にアクセスしてください。

---

## 📧 メール通知設定ガイド (Gmailの場合)

1. Googleアカウントの設定で「2段階認証プロセス」を有効にします。
2. 「アプリ パスワード」を作成し、16桁の専用パスワードを取得します。
3. Streamlitアプリのサイドバー設定で以下を入力します：
   - **SMTP サーバー**: `smtp.gmail.com`
   - **SMTP ポート**: `587`
   - **送信元 Email**: ご自身のGmailアドレス
   - **App パスワード**: 取得した16桁のアプリパスワード
   - **送信先 Email**: アラートを受信したいメールアドレス
4. 「テストメール送信」ボタンで疎通確認を行います。

---

## 🚀 GitHubコミット & デプロイ手順

```bash
git add .
git commit -m "feat: Add GMO FX AI Quant system with ML target probability and email alerts"
git push origin main
```

Streamlit Community Cloud にデプロイする場合は、GitHubリポジトリを連携し、メインファイルに `app.py` を指定するだけで簡単に公開できます。

---

### 免責事項
本システムは高度な技術指標および機械学習モデルに基づき確率を算出しますが、将来の価格変動を保証するものではありません。実際の外国為替取引はご自身の責任で行ってください。
