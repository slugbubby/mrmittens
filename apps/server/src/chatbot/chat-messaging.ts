/**
 * Tries to send a chat reply without taking the whole bot down if Twitch says "nope".
 * Because crashing over one failed message would be a wildly dramatic career choice.
 */
export const safeReply = async (
  sendMessage: (message: string) => Promise<unknown>,
  message: string,
  onError: (error: unknown) => void = (error) => {
    console.error('Failed to send Twitch chat message.', error);
  },
) => {
  try {
    await sendMessage(message);
  } catch (error) {
    onError(error);
  }
};
