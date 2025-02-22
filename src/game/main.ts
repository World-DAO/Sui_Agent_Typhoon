import { bootScene } from "./scenes/bootScene";
import { AUTO, Game } from "phaser";
import { preloadScene } from "./scenes/preloadScene";
import TavernScene from "./scenes/tavernScene";
import { loginScene } from "./scenes/loginScene";

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  parent: "game-container",
  
  // 核心配置修改
  scale: {
    mode: Phaser.Scale.RESIZE, // 动态调整渲染尺寸
    autoCenter: Phaser.Scale.NO_CENTER, // 禁用自动居中
    width: 1600,  // 游戏世界尺寸
    height: 900
  },

  physics: {
      default: "arcade",
      arcade: {
          //debug: true,
      },
  },
  scene: [
      bootScene,
      loginScene,
      preloadScene,
      TavernScene,
  ],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
