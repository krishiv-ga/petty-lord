# Deployment

The game and wiki are static artifacts. CI builds `dist/`, `storybook-static/` and the VitePress output
independently so deployment can target GitHub Pages or another static host without changing game code.
The first live deployment is owned by an integration packet.
