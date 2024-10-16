import {Graph} from "@antv/g6";
import type {GraphOptions} from "@antv/g6";
import {Callable} from "./Callable";
import {delay} from "./Utils";

export interface NewGraphOptions extends GraphOptions {
    dynamicImageSource: Callable<void, string>
}

export class NewGraph extends Graph {
    public maxLevel: number = 0

    constructor(options: NewGraphOptions) {
        super(options);
        // 获取最大层级
        this.maxLevel = this.getNodeData().map((node) => node.data.level as number).reduce((prev, cur) => Math.max(prev, cur))
        // node初始化时，赋值一个图片src
        for (const node of this.getNodeData()) {
            node.data.src = options.dynamicImageSource.call()
        }
        // 将所有的边设置为透明
        for (const edge of this.getEdgeData()) {
            edge.style.opacity = 0
        }
    }

    public async render(): Promise<void> {
        return super.render()
    }

    public async animation(): Promise<void> {
        const emergeInterval = 3
        const TextModeDuration = 30
        const ImageModeDuration = 15
        const disappearInterval = 0.8

        // 初始化节点配置
        this.emit("NewGraph:Initialize")
        // 进入文字模式
        this.emit("NewGraph:EnterTextState")
        // 动画：节点逐层浮现
        for (let i = 0; i < this.maxLevel + 1; i++) {
            this.emit("NewGraph:EmergeLevelUpdate", i)
            await delay(emergeInterval)
        }
        // 文字模式持续渲染
        await delay(TextModeDuration)

        // 进入图像模式
        this.emit("NewGraph:EnterImageState")
        // 图像模式持续渲染
        await delay(ImageModeDuration)
        // 进入文字模式
        this.emit("NewGraph:EnterTextState")
        // 文字模式持续渲染
        await delay(TextModeDuration)
        // 进入图像模式
        this.emit("NewGraph:EnterImageState")
        // 图像模式持续渲染
        await delay(ImageModeDuration)

        // 动画：节点逐层消失
        this.emit("NewGraph:Disappear")
        for (let i = 0; i < this.maxLevel + 1; i++) {
            this.emit("NewGraph:DisappearLevelUpdate", i)
            await delay(disappearInterval)
        }
        await delay(3)
    }

    public destroy() {
        console.log("destroy Graph.")
        return super.destroy()
    }
}
