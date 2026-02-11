import { useRef, useEffect, KeyboardEvent } from 'react';

interface WritingCanvasProps {
  text: string;
  onChange: (text: string, isKeypress?: boolean) => void;
  noBackspaceMode: boolean;
  goalAchieved: boolean;
}

export default function WritingCanvas({ text, onChange, noBackspaceMode, goalAchieved }: WritingCanvasProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingKeypressRef = useRef(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (noBackspaceMode && e.key === 'Backspace') {
      e.preventDefault();
      return;
    }

    if (!goalAchieved && (e.metaKey || e.ctrlKey)) {
      if (e.key === 'c' || e.key === 'x' || e.key === 'v' || e.key === 'a') {
        e.preventDefault();
        return;
      }
    }

    const isTypingKey = e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Unidentified' || e.key === 'Process';
    if (isTypingKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
      pendingKeypressRef.current = true;
    }
  }

  function handleBeforeInput() {
    pendingKeypressRef.current = true;
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const isKeypress = pendingKeypressRef.current;
    pendingKeypressRef.current = false;
    onChange(e.target.value, isKeypress);
  }

  function handlePaste(e: React.ClipboardEvent) {
    if (!goalAchieved) {
      e.preventDefault();
    }
  }

  function handleCopy(e: React.ClipboardEvent) {
    if (!goalAchieved) {
      e.preventDefault();
    }
  }

  function handleCut(e: React.ClipboardEvent) {
    if (!goalAchieved) {
      e.preventDefault();
    }
  }

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBeforeInput={handleBeforeInput}
      onPaste={handlePaste}
      onCopy={handleCopy}
      onCut={handleCut}
      className="w-full h-full bg-transparent text-gray-100 text-base sm:text-lg leading-relaxed resize-none outline-none border-none pl-4 sm:pl-8 pr-6 sm:pr-10 pt-4 sm:pt-8 pb-32 sm:pb-40 font-mono"
      placeholder="Start typing..."
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      style={{
        caretColor: '#fff',
        scrollbarGutter: 'stable',
      }}
    />
  );
}
