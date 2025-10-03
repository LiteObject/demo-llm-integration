# Demo LLM Integration

This project demonstrates how to combine the Strategy, Abstract Factory, and Adapter design patterns to build a flexible large language model (LLM) chat integration layer in TypeScript. The code shows how to switch between platforms (Bedrock, Azure AI, Google Vertex, Ollama), providers, and models at runtime without sprinkling platform-specific conditionals across the application.

## When to Use This Pattern

### Use This Approach When:

- **Multiple Provider Support Required**: Your application needs to work with 3+ different LLM platforms or you anticipate adding more providers over time.
- **Runtime Switching Needed**: Users need to switch between providers/models dynamically without redeploying the application.
- **Platform Abstraction Valuable**: You want to protect your business logic from vendor-specific API changes.
- **Testing Flexibility Important**: You need to easily mock or swap implementations for testing purposes.
- **Complex Provider Logic**: Each platform has unique authentication, request formatting, or response handling requirements.

### Consider Simpler Approaches When:

- **Single Provider**: If you only use one LLM provider and don't anticipate changes, direct SDK integration is simpler.
- **No Runtime Switching**: If the provider is configured once at deployment time, environment variables and a single adapter may suffice.
- **Prototype/MVP**: Early-stage projects benefit from direct implementation first, then refactor to patterns when complexity justifies it.
- **Minimal Abstraction Needs**: If all providers you use have nearly identical APIs, a thin wrapper function may be enough.

### Rule of Thumb

Start simple. Introduce these patterns when you:
1. Add a second provider
2. Need runtime configuration
3. Find conditional logic spreading across multiple files

## Project Layout

- `src/core`: Shared domain contracts (`ChatOptions`, `LLMStrategy`, `LLMFactory`).
- `src/platforms`: Platform-specific adapters and factories.
- `src/service`: Higher-level façade (`ChatService`) and a convenience builder for wiring.
- `src/registry`: Lightweight registry used to register factories at startup.
- `src/demo.ts`: Minimal script illustrating runtime switching.

## Getting Started

```pwsh
# Install dependencies
npm install

# Compile TypeScript
npm run build

# Run the Vitest suite
npm test

# Execute the demo script
npm run demo
```

## Migration Guide: Adding a New Platform

This guide walks you through adding support for a new LLM platform (e.g., Anthropic Direct, Cohere, HuggingFace).

### Step 1: Create Platform Directory Structure

```pwsh
# Create directory for the new platform
mkdir src/platforms/anthropic
```

### Step 2: Define the Strategy (Adapter)

Create `src/platforms/anthropic/anthropic-strategy.ts`:

```typescript
/**
 * Anthropic adapter implementing the Strategy contract. Translates between
 * the Anthropic SDK format and our unified domain types.
 */

import type { ChatOptions, ChatResponse, StreamingChunk } from '../../core/chat-types.js';
import type { LLMStrategy } from '../../core/llm-strategy.js';
import { AnthropicClient } from '../sdk-clients.js'; // or import actual SDK

export class AnthropicStrategy implements LLMStrategy {
  constructor(
    private readonly client: AnthropicClient,
    private readonly model: string
  ) {}

  async sendMessage(prompt: string, options: ChatOptions = {}): Promise<ChatResponse> {
    // Call the actual Anthropic SDK
    const response = await this.client.messages.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature ?? 1.0,
      system: options.systemPrompt
    });

    // Adapt the response to our unified format
    return {
      model: response.model,
      content: response.content[0].text,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens
      }
    };
  }

  async * streamMessage(prompt: string, options: ChatOptions = {}): AsyncIterable<StreamingChunk> {
    // Use Anthropic's streaming API
    const stream = await this.client.messages.stream({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature ?? 1.0
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        yield {
          model: this.model,
          contentFragment: event.delta.text,
          isLast: false
        };
      } else if (event.type === 'message_stop') {
        yield {
          model: this.model,
          contentFragment: '',
          isLast: true
        };
      }
    }
  }
}
```

### Step 3: Create the Factory

Create `src/platforms/anthropic/anthropic-factory.ts`:

```typescript
/**
 * Anthropic factory that knows which models are supported and how to create
 * the corresponding strategy instances.
 */

import type { LLMFactory } from '../../core/llm-factory.js';
import type { LLMStrategy } from '../../core/llm-strategy.js';
import { AnthropicClient } from '../sdk-clients.js';
import { AnthropicStrategy } from './anthropic-strategy.js';

const SUPPORTED_MODELS = Object.freeze([
  'claude-3-5-sonnet-20241022',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307'
]);

export class AnthropicFactory implements LLMFactory {
  constructor(
    private readonly client: AnthropicClient = new AnthropicClient()
  ) {}

  createClient(model: string): LLMStrategy {
    if (!SUPPORTED_MODELS.includes(model)) {
      throw new Error(`Anthropic model "${model}" is not supported.`);
    }
    return new AnthropicStrategy(this.client, model);
  }

  listAvailableModels(): readonly string[] {
    return SUPPORTED_MODELS;
  }
}
```

