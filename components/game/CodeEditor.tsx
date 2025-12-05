'use client';

import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  consoleOutput: string[];
}

export default function CodeEditor({ code, onChange, consoleOutput }: CodeEditorProps) {
  return (
    <div>
      {/* Code Editor */}
      <div className="h-[500px] overflow-hidden rounded-t-lg">
        <Editor
          height="500px"
          defaultLanguage="javascript"
          value={code}
          onChange={(value) => onChange(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Console Output */}
      <div className="rounded-b-lg bg-slate-900 p-4 font-mono text-sm">
        <div className="mb-2 font-semibold text-slate-400">Console Output:</div>
        <div className="space-y-1">
          {consoleOutput.length === 0 ? (
            <div className="text-slate-500">_</div>
          ) : (
            consoleOutput.map((line, index) => (
              <div
                key={index}
                className={
                  line.startsWith('Error:')
                    ? 'text-red-400'
                    : line.startsWith('▶')
                    ? 'text-green-400'
                    : line.startsWith('→')
                    ? 'text-blue-400'
                    : 'text-slate-300'
                }
              >
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

