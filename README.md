# NoteArc - メモ帳感覚で使える学習ログアプリ

Next.js と MongoDB を使った学習記録アプリ。  
Docker 上で動作し、API 経由で CRUD 操作が可能です。

---

## 予定している機能

- ユーザー認証
- 学習ログの作成・編集・削除
- 検索・フィルタ機能
- フォルダ機能
- 学習カレンダー
- レスポンシブデザイン対応
- 下書き保存（編集中にブラウザを閉じても復元）

---

## 技術スタック

| 分類           | 技術                              |
| -------------- | --------------------------------- |
| Frontend       | Next.js (App Router) + TypeScript |
| Backend API    | Next.js API Routes                |
| Database       | MongoDB + Mongoose                |
| Authentication | Auth.js                           |
| Validation     | zod                               |
| Testing        | Vitest                            |
| CI/CD          | GitHub Actions                    |
| Infrastructure | Docker, Linux, Render             |
| Code Quality   | ESLint, Prettier                  |

---
