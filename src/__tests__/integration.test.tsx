import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import * as database from '../utils/database'

// Mock database functions
vi.mock('../utils/database', () => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
  deleteUser: vi.fn(),
  updateUserSettings: vi.fn(),
  saveGameSession: vi.fn(),
  getWeeklyRanking: vi.fn(),
  getTodaysBestScore: vi.fn()
}))

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(database.getUsers).mockResolvedValue([])
    vi.mocked(database.getWeeklyRanking).mockResolvedValue([])
    vi.mocked(database.getTodaysBestScore).mockResolvedValue(0)
    
    // Mock URLSearchParams for normal mode
    const mockURLSearchParams = {
      get: vi.fn(() => null)
    }
    
    Object.defineProperty(global, 'URLSearchParams', {
      value: vi.fn(() => mockURLSearchParams),
      writable: true,
      configurable: true
    })
  })

  it('should complete basic user flow navigation', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'テストユーザー',
      settings: { operations: ['addition'], maxDigits: 2, playTime: 2 },
      createdAt: Date.now()
    }
    
    vi.mocked(database.getUsers).mockResolvedValue([mockUser])

    render(<App />)
    const user = userEvent.setup()

    // Should start at home screen
    await waitFor(() => {
      expect(screen.getByText('フラッシュ暗算')).toBeInTheDocument()
      expect(screen.getByText('テストユーザー')).toBeInTheDocument()
    })

    // Select user
    await act(async () => {
      await user.click(screen.getByText('テストユーザー'))
    })

    await waitFor(() => {
      expect(screen.getByText('ゲームを始める')).toBeInTheDocument()
    })

    await act(async () => {
      await user.click(screen.getByText('ゲームを始める'))
    })

    // Should navigate to settings screen
    await waitFor(() => {
      expect(screen.getByText('ゲーム設定')).toBeInTheDocument()
    })
  })

  it('should handle edit mode functionality', async () => {
    const mockUsers = [
      {
        id: 'user-1',
        name: 'ユーザー1',
        settings: { operations: ['addition'], maxDigits: 2, playTime: 2 },
        createdAt: Date.now()
      },
      {
        id: 'user-2',
        name: 'ユーザー2',
        settings: { operations: ['addition'], maxDigits: 2, playTime: 2 },
        createdAt: Date.now()
      }
    ]

    vi.mocked(database.getUsers).mockResolvedValue(mockUsers)

    // Mock edit mode
    const mockEditModeURLSearchParams = {
      get: vi.fn((param: string) => param === 'mode' ? 'edit' : null)
    }
    
    Object.defineProperty(global, 'URLSearchParams', {
      value: vi.fn(() => mockEditModeURLSearchParams),
      writable: true,
      configurable: true
    })

    const { container } = render(<App />)

    await waitFor(() => {
      expect(screen.getByText('🛠️ 編集モード')).toBeInTheDocument()
      expect(screen.getByText('ユーザー1')).toBeInTheDocument()
      expect(screen.getByText('ユーザー2')).toBeInTheDocument()
    })

    // Should show delete buttons in edit mode
    const deleteButtons = screen.getAllByText('削除')
    expect(deleteButtons.length).toBeGreaterThanOrEqual(2)

    // Should show add user button in edit mode
    expect(screen.getByText('新しいユーザーを追加')).toBeInTheDocument()
  })

  it('should handle normal mode (no edit functionality)', async () => {
    const mockUsers = [
      {
        id: 'user-1',
        name: 'ユーザー1',
        settings: { operations: ['addition'], maxDigits: 2, playTime: 2 },
        createdAt: Date.now()
      }
    ]

    vi.mocked(database.getUsers).mockResolvedValue(mockUsers)

    // Mock normal mode (no edit parameter)
    const mockNormalModeURLSearchParams = {
      get: vi.fn(() => null)
    }
    
    Object.defineProperty(global, 'URLSearchParams', {
      value: vi.fn(() => mockNormalModeURLSearchParams),
      writable: true,
      configurable: true
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('ユーザー1')).toBeInTheDocument()
    })

    // Should not show edit mode indicator
    expect(screen.queryByText('🛠️ 編集モード')).not.toBeInTheDocument()

    // Should not show delete buttons
    expect(screen.queryByText('削除')).not.toBeInTheDocument()

    // Should not show add user button
    expect(screen.queryByText('新しいユーザーを追加')).not.toBeInTheDocument()

    // Should show ranking button at bottom
    expect(screen.getByText('ランキングを見る')).toBeInTheDocument()
  })

  it('should navigate to ranking and back', async () => {
    const mockRankings = [
      {
        userId: 'user-1',
        userName: 'トップユーザー',
        totalCorrectAnswers: 50
      },
      {
        userId: 'user-2',
        userName: '二位ユーザー',
        totalCorrectAnswers: 40
      }
    ]

    vi.mocked(database.getWeeklyRanking).mockResolvedValue(mockRankings)

    render(<App />)
    const user = userEvent.setup()

    // Click ranking button
    await waitFor(() => {
      expect(screen.getByText('ランキングを見る')).toBeInTheDocument()
    })

    await act(async () => {
      await user.click(screen.getByText('ランキングを見る'))
    })

    // Should show ranking screen
    await waitFor(() => {
      expect(screen.getByText('週間ランキング')).toBeInTheDocument()
      expect(screen.getByText('トップユーザー')).toBeInTheDocument()
      expect(screen.getByText('二位ユーザー')).toBeInTheDocument()
      expect(screen.getByText('50問')).toBeInTheDocument()
      expect(screen.getByText('40問')).toBeInTheDocument()
    })

    // Go back to home
    await act(async () => {
      await user.click(screen.getByText('ホームに戻る'))
    })

    await waitFor(() => {
      expect(screen.getByText('フラッシュ暗算')).toBeInTheDocument()
    })
  })

  it('should handle user deletion flow', async () => {
    const mockUsers = [
      {
        id: 'user-1',
        name: 'テストユーザー',
        settings: { operations: ['addition'], maxDigits: 2, playTime: 2 },
        createdAt: Date.now()
      }
    ]

    vi.mocked(database.getUsers).mockResolvedValue(mockUsers)
    vi.mocked(database.deleteUser).mockResolvedValue()

    // Mock edit mode
    const mockEditModeURLSearchParams = {
      get: vi.fn((param: string) => param === 'mode' ? 'edit' : null)
    }
    
    Object.defineProperty(global, 'URLSearchParams', {
      value: vi.fn(() => mockEditModeURLSearchParams),
      writable: true,
      configurable: true
    })

    // Mock confirm dialog
    const mockConfirm = vi.fn(() => true)
    global.confirm = mockConfirm

    render(<App />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('テストユーザー')).toBeInTheDocument()
      expect(screen.getByText('削除')).toBeInTheDocument()
    })

    // Delete user
    await act(async () => {
      await user.click(screen.getByText('削除'))
    })

    expect(mockConfirm).toHaveBeenCalledWith('このユーザーを削除しますか？')
    expect(database.deleteUser).toHaveBeenCalledWith('user-1')
  })

  it('should handle error states gracefully', async () => {
    vi.mocked(database.getUsers).mockRejectedValue(new Error('Database error'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('ユーザーの読み込みに失敗しました')).toBeInTheDocument()
    })
  })

  it('should show empty states appropriately', async () => {
    vi.mocked(database.getUsers).mockResolvedValue([])
    vi.mocked(database.getWeeklyRanking).mockResolvedValue([])

    render(<App />)
    const user = userEvent.setup()

    // Home screen empty state
    await waitFor(() => {
      expect(screen.getByText('ユーザーが登録されていません')).toBeInTheDocument()
    })

    // Ranking screen empty state
    await act(async () => {
      await user.click(screen.getByText('ランキングを見る'))
    })

    await waitFor(() => {
      expect(screen.getByText('まだランキングがありません')).toBeInTheDocument()
      expect(screen.getByText('ゲームをプレイしてランキングに参加しましょう！')).toBeInTheDocument()
    })
  })
})