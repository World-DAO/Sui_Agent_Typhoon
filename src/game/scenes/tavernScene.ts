// scenes/TavernScene.ts
import Phaser from "phaser";
import { SceneManager } from "./tavern/sceneManager";
import { AudioManager } from "./tavern/audioManager";
import { movementController } from "./tavern/moveController";
import { BarmanInteraction } from "./tavern/barmanInteraction";

export default class TavernScene extends Phaser.Scene {
    private sceneManager!: SceneManager;
    private audioManager!: AudioManager;
    private movementController?: movementController;
    private barmanInteraction?: BarmanInteraction;

    constructor() {
        super("tavernScene");
    }

    create() {
        // 设置场景尺寸数据
        // this.data.set('bgWidth', 550);
        // this.data.set('bgHeight', 1195);
        this.data.set("bgWidth", Math.max(window.innerWidth, 1600));
        this.data.set("bgHeight", Math.max(window.innerHeight, 900));

        // 初始化场景管理器
        this.sceneManager = new SceneManager(this);
        this.sceneManager.initialize();

        // 初始化音频管理器
        this.audioManager = new AudioManager(this);
        this.audioManager.initialize();

        // 初始化其他管理器
        this.movementController = new movementController(
            this,
            this.sceneManager.player,
            this.sceneManager.grid,
            this.sceneManager.gridSize
        );

        this.barmanInteraction = new BarmanInteraction(
            this,
            this.sceneManager.player,
            this.sceneManager.barman,
            this.sceneManager.gridSize
        );

        // 设置UI和事件监听
        this.setupUIAndEvents();
    }

    private setupUIAndEvents() {
        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (this.barmanInteraction?.isContained(pointer.x, pointer.y) ||
          this.barmanInteraction?.isContainedBarman(pointer.worldX, pointer.worldY)) {
                // 如果点击了酒保或对话框，不处理移动
                return;
            }
            
            if (this.sceneManager.isContained(pointer.worldX, pointer.worldY)) {
                return;
            }
            this.sceneManager.handlePointerDown(
                pointer,
                this.movementController
            );
        });

        // Barman交互
        this.sceneManager.barman.sprite.on("pointerdown", () => {
            this.barmanInteraction?.handleBarmanInteraction();
        });
    }

    update(time: number, delta: number) {
        // 让 movementController 每帧执行 update
        this.movementController?.update(delta);

        // 如果不在自动移动，可以再做方向键控制
        if (
            this.movementController &&
            !this.movementController.isAutoMoving()
        ) {
            this.sceneManager.player.handleMovement(this.sceneManager.cursors!);
        }
    }
}
