import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// Configure testing-library to use act automatically
configure({ 
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
  computedStyleSupportsPseudoElements: true
})

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

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
})