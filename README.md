# Demo LLM Integration

This project demonstrates how to combine the Strategy, Abstract Factory, and Adapter design patterns to build a flexible large language model (LLM) integration layer in TypeScript. The code shows how to switch between platforms (Bedrock, Azure AI, Google Vertex, Ollama), providers, and models at runtime without sprinkling platform-specific conditionals across the application.

## Design Patterns Used

- **Strategy Pattern**: Encapsulates different LLM provider implementations behind a common interface (`LLMStrategy`), allowing runtime switching between providers without changing client code.
- **Abstract Factory Pattern**: Creates families of related objects (platform-specific strategies) without specifying their concrete classes. Each platform has its own factory that knows how to instantiate the correct strategy.
- **Adapter Pattern**: Converts provider-specific APIs into a unified interface that the application expects. Each platform adapter translates between the vendor SDK and our domain types.

Together, these patterns provide flexibility (Strategy), organized creation (Factory), and compatibility (Adapter).

## Architecture Diagrams

### How the Patterns Work Together

```mermaid
graph TB
    subgraph "Client Layer"
        App[Application Code]
        Demo[demo.ts]
    end
    
    subgraph "Service Layer (Facade)"
        ChatService[ChatService]
        Builder[LLMClientBuilder]
    end
    
    subgraph "Registry (Service Locator)"
        Registry[LLMRegistry]
    end
    
    subgraph "Factory Layer (Abstract Factory)"
        BF[BedrockFactory]
        AF[AzureFactory]
        GF[GoogleFactory]
        OF[OllamaFactory]
    end
    
    subgraph "Strategy Layer (Strategy + Adapter)"
        BS[BedrockStrategy<br/>«Adapter»]
        AS[AzureStrategy<br/>«Adapter»]
        GS[GoogleStrategy<br/>«Adapter»]
        OS[OllamaStrategy<br/>«Adapter»]
    end
    
    subgraph "External SDKs"
        BSDK[AWS Bedrock SDK]
        ASDK[Azure OpenAI SDK]
        GSDK[Google Vertex SDK]
        OSDK[Ollama API]
    end
    
    App --> ChatService
    Demo --> Builder
    Builder --> Registry
    ChatService --> Registry
    
    Registry --> BF
    Registry --> AF
    Registry --> GF
    Registry --> OF
    
    BF --> BS
    AF --> AS
    GF --> GS
    OF --> OS
    
    BS --> BSDK
    AS --> ASDK
    GS --> GSDK
    OS --> OSDK
    
    style ChatService fill:#e1f5e1
    style Registry fill:#fff3cd
    style BS fill:#d4e9ff
    style AS fill:#d4e9ff
    style GS fill:#d4e9ff
    style OS fill:#d4e9ff
```

### Runtime Platform Switching Sequence

```mermaid
sequenceDiagram
    participant App
    participant ChatService
    participant Registry
    participant Factory
    participant Strategy
    participant SDK
    
    App->>ChatService: configure({platform: 'bedrock', model: 'claude'})
    ChatService->>Registry: getFactory('bedrock')
    Registry-->>ChatService: BedrockFactory
    ChatService->>Factory: createClient('claude')
    Factory->>Strategy: new BedrockStrategy(client, 'claude')
    Factory-->>ChatService: strategy instance
    
    App->>ChatService: send('Hello')
    ChatService->>Strategy: sendMessage('Hello')
    Strategy->>SDK: invokeModel(request)
    SDK-->>Strategy: response
    Strategy-->>ChatService: ChatResponse (unified)
    ChatService-->>App: ChatResponse
    
    Note over App,ChatService: User switches platform
    
    App->>ChatService: configure({platform: 'azure', model: 'gpt-4'})
    ChatService->>Registry: getFactory('azure')
    Registry-->>ChatService: AzureFactory
    ChatService->>Factory: createClient('gpt-4')
    Factory->>Strategy: new AzureStrategy(client, 'gpt-4')
    Factory-->>ChatService: new strategy instance
    
    App->>ChatService: send('Hello again')
    ChatService->>Strategy: sendMessage('Hello again')
    Strategy->>SDK: chat.completions.create(request)
    SDK-->>Strategy: response
    Strategy-->>ChatService: ChatResponse (unified)
    ChatService-->>App: ChatResponse
```



### Data Flow Through Patterns

