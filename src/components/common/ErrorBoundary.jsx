import React from 'react'
import { Button } from './UI'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700">
            <div className="mb-6 mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Đã có lỗi xảy ra
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Ứng dụng gặp sự cố không mong muốn.
            </p>

            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mb-6 text-left overflow-auto max-h-48">
              <p className="font-mono text-xs text-red-600 dark:text-red-400 break-words">
                {this.state.error && this.state.error.toString()}
              </p>
              {this.state.errorInfo && (
                <pre className="font-mono text-xs text-gray-500 mt-2 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <Button onClick={this.handleReset} variant="primary" className="w-full justify-center">
              Tải lại trang
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
