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
    <div className="overflow-hidden">
      {/* Code Editor */}
      <div className="h-[350px] overflow-hidden rounded-t-lg">
        <Editor
          height="350px"
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
            wordWrap: 'on',
            wrappingIndent: 'indent',
            scrollbar: {
              horizontal: 'auto',
              vertical: 'auto',
              horizontalScrollbarSize: 10,
              verticalScrollbarSize: 10,
            },
            overviewRulerLanes: 0,
          }}
        />
      </div>

      {/* Console Output */}
      <div className="rounded-b-lg bg-slate-900 p-4 font-mono text-sm overflow-x-auto">
        <div className="mb-2 font-semibold text-slate-400">Console Output:</div>
        <div className="space-y-1 break-words">
          {consoleOutput.length === 0 ? (
            <div className="text-slate-500">_</div>
          ) : (
            consoleOutput.map((line, index) => (
              <div
                key={index}
                className={`break-words ${
                  line.startsWith('Error:')
                    ? 'text-red-400'
                    : line.startsWith('▶')
                    ? 'text-green-400'
                    : line.startsWith('→')
                    ? 'text-blue-400'
                    : 'text-slate-300'
                }`}
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

