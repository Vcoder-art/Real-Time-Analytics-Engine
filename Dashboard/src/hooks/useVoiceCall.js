import { useEffect, useRef, useState, useCallback } from "react";
/**
 * useVoiceCall
 * - ws: WebSocket instance (connected)
 * - localUserId: current user's id
 * - onIncomingCall({ from, offer }) => should show UI prompt to accept/reject
 *
 * Returns:
 * - startCall(targetUserId)
 * - acceptCall(callPayload) // payload includes from and offer
 * - rejectCall(callPayload)
 * - hangup()
 * - isInCall, isRinging, remoteStreamRef, muted toggle
 */

export default function useVoiceCall({ ws, onIncomingCall }) {
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  const [isInCall, setIsInCall] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [muted, setMuted] = useState(false);
  const pendingCallRef = useRef(null); // store incoming call metadata

  // Default STUN/TURN config - replace with your TURN in production
  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      // { urls: "turn:your-turn-server", username: "...", credential: "..." }
    ],
  };

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(rtcConfig);

    //add remote tracks into remoteStreamRef
    pc.ontrack = (ev) => {
      // ev.streams is an array; append tracks to the single remoteStreamRef
      ev.streams.forEach((s) => {
        s.getTracks().forEach((t) => remoteStreamRef.current.addTrack(t));
      });
    };

    // handle ICE candidate -> send to other peer via WS
    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        ws?.send(
          JSON.stringify({
            action: "ice-candidate",
            to:
              pendingCallRef.current?.peerId ||
              pendingCallRef.current?.from ||
              null,
            candidate: ev.candidate,
          })
        );
      }
    };

    pcRef.current = pc;
    return pc;
  }, [ws]);

  // Acquire microphone
  const getLocalAudio = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
    return stream;
  }, []);

  const cleanup = useCallback(() => {
    try {
      pcRef.current?.close();
    } catch (e) {
      console.log(e);
    }

    pcRef.current = null;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = new MediaStream();
    setIsInCall(false);
    setIsRinging(false);
    pendingCallRef.current = null;
  }, []);

  // Start a call: create offer and send to targetUserId
  const startCall = useCallback(
    async (targetUserId) => {
      pendingCallRef.current = { peerId: targetUserId };

      const pc = createPeerConnection();
      const localStream = await getLocalAudio();
      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // send offer via WebSocket
      ws.send(
        JSON.stringify({
          action: "call-offer",
          to: targetUserId,
          offer,
        })
      );

      setIsRinging(true);

      // return so caller UI can show ringing state
      return;
    },
    [createPeerConnection, getLocalAudio, ws]
  );

  // Accept incomingcontains from and offer) call (callPayload
  const acceptCall = useCallback(
    async (callPayload) => {
      setIsRinging(false);
      setIsInCall(true);
      pendingCallRef.current = callPayload; // { from, offer }

      const pc = createPeerConnection();
      const localStream = await getLocalAudio();
      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream));

      await pc.setRemoteDescription(
        new RTCSessionDescription(callPayload.offer)
      );
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // send answer back
      ws.send(
        JSON.stringify({
          action: "call-answer",
          to: callPayload.from,
          answer,
        })
      );

      return;
    },
    [createPeerConnection, getLocalAudio, ws]
  );

  // Reject incoming call
  const rejectCall = useCallback(
    async (callPayload) => {
      ws.send(
        JSON.stringify({
          action: "call-reject",
          to: callPayload.from,
        })
      );
      setIsRinging(false);
      pendingCallRef.current = null;
    },
    [ws]
  );

  // Hangup (either side)
  const hangup = useCallback(
    async (peerId) => {
      // notify remote
      ws.send(
        JSON.stringify({
          action: "call-end",
          to: peerId,
        })
      );
      cleanup();
    },
    [ws, cleanup]
  );

  // toggle mute
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current
      .getAudioTracks()
      .forEach((t) => (t.enabled = !t.enabled));
    setMuted((prev) => !prev);
  }, []);

  // Handle incoming signaling messages from WS (offer/answer/candidate/end/reject)
  useEffect(() => {
    if (!ws) return;

    const onMessage = async (ev) => {
      let msg = null;
      try {
        msg = JSON.parse(ev.data);
      } catch (e) {
        console.log(e)
        return;
      }

      const { action, from, offer, answer, candidate } = msg;

      if (action === "call-offer") {
        // incoming call
        pendingCallRef.current = { from };
        setIsRinging(true);
        // let UI decide to accept or reject; optionally call onIncomingCall
        onIncomingCall?.({ from, offer });
      }

      if (action === "call-answer") {
        // remote answered our offer
        setIsRinging(false);
        setIsInCall(true);
        if (!pcRef.current) createPeerConnection();
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }

      if (action === "ice-candidate") {
        // add candidate
        if (candidate) {
          try {
            // ensure pc exists
            if (!pcRef.current) createPeerConnection();
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.warn("Failed addIceCandidate", err);
          }
        }
      }

      if (action === "call-end" || action === "call-reject") {
        // remote ended or rejected
        cleanup();
      }
    };

    ws.addEventListener("message", onMessage);
    return () => ws.removeEventListener("message", onMessage);
  }, [ws, onIncomingCall, createPeerConnection, cleanup]);

  // expose remote stream as an object URL or MediaStream
  const getRemoteStream = useCallback(() => {
    return remoteStreamRef.current;
  }, []);

  // expose local stream (for mute UI etc)
  const getLocalStream = useCallback(() => localStreamRef.current, []);

  // cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    startCall,
    acceptCall: (payload) => acceptCall(payload),
    rejectCall,
    hangup,
    toggleMute,
    isInCall,
    isRinging,
    muted,
    getRemoteStream,
    getLocalStream,
  };
}
