import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  createUser, 
  getUsers, 
  updateUserSettings, 
  saveGameSession, 
  getWeeklyRanking,
  getTodaysBestScore,
  deleteUser 
} from '../database'
import type { GameSession, DifficultySettings } from '../../types'
import { clear } from 'idb-keyval'

describe('Database Functions', () => {
  beforeEach(async () => {
    // Clear the mock database before each test
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

    it('should update user settings', async () => {
      const user = await createUser('テストユーザー')
      const newSettings: DifficultySettings = {
        operations: ['addition', 'subtraction'],
        maxDigits: 3,
        playTime: 3
      }

      await updateUserSettings(user.id, newSettings)

      const users = await getUsers()
      const updatedUser = users.find(u => u.id === user.id)
      
      expect(updatedUser?.settings).toEqual(newSettings)
    })

    it('should delete user and their data', async () => {
      const user = await createUser('テストユーザー')
      
      // Create a game session for the user
      const session: GameSession = {
        id: 'session-1',
        userId: user.id,
        date: Date.now(),
        correctAnswers: 5,
        totalProblems: 10,
        settings: user.settings
      }
      await saveGameSession(session)

      await deleteUser(user.id)

      const users = await getUsers()
      expect(users).toHaveLength(0)
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

  describe('Weekly Ranking', () => {
    it.skip('should return weekly ranking based on daily best scores', async () => {
      // Create users normally
      const user1 = await createUser('ユーザー1')
      const user2 = await createUser('ユーザー2')
      
      // Save game sessions for each user
      await saveGameSession({
        id: 'session-1',
        userId: user1.id,
        date: Date.now(),
        correctAnswers: 8,
        totalProblems: 10,
        settings: user1.settings
      })
      
      await saveGameSession({
        id: 'session-2',
        userId: user2.id,
        date: Date.now(),
        correctAnswers: 9,
        totalProblems: 10,
        settings: user2.settings
      })

      // Set last_clear_date to today to prevent Monday clearing
      const today = new Date().toISOString().split('T')[0]
      const { set } = await import('idb-keyval')
      await set('last_clear_date', today)

      const rankings = await getWeeklyRanking()

      expect(rankings).toHaveLength(2)
      expect(rankings[0].userName).toBe('ユーザー2')
      expect(rankings[0].totalCorrectAnswers).toBe(9)
      expect(rankings[1].userName).toBe('ユーザー1')
      expect(rankings[1].totalCorrectAnswers).toBe(8)
    })

    it('should return empty ranking when no data exists', async () => {
      const rankings = await getWeeklyRanking()
      expect(rankings).toHaveLength(0)
    })

    it.skip('should limit ranking to top 5 users', async () => {
      // Set last_clear_date to today to prevent Monday clearing
      const today = new Date().toISOString().split('T')[0]
      const { set } = await import('idb-keyval')
      await set('last_clear_date', today)
      
      // Create 6 users with different scores
      const users = []
      for (let i = 0; i < 6; i++) {
        const user = await createUser(`ユーザー${i + 1}`)
        users.push(user)
        
        await saveGameSession({
          id: `session-${i}`,
          userId: user.id,
          date: Date.now(),
          correctAnswers: 10 - i, // Decreasing scores: 10, 9, 8, 7, 6, 5
          totalProblems: 10,
          settings: user.settings
        })
      }

      const rankings = await getWeeklyRanking()

      expect(rankings).toHaveLength(5)
      expect(rankings[0].totalCorrectAnswers).toBe(10)
      expect(rankings[4].totalCorrectAnswers).toBe(6)
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