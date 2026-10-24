import { EFFORT, FALLBACK_BETA, MODEL, getClient, hasApiKey } from "@/lib/anthropic";
import { AssistantRequestSchema } from "@/lib/ai-schema";
import { ASSISTANT_SYSTEM, buildAssistantContext } from "@/lib/prompts";
import { rateLimit } from "@/lib/ratelimit";
import { asUntrustedData, clientKey, isSameOrigin, jsonError } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024;
const PER_HOUR = 60;

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return jsonError(403, "cross_origin", "This endpoint only accepts same-origin requests.");
  }

  const limit = rateLimit(`assistant:${clientKey(req)}`, PER_HOUR, 60 * 60 * 1000);
  if (!limit.ok) {
    return Response.json(
      { error: { code: "rate_limited", message: "Too many messages. Try again shortly." } },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return jsonError(413, "payload_too_large", "That request was larger than we accept.");
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return jsonError(400, "malformed_json", "The request body was not valid JSON.");
  }

  const parsed = AssistantRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "invalid_input", "That message could not be processed.");
  }

  if (!hasApiKey()) {
    return jsonError(
      503,
      "demo_mode",
      "No ANTHROPIC_API_KEY is configured, so the assistant is answering from its built-in script.",
    );
  }

  const { context, history, message } = parsed.data;

  // Replayed history stays fenced too: an injection planted four turns ago is
  // still untrusted on the turn it finally gets read.
  const turns = history.map((turn) => ({
    role: turn.role,
    content:
      turn.role === "user" ? asUntrustedData("message", turn.content) || "(empty)" : turn.content,
  }));

  const encoder = new TextEncoder();

  try {
    const stream = getClient().beta.messages.stream({
      model: MODEL,
      max_tokens: 2_000,
      betas: [FALLBACK_BETA],
      fallbacks: "default",
      system: [
        { type: "text", text: ASSISTANT_SYSTEM },
        { type: "text", text: buildAssistantContext(context) },
      ],
      output_config: { effort: EFFORT === "max" ? "high" : EFFORT },
      messages: [
        ...turns,
        { role: "user", content: asUntrustedData("message", message) || message },
      ],
    });

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          const final = await stream.finalMessage();
          if (final.stop_reason === "refusal") {
            controller.enqueue(
              encoder.encode(
                "\n\nI am not able to help with that one. Ask me about the wedding instead.",
              ),
            );
          }
        } catch (err) {
          console.error("assistant_stream_failed", {
            name: err instanceof Error ? err.name : "unknown",
          });
          controller.enqueue(encoder.encode("\n\n[The connection dropped. Please try again.]"));
        } finally {
          controller.close();
        }
      },
      cancel() {
        stream.abort();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("assistant_failed", { name: err instanceof Error ? err.name : "unknown" });
    return jsonError(502, "upstream_error", "The assistant is unavailable right now.");
  }
}
