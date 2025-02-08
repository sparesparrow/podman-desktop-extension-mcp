<script lang="ts">
  import type { ServerInfo } from '@podman-desktop-mcp/shared';
  import { mcpStore } from '../stores/mcpStore';
  import { showError } from '@podman-desktop/api';

  export let servers: ServerInfo[] = [];

  async function handleServerAction(serverName: string, action: 'start'|'stop'|'remove') {
    try {
      await mcpStore.dispatchServerAction(serverName, action);
    } catch (error) {
      showError(`Server ${action} failed: ${error.message}`);
    }
  }
</script>

<div class="server-list">
  <div class="header">
    <h2>MCP Servers</h2>
    <button class="add-button" on:click={() => window.postMessage({ type: 'add-server' }, '*')}>
      Add Server
    </button>
  </div>
  
  {#if servers.length === 0}
    <div class="empty-state">
      No servers configured
    </div>
  {:else}
    {#each servers as server}
      <div class="server-item">
        <div class="server-info">
          <span class="server-name">{server.name}</span>
          <StatusIndicator status={server.status} />
        </div>
        <div class="server-actions">
          {#if server.status === 'RUNNING'}
            <ActionButton 
              icon="stop" 
              on:click={() => handleServerAction(server.name, 'stop')}
            />
          {:else}
            <ActionButton
              icon="start" 
              on:click={() => handleServerAction(server.name, 'start')}
            />
          {/if}
          <ActionButton
            icon="delete"
            variant="danger"
            on:click={() => handleServerAction(server.name, 'remove')} 
          />
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .server-list {
    padding: 1rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  h2 {
    margin: 0;
    font-size: 1.2rem;
    color: var(--text-primary);
  }

  .add-button {
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
  }

  .server-item {
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }

  .server-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .server-name {
    font-weight: 500;
    color: var(--text-primary);
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--status-inactive, #ccc);
  }

  .status-indicator.active {
    background: var(--status-active, #28a745);
  }

  .server-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-button {
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .action-button.start {
    background: var(--success-color, #28a745);
    color: white;
  }

  .action-button.stop {
    background: var(--warning-color, #ffc107);
    color: black;
  }

  .action-button.remove {
    background: var(--danger-color, #dc3545);
    color: white;
  }
</style> 