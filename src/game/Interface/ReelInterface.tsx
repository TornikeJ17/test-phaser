import Phaser from "phaser";

interface ReelProps {
    scene: Phaser.Scene;
    x: number;
    y: number;
    reelWidth: number;
    reelHeight: number;
    addReel: (slots: Phaser.GameObjects.Image[]) => void;
    mask: Phaser.Display.Masks.GeometryMask;
}

export type { ReelProps };
