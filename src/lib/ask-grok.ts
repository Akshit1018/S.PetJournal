import { createServerFn } from "@tanstack/react-start";

type Turn = { role: "user" | "assistant" | "system"; content: string };

export const askPetGuide = createServerFn({ method: "POST" })
  .validator((input: { system: string; messages: Turn[] }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "AI is not available in this environment" };
    }

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 500,
        temperature: 0.5,
        messages: [
          { role: "system", content: data.system },
          ...data.messages.slice(-8),
        ],
      }),
    });

    if (!res.ok) {
      return { ok: false as const, error: `Guide unavailable (${res.status})` };
    }

    const body = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    return { ok: true as const, text: body.choices[0]?.message.content ?? "" };
  });
