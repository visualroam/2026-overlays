import { io } from "socket.io-client";
import { isDev, port } from ".";
import { GSI, hudIdentity } from "./HUD";
import { CSGORaw } from "csgogsi";
import { actions, configs } from "./contexts/actions";
import { initiateConnection } from "./HUD/camera";

export const socket = io(isDev ? `localhost:${port}` : '/');

type RoundPlayerDamage = {
	steamid: string;
	damage: number;
};
type RoundDamage = {
	round: number;
	players: RoundPlayerDamage[];
};

const applyUpdate = (data: any, damage?: any) => {
    if (damage) {
        GSI.damage = damage;
    }
    GSI.digest(data);
};

const onSocketUpdate = (data: any, damage: any) => {
    applyUpdate(data, damage);
};

socket.on("update", onSocketUpdate);

const isInWindow = !!window.parent.ipcApi;

if(isInWindow){
	window.parent.ipcApi.receive('raw', (data: CSGORaw, damage?: RoundDamage[]) => {
		applyUpdate(data, damage);
	});
}

const href = window.location.href;

socket.emit("started");

if (isDev) {
    hudIdentity.name = (Math.random() * 1000 + 1).toString(36).replace(/[^a-z]+/g, '').substr(0, 15);
    hudIdentity.isDev = true;
} else {
    const segment = href.substr(href.indexOf('/huds/') + 6);
    hudIdentity.name = segment.substr(0, segment.lastIndexOf('/'));
}

const onReadyToRegister = () => {
    socket.emit("register", hudIdentity.name, isDev, "cs2", isInWindow ? "IPC" : "DEFAULT");
    initiateConnection();
};

const onHudConfig = (data: any) => {
    configs.save(data);
};

const onHudAction = (data: any) => {
    actions.execute(data.action, data.data);
};

const onKeybindAction = (action: string) => {
    actions.execute(action);
};

const onRefreshHUD = () => {
    window.top?.location.reload();
};

const onMirvUpdate = (data: any) => {
    GSI.digestMIRV(data);
};

socket.on("readyToRegister", onReadyToRegister);
socket.on(`hud_config`, onHudConfig);
socket.on(`hud_action`, onHudAction);
socket.on('keybindAction', onKeybindAction);
socket.on("refreshHUD", onRefreshHUD);
socket.on("update_mirv", onMirvUpdate);