### Step 4: Add SDK Client (if needed)

If using a mock client, add to `src/platforms/sdk-clients.ts`:

```typescript
export interface AnthropicRequest {
  readonly model: string;
  readonly messages: Array<{ role: string; content: string }>;
  readonly max_tokens?: number;
  readonly temperature?: number;
  readonly system?: string;
}

export interface AnthropicResponse {
  readonly model: string;
  readonly content: Array<{ text: string }>;
  readonly usage: {
    readonly input_tokens: number;
    readonly output_tokens: number;
  };
}

export class AnthropicClient {
  async messages.create(request: AnthropicRequest): Promise<AnthropicResponse> {
    await Promise.resolve();
    return {
      model: request.model,
      content: [{ text: `Anthropic response to: ${request.messages[0].content}` }],
      usage: { input_tokens: 15, output_tokens: 25 }
    };
  }
}
```

### Step 5: Register the Factory

Update `src/platforms/register.ts`:

```typescript
import { llmRegistry } from '../registry/llm-registry.js';
import { AzureFactory } from './azure/azure-factory.js';
import { BedrockFactory } from './bedrock/bedrock-factory.js';
import { GoogleFactory } from './google/google-factory.js';
import { OllamaFactory } from './ollama/ollama-factory.js';
import { AnthropicFactory } from './anthropic/anthropic-factory.js'; // Add this

export function registerDefaultFactories(): void {
  llmRegistry.register('bedrock', new BedrockFactory());
  llmRegistry.register('azure', new AzureFactory());
  llmRegistry.register('google', new GoogleFactory());
  llmRegistry.register('ollama', new OllamaFactory());
  llmRegistry.register('anthropic', new AnthropicFactory()); // Add this
}
```

### Step 6: Add Type Support (Optional)

Update `src/platforms/factory-resolver.ts` to include the new platform:

```typescript
export type SupportedPlatform = 'bedrock' | 'azure' | 'google' | 'ollama' | 'anthropic';

export function createFactory(platform: SupportedPlatform): LLMFactory {
  switch (platform) {
    case 'bedrock':
      return new BedrockFactory();
    case 'azure':
      return new AzureFactory();
    case 'google':
      return new GoogleFactory();
    case 'ollama':
      return new OllamaFactory();
    case 'anthropic':
      return new AnthropicFactory();
    default: {
      const exhaustiveCheck: never = platform;
      throw new Error(`Unsupported platform: ${String(exhaustiveCheck)}`);
    }
  }
}
```

### Step 7: Add Tests

Create `src/platforms/anthropic/anthropic-strategy.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { AnthropicFactory } from './anthropic-factory.js';

describe('AnthropicFactory', () => {
  it('creates strategy for supported models', () => {
    const factory = new AnthropicFactory();
    const strategy = factory.createClient('claude-3-5-sonnet-20241022');
    expect(strategy).toBeDefined();
  });

  it('throws error for unsupported models', () => {
    const factory = new AnthropicFactory();
    expect(() => factory.createClient('invalid-model')).toThrow('not supported');
  });

  it('lists available models', () => {
    const factory = new AnthropicFactory();
    const models = factory.listAvailableModels();
    expect(models).toContain('claude-3-5-sonnet-20241022');
  });
});
```

### Step 8: Update Documentation

Add the new platform to your demo or documentation:

```typescript
// In src/demo.ts or your usage examples
chatService.configure({ platform: 'anthropic', model: 'claude-3-5-sonnet-20241022' });
const anthropicResponse = await chatService.send('Hello from Anthropic!');
console.log('[Anthropic]', anthropicResponse.content);
```

### Step 9: Verify Integration

```pwsh
# Rebuild TypeScript
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Test the demo
npm run demo
```

### Common Pitfalls

1. **Authentication**: Remember to handle API keys/credentials in the client constructor.
2. **Response Mapping**: Carefully map all fields from the provider's response to `ChatResponse`.
3. **Error Handling**: Wrap SDK calls in try-catch and throw descriptive errors.
4. **Streaming**: Not all platforms support streaming; document limitations.
5. **Token Counting**: Different platforms count tokens differently; document this variance.

### Best Practices

- Keep the strategy focused on API translation only
- Put business logic in the service layer, not adapters
- Use dependency injection for SDK clients to enable testing
- Document platform-specific quirks in strategy comments
- Add integration tests with real API calls (optional, separate suite)