```mermaid
graph LR
    subgraph "Input"
        Prompt[User Prompt]
        Config[Platform Config]
    end
    
    subgraph "Strategy Pattern"
        Strategy{Which Strategy?}
    end
    
    subgraph "Adapter Pattern"
        Adapt1[Bedrock Adapter]
        Adapt2[Azure Adapter]
        Adapt3[Google Adapter]
    end
    
    subgraph "External APIs"
        API1[AWS API]
        API2[Azure API]
        API3[Google API]
    end
    
    subgraph "Output"
        Response[Unified Response]
    end
    
    Config --> |Selects| Strategy
    Prompt --> Strategy
    
    Strategy --> |bedrock| Adapt1
    Strategy --> |azure| Adapt2
    Strategy --> |google| Adapt3
    
    Adapt1 --> |Transform| API1
    Adapt2 --> |Transform| API2
    Adapt3 --> |Transform| API3
    
    API1 --> |Normalize| Response
    API2 --> |Normalize| Response
    API3 --> |Normalize| Response
    
    style Strategy fill:#fff3cd
    style Adapt1 fill:#d4e9ff
    style Adapt2 fill:#d4e9ff
    style Adapt3 fill:#d4e9ff
    style Response fill:#e1f5e1
```

### Component Dependencies

```mermaid
graph BT
    subgraph "External Dependencies"
        SDK1[AWS SDK]
        SDK2[Azure SDK]
        SDK3[Google SDK]
        SDK4[Ollama API]
    end
    
    subgraph "Platform Adapters"
        BA[Bedrock Adapter]
        AA[Azure Adapter]
        GA[Google Adapter]
        OA[Ollama Adapter]
    end
    
    subgraph "Factories"
        BF[Bedrock Factory]
        AF[Azure Factory]
        GF[Google Factory]
        OF[Ollama Factory]
    end
    
    subgraph "Core Contracts"
        Strategy[LLMStrategy Interface]
        Factory[LLMFactory Interface]
        Types[Chat Types]
    end
    
    subgraph "Service Layer"
        Registry[LLM Registry]
        Service[Chat Service]
        Builder[Client Builder]
    end
    
    subgraph "Application"
        App[Your Application]
    end
    
    SDK1 --> BA
    SDK2 --> AA
    SDK3 --> GA
    SDK4 --> OA
    
    BA --> Strategy
    AA --> Strategy
    GA --> Strategy
    OA --> Strategy
    
    BA --> BF
    AA --> AF
    GA --> GF
    OA --> OF
    
    BF --> Factory
    AF --> Factory
    GF --> Factory
    OF --> Factory
    
    Factory --> Registry
    Strategy --> Service
    Registry --> Service
    Registry --> Builder
    
    Service --> App
    Builder --> App
    Types --> Strategy
    Types --> Service
    
    style Strategy fill:#ffd700
    style Factory fill:#ffd700
    style Types fill:#ffd700
    style Service fill:#90ee90
    style App fill:#87ceeb
```

### Pattern Responsibilities

```mermaid
graph TD
    subgraph "Strategy Pattern Responsibility"
        SP[Define common interface<br/>Enable runtime switching<br/>Encapsulate algorithms]
    end
    
    subgraph "Abstract Factory Responsibility"
        AF[Create related objects<br/>Validate model support<br/>Hide instantiation logic]
    end
    
    subgraph "Adapter Pattern Responsibility"
        AP[Convert vendor APIs<br/>Normalize responses<br/>Handle SDK specifics]
    end
    
    subgraph "Service/Facade Responsibility"
        SF[Simplify client interface<br/>Manage configuration<br/>Coordinate patterns]
    end
    
    subgraph "Registry Responsibility"
        RP[Manage factory instances<br/>Enable platform discovery<br/>Centralize registration]
    end
    
    SP --> |Provides| Interface[Uniform LLM Interface]
    AF --> |Creates| Instances[Platform-Specific Instances]
    AP --> |Translates| APIs[Vendor SDK Calls]
    SF --> |Exposes| Simple[Simple API to Clients]
    RP --> |Enables| Discovery[Runtime Platform Discovery]
    
    Interface --> Simple
    Instances --> Simple
    APIs --> Instances
    Discovery --> Simple
    
    style SP fill:#e6f3ff
    style AF fill:#ffe6f0
    style AP fill:#fff0e6
    style SF fill:#e6ffe6
    style RP fill:#f0e6ff
```

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

## Key Concepts

### Platform vs Provider

This project distinguishes between **platforms** and **providers**:

