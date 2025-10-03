/**
 * Ollama factory enabling local model selection at runtime.
 */

import type { LLMFactory } from '../../core/llm-factory.js';
import type { LLMStrategy } from '../../core/llm-strategy.js';
import { OllamaClient } from '../sdk-clients.js';
import { OllamaStrategy } from './ollama-strategy.js';

const SUPPORTED_MODELS = Object.freeze([
    'llama3',
    'mistral',
    'codellama'
]);

export class OllamaFactory implements LLMFactory {
    constructor(private readonly client: OllamaClient = new OllamaClient()) { }

    createClient(model: string): LLMStrategy {
        if (!SUPPORTED_MODELS.includes(model)) {
            throw new Error(`Ollama model "${model}" is not available.`);
        }
        return new OllamaStrategy(this.client, model);
    }

    listAvailableModels(): readonly string[] {
        return SUPPORTED_MODELS;
    }
}
