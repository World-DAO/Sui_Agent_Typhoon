import Phaser from "phaser";
import Player from "../../heroes/player";
import Barman from "../../heroes/barman";
import { findPath } from "../../utils/findPath";
import { movementController } from "./moveController";
import { staticObstacles } from "@/game/objects/static";
import { EventBus } from "@/game/EventBus";

export class SceneManager {
    public player!: Player;
    public barman!: Barman;
    public cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    public gridSize!: number;
    public grid!: number[][];
    public UI: Phaser.GameObjects.Image[] = [];

    private scene: Phaser.Scene;
    private obstrucleGroup?: Phaser.Physics.Arcade.StaticGroup;
    private background?: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public initialize() {
        this.initializeGrid();
        this.createBackground();
        this.createObstacles();
        this.createCharacters();
        this.setupCamera();
        this.createUI();
    }

    // UI 相关方法
    private createUI() {
        this.createDriftBottleButton();
    }

    private createDriftBottleButton() {
        const originalScale = 0.5;
        const hoverScale = originalScale * 1.1

        const driftbottleButton = this.scene.add
            .image(this.scene.scale.width/2-35, 230, "driftbottle")
            .setScale(originalScale)
            .setInteractive()
            .setOrigin(0.5)
            .setScrollFactor(0);

        driftbottleButton.on("pointerdown", () => {
            if (!this.scene.scene.isPaused()) {
                // Only pause if not already paused
                this.scene.scene.pause();
                this.scene.scene.launch("DriftBottleScene");
                //EventBus.emit('switch-driftbottle-scene');
            }
        });
        this.UI.push(driftbottleButton);

        
        driftbottleButton.on('pointerover', () => {
            this.scene.input.manager.canvas.style.cursor = 'pointer';
    
            this.scene.tweens.add({
                targets: driftbottleButton,
                scale: hoverScale,
                duration: 100,
                ease: 'Linear'
            });
        });
        
        driftbottleButton.on('pointerout', () => {
            this.scene.input.manager.canvas.style.cursor = 'default';
    
            this.scene.tweens.add({
                targets: driftbottleButton,
                scale: originalScale,
                duration: 100,
                ease: 'Linear'
            });
        });
    }

    // 原有的场景管理方法
    private initializeGrid() {
        this.gridSize = this.scene.registry.get("gridSize");
        this.grid = this.scene.registry.get("grid");
    }

    private createBackground() {
        const bgWidth = this.scene.data.get("bgWidth");
        const bgHeight = this.scene.data.get("bgHeight");

        this.background = this.scene.add
            .image(bgWidth / 2, bgHeight / 2, "tavern_bg")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(bgWidth, bgHeight);
    }

    private createObstacles() {
        this.obstrucleGroup = this.scene.physics.add.staticGroup();

        for (const obstacle of staticObstacles) {
            // debugger;
            for (let y = obstacle.starty; y <= obstacle.endy; y++) {
                for (let x = obstacle.startx; x <= obstacle.endx; x++) {
                    this.grid[y][x] = 1;
                }
            }
        }

        //this.drawGrid();
    }

    private createCharacters() {
        // 创建玩家
        this.player = new Player(
            this.scene,
            20 * this.gridSize,
            4 * this.gridSize,
            "user"
        );
        this.player.sprite.setDisplaySize(this.gridSize*1.6, this.gridSize*3.8);

        this.cursors = this.scene.input.keyboard!.createCursorKeys();
        this.scene.physics.add.collider(
            this.player.sprite,
            this.obstrucleGroup!
        );

        // 创建酒保
        this.barman = new Barman(
            this.scene,
            7 * this.gridSize,
            6 * this.gridSize,
            "barwoman"
        );
        this.barman.sprite.setInteractive();
        this.barman.sprite.setDisplaySize(this.gridSize*1.6, this.gridSize*3);

        this.barman.sprite.on('pointerover', () => {
            this.scene.input.manager.canvas.style.cursor = 'pointer';
        });
        
        this.barman.sprite.on('pointerout', () => {
            this.scene.input.manager.canvas.style.cursor = 'default';
        });
    }

    private setupCamera() {
        const camera = this.scene.cameras.main
        camera.setViewport(0, 0, window.innerWidth, window.innerHeight)
          .setBounds(0, 0, 3200, 1800); // 绑定到地图尺寸
        // 窗口大小变化监听
        window.addEventListener('resize', () => {
          camera.setViewport(0, 0, window.innerWidth, window.innerHeight);
        });
        const mainCamera = this.scene.cameras.main;
        mainCamera.startFollow(this.player.sprite, true, 0.09, 0.09, 0, 0);
        mainCamera.setBackgroundColor("#000000");
    }

    public handlePointerDown(
        pointer: Phaser.Input.Pointer,
        moveController?: movementController
    ) {
        const tx = Math.floor(pointer.worldX / this.gridSize);
        const ty = Math.floor(pointer.worldY / this.gridSize);

        if (
            tx < 0 ||
            tx >= this.grid[0].length ||
            ty < 0 ||
            ty >= this.grid.length
        ) {
            return;
        }
        if (this.grid[ty][tx] === 1) {
            return;
        }
        // if (this.grid[tx][ty] === 1) {
        //   return;
        // }
        // click on UI, stop moving
        if (
            this.UI.some((ui) => ui.getBounds().contains(pointer.x, pointer.y))
        ) {
            return;
        }
        const px = Math.floor(this.player.sprite.x / this.gridSize);
        const py = Math.floor(this.player.sprite.y / this.gridSize);

        const result = findPath(this.grid, px, py, tx, ty);
        if (result.length === 0) {
            return;
        }

        moveController?.stopMoving();
        moveController?.startPath(result);
    }
    private drawGrid() {
        const bgWidth = 1195;
        const bgHeight = 550;
        // const bgWidth = 550;
        // const bgHeight = 1195;
        // 添加网格显示
        const graphics = this.scene.add.graphics();

        // 遍历每个格子
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[0].length; x++) {
                const isObstacle = this.grid[y][x] === 1;

                // 设置网格线的样式
                graphics.lineStyle(
                    1,
                    isObstacle ? 0xff0000 : 0xffffff,
                    isObstacle ? 0.5 : 0.3
                );

                // 计算格子的四个顶点
                const left = x * this.gridSize;
                const right = left + this.gridSize;
                const top = y * this.gridSize;
                const bottom = top + this.gridSize;

                // 绘制格子的四条边
                graphics.beginPath();
                graphics.moveTo(left, top);
                graphics.lineTo(right, top);
                graphics.lineTo(right, bottom);
                graphics.lineTo(left, bottom);
                graphics.lineTo(left, top);
                graphics.strokePath();

                // 如果是障碍物，添加文字标识
                if (isObstacle) {
                    this.scene.add
                        .text(
                            left + this.gridSize / 2,
                            top + this.gridSize / 2,
                            "障碍",
                            {
                                fontSize: "14px",
                                color: "#ff0000",
                                backgroundColor: "#00000080",
                            }
                        )
                        .setOrigin(0.5);
                }
            }
        }
    }
}