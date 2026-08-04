import type { Ref } from "react";

/**
 * Combines multiple React refs (callback or object) into a single callback ref.
 * Useful when a component needs to expose its own ref while also forwarding to
 * an internal element.
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as { current: T | null }).current = node;
      }
    }
  };
}
