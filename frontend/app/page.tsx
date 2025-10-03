"use client";

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StatusMessage } from "@/components/ui/status-message";
import { CornerDownLeft, Zap, X, Copy, CheckCircle2 } from 'lucide-react';

const WRITING_STYLES = [
  { id: 'professional', title: 'Professional' },
  { id: 'casual', title: 'Casual' },
  { id: 'polite', title: 'Polite' },
  { id: 'social-media', title: 'Social Media' },
];

type OutputType = {
  [key: string]: string;
};

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [outputs, setOutputs] = useState<OutputType>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const processButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (!isProcessing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isProcessing]);

  const handleProcess = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    setOutputs({});
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('http://localhost:8000/api/rephrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ text: inputText }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'An error occurred while processing your request.');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get response reader.');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.substring(6));
            if (data.type === 'content') {
              setOutputs((prev) => ({
                ...prev,
                [data.style]: (prev[data.style] || '') + data.content,
              }));
            } else if (data.type === 'error') {
              throw new Error(data.message);
            }
          }
        }
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl/Cmd + Enter to process
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleProcess();
    }
    // Escape to cancel processing
    if (e.key === 'Escape' && isProcessing) {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    setError(null);
  };

  const handleCopyOutput = async (styleId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStyle(styleId);
      setTimeout(() => setCopiedStyle(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const isProcessingComplete = Object.keys(outputs).length > 0 && !isProcessing;
  const hasOutputs = Object.keys(outputs).length > 0;

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300"
      role="main"
      aria-label="AI Writing Assistant"
    >
      <div className="w-full max-w-4xl">
        <Card className="shadow-xl dark:shadow-2xl transition-all duration-300 hover:shadow-2xl dark:hover:shadow-3xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b">
            <CardTitle
              className="text-3xl font-bold text-center text-gray-800 dark:text-white flex items-center justify-center"
              id="app-title"
            >
              <Zap className="mr-3 h-8 w-8 text-blue-500 animate-pulse-slow" />
              AI Writing Assistant
            </CardTitle>
            <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
              Transform your text into different writing styles with AI
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6">
              {/* Input Section */}
              <div>
                <label
                  htmlFor="input-text"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
                >
                  Enter your text to rephrase
                </label>
                <Textarea
                  ref={textareaRef}
                  id="input-text"
                  placeholder="Enter your text here... (Press Ctrl/Cmd + Enter to process)"
                  value={inputText}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  className="min-h-[140px] text-base p-4 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-all duration-200 resize-vertical custom-scrollbar"
                  disabled={isProcessing}
                  error={!!error}
                  aria-describedby="input-help-text"
                  aria-invalid={!!error}
                  aria-required="true"
                />
                <div
                  id="input-help-text"
                  className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex justify-between"
                >
                  <span>{inputText.length}/1000 characters</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {inputText.length > 0 && `${Math.ceil(inputText.length / 5)} words`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  ref={processButtonRef}
                  onClick={handleProcess}
                  disabled={isProcessing || !inputText.trim()}
                  className="w-full sm:w-48 h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:transform-none disabled:hover:scale-100 disabled:opacity-50"
                  aria-label={isProcessing ? "Processing text" : "Process text"}
                  aria-describedby="process-button-description"
                  loading={isProcessing}
                >
                  {!isProcessing && (
                    <>
                      <CornerDownLeft className="mr-2 h-5 w-5" />
                      Process Text
                    </>
                  )}
                </Button>
                <div id="process-button-description" className="sr-only">
                  {isProcessing ? "Currently processing your text" : "Click to process your text into different writing styles"}
                </div>

                {isProcessing && (
                  <Button
                    onClick={handleCancel}
                    variant="destructive"
                    className="w-full sm:w-48 h-12 text-lg font-semibold bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    aria-label="Cancel processing"
                  >
                    <X className="mr-2 h-5 w-5" />
                    Cancel
                  </Button>
                )}
              </div>

              {/* Status Messages */}
              <div aria-live="polite" aria-atomic="true" className="space-y-3">
                {error && (
                  <StatusMessage
                    type="error"
                    message={error}
                    className="animate-slide-up"
                  />
                )}

                {success && (
                  <StatusMessage
                    type="success"
                    message="Text processed successfully!"
                    className="animate-slide-up"
                  />
                )}
              </div>

              {/* Output Section */}
              {hasOutputs && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white text-center">
                    Rephrased Results
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {WRITING_STYLES.map((style) => {
                      const output = outputs[style.id];
                      const isGenerating = isProcessing && !output;
                      const hasContent = output && !isProcessing;

                      return (
                        <Card
                          key={style.id}
                          className={`border-2 transition-all duration-300 hover:shadow-lg animate-slide-up ${
                            hasContent
                              ? 'border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800'
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                          }`}
                          aria-labelledby={`${style.id}-title`}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle
                              id={`${style.id}-title`}
                              className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-between"
                            >
                              <span className="flex items-center">
                                {style.title}
                                {isGenerating && (
                                  <LoadingSpinner
                                    size="sm"
                                    variant="primary"
                                    className="ml-2"
                                  />
                                )}
                                {hasContent && (
                                  <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                                )}
                              </span>
                              {hasContent && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyOutput(style.id, output)}
                                  className="h-8 w-8 p-0"
                                  aria-label={`Copy ${style.title} text`}
                                >
                                  {copiedStyle === style.id ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div
                              className={`min-h-[120px] p-4 rounded-lg text-gray-800 dark:text-gray-300 whitespace-pre-wrap transition-all duration-300 custom-scrollbar ${
                                isGenerating
                                  ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 animate-pulse'
                                  : hasContent
                                    ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
                                    : 'bg-gray-100 dark:bg-gray-800'
                              }`}
                              aria-live="polite"
                              aria-atomic="true"
                            >
                              {output || (
                                isGenerating ? (
                                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                                    <LoadingSpinner size="sm" />
                                    <span>Generating {style.title.toLowerCase()} version...</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-500 dark:text-gray-400 italic">
                                    {isProcessingComplete ? 'No output generated' : 'Output will appear here'}
                                  </span>
                                )
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Keyboard Shortcuts Help */}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="font-medium mb-2">Keyboard Shortcuts</p>
                <div className="flex flex-wrap justify-center gap-4 text-xs">
                  <span className="flex items-center">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono mr-1">
                      Ctrl/Cmd
                    </kbd>
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono mr-1">
                      Enter
                    </kbd>
                    Process text
                  </span>
                  <span className="flex items-center">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono mr-1">
                      Esc
                    </kbd>
                    Cancel processing
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}