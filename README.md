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
import { SESClient, SendEmailCommand } from 'workers-ses'
```

**CDN** (Deno, Bun and Browsers)

```js
import { SESClient, SendEmailCommand } from 'https://esm.sh/workers-ses'
```

<!-- /automd -->

## Usage Example

```js
import { SESClient, SendEmailCommand } from 'workers-ses'

// Configure the SES client
const config = {
  region: 'us-east-1', // Your AWS region
  credentials: {
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
  },
}

// Initialize the SES client
const sesClient = new SESClient(config)

// Define email parameters
const emailParams = {
  Source: 'sender@example.com', // Must be a verified email address
  Destination: {
    ToAddresses: ['recipient@example.com'],
    // Optional: CcAddresses and BccAddresses
    // CcAddresses: ["cc@example.com"],
    // BccAddresses: ["bcc@example.com"],
  },
  Message: {
    Subject: {
      Data: 'Hello from Workers SES!',
    },
    Body: {
      Text: {
        Data: 'This is a plain text email sent using workers-ses library.',
      },
      Html: {
        Data: '<h1>Hello!</h1><p>This is an <strong>HTML email</strong> sent using workers-ses library.</p>',
      },
    },
  },
}

// Send the email
try {
  const command = new SendEmailCommand(emailParams)
  const result = await sesClient.send(command)

  console.log('Email sent successfully!')
  console.log('Message ID:', result.MessageId)
} catch (error) {
  console.error('Error sending email:', error)
}
```

### Configuration Options

- **region**: AWS region where your SES service is configured (e.g., `us-east-1`, `eu-west-1`)
- **credentials**: AWS credentials with SES permissions
  - **accessKeyId**: Your AWS access key ID
  - **secretAccessKey**: Your AWS secret access key

### Email Parameters

- **Source**: The sender's email address (must be verified in AWS SES)
- **Destination**: Recipient information
  - **ToAddresses**: Array of recipient email addresses
  - **CcAddresses**: (Optional) Array of CC recipient email addresses
  - **BccAddresses**: (Optional) Array of BCC recipient email addresses
- **Message**: Email content
  - **Subject.Data**: Email subject line
  - **Body.Text.Data**: Plain text version of the email
  - **Body.Html.Data**: HTML version of the email

> **Note**: Before sending emails, make sure your sender email address is verified in AWS SES, and if you're in the SES sandbox, recipient addresses must also be verified.

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
