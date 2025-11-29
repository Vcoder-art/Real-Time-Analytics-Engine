import { useState,useRef } from "react";

export default function Composer({ onSend, disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);


  const handleInput = (e) => {
    setText(e.target.value);
  };

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
    textareaRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 bg-gray-900 border-t border-gray-800 flex gap-3 items-end">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleInput}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="Write a message..."
        disabled={disabled}
        className="resize-none w-full bg-gray-800 text-gray-100 placeholder-gray-500 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <button
        onClick={handleSend}
        disabled={disabled || text.trim().length === 0}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-md"
      >
        Send
      </button>
    </div>
  );
}
