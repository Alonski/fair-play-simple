.PHONY: lighthouse emulators dev dev-emu test lint build fn-install fn-build fn-dev dev-emu-full

.DEFAULT_GOAL := dev-emu

lighthouse:
	bun run scripts/lighthouse-audit.js

emulators:
	firebase emulators:start --only auth,firestore

dev:
	bun run dev

dev-emu:
	@echo "Starting Firebase emulators + dev server..."
	@echo "After startup, sign in from browser console:"
	@echo "  window.__devSignIn('alonzorz@gmail.com', 'Alon')"
	firebase emulators:exec --only auth,firestore "bun run dev"

dev-emu-full:
	@echo "Starting Firebase emulators (auth+firestore+functions) + dev server..."
	@echo "After startup, sign in from browser console:"
	@echo "  window.__devSignIn('alonzorz@gmail.com', 'Alon')"
	firebase emulators:exec --only auth,firestore,functions "bun run dev"

test:
	bun run test --run

lint:
	bun run lint

build:
	bun run build

# --- Cloud Functions ---

fn-install:
	cd functions && npm install

fn-build:
	cd functions && npm run build

fn-dev:
	cd functions && npm run dev
