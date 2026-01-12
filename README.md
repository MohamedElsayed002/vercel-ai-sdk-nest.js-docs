

## The `@Module()` decorator takes a single object with properties that describes the module:

- Providers: the providers that will be instantiated by Nest injector and that may be shared at least across
- Controllers: the set of controllers defined in this module which have to be instantiated
- Imports: the list of imported modules that export the providers which are required in this module
- Exports: the subset of providers that are provided by this module and should be available in other modules which import this module. You can use either the provider itself or just its token (provide value)


## Gurads / Pipes


## Dynamic Routes

```ts


import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}



```

```ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

```ts

import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  /*
    Implementation that makes use of this.usersService
  */
}
```


---

## Testing 

1- Watch testing section from John Smilga course then read the docs from nest.js 
2- https://docs.nestjs.com/fundamentals/testing
3- also my old code https://github.com/MohamedElsayed002/nestjs-testing


## Caching 

https://docs.nestjs.com/techniques/caching


## Cookies 

https://docs.nestjs.com/techniques/cookies


## Compression 


https://docs.nestjs.com/techniques/compression

Compression can greatly decrease size of the response body, threaby increasing the speed of web app.

For high-traffic websites in production, it is strongly recommended to offload compression from the application server-typically in a reverse proxy (e.g. Nginx). In that case, you should not use compression middleware


---

## Cached Content 

Google Generative AI Supports both explicit and implicit caching to help reduce costs n repetitve content.

### Implicit Caching 

Gemini 2.5 models automatically provide cache provide cache cost savings without needing to create an explicit cache. When you send requests that share common prefixes with previous requests, you'll recieve a 75% token discount on cached content 

To maxmize cache hits with implicit caching:

- Keep content at the beginning of requests consistent 
- Add variable content (like user questions at the end of prompts)
- Ensure requests meet minimum token requirements 
  - Gemini 2.5 Flash: 1024 tokens minimum
  - Gemini 2.5 Pro: 2048 tokens minimum


```ts
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// Structure prompts with consistent content at the beginning
const baseContext =
  'You are a cooking assistant with expertise in Italian cuisine. Here are 1000 lasagna recipes for reference...';

const { text: veggieLasagna } = await generateText({
  model: google('gemini-2.5-pro'),
  prompt: `${baseContext}\n\nWrite a vegetarian lasagna recipe for 4 people.`,
});

// Second request with same prefix - eligible for cache hit
const { text: meatLasagna, providerMetadata } = await generateText({
  model: google('gemini-2.5-pro'),
  prompt: `${baseContext}\n\nWrite a meat lasagna recipe for 12 people.`,
});

// Check cached token count in usage metadata
console.log('Cached tokens:', providerMetadata.google?.usageMetadata);
// e.g.
// {
//   groundingMetadata: null,
//   safetyRatings: null,
//   usageMetadata: {
//     cachedContentTokenCount: 2027,
//     thoughtsTokenCount: 702,
//     promptTokenCount: 2152,
//     candidatesTokenCount: 710,
//     totalTokenCount: 3564
//   }
// }
```


## Real World Example of Caching the Messages 

Imagine you're building a bot for platform (restaurant app, SaaS tool, job platform, e-commerce site).

The bot constantly needs

- Comapny Info 
- Product/Service descriptions
- Rules & Policies 
- User Profile Info 
- Long chat history summaries 

Sending these every request is expensive and slow.

So we can cache them.


### What should Be cached in real projects? 
There are 3 high-value caching layers:

1- Long, rarely changing knowledge (LLM-side cache)

Examples

- Company documentation 
- Menus / recipes 
- Policies 
- System instucations
- Product catalogs
 Product catalogs

 These are PERFECT  for Google cachedContents.


### Example 
Instead of sending this everytime:

```txt
You are a support agent for CareerCastAI...
Here is our pricing...
Here are our features...
Here are all recipes...
Here are the rules...
```

You cache t once.

Then every request only sends:
- user message
- cachedContent ID

Huge token savings.


---

## 2. User Profile & Important facts (App-Side cache, Redis / Nest Cache)

Examples 
- Name
- Subscription plan
- Language 
- Goals
- Food allergies
- Last order
- Preferences

Instead f fetching DB + resending to model every time

Cache it

```ts
user:123 → {
  name: "Mohamed",
  plan: "pro",
  goal: "learn backend",
  allergies: ["peanuts"]
}
```

TTL: 5-30 minutes

Use it to:
 - Personalize answers
 - build short system prompts


---

## 3. Conversation memory (Summarized, not raw)

❌ Bad (expensive):
Send 200 old messages every request 

✅ Good:
Keep a rolling AI Summary

Example summary you cache:

```txt
  User is Mohamed.
