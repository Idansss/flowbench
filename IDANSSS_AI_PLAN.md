# Idansss AI - Implementation Plan

**Your AI Assistant Built Into Flowbench**

---

## 🎯 **Vision**

**Idansss AI** - A multi-provider AI assistant integrated into Flowbench that:
- Answers questions about your tools
- Helps optimize workflows
- Provides smart suggestions
- Cites sources from your docs
- Routes between OpenAI and Gemini intelligently

---

## 🏗️ **Architecture (Path 1: API-Based)**

### **Component Stack:**

```
┌─────────────────────────────────────────────┐
│  Frontend (Next.js Chat UI)                 │
│  - Chat interface                           │
│  - Streaming responses                      │
│  - Source citations                         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Provider Router (apps/web/src/lib/ai/)    │
│  - Route by task type                       │
│  - Fallback logic                           │
│  - Retry & caching                          │
└─────┬────────────────────┬──────────────────┘
      │                    │
┌─────▼──────┐      ┌─────▼──────┐
│  OpenAI    │      │  Gemini    │
│  GPT-4     │      │  Pro 1.5   │
└────────────┘      └────────────┘
      │                    │
      └─────────┬──────────┘
                │
┌───────────────▼────────────────────────────┐
│  RAG Pipeline (Supabase pgvector)         │
│  - Vector embeddings of docs               │
│  - Similarity search                       │
│  - Top 5 chunks injected                   │
└────────────────────────────────────────────┘
```

---

## 🚀 **Implementation Phases**

### **Phase 1: Foundation (2-3 hours)**
1. Add Gemini API integration
2. Create provider router
3. Set up chat API endpoint
4. Add simple cache layer

### **Phase 2: RAG (2-3 hours)**
5. Enable pgvector in Supabase
6. Index Flowbench documentation
7. Implement similarity search
8. Inject context into prompts

### **Phase 3: UI (2-3 hours)**
9. Create chat interface component
10. Add to Flowbench navigation
11. Streaming response UI
12. Source citation display

### **Phase 4: Polish (1-2 hours)**
13. Add analytics logging
14. Implement caching strategy
15. Add fallback routing
16. Cost tracking

**Total: 7-11 hours**

---

## 🎨 **UI Integration**

### **Where It Lives:**

**New Route:** `/ai` or `/chat`

**Access Points:**
- Header navigation: "Idansss AI" button
- Homepage: "Ask AI" card
- Tool pages: "Get help" floating button
- Sidebar chat (optional)

### **Chat Interface:**

```tsx
<IdansssAI>
  {/* Chat history */}
  <MessageList>
    <UserMessage>How do I clean a CSV?</UserMessage>
    <AIMessage>
      I recommend using the Excel Fix It Bot...
      <SourceCitation href="/tools/excel-fix-it" />
    </AIMessage>
  </MessageList>
  
  {/* Input */}
  <ChatInput placeholder="Ask Idansss AI anything..." />
  
  {/* Provider indicator */}
  <ProviderBadge>Powered by GPT-4</ProviderBadge>
</IdansssAI>
```

---

## 🧠 **Provider Routing Strategy**

### **Task-Based Routing:**

```typescript
function routeToProvider(message: string, context: any) {
  // Short Q&A → OpenAI (fast, reliable)
  if (message.length < 200 && !context.needsLongContext) {
    return "openai";
  }
  
  // Long context or tool use → Gemini (1M token window)
  if (message.length > 500 || context.attachments.length > 0) {
    return "gemini";
  }
  
  // Code generation → OpenAI (better at code)
  if (message.includes("code") || message.includes("function")) {
    return "openai";
  }
  
  // Default → OpenAI
  return "openai";
}
```

### **Fallback Chain:**

```
Primary: OpenAI GPT-4
  ↓ (if timeout or error)
Fallback: Gemini Pro
  ↓ (if still fails)
Cache: Return cached response
  ↓ (if no cache)
Error: Friendly message
```

---

## 📚 **RAG Implementation**

### **What Gets Indexed:**

1. **All tool documentation** (`docs/tools/*.md`)
2. **Setup guides** (`SETUP.md`, `DEPLOYMENT.md`, etc.)
3. **API specifications**
4. **Sample use cases**

### **Workflow:**

```
User Query: "How do I clean duplicate emails?"
     ↓
1. Convert to embedding
     ↓
2. Search vector DB (pgvector)
     ↓
3. Retrieve top 5 relevant chunks
     ↓
4. Inject into prompt context
     ↓
5. Call LLM with enriched prompt
     ↓
6. Return answer + source citations
```

### **Database Schema Addition:**

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Document embeddings
CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doc_path TEXT NOT NULL,
  chunk_text TEXT NOT NULL,
  chunk_index INT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON document_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

## 💰 **Cost Tracking**

### **Per Request Logging:**

```typescript
{
  prompt: string;
  provider: "openai" | "gemini";
  model: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  latency: number;
  cached: boolean;
  timestamp: Date;
}
```

### **Estimated Costs:**

**OpenAI GPT-4:**
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens
- Typical query: ~$0.01-0.05

**Gemini Pro:**
- FREE up to 60 requests/min
- Then $0.00025 per 1K tokens
- Very cost-effective!

**With caching:** 70-80% cost reduction

---

## 🎯 **MVP Feature Set (Week 1)**

### **Core Capabilities:**

