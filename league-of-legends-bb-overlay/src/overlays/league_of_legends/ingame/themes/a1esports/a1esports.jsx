import { useEffect, useState, useRef } from "react";
import _ from "lodash";
import * as d3 from "d3";
import { useInterval } from 'usehooks-ts';

import Overlay from "../../../../Overlay";
import "./a1esports.scss";

import { ReactComponent as SwordIcon } from "../../../../../assets/icons/sword.svg";
import { ReactComponent as CoinIcon } from "../../../../../assets/icons/coin_v2.svg";
import { ReactComponent as RookIcon } from "../../../../../assets/icons/rook.svg";
import { ReactComponent as GrubIcon } from "../../../../../assets/icons/grubs.svg";

import { ReactComponent as LaneTop } from "../../../../../assets/icons/lanes/top.svg";
import { ReactComponent as LaneMid } from "../../../../../assets/icons/lanes/mid.svg";
import { ReactComponent as LaneBot } from "../../../../../assets/icons/lanes/bot.svg";

import { ReactComponent as FeatSwords } from "../../../../../assets/icons/feats_swords.svg";
import { ReactComponent as FeatObjectives } from "../../../../../assets/icons/objective.svg";
import { ReactComponent as ArrowUp } from "../../../../../assets/icons/arrow-up2.svg";

import { getDrakePointSourceFromKey } from "../../../../../utils/drakes";
import { map } from "../../../../../utils/map"
import { getMatchData, getPlayerImage, getTeamViaTag } from "../../../../../utils/match";
import { getImagePath } from "../../../../../utils/images";
import { formatTime } from "../../../../../utils/formatTime";
import { formatGold } from "../../../../../utils/formatGold";

import VoidGrubs from "../../../../../assets/a1esports/void_grubs.png";
import Herald from "../../../../../assets/a1esports/herald.png";
import Baron from "../../../../../assets/a1esports/baron.png";
import Atakhan from "../../../../../assets/a1esports/athakan.png";
import Infernal from "../../../../../assets/a1esports/infernal.png";
import Ocean from "../../../../../assets/a1esports/ocean.png";
import Cloud from "../../../../../assets/a1esports/cloud.png";
import Mountain from "../../../../../assets/a1esports/mountain.png";
import Hextech from "../../../../../assets/a1esports/hextech.png";
import Chemtech from "../../../../../assets/a1esports/chemtech.png";
import Elder from "../../../../../assets/a1esports/elder.png";
import BgCity from "../../../../../assets/a1esports/bg_overlays.png";

const IngameThemeA1eSports = ({state, integration}) => {

  const inhibitors = state?.inhibitors;

  const blueSide = (inhibitors || []).filter(a => a.side == 1)[0];
  const redSide = (inhibitors|| []).filter(a => a.side == 2)[0];

  const matchData = getMatchData();
  const team1 = matchData?.team1 || {};
  const team2 = matchData?.team2 || {};
  const color1 = team1?.color || "#318CE7";
  const color2 = team2?.color || "#d90718";
  const graph1 = color1 + "22";
  const graph2 = color2 + "22";
  const graph1Dark = color1 + "dd";
  const graph2Dark = color2 + "dd";

  return <Overlay>
    <div className="ingame-overlay-container a1esports" style={{
      "--blueSide": "#318CE7",
      "--blueSideDarker": "#1f5f9b",
      "--blueSide-graph-1": "#318CE722",
      "--blueSide-graph-2": "#318CE7dd",
      "--redSide": "#d90718",
      "--redSideDarker": "#a60b0f",
      "--redSide-graph-1": "#d9071822",
      "--redSide-graph-2": "#d90718dd",
      "--primary": "#f1f1f1",
      "--generalBackground": "#111",
      "--timerStroke": "#ffffff33"
    }}>
      <DrakeTimer state={state} />
      <OtherTimer state={state} />
      <AtakahnTimer state={state} />

      <TopContainer state={state} integration={integration} />
      <SideChampions state={state} team="blue" players={((state?.tabs || [])[0] || {})?.players || []} integration={integration} />
      <SideChampions state={state} team="red" players={((state?.tabs || [])[1] || {})?.players || []} integration={integration} />

      <GoldList state={state} integration={integration} />

      {blueSide && <Inhibitors inhibitors={blueSide} team="blue" />}
      {redSide && <Inhibitors inhibitors={redSide} team="red" />}

      <BottomContainer state={state} integration={integration}/>
    </div>
  </Overlay>
}

const GoldList = ({state, integration}) => {
  let showGoldList = integration?.leagueOfLegends?.hud?.goldList || false;
  let teams = state?.scoreboardBottom?.teams;

  if(!teams) return null;

  let blueTeam = teams[0];
  let redTeam = teams[1];

  if(!blueTeam || !redTeam) return null;

  let playersBlue = blueTeam?.players || [];
  let playersRed = redTeam?.players || [];

  playersBlue = playersBlue.map((a) => {
    a.team = "blue";
    return a;
  })

  playersRed = playersRed.map((a) => {
    a.team = "red";
    return a;
  })

  let players = playersBlue.concat(playersRed);
  players = _.sortBy(players, (a) => a?.totalGold).reverse();

  const maxGold = Math.max(...players.map(a => a?.totalGold));
  const minGold = Math.min(...players.map(a => a?.totalGold));

  return <div className={"gold-list " + (showGoldList ? "active" : "inactive")}>
    <div className="bg"></div>
    <div className="gold-list-header">
      <CoinIcon className="coin-icon" />
      <div>TOTAL GOLD</div>
    </div>
    <div className="list">
      {players.map((a, i) => {
        return <GoldListMember player={a} index={i} min={minGold} max={maxGold} />
      })}
    </div>
  </div>
}

const GoldListMember = ({player, index, min, max}) => {

  let championImage = getImagePath(`${player?.champion?.splashCenteredImg}`)
  let width = map(player?.totalGold, 0, max, 0, 100);
  let name = player?.name.split("#")[0];

  return <div className={"gold-list-member " + player?.team}>
    <img src={championImage} className="champion-image" />
    <div className="rest">
      <div className="player-name">
        <div className="name">{name}</div>
        <div className="gold">{Math.round(player?.totalGold)}</div>
      </div>
      <div className="gold-bar">
        <div className="bar" style={{width: `${width}%`}}></div>
      </div>
    </div>
  </div>
}

const BottomContainer = ({state, integration}) => {
  return (<div class="bottom-container">
    <BottomWrapper state={state} integration={integration} />
    <TeamFightView state={state} />
    <InfoOverlay state={state} integration={integration} />
  </div>)
}

