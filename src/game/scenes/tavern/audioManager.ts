import Phaser from 'phaser';

export class AudioManager {
  private scene: Phaser.Scene;
  private music?: Phaser.Sound.BaseSound;
  private isPlaying = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public initialize() {
    //const wizball = this.scene.add.image(750, 50, 'wizball').setScale(1);
    // const wizball = this.scene.add.image(50, 750, 'wizball').setScale(1);
    this.music = this.scene.sound.add('theme');
    //wizball.setInteractive();
    //wizball.on('pointerdown', () => this.toggleMusic());
    this.scene.sound.pauseOnBlur = true;

  }

  private toggleMusic() {
    if (this.isPlaying) {
      this.music?.stop();
      this.isPlaying = false;
    } else {
      this.music?.play();
      this.isPlaying = true;
    }
  }
} 