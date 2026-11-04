export interface FetchOptions {
  url: string;
  method?: string;
  headers: Record<string, string>;
  body: unknown;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

/**
 * Robust fetch wrapper with timeout support and error normalization.
 */
export async function executeFetch<T>(options: FetchOptions): Promise<T> {
  const { url, method = "POST", headers, body, timeoutMs = 30000, fetchFn = fetch } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchFn(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      let parsedMessage: string = errText;
      try {
        const json = JSON.parse(errText);
        parsedMessage = json.error?.message || json.message || errText;
      } catch {
        // use raw text
      }
      throw new Error(`AI Provider HTTP Error (${res.status}): ${parsedMessage}`);
    }

    return (await res.json()) as T;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`AI Provider request timed out after ${timeoutMs}ms.`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extracts and parses JSON from potentially code-fenced string output.
 */
export function extractAndParseJson<T>(raw: string): T {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return JSON.parse(cleaned) as T;
}
