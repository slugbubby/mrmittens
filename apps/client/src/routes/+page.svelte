<svelte:head>
  <title>Mr. Mittens</title>
</svelte:head>

<section class="hero">
  <p class="eyebrow">Coworking stream helper</p>
  <h1>Mr. Mittens keeps Twitch tasks moving.</h1>
  <p class="lede">
    Chat adds work with <code>!task</code>, clears it with <code>!done</code>, and the
    browser source at <code>/tasks</code> keeps the board stream-ready for OBS.
  </p>
</section>

<style>
  :global(body) {
    margin: 0;
    min-height: 100vh;
    font-family: 'Segoe UI', 'Trebuchet MS', sans-serif;
    background:
      radial-gradient(circle at top, rgba(255, 197, 88, 0.28), transparent 42%),
      linear-gradient(160deg, #0b1320, #112328 68%, #15323a);
    color: #f7f4ee;
  }

  .hero {
    min-height: 100vh;
    display: grid;
    place-content: center;
    gap: 1rem;
    padding: 2rem;
    box-sizing: border-box;
    max-width: 56rem;
  }

  .eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #f2b562;
    font-size: 0.78rem;
  }

  h1 {
    margin: 0;
    font-size: clamp(2.5rem, 6vw, 5rem);
    line-height: 0.98;
  }

  .lede {
    margin: 0;
    max-width: 40rem;
    font-size: 1.1rem;
    line-height: 1.6;
    color: rgba(247, 244, 238, 0.88);
  }

  code {
    font-family: 'Consolas', 'Courier New', monospace;
    color: #ffe29f;
  }
</style>
