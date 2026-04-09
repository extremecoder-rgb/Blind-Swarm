export interface ExecutionResult {
  result: string;
  confidence: number;
  metadata: Record<string, unknown>;
}

export interface AIAdapter {
  execute(prompt: string, context: Record<string, unknown>): Promise<ExecutionResult>;
}