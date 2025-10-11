/**
 * Purpose:
 * - Registers platform factories with the central LLMRegistry. 
 * - Enables runtime platform switching by making all supported platforms available.
 * - Called during application bootstrap (as seen in demo.ts)
 */

import { llmRegistry } from '../registry/llm-registry.js';
import { AzureFactory } from './azure/azure-factory.js';
import { BedrockFactory } from './bedrock/bedrock-factory.js';
import { GoogleFactory } from './google/google-factory.js';
import { OllamaFactory } from './ollama/ollama-factory.js';

export function registerDefaultFactories(): void {
    llmRegistry.register('bedrock', new BedrockFactory());
    llmRegistry.register('azure', new AzureFactory());
    llmRegistry.register('google', new GoogleFactory());
    llmRegistry.register('ollama', new OllamaFactory());
}
