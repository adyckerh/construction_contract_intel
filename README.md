# ContractIQ - Construction Contract Intelligence Platform

An AI-powered platform that automatically reads construction contracts and tracks changes throughout the project lifecycle. Turn complex construction contracts into clear, living documents with smart notifications and approval workflows.

## Features

### Contract Analysis
- **AI-Powered Extraction**: Upload PDF contracts and let Claude AI extract key terms automatically
- **9 Term Categories**: Deadlines, Payments, Scope, Responsibilities, Specifications, Warranties, Insurance, Penalties, and more
- **Confidence Scoring**: Each extracted term includes an accuracy confidence score
- **Source References**: Track exactly where each term appears in the original document

### Change Order Management
- **Submit Changes**: Any party can submit change orders
- **Impact Analysis**: AI analyzes how changes affect existing contract terms
- **Side-by-Side Comparison**: See original vs. proposed values clearly

### Approval Workflows
- **Pending Queue**: Review all pending approvals in one place
- **One-Click Actions**: Approve or reject with comments
- **Automatic Updates**: Approved changes update contract terms in real-time
- **Audit Trail**: Complete history of all approval decisions

### Dashboard & Notifications
- **Real-Time Metrics**: Total contracts, active terms, pending approvals
- **Upcoming Deadlines**: Never miss important dates
- **Activity Feed**: Track all changes across your projects
- **In-App Notifications**: Stay informed about important updates

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Anthropic Claude (claude-sonnet-4-20250514)
- **PDF Processing**: pdf-parse
- **UI**: Tailwind CSS 4 + Custom Components
- **Language**: TypeScript

## Prerequisites

- Node.js 20.9.0 or higher (recommended: 20.10.0+)
- PostgreSQL database (local or hosted)
- Anthropic API key ([Get one here](https://console.anthropic.com/))

## Installation

1. **Clone the repository**
   ```bash
   cd contract-intel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/contract_intel?schema=public"

   # Anthropic API Key
   ANTHROPIC_API_KEY="your-anthropic-api-key-here"

   # File upload settings
   UPLOAD_DIR="./uploads"
   MAX_FILE_SIZE=52428800
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations (creates tables)
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
contract-intel/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   │   ├── contracts/     # Contract CRUD operations
│   │   │   ├── change-orders/ # Change order management
│   │   │   ├── approvals/     # Approval workflow
│   │   │   ├── notifications/ # Notification handling
│   │   │   └── stats/         # Dashboard statistics
│   │   ├── contracts/         # Contract pages
│   │   ├── change-orders/     # Change order pages
│   │   ├── approvals/         # Approval page
│   │   ├── notifications/     # Notifications page
│   │   ├── settings/          # Settings page
│   │   └── help/              # Help documentation
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   └── layout/            # Layout components
│   └── lib/
│       ├── ai/                # AI extraction logic
│       │   ├── extractor.ts   # Claude integration
│       │   ├── prompts.ts     # Extraction prompts
│       │   └── parser.ts      # PDF parsing
│       ├── db.ts              # Prisma client
│       └── utils.ts           # Utility functions
├── prisma/
│   └── schema.prisma          # Database schema
├── uploads/                   # Uploaded contract files
└── public/                    # Static assets
```

## Usage

### Uploading a Contract

1. Click "Upload Contract" from the dashboard
2. Drag and drop your PDF file or click to browse
3. Enter a name for the contract and optionally the project name
4. Click "Analyze Contract" to start AI extraction
5. Wait for processing (typically 1-3 minutes for large documents)
6. Review extracted terms on the contract detail page

### Submitting a Change Order

1. Navigate to Change Orders → New Change Order
2. Select the contract you want to modify
3. Enter a title and description for the change
4. Optionally upload a supporting PDF document
5. Enter your name/role and submit
6. The change order will be analyzed and sent for approval

### Approving Changes

1. Navigate to the Approvals page
2. Review pending change orders and their impact
3. Click "Approve" or "Reject" with optional comments
4. Approved changes are automatically applied to contract terms

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/contracts` | GET | List all contracts |
| `/api/contracts` | POST | Upload new contract |
| `/api/contracts/[id]` | GET | Get contract details |
| `/api/contracts/[id]` | PATCH | Update contract |
| `/api/contracts/[id]` | DELETE | Delete contract |
| `/api/change-orders` | GET | List change orders |
| `/api/change-orders` | POST | Submit new change order |
| `/api/change-orders/[id]` | GET | Get change order details |
| `/api/approvals` | GET | List approvals |
| `/api/approvals/[id]` | PATCH | Approve/reject |
| `/api/notifications` | GET | List notifications |
| `/api/stats` | GET | Dashboard statistics |

## Database Schema

The database includes the following main tables:

- **Contract**: Base contract metadata and file references
- **ExtractedTerm**: Individual extracted terms with categories
- **ChangeOrder**: Change order submissions
- **TermChange**: Proposed changes to specific terms
- **Approval**: Approval workflow records
- **Notification**: In-app notifications

## AI Extraction Categories

| Category | Description |
|----------|-------------|
| DEADLINE | Completion dates, milestones, submission deadlines |
| PAYMENT | Contract value, payment schedule, retainage |
| SCOPE | Work included/excluded, deliverables |
| RESPONSIBILITY | Owner, contractor, and sub duties |
| SPECIFICATION | Quality standards, material requirements |
| WARRANTY | Warranty periods and coverage |
| INSURANCE | Required coverage and limits |
| PENALTY | Liquidated damages, late fees |
| OTHER | Force majeure, dispute resolution, etc. |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | Yes |
| `UPLOAD_DIR` | Directory for uploaded files | No (default: ./uploads) |
| `MAX_FILE_SIZE` | Max upload size in bytes | No (default: 50MB) |

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio
```

## License

MIT

## Support

For support, please contact support@contractiq.example.com
