<script lang="ts">
import { errors } from '/@/stores/errors';
import { studioClient } from '/@/utils/client';

async function acknowledgeError(id: string): Promise<void> {
  await studioClient.acknowledgeError(id);
}

// Sort errors by timestamp before displaying
$: sortedErrors = [...$errors].sort((a, b) => b.timestamp - a.timestamp);
</script>

{#if $errors.length > 0}
  <div class="error-container">
    {#each sortedErrors as error}
      <div class="error-message {error.acknowledged ? 'acknowledged' : ''}" role="alert">
        <div class="error-content">
          <span class="error-text">{error.message}</span>
          {#if error.source}
            <span class="error-source">Source: {error.source}</span>
          {/if}
          <span class="error-time">{new Date(error.timestamp).toLocaleString()}</span>
        </div>
        {#if !error.acknowledged}
          <button 
            class="acknowledge-button"
            on:click={() => acknowledgeError(error.id)}
            aria-label="Acknowledge error">
            Acknowledge
          </button>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
.error-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
}

.error-message {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--pf-global--palette--red-50);
  border: 1px solid var(--pf-global--palette--red-100);
  border-radius: 4px;
}

.error-message.acknowledged {
  background-color: var(--pf-global--palette--black-150);
  border-color: var(--pf-global--palette--black-300);
}

.error-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.error-text {
  font-weight: 500;
  color: var(--pf-global--palette--red-200);
}

.acknowledged .error-text {
  color: var(--pf-global--palette--black-600);
}

.error-source {
  font-size: 0.875rem;
  color: var(--pf-global--palette--black-600);
}

.error-time {
  font-size: 0.75rem;
  color: var(--pf-global--palette--black-500);
}

.acknowledge-button {
  padding: 0.5rem 1rem;
  background-color: var(--pf-global--palette--red-100);
  border: 1px solid var(--pf-global--palette--red-200);
  border-radius: 4px;
  color: var(--pf-global--palette--red-200);
  cursor: pointer;
  transition: all 0.2s ease;
}

.acknowledge-button:hover {
  background-color: var(--pf-global--palette--red-200);
  color: white;
}
</style> 