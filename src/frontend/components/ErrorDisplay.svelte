<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let error: Error | null = null;
  
  const dispatch = createEventDispatcher();

  function handleDismiss() {
    dispatch('dismiss');
  }
</script>

{#if error}
  <div class="error-container" role="alert">
    <div class="error-content">
      <span class="error-message">{error.message}</span>
      <button class="dismiss-button" on:click={handleDismiss}>
        ✕
      </button>
    </div>
  </div>
{/if}

<style>
  .error-container {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    background: var(--error-color);
    color: white;
    padding: 1rem;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    max-width: 400px;
  }

  .error-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .error-message {
    flex: 1;
    margin-right: 1rem;
  }

  .dismiss-button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0;
    opacity: 0.8;
    transition: opacity 0.2s;
  }

  .dismiss-button:hover {
    opacity: 1;
  }
</style> 