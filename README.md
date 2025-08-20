# NoteArc - メモ帳感覚で使える学習ログアプリ

**NoteArc** は、学びを素早く記録していつでも見返せるシンプルな学習ログアプリです。  
Next.js・MongoDB（Mongoose）・next-auth（メール+パスワード）で実装してあり、ローカル開発用に Docker、単体テストに Vitest、CI/CD に GitHub Actions → Render を利用する構成になっています。

---

## 概要 / 特長

- シンプルで直感的な UI：タイトル・日付・タグで学習ログを一覧、クリックで本文（Markdown）を閲覧/編集。
- 認証：メールアドレス + パスワード（Credentials）でログイン／登録。
- 各ユーザーごとにログを管理（`userId` フィールドで分離）。
- Docker でローカル開発可能、Render に本番デプロイ済み。
- Vitest を用いた単体テストと GitHub Actions による CI/CD を導入済み。

---

## 主な機能

- ユーザー認証
- 学習ログの作成・編集・削除
- 検索・フィルタ機能

---

## 予定している機能

- ゲストモード
- フォルダ機能
- 並び替え機能
- Markdown 以外の記載方法
- 下書き保存（編集中にブラウザを閉じても復元）
- 学習カレンダー

---

## 技術スタック

| 分類           | 技術                                            |
| -------------- | ----------------------------------------------- |
| Frontend       | Next.js (App Router) + TypeScript + TailwindCSS |
| Backend API    | Next.js API Routes                              |
| Database       | MongoDB + Mongoose                              |
| Authentication | next-auth                                       |
| Validation     | zod                                             |
| Testing        | Vitest                                          |
| CI/CD          | GitHub Actions                                  |
| Infrastructure | Docker, Linux, Render                           |
| Code Quality   | ESLint, Prettier                                |

---
