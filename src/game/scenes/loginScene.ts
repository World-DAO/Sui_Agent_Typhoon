import { Scene } from "phaser";
import { EventBus } from "../EventBus";

interface LoginResponse {
    success: boolean;
    data?: {
        userId: number;
        username: string;
        lastLoginTime: string;
    };
    error?: string;
}

export class loginScene extends Scene {
    private loginText: Phaser.GameObjects.Text;
    private connectButtonContainer: Phaser.GameObjects.DOMElement;

    constructor() {
        super("login");
    }

    preload() {
        // Load background image
        this.load.image("cover", "img/cover.png");
    }

    create() {
        const { width, height } = this.scale;

        // 1. 添加背景图并调整亮度
        const background = this.add
            .image(width / 2, height / 2, "cover")
            .setOrigin(0.5)
            .setDisplaySize(width, height)
            .setTint(0x666666); // 使用较暗的色调，可以调整这个值来控制亮度

        // 2. 添加黑色蒙版
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.05);
        overlay.fillRect(0, 0, width, height);

        // 3. 添加登录按钮

        // 添加按钮悬停效果

        // Get full screen size
        const fullWidth = window.innerWidth;
        const fullHeight = window.innerHeight;

        // Add title with elegant style
        const title = this.add
            .text(fullWidth / 2, fullHeight * 0.4, "Welcome to BEFORELIFE", {
                fontSize: "48px",
                color: "#ffffff",
                fontFamily: "Georgia, serif",
                stroke: "#000000",
                strokeThickness: 4,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: "#000000",
                    blur: 2,
                    stroke: true,
                    fill: true,
                },
            })
            .setOrigin(0.5);

        // Add title animation effect
        this.tweens.add({
            targets: title,
            scale: { from: 0.95, to: 1.05 },
            duration: 2000,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1,
        });

        // Dynamically create ConnectButton container
        this.connectButtonContainer = this.add
            .dom(fullWidth / 2, fullHeight * 0.6)
            .createElement("div");

        // Create elegant button background
        const buttonWidth = 240;
        const buttonHeight = 60;
        const button = this.add.graphics();

        // Button background - solid color with rounded corners
        button.lineStyle(2, 0xffffff, 1);
        button.fillStyle(0x4a90e2, 1);
        button.fillRoundedRect(
            fullWidth / 2 - buttonWidth / 2,
            fullHeight * 0.6 - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            15
        );
        button.strokeRoundedRect(
            fullWidth / 2 - buttonWidth / 2,
            fullHeight * 0.6 - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            15
        );

        button
            .setInteractive(
                new Phaser.Geom.Rectangle(
                    fullWidth / 2 - buttonWidth / 2,
                    fullHeight * 0.6 - buttonHeight / 2,
                    buttonWidth,
                    buttonHeight
                ),
                Phaser.Geom.Rectangle.Contains
            )
            .on("pointerover", () => {
                button.clear();
                button.lineStyle(2, 0xffffff, 1);
                button.fillStyle(0x357abd, 1);
                button.fillRoundedRect(
                    fullWidth / 2 - buttonWidth / 2,
                    fullHeight * 0.6 - buttonHeight / 2,
                    buttonWidth,
                    buttonHeight,
                    15
                );
                button.strokeRoundedRect(
                    fullWidth / 2 - buttonWidth / 2,
                    fullHeight * 0.6 - buttonHeight / 2,
                    buttonWidth,
                    buttonHeight,
                    15
                );
            })
            .on("pointerout", () => {
                button.clear();
                button.lineStyle(2, 0xffffff, 1);
                button.fillStyle(0x4a90e2, 1);
                button.fillRoundedRect(
                    fullWidth / 2 - buttonWidth / 2,
                    fullHeight * 0.6 - buttonHeight / 2,
                    buttonWidth,
                    buttonHeight,
                    15
                );
                button.strokeRoundedRect(
                    fullWidth / 2 - buttonWidth / 2,
                    fullHeight * 0.6 - buttonHeight / 2,
                    buttonWidth,
                    buttonHeight,
                    15
                );
            })
            .on("pointerdown", () => this.handleLogin());

        // Add button text with elegant style
        this.loginText = this.add
            .text(fullWidth / 2, fullHeight * 0.6, "Connect Wallet", {
                fontSize: "26px",
                color: "#ffffff",
                fontFamily: "Arial, sans-serif",
                fontStyle: "bold",
                shadow: {
                    offsetX: 1,
                    offsetY: 1,
                    color: "#000000",
                    blur: 2,
                    fill: true,
                },
            })
            .setOrigin(0.5);

        // Listen for login response
        EventBus.on("phaser_loginResponse", (response: LoginResponse) => {
            if (response.success) {
                console.log("success:", response.data);
                // Store user info in game registry
                this.registry.set("userData", response.data);
                // Delay 1 second before transition to let user see success message
                this.time.delayedCall(1000, () => {
                    this.scene.start("Preloader");
                });
            } else {
                console.error("failed:", response.error);
                // Display error message
                this.add
                    .text(
                        fullWidth / 2,
                        fullHeight * 0.7,
                        `failed: ${response.error}`,
                        {
                            fontSize: "16px",
                            color: "#ff0000",
                        }
                    )
                    .setOrigin(0.5);
            }
        });
    }

    handleLogin() {
        // Show loading status
        this.loginText.setText("logging...");

        // Trigger login request
        EventBus.emit("phaser_loginRequest", {});

        // Add loading animation
        this.tweens.add({
            targets: this.loginText,
            alpha: 0.5,
            duration: 500,
            ease: "Power2",
            yoyo: true,
            repeat: -1,
        });
    }
}