He is a full-stack developer.
He is building a NestJS AI bot.
He previously had issues with Gemini caching.
He wants to optimize cost and performance.
```

This becomes part f the system context instead of full chat logs


---

## Real-world achitecture

```css
[ Database ] → long term truth
[ Redis / Nest Cache ] → fast user + chat memory
[ Google CachedContents ] → heavy AI knowledge
```

--- 

## Concrete real-world example (Job Application AI Bot)

Step 1: Cache static AI knowledge once

```ts
const { name: cachedCompanyBrain } = await cacheManager.create({
  model: "gemini-3-flash-preview",
  contents: [
    {
      role: "user",
      parts: [{ text: COMPANY_DOCS_AND_RULES }]
    }
  ],
  ttlSeconds: 60 * 60 * 24 // 24 hours
});
```

Cached:
- company info 
- job rules
- CV Tips
- platform features


### Step 2: Cache user profile (Nest cahe)

```ts
const userCacheKey = `user:${userId}`;

let userProfile = await this.cache.get(userCacheKey);

if (!userProfile) {
  userProfile = await this.usersService.findById(userId);
  await this.cache.set(userCacheKey, userProfile, 60 * 15);
}
```

### Step 3: Cache conversation memory summary 
Every 10 messages, summarize :

```ts
const summary = await generateText({
  model: google("gemini-3-flash-preview"),
  prompt: `
Summarize this conversation. Keep only important user facts, goals, and ongoing tasks.

${lastMessages}
`
});

await this.cache.set(`memory:${userId}`, summary.text, 60 * 60);

```


### Step 4: Use all caches when generating 

```ts
const cachedBrain = await this.cache.get("company_brain_id");
const userProfile = await this.cache.get(`user:${userId}`);
const memory = await this.cache.get(`memory:${userId}`);

const prompt = `
User profile:
${JSON.stringify(userProfile)}

Conversation memory:
${memory}

User message:
${message}
`;

const result = await generateText({
  model: google("gemini-3-flash-preview"),
  prompt,
  providerOptions: {
    google: {
      cachedContent: cachedBrain
    }
  }
});

```
---

## File Search

The `File search Tool` lets Gemini retrieve context from your own documents that you have indexed in File Search stores. Only Gemini 2.5 and Gemini 3 models support this features

```ts
  import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const { text, sources } = await generateText({
  model: google('gemini-2.5-pro'),
  tools: {
    file_search: google.tools.fileSearch({
      fileSearchStoreNames: [
        'projects/my-project/locations/us/fileSearchStores/my-store',
      ],
      metadataFilter: 'author = "Robert Graves"',
      topK: 8,
    }),
  },
  prompt: "Summarise the key themes of 'I, Claudius'.",
});
```

File Search responses include citations via the normal `sources` field and expose raw `grounding metadata` in `providerMetadata.google.groundingMetadata`.

---

## URL Context 

Google provides a provider-defined URL context tool

The URL context tool allows you to provide specific URLs that you want the model to analyze 
directly in from the prompt 

```ts
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const { text, sources, providerMetadata } = await generateText({
  model: google('gemini-2.5-flash'),
  prompt: `Based on the document: https://ai.google.dev/gemini-api/docs/url-context.
          Answer this question: How many links we can consume in one request?`,
  tools: {
    url_context: google.tools.urlContext({}),
  },
});

const metadata = providerMetadata?.google as
  | GoogleGenerativeAIProviderMetadata
  | undefined;
const groundingMetadata = metadata?.groundingMetadata;
const urlContextMetadata = metadata?.urlContextMetadata;
```

---

## Combine URL Context with Search Grounding 

You can combine the URL context tool with search grounding to provide the model with the latest information from the web


```ts
  import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const { text, sources, providerMetadata } = await generateText({
  model: google('gemini-2.5-flash'),
  prompt: `Based on this context: https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai, tell me how to use Gemini with AI SDK.
    Also, provide the latest news about AI SDK V5.`,
  tools: {
    google_search: google.tools.googleSearch({}),
    url_context: google.tools.urlContext({}),
  },
});

const metadata = providerMetadata?.google as
  | GoogleGenerativeAIProviderMetadata
  | undefined;
const groundingMetadata = metadata?.groundingMetadata;
const urlContextMetadata = metadata?.urlContextMetadata;
```

---


## Google Maps Grounding 

With `Google Maps Grounding`, the model has access to Google Maps data for locaiton-aware responses. This enables providing local data and geospatial context, such as finding nearby restaurants.

```ts
import { google } from '@ai-sdk/google';
import { GoogleGenerativeAIProviderMetadata } from '@ai-sdk/google';
import { generateText } from 'ai';

const { text, sources, providerMetadata } = await generateText({
  model: google('gemini-2.5-flash'),
  tools: {
    google_maps: google.tools.googleMaps({}),
  },
  providerOptions: {
    google: {
      retrievalConfig: {
        latLng: { latitude: 34.090199, longitude: -117.881081 },
      },
    },
  },
  prompt:
    'What are the best Italian restaurants within a 15-minute walk from here?',
});

const metadata = providerMetadata?.google as
  | GoogleGenerativeAIProviderMetadata
  | undefined;
