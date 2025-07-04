import '@testing-library/jest-dom'

// Create a store for each test
let store = new Map()

// Mock idb-keyval for testing
vi.mock('idb-keyval', () => {
  return {
    get: vi.fn((key: string) => Promise.resolve(store.get(key))),
    set: vi.fn((key: string, value: any) => {
      store.set(key, value)
      return Promise.resolve()
    }),
    del: vi.fn((key: string) => {
      store.delete(key)
      return Promise.resolve()
    }),
    keys: vi.fn(() => Promise.resolve(Array.from(store.keys()))),
    clear: vi.fn(() => {
      store.clear()
      return Promise.resolve()
    })
  }
})

// Reset store before each test
beforeEach(() => {
  store = new Map()
})

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9))
  }
})

// Mock URLSearchParams
Object.defineProperty(globalThis, 'URLSearchParams', {
  value: vi.fn(() => ({
    get: vi.fn(() => null)
  })),
  writable: true,
  configurable: true
})