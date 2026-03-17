<!--
  Tasks list page -- intended as an OBS browser source overlay.
  Renders every task fetched by +page.server.ts from the backend API.
-->

<script>
  let { data } = $props();
</script>

{#each data.tasks as task}
  <div>
    <h2>{task.userId}</h2>
    <p>{task.text}</p>
  </div>
{/each}