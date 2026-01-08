"use client";

import { useState } from "react";
import { Play } from "lucide-react";

function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^?&\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function VideoPlayer({ videoUrl, posterImage, title }) {
  const [playing, setPlaying] = useState(false);
  const videoId = extractYouTubeId(videoUrl);

  if (!videoId) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
        <p>Video unavailable</p>
      </div>
    );
  }

  if (playing) {
    return (
      <div className="aspect-video overflow-hidden rounded-2xl">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral-900"
    >
      {posterImage && (
        <img
          src={posterImage}
          alt={title || "Video thumbnail"}
          className="h-full w-full object-cover opacity-80 transition group-hover:opacity-60"
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-lg transition group-hover:scale-110 group-hover:bg-white">
          <Play className="h-10 w-10 fill-primary text-primary" strokeWidth={0} />
        </div>
      </div>
    </button>
  );
}