1. **Tool recommendations** - "Which tool should I use for X?"
2. **Usage help** - "How do I configure Excel Fix It?"
3. **Troubleshooting** - "Why did my job fail?"
4. **Feature discovery** - "What can Flowbench do?"

### **What It WON'T Do (Initially):**

- ❌ File processing (tools do that)
- ❌ Direct Fiverr integration
- ❌ Custom model training
- ❌ Image generation (add later)

---

## 📝 **System Prompt Design**

```typescript
const IDANSSS_AI_SYSTEM_PROMPT = `You are Idansss AI, the helpful assistant for Flowbench - a free micro tools suite.

Your knowledge:
- 10 automation tools (Excel, Lead Scrubber, QR Generator, etc.)
- How to use each tool effectively
- Best practices for data processing
- Privacy and security features

Your personality:
- Helpful and encouraging
- Concise but complete
- Technical when needed, friendly always
- Always cite documentation sources

When users ask:
1. Recommend the right tool
2. Explain how to configure it
3. Provide clear step-by-step guidance
4. Link to relevant docs

You do NOT:
- Process files yourself (tools do that)
- Make up information
- Ignore privacy concerns
- Recommend external paid tools`;
```

---

## 🔌 **API Endpoints**

### **New Routes:**

```
POST /api/ai/chat         # Main chat endpoint
GET  /api/ai/history      # User's chat history
POST /api/ai/feedback     # Thumbs up/down
GET  /api/ai/suggestions  # Contextual suggestions
```

### **Request Format:**

```typescript
POST /api/ai/chat
{
  "message": "How do I clean duplicate emails?",
  "conversationId": "uuid",
  "context": {
    "currentTool": "lead-scrubber",
    "userGoal": "clean contacts"
  }
}
```

### **Response Format:**

```typescript
{
  "message": "I recommend the Lead Scrubber...",
  "provider": "openai",
  "sources": [
    {
      "title": "Lead Scrubber Documentation",
      "url": "/tools/lead-scrubber",
      "excerpt": "Email validation and deduplication..."
    }
  ],
  "suggestions": [
    "Show me an example",
    "What about QR codes?"
  ],
  "metadata": {
    "tokens": 450,
    "latency": 1200,
    "cached": false
  }
}
```

---

## 🎨 **UI Components**

### **Chat Interface:**

```
┌─────────────────────────────────────┐
│  Idansss AI                    [×]  │
├─────────────────────────────────────┤
│                                     │
│  💬 User: How do I clean emails?   │
│                                     │
│  🤖 Idansss AI:                    │
│  Use the Lead Scrubber tool!       │
│  It validates emails, normalizes   │
│  names, and removes duplicates.    │
│                                     │
│  📎 Sources:                       │
│  → Lead Scrubber Docs              │
│  → Sample Files                    │
│                                     │
│  [Powered by GPT-4]                │
│                                     │
├─────────────────────────────────────┤
│  Ask Idansss AI anything... [Send] │
└─────────────────────────────────────┘
```

### **Integration Points:**

1. **Header** - "AI Assistant" button
2. **Homepage** - "Ask AI" tile
3. **Tool pages** - "Need help?" floating button
4. **404 pages** - "Ask AI what you're looking for"

---

## 📦 **Dependencies to Add**

```json
{
  "@google/generative-ai": "^0.17.0",  // Gemini
  "@supabase/supabase-js": "^2.45.0",  // Already have
  "openai": "^4.56.0",                  // Already have
  "ioredis": "^5.4.1",                  // Caching
  "ai": "^3.3.0"                        // Vercel AI SDK (streaming)
}
```

---

## 🎯 **MVP Scope (Ship This Week)**

### **Features:**

✅ **Chat interface** at `/ai`  
✅ **Multi-provider routing** (OpenAI + Gemini)  
✅ **RAG from docs** (cite tool documentation)  
✅ **Streaming responses** (real-time)  
✅ **Source citations** (link to docs)  
✅ **Cost tracking** (log per request)  
✅ **Caching** (Redis or in-memory)  

### **Use Cases:**

1. "Which tool removes duplicate rows?" → Excel Fix It
2. "How do I validate emails?" → Lead Scrubber
3. "Generate QR codes for 100 people" → QR Generator
4. "What can Flowbench do?" → Feature overview

---

## 🔥 **Why This Fits Flowbench**

1. **Enhances existing product** - Helps users discover tools
2. **Free to start** - Gemini Pro is free up to limits
3. **Privacy-aligned** - No data retention, cite sources
4. **Fast to ship** - Reuse infrastructure
5. **Designer-friendly** - Clean chat UI

---

## 📈 **Roadmap**

### **Week 1: MVP**
- Chat interface
- OpenAI + Gemini routing
- Basic RAG from docs
- Deploy alongside tools

### **Week 2: Enhanced**
- Better routing logic
- Conversation history
- Feedback system
- Usage analytics

### **Week 3: Advanced**
- File upload for context
- Tool suggestions in chat
- Multi-turn conversations
- Admin analytics dashboard

### **Week 4: Premium (Optional)**
- Fine-tuned responses
- Longer context windows
- Priority routing
- Advanced caching

---

## 🎊 **Next Steps**

Ready to build? I can:

1. **Set up the AI infrastructure** (router, providers, RAG)
2. **Create the chat UI** (clean, modern interface)
3. **Index your documentation** (enable smart search)
4. **Deploy alongside Flowbench** (same Vercel project)

**Want me to start building Idansss AI now?** 🤖

Or **deploy Flowbench first**, then add AI as an enhancement?

Your choice! 🚀

