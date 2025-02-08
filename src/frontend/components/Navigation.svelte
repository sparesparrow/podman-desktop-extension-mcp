<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MCPServerStatus } from '../../types/mcp-types';

  export let servers: MCPServerStatus[] = [];
  export let selectedServer: string | null = null;

  const dispatch = createEventDispatcher();

  function handleServerSelect(serverName: string) {
    selectedServer = serverName;
    dispatch('select', { serverName });
  }
</script>

<nav class="navigation">
  <h2>MCP Servers</h2>
  <ul class="server-list">
    {#each servers as server}
      <li 
        class="server-item" 
        class:selected={selectedServer === server.name}
        on:click={() => handleServerSelect(server.name)}
      >
        <span class="server-name">{server.name}</span>
        <span class="server-status status-{server.containerStatus.toLowerCase()}">{server.containerStatus}</span>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .navigation {
    padding: 1rem;
    background: var(--background-color);
    border-right: 1px solid var(--border-color);
  }

  h2 {
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
    color: var(--text-color);
  }

  .server-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .server-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .server-item:hover {
    background: var(--hover-color);
  }

  .server-item.selected {
    background: var(--selected-color);
  }

  .server-name {
    font-weight: 500;
  }

  .server-status {
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
  }

  .status-running {
    background: var(--success-color);
    color: white;
  }

  .status-stopped {
    background: var(--error-color);
    color: white;
  }

  .status-starting {
    background: var(--warning-color);
    color: black;
  }

  .status-stopping {
    background: var(--warning-color);
    color: black;
  }
</style> 