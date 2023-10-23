export interface IPushabledAsyncIterable<T> extends AsyncIterable<T> {
  push: (value: T) => void;
  end: () => void;
}

export function createPushabledAsyncIterable<T>(): IPushabledAsyncIterable<T> {
  // A queue of resolve functions waiting for an incoming event which has not yet arrived.
  let pullQueue: ((value: IteratorResult<T>) => void)[] = [];
  // A queue of values waiting for next() calls to be made
  let pushQueue: T[] = [];
  let running = true;

  return {
    [Symbol.asyncIterator]: iterator,
    push,
    end,
  };

  function iterator(): AsyncIterator<T> {
    return {
      next,
    };
  }

  async function next(): Promise<IteratorResult<T>> {
    if (running === false) {
      return { done: true, value: undefined };
    }
    return new Promise<IteratorResult<T, undefined>>((resolve) => {
      if (pushQueue.length !== 0) {
        // Get value from the pushQueue
        resolve({ done: false, value: pushQueue.shift() as T });
        return;
      }
      pullQueue.push(resolve);
    });
  }

  function end() {
    if (running) {
      running = false;
      pullQueue.forEach((resolve) => resolve({ value: undefined, done: true }));
      pullQueue = [];
      pushQueue = [];
    }
  }

  function push(value: T) {
    if (running === false) {
      // do nothing, pullQueue has been or will be emptied by stop()
      return;
    }
    if (pullQueue.length !== 0) {
      // call next resolve from the pullQueue
      const resolvedNext = pullQueue.shift()!;
      resolvedNext({ value, done: false });
      return;
    }
    pushQueue.push(value);
  }
}
