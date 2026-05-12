# 🖤 Ink Forms v2.1

**Ink Inc. 統合フォームシステム**

> AI Creation, Human Care. The Future Drawn Together.

---

## 概要

Ink Inc.の全フォーム業務を一本化したマルチフォームシステム。応募・本申込み・お問い合わせ・チケット・近況報告・ストレスチェックの6フォームを1つのシステムで管理する。

---

## フォーム一覧

| フォーム | 対象 | パスワード | Discord通知 |
|---|---|---|---|
| 🖊️ Ink Entry | 配信者全般 | 不要 | 常時 |
| 📌 Ink Contract | 所属決定済みライバー | あり | 常時 |
| 📢 Ink Contact | 一般・ライバー候補 | 不要 | 常時 |
| 🎟 Ink Ticket | 所属ライバー限定 | あり | 常時 |
| 💬 Ink Voice | 所属ライバー限定 | あり | 常時 |
| ❤️‍🩹 Ink Check | 所属ライバー限定 | あり | YELLOW/REDのみ |

---

## システム構成

```
ライバー・一般ユーザー（スマホ・PC）
　↓ https://goofball-marital-lying.ngrok-free.dev
Ink Formsフロントエンド（MAGICNUC AG1 / ポート8000）
　↓
FastAPI（main.py）→ SQLite（ink_check.db）
　↓ Ink Check時のみ
Ollama（qwen2.5:7b）→ AI所見生成
　↓
Discord Webhook → 所長に通知

管理画面（ポート8001）← Tailscale経由でSlimlineからアクセス
```

---

## ファイル構成

```
C:\ink-check\
├── main.py                  # フォームサーバー（ポート8000）
├── admin.py                 # 管理画面サーバー（ポート8001）
├── analyzer.py              # Ink Checkアラート判定
├── ollama_client.py         # Ollama連携
├── discord_notifier.py      # Discord通知（全フォーム）
├── database.py              # SQLite操作
├── models.py                # データモデル
├── ink_check.db             # DB（自動生成）
├── uploads\                 # 身分証ファイル
├── run_main.vbs
├── run_admin.vbs
├── run_ngrok.vbs
├── .env
├── .env.example
├── requirements.txt
├── frontend\
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── logo.png
└── admin\
    ├── index.html
    ├── style.css
    └── admin.js
```

---

## セットアップ

```powershell
pip install -r requirements.txt
copy .env.example .env
notepad .env  # パスワード等を設定
```

手動起動（管理者PowerShell）：

```powershell
Start-ScheduledTask -TaskName "InkCheck-Main"
Start-ScheduledTask -TaskName "InkCheck-Admin"
Start-ScheduledTask -TaskName "InkCheck-Ngrok"
```

---

## アクセスURL

| 用途 | URL |
|---|---|
| フォーム（ライバー・一般用） | https://goofball-marital-lying.ngrok-free.dev |
| 管理画面（MAGICNUC内） | http://localhost:8001 |
| 管理画面（Slimlineから） | http://100.65.206.126:8001 |

---

## 関連プロダクト

**Ink Check Lite**（OSS公開版）
- https://github.com/InkInc-official/ink-check-lite
- CC BY-NC 4.0

---

*© 2026 黒井葉跡 / Ink Inc.*
