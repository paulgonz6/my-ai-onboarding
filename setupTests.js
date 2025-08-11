// Global test setup
import '@testing-library/jest-dom'

// Mock window.requestAnimationFrame for tests
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0)
  return 0
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return []
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Add TextEncoder/TextDecoder for Next.js
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock fetch for tests
global.fetch = jest.fn()

// Mock Request and Response for Next.js
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      this.url = input
      this.method = init?.method || 'GET'
      this.headers = new Headers(init?.headers)
      this.body = init?.body
    }
    
    async json() {
      return JSON.parse(this.body)
    }
    
    async text() {
      return this.body
    }
  }
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body
      this.status = init?.status || 200
      this.statusText = init?.statusText || 'OK'
      this.headers = new Headers(init?.headers)
    }
    
    async json() {
      return JSON.parse(this.body)
    }
    
    async text() {
      return this.body
    }
  }
}

if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init) {
      this._headers = {}
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this._headers[key.toLowerCase()] = value
        })
      }
    }
    
    get(key) {
      return this._headers[key.toLowerCase()]
    }
    
    set(key, value) {
      this._headers[key.toLowerCase()] = value
    }
    
    has(key) {
      return key.toLowerCase() in this._headers
    }
    
    delete(key) {
      delete this._headers[key.toLowerCase()]
    }
  }
}