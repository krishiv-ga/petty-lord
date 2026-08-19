# Foundation font provenance

WP-012 freezes a reproducible local pairing sourced from Fontsource variable packages 5.3.0:

- **Cormorant Garamond Variable** — display and phase headings;
- **Source Serif 4 Variable** — body, inspector, ledger and numeric text.

Both packages report `OFL-1.1` and originate from the maintained
[`fontsource/font-files`](https://github.com/fontsource/font-files) repository. The included
`OFL-1.1.txt` is the unmodified package license. Only Latin variable WOFF2 assets required by the
foundation are vendored; package and lock files remain untouched.

`font-display: swap` and the Georgia/Palatino system stacks in `tokens.css` keep the interface
usable immediately if a font asset fails. Do not replace these files without updating provenance,
license and the screenshot baselines.
