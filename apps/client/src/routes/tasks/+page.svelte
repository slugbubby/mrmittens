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