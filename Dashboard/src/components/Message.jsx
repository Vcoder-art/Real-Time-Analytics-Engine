import React from "react";
import clsx from "clsx";

export default function MessageItem({ msg, isOwn }) {
  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString()
    : "";

  const isFile = msg.fileUrl ? true : false;

  // Determine file type
  let fileType = "";
  if (isFile) {
    const ext = msg.fileName?.split(".").pop().toLowerCase();
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext))
      fileType = "image";
    else if (["pdf"].includes(ext)) fileType = "pdf";
    else if (["mp4", "mov", "avi"].includes(ext)) fileType = "video";
    else fileType = "file";
  }

  return (
    <div
      className={clsx(
        "flex gap-3 items-end",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar */}
      {!isOwn && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm text-white">
          {msg.senderName?.charAt(0)?.toUpperCase() || "U"}
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={clsx(
          "max-w-[70%] px-4 py-3 rounded-lg break-words",
          isOwn
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-800 text-gray-200 rounded-bl-sm"
        )}
      >
        {/* Sender */}
        {!isOwn && (
          <div className="text-xs text-gray-300 font-semibold mb-1">
            {msg.senderName}
          </div>
        )}

        {/* ===== FILE MESSAGE ===== */}
        {isFile && (
          <div className="space-y-2">

            {/* File Type Previews */}
            {fileType === "image" && (
              <img
                src={"http://192.168.18.109:4000" + msg.fileUrl}
                alt="sent file"
                className="max-h-60 rounded-lg border border-gray-700"
              />
            )}

            {fileType === "video" && (
              <div className="bg-gray-700 p-3 rounded-md text-sm flex items-center justify-between">
                <span>📽️ {msg.fileName}</span>
                <a
                  href={"http://192.168.18.109:4000" + msg.fileUrl}
                  download
                  className="px-2 py-1  text-white rounded text-xs"
                >
                  Download
                </a>
              </div>
            )}

            {fileType === "pdf" && (
              <div className="bg-gray-700 p-3 rounded-md text-sm flex items-center justify-between">
                <span>📄 {msg.fileName}</span>
                <a
                  href={"http://192.168.18.109:4000" + msg.fileUrl}
                  download
                  className="px-2 py-1 text-white rounded text-xs"
                >
                  Download
                </a>
              </div>
            )}

            {/* Generic File */}
            {fileType === "file" && (
              <div className="bg-gray-700 p-3 rounded-md text-sm flex justify-between items-center">
                <span>📎 {msg.fileName}</span>
                <a
                  href={"http://192.168.18.109:4000" + msg.fileUrl}
                  download
                  className="px-2 py-1  text-white rounded text-xs"
                >
                  Download
                </a>
              </div>
            )}

            {/* File Size */}
            {msg.fileSize && (
              <div className="text-xs text-gray-400">
                {(msg.fileSize / 1024).toFixed(1)} KB
              </div>
            )}
          </div>
        )}

        {/* ===== TEXT MESSAGE ===== */}
        {msg.text !== "placeholder" && (
          <div className="text-sm leading-snug whitespace-pre-wrap">
            {msg.text}
          </div>
        )}

        {/* Time */}
        <div className="text-xs text-gray-400 mt-1 text-right">{time}</div>
      </div>

      {isOwn && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm text-white">
          {msg.senderName?.charAt(0)?.toUpperCase() || "U"}
        </div>
      )}
    </div>
  );
}
