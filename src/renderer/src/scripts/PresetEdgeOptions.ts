import {EdgeOptions} from "@antv/g6";
import {dark} from "./GlobalSettings";

export const PresetEdgeOptions: EdgeOptions = {
    type: 'line',
    style: {
        startArrow: false,
        endArrow: false,
        lineWidth: 0.5,
        stroke: dark ? '#ffffff' : '#557bd8'
    },
}