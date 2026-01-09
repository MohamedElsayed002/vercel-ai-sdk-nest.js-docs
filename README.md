

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