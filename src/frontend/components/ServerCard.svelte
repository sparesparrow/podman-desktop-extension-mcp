<script lang="ts">
  import type { MCPServer } from '../../types';
  import { createEventDispatcher } from 'svelte';

  export let server: MCPServer;
  export let isSelected: boolean = false;

  const dispatch = createEventDispatcher();

  function handleSelect() {
    dispatch('select', { server });
  }

  function handleConnect() {
    dispatch('connect', { server });
  }

  function handleDisconnect() {
    dispatch('disconnect', { server });
  }

  function handleDelete() {
    dispatch('delete', { server });
  }
</script>

<div class="server-card" class:selected={isSelected} on:click={handleSelect}>
  <div class="server-info">
    <h3 class="server-name">{server.name}</h3>
    <span class="server-status" class:connected={server.status === 'connected'}>
      {server.status}
    </span>
  </div>
  <div class="server-details">
    <p class="server-url">{server.url}</p>
    {#if server.description}
      <p class="server-description">{server.description}</p>
    {/if}
  </div>
  <div class="server-actions">
    {#if server.status === 'connected'}
      <button class="action-button disconnect" on:click|stopPropagation={handleDisconnect}>
        Disconnect
      </button>
    {:else}
      <button class="action-button connect" on:click|stopPropagation={handleConnect}>
        Connect
      </button>
    {/if}
    <button class="action-button delete" on:click|stopPropagation={handleDelete}>
      Delete
    </button>
  </div>
</div>

<style>
  .server-card {
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .server-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .server-card.selected {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--accent-color-alpha);
  }

  .server-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .server-name {
    margin: 0;
    font-size: 1.2rem;
    color: var(--text-color);
  }

  .server-status {
    font-size: 0.9rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background: var(--error-color);
    color: white;
  }

  .server-status.connected {
    background: var(--success-color);
  }

  .server-details {
    margin-bottom: 1rem;
  }

  .server-url {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-color-secondary);
  }

  .server-description {
    margin: 0.5rem 0 0;
    font-size: 0.9rem;
    color: var(--text-color-secondary);
  }

  .server-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .action-button:hover {
    opacity: 0.8;
  }

  .connect {
    background: var(--accent-color);
    color: white;
  }

  .disconnect {
    background: var(--warning-color);
    color: white;
  }

  .delete {
    background: var(--error-color);
    color: white;
  }
</style> 