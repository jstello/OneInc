"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CornerDownLeft, Zap, X } from 'lucide-react';

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
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleProcess = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setError(null);
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-4xl">
        <Card className="shadow-lg dark:shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-800 dark:text-white flex items-center justify-center">
              <Zap className="mr-2 h-6 w-6 text-blue-500" />
              AI Writing Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <Textarea
                  placeholder="Enter your text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[120px] text-base p-4 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  disabled={isProcessing}
                />
              </div>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing || !inputText.trim()}
                  className="w-40 h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-transform transform hover:scale-105"
                >
                  <CornerDownLeft className="mr-2 h-5 w-5" />
                  Process
                </Button>
                {isProcessing && (
                  <Button
                    onClick={handleCancel}
                    variant="destructive"
                    className="w-40 h-12 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-transform transform hover:scale-105"
                  >
                    <X className="mr-2 h-5 w-5" />
                    Cancel
                  </Button>
                )}
              </div>
              {error && (
                <div className="text-center text-red-500 font-medium">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {WRITING_STYLES.map((style) => (
                  <Card key={style.id} className="border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">{style.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="min-h-[100px] p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
                        {outputs[style.id] || (isProcessing ? 'Generating...' : '')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
