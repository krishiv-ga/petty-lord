# Persistence

The launch persistence adapter uses IndexedDB through `idb-keyval` for current and previous autosave
checkpoints. Tiny preferences and a save pointer may use `localStorage`; authoritative saves may not.

Saves will validate with Zod and carry schema/build versions, seed, PRNG, scheduler, decisions and game
state. Persistence implementation and migrations belong to later application packets.
