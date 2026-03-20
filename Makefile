.PHONY: lighthouse emulators dev dev-emu test lint build

lighthouse:
	bun run scripts/lighthouse-audit.js

emulators:
	firebase emulators:start --only auth,firestore

dev:
	bun run dev

dev-emu:
	@echo "Starting Firebase emulators + dev server..."
	@echo "After startup, sign in from browser console:"
	@echo "  window.__devSignIn('alon@test.com', 'Alon')"
	firebase emulators:exec --only auth,firestore "bun run dev"

test:
	bun run test --run

lint:
	bun run lint

build:
	bun run build
