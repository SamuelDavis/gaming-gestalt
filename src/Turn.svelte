<script lang="ts">
  import { derived, readable, writable } from "svelte/store";
  import { persistent } from "./util";

  type Entity = {
    name: string;
    speed: number;
  };

  const turn = persistent("turn-number", writable(1));
  const projection = persistent("turn-projection", writable(10));
  const entities = readable<Entity[]>([
    { name: "Foo", speed: 0.3 },
    { name: "Bar", speed: 0.2 },
    { name: "Qux", speed: 0.1 },
  ]);
  const turns = derived(
    [turn, projection, entities],
    ([turn, projection, entities]) => {
      const turns: Entity[] = [];
      const speed = new Float32Array(entities.length);
      for (let tid = 0; tid < turn + projection; tid++) {
        for (let eid = 0; eid < entities.length; eid++) {
          speed[eid] += entities[eid].speed;
          if (speed[eid] < 1) continue;
          speed[eid] -= 1;
          if (tid >= turn) turns.push(entities[eid]);
        }
      }
      return turns;
    }
  );
</script>

<main>
  <aside>
    <form on:submit|preventDefault>
      <fieldset>
        <legend>Controls</legend>
        <label>
          turn <input bind:value={$turn} min="1" type="number" />
        </label>
        <label>
          projection <input bind:value={$projection} min="1" type="number" />
        </label>
      </fieldset>
    </form>
  </aside>
  <article>
    <ol>
      {#each $turns as entity}
        <li>
          ({entity.speed}) {entity.name}
        </li>
      {/each}
    </ol>
  </article>
</main>

<style lang="css">
  form {
    width: fit-content;
  }

  label {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1em;
  }

  ol {
    display: flex;
    gap: 2em;
    flex-wrap: wrap;
  }
</style>
