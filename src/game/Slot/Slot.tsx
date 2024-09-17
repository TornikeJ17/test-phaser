import React, { useEffect } from "react";
import { SlotProps } from "../Interface/SloInterface";

const Slot: React.FC<SlotProps> = ({ scene, x, y, textureKey, onCreated }) => {
    useEffect(() => {
        const slot = scene.add.image(x, y, textureKey);
        if (onCreated) {
            onCreated(slot);
        }

        return () => {
            slot.destroy();
        };
    }, [scene, x, y, textureKey, onCreated]);

    return null;
};

export default Slot;

