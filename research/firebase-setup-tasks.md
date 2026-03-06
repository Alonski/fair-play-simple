# Firebase Setup Tasks

## 1. Create Firebase project
- ✅ Go to https://console.firebase.google.com
- ✅ Create new project
- ✅ Enable Firestore (production mode, europe-west1)
- ✅ Enable Authentication > Google provider
- ✅ Add authorized domains (localhost)
- ✅ Get project config (API key, project ID, etc.)

## 2. Update .env.example
- ✅ Replace Supabase vars with Firebase vars

## 3. Create .env.local with Firebase credentials
- ✅ Add all VITE_FIREBASE_* vars from project config

## 4. Update .firebaserc with actual project ID
- ✅ Replace "your-firebase-project-id" with "fair-play-simple"

## 5. Verify email allowlist in authStore.ts
- ✅ alonzorz@gmail.com + swaddlesnaps@gmail.com confirmed correct

## 6. Install Firebase CLI and login
- ✅ firebase-tools installed
- ✅ firebase login

## 7. Deploy Firestore rules
- ✅ firebase deploy --only firestore:rules
- ✅ Fixed rules bug: household read was gated on isMember() which failed on first sign-in (chicken-and-egg); changed to isAllowedUser()

## 8. Test locally
- ✅ bun run dev
- ✅ Google sign-in works
- ✅ Household creation works (households/shared created in Firestore)
- ✅ users/{uid} doc created
- [ ] Verify partner slot selection (SetupScreen)
- [ ] Verify card sync between two browsers

## 9. Add GitHub secrets for CI/CD
- [ ] VITE_FIREBASE_API_KEY
- [ ] VITE_FIREBASE_AUTH_DOMAIN
- [ ] VITE_FIREBASE_PROJECT_ID
- [ ] VITE_FIREBASE_STORAGE_BUCKET
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
- [ ] VITE_FIREBASE_APP_ID
- [ ] FIREBASE_SERVICE_ACCOUNT (generate from Firebase console > Service Accounts)

## 10. First deploy
- [ ] firebase deploy (hosting + rules)
- [ ] Push to main → verify GitHub Actions deploys
