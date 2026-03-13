# n8n Integration for MarketIt

This guide explains how to set up n8n to automatically send emails when influencers are added and update the dashboard when they reply.

## Architecture

```
MarketIt App                    n8n                           Email
     |                            |                              |
     |  POST (influencer created)  |                              |
     |--------------------------->|  Send outreach email         |
     |                            |----------------------------->|
     |                            |                              |
     |                            |  IMAP poll / Inbound webhook |
     |                            |<-----------------------------| (reply)
     |                            |                              |
     |  POST (reply received)      |                              |
     |<---------------------------|                              |
     |  Update influencer status  |                              |
```

## Prerequisites

- n8n installed and running (Docker, npm, or cloud)

## Docker Compose (Recommended)

From the project root:

```bash
docker compose up -d
```

This starts **n8n** on `http://localhost:5678`.

Set in `server/.env` (use your existing `DATABASE_URL` for local Postgres):

```env
N8N_WEBHOOK_URL="http://localhost:5678/webhook/influencer-created"
N8N_WEBHOOK_SECRET="your-secure-random-string"
```

**Note:** When n8n calls back to MarketIt (e.g. on reply), it runs inside Docker. Use `http://host.docker.internal:3001` as the MarketIt base URL in your n8n HTTP Request nodes so the container can reach your local server.
- Email account (Gmail, SMTP, etc.) for sending
- IMAP access to the same inbox for receiving replies (or use an email service with inbound webhooks)

## Environment Variables (MarketIt Server)

Add to `server/.env`:

```env
# n8n - Trigger when influencer is created (optional; if not set, no email is sent)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/influencer-created

# n8n - Secret for webhook callbacks (n8n uses this when notifying us of replies)
N8N_WEBHOOK_SECRET=your-secure-random-string
```

## Workflow 1: Send Outreach Email

When an influencer with an email is added, MarketIt calls your n8n webhook with:

```json
{
  "event": "influencer.created",
  "influencerId": "clx...",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "instagramHandle": "@janedoe",
  "notes": "Fashion niche"
}
```

### Setup in n8n

1. **Webhook node** (Trigger)
   - Path: `influencer-created`
   - Method: POST
   - Copy the Production URL and set it as `N8N_WEBHOOK_URL` in MarketIt

2. **Gmail / SMTP node** (Send Email)
   - To: `{{ $json.body.email }}`
   - Subject: `Partnership opportunity - {{ $json.body.name }}`
   - Body: Your outreach template. Example:
     ```
     Hi {{ $json.body.name }},

     We'd love to collaborate with you on a campaign. Please reply to this email to let us know if you're interested.

     Best regards,
     MarketIt Team
     ```
   - **Important**: Use "Reply-To" as your inbox address so replies come back to you

3. **Optional**: Add a Set node to transform the webhook body if needed (n8n may nest it under `body`)

## Workflow 2: Listen for Replies & Update Dashboard

When someone replies to the outreach email, n8n detects it and calls MarketIt to update the influencer status to "active".

### Option A: IMAP (Gmail, etc.) – Step-by-step

Create a **new workflow** in n8n and add these nodes in order:

---

#### Step 1: Schedule Trigger

- Add **Schedule Trigger** node
- **Rule**: `Every 5 minutes` (or `Every 15 minutes` if you prefer less frequent checks)
- This runs the workflow on a timer to poll your inbox

---

#### Step 2: IMAP Email

