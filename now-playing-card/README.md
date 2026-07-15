# Now Playing Card

Serverless SVG player for Jaylen's GitHub profile. It reads the public Last.fm feed for `jxylxn`, embeds the latest album artwork, and returns a GitHub-safe player card.

Endpoints after deployment:

- `/api/now-playing` — live SVG card
- `/api/open-track` — redirects to the current or most recent track

The controls are visual because GitHub README images cannot execute playback commands.
