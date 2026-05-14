import FireModel from "../assets/icons/drakes/model/clean/FireModel.png"
import AirModel from "../assets/icons/drakes/model/clean/AirModel.png"
import WaterModel from "../assets/icons/drakes/model/clean/WaterModel.png"
import EarthModel from "../assets/icons/drakes/model/clean/EarthModel.png"
import HextechModel from "../assets/icons/drakes/model/clean/HextechModel.png"
import ChemtechModel from "../assets/icons/drakes/model/clean/ChemtechModel.png"
import ElderModel from "../assets/icons/drakes/model/clean/ElderModel.png"

import AirPoint  from "../assets/icons/drakes/points/AirPoint.png"
import FirePoint  from "../assets/icons/drakes/points/FirePoint.png"
import WaterPoint  from "../assets/icons/drakes/points/WaterPoint.png"
import EarthPoint  from "../assets/icons/drakes/points/EarthPoint.png"
import HextechPoint  from "../assets/icons/drakes/points/HextechPoint.png"
import ChemtechPoint  from "../assets/icons/drakes/points/ChemtechPoint.png"

import AirIcon  from "../assets/icons/drakes/icon/AirIcon.png"
import FireIcon  from "../assets/icons/drakes/icon/FireIcon.png"
import WaterIcon  from "../assets/icons/drakes/icon/WaterIcon.png"
import EarthIcon  from "../assets/icons/drakes/icon/EarthIcon.png"
import HextechIcon  from "../assets/icons/drakes/icon/HextechIcon.png"
import ChemtechIcon  from "../assets/icons/drakes/icon/ChemtechIcon.png"
import ElderIcon  from "../assets/icons/drakes/icon/ElderIcon.png"

const DRAKE_MODELS = {
	"air": AirModel,
	"fire": FireModel,
	"water": WaterModel,
	"earth": EarthModel,
	"hextech": HextechModel,
	"chemtech": ChemtechModel,
	"elder": ElderModel
}

const DRAKE_POINTS = {
	"air": AirPoint,
	"fire": FirePoint,
	"water": WaterPoint,
	"earth": EarthPoint,
	"hextech": HextechPoint,
	"chemtech": ChemtechPoint,
  "elder": ElderModel,
  "cloud": AirPoint,
  "infernal": FirePoint,
  "ocean": WaterPoint,
  "mountain": EarthPoint,
}

const DRAKE_ICONS = {
	"air": AirIcon,
	"fire": FireIcon,
	"water": WaterIcon,
	"earth": EarthIcon,
	"hextech": HextechIcon,
	"chemtech": ChemtechIcon,
	"elder": ElderIcon,
  "cloud": AirIcon,
  "infernal": FireIcon,
  "ocean": WaterIcon,
  "mountain": EarthIcon,
}

export const getDrakeModelSourceFromKey = (key) => {
	if(!key) return null;
	return DRAKE_MODELS[key.toLowerCase()]
}

export const getDrakePointSourceFromKey = (key) => {
	if(!key) return null;
	return DRAKE_POINTS[key.toLowerCase()]
}

export const getDrakes = () => {
	return Object.keys(DRAKE_MODELS);
}

export const getDrakeIconFromKey = (key) => {
	if(!key) return null;
	return DRAKE_ICONS[key.toLowerCase()]
}
