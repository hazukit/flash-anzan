import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  createUser, 
  getUsers, 
  saveGameSession, 
  getTodaysBestScore
} from '../database'
import type { GameSession } from '../../types'
import { clear } from 'idb-keyval'

describe('Database Functions - Core', () => {
  beforeEach(async () => {
    await clear()
    vi.clearAllMocks()
  })

  describe('User Management', () => {
    it('should create a new user with default settings', async () => {
      const user = await createUser('テストユーザー')

      expect(user).toMatchObject({
        name: 'テストユーザー',
        settings: {
          operations: ['addition'],
          maxDigits: 2,
          playTime: 2
        }
      })
      expect(user.id).toBeDefined()
      expect(user.createdAt).toBeDefined()
    })

    it('should get all users', async () => {
      const user1 = await createUser('ユーザー1')
      const user2 = await createUser('ユーザー2')

      const users = await getUsers()

      expect(users).toHaveLength(2)
      expect(users.map(u => u.name)).toContain('ユーザー1')
      expect(users.map(u => u.name)).toContain('ユーザー2')
    })
  })

  describe('Game Session Management', () => {
    it('should save game session and update daily best score', async () => {
      const user = await createUser('テストユーザー')
      const session: GameSession = {
        id: 'session-1',
        userId: user.id,
        date: Date.now(),
        correctAnswers: 8,
        totalProblems: 10,
        settings: user.settings
      }

      await saveGameSession(session)

      const bestScore = await getTodaysBestScore(user.id)
      expect(bestScore).toBe(8)
    })

    it('should update daily best score only if current score is higher', async () => {
      const user = await createUser('テストユーザー')
      
      // First session with lower score
      const session1: GameSession = {
        id: 'session-1',
        userId: user.id,
        date: Date.now(),
        correctAnswers: 5,
        totalProblems: 10,
        settings: user.settings
      }
      await saveGameSession(session1)

      // Second session with higher score
      const session2: GameSession = {
        id: 'session-2',
        userId: user.id,
        date: Date.now(),
        correctAnswers: 8,
        totalProblems: 10,
        settings: user.settings
      }
      await saveGameSession(session2)

      // Third session with lower score (shouldn't update)
      const session3: GameSession = {
        id: 'session-3',
        userId: user.id,
        date: Date.now(),
        correctAnswers: 6,
        totalProblems: 10,
        settings: user.settings
      }
      await saveGameSession(session3)

      const bestScore = await getTodaysBestScore(user.id)
      expect(bestScore).toBe(8) // Should remain the highest score
    })
  })

  describe('Today\'s Best Score', () => {
    it('should return 0 for user with no sessions', async () => {
      const user = await createUser('テストユーザー')
      const bestScore = await getTodaysBestScore(user.id)
      expect(bestScore).toBe(0)
    })

    it('should return today\'s best score for user', async () => {
      const user = await createUser('テストユーザー')
      
      await saveGameSession({
        id: 'session-1',
        userId: user.id,
        date: Date.now(),
        correctAnswers: 7,
        totalProblems: 10,
        settings: user.settings
      })

      const bestScore = await getTodaysBestScore(user.id)
      expect(bestScore).toBe(7)
    })
  })
})