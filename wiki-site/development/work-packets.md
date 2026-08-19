# Work packets

Implementation begins from the
[packet index](https://github.com/krishiv-ga/petty-lord/blob/main/work-packets/INDEX.md). Each packet owns
specific paths, dependencies, acceptance checks and logs. Use a `wp/WP-###-short-slug` branch from the
current integrated base and do not implement later packets opportunistically.

Significant work requires an independent critic. Only integration packets update shared status,
compacted logs and fan-out gates.

WP-019 integrates Wave 1 and opens the second fan-out gate for WP-020 (time/economy/orders), WP-021
(politics/Church/succession), WP-022 (war/occupation/Capital) and WP-023
(AI/knowledge/events). WP-029 is the next legal serialized integrator after all four are
critic-cleared; Wave 3 remains blocked until then.
