import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

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
        super('login');
    }

    preload() {
        // 如果有按钮图像，可以在这里加载
        this.load.image('loginButton', 'assets/buttons/loginButton.png');
    }

    create() {
        const width = Math.min(window.innerWidth, 1195);
        const height = Math.min(window.innerHeight, 550);

        // 添加标题
        this.add.text(width / 2, height * 0.4, '欢迎来到 Web3 酒馆', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 动态创建 ConnectButton 的容器
        this.connectButtonContainer = this.add.dom(width / 2, height * 0.6).createElement('div');

        // 创建按钮背景（使用图形）
        const buttonWidth = 200;
        const buttonHeight = 50;

        const button = this.add.rectangle(width / 2, height * 0.6, buttonWidth, buttonHeight, 0x00aaff)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => button.setFillStyle(0x0088cc))
            .on('pointerout', () => button.setFillStyle(0x00aaff))
            .on('pointerdown', () => this.handleLogin());

        // 添加按钮文本
        this.loginText = this.add.text(width / 2, height * 0.6, '登录', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 监听登录响应
        EventBus.on('phaser_loginResponse', (response: LoginResponse) => {
            if (response.success) {
                console.log('登录成功:', response.data);
                // 存储用户信息到游戏注册表中
                this.registry.set('userData', response.data);
                // 延迟一秒后跳转，让用户看到成功信息
                this.time.delayedCall(1000, () => {
                    this.scene.start('Preloader');
                });
            } else {
                console.error('登录失败:', response.error);
                // 显示错误信息
                this.add.text(width / 2, height * 0.7, `登录失败: ${response.error}`, {
                    fontSize: '16px',
                    color: '#ff0000'
                }).setOrigin(0.5);
            }
        });
    }

    handleLogin() {
        // 显示加载状态
        this.loginText.setText('登录中...',)

        // 触发登录请求
        EventBus.emit('phaser_loginRequest', {});

        // 添加加载动画
        this.tweens.add({
            targets: this.loginText,
            alpha: 0.5,
            duration: 500,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });
    }
}
