import { EFFORT, FALLBACK_BETA, MODEL, getClient, hasApiKey } from "@/lib/anthropic";
import {
  GENERATION_JSON_SCHEMA,
  GenerateRequestSchema,
  GenerationSchema,
} from "@/lib/ai-schema";
import { GENERATE_SYSTEM, buildGeneratePrompt } from "@/lib/prompts";
import { rateLimit } from "@/lib/ratelimit";
import { clientKey, isSameOrigin, jsonError } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;
const PER_HOUR = 20;

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return jsonError(403, "cross_origin", "This endpoint only accepts same-origin requests.");
  }

  const limit = rateLimit(`generate:${clientKey(req)}`, PER_HOUR, 60 * 60 * 1000);
  if (!limit.ok) {
    return Response.json(
      {
        error: {
          code: "rate_limited",
          message: `That is ${PER_HOUR} generations this hour. Try again shortly.`,
        },
      },
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

  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: {
          code: "invalid_input",
          message: "That request could not be processed.",
          // Field paths only — never the submitted values.
          fields: parsed.error.issues.map((i) => i.path.join(".")),
        },
      },
      { status: 400 },
    );
  }

  if (!hasApiKey()) {
    return jsonError(
      503,
      "demo_mode",
      "No model is configured, so EventGenie answered from its built-in planner instead.",
    );
  }

  const { context, prompt } = parsed.data;

  try {
    const message = await getClient().beta.messages.create({
      model: MODEL,
      max_tokens: 8_000,
      betas: [FALLBACK_BETA],
      fallbacks: "default",
      system: GENERATE_SYSTEM,
      messages: [{ role: "user", content: buildGeneratePrompt(context, prompt) }],
      output_config: {
        effort: EFFORT,
        format: { type: "json_schema", schema: GENERATION_JSON_SCHEMA },
      },
    });

    if (message.stop_reason === "refusal") {
      return jsonError(
        422,
        "declined",
        "The model declined that one. Try rephrasing what you need.",
      );
    }

    const text = message.content
      .filter((block): block is Extract<typeof block, { type: "text" }> => block.type === "text")
      .map((block) => block.text)
      .join("");

    let candidate: unknown;
    try {
      candidate = JSON.parse(text);
    } catch {
      return jsonError(502, "unparseable", "The response came back malformed. Please try again.");
    }

    // The model's output is input to us, and is validated like any other.
    const validated = GenerationSchema.safeParse(candidate);
    if (!validated.success) {
      console.error("generation_schema_mismatch", {
        fields: validated.error.issues.map((i) => i.path.join(".")).slice(0, 10),
      });
      return jsonError(502, "invalid_shape", "The response did not match our format. Try again.");
    }

    return Response.json({ generation: validated.data, mode: "model", model: MODEL });
  } catch (err) {
    // A classification only: never the prompt, the response, or the key.
    console.error("generation_failed", {
      name: err instanceof Error ? err.name : "unknown",
      status: (err as { status?: number })?.status ?? null,
    });
    return jsonError(502, "upstream_error", "The planner is unavailable right now. Please retry.");
  }
}
