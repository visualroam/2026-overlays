import { useEffect, useState } from "react";
import { useBlueBottleContext } from "../../../../BlueBottle";
import { getImagePath } from "../../../../../utils/images";
import { formatTime } from "../../../../../utils/formatTime";
import "./LatestSmiteReaction.scss";

export function LatestSmiteReaction() {
  const { smiteReactionEvents } = useBlueBottleContext();
  const latestEvent = Array.isArray(smiteReactionEvents) && smiteReactionEvents.length > 0
    ? smiteReactionEvents[smiteReactionEvents.length - 1]
    : null;
  const [activeEvent, setActiveEvent] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!latestEvent?.payload) return undefined;

    setActiveEvent(latestEvent);
    setAnimationKey((prev) => prev + 1);

    const timeoutId = window.setTimeout(() => {
      setActiveEvent((current) => {
        if (!current) return null;
        return current?.receivedAt === latestEvent?.receivedAt ? null : current;
      });
    }, 25000);

    return () => window.clearTimeout(timeoutId);
  }, [latestEvent?.receivedAt]);

  if (!activeEvent?.payload) return null;

  const payload = activeEvent.payload;
  const champion = payload?.junglerChampion ?? {};
  const championImagePath = champion?.splashCenteredUrl ?? champion?.splashCenteredImg ?? "";
  const championImage = championImagePath ? getImagePath(championImagePath) : "";
  const championName = champion?.name ?? champion?.alias ?? "Unknown";
  const junglerTeam = Number(payload?.junglerTeam ?? 0);
  const rawReactionSeconds = Number(payload?.reactionTimeSeconds);
  const reactionMs = Number.isFinite(rawReactionSeconds)
    ? Math.round(rawReactionSeconds * 1000)
    : null;
  const reactionDisplay = reactionMs === null
    ? "--"
    : `${reactionMs > 0 ? "+" : ""}${reactionMs}ms`;
  const smiteDamage = Math.round(Number(payload?.smiteDamage ?? 0));
  const wasKillingBlow = Boolean(payload?.wasKillingBlow);
  const smiteLandedTime = Number(payload?.smiteLandedTime ?? 0);
  const statusText = wasKillingBlow ? "SECURED" : "STOLEN";

  return (
    <div
      key={`smite-reaction-latest-${animationKey}`}
      className={`smite-reaction-latest ${wasKillingBlow ? "is-secured" : "is-stolen"} team-${junglerTeam}`}
    >
      <div className="smite-reaction-latest__bg">
        {championImage && <img src={championImage} alt={championName} className="smite-reaction-latest__champion" />}
      </div>
      <div className="smite-reaction-latest__status">{statusText}</div>
      <div className="smite-reaction-latest__content">
        <div className="smite-reaction-latest__reaction-label">REACTION TIME</div>
        <div className="smite-reaction-latest__reaction-value">{reactionDisplay}</div>
        <div className="smite-reaction-latest__reaction-label">SMITED AT</div>
        <div className="smite-reaction-latest__reaction-value dmg">{`${smiteDamage} HP`}</div>
        <div className="smite-reaction-latest__reaction-value time">{formatTime(smiteLandedTime, "00:00")}</div>
      </div>
    </div>
  );
}
