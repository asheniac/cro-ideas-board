"use client";

import { useEffect, useState } from "react";

interface CROIdea {
  id: number;
  title: string;
  description: string;
  reason: string;
  purpose: string;
  category: string;
  mockupUrl: string | null;
  createdAt: string;
}

export default function LikedPage() {
  const [ideas, setIdeas] = useState<CROIdea[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLiked = async () => {
    const res = await fetch("/api/ideas?status=liked");
    const data = await res.json();
    setIdeas(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLiked();
  }, []);

  const moveToDislike = async (id: number) => {
    await fetch(`/api/ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "disliked" }),
    });
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) return <p className="p-8 text-zinc-500">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            ❤️ Liked Ideas
          </h1>
          <p className="text-zinc-500 mt-1">
            {ideas.length} idea{ideas.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <a
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ← Swipe More
        </a>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg">No liked ideas yet.</p>
          <a href="/" className="text-blue-600 hover:underline mt-2 block">
            Start reviewing
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              {idea.mockupUrl && (
                <div className="h-40 bg-zinc-100">
                  <img
                    src={idea.mockupUrl}
                    alt={idea.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {idea.category}
                </span>
                <h3 className="text-lg font-semibold mt-2 text-zinc-900 dark:text-zinc-50">
                  {idea.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                  {idea.description}
                </p>
                <button
                  onClick={() => moveToDislike(idea.id)}
                  className="mt-3 text-sm text-red-600 hover:underline"
                >
                  Move to Dislike
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
