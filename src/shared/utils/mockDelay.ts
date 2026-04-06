export const mockDelay = (ms = 800): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const withMock = async <T>(
  data: T,
  delayMs = 800,
): Promise<T> => {
  await mockDelay(delayMs);
  return data;
};
