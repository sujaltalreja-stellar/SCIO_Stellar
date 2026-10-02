import React, { Suspense } from "react";

export interface DynamicOptions {
  ssr?: boolean;
  loading?: () => React.ReactNode;
}

export default function dynamic<T extends React.ComponentType<any>>(
  loader: () => Promise<{ default: T } | T>,
  options?: DynamicOptions
): React.ComponentType<React.ComponentProps<T>> {
  const LazyComponent = React.lazy(async () => {
    const mod = await loader();
    if ("default" in mod) {
      return mod as { default: T };
    }
    return { default: mod as unknown as T };
  });

  return function DynamicWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={options?.loading ? options.loading() : null}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
