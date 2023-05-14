<script lang="ts">
  import Map from "./Map.svelte";
  import Turn from "./Turn.svelte";
  import { derived, writable } from "svelte/store";
  import type Component from "svelte/types/compiler/compile/Component";

  const routes = {
    turn: Turn,
    map: Map,
  };
  const path = writable(window.location.hash.slice(1));
  const component = derived([path], ([path]) => routes[path] ?? null);
  $: Component = routes[path];

  window.addEventListener("hashchange", () => {
    $path = window.location.hash.slice(1);
  });
</script>

<header>
  <nav>
    <ul>
      {#each Object.keys(routes) as name}
        <li>
          <a class:active={$path === name} href={`#${name}`}>{name}</a>
        </li>
      {/each}
    </ul>
  </nav>
</header>
<hr />

{#if $component}
  <svelte:component this={$component} />
{/if}

<style lang="css">
  :global(main) {
    margin: 1em;
  }

  nav {
    margin: 1em;
  }

  nav ul {
    display: flex;
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  nav a.active {
    font-weight: bold;
  }

  nav li {
    padding: 0;
  }

  nav li:not(:last-child):after {
    content: "|";
    margin: 0.5em;
  }
</style>
