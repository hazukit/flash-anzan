import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../Home'
import { AppProvider } from '../../contexts/AppContext'
import * as database from '../../utils/database'
import type { OperationType } from '../../types'

// Mock database functions
vi.mock('../../utils/database', () => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
  deleteUser: vi.fn()
}))

const mockOnSelectUser = vi.fn()
const mockOnShowRanking = vi.fn()

const renderHome = (editMode = false) => {
  // Mock URLSearchParams for edit mode
  const mockURLSearchParams = {
    get: vi.fn((param: string) => param === 'mode' && editMode ? 'edit' : null)
  }
  
  Object.defineProperty(globalThis, 'URLSearchParams', {
    value: vi.fn(() => mockURLSearchParams),
    writable: true,
    configurable: true
  })

  return render(
    <AppProvider>
      <Home onSelectUser={mockOnSelectUser} onShowRanking={mockOnShowRanking} />
    </AppProvider>
  )
}

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(database.getUsers).mockResolvedValue([])
  })

  it('should render title', async () => {
    renderHome()
    
    await waitFor(() => {
      expect(screen.getByText('フラッシュ暗算')).toBeInTheDocument()
    })
    
    await waitFor(() => {
      expect(screen.getByText('ユーザーが登録されていません')).toBeInTheDocument()
    })
  })

  it('should show edit mode indicator when in edit mode', async () => {
    renderHome(true)
    
    await waitFor(() => {
      expect(screen.getByText('🛠️ 編集モード')).toBeInTheDocument()
    })
  })

  it('should not show edit mode indicator in normal mode', async () => {
    renderHome(false)
    
    await waitFor(() => {
      expect(screen.queryByText('🛠️ 編集モード')).not.toBeInTheDocument()
    })
  })

  it('should display users when they exist', async () => {
    const mockUsers = [
      {
        id: '1',
        name: 'テストユーザー1',
        settings: { operations: ['addition' as OperationType], maxDigits: 2, playTime: 2 },
        createdAt: Date.now()
      },
      {
        id: '2',
        name: 'テストユーザー2',
        settings: { operations: ['addition' as OperationType], maxDigits: 2, playTime: 2 },
        createdAt: Date.now()
      }
    ]
    vi.mocked(database.getUsers).mockResolvedValue(mockUsers)

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('テストユーザー1')).toBeInTheDocument()
      expect(screen.getByText('テストユーザー2')).toBeInTheDocument()
    })
  })

  it('should show "新しいユーザーを追加" button only in edit mode', async () => {
    // Test normal mode
    renderHome(false)
    await waitFor(() => {
      expect(screen.queryByText('新しいユーザーを追加')).not.toBeInTheDocument()
    })

    // Test edit mode
    renderHome(true)
    await waitFor(() => {
      expect(screen.getByText('新しいユーザーを追加')).toBeInTheDocument()
    })
  })

  it('should show delete buttons only in edit mode', async () => {
    const mockUsers = [{
      id: '1',
      name: 'テストユーザー',
      settings: { operations: ['addition' as OperationType], maxDigits: 2, playTime: 2 },
      createdAt: Date.now()
    }]
    vi.mocked(database.getUsers).mockResolvedValue(mockUsers)

    // Test normal mode
    const { unmount } = renderHome(false)
    await waitFor(() => {
      expect(screen.getByText('テストユーザー')).toBeInTheDocument()
      expect(screen.queryByText('削除')).not.toBeInTheDocument()
    })
    
    unmount()

    // Test edit mode
    renderHome(true)
    await waitFor(() => {
      expect(screen.getByText('テストユーザー')).toBeInTheDocument()
      expect(screen.getByText('削除')).toBeInTheDocument()
    })
  })

  it('should allow user selection and enable start game button', async () => {
    const mockUsers = [{
      id: '1',
      name: 'テストユーザー',
      settings: { operations: ['addition' as OperationType], maxDigits: 2, playTime: 2 },
      createdAt: Date.now()
    }]
    vi.mocked(database.getUsers).mockResolvedValue(mockUsers)

    renderHome()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('テストユーザー')).toBeInTheDocument()
    })

    // Click on user
    await act(async () => {
      await user.click(screen.getByText('テストユーザー'))
    })

    // Check if start game button appears
    await waitFor(() => {
      expect(screen.getByText('ゲームを始める')).toBeInTheDocument()
    })

    // Click start game button
    await act(async () => {
      await user.click(screen.getByText('ゲームを始める'))
    })

    expect(mockOnSelectUser).toHaveBeenCalledWith('1')
  })

  it('should allow creating new user in edit mode', async () => {
    const mockNewUser = {
      id: 'new-id',
      name: '新しいユーザー',
      settings: { operations: ['addition' as OperationType], maxDigits: 2, playTime: 2 },
      createdAt: Date.now()
    }
    vi.mocked(database.createUser).mockResolvedValue(mockNewUser)

    renderHome(true)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('新しいユーザーを追加')).toBeInTheDocument()
    })

    // Click add user button
    await act(async () => {
      await user.click(screen.getByText('新しいユーザーを追加'))
    })

    // Fill in user name
    const nameInput = screen.getByPlaceholderText('ユーザー名を入力')
    await act(async () => {
      await user.type(nameInput, '新しいユーザー')
    })

    // Click create button
    await act(async () => {
      await user.click(screen.getByText('作成'))
    })

    expect(database.createUser).toHaveBeenCalledWith('新しいユーザー')
  })

  it('should allow deleting user in edit mode', async () => {
    const mockUsers = [{
      id: '1',
      name: 'テストユーザー',
      settings: { operations: ['addition' as OperationType], maxDigits: 2, playTime: 2 },
      createdAt: Date.now()
    }]
    vi.mocked(database.getUsers).mockResolvedValue(mockUsers)
    vi.mocked(database.deleteUser).mockResolvedValue()

    // Mock window.confirm
    const mockConfirm = vi.fn(() => true)
    globalThis.confirm = mockConfirm

    renderHome(true)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('削除')).toBeInTheDocument()
    })

    // Click delete button
    await act(async () => {
      await user.click(screen.getByText('削除'))
    })

    expect(mockConfirm).toHaveBeenCalledWith('このユーザーを削除しますか？')
    expect(database.deleteUser).toHaveBeenCalledWith('1')
  })

  it('should call onShowRanking when ranking button is clicked', async () => {
    renderHome()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('ランキングを見る')).toBeInTheDocument()
    })

    await act(async () => {
      await user.click(screen.getByText('ランキングを見る'))
    })

    expect(mockOnShowRanking).toHaveBeenCalled()
  })

  it('should show error message when user creation fails', async () => {
    vi.mocked(database.createUser).mockRejectedValue(new Error('Creation failed'))

    renderHome(true)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('新しいユーザーを追加')).toBeInTheDocument()
    })

    // Click add user button
    await act(async () => {
      await user.click(screen.getByText('新しいユーザーを追加'))
    })

    // Fill in user name
    const nameInput = screen.getByPlaceholderText('ユーザー名を入力')
    await act(async () => {
      await user.type(nameInput, '新しいユーザー')
    })

    // Click create button
    await act(async () => {
      await user.click(screen.getByText('作成'))
    })

    await waitFor(() => {
      expect(screen.getByText('ユーザーの作成に失敗しました')).toBeInTheDocument()
    })
  })
})