/**
 * Minimal executable showcasing runtime switching between platforms. In real
 * usage you would replace console logging with your web socket or HTTP layer.
 */

import { registerDefaultFactories } from './platforms/register.js';
import { ChatService } from './service/chat-service.js';

async function runDemo() {
    registerDefaultFactories();
    const chatService = new ChatService();

    chatService.configure({ platform: 'bedrock', model: 'anthropic.claude-v2' });
    const bedrockResponse = await chatService.send('Explain strategy pattern.');
    console.log('[Bedrock]', bedrockResponse.content);

    chatService.configure({ platform: 'azure', model: 'gpt-35-turbo' });
    const azureResponse = await chatService.send('Explain abstract factory pattern.');
    console.log('[Azure]', azureResponse.content);

    chatService.configure({ platform: 'google', model: 'gemini-pro' });
    const googleResponse = await chatService.send('Explain adapter pattern.');
    console.log('[Google]', googleResponse.content);
}

runDemo().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
