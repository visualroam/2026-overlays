import { useMemo, useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { useBlueBottleContext } from "../../../../BlueBottle";
import { getImagePath } from "../../../../../utils/images";
import { formatTime } from "../../../../../utils/formatTime";
import { map } from "../../../../../utils/map";
import { formatGold } from "../../../../../utils/formatGold";
import { ReactComponent as ArrowUp } from "../../../../../assets/icons/arrow-up.svg";
import { WhepCyclerProvider, WhepCyclerSide } from "../../../whep/WhepCycler";
import "./BottomScoreboard.scss";

export function BottomScoreboard() {
  return <div className="bottom-scoreboard">
    <GoldGraph />
    <BottomScoreboardChampions />
    <SkinDisplay />
    <RunesDisplay />
    <TeamfightWithDamage />
  </div>;
}

function GoldGraph() {
  const { ingameState } = useBlueBottleContext();
  const rawData = ingameState?.goldGraph?.current?.goldAtTime ?? {};

  const data = useMemo(() => {
    const points = Object.keys(rawData)
      .map((key) => {
        const point = rawData?.[key];
        const x = Number(key);
        let blueGold = 0;
        let redGold = 0;

        if (Array.isArray(point)) {
          blueGold = Number(point?.[1] ?? 0);
          redGold = Number(point?.[2] ?? 0);
        } else if (point && typeof point === "object") {
          blueGold = Number(point?.[1] ?? point?.["1"] ?? 0);
          redGold = Number(point?.[2] ?? point?.["2"] ?? 0);
        } else {
          return null;
        }

        const y = blueGold - redGold;
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
        return { x, y };
      })
      .filter(Boolean)
      .sort((a, b) => a.x - b.x);
    return points;
  }, [rawData]);

  return (
    <div className={`gold-graph ${data.length > 1 ? "active" : "inactive"}`}>
      <GoldGraphChart data={data} />
    </div>
  );
}

function GoldGraphChart({ data }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!Array.isArray(data) || data.length < 2 || !ref.current) return;

    const insertZeroCrossings = (points) => {
      if (!Array.isArray(points) || points.length < 2) return points;
      const newData = [];
      for (let i = 0; i < points.length - 1; i += 1) {
        const d1 = points[i];
        const d2 = points[i + 1];
        newData.push(d1);

        if ((d1.y > 0 && d2.y < 0) || (d1.y < 0 && d2.y > 0)) {
          const x0 = d1.x + (d2.x - d1.x) * ((0 - d1.y) / (d2.y - d1.y));
          newData.push({ x: x0, y: 0 });
        }
      }
      newData.push(points[points.length - 1]);
      return newData;
    };

    const processedData = insertZeroCrossings(data);

    const parentWidth = ref.current?.parentElement?.clientWidth ?? 900;
    const width = Math.max(420, parentWidth - 8);
    const height = 260;
    const margin = { top: 20, right: 55, bottom: 35, left: 55 };

    d3.select(ref.current).selectAll("*").remove();
    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(processedData, (d) => d.x))
      .range([margin.left, width - margin.right]);

    const absMaxY = d3.max(processedData, (d) => Math.abs(d.y)) || 0;
    const maxValY = Math.ceil(absMaxY / 500) * 500 + 500;
    const minValY = -maxValY;
    const formatDiffTick = (value) => {
      const safeValue = Number(value) || 0;
      if (safeValue === 0) return "0";
      const abs = Math.abs(safeValue);
      if (abs >= 1000) {
        return `${safeValue > 0 ? "+" : "-"}${formatGold(abs)}k`;
      }
      return `${Math.round(safeValue)}`;
    };

    const y = d3
      .scaleLinear()
      .domain([minValY, maxValY])
      .range([height - margin.bottom, margin.top]);

    const lineAbove = d3
      .line()
      .defined((d) => d.y >= 0)
      .x((d) => x(d.x))
      .y((d) => y(d.y));

    const lineBelow = d3
      .line()
      .defined((d) => d.y <= 0)
      .x((d) => x(d.x))
      .y((d) => y(d.y));

    const areaAbove = d3
      .area()
      .defined((d) => d.y >= 0)
      .x((d) => x(d.x))
      .y0(y(0))
      .y1((d) => y(d.y));

    const areaBelow = d3
      .area()
      .defined((d) => d.y <= 0)
      .x((d) => x(d.x))
      .y0(y(0))
      .y1((d) => y(d.y));

    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "gold-graph-clip")
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom);

    const defs = svg.append("defs");
    const gradAbove = defs
      .append("linearGradient")
      .attr("id", "gold-graph-grad-above")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", y(0))
      .attr("x2", 0)
      .attr("y2", y(maxValY));
    gradAbove
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "var(--blueSide)")
      .attr("stop-opacity", 0.08);
    gradAbove
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "var(--blueSide)")
      .attr("stop-opacity", 0.75);

    const gradBelow = defs
      .append("linearGradient")
      .attr("id", "gold-graph-grad-below")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", y(0))
      .attr("x2", 0)
      .attr("y2", y(minValY));
    gradBelow
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "var(--redSide)")
      .attr("stop-opacity", 0.08);
    gradBelow
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "var(--redSide)")
      .attr("stop-opacity", 0.72);

    const xAxis = d3
      .axisBottom(x)
      .ticks(10)
      .tickFormat((d) => formatTime(d));
    const yAxis = d3
      .axisLeft(y)
      .tickValues([minValY, 0, maxValY])
      .tickFormat((d) => formatDiffTick(d));

    const axisBottom = svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    const axisLeft = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

    axisBottom
      .selectAll("line, path")
      .attr("stroke", "rgba(255, 255, 255, 0.35)");
    axisLeft
      .selectAll("line, path")
      .attr("stroke", "rgba(255, 255, 255, 0.35)");
    axisBottom
      .selectAll("text")
      .attr("fill", "rgba(255, 255, 255, 0.85)")
      .attr("font-size", "11px");
    axisLeft
      .selectAll("text")
      .attr("fill", "rgba(255, 255, 255, 0.9)")
      .attr("font-size", "11px")
      .attr("font-weight", "600");

    const chartContent = svg
      .append("g")
      .attr("clip-path", "url(#gold-graph-clip)");

    chartContent
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke", "rgba(255, 255, 255, 0.85)")
      .attr("stroke-width", 1);

    chartContent
      .append("path")
      .datum(processedData)
      .attr("fill", "url(#gold-graph-grad-above)")
      .attr("opacity", 0.95)
      .attr("d", areaAbove);

    chartContent
      .append("path")
      .datum(processedData)
      .attr("fill", "url(#gold-graph-grad-below)")
      .attr("opacity", 0.95)
      .attr("d", areaBelow);

    chartContent
      .append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "var(--blueSide)")
      .attr("stroke-width", 1.2)
      .attr("d", lineAbove);

    chartContent
      .append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "var(--redSide)")
      .attr("stroke-width", 1.2)
      .attr("d", lineBelow);

    const lastPoint = processedData[processedData.length - 1];
    const lastVal = lastPoint?.y ?? 0;
    const labelColor = lastVal > 0
      ? "var(--blueSide)"
      : lastVal < 0
        ? "var(--redSide)"
        : "var(--primary)";

    svg
      .append("text")
      .attr("x", width - margin.right + 35)
      .attr("y", y(lastVal))
      .attr("fill", labelColor)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("font-size", "12px")
      .attr("font-weight", "700")
      .text(formatDiffTick(lastVal));
  }, [data]);

  return (
    <>
      <div className="gold-difference-graph-header">Gold Difference over Time</div>
      <svg ref={ref} className="gold-graph-svg"></svg>
    </>
  );
}