- **Platform**: The hosting infrastructure or service that provides access to LLM models
  - Examples: AWS Bedrock, Azure AI, Google Vertex AI, Ollama (local)
  - Platforms have their own SDKs, authentication mechanisms, and API structures
  - Each platform is represented by a Factory in this codebase

- **Provider**: The organization that created the underlying LLM model
  - Examples: OpenAI, Anthropic, Mistral, Meta, Google
  - Providers create the actual models (GPT-4, Claude, Llama, Gemini)
  - The same provider's models may be available on multiple platforms

**Example relationships:**
```
Platform: AWS Bedrock
├── Provider: Anthropic → Models: claude-3-5-sonnet, claude-3-opus
├── Provider: Mistral → Models: mistral-large, mistral-medium
└── Provider: Meta → Models: llama-3-70b

Platform: Azure AI
├── Provider: OpenAI → Models: gpt-4o, gpt-35-turbo
└── Provider: Meta → Models: llama-3-8b

Platform: Ollama (Local)
├── Provider: Meta → Models: llama3, codellama
└── Provider: Mistral → Models: mistral
```

In this codebase, you configure both the **platform** (where the model is hosted) and the **model** (which includes the provider implicitly):

```typescript
// Configure platform + model
chatService.configure({ 
  platform: 'bedrock',           // Platform: AWS Bedrock
  model: 'anthropic.claude-v2'   // Provider (Anthropic) + Model
});

chatService.configure({ 
  platform: 'azure',              // Platform: Azure AI
  model: 'gpt-4o'                 // Provider (OpenAI) + Model
});
```

**Model Naming Conventions:**
Different platforms use different naming conventions:
- **Bedrock**: Prefixes with provider name → `anthropic.claude-v2`, `mistral.mixtral-8x7b`
- **Azure/Google**: Direct model names → `gpt-4o`, `gemini-pro`
- **Ollama**: Simple names → `llama3`, `mistral`

## Project Layout

- `src/core`: Shared domain contracts (`ChatOptions`, `LLMStrategy`, `LLMFactory`).
- `src/platforms`: Platform-specific adapters and factories.
- `src/service`: Higher-level façade (`ChatService`) and a convenience builder for wiring.
- `src/registry`: Lightweight registry used to register factories at startup.
- `src/demo.ts`: Minimal script illustrating runtime switching.

## Getting Started

### Requirements

- Node.js 18+ (for native fetch support)
- TypeScript 5.3+ (for proper async iterable support)
- npm or yarn package manager

### Installation

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

### Configuration

In production environments, manage credentials using environment variables:

```typescript
// Example: Configure with environment variables
import { AnthropicClient } from '@anthropic-ai/sdk';

const client = new AnthropicClient({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const factory = new AnthropicFactory(client);
```

Configuration file example:
```json
{
  "platforms": {
    "anthropic": {
      "apiKey": "${ANTHROPIC_API_KEY}",
      "baseUrl": "https://api.anthropic.com",
      "maxRetries": 3
    },
    "azure": {
      "endpoint": "${AZURE_OPENAI_ENDPOINT}",
      "apiKey": "${AZURE_OPENAI_KEY}",
      "apiVersion": "2024-02-15-preview"
    }
  }
}
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
    try {
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
    } catch (error) {
      throw new Error(`Anthropic API call failed: ${error.message}`);
    }
  }

  async * streamMessage(prompt: string, options: ChatOptions = {}): AsyncIterable<StreamingChunk> {
    try {
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
    } catch (error) {
      throw new Error(`Anthropic streaming failed: ${error.message}`);
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
  messages = {
    create: async (request: AnthropicRequest): Promise<AnthropicResponse> => {
      await Promise.resolve();
      return {
        model: request.model,
        content: [{ text: `Anthropic response to: ${request.messages[0].content}` }],
        usage: { input_tokens: 15, output_tokens: 25 }
      };
    },
    stream: async (request: AnthropicRequest) => {
      // Mock streaming implementation
      return {
        async *[Symbol.asyncIterator]() {
          yield { type: 'content_block_delta', delta: { text: 'Mock' } };
          yield { type: 'message_stop' };
        }
      };
    }
  };
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
import { AnthropicStrategy } from './anthropic-strategy.js';

describe('AnthropicFactory', () => {
  it('creates strategy for supported models', () => {
    const factory = new AnthropicFactory();
    const strategy = factory.createClient('claude-3-5-sonnet-20241022');
    expect(strategy).toBeDefined();
    expect(strategy).toBeInstanceOf(AnthropicStrategy);
  });

  it('throws error for unsupported models', () => {
    const factory = new AnthropicFactory();
    expect(() => factory.createClient('invalid-model')).toThrow('not supported');
  });

  it('lists available models', () => {
    const factory = new AnthropicFactory();
    const models = factory.listAvailableModels();
    expect(models).toContain('claude-3-5-sonnet-20241022');
    expect(models.length).toBeGreaterThan(0);
  });

  it('sends message and returns unified response', async () => {
    const factory = new AnthropicFactory();
    const strategy = factory.createClient('claude-3-5-sonnet-20241022');
    const response = await strategy.sendMessage('Test prompt');
    
    expect(response).toHaveProperty('model');
    expect(response).toHaveProperty('content');
    expect(response).toHaveProperty('usage');
    expect(response.usage.totalTokens).toBeGreaterThan(0);
  });
});
```

