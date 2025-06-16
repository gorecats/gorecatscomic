import { Dispatch, SetStateAction, useCallback } from "react";
import { useEffect, useRef } from "react";

type SetValue<T> = Dispatch<SetStateAction<T>>;

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>] {

  const readValue = useCallback(() => {
    if (typeof window == "undefined") {
      return initialValue;
    }

    try {
      const value = window.localStorage.getItem(key);
      if (!value) return initialValue;

      const parsedValue = parseJson<T>(value);
      return parsedValue || initialValue;
    } catch (e) {
      console.warn(`Error reading localStorage key “${key}”:`, e);
      return initialValue;
    }
  }, [initialValue, key]);

  const setValue: SetValue<T> = useEventCallback((value) => {
    if (typeof window == "undefined") {
      return initialValue;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error setting localStorage key “${key}”:`, e);
    }
  });

  useEffect(() => {
    setValue(readValue());
  }, [readValue, setValue]);

  const value = readValue();

  return [value, setValue];
}

function parseJson<T>(value: string): T | undefined {
    if (value === "undefined") return undefined;
  
    try {
      return JSON.parse(value, (_key, val) => {
        if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
          const date = new Date(val);
          return isNaN(date.getTime()) ? val : date;
        }
        return val;
      }) as T;
    } catch {
      return undefined;
    }
  }
  

  export default function useEventCallback<TCallback extends (...args: unknown[]) => unknown>(
    fn?: TCallback | null
  ): TCallback {
    const ref = useCommittedRef(fn);
    return useCallback(
      (...args: unknown[]) => {
        return ref.current?.(...args);
      },
      [ref]
    ) as TCallback;
  }
  


/**
 * Creates a `Ref` whose value is updated in an effect, ensuring the most recent
 * value is the one rendered with. Generally only required for Concurrent mode usage
 * where previous work in `render()` may be discarded before being used.
 *
 * This is safe to access in an event handler.
 *
 * @param value The `Ref` value
 */
function useCommittedRef<TValue>(
  value: TValue
): React.MutableRefObject<TValue> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
