import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AppProvider, useApp } from '../AppContext'
import type { User, GameResult } from '../../types'

// Test component to access context
const TestComponent = () => {
  const { state, dispatch } = useApp()
  
  return (
    <div>
      <div data-testid="edit-mode">{state.isEditMode ? 'true' : 'false'}</div>
      <div data-testid="users-count">{state.users.length}</div>
      <div data-testid="current-user">{state.currentUser?.name || 'none'}</div>
      <div data-testid="loading">{state.loading ? 'true' : 'false'}</div>
      <div data-testid="error">{state.error || 'none'}</div>
      
      <button onClick={() => dispatch({ type: 'SET_EDIT_MODE', payload: true })}>
        Set Edit Mode
      </button>
      <button onClick={() => dispatch({ type: 'SET_LOADING', payload: true })}>
        Set Loading
      </button>
      <button onClick={() => dispatch({ type: 'SET_ERROR', payload: 'Test error' })}>
        Set Error
      </button>
    </div>
  )
}

describe('AppContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock URLSearchParams for edit mode detection
    Object.defineProperty(window, 'location', {
      value: {
        search: ''
      },
      writable: true
    })
  })

  it('should provide initial state', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    expect(screen.getByTestId('edit-mode')).toHaveTextContent('false')
    expect(screen.getByTestId('users-count')).toHaveTextContent('0')
    expect(screen.getByTestId('current-user')).toHaveTextContent('none')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('error')).toHaveTextContent('none')
  })

  it('should detect edit mode from URL parameter', () => {
    // Mock URLSearchParams to return edit mode
    const mockURLSearchParams = {
      get: vi.fn((param: string) => param === 'mode' ? 'edit' : null)
    }
    
    Object.defineProperty(global, 'URLSearchParams', {
      value: vi.fn(() => mockURLSearchParams),
      writable: true,
      configurable: true
    })

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    expect(screen.getByTestId('edit-mode')).toHaveTextContent('true')
  })

  it('should update edit mode state', async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    await act(async () => {
      screen.getByText('Set Edit Mode').click()
    })

    expect(screen.getByTestId('edit-mode')).toHaveTextContent('true')
  })

  it('should update loading state', async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    await act(async () => {
      screen.getByText('Set Loading').click()
    })

    expect(screen.getByTestId('loading')).toHaveTextContent('true')
  })

  it('should update error state', async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    await act(async () => {
      screen.getByText('Set Error').click()
    })

    expect(screen.getByTestId('error')).toHaveTextContent('Test error')
  })

  it('should handle user operations', () => {
    const TestUserComponent = () => {
      const { state, dispatch } = useApp()
      
      const addUser = () => {
        const user: User = {
          id: 'test-1',
          name: 'Test User',
          settings: {
            operations: ['addition'],
            maxDigits: 2,
            playTime: 2
          },
          createdAt: Date.now()
        }
        dispatch({ type: 'ADD_USER', payload: user })
      }

      const setCurrentUser = () => {
        if (state.users.length > 0) {
          dispatch({ type: 'SET_CURRENT_USER', payload: state.users[0] })
        }
      }

      const deleteUser = () => {
        if (state.users.length > 0) {
          dispatch({ type: 'DELETE_USER', payload: state.users[0].id })
        }
      }

      return (
        <div>
          <div data-testid="users-count">{state.users.length}</div>
          <div data-testid="current-user">{state.currentUser?.name || 'none'}</div>
          <button onClick={addUser}>Add User</button>
          <button onClick={setCurrentUser}>Set Current User</button>
          <button onClick={deleteUser}>Delete User</button>
        </div>
      )
    }

    render(
      <AppProvider>
        <TestUserComponent />
      </AppProvider>
    )

    // Add user
    act(() => {
      screen.getByText('Add User').click()
    })
    expect(screen.getByTestId('users-count')).toHaveTextContent('1')
    expect(screen.getByTestId('current-user')).toHaveTextContent('Test User')

    // Set current user
    act(() => {
      screen.getByText('Set Current User').click()
    })
    expect(screen.getByTestId('current-user')).toHaveTextContent('Test User')

    // Delete user
    act(() => {
      screen.getByText('Delete User').click()
    })
    expect(screen.getByTestId('users-count')).toHaveTextContent('0')
    expect(screen.getByTestId('current-user')).toHaveTextContent('none')
  })

  it('should handle game result operations', () => {
    const TestGameComponent = () => {
      const { state, dispatch } = useApp()
      
      const setGameResult = () => {
        const result: GameResult = {
          correctAnswers: 8,
          totalProblems: 10,
          timeSpent: 120
        }
        dispatch({ type: 'SET_GAME_RESULT', payload: result })
      }

      const clearGameResult = () => {
        dispatch({ type: 'SET_GAME_RESULT', payload: null })
      }

      return (
        <div>
          <div data-testid="game-result">
            {state.gameResult ? `${state.gameResult.correctAnswers}/${state.gameResult.totalProblems}` : 'none'}
          </div>
          <button onClick={setGameResult}>Set Game Result</button>
          <button onClick={clearGameResult}>Clear Game Result</button>
        </div>
      )
    }

    render(
      <AppProvider>
        <TestGameComponent />
      </AppProvider>
    )

    // Set game result
    act(() => {
      screen.getByText('Set Game Result').click()
    })
    expect(screen.getByTestId('game-result')).toHaveTextContent('8/10')

    // Clear game result
    act(() => {
      screen.getByText('Clear Game Result').click()
    })
    expect(screen.getByTestId('game-result')).toHaveTextContent('none')
  })

  it('should throw error when useApp is used outside AppProvider', () => {
    const TestErrorComponent = () => {
      useApp()
      return <div>Should not render</div>
    }

    // Expect console.error to be called due to error boundary
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestErrorComponent />)
    }).toThrow('useApp must be used within an AppProvider')

    consoleSpy.mockRestore()
  })
})