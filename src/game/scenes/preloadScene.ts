import { Scene } from 'phaser';

export class preloadScene extends Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private percentText!: Phaser.GameObjects.Text;
  private loadingText!: Phaser.GameObjects.Text;
  private assetText!: Phaser.GameObjects.Text;

  constructor() {
    super('Preloader');
  }

  init() {
    const width = Math.min(window.innerWidth, 1195);
    const height = Math.min(window.innerHeight, 550);

    // 添加加载文本
    this.loadingText = this.add.text(width/2, height * 0.5, '加载中...', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加资源文本
    this.assetText = this.add.text(width/2, height * 0.55, '', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 进度条容器
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRoundedRect(width/2 - 160, height * 0.6, 320, 50, 10);

    // 进度条
    this.progressBar = this.add.graphics();

    // 百分比文本
    this.percentText = this.add.text(width/2, height * 0.6 + 25, '0%', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加加载事件监听
    this.load.on('progress', (value: number) => {
      const percentage = Math.floor(value * 100) + '%';
      this.percentText.setText(percentage);
      this.progressBar.clear();
      this.progressBar.fillStyle(0x00ff00, 1);
      this.progressBar.fillRoundedRect(
        width/2 - 150, 
        height * 0.6 + 10, 
        300 * value, 
        30,
        5
      );

      // 添加闪光效果
      if (value === 1) {
        this.tweens.add({
          targets: this.progressBar,
          alpha: 0.8,
          yoyo: true,
          repeat: 1,
          duration: 200,
          ease: 'Sine.easeInOut'
        });
      }
    });

    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      this.assetText.setText('正在加载sress: ' + file.key);
    });

    this.load.on('complete', () => {
      // 添加完成动画
      this.tweens.add({
        targets: [this.progressBar, this.progressBox, this.percentText, this.loadingText, this.assetText],
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          this.progressBar.destroy();
          this.progressBox.destroy();
          this.percentText.destroy();
          this.loadingText.destroy();
          this.assetText.destroy();
          this.scene.start('tavernScene');
        }
      });
    });
  }

  preload() {
    // 添加加载动画
    // const width = Math.min(window.innerWidth, 550);
    // const height = Math.min(window.innerHeight, 1195);
    const width = Math.min(window.innerWidth, 1195);
    const height = Math.min(window.innerHeight, 550);
    
    const loadingSpinner = this.add.circle(width/2, height * 0.4, 20, 0x00ff00);
    this.tweens.add({
      targets: loadingSpinner,
      angle: 360,
      duration: 1000,
      repeat: -1,
      ease: 'Linear'
    });

    // 资源加载
    // this.load.image('tavern_bg', 'img/newbar.png');
    this.load.image('tavern_bg', 'img/backgroundHorizontal.jpg');
    this.load.image('logo', 'img/bit.png');
    this.load.image('star', 'img/bit.png');
    this.load.image('back', 'img/back.png');
    this.load.image('driftbottle', 'img/driftbottle.png');
    this.load.image('driftbottle_bg', 'img/driftbottle_bg.png');
    this.load.spritesheet('player', 'animation/move.avif', {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet('barman', 'animation/move.avif', {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.audio('theme', [
      'audio/oedipus_wizball_highscore.ogg',
      'audio/oedipus_wizball_highscore.mp3'
    ]);
    this.load.image('wizball', 'img/wizball.png');

    this.registry.set('gridSize', 50);
    // debugger;
    const gridArray = new Array(11)
      .fill(null)
      .map(() => new Array(24).fill(0));

    this.registry.set('grid', gridArray);
  }
}
