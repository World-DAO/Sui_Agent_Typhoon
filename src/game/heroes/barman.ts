import Phaser from 'phaser';

export default class Barman {
  public sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string) {
    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setImmovable(true); 
  }
}
