import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-void-900 p-6 transition-colors">
          <div className="max-w-md bg-white dark:bg-void-800 border border-energy-rose/30 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-energy-rose mb-2">
              Something went wrong
            </h1>
            <p className="text-slate-600 dark:text-void-200 text-sm mb-6">
              We encountered an unexpected error. Please try refreshing the
              page.
            </p>
            <div className="bg-slate-100 dark:bg-void-900 border border-slate-200 dark:border-void-600 rounded-lg p-4 mb-6 text-left max-h-32 overflow-y-auto">
              <p className="text-xs font-mono text-slate-700 dark:text-void-300 break-words">
                {this.state.error?.message || "Unknown error"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-solar-500 hover:bg-solar-400 text-void-900 font-bold py-2 rounded-lg transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 bg-slate-300 dark:bg-void-600 hover:bg-slate-400 dark:hover:bg-void-500 text-slate-900 dark:text-void-100 font-bold py-2 rounded-lg transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
