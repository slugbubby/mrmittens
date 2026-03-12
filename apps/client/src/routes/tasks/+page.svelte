<script>
  let { data } = $props();
</script>

{#each data.tasks as task}
  <div>
    <h2>{task.userId}</h2>
    <p>{task.text}</p>
  </div>
{/each}