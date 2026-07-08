/**
 * Activity-log formatting — one source of truth for turning a `LogEvent` into a
 * human line, shared by the web sidebar (`ActivityLog.svelte`) and the pushed-down
 * activity feed in the `site` in-tab widget (via the bridge). Keeping it here means
 * both surfaces read events identically.
 */

import type { LogEvent, Member, MemberId } from "@mutsu/protocol";

function nameOf(members: Member[], id: MemberId | undefined): string {
  if (!id) return "someone";
  return members.find((m) => m.id === id)?.name ?? "someone";
}

/** Short, human label for a source URL: host + a trimmed path so two titles on the
 *  same site (e.g. netflix.com/81…) read differently. */
export function sourceLabel(url: string | undefined): string {
  if (!url) return "a new source";
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "");
    const label = `${u.host}${path}`;
    return label.length > 48 ? `${label.slice(0, 47)}…` : label;
  } catch {
    return url.slice(0, 40);
  }
}

export function describeLog(e: LogEvent, members: Member[]): string {
  const who = (id: MemberId | undefined) => nameOf(members, id);
  switch (e.kind) {
    case "joined":
      return `${e.detail ?? who(e.actor)} joined`;
    case "left":
      return `${e.detail ?? who(e.actor)} left`;
    case "setSource":
      return `${who(e.actor)} set the source → ${sourceLabel(e.detail)}`;
    case "played":
      return `${who(e.actor)} pressed play`;
    case "paused":
      return `${who(e.actor)} pressed pause`;
    case "seeked":
      return `${who(e.actor)} seeked to ${e.detail ?? "?"}`;
    case "skipped":
      return `${who(e.actor)} skipped ${who(e.target)}`;
    case "autoSkipped":
      return `${who(e.target)} was auto-skipped (stalled 25s)`;
    case "tookControl":
      return `${who(e.actor)} took control`;
    case "passedControl":
      return `${who(e.actor)} gave host to ${who(e.target)}`;
    case "modeChanged":
      return `mode → ${e.detail}`;
    case "hostPromoted":
      return `${who(e.target)} promoted to host`;
    default:
      return e.kind;
  }
}

/** Local HH:MM for a log event's server timestamp. */
export function fmtLogTime(at: number): string {
  return new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
