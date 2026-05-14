/**
 * Minimal WHEP (WebRTC-HTTP Egress Protocol) client.
 *
 * Spec: https://datatracker.ietf.org/doc/draft-ietf-wish-whep/
 *
 * Flow:
 *   1. Build an RTCPeerConnection with recvonly video + audio transceivers.
 *   2. Create an SDP offer and POST it to the WHEP URL as `application/sdp`.
 *   3. Server replies with `application/sdp` answer and (optionally) a
 *      `Location` header pointing at the resource for teardown.
 *   4. Apply the answer; tracks arrive via `ontrack`.
 *   5. On close, DELETE the resource if a Location was returned.
 */

const DEFAULT_ICE = [{ urls: "stun:stun.l.google.com:19302" }];

export async function connectWhep(url, opts = {}) {
    const pc = new RTCPeerConnection({ iceServers: opts.iceServers || DEFAULT_ICE });

    const stream = new MediaStream();
    pc.addTransceiver("video", { direction: "recvonly" });
    pc.addTransceiver("audio", { direction: "recvonly" });

    pc.ontrack = (event) => {
        const incoming = event.streams[0];
        if (incoming) {
            incoming.getTracks().forEach((t) => stream.addTrack(t));
        } else {
            stream.addTrack(event.track);
        }
    };

    await pc.setLocalDescription(await pc.createOffer());
    await waitForIceGatheringComplete(pc);

    const offerSdp = pc.localDescription && pc.localDescription.sdp;
    if (!offerSdp) throw new Error("WHEP: no local SDP after gathering");

    const headers = {
        "Content-Type": "application/sdp",
        Accept: "application/sdp",
    };
    if (opts.authToken) headers.Authorization = `Bearer ${opts.authToken}`;

    const res = await fetch(url, { method: "POST", headers, body: offerSdp });
    if (!res.ok) {
        pc.close();
        throw new Error(`WHEP POST ${url} failed: ${res.status} ${res.statusText}`);
    }

    const answerSdp = await res.text();
    const location = res.headers.get("Location");
    const resourceUrl = location ? new URL(location, url).toString() : null;

    await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

    const close = async () => {
        try {
            if (resourceUrl) {
                await fetch(resourceUrl, {
                    method: "DELETE",
                    headers: opts.authToken
                        ? { Authorization: `Bearer ${opts.authToken}` }
                        : undefined,
                }).catch(() => undefined);
            }
        } finally {
            pc.getSenders().forEach((s) => s.track && s.track.stop());
            pc.close();
        }
    };

    return { pc, stream, close };
}

function waitForIceGatheringComplete(pc) {
    if (pc.iceGatheringState === "complete") return Promise.resolve();
    return new Promise((resolve) => {
        const check = () => {
            if (pc.iceGatheringState === "complete") {
                pc.removeEventListener("icegatheringstatechange", check);
                resolve();
            }
        };
        pc.addEventListener("icegatheringstatechange", check);
        // Hard cap so we don't hang if a server never signals completion.
        setTimeout(() => {
            pc.removeEventListener("icegatheringstatechange", check);
            resolve();
        }, 3000);
    });
}
