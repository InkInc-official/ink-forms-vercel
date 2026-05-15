# Tauri vs Electron 比較資料

## Ink Command / Ink Inc. 向け設計判断ガイド

---

# 概要

現在、Ink Command をはじめとする Ink シリーズを
「Webアプリ」から「常用アプリケーション」へ移行する段階に入っている。

ここでは、

* Electron
* Tauri

の違いを整理し、

* Ink Command との相性
* 今後の Ink シリーズの方向性
* 一般的な判断基準

をまとめる。

---

# 一言でいうと

| 項目        | Electron       | Tauri          |
| --------- | -------------- | -------------- |
| コンセプト     | Chromiumを丸ごと内蔵 | OS標準WebViewを利用 |
| 開発思想      | 「全部入り」         | 「軽量・ネイティブ寄り」   |
| 得意        | 高機能デスクトップアプリ   | 軽量ユーティリティ/HUD  |
| サイズ       | 重い             | 軽い             |
| RAM       | 多い             | 少ない            |
| 学習コスト     | 低い             | やや高い           |
| Node依存    | 強い             | 弱い             |
| Rust知識    | 不要             | 少し必要           |
| Linux相性   | 普通             | 非常に良い          |
| AIツールとの相性 | 良い             | 非常に良い          |

---

# Electronとは

## 構造

```txt
App
 ├─ Chromium
 ├─ Node.js
 └─ HTML/CSS/JS
```

つまり：

```txt
Chromeブラウザを丸ごと同梱する
```

方式。

---

# Electronのメリット

## ① 開発が圧倒的に簡単

Webアプリ制作者に非常に優しい。

```js
BrowserWindow()
```

だけでアプリ化できる。

---

## ② Node.js APIがそのまま使える

```js
fs
child_process
ssh
socket
```

などが簡単。

---

## ③ 情報量が非常に多い

有名アプリの多くがElectron。

* VSCode
* Discord
* Slack
* Obsidian

---

## ④ AIアプリとの相性が良い

LLM + WebUI 構成と非常に相性が良い。

---

# Electronのデメリット

## ① 重い

Chromiumを毎回起動するため、

```txt
起動直後 300MB〜1GB
```

程度使うこともある。

---

## ② バッテリー・GPU消費が大きい

常時GPUを利用しやすい。

---

## ③ 「ブラウザ感」が強い

軽量HUD系では気になる。

---

## ④ 多重起動問題

トレイ問題や白画面問題など、
プロセス管理がやや重い。

---

# Tauriとは

## 構造

```txt
App
 ├─ Rust Backend
 ├─ OS標準WebView
 └─ HTML/CSS/JS
```

つまり：

```txt
OSのブラウザエンジンを借りる
```

方式。

Linuxでは：

```txt
WebKitGTK
```

を使用。

---

# Tauriのメリット

## ① 超軽量

典型：

```txt
20MB〜80MB
```

程度。

---

## ② ネイティブ感が強い

OSツール感が自然。

---

## ③ AppImageとの相性が良い

Linux運用に非常に向く。

---

## ④ 常駐ツールに強い

以下と非常に相性が良い：

* HUD
* ランチャー
* RSS
* 通知
* AIアシスタント

---

## ⑤ セキュリティが強い

Rust backend のため安全性が高い。

---

# Tauriのデメリット

## ① Rust知識が少し必要

完全JavaScriptではない。

---

## ② Electronほど情報量が多くない

最近急成長しているが、
まだ差はある。

---

## ③ Linux依存問題がある

```txt
WebKitGTK不足
```

など。

---

## ④ Node APIを直接使えない

Electron感覚で：

```js
fs.readFile()
```

のようにはいかない。

---

# Electronが向いているもの

## 巨大アプリ

* VSCode
* Discord
* Obsidian
* Slack

など。

---

## 理由

```txt
機能量 > 軽量性
```

だから。

---

# Tauriが向いているもの

## 常駐ユーティリティ

* AI HUD
* RSS
* ミニプレイヤー
* AIランチャー
* 監視ツール

など。

---

# Ink Commandとの相性

## 結論

```txt
Tauriの方が圧倒的に合っている
```

---

# 理由

## ① 常時起動前提

Ink Command は：

```txt
常時監視
```

設計。

軽量性が重要。

---

## ② HUD設計

Ink Command は：

```txt
AI Ops Center
Infrastructure HUD
```

なので、

```txt
即応性
軽量性
常駐性
```

が重要。

---

## ③ Linux中心構成

現在の主軸：

* HP-Slimline
* Acepc
* Bot NUC

すべてLinux寄り。

---

## ④ Backend分離済み

現在：

```txt
Frontend = Vite
Backend = FastAPI
AI = Ollama
Media = Jellyfin
```

なので、

```txt
Frontend shellだけ
```

あればよい。

---

# Inkシリーズの相性

| アプリ         | 推奨           |
| ----------- | ------------ |
| Ink Command | Tauri        |
| Ink Habit   | Tauri        |
| Ink Atelier | Tauri        |
| Ink Radio   | Tauri        |
| Ink Memory  | Streamlitのまま |
| Ink Lyric   | 将来的にTauri候補  |

---

# 将来的な設計思想

Inkシリーズは単なるWebアプリ群ではなく、

```txt
Personal AI OS
```

へ近づいている。

---

# 今後重要になるもの

* 常駐
* 軽量
* ノード監視
* ローカルAI
* RSS
* Jellyfin
* Ollama
* Tailscale
* AI Ops

---

# 普遍的な判断基準

## Electronを選ぶ時

```txt
巨大Webアプリをそのままデスクトップ化したい
```

---

## Tauriを選ぶ時

```txt
OSツールとして軽く常駐したい
```

---

# Ink Commandの最終判断

## 現段階

```txt
Electron → 過剰
Tauri → 最適
```

---

# まとめ

## Electron

```txt
巨大アプリ向き
重い
成熟
簡単
```

---

## Tauri

```txt
軽量
HUD向き
Linux強い
常駐向き
```

---

# Ink Inc.としての方向性

Inkシリーズは今後：

```txt
AI Creation, Human Care.
The Future Drawn Together.
```

という思想のもと、

```txt
AIと共存する個人OS
```

として進化していく。

その方向性においては、
ElectronよりもTauriの思想の方が一致している。
