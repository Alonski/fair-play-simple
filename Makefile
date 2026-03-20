.PHONY: lighthouse emulators dev test lint build

lighthouse:
	bun run scripts/lighthouse-audit.js

emulators:
	firebase emulators:start --only auth,firestore

dev:
	bun run dev

test:
	bun run test --run

lint:
	bun run lint

build:
	bun run build
