import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Home from '../Home'
import { AppProvider } from '../../contexts/AppContext'
import * as database from '../../utils/database'

// Mock database functions
vi.mock('../../utils/database', () => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
  deleteUser: vi.fn()
}))

const mockOnSelectUser = vi.fn()
const mockOnShowRanking = vi.fn()

describe('Home Component - Simple Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(database.getUsers).mockResolvedValue([])
    
    // Set up clean URLSearchParams mock
    Object.defineProperty(global, 'URLSearchParams', {
      value: vi.fn(() => ({
        get: vi.fn(() => null)
      })),
      writable: true,
      configurable: true
    })
  })

  it('should render home screen with title', async () => {
    render(
      <AppProvider>
        <Home onSelectUser={mockOnSelectUser} onShowRanking={mockOnShowRanking} />
      </AppProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByText('フラッシュ暗算')).toBeInTheDocument()
    })
  })

  it('should show no users message when empty', async () => {
    render(
      <AppProvider>
        <Home onSelectUser={mockOnSelectUser} onShowRanking={mockOnShowRanking} />
      </AppProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByText('ユーザーが登録されていません')).toBeInTheDocument()
    })
  })

  it('should display users when they exist', async () => {
    const mockUsers = [
      {
        id: '1',
        name: 'テストユーザー',
        settings: { operations: ['addition'], maxDigits: 2, playTime: 2 },
        createdAt: Date.now()
      }
    ]
    vi.mocked(database.getUsers).mockResolvedValue(mockUsers)

    render(
      <AppProvider>
        <Home onSelectUser={mockOnSelectUser} onShowRanking={mockOnShowRanking} />
      </AppProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('テストユーザー')).toBeInTheDocument()
    })
  })

  it('should show ranking button', async () => {
    render(
      <AppProvider>
        <Home onSelectUser={mockOnSelectUser} onShowRanking={mockOnShowRanking} />
      </AppProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('ランキングを見る')).toBeInTheDocument()
    })
  })

  it('should show edit mode when URL parameter is set', async () => {
    // Mock edit mode URLSearchParams
    Object.defineProperty(global, 'URLSearchParams', {
      value: vi.fn(() => ({
        get: vi.fn((param: string) => param === 'mode' ? 'edit' : null)
      })),
      writable: true,
      configurable: true
    })

    render(
      <AppProvider>
        <Home onSelectUser={mockOnSelectUser} onShowRanking={mockOnShowRanking} />
      </AppProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('🛠️ 編集モード')).toBeInTheDocument()
    })
  })

  it('should show add user button only in edit mode', async () => {
    // First test normal mode
    render(
      <AppProvider>
        <Home onSelectUser={mockOnSelectUser} onShowRanking={mockOnShowRanking} />
      </AppProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('新しいユーザーを追加')).not.toBeInTheDocument()
    })
  })
})