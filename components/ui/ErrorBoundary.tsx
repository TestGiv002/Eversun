'use client';

import { Component, ReactNode } from 'react';
import { Warning, ArrowClockwise } from '@phosphor-icons/react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-12 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 flex items-center justify-center mb-6">
            <Warning
              className="h-10 w-10 text-red-600 dark:text-red-400"
              weight="bold"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Une erreur est survenue
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            {this.state.error?.message ||
              "Une erreur inattendue s'est produite. Veuillez réessayer."}
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow hover:scale-[1.01] transition-all duration-200 font-medium"
          >
            <ArrowClockwise className="h-5 w-5" weight="bold" />
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
