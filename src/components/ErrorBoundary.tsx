import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import logoUrl from "@/assets/newlogo.svg";
import { logger } from "@/lib/logger";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback. Receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Detects errors thrown while dynamically importing a lazy() route chunk.
 * These usually happen after a new deployment invalidated the old chunk hashes,
 * so a hard reload almost always fixes them.
 */
function isChunkLoadError(error: Error): boolean {
  const message = `${error?.name ?? ""} ${error?.message ?? ""}`;
  return (
    /ChunkLoadError/i.test(message) ||
    /Loading (CSS )?chunk [\d]+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message)
  );
}

/**
 * App-wide error boundary. Catches render/lifecycle errors anywhere below it so
 * a single failing component (or a failed lazy chunk load on a flaky connection)
 * shows a recoverable screen instead of a blank white page.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log for local debugging / future error-reporting integration (e.g. Sentry).
    logger.error("ErrorBoundary caught an error:", error, errorInfo);

    // A stale lazy chunk after a deploy is unrecoverable in place — reload once.
    if (isChunkLoadError(error)) {
      const alreadyReloaded = sessionStorage.getItem("chunk-reload");
      if (!alreadyReloaded) {
        sessionStorage.setItem("chunk-reload", "1");
        window.location.reload();
      }
    }
  }

  reset = (): void => {
    sessionStorage.removeItem("chunk-reload");
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (!error) {
      return children;
    }

    if (fallback) {
      return fallback(error, this.reset);
    }

    const chunkError = isChunkLoadError(error);

    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
      >
        <img src={logoUrl} alt="" className="h-16 w-16 opacity-80" />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">
            {chunkError ? "Please refresh the page" : "Something went wrong"}
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            {chunkError
              ? "A newer version of the app is available. Reloading will get you back on the path."
              : "An unexpected error occurred. You can try again, or return to the home page."}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={this.reset}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload page
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Go home
          </Button>
        </div>
        {import.meta.env.DEV && (
          <pre className="mt-2 max-w-full overflow-auto rounded-md bg-muted p-4 text-left text-xs text-muted-foreground">
            {error.message}
          </pre>
        )}
      </div>
    );
  }
}

export default ErrorBoundary;
