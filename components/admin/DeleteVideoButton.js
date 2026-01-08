"use client";

export default function DeleteVideoButton({ videoId, videoTitle, deleteAction }) {
  function handleClick(e) {
    if (!confirm(`Delete "${videoTitle}"?`)) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteAction}>
      <input type="hidden" name="id" value={videoId} />
      <button
        type="submit"
        onClick={handleClick}
        className="rounded border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  );
}
