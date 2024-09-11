import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import "../App.css";
import { svgIcons } from "./svg";
import spin from "./sounds/spin.mp3";
import win from "./sounds/win.wav";

const REEL_WIDTH = 100;
const REEL_HEIGHT = 100;

const PhaserGame: React.FC = () => {
    const gameRef = useRef<HTMLDivElement>(null);
    let winMessage: Phaser.GameObjects.Text | null = null;
    let spinSound: Phaser.Sound.BaseSound | null = null;
    let winSound: Phaser.Sound.BaseSound | null = null;

    useEffect(() => {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 400,
            height: 400,
            parent: gameRef.current,
            physics: {
                default: "arcade",
            },
            scene: {
                preload,
                create,
                update,
            },
        };
        const game = new Phaser.Game(config);
        return () => {
            game.destroy(true);
        };
    }, []);

    const preload = function (this: Phaser.Scene) {
        this.load.image("symbol1", svgIcons[0].base64);
        this.load.image("symbol2", svgIcons[1].base64);
        this.load.image("symbol3", svgIcons[2].base64);
        this.load.image("symbol4", svgIcons[3].base64);
        this.load.image("symbol5", svgIcons[4].base64);

        this.load.audio("spin", spin);
        this.load.audio("win", win);
    };

    const create = function (this: Phaser.Scene) {
        const reels: Phaser.GameObjects.Image[][] = [];

        spinSound = this.sound.add("spin");
        // 3x3 grid for symbols
        for (let i = 0; i < 3; i++) {
            reels[i] = [];
            for (let j = 0; j < 3; j++) {
                const randomSymbol = Phaser.Math.Between(1, 3);
                reels[i][j] = this.add.image(
                    100 + i * REEL_WIDTH,
                    100 + j * REEL_HEIGHT,
                    `symbol${randomSymbol}`
                );
            }
        }
        //Spin Button

        this.add
            .text(150, 350, "SPIN", { fontSize: "32px", color: "#FFF" })
            .setInteractive()
            .on("pointerdown", () => {
                resetWinMessage.call(this);
                if (spinSound) {
                    spinSound.play();
                }
                spinReels.call(this, reels);
            });
        const borderThickness = 1;
        const borderColor = 0xff0000;

        this.add
            .rectangle(
                100 + REEL_WIDTH,
                100 + REEL_HEIGHT,
                REEL_WIDTH * 3,
                REEL_HEIGHT,
                0xffffff,
                0
            )
            .setStrokeStyle(borderThickness, borderColor);
    };

    const spinReels = function (
        this: Phaser.Scene,
        reels: Phaser.GameObjects.Image[][]
    ) {
        const spinDistance = REEL_HEIGHT * 2;
        const spinSpeed = 200;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.tweens.add({
                    targets: reels[i][j],
                    y: `+=${spinDistance}`,
                    duration: spinSpeed,
                    ease: "Linear",
                    repeat: 4,
                    onComplete: () => {
                        const randomSymbol = Phaser.Math.Between(1, 5);
                        reels[i][j].setTexture(`symbol${randomSymbol}`);
                        reels[i][j].setY(reels[i][j].y - spinDistance);

                        //check middle row for win
                        if (i === 2 && j === 2) {
                            checkForWin.call(this, reels);
                        }
                    },
                });
            }
        }
    };

    const checkForWin = function (
        this: Phaser.Scene,
        reels: Phaser.GameObjects.Image[][]
    ) {
        winSound = this.sound.add("win");

        const middleRowSymbols = [
            reels[0][1].texture.key,
            reels[1][1].texture.key,
            reels[2][1].texture.key,
        ];

        if (
            middleRowSymbols[0] === middleRowSymbols[1] &&
            middleRowSymbols[1] === middleRowSymbols[2]
        ) {
            if (winSound) {
                winSound.play();
            }
            winMessage = this.add.text(150, 200, "You Won!", {
                fontSize: "32px",
                color: "#0f0",
            });
        }
    };

    const resetWinMessage = function (this: Phaser.Scene) {
        if (winMessage) {
            winMessage.destroy();
            winMessage = null;
        }
    };
    const update = function (this: Phaser.Scene) {};
    return <div ref={gameRef} id="phaser-game" />;
};

export default PhaserGame;

