"use client"

import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  HelpCircle,
  FileText,
  GitBranch,
  CheckSquare,
  Sparkles,
  Upload,
  Search,
  Bell
} from "lucide-react"

const features = [
  {
    icon: Upload,
    title: "Contract Upload",
    description: "Upload your construction contracts in PDF format. Our AI will automatically extract and categorize key terms.",
    steps: [
      "Click 'Upload Contract' from the dashboard or contracts page",
      "Drag and drop your PDF or click to browse",
      "Add a name and optional project details",
      "Click 'Analyze Contract' to start AI extraction"
    ]
  },
  {
    icon: Sparkles,
    title: "AI Extraction",
    description: "Our AI analyzes your contract to extract deadlines, payment terms, scope, responsibilities, and more.",
    steps: [
      "Processing typically takes 1-3 minutes depending on document size",
      "AI extracts terms across 9 categories",
      "Each term includes source reference and confidence score",
      "Review and verify extracted terms on the contract detail page"
    ]
  },
  {
    icon: GitBranch,
    title: "Change Orders",
    description: "Submit and track changes to your contracts with full impact analysis.",
    steps: [
      "Navigate to Change Orders and click 'New Change Order'",
      "Select the contract and provide change details",
      "Optionally upload a supporting document for AI analysis",
      "Submit for approval review"
    ]
  },
  {
    icon: CheckSquare,
    title: "Approvals",
    description: "Review and approve change orders with a clear audit trail.",
    steps: [
      "View pending approvals on the Approvals page",
      "Review the affected terms and impact",
      "Approve or reject with comments",
      "Approved changes are automatically applied to contract terms"
    ]
  },
  {
    icon: Search,
    title: "Search & Filter",
    description: "Quickly find specific terms across all your contracts.",
    steps: [
      "Use the search bar on contract detail pages",
      "Filter terms by category using the category buttons",
      "Click on any term to expand and see full details",
      "View original contract text for each term"
    ]
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Stay informed about important updates and deadlines.",
    steps: [
      "View all notifications on the Notifications page",
      "Click the bell icon in the header for quick access",
      "Notifications include contract uploads, extractions, and approvals",
      "Configure notification preferences in Settings"
    ]
  }
]

const faqs = [
  {
    question: "What file formats are supported?",
    answer: "Currently, we support PDF files up to 50MB in size. Support for DOCX and other formats is planned for future releases."
  },
  {
    question: "How accurate is the AI extraction?",
    answer: "Our AI achieves 85-95% accuracy on standard construction contracts (AIA, ConsensusDocs, etc.). Each extracted term includes a confidence score, and we recommend reviewing terms with lower confidence."
  },
  {
    question: "Can I manually add or edit terms?",
    answer: "Yes, you can add manual terms to supplement AI extraction. Edit functionality for existing terms is coming in a future update."
  },
  {
    question: "How are change orders analyzed?",
    answer: "When you upload a change order document, our AI compares it against existing contract terms to identify what's affected. It analyzes cost impact, schedule impact, and provides recommendations."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, all data is stored securely in your PostgreSQL database. Contract files are stored locally on your server. We use Anthropic's Claude API for AI processing, which has enterprise-grade security."
  }
]

export default function HelpPage() {
  return (
    <div className="min-h-screen">
      <Header 
        title="Help & Documentation" 
        description="Learn how to use ContractIQ effectively"
      />

      <div className="p-6 max-w-4xl space-y-8">
        {/* Features Guide */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Feature Guide
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <Card key={i} className="glass-panel">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <feature.icon className="h-5 w-5 text-primary" />
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    {feature.steps.map((step, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="text-primary font-medium">{j + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Term Categories */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Term Categories</h2>
          
          <Card className="glass-panel">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { emoji: "📅", name: "Deadlines", description: "Project milestones, completion dates, submission deadlines" },
                  { emoji: "💰", name: "Payments", description: "Contract value, payment schedule, retainage terms" },
                  { emoji: "📋", name: "Scope", description: "Work included/excluded, deliverables, project boundaries" },
                  { emoji: "👤", name: "Responsibilities", description: "Owner, contractor, and subcontractor duties" },
                  { emoji: "📐", name: "Specifications", description: "Quality standards, material requirements, tolerances" },
                  { emoji: "🛡️", name: "Warranties", description: "Warranty periods, coverage, and conditions" },
                  { emoji: "📄", name: "Insurance", description: "Required coverage, limits, and certificates" },
                  { emoji: "⚠️", name: "Penalties", description: "Liquidated damages, late fees, breach conditions" },
                  { emoji: "📎", name: "Other", description: "Force majeure, dispute resolution, termination" },
                ].map((cat, i) => (
                  <div key={i} className="p-4 rounded-lg bg-secondary/50">
                    <div className="text-2xl mb-2">{cat.emoji}</div>
                    <h4 className="font-medium">{cat.name}</h4>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Card key={i} className="term-card">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{faq.question}</h4>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Support */}
        <Card className="glass-panel border-primary/30">
          <CardContent className="p-6 text-center">
            <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Need More Help?</h3>
            <p className="text-muted-foreground mb-4">
              Contact our support team for assistance with your specific use case.
            </p>
            <p className="text-sm text-muted-foreground">
              support@contractiq.example.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

