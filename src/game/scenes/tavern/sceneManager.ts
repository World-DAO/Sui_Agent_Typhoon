import Phaser from "phaser";
import Player from "../../heroes/player";
import Barman from "../../heroes/barman";
import { findPath } from "../../utils/findPath";
import { movementController } from "./moveController";
import { staticObstacles } from "@/game/objects/static";
import { EventBus } from "@/game/EventBus";
import { getSuiBalance } from "@/game/utils/sui";

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
    private tokenAmount?: Phaser.GameObjects.Text;

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

        // 添加恢复游戏的事件监听
        EventBus.on("close-mail", () => {
            if (this.scene.scene.isPaused()) {
                this.scene.scene.resume();
            }
        });
    }

    // UI 相关方法
    private createUI() {
        this.createDriftBottleButton();
        this.createTopBar();
    }

    private createTopBar() {
        // 添加头像
        const userData = this.scene.registry.get("userData");
        const avatar = this.scene.add
            .circle(40, 30, 20, 0x4eeaff, 0.8)
            .setScrollFactor(0)
            .setDepth(1001);

        // 添加地址文本
        const addressText = this.scene.add
            .text(
                70,
                20,
                `${userData.walletAddress.slice(
                    0,
                    4
                )}...${userData.walletAddress.slice(-4)}`,
                {
                    fontFamily: "Arial",
                    fontSize: "16px",
                    color: "#4EEAFF",
                }
            )
            .setScrollFactor(0)
            .setDepth(1001);

        // 添加背景层
        const balanceBg = this.scene.add
            .rectangle(
                this.scene.cameras.main.width - 65, // 向左移动以适应更大的宽度
                28,
                120, // 增加背景宽度
                32, // 增加背景高度
                0x9d5bde
            )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1000)
            .setAlpha(0.2);

        // 添加SUI logo
        const suiLogo = this.scene.add
            .image(this.scene.cameras.main.width - 105, 28, "sui_logo") // 调整位置
            .setDisplaySize(20, 24) // 增加logo尺寸
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1001);

        // 添加代币数量
        this.tokenAmount = this.scene.add
            .text(
                this.scene.cameras.main.width - 25, // 调整位置
                18, // 微调垂直位置以保持居中
                `${Number(userData.suiBalance).toFixed(2)}`,
                {
                    fontFamily: "Arial",
                    fontSize: "20px", // 增加字体大小
                    color: "#4EEAFF",
                    align: "right",
                }
            )
            .setOrigin(1, 0)
            .setScrollFactor(0)
            .setDepth(1001);

        // 将元素添加到UI数组
        this.UI.push(
            avatar as any,
            addressText as any,
            balanceBg as any, // 添加背景到UI数组
            suiLogo as any,
            this.tokenAmount as any
        );
    }

    private createDriftBottleButton() {
        const originalScale = 0.5;
        const hoverScale = originalScale * 0.9;
        const size = this.scene.registry.get("gridSize");
        const driftbottleButton = this.scene.add
            .image(size * 15, size * 8, "bar_menu")
            .setScale(originalScale * 0.8)
            .setInteractive()
            .setOrigin(0.5);
        //.setScrollFactor(0);

        driftbottleButton.on("pointerdown", () => {
            if (!this.scene.scene.isPaused()) {
                this.scene.scene.pause();
                EventBus.emit("switch-driftbottle-scene");
            }
        });
        this.UI.push(driftbottleButton);

        driftbottleButton.on("pointerover", () => {
            this.scene.input.manager.canvas.style.cursor = "pointer";

            this.scene.tweens.add({
                targets: driftbottleButton,
                scale: hoverScale,
                duration: 100,
                ease: "Linear",
            });
        });

        driftbottleButton.on("pointerout", () => {
            this.scene.input.manager.canvas.style.cursor = "default";

            this.scene.tweens.add({
                targets: driftbottleButton,
                scale: originalScale * 0.8,
                duration: 100,
                ease: "Linear",
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
        this.player.sprite.setDisplaySize(
            this.gridSize * 1.6,
            this.gridSize * 3.8
        );

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
        this.barman.sprite.setDisplaySize(
            this.gridSize * 1.6,
            this.gridSize * 3
        );

        this.barman.sprite.on("pointerover", () => {
            this.scene.input.manager.canvas.style.cursor = "pointer";
        });

        this.barman.sprite.on("pointerout", () => {
            this.scene.input.manager.canvas.style.cursor = "default";
        });
    }

    private setupCamera() {
        const MAP_WIDTH = this.scene.data.get("bgWidth"); // 明确使用地图常量
        const MAP_HEIGHT = this.scene.data.get("bgHeight");

        const mainCamera = this.scene.cameras.main
            .setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)
            .startFollow(this.player.sprite, true, 0.09, 0.09)
            .setZoom(1) // 明确禁用缩放
            .setBackgroundColor("#000000");
        // 动态调整视口
        const updateViewport = () => {
            mainCamera.setViewport(
                0,
                0,
                Math.min(window.innerWidth, MAP_WIDTH), // 视口不超过地图尺寸
                Math.min(window.innerHeight, MAP_HEIGHT)
            );
        };

        window.addEventListener("resize", updateViewport);
        updateViewport();
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

    // 添加更新余额的方法
    public async updateSuiBalance() {
        if (!this.tokenAmount) return;

        const userData = this.scene.registry.get("userData");
        const address = userData.walletAddress;
        const newBalance = await getSuiBalance(address);

        // 更新显示（移除"SUI:"前缀）
        this.tokenAmount.setText(`${Number(newBalance).toFixed(2)}`);

        // 更新registry中的数据
        userData.suiBalance = Number(newBalance).toFixed(2);
        this.scene.registry.set("userData", userData);
    }

    public isContained(x: number, y: number) {
        return this.UI.some((ui) => ui.getBounds().contains(x, y));
    }
}
