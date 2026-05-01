import type { ReactNode, ErrorInfo } from 'react';
import { 
  ErrorBoundary as ReactErrorBoundary, 
  type FallbackProps 
} from 'react-error-boundary';

function getErrorMessage(error: FallbackProps['error']): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown error';
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="p-6 text-red-600">
      <h2 className="font-bold mb-2">Something went wrong</h2>

      <pre className="text-sm mb-4">{getErrorMessage(error)}</pre>

      <button
        type="button"
        className="px-3 py-2 rounded bg-red-600 text-white"
        onClick={resetErrorBoundary}
      >
        Try again
      </button>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error: unknown, info: ErrorInfo) => {
        console.error('ErrorBoundary Unhandled render error:', error);
        console.error('ErrorBoundary Component stack:', info.componentStack);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}