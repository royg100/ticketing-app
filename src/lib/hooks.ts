import { useState, useEffect } from 'react';

const DB_CHANGED = 'tick-db-changed';

export function notifyDbChanged(): void {
  window.dispatchEvent(new Event(DB_CHANGED));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRef = { _fn: (args: any) => any };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useQuery(ref: AnyRef, args?: any): any {
  const skip = args === 'skip';
  const [, setTick] = useState(0);

  useEffect(() => {
    if (skip) return;
    const handler = () => setTick(t => t + 1);
    window.addEventListener(DB_CHANGED, handler);
    return () => window.removeEventListener(DB_CHANGED, handler);
  }, [skip]);

  if (skip) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ref._fn(args);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMutation(ref: AnyRef): (args?: any) => Promise<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (args?: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = ref._fn(args);
    notifyDbChanged();
    return Promise.resolve(result);
  };
}
