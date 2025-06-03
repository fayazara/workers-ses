# workers-ses

<!-- automd:badges color=yellow -->

[![npm version](https://img.shields.io/npm/v/workers-ses?color=yellow)](https://npmjs.com/package/workers-ses)
[![npm downloads](https://img.shields.io/npm/dm/workers-ses?color=yellow)](https://npm.chart.dev/workers-ses)

<!-- /automd -->

AWS SES client for Cloudflare Workers. 1:1 mapping of AWS SES API based on [aws4fetch](https://github.com/mhart/aws4fetch).

## Usage

Install the package:

```sh
# ✨ Auto-detect (supports npm, yarn, pnpm, deno and bun)
npx nypm install workers-ses

# or

npm install workers-ses

# or

yarn add workers-ses

# or

pnpm add workers-ses

# or

bun add workers-ses
```

Import:

<!-- automd:jsimport cdn name="pkg" -->

**ESM** (Node.js, Bun, Deno)

```js
import { SESClient, SendEmailCommand } from "workers-ses";
```

**CDN** (Deno, Bun and Browsers)

```js
import { SESClient, SendEmailCommand } from "https://esm.sh/workers-ses";
```

<!-- /automd -->

## Development

<details>

<summary>local development</summary>

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

</details>

## License

<!-- automd:contributors license=MIT -->

Published under the [MIT](https://github.com/fayazara/workers-ses/blob/main/LICENSE) license.
Made by [community](https://github.com/fayazara/workers-ses/graphs/contributors) 💛
<br><br>
<a href="https://github.com/fayazara/workers-ses/graphs/contributors">
<img src="https://contrib.rocks/image?repo=unjs/packageName" />
</a>

<!-- /automd -->

<!-- automd:with-automd -->

---

_🤖 auto updated with [automd](https://automd.unjs.io)_

<!-- /automd -->