export const InfoOverlay = ({state, integration}) => {
  const showInfoOverlay = integration?.leagueOfLegends?.hud?.overlay;
  let overlayJson = integration?.leagueOfLegends?.hud?.overlayJSON;
  const type = overlayJson?.type || "-";
  let CustomOverlay = undefined;

  console.log(state?.scoreboard.teams[0].dragons, state?.scoreboard.teams[1].dragons, integration?.leagueOfLegends?.hud?.drakes.blue, integration?.leagueOfLegends?.hud?.drakes.red);

  switch(type) {
    case "team-text-info":
      CustomOverlay = TeamInfoOverlay;
      break;
    case "objective":
      CustomOverlay = ObjectiveOverlay;
      break;
    case "highlight-player-last-week":
      CustomOverlay = PlayerHighlight;
      break;
    case "highlight-player":
      CustomOverlay = FinaleHighlight;
      break;
    case "voting":
      CustomOverlay = VotingOverlay;
      break;
    default:
      break;
  }

  if(!overlayJson) return;
  if(type == "-") return;
  if(!CustomOverlay) return;

  let teamTag = overlayJson?.teamTag || "unset";

  return <div className={`custon-info-overlay ${showInfoOverlay ? "active" : "inactive"} ${teamTag} ${type} ${overlayJson?.objective}`}>
    <img src={BgCity} className="bg-city" />
    <CustomOverlay json={overlayJson} />
  </div>
}

const VotingOverlay = ({json}) => {

  const [t1, setT1] = useState(50);
  const [t2, setT2] = useState(50);

  const matchData = getMatchData();

  const team1 = matchData?.team1 || {};
  const team2 = matchData?.team2 || {};

  useInterval(async () => {
    let res = await fetch(`https://festival.flave.world/content/voting.api?identifier=lol`)
    let text = await res.text();
    let arr = text.split(";");
    let dt1 = arr[0].split(":");
    let dt2 = arr[1].split(":");

    console.log(dt1, dt2, team1.tag, team2.tag);

    if(dt1[0] === team1.tag) {
      setT1(Number(dt1[1]));
    } else if(dt1[0] === team2.tag) {
      setT2(Number(dt1[1]));
    }

    if(dt2[0] === team1.tag) {
      setT1(Number(dt2[1]));
    } else if(dt2[0] === team2.tag) {
      setT2(Number(dt2[1]));
    }

    setT1(30);
    setT2(70);

  }, 1000);



  let sum = t1 + t2;
  let width = 50;
  if(sum > 0) {
    width = Math.round(t1 * 1.0 / sum * 100);
  }

  return <div className="voting-overlay">
    <div className="team-1">
      <div className="voting-team-name">{team1.name}</div>
      <div className="voting-team-logo">
        <img src={team1.image} />
      </div>
      <div className="voting-team-tag">{team1.tag}</div>
    </div>

    <div className="voting-header">
      Welches Team gewinnt?
    </div>

    <div className="voting-text">
      Wenn du vor Ort bist, kannst du hier auch abstimmen, scanne dazu den QR-Code auf deinem Eintrtittsband und stimme unter Bühnenvoting ab.
    </div>

    <div className="voting-bar-container">
      <div className="voting-bar">
        <div className={`voting-bar-inner ${team1.tag}`} style={{width: `${width}%`}}><span className="voting-bar-inner-text left">{t1 > 10 ? t1 : null}%</span></div>
        <div className={`voting-bar-inner ${team2.tag} left`}><span className="voting-bar-inner-text right">{t2 > 10 ? t2 : null}%</span></div>
      </div>
    </div>

    <div className="team-2">
      <div className="voting-team-name">{team2.name}</div>
      <div className="voting-team-logo">
        <img src={team2.image} />
      </div>
      <div className="voting-team-tag">{team2.tag}</div>
    </div>
  </div>
}

const FinaleHighlight = ({json}) => {

  const team = getTeamViaTag(json?.teamTag);
  const playerImage = getPlayerImage(json?.playerName);

  const playedChampions = json?.mostPlayedChampions || [];
  const stats = json?.stats || [];

  return <>
    <div className="team-highlight">
      <div class="when">{json?.when}</div>
      <img src={team.image} className="team-highlight-image" />
      <div className="team-highlight-name">{team.name}</div>
    </div>
    <div className="player-highlight">
      <img src={playerImage} className="player-hightlight-image" />
      <div className="player-highlight-name">{json?.playerName}</div>
    </div>
    <div className="player-stats-header">Player Statistics</div>
    <div className="stats">
      {stats.map((a, i) => {
        return <div className="stat">
          <div className="stat-name">{a.stat}</div>
          <div className="stat-value">{a.value}</div>
        </div>
      })}
    </div>
    <div className="player-champions-header">Played Champions</div>
    <div className="played-champions">
      {playedChampions.map((a, i) => {
        return <div className="played-champion">
          <img src={`http://localhost:58869/cache/game/15.13/champion/${a.champion}/splashCentered.jpg`} className="played-champion-image" />
          <div className="played-champion-name">{a.champion}</div>
          <div className="played-champion-count">{a.games} Games</div>
        </div>
      })}
    </div>
  </>
}

const PlayerHighlight = ({json}) => {

  const team = getTeamViaTag(json?.teamTag);
  const playerImage = getPlayerImage(json?.playerName);

  return <>
    <div className="team-color-bg" style={{
      "--color": team?.color || "#318CE7",
    }}></div>
    <div className="team-highlight">
      <div class="when">{json?.when}</div>
      <img src={team.image} className="team-highlight-image" />
      <div className="team-highlight-name">{team.name}</div>
    </div>
    <div className="player-highlight">
      <img src={playerImage} className="player-hightlight-image" />
      <div className="player-highlight-name">{json?.playerName}</div>
    </div>
    <Game json={json} index={1} />
    <Game json={json} index={2} />
  </>
}

const Game = ({json, index}) => {

  const stats = json?.games[index - 1] || [];
  const imageUrl = `http://172.16.4.55:58869/cache/game/15.11/champion/${stats?.champion}/splashCentered.jpg`

  return <div className={`game-${index}`}>
    <div className="game-name">Game {index}</div>
    <img src={imageUrl} className="champion" />
    <div className="champion-name">{stats?.champion}</div>
    <div className="stats-game-container">
      {stats.stats.map((a, i) => {
        return <div className="game-stat">
          <div className="stat-name">{a.stat}</div>
          <div className="stat-value">{a.value}</div>
        </div>
      })}
    </div>
  </div>
}

const ObjectiveOverlay = ({json}) => {
  let Image = undefined;

  switch(json?.objective) {
    case "void_grubs":
      Image = VoidGrubs;
      break;
    case "rift-herald":
      Image = Herald;
      break;
    case "baron":
      Image = Baron;
      break;
    case "atakhan":
      Image = Atakhan;
      break;
    case "infernal-drake":
      Image = Infernal;
      break;
    case "ocean-drake":
      Image = Ocean;
      break;
    case "cloud-drake":
      Image = Cloud;
      break;
    case "mountain-drake":
      Image = Mountain;
      break;
    case "hextech-drake":
      Image = Hextech;
      break;
    case "chemtech-drake":
      Image = Chemtech;
      break;
    case "elder-drake":
      Image = Elder;
      break;
    default:
      Image = undefined
      break;
  }

  const points = json?.points || [];

  return <>
    <img src={Image} className="objective-image" />
    <div className="objective-name">{json?.objectiveName}</div>
    <div className="objective-text">
      {points.map((a, i) => {
        return <div className="point">
          <div className="point-type">{a.type}</div>
          {a.text}
        </div>
      })}
    </div>
  </>
}

