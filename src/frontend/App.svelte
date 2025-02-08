<script lang="ts">
// app.css includes tailwind css dependencies that we use
import './app.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { router } from 'tinro';
import Route from './lib/Route.svelte';
import { onMount } from 'svelte';
import { getRouterState } from './api/client';
import HelloWorld from './HelloWorld.svelte';
import type { ServerInfo } from '@podman-desktop-mcp/shared';
import ChatInterface from './components/ChatInterface.svelte';
import ServerList from './components/ServerList.svelte';
import type { MCPServer } from '../types';
import Navigation from './components/Navigation.svelte';
import ServerCard from './components/ServerCard.svelte';
import ErrorDisplay from './components/ErrorDisplay.svelte';
import LoadingSpinner from './components/LoadingSpinner.svelte';

// Using our router instance, we can determine if the application has been mounted.
router.mode.hash();
let isMounted = false;

let loading = true;
let servers: ServerInfo[] = [];
let selectedServer: MCPServer | null = null;
let error: Error | null = null;

onMount(() => {
  // Load router state on application startup
  const state = getRouterState();
  router.goto(state.url);
  isMounted = true;
});

onMount(async () => {
  try {
    // TODO: Load servers from backend
    loading = false;
  } catch (e) {
    error = e instanceof Error ? e : new Error('Failed to load servers');
    loading = false;
  }
});

function handleServerSelect(event: CustomEvent<{ server: MCPServer }>) {
  selectedServer = event.detail.server;
}

function handleServerAction(event: CustomEvent<{ server: MCPServer }>) {
  // TODO: Handle server actions (connect, disconnect, delete)
}

function handleErrorDismiss() {
  error = null;
}
</script>

<!--
  This is the main application component. It is the root component of the application.
  It is responsible for rendering the application layout and routing the application to the correct page.

  For example, the main page of the application is the "HelloWorld" svelte component.$derived

  This can be expanded more by including more Route paths which the application can navigate too, for example /about, /contact etc.
-->
<Route path="/*" breadcrumb="Hello World" isAppMounted={isMounted} let:meta>
  <main class="flex flex-col w-screen h-screen overflow-hidden bg-[var(--pd-content-bg)]">
    <div class="flex flex-row w-full h-full overflow-hidden">
      <Route path="/" breadcrumb="Hello World Page">
        <HelloWorld />
      </Route>
    </div>
  </main>
</Route>

<div class="app-container">
  {#if loading}
    <div class="loading">Loading...</div>
  {:else}
    <div class="sidebar">
      <ServerList {servers} />
    </div>
    <div class="main-content">
      <ChatInterface {servers} />
    </div>
  {/if}
</div>

<main class="app">
  <Navigation {servers} selectedServer={selectedServer?.id} on:select={handleServerSelect} />
  
  <div class="content">
    {#if loading}
      <LoadingSpinner size="large" message="Loading MCP servers..." />
    {:else if servers.length === 0}
      <div class="empty-state">
        <h2>No MCP Servers Found</h2>
        <p>Add a new MCP server to get started.</p>
      </div>
    {:else}
      <div class="server-list">
        {#each servers as server (server.id)}
          <ServerCard 
            {server} 
            isSelected={selectedServer?.id === server.id}
            on:select={handleServerSelect}
            on:connect={handleServerAction}
            on:disconnect={handleServerAction}
            on:delete={handleServerAction}
          />
        {/each}
      </div>
    {/if}
  </div>

  {#if error}
    <ErrorDisplay {error} on:dismiss={handleErrorDismiss} />
  {/if}
</main>

<style>
  .app-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 1.2rem;
    color: var(--text-secondary);
  }

  .sidebar {
    width: 250px;
    border-right: 1px solid var(--border-color, #ccc);
    background: var(--background-secondary);
  }

  .main-content {
    flex: 1;
    overflow: hidden;
    background: var(--background-primary);
  }

  .app {
    display: grid;
    grid-template-columns: 250px 1fr;
    height: 100vh;
    background: var(--background-color);
    color: var(--text-color);
  }

  .content {
    padding: 2rem;
    overflow-y: auto;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    color: var(--text-color-secondary);
  }

  .empty-state h2 {
    margin: 0 0 1rem 0;
  }

  .empty-state p {
    margin: 0;
  }

  .server-list {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
</style>
