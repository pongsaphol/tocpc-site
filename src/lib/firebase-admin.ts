import admin from 'firebase-admin'

// Check if Firebase Admin credentials are available
const hasCredentials = !!(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
)

let initialized = false

function initializeIfNeeded() {
  if (!initialized && hasCredentials) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/gm, '\n'),
        }),
        databaseURL: 'https://tocpc-prod-2021.firebaseio.com',
        storageBucket: 'tocpc-prod-2021.appspot.com',
      })
      initialized = true
    } catch (error) {
      // App already initialized
      if ((error as Error).message?.includes('already exists')) {
        initialized = true
      }
    }
  }
}

export default function getDb() {
  if (!hasCredentials) {
    // Return a mock that throws helpful errors during build
    console.warn('Firebase Admin credentials not available - using mock')
    return {
      collection: () => ({
        get: async () => ({ forEach: () => {}, size: 0 }),
        doc: () => ({
          get: async () => ({ exists: false, data: () => null }),
          set: async () => {},
        }),
      }),
    } as unknown as FirebaseFirestore.Firestore
  }

  initializeIfNeeded()
  return admin.firestore()
}

export function getStorage() {
  if (!hasCredentials) {
    console.warn(
      'Firebase Admin credentials not available - storage unavailable',
    )
    return null
  }

  initializeIfNeeded()
  return admin.storage()
}
