import { useState, useRef, useEffect } from "react";

export default function Composer({
  onSendMessage,
  onSendFile,
  disabled,
  ws,
  userId,
  currentUserName,
  channel
}) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // typing state tracker
  const typingRef = useRef({
    state: "stopped",
    timer: null
  });

  const TYPING_STOP_DELAY = 1500;

  // -------------------------------
  // 🔤 Handle input + typing logic
  // -------------------------------
  const handleInput = (e) => {
    setText(e.target.value);
    handleTyping();
  };

  // -------------------------------
  // 💬 Manage typing start/stop
  // -------------------------------
  const handleTyping = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    // 1️⃣ If not already typing -> send start
    if (typingRef.current.state === "stopped") {
      typingRef.current.state = "running";

      ws.send(
        JSON.stringify({
          action: "typing",
          state: "start",
          channel,
          userId,
          senderName: currentUserName,
        })
      );
    }

    // 2️⃣ Reset stop-timer
    if (typingRef.current.timer) clearTimeout(typingRef.current.timer);

    typingRef.current.timer = setTimeout(() => {
      typingRef.current.state = "stopped";
      typingRef.current.timer = null;

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            action: "typing",
            state: "stop",
            channel,
            userId,
            senderName: currentUserName,
          })
        );
      }
    }, TYPING_STOP_DELAY);
  };

  // -------------------------------
  // 📎 Handle file selection
  // -------------------------------
  const handleFilePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File too large (max 10MB)");
      return;
    }

    setSelectedFile(file);
  };

  // -------------------------------
  // 📤 Send message or file
  // -------------------------------
  const handleSend = () => {
    const trimmed = text.trim();

    // FILE ONLY
    if (selectedFile && !trimmed) {
      onSendFile(selectedFile);
      clearFile();
      stopTypingImmediate();
      return;
    }

    // TEXT ONLY
    if (trimmed) {
      onSendMessage(trimmed);
      setText("");
      stopTypingImmediate();
    }

    textareaRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // -------------------------------
  // 🛑 Stop typing immediately
  // -------------------------------
  const stopTypingImmediate = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    if (typingRef.current.timer) clearTimeout(typingRef.current.timer);

    typingRef.current.state = "stopped";
    typingRef.current.timer = null;

    ws.send(
      JSON.stringify({
        action: "typing",
        state: "stop",
        channel,
        userId,
        senderName: currentUserName,
      })
    );
  };

  // -------------------------------
  // ❌ Clear selected file
  // -------------------------------
  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // -------------------------------
  // 🧹 Cleanup on unmount
  // -------------------------------
  useEffect(() => {
    return () => stopTypingImmediate();
  }, []);

  return (
    <div className="p-3 bg-gray-900 border-t border-gray-800 flex flex-col gap-2">

      {/* FILE PREVIEW */}
      {selectedFile && (
        <div className="flex items-center justify-between bg-gray-800 p-2 rounded-md">
          <span className="text-gray-300 text-sm truncate">
            📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </span>
          <button onClick={clearFile} className="text-red-400 hover:text-red-300 text-lg">
            ✕
          </button>
        </div>
      )}

      <div className="flex gap-3 items-end">

        {/* FILE PICKER */}
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

        {/* TEXT BOX */}
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

        {/* SEND BUTTON */}
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
