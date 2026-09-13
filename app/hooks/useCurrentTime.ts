import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const timer = setInterval(callback, 1000);
  return () => clearInterval(timer);
}

function getSnapshot() {
  return new Date().toLocaleTimeString();
}

function getServerSnapshot() {
  return null; // no "real" time available during SSR
}

function getTimezoneSnapshot() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function getServerTimezoneSnapshot() {
  return null;
}

export function useCurrentTime() {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const timezone = useSyncExternalStore(subscribe, getTimezoneSnapshot, getServerTimezoneSnapshot);

  return { time, timezone };
}