import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Debugging: Check if environment variables are loaded
console.log('Firebase Config Check:')
console.log('API Key exists:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
console.log('Auth Domain exists:', !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
console.log('Project ID exists:', !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    'Firebase configuration is missing. Please check your .env.local file.\n' +
    `API Key: ${firebaseConfig.apiKey ? '✓' : '✗'}\n` +
    `Project ID: ${firebaseConfig.projectId ? '✓' : '✗'}\n` +
    `Auth Domain: ${firebaseConfig.authDomain ? '✓' : '✗'}`
  )
}

// Initialize Firebase
let app
try {
  app = initializeApp(firebaseConfig)
  console.log('✅ Firebase initialized successfully')
} catch (error) {
  console.error('❌ Firebase initialization error:', error)
  throw error
}

// Initialize Firebase Authentication
export const auth = getAuth(app)
export default app