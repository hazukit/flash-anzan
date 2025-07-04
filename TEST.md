# テスト仕様書

## テスト環境

- **テストフレームワーク**: Vitest
- **UIテスト**: @testing-library/react
- **モック**: jsdom environment
- **実行環境**: Node.js + TypeScript

## テストファイル構成

```
src/
├── __tests__/
│   ├── simple.test.ts              # 基本動作確認
│   └── integration.test.tsx        # 統合テスト
├── components/__tests__/
│   ├── Home.test.tsx              # Homeコンポーネント
│   └── Result.test.tsx            # Resultコンポーネント
├── contexts/__tests__/
│   └── AppContext.test.tsx        # アプリケーション状態管理
└── utils/__tests__/
    ├── database.test.ts           # データベース機能（完全版）
    ├── database-simple.test.ts    # データベース機能（簡易版）
    └── gameLogic.test.ts          # ゲームロジック
```

## 実行コマンド

```bash
# 全テスト実行
npm run test:run

# 特定のテストファイル実行
npm run test:run -- src/utils/__tests__/database-simple.test.ts

# テストUI実行
npm run test:ui

# ウォッチモード
npm test
```

## テストカバレッジ

### データベース機能テスト
- ユーザー作成・取得・削除
- ゲームセッション保存
- 日別ベストスコア管理
- 今日のベストスコア取得

### ゲームロジックテスト
- 問題生成（加算、減算、乗算、除算）
- 桁数指定対応
- 計算結果検証

### コンポーネントテスト
- Homeコンポーネント（ユーザー選択、編集モード）
- Resultコンポーネント（ベストレコード表示）
- AppContext（状態管理）

### 統合テスト
- 基本ユーザーフロー
- 編集モード機能
- ナビゲーション
- エラーハンドリング

## 重要な実装仕様

### 編集モード
- URLパラメータ `?mode=edit` で編集モード有効化
- 編集モードでのみユーザー削除・追加ボタン表示
- 通常モードでは子供が誤操作しないよう機能制限

### 日別ベストスコア
- 1日1回のベストスコアのみ記録
- 月曜日に自動データクリア
- ベストレコード達成時の特別表示

### データ永続化
- IndexedDB使用（idb-keyval）
- ローカルストレージベース
- テスト時はメモリ上でモック

## テスト実行結果

```bash
# 動作確認済みテスト
Simple Test (3 tests)
Database Functions - Core (6 tests)
Game Logic Functions (9 tests)
AppContext (8 tests)

# 一部制限事項のあるテスト
⚠️ Component Tests (複雑な統合部分で一部警告あり)
⚠️ Integration Tests (React 19の新機能による警告あり)
```

## メンテナンス

### 新機能追加時
1. 対応する単体テストを作成
2. 統合テストでエンドツーエンドをテスト
3. エラーケースのテストを追加

### テスト修正時
1. モックの設定を確認
2. act()でのラップが必要な箇所を確認
3. 非同期処理のwaitForを適切に使用

## トラブルシューティング

### よくある問題
1. **act() warning**: React状態更新を`act()`でラップ
2. **モック設定**: `beforeEach`でリセット
3. **非同期処理**: `waitFor`で完了を待機