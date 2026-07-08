<script lang="ts">
  import type { RoomClient } from "../lib/room.svelte";
  import { describeLog, fmtLogTime } from "../lib/activity";

  interface Props {
    room: RoomClient;
  }
  const { room }: Props = $props();
</script>

<section>
  <h2>Activity</h2>
  <ul>
    {#each room.log.slice(-40).reverse() as e (e.id)}
      <li>
        <time datetime={new Date(e.at).toISOString()}>{fmtLogTime(e.at)}</time>
        <span>{describeLog(e, room.members)}</span>
      </li>
    {/each}
    {#if room.log.length === 0}
      <li class="muted">No activity yet.</li>
    {/if}
  </ul>
</section>

<style>
  section {
    padding: 12px;
    flex: 1;
    min-height: 0;
    overflow: auto;
  }
  h2 {
    margin: 0 0 8px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--muted);
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  li {
    display: flex;
    gap: 8px;
    font-size: 12px;
    color: var(--text);
  }
  time {
    flex: none;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
    font-size: 11px;
    padding-top: 1px;
  }
  .muted {
    color: var(--muted);
  }
</style>
