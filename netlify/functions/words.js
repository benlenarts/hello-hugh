import { getStore } from "@netlify/blobs";

export default async (request) => {
  const store = getStore("words");

  if (request.method === "GET") {
    const data = await store.get("all", { type: "json" });
    return new Response(JSON.stringify(data || []), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (request.method === "POST") {
    const body = await request.json();
    const word = body.word?.trim().slice(0, 100);
    if (!word) {
      return new Response(JSON.stringify({ error: "empty" }), { status: 400 });
    }

    const words = (await store.get("all", { type: "json" })) || [];
    words.push({ word, time: Date.now() });

    // Keep last 200 words
    if (words.length > 200) words.splice(0, words.length - 200);

    await store.setJSON("all", words);
    return new Response(JSON.stringify({ ok: true }), { status: 201 });
  }

  return new Response("method not allowed", { status: 405 });
};
