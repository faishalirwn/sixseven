<script lang="ts">
  import { Crown, RotateCw } from "lucide-svelte";
  import type { Member, MemberStatus } from "@mutsu/protocol";
  import type { RoomClient } from "../lib/room.svelte";

  interface Props {
    room: RoomClient;
    /** Where the room clock is now (projected) — to show each viewer's drift. */
    roomNow: number | null;
    /** Self-resync (one-way) — offered on your own row when you've drifted. */
    onResync: () => void;
    onInvite: () => void;
  }
  const { room, roomNow, onResync, onInvite }: Props = $props();

  // Beyond this (s) a member reads as out of sync. Generous, because a member's
  // reported position is sampled up to ~2s ago — small gaps aren't real drift.
  const OUT_OF_SYNC_S = 6;

  const statusLabel: Record<MemberStatus, string> = {
    loading: "loading",
    ready: "watching",
    stalled: "buffering",
    failed: "failed",
  };

  function canSkip(status: MemberStatus): boolean {
    return room.canControl && (status === "stalled" || status === "failed");
  }

  function fmtPos(t: number): string {
    const s = Math.max(0, Math.floor(t));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const mm = h ? String(m).padStart(2, "0") : String(m);
    return `${h ? `${h}:` : ""}${mm}:${String(sec).padStart(2, "0")}`;
  }

  /** Signed drift (s, + = ahead of the room), or null if not comparable. */
  function driftOf(m: Member): number | null {
    if (m.time == null || roomNow == null || m.status !== "ready") return null;
    return m.time - roomNow;
  }
</script>

<section>
  <h2>Members <span class="count">{room.members.length}</span></h2>
  <ul>
    {#each room.members as m (m.id)}
      {@const drift = driftOf(m)}
      {@const outOfSync = drift !== null && Math.abs(drift) > OUT_OF_SYNC_S}
      <li>
        <span class="dot {m.status}"></span>
        <span class="name">
          {m.name}{#if m.id === room.self}<span class="you"> (you)</span>{/if}
          {#if room.sync?.hostId === m.id}<span class="host" title="host"><Crown size={13} fill="currentColor" /></span>{/if}
        </span>
        {#if m.time != null && m.status === "ready"}
          {#if outOfSync}
            <span class="drift" title="Out of sync with the room">
              {Math.abs(Math.round(drift ?? 0))}s {drift! > 0 ? "ahead" : "behind"}
            </span>
          {:else}
            <span class="pos" title="Playback position">{fmtPos(m.time)}</span>
          {/if}
        {:else}
          <span class="status {m.status}">{statusLabel[m.status]}</span>
        {/if}
        {#if m.id === room.self && outOfSync}
          <button class="resync" onclick={onResync} title="Resync me to the room">
            <RotateCw size={12} /> resync
          </button>
        {/if}
        {#if canSkip(m.status)}
          <button class="skip" onclick={() => room.skip(m.id)}>skip</button>
        {/if}
        {#if room.sync?.mode === "host" && room.sync?.hostId === room.self && m.id !== room.self}
          <button class="skip" onclick={() => room.passControl(m.id)}>give host</button>
        {/if}
      </li>
    {/each}
  </ul>

  {#if room.members.length <= 1}
    <div class="solo">
      <p>It's just you here.</p>
      <button class="invite" onclick={onInvite}>Copy invite link</button>
    </div>
  {/if}
</section>

<style>
  section {
    padding: 12px;
    border-bottom: 1px solid var(--line);
  }
  h2 {
    margin: 0 0 8px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--muted);
  }
  .count {
    color: var(--text);
  }
  .solo {
    margin-top: 10px;
    padding: 10px;
    border: 1px dashed var(--line);
    border-radius: 10px;
    text-align: center;
  }
  .solo p {
    margin: 0 0 8px;
    color: var(--muted);
    font-size: 12px;
  }
  .invite {
    width: 100%;
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
    font-weight: 600;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  li {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .you {
    color: var(--muted);
  }
  .host {
    color: var(--accent);
    display: inline-flex;
    vertical-align: middle;
    line-height: 0;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--muted);
    flex: none;
  }
  .dot.ready {
    background: var(--good);
  }
  .dot.stalled {
    background: var(--warn);
  }
  .dot.failed {
    background: var(--bad);
  }
  .status {
    font-size: 11px;
    color: var(--muted);
  }
  .status.failed {
    color: var(--bad);
  }
  .pos {
    font-size: 11px;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
  .drift {
    font-size: 11px;
    font-weight: 600;
    color: #000;
    background: var(--warn);
    border-radius: 999px;
    padding: 1px 7px;
    white-space: nowrap;
  }
  .resync {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 8px;
    font-size: 11px;
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }
  .skip {
    padding: 2px 8px;
    font-size: 11px;
  }
</style>
