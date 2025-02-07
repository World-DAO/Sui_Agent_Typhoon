import Phaser from 'phaser';

export default class Player {
  public sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private lastDirection: 'left' | 'right' | 'up' | 'down' = 'down';
  public speed = 200;

  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string) {
    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setOrigin(0.5, 0.5);
    
    // 设置物理边界
    const worldBounds = {
        width: scene.data.get('bgWidth'),
        height: scene.data.get('bgHeight')
    };
    
    // 设置世界边界
    scene.physics.world.setBounds(0, 0, worldBounds.width, worldBounds.height);
    // 启用边界碰撞
    this.sprite.setCollideWorldBounds(true);

    scene.anims.create({
      key: 'walk_right',
      frames: scene.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
      frameRate: 8,
      repeat: -1
    });
    scene.anims.create({
      key: 'turn',
      frames: scene.anims.generateFrameNumbers('player', { start: 4 }),
      frameRate: 20,
    });
    scene.anims.create({
      key: 'walk_left',
      frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
  }

  public handleMovement(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    const speed = this.speed;
    this.sprite.setVelocity(0);
    if (!cursors.left?.isDown && !cursors.right?.isDown &&
        !cursors.up?.isDown && !cursors.down?.isDown) {
        this.sprite.setVelocity(0);
        switch (this.lastDirection) {
          case 'left':
            this.sprite.setFrame(0);
            break;
          case 'right':
            this.sprite.setFrame(5);
            break;
          case 'up':
            this.sprite.setFrame(0);
            break;
          case 'down':
            this.sprite.setFrame(5);
            break;
        }
    }
    if (cursors.left?.isDown) {
      this.sprite.setVelocityX(-speed);
      this.sprite.play('walk_left', true);
      this.lastDirection = 'left';
    } else if (cursors.right?.isDown) {
      this.sprite.setVelocityX(speed);
      this.sprite.play('walk_right', true);
      this.lastDirection = 'right';
    }

    if (cursors.up?.isDown) {
      this.sprite.setVelocityY(-speed);
      this.sprite.play('turn', true);
    } else if (cursors.down?.isDown) {
      this.sprite.setVelocityY(speed);
      this.sprite.play('turn', true);
    }
  }

  public playDirection(dir: string) {
    switch(dir) {
      case 'left':
        this.sprite.play('walk_left', true);
        this.lastDirection = 'left';
        break;
      case 'right':
        this.sprite.play('walk_right', true);
        this.lastDirection = 'right';
        break;
      case 'up':
        this.sprite.play('walk_left', true);
        this.lastDirection = 'up';
        break;
      case 'down':
        this.sprite.play('walk_right', true);
        this.lastDirection = 'down';
        break;
      default:
        //this.stopAnimation();
        break;
    }
  }
  
  public stopAnimation() {
    this.sprite.anims.stop();
    switch (this.lastDirection) {
      case 'left':
        this.sprite.setFrame(0);
        break;
      case 'right':
        this.sprite.setFrame(5);
        break;
      case 'up':
        this.sprite.setFrame(0);
        break;
      case 'down':
        this.sprite.setFrame(5);
        break;
    }
  }
}
