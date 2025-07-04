import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Result from '../Result'
import { AppProvider } from '../../contexts/AppContext'
import * as database from '../../utils/database'
import type { GameResult, User } from '../../types'

// Mock database functions
vi.mock('../../utils/database', () => ({
  getTodaysBestScore: vi.fn()
}))

const mockOnBackToHome = vi.fn()

const TestWrapper = ({ gameResult, currentUser }: { gameResult?: GameResult | null, currentUser?: User | null }) => {
  return (
    <AppProvider>
      <TestComponent gameResult={gameResult} currentUser={currentUser} />
    </AppProvider>
  )
}

const TestComponent = ({ gameResult, currentUser }: { gameResult?: GameResult | null, currentUser?: User | null }) => {
  const { dispatch } = useApp()
  
  React.useEffect(() => {
    if (gameResult !== undefined) {
      dispatch({ type: 'SET_GAME_RESULT', payload: gameResult })
    }
    if (currentUser !== undefined) {
      dispatch({ type: 'SET_CURRENT_USER', payload: currentUser })
    }
  }, [gameResult, currentUser, dispatch])

  return <Result onBackToHome={mockOnBackToHome} />
}

// Need to import React and useApp
import React from 'react'
import { useApp } from '../../contexts/AppContext'

describe('Result Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(database.getTodaysBestScore).mockResolvedValue(5)
  })

  const mockUser: User = {
    id: 'user-1',
    name: 'テストユーザー',
    settings: { operations: ['addition'], maxDigits: 2, playTime: 2 },
    createdAt: Date.now()
  }

  const mockGameResult: GameResult = {
    correctAnswers: 8,
    totalProblems: 10,
    timeSpent: 120
  }

  it('should display error when no game result', async () => {
    render(
      <TestWrapper gameResult={null} currentUser={mockUser} />
    )

    await waitFor(() => {
      expect(screen.getByText('結果データがありません')).toBeInTheDocument()
    })
  })

  it('should display error when no current user', async () => {
    render(
      <TestWrapper gameResult={mockGameResult} currentUser={null} />
    )

    await waitFor(() => {
      expect(screen.getByText('結果データがありません')).toBeInTheDocument()
    })
  })

  it('should display game results correctly', async () => {
    render(
      <TestWrapper gameResult={mockGameResult} currentUser={mockUser} />
    )

    await waitFor(() => {
      expect(screen.getByText('ゲーム結果')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument() // Correct answers
      expect(screen.getByText('10')).toBeInTheDocument() // Total problems
      expect(screen.getByText('80%')).toBeInTheDocument() // Accuracy
      expect(screen.getByText('2分0秒')).toBeInTheDocument() // Time spent
    })
  })

  it('should show best record indicator when score is new best', async () => {
    vi.mocked(database.getTodaysBestScore).mockResolvedValue(7) // Previous best was 7
    
    render(
      <TestWrapper gameResult={mockGameResult} currentUser={mockUser} />
    )

    await waitFor(() => {
      expect(screen.getByText('🎉 今日のベストレコード！')).toBeInTheDocument()
    })
  })

  it('should not show best record indicator when score is not new best', async () => {
    vi.mocked(database.getTodaysBestScore).mockResolvedValue(9) // Previous best was 9
    
    render(
      <TestWrapper gameResult={mockGameResult} currentUser={mockUser} />
    )

    await waitFor(() => {
      expect(screen.queryByText('🎉 今日のベストレコード！')).not.toBeInTheDocument()
    })
  })

  it('should show best record indicator when score equals previous best', async () => {
    vi.mocked(database.getTodaysBestScore).mockResolvedValue(8) // Previous best was 8 (same as current)
    
    render(
      <TestWrapper gameResult={mockGameResult} currentUser={mockUser} />
    )

    await waitFor(() => {
      expect(screen.getByText('🎉 今日のベストレコード！')).toBeInTheDocument()
    })
  })

  it('should display appropriate performance message based on accuracy', async () => {
    const highScoreResult: GameResult = {
      correctAnswers: 9,
      totalProblems: 10,
      timeSpent: 120
    }

    render(
      <TestWrapper gameResult={highScoreResult} currentUser={mockUser} />
    )

    await waitFor(() => {
      expect(screen.getByText('素晴らしい成績です！')).toBeInTheDocument()
    })
  })

  it('should calculate and display average time per problem', async () => {
    render(
      <TestWrapper gameResult={mockGameResult} currentUser={mockUser} />
    )

    await waitFor(() => {
      expect(screen.getByText('1問あたりの平均時間')).toBeInTheDocument()
      expect(screen.getByText('12秒')).toBeInTheDocument() // 120 / 10 = 12
    })
  })

  it('should call onBackToHome when back button is clicked', async () => {
    render(
      <TestWrapper gameResult={mockGameResult} currentUser={mockUser} />
    )

    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('ホームに戻る')).toBeInTheDocument()
    })

    await act(async () => {
      await user.click(screen.getByText('ホームに戻る'))
    })

    expect(mockOnBackToHome).toHaveBeenCalled()
  })

  it('should format time correctly', async () => {
    const longTimeResult: GameResult = {
      correctAnswers: 8,
      totalProblems: 10,
      timeSpent: 150 // 2 minutes 30 seconds
    }

    render(
      <TestWrapper gameResult={longTimeResult} currentUser={mockUser} />
    )

    await waitFor(() => {
      expect(screen.getByText('2分30秒')).toBeInTheDocument()
    })
  })

  it('should handle zero total problems', async () => {
    const zeroProblemsResult: GameResult = {
      correctAnswers: 0,
      totalProblems: 0,
      timeSpent: 60
    }

    render(
      <TestWrapper gameResult={zeroProblemsResult} currentUser={mockUser} />
    )

    await waitFor(() => {
      expect(screen.getByText('0%')).toBeInTheDocument() // Should show 0% accuracy
    })
  })

  it('should show loading state while checking best score', async () => {
    // Make getTodaysBestScore take some time
    let resolvePromise: (value: number) => void
    const promise = new Promise<number>((resolve) => {
      resolvePromise = resolve
    })
    vi.mocked(database.getTodaysBestScore).mockReturnValue(promise)

    render(
      <TestWrapper gameResult={mockGameResult} currentUser={mockUser} />
    )

    expect(screen.getByText('結果を確認中...')).toBeInTheDocument()

    // Resolve the promise
    resolvePromise!(5)

    await waitFor(() => {
      expect(screen.getByText('ゲーム結果')).toBeInTheDocument()
    })
  })

  it('should handle database error gracefully', async () => {
    vi.mocked(database.getTodaysBestScore).mockRejectedValue(new Error('Database error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <TestWrapper gameResult={mockGameResult} currentUser={mockUser} />
    )

    await waitFor(() => {
      expect(screen.getByText('ゲーム結果')).toBeInTheDocument()
    })

    expect(consoleSpy).toHaveBeenCalledWith('ベストスコアチェックエラー:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})