# 🖤 Ink Forms

**Ink Inc. 統合フォーム・プラットフォーム**

> AI Creation, Human Care. The Future Drawn Together.

---

## 概要

Ink Inc.が運用する全フォームを1つのFastAPIバックエンドに統合したシステム。元々は「Ink Check」（ストレスチェック専用）として開発されたが、その後ライバー応募・契約・楽曲利用申請・お問い合わせ・チケット・個別予約など、事務所運営に必要なフォームを順次統合し、現在は9種類のフォームを1つの基盤で提供している。

- 公開フォーム一式（応募・契約・楽曲利用・問い合わせ等）
- 所属ライバー限定フォーム（パスワードゲート）
- 管理画面での一覧・詳細・ステータス管理
- Discord Webhookによる所長へのリアルタイム通知

---

## システム構成

```
ライバー・外部ユーザー（スマホ/PC）
　↓
├─ MAGICNUC経由
│   https://goofball-marital-lying.ngrok-free.dev
│   （ngrokトンネル → ポート8000）
│
└─ Vercel経由（公開フォームの別ホスティング）
    https://ink-forms-vercel.vercel.app
    （hp-slimline管理の別リポジトリ、手動同期）

　↓
FastAPI（main.py / ポート8000）── 公開フォーム受付
　↓
SQLite（ink_check.db）── フォームごとのテーブル
　↓
Discord Webhook（フォームごとに個別のWebhook URL）→ 所長に通知
　↓（Ink Checkのみ）
Ollama（qwen2.5:7b）→ アラート判定・AI所見生成


管理画面：FastAPI（admin.py / ポート8001）
　↓ パスワード認証（X-Admin-Tokenヘッダー）
　↓ Tailscale経由
HP-Slimline（所長PC）から http://100.65.206.126:8001 でアクセス
```

**同じデータベース（`ink_check.db`）をmain.pyとadmin.pyの両方が参照する**構成。main.pyが受付・保存・Discord通知を担当し、admin.pyは閲覧・ステータス更新・手動編集のみを担当する。

---

## 提供フォーム一覧

| フォーム名 | 用途 | 対象 | パスワード | 備考 |
|---|---|---|---|---|
| **Ink Entry** | 所属応募フォーム | 応募希望者（誰でも） | なし | 審査制。承認後に所長からパスワード発行 |
| **Ink Contract** | 本申込み（契約手続き） | 所属決定者 | 所長発行パスワード | 口座情報・身分証アップロードを含む |
| **Ink Music** | 楽曲利用の届出・申請 | 誰でも | なし | 届出＝事後報告／申請＝事前確認（カラオケ音源依頼・歌詞改変） |
| **Ink Contact** | お問い合わせ | 誰でも | なし | AtomicMail（`inkinc.info@atomicmail.io`）経由で返信する場合あり |
| **Ink Ticket** | 月次特典申込み | 所属ライバー | 共通パスワード | 毎月25日締切、翌月1日にコード配布 |
| **Ink Voice** | 月次振り返りアンケート | 所属ライバー | 共通パスワード | 配信状況・モチベーションのヒアリング |
| **Ink Check** | ストレスチェック | 所属ライバー | 共通パスワード | 毎月1日実施。AI所見自動生成＋アラート通知（詳細は後述） |
| **Ink Milestone** | 達成報告（Ink Achieve/Song/Duo） | 所属ライバー | 共通パスワード | 収益化・ランク到達・継続特典の申請 |
| **個別予約（Ink Book）** | 所長との面談予約 | 所属希望者・所属ライバー | 個別パスワード | 第1〜3希望日時を申請、所長が承認・確定 |

---

## ファイル構成

```
C:\ink-check\                    （MAGICNUC・バックエンド本体）
├── main.py                      # 公開フォーム用FastAPIサーバー（ポート8000）
├── admin.py                     # 管理画面用FastAPIサーバー（ポート8001）
├── models.py                    # 全フォームのPydanticモデル
├── database.py                  # SQLite操作（フォームごとのCRUD関数）
├── discord_notifier.py          # フォームごとのDiscord Webhook通知
├── analyzer.py                  # Ink Check用アラート判定ロジック
├── ollama_client.py             # Ink Check用Ollama APIクライアント
├── ink_check.db                 # SQLiteデータベース（自動生成・全フォーム共通）
├── run_main.vbs                 # main.py バックグラウンド起動スクリプト
├── run_admin.vbs                # admin.py バックグラウンド起動スクリプト
├── run_ngrok.vbs                # ngrok バックグラウンド起動スクリプト
├── .env / .env.example
├── requirements.txt
├── README.md
├── frontend\                    # 公開フォームUI（MAGICNUC配信用）
│   ├── index.html                # 全フォームのタブ切り替えSPA
│   ├── style.css
│   ├── script.js
│   └── logo.png
└── admin\                       # 管理画面UI
    ├── index.html
    ├── style.css
    └── admin.js

/home/hp/InkTools/ink-forms-vercel/   （hp-slimline・別リポジトリ）
├── index.html                   # frontend\index.html と同内容（手動同期）
├── script.js                    # frontend\script.js と同内容（手動同期）
├── style.css
└── vercel.json
```

