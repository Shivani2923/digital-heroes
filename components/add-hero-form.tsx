"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AddHeroForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const supabase = createClient();

    const { error } = await supabase
      .from("Heros")
      .insert({
        name,
        description,
        image_url: imageUrl,
      });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Hero added successfully!");

    setName("");
    setDescription("");
    setImageUrl("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mb-10"
    >
      <h2 className="text-2xl font-bold mb-4">
        Add New Hero
      </h2>

      <input
        type="text"
        placeholder="Hero Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full border p-2 mb-3 rounded"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="w-full border p-2 mb-3 rounded"
      />

      <input
        type="url"
        placeholder="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        required
        className="w-full border p-2 mb-3 rounded"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add Hero
      </button>

      {message && (
        <p className="mt-3 text-green-600">
          {message}
        </p>
      )}
    </form>
  );
}