import { bootScene } from "./scenes/bootScene";
import { AUTO, Game } from "phaser";
import { preloadScene } from "./scenes/preloadScene";
import TavernScene from "./scenes/tavernScene";
import { loginScene } from "./scenes/loginScene";

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: Math.min(window.screen.width, 4800),
    height: Math.min(window.screen.height, 2700),
    parent: "game-container",

    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: Math.min(window.innerWidth, 4800),
        height: Math.min(window.innerHeight, 2700),
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
