import { useState, useRef } from "react";

export default function Composer({ onSendMessage, onSendFile, disabled }) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleInput = (e) => setText(e.target.value);

  const handleSend = () => {
    const trimmed = text.trim();

    // Case 1 → sending file only
    if (selectedFile && !trimmed) {
      onSendFile(selectedFile);
      setSelectedFile(null);
      fileInputRef.current.value = "";
      return;
    }

    // Case 2 → sending text only
    if (trimmed) {
      onSendMessage(trimmed);
      setText("");
    }

    // // Case 3 → sending both file + text
    // if (selectedFile && trimmed) {
    //   onSendFile(selectedFile);
    //   setSelectedFile(null);
    //   fileInputRef.current.value = "";
    // }

    textareaRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFilePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
  };

  return (
    <div className="p-3 bg-gray-900 border-t border-gray-800 flex flex-col gap-2">

      {/* File Preview */}
      {selectedFile && (
        <div className="flex items-center justify-between bg-gray-800 p-2 rounded-md">
          <span className="text-gray-300 text-sm">
            📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </span>
          <button
            onClick={() => {
              setSelectedFile(null);
              fileInputRef.current.value = "";
            }}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex gap-3 items-end">

        {/* File Button */}
        <label className="cursor-pointer bg-gray-800 text-white px-3 py-2 rounded-md hover:bg-gray-700">
          📁
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFilePick}
            disabled={disabled}
          />
        </label>

        {/* Text Box */}
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

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !selectedFile)}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-md"
        >
          Send
        </button>
      </div>
    </div>
  );
}
