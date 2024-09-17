import Phaser from "phaser";

interface SlotProps {
    scene: Phaser.Scene;
    x: number;
    y: number;
    textureKey: string;
    onCreated?: (slot: Phaser.GameObjects.Image) => void;
}

export type { SlotProps };
