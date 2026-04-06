'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] px-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#FF3F80]/10 mb-4">
            <AlertTriangle className="h-7 w-7 text-[#FF3F80]" />
          </div>

          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-1">
            Something went wrong
          </h2>

          {this.state.error?.message && (
            <p className="text-sm text-[#6B6B6B] max-w-[300px] mb-6">
              {this.state.error.message}
            </p>
          )}

          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="inline-flex items-center justify-center h-10 px-5 rounded-xl font-medium text-white bg-gradient-to-br from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] shadow-sm hover:shadow-md transition-shadow"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
