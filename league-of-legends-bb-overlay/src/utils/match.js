import AfwLogo from "../assets/teams/afw.png";
import EinsLogo from "../assets/teams/eins.webp";
import UseLogo from "../assets/teams/use.png";
import SixgpaLogo from "../assets/teams/6gpa.png";
import dkbLogo from "../assets/teams/dkb.png";
import SgeLogo from "../assets/teams/sge.png";
import TogaLogo from "../assets/teams/toga.png";
import htpLogo from "../assets/teams/htp_w.svg?url";
import LOG from "../assets/a1esports/log.png";
import TWO_TA from "../assets/teams/2ta.png";

import EINSLilipp from "../assets/players/lilipp.png";
import EINSPowerofEvil from "../assets/players/powerofevil.png";
import EINSPride from "../assets/players/pride.png";
import EINSSantorin from "../assets/players/santorin.png";
import EINSBroeki from "../assets/players/broeki.png";
import SGEZaZee from "../assets/players/zazee.png";
import SGEVeignorem from "../assets/players/vinh.png";
import SGE_Sacre from "../assets/players/sacre.png";
import Boy from "../assets/players/3.png";
import Girl from "../assets/players/2.png";

import HNVRVikes from "../assets/players/hnvr_vikes.png";
import HNVRgoose from "../assets/players/hnvr_goose.png";
import HNVRboempel from "../assets/players/hnvr_boempel.png";
import HNVRstorm from "../assets/players/hnvr_Storm.png";
import HNVR_Eckbard from "../assets/players/hnvr_eckbart.png";

import SIXTurtle from "../assets/players/turtle.png";
import SIXClears from "../assets/players/clears.png";
import SIXMalek from "../assets/players/malek.png";
import SIXShakur from "../assets/players/shakur.png";
import SIXIHEBIC from "../assets/players/ihebic.png";

import AFWNano from "../assets/players/nano.png";
import AFWVaynedeta from "../assets/players/veyndetta.png";
import AFWHungryPanda from "../assets/players/hungrypanda.png";

import USEForNoReason from "../assets/players/fornoreason.png";
import USEWhite from "../assets/players/white.png";
import USESimpli from "../assets/players/simpli.png";
import USEDenVoksne from "../assets/players/denvoknse.png";
import USESeaz from "../assets/players/seaz.png";

import DKBTayato from "../assets/players/tayto.png"
import DKBwoldjo from "../assets/players/woldjo.png";
import DKBAzuka from "../assets/players/azuka.png";
import DKBlocki from "../assets/players/looki.png";
import DKBephekles from "../assets/players/ephekles.png";

import TOGA_Niqkl from "../assets/players/nqkl.png";
import TOGA_Poro from "../assets/players/poro.png";
import TOGA_Richu from "../assets/players/richu.png";

import Xam from "../assets/players/adc_Xam_2.png";
import Deved from "../assets/players/top_sub_Deved.png";

import Default from "../assets/players/1.png";

const AFW = {
  name: "Austrian Force Willhaben",
  image: AfwLogo,
  tag: "AFW",
  coach: "Vil & Franio",
  color: '#d42f2f',
  players: [
    "Nano",
    "Deletus",
    "Fenz1",
    "Vaynedeta",
    "HungryPanda"
  ],
  images: [
    AFWNano,
    Boy,
    Boy,
    AFWVaynedeta,
    AFWHungryPanda
  ]
}

const EINS = {
  name: "Eintracht Spandau",
  image: EinsLogo,
  tag: "EINS",
  coach: "chickenhero",
  color: '#b84f47',
  players: [
    "Pride",
    "Santorin",
    "PowerofEvil",
    "Broeki",
    "Lilipp",
  ],
  images: [
    EINSPride,
    EINSSantorin,
    EINSPowerofEvil,
    EINSBroeki,
    EINSLilipp,
  ]
}

const USE = {
  name: "Unicorns of Love Sexy Edition",
  image: UseLogo,
  tag: "USE",
  coach: "Sheepy & Invi",
  color: '#cf6194',
  players: [
    "ForNoReason",
    "White",
    "Simpli",
    "DenVoksne",
    "Seaz"
  ],
  images: [
    USEForNoReason,
    USEWhite,
    USESimpli,
    USEDenVoksne,
    USESeaz
  ]
}

const SIX_GPA = {
  name: "6GPA",
  image: SixgpaLogo,
  tag: "6GPA",
  coach: "-",
  color: '#148dea',
  players: [
    "Turtle",
    "Clears",
    "Proscot",
    "Cem",
    "IHEBIC"
  ],
  images: [
    SIXTurtle,
    SIXClears,
    Boy,
    Boy,
    SIXIHEBIC
  ]
}

