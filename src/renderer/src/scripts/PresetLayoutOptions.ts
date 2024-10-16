import {LayoutOptions} from "@antv/g6";
import {maxIteration} from "./GlobalSettings";

export const PresetForceLayoutOptions: LayoutOptions = {
    type: 'extended-force',
    frameTimeInterval: 40,
    speed: 8,
    dimensions: 2,
    maxIteration: maxIteration,
    gravity: 10,
    factor: 1,
    edgeStrength: 50,
    nodeStrength: 1000,
    coulombDisScale: 0.005,
    damping: 0.9,
    maxSpeed: 10,
    minMovement: 0.001,
    interval: 0.02,
    linkDistance: 200,
    preventOverlap: true,
    nodeSpacing: 10,
    distanceThresholdMode: 'mean',
    animation: true,
    // clustering: true,
    // clusterNodeStrength: 20,
    // nodeClusterBy: (node: NodeData) => node.data.branch,
}

export const PresetFruchtermanLayoutOptions: LayoutOptions = {
    type: 'fruchterman',
    frameTimeInterval: 40,
    maxIteration: maxIteration,
    gravity: 1,
    speed: 5,
    linkDistance: 100,
    preventOverlap: true,
    // clustering: true,
    // clusterGravity: 2,
    // clusterNodeStrength: 70,
    // nodeClusterBy: (node: NodeData) => node.data.branch,
}