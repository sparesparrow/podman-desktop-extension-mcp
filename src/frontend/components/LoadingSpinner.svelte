<script lang="ts">
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let message: string = 'Loading...';
</script>

<div class="spinner-container" class:small={size === 'small'} class:large={size === 'large'}>
  <div class="spinner"></div>
  {#if message}
    <span class="message">{message}</span>
  {/if}
</div>

<style>
  .spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--accent-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .small .spinner {
    width: 24px;
    height: 24px;
    border-width: 3px;
  }

  .large .spinner {
    width: 64px;
    height: 64px;
    border-width: 5px;
  }

  .message {
    color: var(--text-color);
    font-size: 0.9rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style> 