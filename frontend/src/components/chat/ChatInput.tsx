import { type FormEvent, type KeyboardEvent, useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const trimmed = value.trim();
      if (!trimmed || disabled) return;
      onSend(trimmed);
      setValue("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-outline-variant/30 p-4 flex items-end gap-3 bg-surface-container-lowest"
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder="Sorunuzu yazın..."
        className="flex-1 resize-none bg-surface-container-low border border-outline-variant/40 rounded-2xl px-4 py-3 text-sm text-on-surface placeholder-outline focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
        style={{ maxHeight: 120 }}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="w-10 h-10 rounded-full bg-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0"
      >
        <Send size={15} className="text-on-primary" />
      </button>
    </form>
  );
}
