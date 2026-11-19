import { createParser } from 'eventsource-parser';

export interface StreamEvent<T = any> {
  event: string;
  data: T;
  id?: string;
}

export async function* streamResponse<T = any>(
  url: string,
  options: RequestInit = {}
): AsyncGenerator<StreamEvent<T>> {
  const token = typeof window !== 'undefined' ? (await import('js-cookie')).default.get('console_token') : undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok || !response.body) {
    let errorMsg = `Stream failed with status ${response.status}`;
    try {
      const err = await response.json();
      errorMsg = err.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  const queue: StreamEvent<T>[] = [];
  const waiters: Array<() => void> = [];
  let isDone = false;

  const parser = createParser({
    onEvent(event) {
      try {
        const parsedData = JSON.parse(event.data);
        queue.push({
          event: event.event || 'message',
          data: parsedData,
          id: event.id
        });
      } catch {
        queue.push({
          event: event.event || 'message',
          data: event.data as unknown as T,
          id: event.id
        });
      }
      const notify = waiters.shift();
      if (notify) notify();
    }
  });

  (async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        parser.feed(decoder.decode(value, { stream: true }));
      }
    } finally {
      isDone = true;
      while (waiters.length > 0) {
        const notify = waiters.shift();
        if (notify) notify();
      }
    }
  })();

  while (true) {
    if (queue.length > 0) {
      yield queue.shift()!;
    } else if (isDone) {
      break;
    } else {
      await new Promise<void>((resolve) => {
        waiters.push(resolve);
      });
    }
  }
}