function TeamfightWithDamage() {
  const { ingameState } = useBlueBottleContext();

  const [persistentTeamfightDamageOverview
    , setPersistentTeamfightDamageOverview] = useState(null);

  useEffect(() => {
    if(ingameState?.teamfightDamageOverview !== null && ingameState?.teamfightDamageOverview !== undefined) {
      setPersistentTeamfightDamageOverview(ingameState?.teamfightDamageOverview);
    }
  }, [ingameState?.teamfightDamageOverview]);

  const teamfightDamageOverview = ingameState?.teamfightDamageOverview ?? null;
  const show = teamfightDamageOverview !== null && teamfightDamageOverview !== undefined;

  let damageDealt = persistentTeamfightDamageOverview?.damageDealt ?? [];
  let blueDamageDealt = damageDealt?.filter((d) => d?.team === 1) ?? [];
  let redDamageDealt = damageDealt?.filter((d) => d?.team === 2) ?? [];

  console.log(blueDamageDealt, redDamageDealt, teamfightDamageOverview, persistentTeamfightDamageOverview, show);

  return <div className={`teamfight-with-damage ${show ? "show" : "hide"}`}>
    {blueDamageDealt.map((player) => <TeamfightWithDamageChampion player={player} />)}
    {redDamageDealt.map((player) => <TeamfightWithDamageChampion player={player} />)}
  </div>;
}

