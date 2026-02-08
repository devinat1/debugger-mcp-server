export const formatToolResult = (params: { data: unknown }): string => {
  return JSON.stringify(params.data, null, 2);
};

export const formatErrorResult = (params: { error: unknown }): string => {
  const message = params.error instanceof Error ? params.error.message : String(params.error);
  return `Error: ${message}`;
};