> ⚠️ **frontendは二重管理**：MAGICNUCの`frontend\`と、hp-slimlineの`ink-forms-vercel`リポジトリは別物。公開フォームに変更を加えた場合、両方に同じ`index.html`/`script.js`を反映し、`ink-forms-vercel`側はgit push（Vercel自動デプロイ）が必要。

---

## 環境変数（.env）

```env
# Discord Webhook（フォームごとに個別のURLを発行）
DISCORD_WEBHOOK_ENTRY=...
DISCORD_WEBHOOK_CONTRACT=...
DISCORD_WEBHOOK_INKMUSIC=...
DISCORD_WEBHOOK_CONTACT=...
DISCORD_WEBHOOK_TICKET=...
DISCORD_WEBHOOK_VOICE=...
DISCORD_WEBHOOK_CHECK=...
DISCORD_WEBHOOK_MILESTONE=...
DISCORD_WEBHOOK_BOOK=...

# 管理画面認証
ADMIN_PASSWORD=...

# Ink Check（AI所見生成）
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b

# データベース
DATABASE_PATH=./ink_check.db
```

---

## 起動方法

### 自動起動（通常運用）

MAGICNUCログイン時にタスクスケジューラが自動起動する。

| タスク名 | 内容 |
|---|---|
| InkCheck-Main | 公開フォームサーバー（ポート8000） |
| InkCheck-Admin | 管理画面サーバー（ポート8001） |
| InkCheck-Ngrok | ngrokトンネル |

```powershell
Start-ScheduledTask -TaskName "InkCheck-Main"
Start-ScheduledTask -TaskName "InkCheck-Admin"
Start-ScheduledTask -TaskName "InkCheck-Ngrok"
```

### 手動起動・再起動（デバッグ時）

Windowsの`Stop-ScheduledTask`はVBS経由で起動したPythonプロセスを確実に停止できないため、プロセスを直接止めてからVBSを再実行する。

```powershell
Get-Process python | Stop-Process -Force
Start-Process "C:\ink-check\run_admin.vbs"
Start-Process "C:\ink-check\run_main.vbs"
# ngrokは再起動不要（main.py再起動後もトンネルは維持される）

