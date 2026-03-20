import { safeReply } from './chat-messaging';

describe('safeReply', () => {
  it('sends the message when chat is healthy', async () => {
    const sendMessage = jest.fn().mockResolvedValue(undefined);

    await safeReply(sendMessage, 'Task added');

    expect(sendMessage).toHaveBeenCalledWith('Task added');
  });

  it('swallows chat send failures and reports them', async () => {
    const sendMessage = jest.fn().mockRejectedValue(new Error('chat exploded'));
    const onError = jest.fn();

    await expect(safeReply(sendMessage, 'Task added', onError)).resolves.toBeUndefined();
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
