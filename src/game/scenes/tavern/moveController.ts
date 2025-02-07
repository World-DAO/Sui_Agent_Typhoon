// scenes/tavern/MovementController.ts
import Phaser from 'phaser';
import Player from '../../heroes/player';

export class movementController {
  private scene: Phaser.Scene;
  private player: Player;
  private grid: number[][];
  private gridSize: number;

  private directionsQueue: string[] = [];
  private isMoving = false;

  // 记录当前要走的目标点（像素坐标）
  private currentTarget?: { x: number; y: number };
  // 移动速度
  private moveSpeed = 150;

  // 记录当前移动的方向（"left" / "right" / "up" / "down"）
  private currentDir?: string;

  constructor(scene: Phaser.Scene, player: Player, grid: number[][], gridSize: number) {
    this.scene = scene;
    this.player = player;
    this.grid = grid;
    this.gridSize = gridSize;

    // 给玩家启用 Arcade Physics
    this.scene.physics.add.existing(this.player.sprite);
    // 让角色可以和世界或其他物体碰撞
    // (this.player.sprite.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
  }

  public startPath(directions: string[]) {
    this.directionsQueue = directions;
    this.isMoving = true;
    // 立即开始下一步
    this.moveNextStep();
  }

  public stopMoving() {
    if (!this.isMoving) return;

    this.directionsQueue = [];
    this.isMoving = false;
    this.currentTarget = undefined;
    this.currentDir = undefined;
    this.player.stopAnimation();

    // 停止物理移动
    const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }

  public isAutoMoving() {
    return this.isMoving;
  }

  /**
   * 在 TavernScene.update() 里，每帧调用，用于检测是否到达 currentTarget。
   */
  public update(delta: number) {
    if (!this.isMoving || !this.currentTarget || !this.currentDir) return;

    const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;
    const distX = this.currentTarget.x - this.player.sprite.x;
    const distY = this.currentTarget.y - this.player.sprite.y;

    switch (this.currentDir) {
      case 'left':
        // 如果 x 坐标小于等于目标(考虑一点误差) 就算到达
        if (this.player.sprite.x <= this.currentTarget.x + 1) {
          body.setVelocity(0, 0);
          this.player.sprite.x = this.currentTarget.x; 
          this.reachOneStep();
        }
        break;
      case 'right':
        if (this.player.sprite.x >= this.currentTarget.x - 1) {
          body.setVelocity(0, 0);
          this.player.sprite.x = this.currentTarget.x;
          this.reachOneStep();
        }
        break;
      case 'up':
        if (this.player.sprite.y <= this.currentTarget.y + 1) {
          body.setVelocity(0, 0);
          this.player.sprite.y = this.currentTarget.y;
          this.reachOneStep();
        }
        break;
      case 'down':
        if (this.player.sprite.y >= this.currentTarget.y - 1) {
          body.setVelocity(0, 0);
          this.player.sprite.y = this.currentTarget.y;
          this.reachOneStep();
        }
        break;
    }
  }

  /**
   * 每走完一格，调用moveNextStep()继续
   */
  private reachOneStep() {
    this.currentTarget = undefined;
    this.currentDir = undefined;
    this.player.stopAnimation();
    this.moveNextStep();
  }

  /**
   * 从队列中取一个方向，根据方向只设置水平或垂直速度
   */
  private moveNextStep() {
    if (this.directionsQueue.length === 0) {
      // 路径走完了
      this.isMoving = false;
      return;
    }

    const dir = this.directionsQueue.shift()!;
    this.currentDir = dir;
    this.player.playDirection(dir);

    // 计算当前的格子
    const px = Math.floor(this.player.sprite.x / this.gridSize);
    const py = Math.floor(this.player.sprite.y / this.gridSize);

    let nx = px, ny = py;
    switch (dir) {
      case 'left':  nx--; break;
      case 'right': nx++; break;
      case 'up':    ny--; break;
      case 'down':  ny++; break;
    }

    // 计算这一格的像素坐标
    const targetX = nx * this.gridSize + this.gridSize / 2;
    const targetY = ny * this.gridSize + this.gridSize / 2;
    this.currentTarget = { x: targetX, y: targetY };

    // 设置速度(只在水平或垂直方向)
    const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;
    switch (dir) {
      case 'left':
        body.setVelocity(-this.moveSpeed, 0);
        break;
      case 'right':
        body.setVelocity(this.moveSpeed, 0);
        break;
      case 'up':
        body.setVelocity(0, -this.moveSpeed);
        break;
      case 'down':
        body.setVelocity(0, this.moveSpeed);
        break;
    }
  }

}
