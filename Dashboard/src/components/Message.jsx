import React from "react";
import clsx from "clsx";

/**
 * MessageItem
 * props:
 *  - msg: { text, sender, timestamp }
 *  - isOwn: boolean
 */
export default function MessageItem({ msg, isOwn }) {
  console.log(isOwn)
  const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : "";
  return (
    <div className={clsx("flex gap-3 items-end", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm text-white">
          {msg.sender ? msg.sender.charAt(0).toUpperCase() : "U"}
        </div>
      )}

      <div className={clsx(
        "max-w-[70%] px-4 py-2 rounded-lg break-words",
        isOwn ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-800 text-gray-200 rounded-bl-sm"
      )}>
        <div className="text-xs text-gray-300 mb-1">{!isOwn && <span className="font-semibold mr-2">{msg.sender}</span>}</div>
        <div className="text-sm leading-snug">{msg.text}</div>
        <div className="text-xs text-gray-400 mt-1 text-right">{time}</div>
      </div>

      {isOwn && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm text-white">
          {msg.sender ? msg.sender.charAt(0).toUpperCase() : "U"}
        </div>
      )}
    </div>
  );
}
