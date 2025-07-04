# 暗算アプリ

子供向けの暗算（Flash Anzan）練習アプリです。計算力と瞬間的な暗算能力を鍛えることができます。

![Flash Anzan App](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Vitest](https://img.shields.io/badge/Tests-Vitest-yellow)

## 特徴

- **子供向け設計**: 直感的で使いやすいUI
- **複数ユーザー対応**: 家族で利用可能
- **難易度調整**: 桁数・演算種類・時間をカスタマイズ
- **編集モード**: URLパラメータで管理者機能を有効化
- **週間ランキング**: 1日1回のベストスコアで公平な競争
- **ベストレコード表示**: 今日の最高記録を達成時に特別表示
- **データ永続化**: ローカルストレージで進捗保存

## 使い方

### 基本操作

1. **ユーザー選択**: ホーム画面でユーザーを選択
2. **設定調整**: 演算種類、桁数、プレイ時間を設定
3. **ゲーム開始**: カウントダウン後にゲーム開始
4. **計算実行**: 表示される問題を暗算で解答
5. **結果確認**: 正解数、正答率、プレイ時間を確認

### 編集モード

子供が誤操作しないよう、ユーザー管理機能は編集モードでのみ利用可能です。

```
https://yourapp.com/?mode=edit
```

編集モードで利用可能な機能：
- 新しいユーザーの追加
- ユーザーの削除
- 管理者向け設定

## 対応演算

- **加算**: 基本的な足し算
- **減算**: 基本的な引き算  
- **乗算**: 掛け算
- **除算**: 割り算（整数結果のみ）

## ランキングシステム

- **1日1回記録**: 各ユーザーは1日につき1つのベストスコアのみ記録
- **週間リセット**: 毎週月曜日に自動的にデータクリア
- **公平性**: 何度プレイしても最高記録のみがランキングに反映

## 技術仕様

### フロントエンド
- **React** 19.1.0 + TypeScript
- **CSS** カスタムCSS（レスポンシブ対応）
- **状態管理** React Context API

### データベース
- **IndexedDB** (idb-keyval) - ローカルストレージ
- **自動バックアップ** なし（ローカル環境のみ）

### テスト
- **Vitest** + Testing Library
- **カバレッジ** 主要機能の単体・統合テスト

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/username/flash-anzan.git
cd flash-anzan

# 依存関係をインストール
npm install

# 開発サーバー起動
npm run dev
```

## テスト実行

```bash
# 全テスト実行
npm run test:run

# 安定テストのみ実行
npm run test:run src/__tests__/simple.test.ts src/utils/__tests__/database-simple.test.ts src/components/__tests__/Home-simple.test.tsx

# テストUI起動
npm run test:ui

# ウォッチモード
npm test
```

## 🏗️ ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

## 📂 プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── Home.tsx        # ユーザー選択画面
│   ├── Settings.tsx    # ゲーム設定画面
│   ├── Game.tsx        # ゲーム画面
│   ├── Result.tsx      # 結果表示画面
│   └── Ranking.tsx     # ランキング画面
├── contexts/           # 状態管理
│   └── AppContext.tsx  # アプリケーション状態
├── utils/              # ユーティリティ
│   ├── database.ts     # データベース操作
│   └── gameLogic.ts    # ゲームロジック
├── types/              # TypeScript型定義
│   └── index.ts
└── __tests__/          # テストファイル
```

