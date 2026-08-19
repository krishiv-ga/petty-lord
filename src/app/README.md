# Application orchestration

This directory owns browser startup, persistence adapters, routing and the thin Zustand bridge to
the simulation. It must not contain gameplay rules. UI components dispatch typed commands rather
than mutating authoritative state.
