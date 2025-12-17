import React, { useRef, useEffect } from "react";
import useVoiceCall from "../hooks/useVoiceCall";

export default function VoiceCallControls({ ws, localUserId, targetUserId, targetName }) {
  const {
    startCall, acceptCall, rejectCall, hangup, toggleMute,
    isInCall, isRinging, getRemoteStream, muted
  } = useVoiceCall({ ws, localUserId, onIncomingCall: handleIncoming });

  const audioRef = useRef();

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.srcObject = getRemoteStream();
  }, [getRemoteStream, isInCall]);

  function handleIncoming({ from, offer }) {
    // show modal to user: "{from} is calling" -> Accept/Reject
    // On accept: call acceptCall({ from, offer })
    // On reject: call rejectCall({ from })
    // For demo: auto-accept (not recommended):
    // acceptCall({ from, offer });
    // For now, you should show UI prompt
    console.log("Incoming call from ", from);
    // Example: show browser confirm (replace by modal)
    if (confirm(`${from} is calling. Accept?`)) {
      acceptCall({ from, offer });
    } else {
      rejectCall({ from, offer });
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!isInCall && !isRinging && (
        <button onClick={() => startCall(targetUserId)} className="bg-green-500 px-3 py-1 rounded">Call {targetName}</button>
      )}

      {isRinging && <div className="text-yellow-400">Ringing...</div>}

      {isInCall && (
        <>
          <button onClick={() => toggleMute()} className="px-3 py-1 rounded">{muted ? "Unmute" : "Mute"}</button>
          <button onClick={() => hangup(targetUserId)} className="bg-red-500 px-3 py-1 rounded">Hangup</button>
          <audio ref={audioRef} autoPlay />
        </>
      )}
    </div>
  );
}

