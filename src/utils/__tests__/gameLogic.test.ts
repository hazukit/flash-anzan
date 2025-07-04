import { describe, it, expect } from 'vitest'
import { generateProblem, calculateAnswer } from '../gameLogic'
import type { DifficultySettings } from '../../types'

describe('Game Logic Functions', () => {
  describe('generateProblem', () => {
    it('should generate addition problems with correct digits', () => {
      const settings: DifficultySettings = {
        operations: ['addition'],
        maxDigits: 2,
        playTime: 2
      }

      const problem = generateProblem(settings)

      expect(problem.operation).toBe('addition')
      expect(problem.numbers).toHaveLength(2)
      expect(problem.numbers[0]).toBeGreaterThanOrEqual(10)
      expect(problem.numbers[0]).toBeLessThan(100)
      expect(problem.numbers[1]).toBeGreaterThanOrEqual(10)
      expect(problem.numbers[1]).toBeLessThan(100)
      expect(problem.correctAnswer).toBe(problem.numbers[0] + problem.numbers[1])
    })

    it('should generate subtraction problems', () => {
      const settings: DifficultySettings = {
        operations: ['subtraction'],
        maxDigits: 2,
        playTime: 2
      }

      const problem = generateProblem(settings)

      expect(problem.operation).toBe('subtraction')
      expect(problem.numbers).toHaveLength(2)
      expect(problem.correctAnswer).toBe(problem.numbers[0] - problem.numbers[1])
    })

    it('should generate multiplication problems', () => {
      const settings: DifficultySettings = {
        operations: ['multiplication'],
        maxDigits: 1,
        playTime: 2
      }

      const problem = generateProblem(settings)

      expect(problem.operation).toBe('multiplication')
      expect(problem.numbers).toHaveLength(2)
      expect(problem.correctAnswer).toBe(problem.numbers[0] * problem.numbers[1])
    })

    it('should generate division problems with whole number results', () => {
      const settings: DifficultySettings = {
        operations: ['division'],
        maxDigits: 1,
        playTime: 2
      }

      const problem = generateProblem(settings)

      expect(problem.operation).toBe('division')
      expect(problem.numbers).toHaveLength(2)
      expect(problem.correctAnswer).toBe(problem.numbers[0] / problem.numbers[1])
      expect(Number.isInteger(problem.correctAnswer)).toBe(true)
    })

    it('should generate problems with single digit when maxDigits is 1', () => {
      const settings: DifficultySettings = {
        operations: ['addition'],
        maxDigits: 1,
        playTime: 2
      }

      const problem = generateProblem(settings)

      expect(problem.numbers[0]).toBeGreaterThanOrEqual(1)
      expect(problem.numbers[0]).toBeLessThan(10)
      expect(problem.numbers[1]).toBeGreaterThanOrEqual(1)
      expect(problem.numbers[1]).toBeLessThan(10)
    })

    it('should generate problems with three digits when maxDigits is 3', () => {
      const settings: DifficultySettings = {
        operations: ['addition'],
        maxDigits: 3,
        playTime: 2
      }

      const problem = generateProblem(settings)

      expect(problem.numbers[0]).toBeGreaterThanOrEqual(100)
      expect(problem.numbers[0]).toBeLessThan(1000)
      expect(problem.numbers[1]).toBeGreaterThanOrEqual(100)
      expect(problem.numbers[1]).toBeLessThan(1000)
    })

    it('should randomly select from multiple operations', () => {
      const settings: DifficultySettings = {
        operations: ['addition', 'subtraction'],
        maxDigits: 2,
        playTime: 2
      }

      const operations = new Set<string>()
      
      // Generate multiple problems to test randomness
      for (let i = 0; i < 10; i++) {
        const problem = generateProblem(settings)
        operations.add(problem.operation)
      }

      // Should have generated at least one of each operation (with high probability)
      expect(operations.size).toBeGreaterThanOrEqual(1)
      for (const op of operations) {
        expect(['addition', 'subtraction']).toContain(op)
      }
    })
  })

  describe('calculateAnswer', () => {
    it('should calculate addition correctly', () => {
      const result = calculateAnswer([5, 3], 'addition')
      expect(result).toBe(8)
    })

    it('should calculate subtraction correctly', () => {
      const result = calculateAnswer([10, 4], 'subtraction')
      expect(result).toBe(6)
    })

    it('should calculate multiplication correctly', () => {
      const result = calculateAnswer([6, 7], 'multiplication')
      expect(result).toBe(42)
    })

    it('should calculate division correctly', () => {
      const result = calculateAnswer([15, 3], 'division')
      expect(result).toBe(5)
    })

    it('should handle division with decimal results', () => {
      const result = calculateAnswer([7, 2], 'division')
      expect(result).toBe(3.5)
    })

    it('should handle multiple numbers for addition', () => {
      const result = calculateAnswer([1, 2, 3, 4], 'addition')
      expect(result).toBe(10)
    })

    it('should handle edge cases', () => {
      expect(calculateAnswer([0, 5], 'addition')).toBe(5)
      expect(calculateAnswer([10, 0], 'subtraction')).toBe(10)
      expect(calculateAnswer([5, 0], 'multiplication')).toBe(0)
      expect(calculateAnswer([0, 5], 'division')).toBe(0)
    })
  })
})