const TeamInfoOverlay = ({json}) => {
  let team = getTeamViaTag(json?.teamTag);
  if(team.tag == "TOGA") {
    team.name = "TeamOrangeGaming Academy"
  }
  const texts = [1,2,3,4]

  return <>
    <img src={team.image} className="team-image" />
    <div className="team-name">{team.name}</div>
    <div className="team-tag">{team.tag}</div>
    <div className="team-players">
      {team.players.map((a, i) => {
        return <div className="team-player">
          <img src={team.images[i]} className="player-image" />
          <div className="player-name">{a}</div>
        </div>
      })}
    </div>
    <div className="texts">
      {texts.map((a, i) => {
        let text = json[`text_${a}`];
        if(!text) return null;
        return <div className="text">
          {text}
        </div>
      })}
    </div>
  </>
}

const MinimapContainer = ({state}) => {

  return;

  return (<div class="minimap-container">
    <div class="bg1"></div>
    <div class="bg2"></div>
    <div class="bg3"></div>
    <div class="bg4"></div>
    <div class="bg5"></div>
  </div>)
}

const TeamFightView = ({state}) => {
  let bluePlayers = ((state?.tabs || [])[0] || {}).players || [];
  let redPlayers = ((state?.tabs || [])[1] || {}).players || [];

  return <div class={`team-fight-view ${state?.scoreboardBottom ? "inactive" : "active"}`}>
    <div class="team blue">
      {bluePlayers.map((a, i) => {
        return <TeamFightPlayer player={a} team="blue" index={i} />
      })}
    </div>
    <div class="team red">
      {redPlayers.map((a, i) => {
        return <TeamFightPlayer player={a} team="red" index={i} />
      })}
    </div>
  </div>
}

const TeamFightPlayer = ({player, team, index}) => {
  let championImage = getImagePath(`${player?.championAssets?.splashCenteredImg}`)
  let dead = player?.timeToRespawn != undefined;
  let extraManaClass = getExtraManaClass(player.championAssets?.name);

  const maxHealth = Math.round(player?.health?.max || 0);
  const health = Math.round(player?.health?.current);

  const maxMana = Math.round(player?.resource?.max);
  const mana = Math.round(player?.resource?.current);

  const widthHealth = map(health, 0, maxHealth, 0, 100);
  const widthMana = map(mana, 0, maxMana, 0, 100);

  const lvl = player.level;

  let ult = player?.abilities?.find(a => a.slot == "R")
  let sum1 = player?.abilities[4]
  let sum2 = player?.abilities[5]

  let sum1Image = getImagePath(`${sum1?.assets?.iconAsset}`)
  let sum2Image = getImagePath(`${sum2?.assets?.iconAsset}`)
  let ultImage = getImagePath(`${ult?.assets?.iconAsset}`)


  return <div className={`team-fight-player ${dead ? "dead" : ""}`}>
    <img src={championImage} className="champion-image" />

    <SpellWithCooldown icon={sum1Image} total={sum1?.totalCooldown} current={sum1?.cooldown} extras="spell-1" />
    <SpellWithCooldown icon={sum2Image} total={sum2?.totalCooldown} current={sum2?.cooldown} extras="spell-2" />
    <SpellWithCooldown icon={ultImage} total={ult?.totalCooldown} current={ult?.cooldown} extras="ult" />

    {dead && <div className="dead-number">{Math.round(player?.timeToRespawn)}</div>}

    <div className="lvl">{lvl}</div>

    <div class="health">
      <div class="inner-health" style={{width: `${widthHealth}%`}}></div>
    </div>
    <div class={`mana`}>
      <div class={`inner-mana ${extraManaClass}`} style={{width: `${widthMana}%`}}></div>
    </div>
    <div class="bg"></div>
  </div>
}

const BottomWrapper = ({state, integration}) => {

  return (<div className={"bottom-wrapper"}>
    <BottomChampions state={state} integration={integration} />

  </div>)
}

const GoldGraph = ({state}) => {
  const rawData = state?.goldGraph?.current?.goldAtTime;
  let data = []

  for(let key of Object.keys(rawData || {})) {
    data.push({
      x: Number(key),
      y: rawData[key][1] - rawData[key][2]
    })
  }

  const matchData = getMatchData();

  return <div className={"gold-graph " + (data.length > 0 ? "active" : "inactive")}>
    <div className="graph-element blue">
      <img src={matchData?.team1?.image} className="logo" />
      <div className="text">{matchData?.team1?.tag}</div>
      <div className="element-highlight"></div>
    </div>
    <div className="graph-element red">
      <img src={matchData?.team2?.image} className="logo" />
      <div className="text">{matchData?.team2?.tag}</div>
      <div className="element-highlight"></div>
    </div>
    <Graph data={data} events={[]} />
  </div>
}



