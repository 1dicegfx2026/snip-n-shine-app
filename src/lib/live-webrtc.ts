import { supabase } from "@/integrations/supabase/client";

/**
 * Transmisión en vivo peer-to-peer usando la cámara del barbero.
 * La señalización viaja por el canal realtime de Lovable Cloud (gratis) y el
 * video va directo del barbero a cada espectador, sin servidor de video.
 */

const ICE: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"] }],
};

const channelName = (streamId: string) => `live-rtc-${streamId}`;
const randomId = () => Math.random().toString(36).slice(2, 10);

type Payload = Record<string, unknown>;

export interface HostSession {
  stop: () => void;
  onViewers: (cb: (count: number) => void) => void;
}

/** El barbero transmite su cámara. Devuelve una sesión que se cierra con stop(). */
export function startHosting(streamId: string, stream: MediaStream): HostSession {
  const peers = new Map<string, RTCPeerConnection>();
  let viewersCb: ((count: number) => void) | null = null;
  const channel = supabase.channel(channelName(streamId), { config: { broadcast: { self: false } } });

  const announce = () => viewersCb?.(peers.size);

  const send = (event: string, payload: Payload) => {
    void channel.send({ type: "broadcast", event, payload });
  };

  const createPeer = async (viewerId: string) => {
    peers.get(viewerId)?.close();
    const pc = new RTCPeerConnection(ICE);
    peers.set(viewerId, pc);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pc.onicecandidate = (e) => {
      if (e.candidate) send("ice-host", { to: viewerId, candidate: e.candidate.toJSON() });
    };
    pc.onconnectionstatechange = () => {
      if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
        pc.close();
        peers.delete(viewerId);
        announce();
      }
    };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    send("offer", { to: viewerId, sdp: offer });
    announce();
  };

  channel
    .on("broadcast", { event: "viewer-join" }, ({ payload }) => {
      const viewerId = (payload as { viewerId?: string }).viewerId;
      if (viewerId) void createPeer(viewerId);
    })
    .on("broadcast", { event: "answer" }, ({ payload }) => {
      const { from, sdp } = payload as { from: string; sdp: RTCSessionDescriptionInit };
      const pc = peers.get(from);
      if (pc) void pc.setRemoteDescription(new RTCSessionDescription(sdp));
    })
    .on("broadcast", { event: "ice-viewer" }, ({ payload }) => {
      const { from, candidate } = payload as { from: string; candidate: RTCIceCandidateInit };
      const pc = peers.get(from);
      if (pc && candidate) void pc.addIceCandidate(new RTCIceCandidate(candidate));
    })
    .on("broadcast", { event: "viewer-leave" }, ({ payload }) => {
      const { from } = payload as { from: string };
      peers.get(from)?.close();
      peers.delete(from);
      announce();
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") send("host-online", {});
    });

  return {
    stop: () => {
      send("host-offline", {});
      peers.forEach((pc) => pc.close());
      peers.clear();
      void supabase.removeChannel(channel);
    },
    onViewers: (cb) => {
      viewersCb = cb;
      announce();
    },
  };
}

export interface ViewerSession {
  stop: () => void;
}

/** El espectador se conecta a la cámara del barbero. */
export function startViewing(
  streamId: string,
  onTrack: (stream: MediaStream) => void,
  onState?: (state: "connecting" | "live" | "offline") => void,
): ViewerSession {
  const viewerId = randomId();
  const channel = supabase.channel(channelName(streamId), { config: { broadcast: { self: false } } });
  let pc: RTCPeerConnection | null = null;

  const send = (event: string, payload: Payload) => {
    void channel.send({ type: "broadcast", event, payload });
  };

  onState?.("connecting");

  channel
    .on("broadcast", { event: "offer" }, async ({ payload }) => {
      const { to, sdp } = payload as { to: string; sdp: RTCSessionDescriptionInit };
      if (to !== viewerId) return;
      pc?.close();
      pc = new RTCPeerConnection(ICE);
      pc.ontrack = (e) => {
        onTrack(e.streams[0]!);
        onState?.("live");
      };
      pc.onicecandidate = (e) => {
        if (e.candidate) send("ice-viewer", { from: viewerId, candidate: e.candidate.toJSON() });
      };
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      send("answer", { from: viewerId, sdp: answer });
    })
    .on("broadcast", { event: "ice-host" }, ({ payload }) => {
      const { to, candidate } = payload as { to: string; candidate: RTCIceCandidateInit };
      if (to !== viewerId || !pc || !candidate) return;
      void pc.addIceCandidate(new RTCIceCandidate(candidate));
    })
    .on("broadcast", { event: "host-online" }, () => send("viewer-join", { viewerId }))
    .on("broadcast", { event: "host-offline" }, () => onState?.("offline"))
    .subscribe((status) => {
      if (status === "SUBSCRIBED") send("viewer-join", { viewerId });
    });

  return {
    stop: () => {
      send("viewer-leave", { from: viewerId });
      pc?.close();
      void supabase.removeChannel(channel);
    },
  };
}
