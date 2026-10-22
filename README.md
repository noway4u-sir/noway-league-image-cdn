# noway-cdn-cloudflare

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/index.ts
```

The entrypoint downloads the latest patch's assets, then uploads `images/` to
the configured S3-compatible bucket. Set `S3_ENDPOINT`, `S3_BUCKET`,
`AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY` before running it.

## Champion artwork

Every champion's versioned detail metadata supplies the skin numbers. Both
splash and portrait loading artwork are mirrored for the default champion and
every skin. Chroma-only entries (`parentSkin`) share their parent's artwork and
are not separate downloads.

JPEG object keys:

```text
images/champions/splash/{full,384x,768x,1280x}/{championId}_{skinNum}.jpg
images/champions/loading/{full,384x,768x,1280x}/{championId}_{skinNum}.jpg
```

For example: `https://cdn.nowaycdn.com/images/champions/splash/768x/Syndra_0.jpg`.
`full` preserves the source bytes. Smaller variants preserve aspect ratio,
limit width to the named pixel size, and never upscale narrow source images.
Artwork downloads are sequential; uploads run in batches of eight to bound
memory usage. Failed HTTP downloads abort before upload rather than publishing
error responses as images.

The existing manual/weekly GitHub Actions workflow runs this same entrypoint.
Run it successfully **before deploying the website CDN cutover**; merging the
code alone does not populate the new artwork paths.

Run the regression suite with `bun test`.
