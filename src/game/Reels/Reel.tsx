import React from "react";
import Slot from "../Slot/Slot";
import { ReelProps } from "../Interface/ReelInterface";

const Reel: React.FC<ReelProps> = ({
    scene,
    x,
    y,
    reelHeight,
    addReel,
    mask,
}) => {
    const symbols = ["heart", "cherry", "orange", "seven", "diamond"];

    const slots: Phaser.GameObjects.Image[] = [];

    return (
        <>
            <Slot
                scene={scene}
                x={x}
                y={y}
                textureKey={symbols[Phaser.Math.Between(0, symbols.length - 1)]}
                onCreated={(slot) => {
                    slots.push(slot);
                    slot.setMask(mask);
                }}
            />
            <Slot
                scene={scene}
                x={x}
                y={y + reelHeight}
                textureKey={symbols[Phaser.Math.Between(0, symbols.length - 1)]}
                onCreated={(slot) => {
                    slots.push(slot);
                    slot.setMask(mask);
                }}
            />
            <Slot
                scene={scene}
                x={x}
                y={y + reelHeight * 2}
                textureKey={symbols[Phaser.Math.Between(0, symbols.length - 1)]}
                onCreated={(slot) => {
                    slots.push(slot);
                    slot.setMask(mask);
                }}
            />

            {React.useEffect(() => {
                addReel(slots);
            }, [])}
        </>
    );
};

export default Reel;

