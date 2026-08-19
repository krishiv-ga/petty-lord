# Agent and Integration Logs

Logs are mandatory evidence for every implementation, review, integration, tuning, audit, and release task.

They are intentionally file-per-agent so parallel work does not collide.

## Directory model

```text
logs/
├── README.md
├── AGENT_LOG_TEMPLATE.md
├── COMPACT_LOG_TEMPLATE.md
├── STATUS.md
├── agents/
│   └── <packet-id>/
│       ├── implementer-<name>.md
│       ├── critic-<name>.md
│       └── integrator-<name>.md   # only when packet-local integration occurs
└── compacted/
    ├── WAVE-00.md
    ├── WAVE-01.md
    └── ...
```

An agent creates its own path. Parallel agents must never edit another agent's log or a shared compacted log.

## What an agent log is

An agent log is a compact, factual audit record containing:

- assigned packet and role;
- exact starting revision;
- scope and owned paths;
- decisions and assumptions that affect later work;
- files changed;
- tests/checks and outcomes;
- screenshots, traces, CI artifacts, or simulation outputs where relevant;
- critic findings and disposition;
- known risks and explicit deferrals;
- commit and PR references.

It is not a transcript or stream-of-consciousness diary.

## Mandatory behavior

- Create the log early and update it before completion.
- Never claim a test passed without recording the command or CI evidence.
- Record failed attempts only when they explain a decision, risk, or remaining issue.
- Summarize long output; do not commit megabytes of terminal text.
- Link artifacts rather than pasting binary data.
- A packet without a complete log is not complete.
- A significant packet without an independent critic log is not integration-ready.

## Compacted ChatGPT-facing logs

At each wave boundary, the wave integrator creates one compact log from all packet and critic logs.

The compact log is optimized for a new ChatGPT/Codex context. It must say:

- what the repository can now do;
- what changed by packet;
- important architectural or design decisions;
- checks and evidence;
- unresolved risks;
- exact next fan-out set;
- which shared contracts are now frozen;
- release/tag status.

Keep it below roughly 1,000 words unless a severe issue requires more detail. Do not repeat the canonical design.

Only the integrator updates [`STATUS.md`](./STATUS.md). `STATUS.md` points to the latest compacted log and states whether the next fan-out gate is open.

## Retention

Do not delete old logs. They are useful for tracing why a design, dependency, value, or architecture changed.

When a log contains obsolete instructions, mark them superseded and link the replacing packet or compacted log. Do not rewrite history.

## Privacy and secrets

Never log credentials, tokens, private keys, cookies, local absolute paths containing personal information, or full environment dumps. Redact sensitive values and describe the dependency instead.
