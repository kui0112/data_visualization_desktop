import {MixedNode} from "./MixedNode";
import {ExtensionCategory, register} from "@antv/g6";
import {ExtendedForceLayout} from "./ExtendedForceLayout";

register(ExtensionCategory.NODE, 'mixed-node', MixedNode);
register(ExtensionCategory.LAYOUT, 'extended-force', ExtendedForceLayout);

export const maxIteration = 1000000
export const dark: boolean = false
