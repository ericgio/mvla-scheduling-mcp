type ToolParams = Record<string, unknown>;

interface ToolErrorResult {
  isError?: boolean;
  content?: Array<{ type?: string; text?: string }>;
}

export function emitToolLog(
  tool: string,
  params: ToolParams,
  success: boolean,
  startedAt: number,
  error?: string,
): void {
  const payload: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    tool,
    params: Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined),
    ),
    success,
    duration_ms: Date.now() - startedAt,
  };

  if (error !== undefined) {
    payload.error = error;
  }

  console.log(JSON.stringify(payload));
}

export async function withToolLogging<T>(
  tool: string,
  params: ToolParams,
  handler: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now();

  try {
    const result = await handler();
    const isErrorResult = typeof result === 'object' && result !== null && 'isError' in result && Boolean((result as ToolErrorResult).isError);
    const errorMessage = isErrorResult ? getResultErrorMessage(result as ToolErrorResult) : undefined;
    emitToolLog(tool, params, !isErrorResult, startedAt, errorMessage);
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    emitToolLog(tool, params, false, startedAt, message);
    throw err;
  }
}

function getResultErrorMessage(result: ToolErrorResult): string | undefined {
  if (!Array.isArray(result.content)) {
    return undefined;
  }

  const firstText = result.content.find((entry) => typeof entry?.text === 'string')?.text;
  return typeof firstText === 'string' ? firstText : undefined;
}
