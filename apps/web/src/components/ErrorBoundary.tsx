import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="bg-red-50 p-4 rounded-full mb-4"><AlertTriangle className="h-10 w-10 text-red-500" /></div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 dark:text-white">Something went wrong</h2>
          <p className="text-slate-500 max-w-md mb-6 dark:text-slate-400">{this.state.error?.message || "An unexpected error occurred."}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}
