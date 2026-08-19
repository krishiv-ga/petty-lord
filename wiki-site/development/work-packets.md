# Work packets

Implementation begins from the
[packet index](https://github.com/krishiv-ga/petty-lord/blob/main/work-packets/INDEX.md). Each packet owns
specific paths, dependencies, acceptance checks and logs. Use a `wp/WP-###-short-slug` branch from the
current integrated base and do not implement later packets opportunistically.

Significant work requires an independent critic. Only integration packets update shared status,
compacted logs and fan-out gates.