### Testing Strategies

**Unit Tests**: Test strategies with mocked SDK clients
```typescript
// Mock the SDK client for isolated testing
vi.mock('../sdk-clients.js', () => ({
  AnthropicClient: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({ /* mock response */ })
    }
  }))
}));
```

**Integration Tests**: Test with real APIs (optional, separate suite)
```typescript
describe.skip('Anthropic Integration', () => {
  // Only run when ANTHROPIC_API_KEY is set
  it('calls real API', async () => {
    const client = new AnthropicClient({ apiKey: process.env.ANTHROPIC_API_KEY });
    // ... real API test
  });
});
```

**Contract Tests**: Verify all strategies return consistent response shapes
```typescript
describe('Strategy Contract', () => {
  const platforms = ['bedrock', 'azure', 'google', 'anthropic'];
  
  platforms.forEach(platform => {
    it(`${platform} returns valid ChatResponse`, async () => {
      const strategy = getStrategyForPlatform(platform);
      const response = await strategy.sendMessage('test');
      
      expect(response).toMatchObject({
        model: expect.any(String),
        content: expect.any(String),
        usage: {
          promptTokens: expect.any(Number),
          completionTokens: expect.any(Number),
          totalTokens: expect.any(Number)
        }
      });
    });
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
6. **Model Availability**: Some models are region-specific or require special access.
7. **Rate Limiting**: Implement retry logic with exponential backoff for production use.

### Error Handling Best Practices

Handle common error scenarios in your strategy implementation:

```typescript
async sendMessage(prompt: string, options: ChatOptions = {}): Promise<ChatResponse> {
  try {
    const response = await this.client.messages.create({...});
    return this.adaptResponse(response);
  } catch (error) {
    // Authentication errors
    if (error.status === 401) {
      throw new Error('Authentication failed: Invalid API key');
    }
    
    // Rate limiting
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Retry after delay.');
    }
    
    // Model not found
    if (error.status === 404) {
      throw new Error(`Model "${this.model}" not found or not accessible`);
    }
    
    // Token limit exceeded
    if (error.type === 'invalid_request_error') {
      throw new Error('Request exceeds model context window');
    }
    
    // Network/timeout errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      throw new Error('Network error: Unable to reach API endpoint');
    }
    
    // Generic fallback
    throw new Error(`API call failed: ${error.message}`);
  }
}
```

### Best Practices

- **Separation of Concerns**: Keep the strategy focused on API translation only
- **Business Logic**: Put business logic in the service layer, not adapters
- **Dependency Injection**: Use DI for SDK clients to enable testing
- **Documentation**: Document platform-specific quirks in strategy comments
- **Logging**: Add structured logging for debugging and monitoring
- **Configuration**: Make model lists and settings configurable rather than hardcoded
- **Observability**: Instrument with metrics (latency, token usage, error rates)

```typescript
// Example: Adding logging
export class AnthropicStrategy implements LLMStrategy {
  constructor(
    private readonly client: AnthropicClient,
    private readonly model: string,
    private readonly logger?: Logger
  ) {}

  async sendMessage(prompt: string, options: ChatOptions = {}): Promise<ChatResponse> {
    this.logger?.info('Sending message to Anthropic', { model: this.model });
    const startTime = Date.now();
    
    try {
      const response = await this.client.messages.create({...});
      const duration = Date.now() - startTime;
      
      this.logger?.info('Anthropic response received', {
        model: this.model,
        duration,
        tokens: response.usage.input_tokens + response.usage.output_tokens
      });
      
      return this.adaptResponse(response);
    } catch (error) {
      this.logger?.error('Anthropic API call failed', { model: this.model, error });
      throw error;
    }
  }
}
```
