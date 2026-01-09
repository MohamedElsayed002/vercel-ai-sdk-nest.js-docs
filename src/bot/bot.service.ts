import { Injectable, Inject } from '@nestjs/common';
import { LazyModuleLoader } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Bot, BotDocument } from './schemas/bot.schema';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { createGoogleGenerativeAI, GoogleGenerativeAIProviderOptions, GoogleGenerativeAIProviderMetadata } from '@ai-sdk/google';
import { GoogleAICacheManager } from '@google/generative-ai/server';
import { generateText } from 'ai';
import { googleTools } from '@ai-sdk/google/internal';


const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!
})

const cacheManager = new GoogleAICacheManager(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY!
)

const FootRecipe = `

# 🍝 FOOD & RECIPE KNOWLEDGE BASE
This document contains a wide collection of international recipes, cooking techniques, ingredient guides, and preparation tips. It is designed to serve as a long-term cached knowledge source for food-related requests.

==================================================================

# 🥩 CLASSIC BEEF LASAGNA

## Ingredients

Meat Sauce:
- 2 tbsp olive oil
- 1 large onion, finely chopped
- 4 cloves garlic, minced
- 700 g ground beef
- 3 cups tomato sauce
- 3 tbsp tomato paste
- 1 tsp sugar
- 1½ tsp salt
- 1 tsp black pepper
- 1 tsp dried oregano
- 1 tsp dried basil
- ½ tsp chili flakes (optional)

Cheese Layer:
- 2½ cups ricotta cheese
- 1 egg
- 1½ cups shredded mozzarella
- 1 cup grated Parmesan
- 2 tbsp chopped parsley

Other:
- 12 lasagna sheets
- Butter for greasing

## Instructions

1. Heat olive oil, cook onion until translucent.
2. Add garlic, cook 30 seconds.
3. Add beef, cook until browned.
4. Stir in tomato sauce, paste, spices. Simmer 20 minutes.
5. Mix ricotta, egg, parsley, Parmesan.
6. Layer sauce → pasta → cheese → mozzarella.
7. Repeat layers.
8. Bake at 180°C for 40 minutes.
9. Rest 10 minutes before serving.

==================================================================

# 🥬 VEGETARIAN SPINACH & MUSHROOM LASAGNA

Ingredients:
- Mushrooms, spinach, onion, garlic, tomato sauce, ricotta, mozzarella, Parmesan, lasagna sheets.

Instructions:
Sauté vegetables, prepare sauce, layer, bake 35 minutes at 180°C.

==================================================================

# 🍗 CHICKEN ALFREDO LASAGNA

Ingredients:
- 500 g cooked chicken breast
- Butter, garlic, cream
- Mozzarella, Parmesan, ricotta
- Lasagna sheets

Instructions:
Prepare creamy Alfredo sauce, layer with chicken and cheese, bake until golden.

==================================================================

# 🍕 MARGHERITA PIZZA

Ingredients:
- 3 cups flour
- 1 tsp salt
- 1 tbsp yeast
- 1 tbsp sugar
- 2 tbsp olive oil
- 1 cup warm water
- Tomato sauce, mozzarella, basil

Instructions:
Knead dough, rise 1 hour, top with sauce and cheese, bake at highest oven temperature.

==================================================================

# 🍔 CLASSIC BEEF BURGER

Ingredients:
- 600 g ground beef
- Salt, pepper
- Burger buns
- Lettuce, tomato, onion, cheese

Instructions:
Season beef, grill patties, toast buns, assemble.

==================================================================

# 🍚 CHICKEN FRIED RICE

Ingredients:
- Cooked rice
- Eggs
- Chicken breast
- Soy sauce
- Garlic, onion, vegetables

Instructions:
Stir fry chicken, add vegetables, eggs, rice, soy sauce.

==================================================================

# 🍲 CREAMY MUSHROOM SOUP

Ingredients:
- Mushrooms
- Onion
- Garlic
- Butter
- Flour
- Milk or cream
- Vegetable stock

Instructions:
Cook mushrooms, add flour, slowly add stock and milk, blend, season.

==================================================================

# 🥗 MEDITERRANEAN SALAD

Ingredients:
- Tomato
- Cucumber
- Olive oil
- Lemon juice
- Feta cheese
- Olives
- Oregano

Instructions:
Chop, mix, season, serve cold.

==================================================================

# 🍞 BASIC DOUGH GUIDE

- Yeast activates best at 37°C
- Salt slows fermentation
- Sugar feeds yeast
- Knead dough 8–10 minutes
- Rest dough until doubled

==================================================================

# 🧀 CHEESE GUIDE

Mozzarella – melting cheese  
Parmesan – salty finishing cheese  
Ricotta – creamy filling  
Cheddar – burgers and sauces  
Feta – salads

==================================================================

# 🌶️ SPICE GUIDE

Cumin – warm and earthy  
Paprika – sweet or smoky  
Oregano – Italian sauces  
Basil – fresh dishes  
Cinnamon – desserts & some meats

==================================================================

# 🔥 COOKING METHODS

Sautéing – fast cooking with little oil  
Braising – slow cooking in liquid  
Roasting – dry heat cooking  
Steaming – gentle healthy cooking  
Grilling – high heat smoky flavor

==================================================================

# 🍰 BASIC VANILLA CAKE

Ingredients:
- 2½ cups flour
- 1½ cups sugar
- 3 eggs
- 1 cup milk
- ½ cup oil
- 1 tbsp baking powder
- 1 tbsp vanilla

Instructions:
Mix wet, mix dry, combine, bake at 170°C for 35 minutes.

==================================================================

# 🍫 CHOCOLATE SAUCE

- 1 cup cream
- 200 g chocolate
- 1 tbsp butter

Heat cream, pour over chocolate, mix until smooth.

==================================================================

# 🥞 PANCAKES

- 1½ cups flour
- 1 cup milk
- 1 egg
- 1 tbsp sugar
- 1 tsp baking powder

Mix, cook on non-stick pan.

==================================================================

# 🥩 COOKING TEMPERATURES

Chicken safe temp: 74°C  
Beef medium: 63°C  
Fish done: flakes easily  
Bread done: hollow sound  

==================================================================

This knowledge base is designed to support many different food-related prompts including recipes, meal planning, substitutions, cooking tips, and international cuisine generation.

`;



