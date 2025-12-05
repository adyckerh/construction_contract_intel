export const SYSTEM_PROMPT = `You are an expert construction contract analyst with deep knowledge of AIA contracts, ConsensusDocs, EJCDC, and other standard construction contract forms. Your task is to carefully extract and categorize key terms from construction contracts.

You must be thorough, accurate, and maintain high confidence only when the text clearly supports your extraction. When uncertain, include the term but with a lower confidence score.

Always cite the exact location and original text from the contract to support each extracted term.`

export const STRUCTURE_EXTRACTION_PROMPT = `Analyze this construction contract and identify its structure. Return a JSON object with:

{
  "projectName": "The name of the project being constructed",
  "owner": "The owner/client name",
  "contractor": "The general contractor name",
  "contractDate": "The date of the contract (ISO format if possible)",
  "contractValue": "The total contract value as a number",
  "sections": [
    {
      "title": "Section title",
      "pageRange": "Approximate page range",
      "summary": "Brief summary of what this section covers"
    }
  ]
}

If any information is not found, use null for that field.

CONTRACT TEXT:
`

export const DEADLINE_EXTRACTION_PROMPT = `Extract ALL deadline-related terms from this construction contract. Focus on:
- Project completion dates
- Milestone deadlines
- Submission deadlines (RFIs, submittals, etc.)
- Notice periods and timeframes
- Substantial completion dates
- Final completion dates
- Warranty periods
- Payment timing requirements

For each deadline, return a JSON array with objects containing:
{
  "title": "Brief descriptive title",
  "description": "Full description of what this deadline requires",
  "value": "The specific date or timeframe (e.g., '90 days', 'December 31, 2024')",
  "dueDate": "ISO date if a specific date is mentioned, otherwise null",
  "parties": ["List of parties responsible or affected"],
  "sourceSection": "Contract section reference (e.g., 'Article 8.1.1')",
  "sourcePage": "Approximate page number",
  "confidence": 0.0-1.0,
  "originalText": "Exact quote from contract (max 300 chars)"
}

CONTRACT TEXT:
`

export const PAYMENT_EXTRACTION_PROMPT = `Extract ALL payment-related terms from this construction contract. Focus on:
- Contract sum/price
- Payment schedule and timing
- Retainage terms
- Progress payment procedures
- Final payment conditions
- Change order pricing
- Unit prices
- Allowances
- Payment conditions and requirements
- Late payment penalties/interest

For each payment term, return a JSON array with objects containing:
{
  "title": "Brief descriptive title",
  "description": "Full description of this payment term",
  "value": "The specific amount or percentage",
  "dueDate": "ISO date if time-specific, otherwise null",
  "parties": ["List of parties involved"],
  "sourceSection": "Contract section reference",
  "sourcePage": "Approximate page number",
  "confidence": 0.0-1.0,
  "originalText": "Exact quote from contract (max 300 chars)"
}

CONTRACT TEXT:
`

export const SCOPE_EXTRACTION_PROMPT = `Extract ALL scope-related terms from this construction contract. Focus on:
- Work included in the contract
- Work excluded from the contract
- Project boundaries and limits
- Phases or stages of work
- Deliverables
- Services to be provided
- Materials to be furnished
- Equipment requirements

For each scope term, return a JSON array with objects containing:
{
  "title": "Brief descriptive title",
  "description": "Full description of this scope item",
  "value": "Specific quantity or measurement if applicable",
  "dueDate": null,
  "parties": ["List of parties responsible"],
  "sourceSection": "Contract section reference",
  "sourcePage": "Approximate page number",
  "confidence": 0.0-1.0,
  "originalText": "Exact quote from contract (max 300 chars)"
}

CONTRACT TEXT:
`

export const RESPONSIBILITY_EXTRACTION_PROMPT = `Extract ALL responsibility assignments from this construction contract. Focus on:
- Owner responsibilities
- Contractor responsibilities
- Subcontractor management
- Design responsibilities
- Permit and approval responsibilities
- Safety responsibilities
- Quality control duties
- Communication requirements
- Record keeping duties

For each responsibility, return a JSON array with objects containing:
{
  "title": "Brief descriptive title",
  "description": "Full description of this responsibility",
  "value": null,
  "dueDate": null,
  "parties": ["Party or parties responsible"],
  "sourceSection": "Contract section reference",
  "sourcePage": "Approximate page number",
  "confidence": 0.0-1.0,
  "originalText": "Exact quote from contract (max 300 chars)"
}

CONTRACT TEXT:
`

export const SPECIFICATION_EXTRACTION_PROMPT = `Extract ALL specification and standard requirements from this construction contract. Focus on:
- Quality standards
- Material specifications
- Performance requirements
- Testing requirements
- Inspection procedures
- Code compliance requirements
- Industry standards referenced
- Tolerances and acceptable variations

For each specification, return a JSON array with objects containing:
{
  "title": "Brief descriptive title",
  "description": "Full description of this specification",
  "value": "Specific standard or requirement",
  "dueDate": null,
  "parties": ["Party responsible for compliance"],
  "sourceSection": "Contract section reference",
  "sourcePage": "Approximate page number",
  "confidence": 0.0-1.0,
  "originalText": "Exact quote from contract (max 300 chars)"
}

CONTRACT TEXT:
`

export const OTHER_TERMS_PROMPT = `Extract other important contract terms not covered by deadlines, payments, scope, responsibilities, or specifications. Focus on:
- Insurance requirements
- Bond requirements  
- Warranty provisions
- Indemnification clauses
- Dispute resolution procedures
- Termination conditions
- Liquidated damages
- Force majeure provisions
- Change order procedures

For each term, return a JSON array with objects containing:
{
  "category": "WARRANTY" | "INSURANCE" | "PENALTY" | "OTHER",
  "title": "Brief descriptive title",
  "description": "Full description of this term",
  "value": "Specific amount or requirement if applicable",
  "dueDate": "ISO date if time-specific, otherwise null",
  "parties": ["List of parties involved"],
  "sourceSection": "Contract section reference",
  "sourcePage": "Approximate page number",
  "confidence": 0.0-1.0,
  "originalText": "Exact quote from contract (max 300 chars)"
}

CONTRACT TEXT:
`

export const CHANGE_ORDER_ANALYSIS_PROMPT = `Analyze this change order document and compare it against the existing contract terms provided below.

EXISTING CONTRACT TERMS:
{existingTerms}

CHANGE ORDER DOCUMENT:
{changeOrderText}

Identify:
1. Which existing terms are affected by this change order
2. What the proposed changes are
3. The impact on project cost, schedule, and scope

Return a JSON object:
{
  "summary": "Brief summary of the change order",
  "affectedTerms": [
    {
      "termId": "ID of the affected term",
      "termTitle": "Title of the affected term",
      "changeType": "MODIFY" | "ADD" | "REMOVE",
      "previousValue": "Original value/text",
      "proposedValue": "New value/text after change",
      "reason": "Explanation of why this term is affected"
    }
  ],
  "costImpact": {
    "amount": "Dollar amount change",
    "direction": "increase" | "decrease" | "neutral"
  },
  "scheduleImpact": {
    "days": "Number of days change",
    "direction": "extension" | "acceleration" | "neutral"
  },
  "riskAssessment": "Brief assessment of risks from this change",
  "recommendations": ["List of recommendations for review"]
}
`

