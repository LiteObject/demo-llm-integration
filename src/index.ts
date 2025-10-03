/**
 * Public entry point for the demo library. Re-exports the key types and
 * helpers so consuming code can adopt the Strategy + Abstract Factory + Adapter
 * architecture demonstrated in this repository.
 */

export type { ChatOptions, ChatResponse, StreamingChunk } from './core/chat-types.js';
export type { LLMStrategy } from './core/llm-strategy.js';
export type { LLMFactory } from './core/llm-factory.js';
export { llmRegistry } from './registry/llm-registry.js';
export { ChatService } from './service/chat-service.js';
export { LLMClientBuilder } from './service/llm-client-builder.js';
export { registerDefaultFactories } from './platforms/register.js';
