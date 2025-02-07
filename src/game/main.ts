import { bootScene } from './scenes/bootScene';
import { AUTO, Game } from 'phaser';
import { preloadScene } from './scenes/preloadScene';
import TavernScene from './scenes/tavernScene';
import { loginScene } from './scenes/loginScene';
import DriftBottleScene from './scenes/DriftBottleScene';
import BottleDetailScene from './scenes/BottleDetailScene';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: Math.min(window.innerWidth, 1195),
    height: Math.min(window.innerHeight, 550),
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: Math.min(window.innerWidth, 1195),
        height: Math.min(window.innerHeight, 550),
        min: {
            width: 600,
            height: 300
        },
        max: {
            width: 1195,
            height: 550
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scene: [
        bootScene,
        loginScene,
        preloadScene,
        TavernScene,
        DriftBottleScene,
        BottleDetailScene,
    ]
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
