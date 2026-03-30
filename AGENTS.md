# Agent Workflow & Development Guide

## Local Dev with Emulators
To run the app with Firebase auth + Firestore locally (no production Firebase needed):
```bash
make dev-emu
```
This starts Firebase emulators (auth:9099, firestore:8080, UI:4000) and the Vite dev server together. The app auto-connects to emulators in dev mode.

**Sign in from browser console:**
```js
window.__devSignIn('alonzorz@gmail.com', 'Alon')
```
- App-side email allowlist is skipped when using emulators, but Firestore rules still expect an allowlisted email
- Sample cards auto-seed on first sign-in as partner-a
- Emulator UI available at http://localhost:4000

## Project Agents

### 1. Setup Agent
**Role**: Initial project configuration
**Responsibilities**:
- Vite configuration
- TypeScript setup
- Tailwind CSS configuration
- Dependency management
- Folder structure creation

**Status**: ✅ Completed

---

### 2. Component Development Agent
**Role**: Building React components and UI
**Responsibilities**:
- Card component creation
- Layout components
- Game mechanics UI
- Animation implementation
- Accessibility features

**Status**: 🟡 In Progress

**Key Components to Build**:
- [ ] Card.tsx - Main card component
- [ ] CardStack.tsx - Stacked card view
- [ ] CardEditor.tsx - Card editing interface
- [ ] Navigation.tsx - App navigation
- [ ] GameBoard.tsx - Main game interface
- [ ] PartnerZone.tsx - Partner display area

---

### 3. State Management Agent
**Role**: Zustand stores and data flow
**Responsibilities**:
- Card store (CRUD)
- Game store (state management)
- Settings store (preferences)
- Store persistence
- Middleware setup

**Status**: ⏳ Pending

---

### 4. Database Agent
**Role**: IndexedDB schema and operations
**Responsibilities**:
- Dexie.js schema definition
- Migration strategy
- CRUD operations
- Query optimization
- Backup/restore

**Status**: ⏳ Pending

---

### 5. Internationalization Agent
**Role**: Multi-language support
**Responsibilities**:
- react-i18next setup
- EN locale (en.json)
- HE locale (he.json)
- RTL support
- Dynamic language switching

**Status**: ⏳ Pending

---

### 6. Animation Agent
**Role**: Framer Motion and CSS animations
**Responsibilities**:
- Card flip animations
- Stagger effects
- Page transitions
- Gesture interactions
- Micro-interactions

**Status**: ⏳ Pending

---

### 7. Testing Agent
**Role**: Vitest and test implementation
**Responsibilities**:
- Unit tests
- Integration tests
- Component tests
- Store tests
- Performance tests

**Status**: ⏳ Pending

---

### 8. Performance & Optimization Agent
**Role**: Code splitting and optimization
**Responsibilities**:
- Bundle analysis
- Code splitting strategy
- Image optimization
- Lazy loading
- Performance monitoring

**Status**: ⏳ Pending

---

## Workflow Rules

1. **Commits**: After each completed agent task
2. **PR-ready**: After each phase completion
3. **Testing**: Continuous during development
4. **Documentation**: Update WORKLOG.md after sessions

## Communication Protocol

Each agent should:
- Update relevant markdown files
- Create semantic commits
- Test before marking complete
- Document decisions made