# 起動確認
Get-NetTCPConnection -LocalPort 8000,8001 -State Listen
```

> ⚠️ この会話経由でアップロード・ダウンロードし直した`.vbs`ファイルは、Windowsの「インターネットから取得したファイル」判定でブロックされ`Start-Process`が失敗することがある。その場合は先に`Unblock-File -Path "C:\ink-check\run_xxx.vbs"`を実行してから再試行する。

### コード変更を反映する際の注意

- `C:\ink-check\admin.py`（ルート直下）がadmin.py本体。`admin\`フォルダには静的ファイル（`index.html`/`admin.js`/`style.css`）のみが入っており、admin.py自体はそこには置かない。
- 変更前に必ず`git status`/`git diff`で差分を確認する（admin認証ミドルウェアやライセンス関連エンドポイントなど、このREADMEの編集フローの外で追加された機能を上書きしないため）。

---

## アクセスURL

| 用途 | URL | 使用者 |
|---|---|---|
| 公開フォーム（MAGICNUC/ngrok） | https://goofball-marital-lying.ngrok-free.dev | 誰でも |
| 公開フォーム（Vercel） | https://ink-forms-vercel.vercel.app | 誰でも |
| 管理画面（MAGICNUC内） | http://localhost:8001 | 所長（MAGICNUC） |
| 管理画面（Slimlineから） | http://100.65.206.126:8001 | 所長（Tailscale経由） |

---

## Ink Music（楽曲利用フォーム）仕様

Ink Musicの楽曲を使った動画投稿・カラオケ音源制作・歌詞改変について、区分ごとに運用を分けている。

| 区分 | 内容 | 事前確認 |
|---|---|---|
| **届出** | 公開済みカラオケ音源を使った投稿の事後報告 | 不要（先に投稿可） |
| **申請** | カラオケ音源が未公開の楽曲の制作依頼、または歌詞改変の申請 | 必要（所長確認後に対応） |

- 共通項目：活動名・連絡先・チャンネルURL・楽曲名・楽曲YouTube URL・利用形態（歌ってみた/Arrange/AI Vocal/AI Remix）
- 届出項目：公開URL（任意）・公開予定日（任意）
- 申請項目：申請内容（カラオケ音源の制作依頼／歌詞の改変、複数選択可）、歌詞の改変を選んだ場合は変更前後の歌詞が必須
- 申請が完了すると、所長から返信する場合の送信元が`inkinc.info@atomicmail.io`になる旨と、迷惑メールフォルダの確認を促す案内を完了メッセージに表示（届出では表示しない）
- 管理画面では届出・申請の一覧表示、申請のみ対応ステータス（未対応/対応済み）のトグル、詳細モーダルでの公開URL手動更新に対応

---

## Ink Check（ストレスチェック）仕様

9フォームの中で唯一AI分析を行う、Ink Formsの中核機能。

### 実施フロー

毎月1日に所属ライバーがスマホで回答 → アラート判定 → Ollama（qwen2.5:7b）がAI所見を生成 → 所長のDiscordに通知。

### アラートレベル

| レベル | 条件 | Discord通知 |
|---|---|---|
| GREEN | トリガーなし | なし（通知疲れ防止のため） |
| YELLOW | 中重要度トリガー1件以上 | あり |
| RED | 高重要度トリガー1件以上 | あり |

**単発アラート**：高スコア単発（いずれかの項目が4以上）／複数高スコア（3項目以上が3以上）／面接希望／テキスト記入あり

**継続アラート（時系列）**：連続高スコア（同一項目が2ヶ月連続で4以上）／平均スコア上昇／長期高止まり（3ヶ月連続で平均3以上）／面接希望の変化

**複合アラート**：数値乖離（平均スコア2以下なのにテキスト記入あり＝「言葉にできない何かがある」サイン）

### スコアの定義

| 値 | 意味 |
|---|---|
| 1 | 良好・問題なし |
| 2 | やや気になる |
| 3 | 注意が必要 |
| 4 | かなりつらい |
| 5 | 非常につらい・危険な状態 |

### AI所見生成

- モデル：qwen2.5:7b（MAGICNUC / Ollama、完全ローカル動作・外部送信なし）
- 精神保健福祉士の視点で所見を生成するようシステムプロンプトで指定
- 断定を避け「〜の可能性があります」という表現を使用
- 出力はDiscord通知内に「Ink Memory転記用」ブロックとして含まれ、所長が手動でコピペ転記する

---

## 管理画面の使い方

ログイン後、フォームごとのタブで一覧・詳細・操作が可能。

- **一覧表示**：各フォームの回答・申込みを新しい順に表示
- **詳細モーダル**：全項目の内容を確認
- **ステータス管理**：Ink Entry（審査状況）、Ink Music（申請の対応状況）、Ink Book（予約の承認/拒否）など、フォームごとに応じた状態管理
- **ライバー管理（Settings）**：所属ライバー名の追加・編集・削除。ここで登録した名前がパスワード制フォームのプルダウンに反映される
- **ダッシュボード（Ink Check）**：ライバー別の時系列スコアグラフ、CSVダウンロード
- **バックアップ**：ヘッダーの「バックアップ」ボタンからDB全体をバックアップ

---

## セキュリティ

- 管理画面はパスワード認証＋`X-Admin-Token`ヘッダーによるミドルウェア保護
- 管理画面へのアクセスはTailscale VPN経由のみ（一般公開しない）
- 所属ライバー限定フォーム（Contract/Ticket/Voice/Check/Milestone/Book）は共通パスワードでゲート
- Ink Entry/Ink Music/Ink Contactは一般公開（誰でも送信可）だが、内容は所長のみが確認
- 回答データはMAGICNUCのローカルSQLiteにのみ保存
- Ink CheckのLLM推論はローカルのOllamaで完結し、外部APIへのデータ送信は一切行わない
- 口座情報・身分証ファイル（Ink Contract）はDiscordには送信されない

---

## 運用上の注意点（過去のトラブルから）

- **プロセス再起動**：`Stop-ScheduledTask`はVBS経由のPythonプロセスを確実に停止できない。`Get-Process python | Stop-Process -Force`→起動確認→VBS手動起動→PID確認、の順で行う
- **admin.pyの配置場所**：`C:\ink-check\admin.py`（ルート）が本体。`admin\`フォルダの静的ファイルと混同して誤った場所に上書きしないよう注意
- **VBSファイルのブロック**：チャット経由で受け取った`.vbs`はWindowsにブロックされることがあるため`Unblock-File`が必要
- **frontendの二重管理**：MAGICNUCの`frontend\`とVercelの`ink-forms-vercel`リポジトリは別物。公開フォームの変更は両方に適用し、後者はgit pushでデプロイする
- **既存機能の上書き防止**：`admin.py`/`main.py`編集前は必ずMAGICNUC上で`git status`/`git diff`を確認する（admin認証ミドルウェアやライセンス関連など、チャット外で追加された機能があるため）

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | HTML / CSS / JavaScript（バニラ） |
| バックエンド | Python 3.12 / FastAPI |
| データベース | SQLite |
| LLM（Ink Checkのみ） | Ollama（qwen2.5:7b） |
| 通知 | Discord Webhook（フォームごとに個別URL） |
| 外部公開 | ngrok（固定ドメイン）＋ Vercel（ミラー） |
| 動作環境 | MAGICNUC AG1（Windows 11 / i5-12600H / 32GB DDR5） |
| 管理画面アクセス | Tailscale VPN |

---

## 将来の拡張候補

- 月次レポートの自動生成（全ライバーの傾向まとめ）
- Ink Memoryへの自動連携
- 回答リマインダーの自動送信
- Ink Check Lite（OSS公開版）の作成
- frontend二重管理の解消（単一ソースからのデプロイ）

---

*© 2026 黒井葉跡 / Ink Inc.*
*AI Creation, Human Care. The Future Drawn Together.*