@Injectable()
export class BotService {
  // private readonly bots: Bot[] = [];
  private readonly CACHE_KEY = 'all_chats';
  private readonly CACHE_TTL = 60000; // 60 seconds

  constructor(
    private lazyModuleLoader: LazyModuleLoader,
    @InjectModel(Bot.name) private botModel: Model<Bot>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  hello(): string {
    return 'Hello World';
  }

  test(): string {
    return 'Testing';
  }

  findOne(id: number): string {
    return `Bot ${id}`;
  }

  async createBot(bot: Bot): Promise<{ text: string, providerMetadata: string, reason: string }> {

    await this.botModel.create({ role: "user", content: bot.content })



    const { text, reasoning, providerMetadata } = await generateText({
      model: google("gemini-3-flash-preview"),
      prompt: bot.content,
      temperature: 0.7,
      maxOutputTokens: 1000,
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 200,
            thinkingLevel: 'high',
            includeThoughts: true
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_LOW_AND_ABOVE'
            }
          ]
        } as GoogleGenerativeAIProviderOptions
      },
    })


    await this.botModel.create({ role: 'system', content: text })

    // Invalidate cache when new chat is created
    await this.cacheManager.del(this.CACHE_KEY);
    return {
      text,
      providerMetadata: JSON.stringify(providerMetadata),
      reason: JSON.stringify(reasoning)
    }
  }

  // Caching the messages example 
  async generateFood() {
    try {
      const model = 'gemini-2.5-flash';
      const { name: cachedContent } = await cacheManager.create({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ text: FootRecipe }]
          }
        ],
        ttlSeconds: 60 * 5
      })

      const { text: veggieLasangaRecipe } = await generateText({
        model: google(model),
        prompt: "Write a vegetarian lasagna recipe for 4 people",
        providerOptions: {
          google: {
            cachedContent
          }
        }
      })

      const { text: meatLasangaRecipe } = await generateText({
        model: google(model),
        prompt: 'Write a meat lasagna recipe for 12 people',
        providerOptions: {
          google: {
            cachedContent
          }
        }
      })

      return {
        cachedContent: cachedContent,
        response2: veggieLasangaRecipe,
        response: meatLasangaRecipe,
      }
    } catch (error) {
      return {
        error: error
      }
    }
  }


  // Code Execution 
  async codeExec() {
    try {
      const { text, toolCalls, toolResults } = await generateText({
        model: google("gemini-2.5-flash"),
        tools: { code_execution: google.tools.codeExecution({}) },
        prompt: "Use python to calcualte the 20th fibonacci number."
      })

      return {
        text,
        toolCalls,
        toolResults
      }
    } catch (error) {
      return error
    }
  }

  // Google Search
  async googleSearch() {
    try {
      const { text, sources, providerMetadata } = await generateText({
        model: google("gemini-2.5-flash"),
        tools: {
          google_search: google.tools.googleSearch({})
        },
        prompt: 'what is the latest 5 news happend in Egypt, and USA' + "You must include the date of each article"
      })


      const metadata = providerMetadata?.google as
        | GoogleGenerativeAIProviderMetadata
        | undefined;
      const groundingMetadata = metadata?.groundingMetadata;
      const safetyRatings = metadata?.safetyRatings;

      return {
        text,
        sources,
        providerMetadata,
        metadata
      }

    } catch (error) {
      return error
    }
  }

  async getAllChats(): Promise<BotDocument[]> {
    // Try to get from cache first
    const cachedChats = await this.cacheManager.get<BotDocument[]>(this.CACHE_KEY);

    if (cachedChats) {
      return cachedChats;
    }

    // If not in cache, fetch from database
    const chats = await this.botModel.find().exec();

    // Store in cache for future requests
    await this.cacheManager.set(this.CACHE_KEY, chats, this.CACHE_TTL);

    return chats;
  }
}