const Graph = ({data, events = []})  => {
  const ref = useRef();

  function insertZeroCrossings(data) {
    let newData = [];
    for (let i = 0; i < data.length - 1; i++) {
      let d1 = data[i];
      let d2 = data[i + 1];
      newData.push(d1);

      if ((d1.y > 0 && d2.y < 0) || (d1.y < 0 && d2.y > 0)) {
        let x0 = d1.x + (d2.x - d1.x) * ((0 - d1.y) / (d2.y - d1.y));
        newData.push({ x: x0, y: 0 });
      }
    }
    newData.push(data[data.length - 1]);
    return newData;
  }

  useEffect(() => {
    if (!data || data.length === 0) return;

    const processedData = insertZeroCrossings(data);

    const width = 900;
    const height = 200;
    const margin = { top: 20, right: 50, bottom: 30, left: 60 };

    d3.select(ref.current).selectAll("*").remove();
    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height);

    // X scale
    const x = d3
      .scaleLinear()
      .domain(d3.extent(processedData, (d) => d.x))
      .range([margin.left, width - margin.right]);

    // Determine max domain for Y
    const absMaxY = d3.max(processedData, (d) => Math.abs(d.y));
    const maxValY = Math.ceil(absMaxY / 500) * 500 + 500;
    const minValY = -maxValY;

    // Y scale
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
      .attr("id", "clip")
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom);

    // Gradients
    const defs = svg.append("defs");
    const gradAbove = defs
      .append("linearGradient")
      .attr("id", "gradAbove")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", y(0))
      .attr("x2", 0)
      .attr("y2", y(maxValY));
    gradAbove
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "var(--blueSide-graph-1)");
    gradAbove
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "var(--blueSide-graph-2)");

    const gradBelow = defs
      .append("linearGradient")
      .attr("id", "gradBelow")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", y(0))
      .attr("x2", 0)
      .attr("y2", y(minValY));
    gradBelow
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "var(--redSide-graph-1)");
    gradBelow
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "var(--redSide-graph-2)");

    const xAxis = d3
      .axisBottom(x)
      .ticks(10)
      .tickFormat((d) => formatTime(d ));

    const yAxis = d3.axisLeft(y).tickValues([minValY, 0, maxValY]);

    const a = svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    const b = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

      a.selectAll("line, path")
        .attr("stroke", "white");

      b.selectAll("line, path")
        .attr("stroke", "white");

      a.selectAll("text")
        .attr("fill", "white");
      b.selectAll("text")
        .attr("fill", "white");

    const chartContent = svg.append("g").attr("clip-path", "url(#clip)");

    // Add a horizontal line at y=0
    chartContent
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke", "white")
      .attr("stroke-width", 0.5);

    // Draw areas
    chartContent
      .append("path")
      .datum(processedData)
      .attr("fill", "url(#gradAbove)")
      .attr("d", areaAbove);

    chartContent
      .append("path")
      .datum(processedData)
      .attr("fill", "url(#gradBelow)")
      .attr("d", areaBelow);

    // Draw lines
    chartContent
      .append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "var(--blueSide)")
      .attr("stroke-width", 1)
      .attr("d", lineAbove);

    chartContent
      .append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "var(--redSide)")
      .attr("stroke-width", 1.2)
      .attr("d", lineBelow);

    // Add a label at the right for the last data point
    const lastPoint = processedData[processedData.length - 1];
    const lastVal = lastPoint.y;
    const labelColor = lastVal > 0 ? "var(--blueSide)" : lastVal < 0 ? "var(--redSide)" : "var(--primary)";

    svg
      .append("text")
      .attr("x", width - margin.right + 40)
      .attr("y", y(lastVal))
      .attr("fill", labelColor)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("font-size", "12px")
      .text(Math.round(Math.abs(lastVal)));

    // Draw event lines
    // Each event is represented by a vertical line and a label at the top
    svg
      .selectAll(".event-line")
      .data(events)
      .enter()
      .append("line")
      .attr("class", "event-line")
      .attr("x1", (d) => x(d.x))
      .attr("x2", (d) => x(d.x))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "black");

    // Add labels or icons at the top for each event
    svg
      .selectAll(".event-label")
      .data(events)
      .enter()
      .append("text")
      .attr("class", "event-label")
      .attr("x", (d) => x(d.x))
      .attr("y", margin.top - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text((d) => d.label);
  }, [data, events]);

  return (
    <>
      <div className="gold-difference-graph-header">Gold Difference over Time</div>
      <svg ref={ref}></svg>
    </>
  );
}

const Inhibitors = ({inhibitors, team}) => {
  let inhibs = inhibitors?.inhibitors || [];

  return <div className={`inhibitors ${team}`}>
    {inhibs.map((a, i) => {
      return <Inhibitor inhibitor={a} team={team} index={i} />
    })}
  </div>
}

const Inhibitor = ({inhibitor, team, index}) => {
  let maxTime = inhibitor?.timeTotal || 300;
  let time = inhibitor?.timeLeft || 0;
  let timeFormat = formatTime(time);

  let height = map(time, 0, maxTime, 0, 100);

  return <div className={`${team} inhib ${time > 0 ? "active" : "inactive"}`} style={{
    "--bgHeight": `${height}%`
  }}>
    {index == 0 && <LaneBot className="lane" />}
    {index == 1 && <LaneMid className="lane" />}
    {index == 2 && <LaneTop className="lane" />}
    <div class="foreground">{timeFormat}</div>
  </div>
}

const BottomChampions = ({state, integration}) => {
  const showRunes = state?.runes?.runes;
  const showTeamFightView = state?.scoreboardBottom == undefined;

  const [blueBottleState, setBlueBottleState] = useState(state);

  useEffect(() => {
    if(state.scoreboardBottom) {
      setBlueBottleState(state);
    }
  }, [state]);

  let mode = integration?.leagueOfLegends?.hud?.mode;

  let teamBlue = blueBottleState?.scoreboardBottom?.teams[0]
  let teamRed = blueBottleState?.scoreboardBottom?.teams[1]

  let runesTeamBlue = ((blueBottleState?.tabs || [])[0] || {}).players || [];
  let runesTeamRed = ((blueBottleState?.tabs || [])[1] || {}).players || [];

  let runesClass = "inactive";
  let bottomChampionsClass = "active"

  if(showRunes) {
    runesClass = "active";
    bottomChampionsClass = "active"
  }

  if(showTeamFightView) {
    runesClass = "inactive";
    bottomChampionsClass = "inactive";
  }

  return (
    <>
      <div className="champion-frame">

      </div>

      <div className="minimap-container">
        <div className="bg1"></div>
        <div className="bg2"></div>
        <div className="bg3"></div>
        <div className="bg4"></div>
        <div className="bg5"></div>
      </div>

      <div className={`middle-bg ${bottomChampionsClass}`}>

      </div>


      <div className={`bottom-runes ${runesClass}`}>
        {runesTeamBlue.map((a,i) => {
          return <BottomChampionRunes state={blueBottleState} team="blue" player={a} other={(teamRed?.players || [])[i]} index={i}/>
        })}
        {runesTeamRed.map((a,i) => {
          return <BottomChampionRunes state={blueBottleState} team="red" player={a} other={(teamBlue?.players || [])[i]} index={5+i}/>
        })}
      </div>

      <div class={`bottom-champion  ${bottomChampionsClass} ${mode}`}>
        <GoldGraph state={state} />
        <div className="teams blue">
          {teamBlue?.players.map((a,i) => {
            return <BottomChampion mode={mode} state={blueBottleState} team="blue" player={a} other={(teamRed?.players || [])[i]} index={i} integration={integration} />
          })}
        </div>
        <div className="teams red">
          {teamRed?.players.map((a,i) => {
            return <BottomChampion mode={mode} state={blueBottleState} team="red" player={a} other={(teamBlue?.players || [])[i]} index={5 + i}  integration={integration} />
          })}
        </div>
      </div>
    </>)
}

const BottomChampionRunes = ({team, player, other, index}) => {

  let perks = player?.perks || [];
  let champImg = getImagePath(`${player?.championAssets?.splashCenteredImg}`)

  let keyStone = getImagePath(perks[0]?.iconPath)
  let primary1 = getImagePath(perks[1]?.iconPath)
  let primary2 = getImagePath(perks[2]?.iconPath)
  let primary3 = getImagePath(perks[3]?.iconPath)
  let secondary1 = getImagePath(perks[4]?.iconPath)
  let secondary2 = getImagePath(perks[5]?.iconPath)


  return <div className="champion" style={{
    "--seconds": `${index * 0.1}s`
  }}>
    <div className="gradient"></div>
    <img src={champImg} className="champion-image" />
    <img src={keyStone} className="rune keystone" />
    <div className="primary">
      <img src={primary1} className="rune primary1" />
      <img src={primary2} className="rune primary2" />
      <img src={primary3} className="rune primary3" />
    </div>
    <div className="secondary">
      <img src={secondary1} className="rune secondary1" />
      <img src={secondary2} className="rune secondary2" />
    </div>
  </div>
}

