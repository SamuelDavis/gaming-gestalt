<script lang="ts">
  import alea from "alea";
  import { derived, type Writable, writable } from "svelte/store";
  import { createNoise2D } from "simplex-noise";

  const seed = persistent("map-seed", writable(Math.random().toString(32)));
  const values = persistent("map-values", writable(5));
  const mapWidth = persistent("map-width", writable(10));
  const mapHeight = persistent("map-height", writable(10));
  const x = persistent("map-x", writable(0));
  const y = persistent("map-y", writable(0));
  const getHeight = derived([values, seed], ([values, seed]) => {
    const cache = new Map<string, number>();
    const noise = createNoise2D(alea(seed));
    return function (x: number, y: number) {
      const key = `${x},${y}`;
      if (cache.has(key)) return cache.get(key)!;
      const value = ((noise) => {
        return Math.floor(values * noise) / values;
      })(noise(x, y) + 1 / 2);
      cache.set(key, value);
      return value;
    };
  });

  function persistent<T = any>(key: string, store: Writable<T>) {
    const local = localStorage.getItem(key);
    if (local !== null) store.set(JSON.parse(local));
    store.subscribe((value) =>
      localStorage.setItem(key, JSON.stringify(value))
    );
    return store;
  }

  function onChangeSeed() {
    const newSeed = prompt("seed") ?? "";
    if (newSeed) seed.set(newSeed);
  }

  const mouseDragPosition = writable<{
    mouse: MouseEvent;
    coordinates: [number, number];
  }>(null);

  function onDragStart(mouse: MouseEvent) {
    mouseDragPosition.set({
      mouse,
      coordinates: [$x, $y],
    });
  }

  function onDrag(drag: MouseEvent) {
    const start = $mouseDragPosition;
    if (start === null) return null;
    const {
      mouse,
      coordinates: [cx, cy],
    } = start;
    const { clientX: x1, clientY: y1 } = mouse;
    const { clientX: x2, clientY: y2 } = drag;
    const dcX = x2 - x1;
    const dcY = y2 - y1;
    const scale = parseInt(
      window.getComputedStyle(document.querySelector("li")).width
    );
    const dX = Math.floor(dcX / scale);
    const dY = Math.floor(dcY / scale);
    x.set(cx - dX);
    y.set(cy - dY);
  }

  function onDragEnd(e: MouseEvent) {
    mouseDragPosition.set(null);
  }
</script>

<svelte:window on:mousemove={onDrag} on:mouseup={onDragEnd} />
<main>
  <aside>
    <form on:submit|preventDefault>
      <fieldset>
        <legend>Controls</legend>
        <label>
          <span>
            seed
            <button on:click={onChangeSeed}>update</button>
          </span>
          <input disabled type="text" value={$seed} />
        </label>
        <label>
          values <input bind:value={$values} min="1" type="number" />
        </label>
        <label>
          width <input bind:value={$mapWidth} min="1" type="number" />
        </label>
        <label>
          height <input bind:value={$mapHeight} min="1" type="number" />
        </label>
        <label>
          coordinates
          <span>
            <input bind:value={$x} type="number" />
            <input bind:value={$y} type="number" />
          </span>
        </label>
      </fieldset>
    </form>
  </aside>
  <article on:mousedown={onDragStart}>
    <ol style:--height={$mapHeight} style:--width={$mapWidth}>
      {#each new Array($mapHeight) as _, j (j)}
        {#each new Array($mapWidth) as _, i (i)}
          <li
            style:--height={$getHeight(i + $x, j + $y)}
            title={$getHeight(i + $x, j + $y)}
          />
        {/each}
      {/each}
    </ol>
  </article>
</main>

<style lang="css">
  main {
    display: flex;
    flex-direction: column;
    gap: 1em;
    margin: 1em;
  }

  form {
    width: fit-content;
  }

  label {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1em;
  }

  label span {
    display: flex;
    justify-content: space-between;
    gap: 0.25em;
  }

  label span input {
    max-width: 10ch;
  }

  ol {
    --width: 1;
    --height: 1;
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(var(--width), 1em);
    grid-template-rows: repeat(var(--height), 1em);
  }

  ol li {
    --height: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    filter: brightness(var(--height));
    background-color: white;
  }
</style>
