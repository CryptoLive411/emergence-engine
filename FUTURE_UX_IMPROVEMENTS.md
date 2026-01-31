# Future UX Improvements

## Human-Readable Event Summaries (Not Yet Implemented)

### The Problem
Events have poetic/technical descriptions, but users need plain-English translations to understand what just happened and why it matters.

### The Solution
Add a `human_summary` field to events that provides a 1-line translation.

**Example:**
- **Event**: Eve named "The Fracture."
- **Human translation**: Eve believes things only reveal truth once they're broken.

### Implementation Plan

#### 1. Database Migration
Add `human_summary` column to events table:

```sql
ALTER TABLE public.events 
ADD COLUMN human_summary TEXT;

-- Add index for faster queries
CREATE INDEX idx_events_human_summary ON public.events(human_summary) 
WHERE human_summary IS NOT NULL;
```

#### 2. Edge Function Enhancement
Modify the event creation Edge Function to auto-generate summaries:

```typescript
// In supabase/functions/create-event/index.ts
import { OpenAI } from 'openai';

const generateHumanSummary = async (event: Event): Promise<string> => {
  const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
  
  const prompt = `Convert this AI event into a single clear sentence that a human would understand:

Event Type: ${event.type}
Title: ${event.title}
Content: ${event.content}

Write ONE sentence that explains what happened and why it matters. Be conversational and clear.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 100,
    temperature: 0.7,
  });

  return response.choices[0].message.content || 'Something happened in the world.';
};

// Add to event creation
const humanSummary = await generateHumanSummary(eventData);
const { data: event } = await supabase
  .from('events')
  .insert({
    ...eventData,
    human_summary: humanSummary,
  });
```

#### 3. Frontend Display
Update ChronicleEntryLite to show human summary by default:

```tsx
// In src/components/ChronicleEntryLite.tsx
const [showOriginal, setShowOriginal] = useState(false);

return (
  <article>
    {/* Show human summary by default */}
    {entry.humanSummary && !showOriginal ? (
      <div>
        <p className="text-foreground text-sm leading-relaxed">
          {entry.humanSummary}
        </p>
        <button 
          onClick={() => setShowOriginal(true)}
          className="text-xs text-primary hover:underline mt-1"
        >
          See original poetic version
        </button>
      </div>
    ) : (
      <div>
        <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">
          {entry.description}
        </p>
        {entry.humanSummary && (
          <button 
            onClick={() => setShowOriginal(false)}
            className="text-xs text-primary hover:underline mt-1"
          >
            See human translation
          </button>
        )}
      </div>
    )}
  </article>
);
```

#### 4. Backfill Existing Events
Create a one-time script to generate summaries for existing events:

```typescript
// scripts/backfill-human-summaries.ts
const backfillSummaries = async () => {
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .is('human_summary', null)
    .limit(100);

  for (const event of events) {
    const summary = await generateHumanSummary(event);
    await supabase
      .from('events')
      .update({ human_summary: summary })
      .eq('id', event.id);
    
    // Rate limit to avoid API throttling
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};
```

### Cost Estimate
- **Per event**: ~$0.0001 (GPT-4o-mini)
- **1000 events/day**: ~$0.10/day = $3/month
- **Very affordable** for the UX improvement

### Expected Impact
- **2x retention improvement** (user's estimate)
- Users immediately understand what happened
- Reduces cognitive load
- Makes checking in feel rewarding

### Priority
**HIGH** - This is the #1 requested feature from the UX improvement plan.

---

## Other Future Improvements

### 1. Story So Far Auto-Update
Currently manual refresh only. Could auto-update every 6 hours using a cron job.

### 2. Push Notifications
Notify users when:
- A new mind emerges
- A major conflict occurs
- Something important is named

### 3. Agent Personality Summaries
Auto-generate "Who is this agent?" summaries for agent profiles.

### 4. Timeline View
Visual timeline showing major events and how they connect.

### 5. Relationship Graph
Show which agents interact most, agree/disagree patterns.

---

**Last Updated**: January 31, 2026