- Add **IMAP Email** node (search for "IMAP" or "Read Email")
- **Credential**: Create IMAP credentials for your inbox

  **Gmail:**
  1. Enable IMAP: Gmail → Settings → See all settings → Forwarding and POP/IMAP → Enable IMAP
  2. Create an [App Password](https://myaccount.google.com/apppasswords): Google Account → Security → 2-Step Verification → App passwords
  3. In n8n IMAP credentials: Host `imap.gmail.com`, Port `993`, User = your Gmail, Password = App Password

  **Outlook/Office 365:**
  - Host: `outlook.office365.com`, Port: `993`, SSL: on

- **Mailbox**: `INBOX` (default)
- **Options** → **Mark as read**: Enable if you want processed emails marked read (recommended to avoid reprocessing)

---

#### Step 3: Filter (only replies)

- Add **Filter** node
- **Condition**: `{{ $json["message-id"] }}` exists (replies have this)  
  OR use: **Conditions** → Add condition → `In-Reply-To` exists (many clients set this on replies)

  Simpler alternative: skip the filter and process all new emails — MarketIt will only update if the sender matches a waiting influencer.

---

#### Step 4: Code (extract sender + body)

- Add **Code** node
- **Mode**: Run Once for All Items
- **JavaScript**:

```javascript
const items = $input.all();
const results = [];

for (const item of items) {
  const json = item.json;
  let email = '';
  let replyContent = '';

  // Extract sender email (handles "Name <email@x.com>" format)
  const from = json.from?.value?.[0]?.address || json.from?.text || json.from;
  if (typeof from === 'string') {
    const match = from.match(/<([^>]+)>/);
    email = match ? match[1].trim() : from.trim();
  }

  // Extract email body (plain text)
  if (json.text) {
    replyContent = json.text;
  } else if (json.textPlain) {
    replyContent = json.textPlain;
  } else if (json.body?.text) {
    replyContent = json.body.text;
  }

  if (email) {
    results.push({ json: { email, replyContent: replyContent || undefined } });
  }
}

return results;
```

---

#### Step 5: HTTP Request (call MarketIt)

- Add **HTTP Request** node
- **Method**: POST
- **URL**: 
  - n8n in Docker: `http://host.docker.internal:3001/api/webhooks/n8n-influencer-reply`
  - n8n on same machine: `http://localhost:3001/api/webhooks/n8n-influencer-reply`
  - Production: `https://your-marketit-domain.com/api/webhooks/n8n-influencer-reply`
- **Authentication**: Header Auth
  - **Name**: `Authorization`
  - **Value**: `Bearer YOUR_N8N_WEBHOOK_SECRET` (use the same value as in `server/.env`)
- **Body Content Type**: JSON
- **Specify Body**: Using JSON
- **JSON Body**:
```json
{
  "email": "={{ $json.email }}",
  "status": "active",
  "replyContent": "={{ $json.replyContent }}"
}
```

---

#### Step 6: Connect and activate

- Connect: Schedule → IMAP Email → Filter (optional) → Code → HTTP Request
- **Save** the workflow
- **Activate** it (toggle in top right)

---

### Option B: Gmail with Inbound Parse (SendGrid, Mailgun, etc.)

If you use an email service with inbound webhooks:

1. **Webhook node** (Trigger) – Receives inbound email from your provider
2. **Code node** – Parse the webhook payload and extract sender email
3. **HTTP Request node** – Same as above, POST to MarketIt

## MarketIt Webhook API

**Endpoint:** `POST /api/webhooks/n8n-influencer-reply`

**Headers:**
```
Authorization: Bearer <N8N_WEBHOOK_SECRET>
Content-Type: application/json
```

**Body:**
```json
{
  "email": "influencer@example.com",
  "status": "active",
  "replyContent": "Hi, I'm interested! Let's discuss..."
}
```

- `email` (required): Sender email address
- `status` (optional): `active`, `waiting`, `success`, `failure` (default: `active`)
- `replyContent` (optional): The reply email body — stored and shown in the dashboard

### Store sent email content

**Endpoint:** `POST /api/webhooks/n8n-email-sent`

**Body:**
```json
{
  "influencerId": "clx...",
  "emailContent": "Hi Jane,\n\nWe'd love to collaborate..."
}
```

Call this after sending the outreach email so it appears in the dashboard.

MarketIt finds the most recent influencer with that email in "waiting" status and updates it.

## Pre-built Workflows

### Workflow 1: Influencer Outreach

Import from `n8n-workflows/influencer-outreach.json`:

1. In n8n: Workflows → Import from File → select `influencer-outreach.json`
2. Configure the **Send Email** node with your SMTP or Gmail credentials
3. Set the webhook path to `influencer-created` (or update `N8N_WEBHOOK_URL` to match)
4. Activate the workflow and copy the Production webhook URL to `N8N_WEBHOOK_URL`

**Note:** The Send Email node requires SMTP credentials. For Gmail, use the Gmail node instead and replace the Send Email node.

### Workflow 2: Influencer Reply Listener

Import from `n8n-workflows/influencer-reply-listener.json`:

1. In n8n: Workflows → Import from File → select `influencer-reply-listener.json`
2. **Email Trigger (IMAP)** – Create IMAP credentials (Gmail: enable IMAP, use App Password)
3. **Update MarketIt** – Edit the HTTP Request node:
   - **URL**: Use `http://host.docker.internal:3001` if n8n runs in Docker; use `http://localhost:3001` if on the same machine
   - **Headers** → **Authorization**: Replace `REPLACE_WITH_N8N_WEBHOOK_SECRET` with your actual `N8N_WEBHOOK_SECRET` from `server/.env`
4. **Save** and **Activate** the workflow

## Quick Start (n8n Cloud / Self-hosted)

1. Create Workflow 1 (Webhook → Send Email)
2. Copy the webhook URL
3. Add `N8N_WEBHOOK_URL` and `N8N_WEBHOOK_SECRET` to `server/.env`
4. Restart MarketIt server
5. Create Workflow 2 (IMAP / Inbound → HTTP Request to MarketIt)
6. Activate both workflows

## Testing

1. Add an influencer in MarketIt with email `test@example.com`
2. Check n8n Executions – Workflow 1 should run and send the email
3. Reply to that email from `test@example.com`
4. Wait for the next Schedule run (or trigger Workflow 2 manually)
5. Workflow 2 should run, call MarketIt, and the influencer status should change to "active"

## Troubleshooting

**IMAP: "Connection refused" or "Invalid credentials"**
- Gmail: Use an App Password, not your normal password. Ensure 2-Step Verification is on.
- Check that IMAP is enabled in your email provider.

**n8n HTTP Request fails when calling MarketIt**
- Docker: Use `http://host.docker.internal:3001` as the URL, not `localhost`.
- Ensure `N8N_WEBHOOK_SECRET` in `server/.env` matches the `Authorization: Bearer ...` header in n8n.

**Replies not detected**
- The IMAP node fetches recent/unread emails. Ensure replies land in the inbox you're polling.
- If you skip the Filter node, all new emails are processed; MarketIt ignores senders that don't match a waiting influencer.
