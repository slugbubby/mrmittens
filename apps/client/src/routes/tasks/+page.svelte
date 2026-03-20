<!--
  Tasks list page -- intended as an OBS browser source overlay.
  Renders every task fetched by +page.server.ts from the backend API.
-->

<script>
  let { data } = $props();
</script>

{#each Object.keys(data.tasksByUser) as user}
  <div>
    <h2>{user}</h2>
    <ul>
      {#each data.tasksByUser[user] as task}
        <li>{task.text}</li>
      {/each}
    </ul>
  </div>
{/each}