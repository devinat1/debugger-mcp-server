export interface BridgeHealthResponse {
  status: "ok";
  extensionVersion: string;
}

export interface BreakpointLocation {
  filePath: string;
  lineNumber: number;
  condition?: string;
  logMessage?: string;
}

export interface BreakpointInfo {
  id: string;
  enabled: boolean;
  location?: { filePath: string; lineNumber: number };
  condition?: string;
  hitCondition?: string;
  logMessage?: string;
}

export interface SetBreakpointsResponse {
  successCount: number;
  failedPaths: string[];
}

export interface RemoveBreakpointsResponse {
  removedCount: number;
}

export interface ListBreakpointsResponse {
  breakpoints: BreakpointInfo[];
}

export interface StartDebugSessionResponse {
  sessionId: string;
  name: string;
}

export interface StopDebugSessionResponse {
  stopped: boolean;
}

export interface StepResponse {
  success: boolean;
}

export interface GetVariablesResponse {
  variables: unknown[];
}

export interface GetCallStackResponse {
  stackFrames: unknown[];
}

export interface EvaluateExpressionResponse {
  result: string;
  type?: string;
  variablesReference?: number;
}