const TeamfightWithDamageChampion = ({ player }) => {
  let image = getImagePath(`${player?.champion?.splashCenteredImg ?? player?.champion?.squareImg ?? ""}`);
  let lvl = player?.level ?? 0;

  let abilities = player?.abilities ?? [];
  let ultimate = abilities?.find((a) => a?.slot === "R") ?? {};
  let spell1 = abilities?.find((a) => a?.slot === "D") ?? {};
  let spell2 = abilities?.find((a) => a?.slot === "F") ?? {};

  let ultimateImage = getImagePath(`${ultimate?.assets?.iconAsset ?? ""}`);
  let spell1Image = getImagePath(`${spell1?.assets?.iconAsset ?? ""}`);
  let spell2Image = getImagePath(`${spell2?.assets?.iconAsset ?? ""}`);

  let spell1TotalCooldown = spell1?.totalCooldown ?? 0;
  let spell1CurrentCooldown = spell1?.cooldown ?? 0;
  let spell2TotalCooldown = spell2?.totalCooldown ?? 0;
  let spell2CurrentCooldown = spell2?.cooldown ?? 0;
  let ultimateTotalCooldown = ultimate?.totalCooldown ?? 0;
  let ultimateCurrentCooldown = ultimate?.cooldown ?? 0;

  let respawnTimer = player?.respawnTime ?? 0;
  let respawning = respawnTimer > 0;

  let activeItems = player?.activeItems ?? [];

  let maxHealth = player?.maxHealth ?? 0;
  let health = player?.health ?? 0;

  let damgeByType = player?.damageByType ?? {};

  let physicalDamage = damgeByType?.Physical ?? 0;
  let magicDamage = damgeByType?.Magical ?? 0;
  let trueDamage = damgeByType?.True ?? 0;
  let damageTotal = physicalDamage + magicDamage + trueDamage;
  let physicalPercentage = map(physicalDamage, 0, damageTotal, 0, 100);
  let magicPercentage = map(magicDamage, 0, damageTotal, 0, 100);
  let truePercentage = map(trueDamage, 0, damageTotal, 0, 100);

  let formattedPhysicalDamage = physicalDamage > 1000 ? `${formatGold(Math.round(physicalDamage))}k` : Math.round(physicalDamage);
  let formattedMagicDamage = magicDamage > 1000 ? `${formatGold(Math.round(magicDamage))}k` : Math.round(magicDamage);
  let formattedTrueDamage = trueDamage > 1000 ? `${formatGold(Math.round(trueDamage))}k` : Math.round(trueDamage);

  let showPhysicalDamage = physicalDamage > 0;
  let showMagicDamage = magicDamage > 0;
  let showTrueDamage = trueDamage > 0;

  return <div className={`teamfight-with-damage-champion ${respawning ? "respawning" : ""}`}>

    {respawning && <div className="teamfight-with-damage-champion-respawn-timer">{Math.round(respawnTimer)}</div>}

    <div className="teamfight-with-damage-champion-lvl">{lvl}</div>
    <ImageWithCooldown image={spell1Image} total={spell1TotalCooldown} current={spell1CurrentCooldown} className="spell-1" />
    <ImageWithCooldown image={spell2Image} total={spell2TotalCooldown} current={spell2CurrentCooldown} className="spell-2" />
    <ImageWithCooldown image={ultimateImage} total={ultimateTotalCooldown} current={ultimateCurrentCooldown} className="ultimate" />

    <div className="items">
      {activeItems.map((item) => <ImageWithCooldown image={getImagePath(`${item?.assetUrl ?? ""}`)} total={item?.maxCooldown ?? 0} current={item?.cooldown ?? 0} className="item" />)}
    </div>

    <Bar current={health} max={maxHealth} orientation="horizontal" type="health" />

    <div className="damage-by-type">
      <div className="damage-by-type-physical" style={{ width: `${physicalPercentage}%`, display: showPhysicalDamage ? "block" : "none" }}>{physicalPercentage > 20 ? formattedPhysicalDamage : ""}</div>
      <div className="damage-by-type-magic" style={{ width: `${magicPercentage}%`, display: showMagicDamage ? "block" : "none" }}>{magicPercentage > 20 ? formattedMagicDamage : ""}</div>
      <div className="damage-by-type-true" style={{ width: `${truePercentage}%`, display: showTrueDamage ? "block" : "none" }}>{truePercentage > 20 ? formattedTrueDamage : ""}</div>
    </div>

    <div className="teamfight-with-damage-champion-img"><img src={image} /></div>
  </div>;
};

