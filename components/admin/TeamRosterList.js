"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { reorderPartners } from "../../app/(dashboard)/actions/contentActions";

export default function TeamRosterList({ partners }) {
  const [items, setItems] = useState(Array.isArray(partners) ? partners : []);
  const [draggingId, setDraggingId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();
  const statusTimerRef = useRef(null);
  const instructionsId = useId();

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setItems(Array.isArray(partners) ? partners : []);
    });
    return () => cancelAnimationFrame(frameId);
  }, [partners]);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }
    };
  }, []);

  const resetStatusAfterDelay = () => {
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
    }
    statusTimerRef.current = setTimeout(() => setStatus("idle"), 3000);
  };

  const handleDragStart = (event, id) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  };

  const handleDragEnd = () => setDraggingId(null);

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event, targetId) => {
    event.preventDefault();
    const sourceId = draggingId || event.dataTransfer.getData("text/plain");
    if (!sourceId) {
      return;
    }
    const isSameTarget = targetId && sourceId === targetId;
    if (isSameTarget) {
      setDraggingId(null);
      return;
    }
    const placeAfter = Boolean(targetId) && isDroppingAfter(event);
    setDraggingId(null);
    const nextItems = movePartner(items, sourceId, targetId, placeAfter);
    persistOrder(nextItems);
  };

  const persistOrder = (nextItems) => {
    if (!Array.isArray(nextItems)) {
      return;
    }
    const previousItems = items;
    const normalized = nextItems.map((item, index) => ({ ...item, order_index: index }));
    const changed = normalized.some((item, index) => item?.id !== previousItems[index]?.id);
    if (!changed) {
      return;
    }
    setItems(normalized);
    setStatus("saving");
    setError(null);
    startTransition(async () => {
      const payload = normalized.map(({ id, order_index }) => ({ id, order_index }));
      const response = await reorderPartners(payload);
      if (!response?.success) {
        setItems(previousItems);
        setStatus("error");
        setError(response?.message ?? "Unable to save order.");
        return;
      }
      setStatus("saved");
      setError(null);
      resetStatusAfterDelay();
    });
  };

  const statusLabel =
    status === "saving"
      ? "Saving order..."
      : status === "saved"
        ? "Order updated."
        : status === "error"
          ? error ?? "Unable to save order."
          : null;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500" id={instructionsId}>
        <p className="flex-1 min-w-[200px]">Drag by the handle to change the display order. Changes save automatically.</p>
        {statusLabel && (
          <span
            className={clsx(
              "font-semibold",
              status === "saving" && "text-primary",
              status === "saved" && "text-emerald-600",
              status === "error" && "text-red-600"
            )}
          >
            {statusLabel}
          </span>
        )}
      </div>
      <ul className="mt-4 divide-y divide-neutral-100" aria-describedby={instructionsId}>
        {items.map((partner) => (
          <li
            key={partner.id}
            draggable
            onDragStart={(event) => handleDragStart(event, partner.id)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={(event) => handleDrop(event, partner.id)}
            className={clsx(
              "group flex items-center gap-4 rounded-2xl px-4 py-3 transition",
              draggingId === partner.id ? "opacity-40" : "hover:bg-soft"
            )}
          >
            <button
              type="button"
              className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-400 transition group-hover:border-neutral-300"
              aria-label={`Drag ${partner.name} to reorder`}
            >
              <GripIcon />
            </button>
            <div className="flex-1">
              <p className="font-semibold text-primary-ink">{partner.name}</p>
              <p className="text-sm text-neutral-600">{partner.title}</p>
              <p className="text-xs text-neutral-400">Order: {partner.order_index ?? 0}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5",
                    partner.show_on_team === false
                      ? "bg-neutral-100 text-neutral-500"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {partner.show_on_team === false ? "Hidden" : "Team"}
                </span>
                {partner.is_author && (
                  <span className="rounded-full bg-primary-ink/90 px-2 py-0.5 text-white">Author</span>
                )}
              </div>
            </div>
            <Link
              href={`/admin/team?partner=${partner.id}`}
              className="text-sm font-semibold text-primary transition hover:underline"
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>
      <div
        className="mt-4 rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-center text-xs text-neutral-500"
        onDragOver={handleDragOver}
        onDrop={(event) => handleDrop(event, null)}
      >
        Drop here to move a profile to the end
      </div>
      {status === "error" && error && (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">{error}</p>
      )}
      {isPending && (
        <p className="mt-2 text-xs text-neutral-400">Finishing up...</p>
      )}
    </div>
  );
}

function isDroppingAfter(event) {
  const target = event.currentTarget;
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const rect = target.getBoundingClientRect();
  return event.clientY > rect.top + rect.height / 2;
}

function movePartner(list, sourceId, targetId, placeAfter) {
  if (!Array.isArray(list)) {
    return null;
  }
  const working = [...list];
  const sourceIndex = working.findIndex((item) => item.id === sourceId);
  if (sourceIndex === -1) {
    return null;
  }
  const [moved] = working.splice(sourceIndex, 1);
  if (!targetId) {
    working.push(moved);
    return working;
  }
  const targetIndex = working.findIndex((item) => item.id === targetId);
  if (targetIndex === -1) {
    working.push(moved);
    return working;
  }
  const insertIndex = placeAfter ? targetIndex + 1 : targetIndex;
  working.splice(insertIndex, 0, moved);
  return working;
}

function GripIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-current"
      aria-hidden="true"
    >
      <circle cx="4" cy="4" r="1" fill="currentColor" />
      <circle cx="4" cy="8" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="8" cy="4" r="1" fill="currentColor" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
