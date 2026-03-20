<script lang="ts">
  import type { TasksOverlayResponse } from '@mrmittens/shared';

  // Keep the page prop shape explicit so future-us does not have to squint at inferred types
  // and wonder which past version of ourselves committed that particular crime.
  let { data }: { data: { overlay: TasksOverlayResponse } } = $props();
</script>

<svelte:head>
  <title>Mr. Mittens Task Board</title>
</svelte:head>

<div class="board-shell">
  <section class="board">
    <header class="board-header">
      <div>
        <p class="eyebrow">OBS browser source</p>
        <h1>Stream Tasks</h1>
      </div>
      <div class="meta">
        <span>{data.overlay.tasks.length} open</span>
        <span>Updated {new Date(data.overlay.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </header>

    {#if data.overlay.groups.length === 0}
      <div class="empty-state">
        <p class="empty-kicker">No tasks yet</p>
        <p>Chat can add work with <code>!task &lt;what to do&gt;</code>.</p>
      </div>
    {:else}
      <div class="groups">
        {#each data.overlay.groups as group}
          <section class="group-card">
            <header class="group-header">
              <div>
                <p class="group-name">{group.user.displayName}</p>
                <p class="group-handle">@{group.user.twitchUsername}</p>
              </div>
              <span class="group-count">{group.tasks.length}</span>
            </header>

            <ol class="task-list">
              {#each group.tasks as task}
                <li class="task-row">
                  <span class="task-number">#{task.displayNumber}</span>
                  <span class="task-text">{task.text}</span>
                </li>
              {/each}
            </ol>
          </section>
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  :global(body) {
    margin: 0;
    min-height: 100vh;
    font-family: 'Segoe UI', 'Trebuchet MS', sans-serif;
    background:
      radial-gradient(circle at top, rgba(255, 205, 96, 0.28), transparent 42%),
      linear-gradient(160deg, rgba(10, 18, 30, 0.92), rgba(22, 43, 47, 0.88));
    color: #f5f2e8;
  }

  .board-shell {
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    display: flex;
    align-items: stretch;
  }

  .board {
    width: 100%;
    border: 1px solid rgba(255, 236, 201, 0.18);
    border-radius: 28px;
    background: rgba(8, 16, 26, 0.74);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(18px);
    padding: 1.5rem;
  }

  .board-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: end;
    margin-bottom: 1.5rem;
  }

  .eyebrow,
  .group-handle,
  .empty-kicker {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #f2b562;
    font-size: 0.72rem;
  }

  h1,
  .group-name {
    margin: 0;
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  h1 {
    font-size: clamp(2rem, 4vw, 3.4rem);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    justify-content: end;
  }

  .meta span,
  .group-count,
  .task-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .meta span,
  .group-count {
    padding: 0.45rem 0.8rem;
    color: #d7ddd4;
  }

  .groups {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
  }

  .group-card,
  .empty-state {
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 1rem;
  }

  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .task-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.75rem;
  }

  .task-row {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.75rem;
    align-items: start;
  }

  .task-number {
    min-width: 3.25rem;
    padding: 0.45rem 0.7rem;
    color: #ffe5a7;
    font-weight: 700;
  }

  .task-text {
    color: #f5f2e8;
    line-height: 1.45;
    font-size: 1.03rem;
  }

  .empty-state {
    min-height: 14rem;
    display: grid;
    place-content: center;
    text-align: center;
  }

  code {
    font-family: 'Consolas', 'Courier New', monospace;
    color: #ffe5a7;
  }

  @media (max-width: 700px) {
    .board-shell {
      padding: 1rem;
    }

    .board-header {
      align-items: start;
      flex-direction: column;
    }

    .meta {
      justify-content: start;
    }
  }
</style>