const groundingMetadata = metadata?.groundingMetadata;
```


---

# Agents with Vercel AI SDK

Agents are large language models (LLMs) that use tools in a loop to accomplish tasks

These components work together
- LLMs process input and decide in the next action
- Tools extend capabilities beyond text generation (reading files, calling APIs, writing to database)
- Loop orchestrates execution through:
  - Context Management - Mainting conversation history and deciding what the model sees (input) at each step
  - Stopping conditions - Determining when the loop (task) is complete

---

## ToolLoopAgent Class

The ToolLoopAgent class handles these three components. Here's an agent that uses multiple tools in a loop to accomplish a task:

```ts
import { ToolLoopAgent, stepCountIs, tool } from 'ai';
import { google } from "@ai-sdk/google";
import { z } from 'zod';

const weatherAgent = new ToolLoopAgent({
  model: google("gemini-3-pro-image"),
  tools: {
    weather: tool({
      description: 'Get the weather in a location (in Fahrenheit)',
      inputSchema: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
    convertFahrenheitToCelsius: tool({
      description: 'Convert temperature from Fahrenheit to Celsius',
      inputSchema: z.object({
        temperature: z.number().describe('Temperature in Fahrenheit'),
      }),
      execute: async ({ temperature }) => {
        const celsius = Math.round((temperature - 32) * (5 / 9));
        return { celsius };
      },
    }),
  },
  // Agent's default behavior is to stop after a maximum of 20 steps
  // stopWhen: stepCountIs(20),
});

const result = await weatherAgent.generate({
  prompt: 'What is the weather in San Francisco in celsius?',
});

console.log(result.text); // agent's final answer
console.log(result.steps); // steps taken by the agent
```


## Structured Workflows

Agents are flexible and powerful, but non-deterministic. When you need reliable, repeatable
outcomes with explicit control flow use core functions with structured workflow patterns
combining:

- Conditional statements for explicit branching
- Standard functions for reusable logic
- Error handling for robustness 
- Explicit control flow for predictability

---

## Building Agents

The Agent class provides a strctured way to encapsluate LLM configuration, tools, and behavior into reusable components. It handles the agent loop for you, allowing the LLM to call tools multiple times in sequence to accomplish complex tasks. Define agents once and use them across application

### Why Use the ToolLoopAgent Class?

When building AI applications, you often need to:

- Reuse configuration: Same model settings, tools, and prompts across different parts of your applicaiton
- Maitain consistency: Ensure the same behavior and capabilities throughtout your codebase
- Simplify API routes: Reduce Boilerplate in your endpoints
- Type safety: Get full Typescript support for your agent's tools and outputs

The ToolLoopAgent class provides a single place to define your agent's behavior

```ts
import { ToolLoopAgent, tool } from 'ai';
import { google } from "@ai-sdk/google";
import { z } from 'zod';

const codeAgent = new ToolLoopAgent({
  model: google("gemini-3-pro-image"),
  tools: {
    runCode: tool({
      description: 'Execute Python code',
      inputSchema: z.object({
        code: z.string(),
      }),
      execute: async ({ code }) => {
        // Execute code and return result
        return { output: 'Code executed successfully' };
      },
    }),
  },
  stopWhen: stepCountIs(20), // Allow up to 20 steps
});
```


I can also force the use of specific tool

```ts
import { ToolLoopAgent } from 'ai';
import { google } from "@ai-sdk/google";

const agent = new ToolLoopAgent({
  model: google('gemini-2.5-flash'),
  tools: {
    weather: weatherTool,
        cityAttractions: attractionsTool,
  },
  toolChoice: {
    type: 'tool',
    toolName:'weather' 
  }
})
```

### Structured Output 

Define structured output schemas 

```ts
  import { ToolLoopAgent, Output, stepCountIs } from 'ai';
import { google } from "@ai-sdk/google";
import { z } from 'zod';

const analysisAgent = new ToolLoopAgent({
  model: google("gemini-3-pro-image"),
  output: Output.object({
    schema: z.object({
      sentiment: z.enum(['positive', 'neutral', 'negative']),
      summary: z.string(),
      keyPoints: z.array(z.string()),
    }),
  }),
  stopWhen: stepCountIs(10),
});

const { output } = await analysisAgent.generate({
  prompt: 'Analyze customer feedback from the last quarter',
});
```


### Tool Usage Insturctions 

Guide how the agent should use available tools:

```ts
const researchAgent = new ToolLoopAgent({
  model: google("gemini-3-pro-image"),
  instructions: `You are a research assistant with access to search and document tools.

  When researching:
  1. Always start with a broad search to understand the topic
  2. Use document analysis for detailed information
  3. Cross-reference multiple sources before drawing conclusions
  4. Cite your sources when presenting information
  5. If information conflicts, present both viewpoints`,
  tools: {
    webSearch,
    analyzeDocument,
    extractQuotes,
  },
});
```
---

## Loop Control 

https://ai-sdk.dev/docs/agents/loop-control

## Configuring Call Options 

https://ai-sdk.dev/docs/agents/configuring-call-options

--- 

https://vercel.com/blog/ai-sdk-6
https://www.anthropic.com/engineering/building-effective-agents