const DKB = {
  name: "DKB Xperion NXT",
  image: dkbLogo,
  tag: "DKB",
  coach: "Primal & Dat",
  color: '#148dea',
  players: [
    "Tayato",
    "woldjo",
    "Azuka",
    "looki",
    "ephekles"
  ],
  images: [
    DKBTayato,
    DKBwoldjo,
    DKBAzuka,
    DKBlocki,
    DKBephekles
  ]
}

const SGE = {
  name: "Eintracht Frankfurt",
  image: SgeLogo,
  tag: "SGE",
  coach: "x4NTY & SevenArmy",
  color: '#e30613',
  players: [
    "Sacre",
    "SGE Jungle",
    "ZaZee",
    "SGE Adc",
    "Veignorem"
  ],
  images: [
    SGE_Sacre,
    Boy,
    SGEZaZee,
    Boy,
    SGEVeignorem
  ]
}

const TOGA = {
  name: "TeamOrangeGaming Academy",
  image: TogaLogo,
  tag: "TOGA",
  color: '#ed7505',
  coach: "Swonzer & Ghoulomat",
  players: [
    "Niqkl",
    "Denizzz",
    "Poro",
    "Ryuk",
    "Richu"
  ],
  images: [
    TOGA_Niqkl,
    Boy,
    TOGA_Poro,
    Boy,
    TOGA_Richu
  ]
}

const HTP = {
  name: "htp eSport Akademie Hannover",
  image: htpLogo,
  tag: "HNVR",
  color: '#cae4fb',
  coach: "-",
  players: [
    "Vikes",
    "goose",
    "boempel",
    "storm",
    "Eckbard"
  ],
  images: [
    HNVRVikes,
    HNVRgoose,
    HNVRboempel,
    HNVRstorm,
    HNVR_Eckbard
  ]
}

const teams = {
  "AFW": AFW,
  "EINS": EINS,
  "USE": USE,
  "6GPA": SIX_GPA,
  "DKB": DKB,
  "SGE": SGE,
  "TOGA": TOGA,
  "HNVR": HTP,
}

export const getTeamViaTag = (tag) => {
  return teams[tag];
}

const LOGTeam1 = {
  name: "Cracy Devils",
  image: LOG,
  tag: "CD",
  coach: "-",
  players: ["-", "-", "-", "-", "-"],
  images: [
    Default,
    Default,
    Default,
    Default,
    Default
  ]
}

const LOGTeam2 = {
  name: "Austrian Squadron",
  image: LOG,
  tag: "AUT",
  coach: "-",
  players: ["Frag den Indra", "Macro n Cheese", "Mighty Chopsticks", "LukeNight", "Max Value"],
  images: [
    Default,
    Default,
    Default,
    Default,
    Default
  ]
}

const TWO_TAteam = {
  name: "Second Time Alive",
  image: TWO_TA,
  tag: "2TA",
  coach: "-",
  players: ["Deved", "Tazyo", "Devilos", "Xam", "allleexxx"],
  images: [
    Deved,
    Default,
    Default,
    Xam,
    Default
  ]
}

const PlayerImages = {
  "PowerOfEvil": EINSPowerofEvil,
  "ZaZee": SGEZaZee,
  "Simpli": USESimpli,
  "DenVoksne": USEDenVoksne,
  "Seaz": USESeaz,
  "ForNoReason": USEForNoReason,
  "White": USEWhite,
  "Pride": EINSPride,
  "Santorin": EINSSantorin,
  "Broeki": EINSBroeki,
  "Lilipp": EINSLilipp
}

export const getPlayerImage = (playerName) => {
  return PlayerImages[playerName];
}

export const getMatchData = () => {

  let patch = "15.12"
  let team1 = USE;
  let team2 = EINS;
  let swap = false;
  let gameExtra = "finale";
  let score1 = 1;
  let score2 = 0;
  let bestOf = 3;
  let showFearless = true;
  let showCoach = true;

  if (swap) {
    let swapTeam = team1;
    let x = score1;
    team1 = team2;
    team2 = swapTeam;
    score1 = score2;
    score2 = x;
  }

  return {
    team1: {
      ...team1,
      score: score1,
    },
    team2: {
      ...team2,
      score: score2,
    },
    bestOf: bestOf,
    swap: swap,
    patch: patch,
    showCoach: showCoach,
    showFearless: showFearless,
    gameExtra: gameExtra,
  }
}