const BottomChampion = ({state, team, player, other, mode, index, integration}) => {

  let championImage = getImagePath(`${player?.champion?.splashCenteredImg}`)
  let dead = player?.respawnTimeRemaining != undefined;

  let goldDifference = 0;
  if(other) {
    goldDifference = player?.totalGold - other?.totalGold;
  }

  let tab = state?.tabs[team == "blue" ? 0 : 1];
  let players = tab.players;
  let p = players.find(a => a.championAssets.id == player.champion.id);

  const lvl = player.level;
  const xpBeforThisLvl = p?.experience?.previousLevel || 0;
  const xpThisLvl = p?.experience?.nextLevel || 0;
  const currentXp = p?.experience?.current || 0;

  const width = map(currentXp, xpBeforThisLvl, xpThisLvl, 0, 100);
  let extraManaClass = getExtraManaClass(player.championAssets?.name);

  const maxHealth = Math.round(p?.health?.max || 0);
  const health = Math.round(p?.health?.current);

  const maxMana = Math.round(p?.resource?.max);
  const mana = Math.round(p?.resource?.current);

  const widthHealth = map(health, 0, maxHealth, 0, 100);
  const widthMana = map(mana, 0, maxMana, 0, 100);

  let ult = p?.abilities?.find(a => a.slot == "R")
  let sum1 = p?.abilities[4]
  let sum2 = p?.abilities[5]

  let sum1Image = getImagePath(`${sum1?.assets?.iconAsset}`)
  let sum2Image = getImagePath(`${sum2?.assets?.iconAsset}`)
  let ultImage = getImagePath(`${ult?.assets?.iconAsset}`)

  let long = p?.playerName.length > 12 ? "long-name" : "";
  let hasUlt = p?.abilities?.find(a => a.slot === "R")?.level === 0;
  let stacks = p?.stacksData;
  let stacksValue = stacks;

  if(p?.championAssets?.name == "Swain") {
    stacksValue = stacks * 15;
  }

  let creepScore = player?.creepScore
  if(integration?.leagueOfLegends?.hud?.gold) {
    creepScore = `${Math.round(player?.totalGold || 0)}g`;
  }

  let items = player?.items || [];
  let filteredItems = items.filter(a => a?.id != 0 && a?.cost > 2000);

  return (<div class={`champion-bottom ${team} ${index === 4 && "last"}`}>
    { (other && team == "blue") && <GoldDifference difference={goldDifference} />}
    { dead && <span class="dead-number">{Math.round(player?.respawnTimeRemaining)}</span>}
    <div className={"champion-image " + (dead ? "dead" : "")} style={{backgroundImage: `url(${championImage})`}}></div>
    <div className="creeps"><div>{creepScore}</div></div>
    { lvl >= 6 && <LvlUp lvl={6} />}
    { lvl >= 11 && <LvlUp lvl={11} />}
    { lvl >= 16 && <LvlUp lvl={16} />}
    { lvl >= 18 && <LvlUp lvl={18} />}
    { filteredItems.length > 0 && filteredItems.map((a, i) => {
      let img = getImagePath(a?.asset);
      if(!img) return null;

      return <div className={`item-bought`} key={"item-" + a.id}>
        <ImageWithStyle src={img} />
        <span>{a.displayName}</span>
      </div>
    })}
    {mode == "lane-phase" &&
      <>
      <div className={`player-name ${long ? "long-name" : ""}`}>{ p.playerName }</div>

      <div class="health">
        <div class="inner-health" style={{width: `${widthHealth}%`}}></div>
      </div>
      <div class={`mana`}>
        <div class={`inner-mana ${extraManaClass}`} style={{width: `${widthMana}%`}}></div>
      </div>

      <div class="lvl">{lvl}</div>
      {lvl < 18 &&
      <div class={`xp`}>
        <div class={`inner-xp ${extraManaClass}`} style={{height: `${width}%`}}></div>
      </div>}

      {stacksValue > 0 && <div className="stacks">{Math.round(stacksValue)}</div>}
      {player?.shutdown >  100 && <div className="shutdown-gold">{floorTo50(player?.shutdown)}g</div>}
      <SpellWithCooldown icon={sum1Image} total={sum1?.totalCooldown} current={sum1?.cooldown} extras="spell-1" />
      <SpellWithCooldown icon={sum2Image} total={sum2?.totalCooldown} current={sum2?.cooldown} extras="spell-2" />
      <SpellWithCooldown icon={ultImage} total={ult?.totalCooldown} current={ult?.cooldown} extras="ult" inactive={hasUlt}/>
      </>
    }
    <Stats kills={player?.kills} deaths={player?.deaths} assists={player?.assists} shutdown={0} integration={integration} player={player} p={p} />
    <Items items={player?.items} player={player} />
  </div>)
}

const LvlUp = ({lvl}) => {
  return <div className="lvl-up">
    <ArrowUp className="arrow" />
    <div className="lvl-nr">{lvl}</div>
    <div className="lvl-up-text">Level up</div>
  </div>
}

const floorTo50 = (n) => Math.floor(n / 50) * 50;

const Items = ({items = [], player}) => {

  return (<div className="items">
    {items.map((a, i) => {
      return <Item item={a} index={i} player={player}/>
    })}
  </div>)
}

const Item = ({item, player , index}) => {

  if(!item.asset) return <div className="item"></div>;
  let img = getImagePath(item.asset);

  let current = item.cooldown || 0;
  let total = item.maxCooldown || 0;

  let rotation = 0;
  if(current > 0) {
    rotation = map(current, 0, total, 180, -180);
  }

  if(total == 0) {
    rotation = 360;
  }

  return <div className={`item ${current > 0 && "cooldown"}`}>
    {(item.stacks > 0 && item.stacks < 1000) && <div className="stacks">{item.stacks}</div>}

    {current > 0 && <div class={`cooldown-max`}></div>}
    {current > 0 && <div class={`cooldown-handle`} style={{ transform: `rotate(${rotation}deg)`}}></div>}
    {current > 0 && <div className="cooldown"></div>}

    {(index == 6 && player?.visionScore >= 1) && <div className="trinket">{Math.round(player?.visionScore)}</div>}
    <ImageWithStyle src={img} />
  </div>
}

const Stats = ({kills, deaths, assists, shutdown, integration, player, p}) => {

  if(integration?.leagueOfLegends?.hud?.gold) {
    return <div className={"stats " + (shutdown > 0 && "shutdown")}>
      {shutdown > 0 && <div className="shutdown-gold">{Math.round(shutdown)}g</div>}
      <div className="kills">{Math.round(player?.gold)}g</div>
    </div>
  }

  return <div className={"stats " + (shutdown > 0 && "shutdown")}>
    {shutdown > 0 && <div className="shutdown-gold">{Math.round(shutdown)}g</div>}
    <div className="kills">{kills}</div>
    <div className="sp">/</div>
    <div className="deaths">{deaths}</div>
    <div className="sp">/</div>
    <div className="assists">{assists}</div>
  </div>
}
const GoldDifference = ({difference}) => {
  let side = difference > 0 ? "blue" : "red";

  let viewDiff = "";
  let diff = Math.round(Math.abs(difference));
  if(diff < 1000) {
    viewDiff = diff;
  } else {
    viewDiff = `${formatGold(diff)}K`;
  }

  return (<div className={"gold-difference " + side}>
    {viewDiff}
    <div class="chevron"></div>
  </div>)
}