function SkinDisplay() {
  const STEP_MS = 5000;
  const TRANSITION_MS = 550;
  const { ingameState } = useBlueBottleContext();
  const { skinDisplay } = ingameState ?? {};
  const [persistentSkinDisplay, setPersistentSkinDisplay] = useState(skinDisplay);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [nextPairIndex, setNextPairIndex] = useState(null);
  const [show, setShow] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const skinDisplayKey = useMemo(() => {
    const teams = skinDisplay?.teams ?? [];
    const bluePlayers = teams?.[0]?.players ?? [];
    const redPlayers = teams?.[1]?.players ?? [];
    const pairCount = Math.min(bluePlayers.length, redPlayers.length);

    if (!skinDisplay || pairCount <= 0) return null;

    const blueKey = bluePlayers
      .map((p) => `${p?.name ?? ""}:${p?.championName ?? p?.champion?.name ?? ""}:${p?.skinName ?? ""}`)
      .join("|");
    const redKey = redPlayers
      .map((p) => `${p?.name ?? ""}:${p?.championName ?? p?.champion?.name ?? ""}:${p?.skinName ?? ""}`)
      .join("|");
    return `${pairCount}::${blueKey}::${redKey}`;
  }, [skinDisplay]);

  useEffect(() => {
    if (skinDisplayKey === null) {
      setShow(false);
      return undefined;
    }

    const teams = skinDisplay?.teams ?? [];
    const bluePlayers = teams?.[0]?.players ?? [];
    const redPlayers = teams?.[1]?.players ?? [];
    const pairCount = Math.min(bluePlayers.length, redPlayers.length);

    if (pairCount <= 0) {
      setShow(false);
      return undefined;
    }

    setPersistentSkinDisplay(skinDisplay);
    setCurrentPairIndex(0);
    setShow(true);
    setIsTransitioning(false);
    setNextPairIndex(null);
    let transitionTimeout = null;
    let stepTimeout = null;
    let hideTimeout = null;
    let rafId = null;

    if (pairCount === 1) {
      hideTimeout = setTimeout(() => {
        setShow(false);
      }, STEP_MS);

      return () => {
        clearTimeout(hideTimeout);
        if (transitionTimeout) clearTimeout(transitionTimeout);
        if (stepTimeout) clearTimeout(stepTimeout);
        if (rafId) cancelAnimationFrame(rafId);
      };
    }

    const scheduleNextTransition = (pairIndex) => {
      const upcomingPairIndex = pairIndex + 1;
      if (upcomingPairIndex >= pairCount) {
        hideTimeout = setTimeout(() => {
          setShow(false);
        }, STEP_MS);
        return;
      }

      stepTimeout = setTimeout(() => {
        setNextPairIndex(upcomingPairIndex);
        rafId = requestAnimationFrame(() => {
          setIsTransitioning(true);
        });

        transitionTimeout = setTimeout(() => {
          setCurrentPairIndex(upcomingPairIndex);
          setNextPairIndex(null);
          setIsTransitioning(false);
          scheduleNextTransition(upcomingPairIndex);
        }, TRANSITION_MS);
      }, STEP_MS);
    };

    scheduleNextTransition(0);

    return () => {
      if (stepTimeout) clearTimeout(stepTimeout);
      if (transitionTimeout) clearTimeout(transitionTimeout);
      if (hideTimeout) clearTimeout(hideTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [skinDisplayKey, STEP_MS, TRANSITION_MS]);

  let teams = persistentSkinDisplay?.teams ?? [];
  let bluePlayers = teams?.[0]?.players ?? [];
  let redPlayers = teams?.[1]?.players ?? [];
  let currentBluePlayer = bluePlayers?.[currentPairIndex] ?? null;
  let currentRedPlayer = redPlayers?.[currentPairIndex] ?? null;
  const hasCurrentPair = currentBluePlayer !== null && currentRedPlayer !== null;
  let nextBluePlayer = nextPairIndex !== null ? (bluePlayers?.[nextPairIndex] ?? null) : null;
  let nextRedPlayer = nextPairIndex !== null ? (redPlayers?.[nextPairIndex] ?? null) : null;
  const hasNextPair = nextBluePlayer !== null && nextRedPlayer !== null;

  return <div className={`skin-display ${show ? "show" : ""}`}>
    {hasCurrentPair && <>
      <div className="skin-display-title">Skin Battle</div>
      <div key={`current-${currentPairIndex}`} className={`skin-display-pair current ${isTransitioning ? "is-sliding-out" : ""}`}>
        <SkinDisplayChampion player={currentBluePlayer} team="blue" />
        <SkinDisplayChampion player={currentRedPlayer} team="red" />
      </div>
      {hasNextPair && <div key={`next-${nextPairIndex}`} className={`skin-display-pair next ${isTransitioning ? "is-sliding-in" : ""}`}>
        <SkinDisplayChampion player={nextBluePlayer} team="blue" />
        <SkinDisplayChampion player={nextRedPlayer} team="red" />
      </div>}
      <div className="skin-display-vs">VS</div>
    </>}
  </div>;
}

function SkinDisplayChampion({ player, team }) {
  let image = `${player?.splashCenteredUrl}`;
  let championName = player?.championName ?? player?.champion?.name ?? "";
  let skinName = player?.skinName ?? "";
  let playerName = (player?.name ?? "").split("#")[0] ?? "";

  return <div className={`skin-display-champion ${team}`}>
    <img src={image} />
    {championName && <div className="skin-display-champion-champion-name">{championName}</div>}
    <div className="skin-display-champion-name">{playerName}</div>
    <div className="skin-display-champion-skin-name">{skinName}</div>
  </div>;
}

const EMPTY_RUNE_ENTRIES = [];

function buildRuneColumns(runeEntries) {
  const entries = Array.isArray(runeEntries) ? runeEntries : [];
  const blueEntries = entries.filter((entry) => Number(entry?.team) === 1);
  const redEntries = entries.filter((entry) => Number(entry?.team) === 2);
  const pairCount = Math.min(blueEntries.length, redEntries.length);
  const blueColumns = Array.from({ length: pairCount }, (_, index) => ({
    entry: blueEntries[index] ?? null,
    team: "blue",
    key: `blue-${index}`,
  }));
  const redColumns = Array.from({ length: pairCount }, (_, index) => ({
    entry: redEntries[index] ?? null,
    team: "red",
    key: `red-${index}`,
  }));
  return [...blueColumns, ...redColumns].filter((column) => column.entry);
}

function runesDisplayContentKey(runeEntries) {
  const columns = buildRuneColumns(runeEntries);
  if (columns.length === 0) return null;
  return columns
    .map((column) => {
      const perks = Array.isArray(column.entry?.perks) ? column.entry.perks : [];
      const perkKey = perks.map((perk) => `${perk?.id ?? ""}:${perk?.iconPath ?? ""}`).join("|");
      return `${column.key}:${column.entry?.champion?.id ?? ""}:${perkKey}`;
    })
    .join("||");
}

function RunesDisplay() {
  const { ingameState } = useBlueBottleContext();
  const runeEntries = Array.isArray(ingameState?.runes?.runes)
    ? ingameState.runes.runes
    : EMPTY_RUNE_ENTRIES;
  const runesDisplayKey = useMemo(() => runesDisplayContentKey(runeEntries), [runeEntries]);

  const [runeColumns, setRuneColumns] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (runesDisplayKey === null) {
      setShow(false);
      setRuneColumns([]);
      return undefined;
    }

    const columns = buildRuneColumns(runeEntries);
    if (columns.length === 0) {
      setShow(false);
      setRuneColumns([]);
      return undefined;
    }

    setRuneColumns(columns);
    setShow(true);
    return undefined;
  }, [runesDisplayKey, runeEntries]);

  return (
    <div className={`runes-display ${show ? "show" : ""}`}>
      {show && runeColumns.length > 0 && (
        <div className="runes-display-inner">
          <div className="runes-display-all">
            {runeColumns.map((column) => (
              <RunesDisplayChampion
                key={`rune-column-${column.key}`}
                entry={column.entry}
                team={column.team}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RunesDisplayChampion({ entry, team }) {
  const image = getImagePath(`${entry?.champion?.splashCenteredImg ?? entry?.champion?.squareImg ?? ""}`);
  const championName = entry?.champion?.name ?? "";
  const playerName = (entry?.name ?? "").split("#")[0] ?? "";
  const perks = Array.isArray(entry?.perks) ? entry.perks : [];
  const keystone = perks?.[0] ?? null;
  const primaryTreeRunes = Array.from({ length: 3 }, (_, index) => perks?.[index + 1] ?? null);
  const secondaryTreeRunes = Array.from({ length: 2 }, (_, index) => perks?.[index + 4] ?? null);
  const shards = Array.from({ length: 3 }, (_, index) => perks?.[index + 6] ?? null);

  const renderRuneIcon = (perk, key, className = "") => {
    const icon = perk ? getImagePath(`${perk?.iconPath ?? ""}`) : "";
    return <div key={key} className={`runes-display-rune-icon ${className} ${perk ? "" : "empty"}`}>
      {perk && <img src={icon} alt={perk?.name ?? ""} />}
    </div>;
  };

  return <div className={`runes-display-champion ${team}`}>
    <img src={image} className="runes-display-bg" />
    <div className="runes-display-overlay" />
    <div className="runes-display-header-text">
      {championName && <div className="runes-display-champion-name">{championName}</div>}
      <div className="runes-display-player-name">{playerName}</div>
    </div>
    <div className="runes-display-keystone">
      {renderRuneIcon(keystone, `${keystone?.id ?? "keystone"}-main`, "keystone")}
    </div>
    <div className="runes-display-tree primary">
      {primaryTreeRunes.map((perk, index) => renderRuneIcon(perk, `${perk?.id ?? "primary"}-${index}`, "tree-rune"))}
    </div>
    <div className="runes-display-tree secondary">
      {secondaryTreeRunes.map((perk, index) => renderRuneIcon(perk, `${perk?.id ?? "secondary"}-${index}`, "tree-rune"))}
    </div>
    <div className="runes-display-tree shards">
      {shards.map((perk, index) => renderRuneIcon(perk, `${perk?.id ?? "shard"}-${index}`, "shard-rune"))}
    </div>
  </div>;
}

function BottomScoreboardChampions() {

  const { ingameState } = useBlueBottleContext();
  const { scoreboardBottom, tabs } = ingameState ?? {};
  const [persistentScoreboard, setPersistentScoreboard] = useState(null);
  const [persistentTabs, setPersistentTabs] = useState(null);

  const show = scoreboardBottom !== null && scoreboardBottom !== undefined && tabs !== null && tabs !== undefined;

  useEffect(() => {
    if(scoreboardBottom !== null && scoreboardBottom !== undefined) {
      setPersistentScoreboard(scoreboardBottom);
    }
    if(tabs !== null && tabs !== undefined) {
      setPersistentTabs(tabs);
    }
  }, [scoreboardBottom, tabs]);

  return <WhepCyclerProvider>
    <div className={`bottom-scoreboard-champions ${show ? "show" : "hide"}`}>
      <div className="bottom-scoreboard-champions__cam-col bottom-scoreboard-champions__cam-col--left" aria-hidden="true">
        <WhepCyclerSide which="a" />
      </div>
      <div className="bottom-scoreboard-champions__rows">
        <BottomScoreboardChampionRow index={0} tabs={persistentTabs} scoreboard={persistentScoreboard} />
        <BottomScoreboardChampionRow index={1} tabs={persistentTabs} scoreboard={persistentScoreboard} />
        <BottomScoreboardChampionRow index={2} tabs={persistentTabs} scoreboard={persistentScoreboard} />
        <BottomScoreboardChampionRow index={3} tabs={persistentTabs} scoreboard={persistentScoreboard} />
        <BottomScoreboardChampionRow index={4} tabs={persistentTabs} scoreboard={persistentScoreboard} />
      </div>
      <div className="bottom-scoreboard-champions__cam-col bottom-scoreboard-champions__cam-col--right" aria-hidden="true">
        <WhepCyclerSide which="b" />
      </div>
    </div>
  </WhepCyclerProvider>;
}

const BottomScoreboardChampionRow = ({ index, scoreboard }) => {
  const teams = scoreboard?.teams ?? [];
  const blueTeam = teams?.[0] ?? {};
  const redTeam = teams?.[1] ?? {};
  const bluePlayer = blueTeam?.players?.[index] ?? {};
  const redPlayer = redTeam?.players?.[index] ?? {};
  const blueGold = bluePlayer?.totalGold ?? 0;
  const redGold = redPlayer?.totalGold ?? 0;
  const diffGold = blueGold - redGold;

  return <div className="bottom-scoreboard-champion-row">
    <BottomScoreboardChampion index={index} side="blue" />
    <BottomScoreboardChampionGoldDiff diff={diffGold} />
    <BottomScoreboardChampion index={index} side="red" />
  </div>;
};

const BottomScoreboardChampion = ({ index, side }) => {

  const { ingameState } = useBlueBottleContext();
  const { scoreboardBottom, tabs } = ingameState ?? {};
  const teams = scoreboardBottom?.teams ?? [];
  const tabKey = side === "blue" ? "Order" : "Chaos";
  const tabTeam = tabs?.[tabKey] ?? {};
  const team = teams?.[side === "blue" ? 0 : 1] ?? {};
  const players = Array.isArray(team?.players) ? team.players : [];
  const tabPlayers = Array.isArray(tabTeam?.players) ? tabTeam.players : [];
  const player = players[index] ?? {};
  const tabPlayer = tabPlayers[index] ?? {};
  const champion = player?.champion ?? {};

  const cs = player?.creepScore ?? 0;
  const kills = player?.kills ?? 0;
  const deaths = player?.deaths ?? 0;
  const assists = player?.assists ?? 0;
  const level = player?.level ?? 0;
  const summonerName = (player?.name ?? champion?.name ?? "").split("#")[0] ?? "";
  const items = player?.items ?? [];
  const visionScore = player?.visionScore ?? 0;
  const shutdown = (player?.shutdown ?? 0);

  const xpCurrent = tabPlayer?.experience?.current ?? 0;
  const xpNext = tabPlayer?.experience?.nextLevel ?? 0;

  const healthCurrent = tabPlayer?.health?.current ?? 0;
  const healthMax = tabPlayer?.health?.max ?? 0;

  const manaCurrent = tabPlayer?.resource?.current ?? 0;
  const manaType = tabPlayer?.resource?.type ?? "";
  const manaMax = tabPlayer?.resource?.max ?? 0;
  const timeToRespawn = tabPlayer?.timeToRespawn ?? 0;

  const hasElder = (tabPlayer?.hasElder ?? false);
  const hasBaron = (tabPlayer?.hasBaron ?? false);
  const championImageClassName = [
    "champion-image",
    hasBaron ? "has-baron" : null,
    hasElder ? "has-elder" : null,
  ]
    .filter(Boolean)
    .join(" ");

  const abilities = Array.isArray(tabPlayer?.abilities) ? tabPlayer.abilities : [];
  const ultimate = abilities.find((a) => a?.slot == "R") ?? {};
  const ultimateImage = getImagePath(`${ultimate?.assets?.iconAsset}`) ?? "";
  const ultimateTotalCooldown = ultimate?.totalCooldown ?? 0;
  const ultimateCurrentCooldown = ultimate?.cooldown ?? 0;

  const spell1 = abilities.find((a) => a?.slot == "D") ?? {};
  const spell1Image = getImagePath(`${spell1?.assets?.iconAsset}`) ?? "";
  const spell1TotalCooldown = spell1?.totalCooldown ?? 0;
  const spell1CurrentCooldown = spell1?.cooldown ?? 0;

  const spell2 = abilities.find((a) => a?.slot == "F") ?? {};
  const spell2Image = getImagePath(`${spell2?.assets?.iconAsset}`) ?? "";
  const spell2TotalCooldown = spell2?.totalCooldown ?? 0;
  const spell2CurrentCooldown = spell2?.cooldown ?? 0;

  return <div className={`bottom-scoreboard-champion ${side} ${timeToRespawn > 0 ? "dead" : ""}`}>
    <div className="score">{kills} / {deaths} / {assists}</div>
    <div className="cs">{cs}</div>
    {shutdown > 100 && <div className="shutdown">{Math.round(shutdown)}g</div>}

    <Bar current={xpCurrent} max={xpNext} orientation="horizontal" type="xp" />
    <Bar current={healthCurrent} max={healthMax} orientation="horizontal" type="health" />
    <Bar current={manaCurrent} max={manaMax} orientation="horizontal" type="mana" custom_type={manaType} />

    <div className="summoner-name">{summonerName}</div>

    <LevelUp level={level} />

    <div className={championImageClassName}>
      <img src={getImagePath(`${champion?.splashCenteredImg}`)} />
      <div className="champion-image-level">{level}</div>
      {timeToRespawn > 0 && <div className="respawn-timer">{Math.round(timeToRespawn)}</div>}
    </div>

    <ImageWithCooldown
      image={ultimateImage}
      total={ultimateTotalCooldown}
      current={ultimateCurrentCooldown}
      className="ultimate"
      inactive={ultimate?.level === 0}
    />
    <ImageWithCooldown
      image={spell1Image}
      total={spell1TotalCooldown}
      current={spell1CurrentCooldown}
      className="spell-1"
    />
    <ImageWithCooldown
      image={spell2Image}
      total={spell2TotalCooldown}
      current={spell2CurrentCooldown}
      className="spell-2"
    />

    <Items items={items} visionScore={visionScore} />
  </div>;
};

const Levels = [2, 6, 11, 16, 18];
const LevelUp = ({ level }) => {
  if(!Levels.includes(level)) return null;

  return <div className="level-up">
    <ArrowUp className="arrow" />
    <div className="level-up-text">Level up</div>
    <div className="level-up-number">{level}</div>
  </div>;
};

const Items = ({ items, visionScore }) => {
  let quest = items.find((i) => i?.slot == 8);
  let _items = [0,1,2,3,4,5].map((_i) => {
    let item = items.find((i) => i?.slot == _i) ?? {};
    return item;
  });
  let trinket = items.find((i) => i?.slot == 6);

  return <div className="items">
    {_items.map((item, index) => {
      return <ItemSlot item={item} index={index} />;
    })}
    {trinket && <ItemSlot item={trinket} index={6} visionScore={visionScore} />}
    {quest && <ItemSlot item={quest} index={8} />}
  </div>;
};

const ItemSlot = ({ item, index, visionScore }) => {
  let isFilled = item?.assetUrl !== undefined;
  let image = isFilled ? getImagePath(`${item?.assetUrl}`) : null;
  let stacks = Math.round(item?.stacks ?? 0, 99);

  if(index == 6 && visionScore >= 1) {
    stacks = Math.round(visionScore, 99);
  }

  let maxCooldown = item?.maxCooldown ?? 0;
  let currentCooldown = item?.cooldown ?? 0;
  let count = Math.round(item?.count ?? 0, 99);

  if(index == 8) {
    stacks = Math.round(item?.stats[1] ?? 0, 99);
    maxCooldown = item?.stats[2] ?? 0;
    currentCooldown = stacks > 0 ? stacks : 0;
    stacks = 0;
  }

  let formattedStacks = stacks >= 1000 ? `${formatGold(stacks)}k` : stacks;

  return <div className="item-slot">
    {image && <ImageWithCooldown image={image} total={maxCooldown} current={currentCooldown} className="item-slot-image" />}
    {!item?.assetUrl && <div className="item-slot-empty">{index + 1}</div>}
    {stacks > 0 && <div className="stacks">{formattedStacks}</div>}
    {count > 1 && <div className="count">{count}</div>}
  </div>;
};

const Bar = ({ current, max, orientation = "horizontal", type = "health", custom_type = "" }) => {
  let style = {};
  let value = map(current, 0, max, 0, 100);
  if(orientation == "horizontal") {
    style.width = `${value}%`;
  } else if(orientation == "vertical") {
    style.height = `${value}%`;
  }

  return <div className={`bar ${type} ${custom_type}`}>
    <div className="bar-inner" style={style}></div>
  </div>;
};

const ImageWithCooldown = ({
  image,
  total,
  current,
  className = "",
  stacks,
  inactive = false,
}) => {
  const safeCurrent = Number(current) || 0;
  const safeTotal = Number(total) || 0;
  const hasCooldown = safeCurrent > 0;
  const cooldownRatio = safeTotal > 0
    ? Math.min(1, Math.max(0, safeCurrent / safeTotal))
    : 1;
  const cooldownFillHeight = `${cooldownRatio * 100}%`;
  const showCooldownText = hasCooldown && safeCurrent < 10;
  const cooldownText = safeCurrent >= 10
    ? `${Math.ceil(safeCurrent)}`
    : `${Math.max(0, safeCurrent).toFixed(1).replace(/\.0$/, "")}`;

  const rootClass = [
    "image-with-cooldown",
    className,
    hasCooldown ? "on-cooldown" : null,
    inactive ? "inactive" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClass}
      data-current={safeCurrent}
      data-total={safeTotal}
    >
      {hasCooldown && (
        <div
          className="cooldown-fill"
          style={{ "--cooldown-fill-height": cooldownFillHeight }}
        />
      )}
      {showCooldownText && <div className="cooldown-text">{cooldownText}</div>}

      {stacks !== undefined && <div className="stacks-sum">{stacks}</div>}
      <img
        src={image || undefined}
        className={`spell-img${hasCooldown ? " cooldown" : ""}`}
        alt=""
      />
    </div>
  );
};

const BottomScoreboardChampionGoldDiff = ({ diff }) => {
  let diffText = "";
  let absDiff = Math.abs(Math.round(diff, 99));
  if(diff > 1000 || diff < -1000) {
    diffText = `${formatGold(absDiff)}k`;
  } else {
    diffText = absDiff;
  }
  let side = "no-diff";
  if(diff > 0) {
    side = "blue";
  } else if(diff < 0) {
    side = "red";
  }

  return <div className="bottom-scoreboard-champion-gold-diff">
    <div className="gold-diff">{diffText}</div>
    <div className={`gold-diff-bar ${side}`}>
      <div className="gold-diff-bar-chevron" />
    </div>
  </div>;
};
