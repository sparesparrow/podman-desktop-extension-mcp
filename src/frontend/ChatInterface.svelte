<script lang="ts">
  import { onMount } from 'svelte';
  import type { ServerInfo } from '@podman-desktop-mcp/shared';
  import { mcpClient } from '../api/mcpClient';
  import type { MCPServer } from '@podman-desktop-mcp/shared';

  export let servers: ServerInfo[] = [];

  let loading = true;
  let inputMessage = '';
  let chatHistory: string[] = [];
  let chatContainer: HTMLElement;

  onMount(async () => {
    try {
      loading = false;
      scrollToBottom();
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      loading = false;
    }
  });

  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  async function sendMessage() {
    const response = await mcpClient.sendRequest({
      type: 'mcp.prompt',
      content: inputMessage,
      context: {
        server: selectedServer,
        resources: currentResources
      }
    });
    
    chatHistory = [...chatHistory, {
      role: 'assistant',
      content: response.content,
      timestamp: new Date()
    }];
  }

  // Listen for responses from the backend
  window.addEventListener('message', (event) => {
    if (event.data.type === 'message-response') {
      chatHistory = [...chatHistory, `Assistant: ${event.data.message}`];
      setTimeout(scrollToBottom, 0);
    }
  });
</script>

<div class="chat-container" bind:this={chatContainer}>
  {#if loading}
    <div class="loading">Loading...</div>
  {:else}
    <div class="chat-history">
      {#each chatHistory as message}
        <div class="message">{message}</div>
      {/each}
    </div>
    <div class="input-container">
      <textarea
        bind:value={inputMessage}
        on:keypress={handleKeyPress}
        placeholder="Type your message..."
      />
      <button on:click={sendMessage}>Send</button>
    </div>
  {/if}
</div>

<style>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 1.2rem;
    color: var(--text-secondary);
  }

  .chat-history {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 1rem;
  }

  .message {
    margin: 0.5rem 0;
    padding: 0.5rem;
    border-radius: 4px;
    background: var(--background-secondary);
  }

  .input-container {
    display: flex;
    gap: 0.5rem;
  }

  textarea {
    flex: 1;
    min-height: 60px;
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    resize: vertical;
    background: var(--background-secondary);
    color: var(--text-primary);
  }

  button {
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    opacity: 0.9;
  }
</style> 