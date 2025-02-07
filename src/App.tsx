import { useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame';
import { Mail } from "@/components/mail"

function App()
{
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {
        
    }

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            <Mail />
        </div>
    )
}

export default App