const ImageWithStyle = ({ src, alt, classNames, }) => {
  const [style, setStyle] = useState({});

  useEffect(() => {
    setStyle({});
  }, [src])


  return (
    <img
      src={src}
      alt={alt}
      style={style}
      className={classNames}
      onError={() => setStyle({ display: "none" })}
    />
  );
};

const TopContainer = ({ state, integration }) => {

  if(!state.scoreboard) return null;

  let teamBlue = state?.scoreboard?.teams[0]
  let teamRed = state?.scoreboard?.teams[1]

  const blueKills = teamBlue?.kills || 0;
  const redKills = teamRed?.kills || 0;
  const blueGrubs = teamBlue?.grubs || 0;
  const redGrubs = teamRed?.grubs || 0;
  const blueTurrets = teamBlue?.towers || 0;
  const redTurrets = teamRed?.towers || 0;
  const blueGold = teamBlue?.gold || 0;
  const redGold = teamRed?.gold || 0;

  const matchData = getMatchData();

  const teamBlueTag = matchData?.team1?.tag || "";
  const teamBlueScore = matchData?.team1?.score || 0;
  const teamBlueLogo = matchData?.team1?.image || "";

  const teamRedTag = matchData?.team2?.tag || "";
  const teamRedScore =  matchData?.team2?.score || 0;
  const teamRedLogo = matchData?.team2?.image || "";

  const ingameTime = formatTime(state?.scoreboard?.gameTime);

  let blueDragons = teamBlue?.dragons || [];
  let redDragons = teamRed?.dragons || [];

  const bestOf = parseInt(3);
  let diff = blueGold - redGold;

  return (
    <div className="top-container">
      {Math.abs(diff) > 0 && <span className={`gold-difference ${diff > 0 ? "blue" : "red"}`}>
        +{Math.round(Math.abs(diff))}
      </span>}
      <div className="blue-side">
        <BlueScore bo={bestOf} s={teamBlueScore} />
        <div className="bg-ingame"></div>
        {teamBlueLogo && <img src={teamBlueLogo} className="team-logo" />}
        {teamBlueLogo && <img src={teamBlueLogo} className="team-logo-bg" />}
        <span className={"team-tag"}>{teamBlueTag}</span>
        <span className={"team-tag-bg"}>{teamBlueTag}</span>
        <CoinIcon className="coin-icon" />
        <span className="team-gold">
          {formatGold(blueGold)}
          <span>k</span>
        </span>

        <RookIcon className="rook-icon" />
        <span className="team-turrets">{blueTurrets}</span>
        <span className="grubs">{blueGrubs}</span>
        <GrubIcon className="grub-icon" />
        <BlueDrakes state={state} integration={integration} dragons={blueDragons} />
        <BlueFeatsOfStrength feat={teamBlue?.featsOfStrength} />

        <div className="rect"></div>

        <div className="bg-wrapper"></div>
      </div>
      <div className="kills-and-timer">
        <span className="blue-kills">{blueKills}</span>
        <span className="red-kills">{redKills}</span>
        <span className="ingame-time">{ingameTime}</span>
        <span className="bg-ingame-time">{ingameTime}</span>
        <SwordIcon className="sword-icon" />
        <div className="bd-bottom"></div>
        <div className="bg-timer"></div>
      </div>
      <div className="red-side">
        <RedScore bo={bestOf} s={teamRedScore} />
        <div className="bg-ingame"></div>
        {teamRedLogo && <img src={teamRedLogo} className="team-logo" />}
        {teamRedLogo && <img src={teamRedLogo} className="team-logo-bg" />}
        <span className={"team-tag"}>{teamRedTag}</span>
        <span className={"team-tag-bg"}>{teamRedTag}</span>

        <CoinIcon className="coin-icon" />
        <span className="team-gold">
          {formatGold(redGold)}
          <span>k</span>
        </span>

        <RookIcon className="rook-icon" />
        <span className="team-turrets">{redTurrets}</span>
        <span className="grubs">{redGrubs}</span>
        <GrubIcon className="grub-icon" />
        <RedDrakes state={state} integration={integration} dragons={redDragons}/>
        <RedFeatsOfStrength feat={teamRed?.featsOfStrength} />

        <div className="rect"></div>

        <div className="bg-wrapper"></div>
      </div>
    </div>
  );
};

const BlueFeatsOfStrength = ({feat}) => {

  let kills = feat?.kills || 0;
  let monsterObjectives = feat?.objectives || 0;
  let turret = feat?.turretsWasFirst || false;

  let defaultColor = "#f1f1f1";
  let doneColor = "var(--blueSide)";

  return <div className="feats-of-strength">
    <div class="feat">
      <FeatSwords style={{
        '--feat-1': `${kills > 0 ? doneColor : defaultColor}`,
        '--feat-2': `${kills > 1 ? doneColor : defaultColor}`,
        '--feat-3': `${kills > 2 ? doneColor : defaultColor}`
      }} />
    </div>
    <div class="feat-space"></div>
    <div class="feat monsters">
      <FeatObjectives style={{
        '--feat-1': `${monsterObjectives > 0 ? doneColor : defaultColor}`,
        '--feat-2': `${monsterObjectives > 1 ? doneColor : defaultColor}`,
        '--feat-3': `${monsterObjectives > 2 ? doneColor : defaultColor}`
      }} className="feat-monsters" />
    </div>
    <div class="feat-space"></div>
    <div class="feat tower">
      <RookIcon className={`tower-icon`} style={{
        '--primary': `${turret ? doneColor : defaultColor}`
      }} />
    </div>
  </div>
}

const RedFeatsOfStrength = ({feat}) => {

  let kills = feat?.kills || 0;
  let monsterObjectives = feat?.objectives || 0;
  let turret = feat?.turretsWasFirst || false;

  let defaultColor = "#f1f1f1";
  let doneColor = "var(--redSide)";

  return <div className="feats-of-strength">
    <div class="feat">
      <FeatSwords style={{
        '--feat-1': `${kills > 0 ? doneColor : defaultColor}`,
        '--feat-2': `${kills > 1 ? doneColor : defaultColor}`,
        '--feat-3': `${kills > 2 ? doneColor : defaultColor}`
      }} />
    </div>
    <div class="feat-space"></div>
    <div class="feat monsters">
      <FeatObjectives style={{
        '--feat-1': `${monsterObjectives > 0 ? doneColor : defaultColor}`,
        '--feat-2': `${monsterObjectives > 1 ? doneColor : defaultColor}`,
        '--feat-3': `${monsterObjectives > 2 ? doneColor : defaultColor}`
      }} className="feat-monsters" />
    </div>
    <div class="feat-space"></div>
    <div class="feat tower">
      <RookIcon className={`tower-icon`} style={{
        '--primary': `${turret ? doneColor : defaultColor}`
      }} />
    </div>
  </div>
}

