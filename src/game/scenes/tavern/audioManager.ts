import Phaser from 'phaser';

export class AudioManager {
  private scene: Phaser.Scene;
  private music?: Phaser.Sound.BaseSound;
  private isPlaying = false;
  private piano?: Phaser.GameObjects.Image;
  private musicText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public initialize() {
    this.music = this.scene.sound.add('theme');
    this.scene.sound.pauseOnBlur = true;

    // Get the background width from the scene's data
    const bgWidth = this.scene.data.get('bgWidth');
    const pianoX = bgWidth - 80;

    // Create a larger interactive zone covering the whole piano
    const pianoZone = this.scene.add.zone(pianoX, 300, 200, 300)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);

    // Add the music control text
    this.musicText = this.scene.add.text(pianoX, 300, 'Music On', {
      fontSize: '24px', // Made slightly larger since it's the only indicator now
      color: '#FF69B4',
      stroke: '#000000',
      strokeThickness: 2,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 2,
        stroke: true,
        fill: true
      }
    })
      .setOrigin(0.5)
      .setAlpha(0.9);

    // Add hover effects
    pianoZone.on('pointerover', () => {
      if (this.musicText) {
        this.scene.tweens.add({
          targets: this.musicText,
          scale: 1.2,
          duration: 300,
          ease: 'Power2'
        });
      }
    });

    pianoZone.on('pointerout', () => {
      if (this.musicText) {
        this.scene.tweens.add({
          targets: this.musicText,
          scale: 1,
          duration: 300,
          ease: 'Power2'
        });
      }
    });

    pianoZone.on('pointerdown', () => this.toggleMusic());

    // Start playing the music with configuration
    this.music.play({
      loop: true,
      volume: 0.5
    });
    this.isPlaying = true;
    this.updateMusicIndicator();
  }

  private toggleMusic() {
    if (this.isPlaying) {
      this.music?.pause();
      this.isPlaying = false;
    } else {
      this.music?.resume();
      this.isPlaying = true;
    }
    this.updateMusicIndicator();
  }

  private updateMusicIndicator() {
    if (this.musicText) {
      this.musicText.setText(`Music ${this.isPlaying ? 'On' : 'Off'}`);
      this.musicText.setColor(this.isPlaying ? '#FF69B4' : '#808080');
      this.musicText.setAlpha(this.isPlaying ? 0.9 : 0.8);
    }
  }
} 