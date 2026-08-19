# Scheduler and RNG

The canonical scheduler resolves due items by explicit priority and `sequenceId`, pausing for mandatory
decisions. Random draws use the approved `pure-rand` adapter and serialize whenever an outcome must
survive save/load or rescheduling.

WP-010 defines the scheduler and PRNG adapter. The authoritative details remain in the
[canonical interface contract](https://github.com/krishiv-ga/petty-lord/blob/main/designer/interface-content-and-production.md).