const BlueScore = ({ bo, s }) => {
  let score = parseInt(s);
  let c = Math.floor((bo * 1.0) / 2) + 1;
  if (bo == 2) c = 2;

  let array = _.times(c);

  return (
    <div className={"scores blue " + "bestOf" + bo}>
      {array.map((a) => {
        return (
          <div className={"score " + (a < score ? "active" : "")} key={"blue_score_" + a}>
            <div
              className={"score-content " + (a < score ? "active" : "")}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

const RedScore = ({ bo, s }) => {
  let score = parseInt(s);
  let c = Math.floor((bo * 1.0) / 2) + 1;
  if (bo == 2) c = 2;

  let array = _.times(c);

  return (
    <div className={"scores red " + "bestOf" + bo}>
      {array.map((a) => {
        return (
          <div className={"score " + (a < score ? "active" : "")} key={"red_score_" + a}>
            <div
              className={"score-content " + (a < score ? "active" : "")}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

const BlueDrakes = ({ state, integration, dragons }) => {
  let array = _.reverse(_.times(4));

  let atakahn = state?.scoreboard?.teams[0]?.atakhan;
  let drakes = [...dragons, ...integration?.leagueOfLegends?.hud?.drakes.blue];

  return (
    <div className="drakes-points blue">
      {array.map((a) => {
        let drake = drakes[a];

        if (drake == "-") return;
        if (!drake) return;

        return (
          <>
            <div className="drake-point" key={"blue_drakes_" + a}>
              <img
                src={getDrakePointSourceFromKey(drake)}
                className="drake-point-img"
              />
            </div>
            { a < array.length - 1 && <div className="dragon-space"></div>}
          </>
        );
      })}
      { atakahn &&
        <div className="drake-point">
          <img src={getImagePath(`cache/style/ingame/objectives/atakhan/atakhan_${atakahn}.png`)} className="drake-point-img" />
        </div>
      }
    </div>
  );
};

const RedDrakes = ({ state, integration, dragons }) => {
  let array = _.times(4);

  let atakahn = state?.scoreboard?.teams[1]?.atakhan;
  let drakes = [...dragons, ...integration?.leagueOfLegends?.hud?.drakes.red];

  return (
    <div className="drakes-points red">
      { atakahn &&
        <div className="drake-point">
          <img src={getImagePath(`cache/style/ingame/objectives/atakhan/atakhan_${atakahn}.png`)} className="drake-point-img" />
        </div>
      }
      {array.map((a) => {
        let drake = drakes[a]

        if (drake == "-") return;
        if (!drake) return;

        return (
          <>
          <div className="drake-point" key={"red_drakes_" + a}>
            <img
              src={getDrakePointSourceFromKey(drake)}
              className="drake-point-img"
            />
          </div>
          { a < array.length - 1 && <div className="dragon-space"></div>}
          </>
        );
      })}
    </div>
  );
};

const DrakeTimer = ({ state: otherState, name }) => {
  const [lastTimer, setLastTimer] = useState( otherState);

  useEffect(() => {
    if(otherState?.dragonPitTimer) {
      setLastTimer( otherState)
    }
  }, [otherState]);

  if(!lastTimer?.dragonPitTimer) return;
  let state = lastTimer;

  let timeLeft = state?.dragonPitTimer?.timeLeft || 0;
  if(timeLeft < 0) timeLeft = 0;

  let image = getImagePath(state?.dragonPitTimer?.subType)
  let subTypeList = state?.dragonPitTimer?.subType.split("/")
  let subType = subTypeList[subTypeList.length - 1].split(".")[0].toLowerCase();

  return (
    <>
      <div className={`drake-timer drake ${subType} ${otherState?.dragonPitTimer ? "" : "hide"} ${(timeLeft <= 0 ? "live" : "")}`}>
        <img src={image} className="drake" alt={image} />
        <div className="time-wrapper">
          <span className="foreground">{formatTime(timeLeft)}</span>
          <span className="background">{formatTime(timeLeft)}</span>
        </div>
      </div>
    </>
  );
};

const AtakahnTimer = ({ state: otherState, name }) => {
  const [side, setSite] = useState(null);
  const [lastTimer, setLastTimer] = useState( otherState);

  useEffect(() => {
    if(otherState?.atakhanTimer) {
      setLastTimer( otherState)
    }
  }, [otherState]);

  useEffect(() => {
    if(otherState?.atakhanTimer?.mapSide) {
      setSite(otherState?.atakhanTimer?.mapSide)
    }
  }, [otherState?.atakhanTimer?.mapSide])

  if(!lastTimer?.atakhanTimer) return;
  let state = lastTimer;



  let timeLeft = state?.atakhanTimer?.timeLeft || 0;
  if(timeLeft < 0) timeLeft = 0;

  if(timeLeft > 300) return;

  let image = getImagePath(state?.atakhanTimer?.subType)


  return (
    <>
      <div className={`drake-timer atakahn ${otherState?.atakhanTimer ? "" : "hide"} ${side} ${(timeLeft <= 0 ? "live" : "")}`}>
        <img src={image} className="drake" />
        <div className="time-wrapper">
          <span className="foreground">{formatTime(timeLeft)}</span>
          <span className="background">{formatTime(timeLeft)}</span>
        </div>
      </div>
    </>
  );
};

const OtherTimer = ({ state: otherState, name }) => {
  const [lastTimer, setLastTimer] = useState( otherState);

  useEffect(() => {
    if(otherState?.baronPitTimer) {
      setLastTimer( otherState)
    }
  }, [otherState]);

  if(!lastTimer?.baronPitTimer) return;
  let state = lastTimer;

  let timeLeft = state?.baronPitTimer?.timeLeft || 0;

  let powerPlay = undefined;
  let color = undefined;
  let logo = undefined;

  let teamBlue = state?.scoreboard?.teams[0]
  let teamRed = state?.scoreboard?.teams[1]

  let matchData = getMatchData();

  if(state?.scoreboard?.teams[0]?.baronPowerPlay) {
    powerPlay = state?.scoreboard?.teams[0]?.baronPowerPlay;
    color = "blue"
    timeLeft = powerPlay?.timeLeft;
    logo = matchData?.team1?.image || teamBlue?.teamIconUrl;
  }

  if(state?.scoreboard?.teams[1]?.baronPowerPlay) {
    powerPlay = state?.scoreboard?.teams[1]?.baronPowerPlay;
    timeLeft = powerPlay?.timeLeft;
    color = "red"
    logo = matchData?.team2?.image || teamRed?.teamIconUrl;
  }

  if(powerPlay && powerPlay.timeLeft <= 0) {
    powerPlay = undefined;
    timeLeft = state?.baronPitTimer?.timeLeft || 0;
  }

  if(timeLeft < 0) timeLeft = 0;

  let image = getImagePath(state?.baronPitTimer?.subType)

  let gold = undefined;
  let vorzeichen = undefined;

  if(powerPlay) {
    gold = Math.round(powerPlay?.gold)
    if(gold > 0) {
      vorzeichen = "+"
    } else if(gold < 0) {
      vorzeichen = ""
    }
  }

  return (
    <>
      <div
        className={`drake-timer overlay other ${otherState?.baronPitTimer ? "" : "hide"} ${(timeLeft <= 0 ? "live" : "")} ${(powerPlay ? `power-play ${color}` : "")}`}
      >

        <img src={image} className="drake" />
        {powerPlay && <div className="power-play-overlay">BARON POWER PLAY</div>}
        <div className="time-wrapper">
          <span className="foreground">{formatTime(timeLeft)}</span>
          {powerPlay && <>
            <img src={logo} class="logo" />
            <span className="gold">{vorzeichen}{gold}g</span>
          </>}
          <span className="background">{formatTime(timeLeft)}</span>
        </div>
      </div>
    </>
  );
};

const SpellWithCooldown = ({ icon, total, current, extras, stacks, inactive = false}) => {

  let rotation = 0;
  if(current > 0) {
    rotation = map(current, 0, total, 180, -180);
  }

  if(total == 0) {
    rotation = 360;
  }

  return <div className={`spell-with-cooldown ${extras} ${inactive && "inactive"}`} data-current={current} data-total={total}>
    {current > 0 && <div class={`cooldown-max`}></div>}
    {current > 0 && <div class={`cooldown-handle`} style={{ transform: `rotate(${rotation}deg)`}}></div>}
    {current > 0 && <div className="cooldown"></div>}

    {stacks !== undefined && <div className="stacks-sum">{stacks}</div>}
    <img src={icon} className={`spell-img ${current > 0 && "cooldown"}`} alt={""} />
  </div>
}

const XP = [
  0, 280, 660, 1140, 1720, 2400, 3180, 4060, 5040, 6120, 7300, 8580, 9960,
  11440, 13020, 14700, 16480, 18360,
];

const SideChampions = ({ state, players, items, version, team, integration}) => {

  const teamFightView = !state?.scoreboardBottom || integration?.leagueOfLegends?.hud?.mode == "lane-phase";

  return (
    <div className={`side-champions ${team} ${teamFightView ? "team-fight" : ""}`}>
      {players.map((player, i) => {
        const lvl = player.level;
        const xpBeforThisLvl = XP[lvl - 1];
        const xpThisLvl = XP[lvl];

        const width = map(player.experienceToNextlevel || 0, xpBeforThisLvl, xpThisLvl, 0, 100);

        const maxHealth = Math.round(player?.health?.max || 0);
        const health = Math.round(player?.health?.current);

        const maxMana = Math.round(player?.resource?.max);
        const mana = Math.round(player?.resource?.current);

        const widthHealth = map(health, 0, maxHealth, 0, 100);
        const widthMana = map(mana, 0, maxMana, 0, 100);

        const hasElder = player?.hasElder;
        const hasBaron = player?.hasBaron;

        let extraManaClass = getExtraManaClass(player.championAssets?.name);

        let champImg = getImagePath(`${player?.championAssets?.splashCenteredImg}`)

        let ult = player?.abilities?.find(a => a.slot == "R")
        let sum1 = player?.abilities[4]
        let sum2 = player?.abilities[5]
        let rune = player?.perks[0]

        // STACKS
        let stacks = player?.stacksData;

        let sum1Image = getImagePath(`${sum1?.assets?.iconAsset}`)
        let sum2Image = getImagePath(`${sum2?.assets?.iconAsset}`)
        let ultImage = getImagePath(`${ult?.assets?.iconAsset}`)
        let runeImg = getImagePath(`${rune?.iconPath}`)

        let isSmite1 = sum1?.identifier == "SummonerSmite";
        let isSmite2 = sum2?.identifier == "SummonerSmite";

        if(!player) {
          return;
        }

        return (
          <div
            className={"side-champ c" + (i + 1) + " " + (hasBaron ? "baron" : "") + " " + (hasElder ? "elder" : "")}
            key={"champ_blue_" + i}
          >
            <div className="player-bg"></div>
            <span className="displayName">{player?.playerName}</span>

            <SpellWithCooldown icon={sum1Image} total={sum1?.totalCooldown} current={sum1?.cooldown} extras="spell-1" stacks={isSmite1 ? sum1.charges : undefined } />
            <SpellWithCooldown icon={sum2Image} total={sum2?.totalCooldown} current={sum2?.cooldown} extras="spell-2" stacks={isSmite2 ? sum2.charges : undefined } />
            <SpellWithCooldown icon={runeImg} total={0} current={0} extras="rune" />

            {lvl >= 6 && <SpellWithCooldown icon={ultImage} total={ult?.totalCooldown} current={ult?.cooldown} extras="ult" />}
            {stacks > 0 && <div className="stacks">{stacks}</div>}
            {lvl == 6 && <div className="lvl-up">6</div>}
            {lvl == 11 && <div className="lvl-up">11</div>}
            {lvl == 16 && <div className="lvl-up">16</div>}
            {lvl == 18 && <div className="lvl-up">18</div>}

            <div
              className={"champion-image " + (player?.timeToRespawn > 0  ? "dead" : "")}
              style={{
                backgroundImage: `url(${champImg})`,
              }}
            ></div>

            {player?.timeToRespawn > 0 && (
              <span className="respawn-timer">
                {Math.round(player?.timeToRespawn)}
              </span>
            )}

            <span className="champion-level">{lvl}</span>

            {lvl < 18 && <div className="progress champion-exp">
              <div
                className={"progress-bar exp text-end"}
                style={{ width: `${width.toFixed(2)}%` }}
              ></div>
            </div>}
            <div className="progress champion-health">
              <div
                className={"progress-bar health text-end"}
                style={{ width: `${widthHealth.toFixed(2)}%` }}
              ></div>
            </div>
            <div className={"progress champion-mana"} data-champ={player.championAssets?.name}>
              <div
                className={"progress-bar text-end " + extraManaClass}
                style={{ width: `${widthMana.toFixed(2)}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const getExtraManaClass = (champ) => {
  switch (champ) {
    case "Aatrox":
    case "Tryndamere":
    case "Renekton":
    case "Shyvana":
    case "Vladimir":
    case "Rumble":
      return "bloodwell";
    case "Akali":
    case "Shen":
    case "Kennen":
    case "Zed":
    case "Ambessa":
    case "Lee Sin":
      return "energy";
    case "DrMundo":
    case "Garen":
    case "Katarina":
    case "Riven":
    case "Viego":
    case "Briar":
    case "Zac":
      return "mana-less";
    case "Gnar":
    case "RekSai":
      return "rage";
    case "Morderkaiser":
    case "Sett":
    case "Kled":
      return "shield";
    case "Yone":
    case "Yasou":
      return "flow";
    case "Rengar":
      return "ferocity";
    default:
      return "no-special";
  }
};

export default IngameThemeA1eSports;
