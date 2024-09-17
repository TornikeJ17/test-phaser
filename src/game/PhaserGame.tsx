import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import Phaser from "phaser";
import Reel from "./Reels/Reel";
import "../App.css";
import { svgIcons } from "./svg";
import spin from "./sounds/spin.mp3";
import win from "./sounds/win.wav";

const REEL_WIDTH = 100;
const REEL_HEIGHT = 100;
let winMessage: Phaser.GameObjects.Text | null = null;
let spinSound: Phaser.Sound.BaseSound | null = null;
let winSound: Phaser.Sound.BaseSound | null = null;

const PhaserGame: React.FC = () => {
    const gameRef = useRef<HTMLDivElement>(null);
    const reactMountRef = useRef<HTMLDivElement>(null);
    const reelsRef = useRef<any[]>([]);
    const spinButtonRef = useRef<Phaser.GameObjects.Text | null>(null);

    const [isSpinning, setIsSpinning] = useState(false);

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
        svgIcons.forEach((icon) => {
            this.load.image(icon.name, icon.base64);
        });

        this.load.audio("spin", spin);
        this.load.audio("win", win);
    };

    const _createMask = function (
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        const shape = scene.make.graphics({ x, y });
        shape.fillRect(0, 0, width, height);
        const mask = shape.createGeometryMask();
        return mask;
    };

    const create = function (this: Phaser.Scene) {
        spinSound = this.sound.add("spin");
        winSound = this.sound.add("win");

        const reelMask = _createMask(
            this,
            50,
            50,
            REEL_WIDTH * 3,
            REEL_HEIGHT * 2.7
        );

        ReactDOM.render(
            <>
                <Reel
                    scene={this}
                    x={100}
                    y={100}
                    reelWidth={REEL_WIDTH}
                    reelHeight={REEL_HEIGHT}
                    mask={reelMask}
                    addReel={(reel) => reelsRef.current.push(reel)}
                />
                <Reel
                    scene={this}
                    x={200}
                    y={100}
                    reelWidth={REEL_WIDTH}
                    reelHeight={REEL_HEIGHT}
                    mask={reelMask}
                    addReel={(reel) => reelsRef.current.push(reel)}
                />
                <Reel
                    scene={this}
                    x={300}
                    y={100}
                    reelWidth={REEL_WIDTH}
                    reelHeight={REEL_HEIGHT}
                    mask={reelMask}
                    addReel={(reel) => reelsRef.current.push(reel)}
                />
            </>,
            reactMountRef.current
        );

        spinButtonRef.current = this.add
            .text(150, 350, "SPIN", { fontSize: "32px", color: "#FFF" })
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                if (!isSpinning) {
                    startSpin.call(this);
                }
            });

        const borderThickness = 1.5;
        const borderColor = 0xff0000;

        this.add
            .rectangle(
                100 + REEL_WIDTH,
                100 + REEL_HEIGHT,
                REEL_WIDTH * 3,
                REEL_HEIGHT
            )
            .setStrokeStyle(borderThickness, borderColor);
    };

    const startSpin = function (this: Phaser.Scene) {
        resetWinMessage.call(this);
        if (spinSound) {
            spinSound.play();
        }

        if (spinButtonRef.current) {
            spinButtonRef.current.disableInteractive();
        }

        setIsSpinning(true);
        spinReels.call(this);
    };

    const spinReels = function (this: Phaser.Scene) {
        const symbols = ["heart", "cherry", "orange", "seven", "diamond"];
        const stopDelays = [500, 1000, 1500];
        const spinSpeed = 300;
        const spinsPerReel = 4;
        const visibleSymbols = 3;
        let totalSpins = 0;

        reelsRef.current.forEach((reel, reelIndex) => {
            reel.forEach((slot: Phaser.GameObjects.Image) => {
                this.tweens.add({
                    targets: slot,
                    y: slot.y + REEL_HEIGHT * visibleSymbols,
                    duration: spinSpeed,
                    ease: "Linear",
                    repeat: spinsPerReel,
                    delay: stopDelays[reelIndex],
                    onUpdate: () => {
                        if (slot.y > REEL_HEIGHT * visibleSymbols) {
                            slot.setY(slot.y - REEL_HEIGHT * visibleSymbols);
                        }
                    },

                    onComplete: () => {
                        const finalSymbolIndex = Phaser.Math.Between(
                            0,
                            symbols.length - 1
                        );
                        slot.setTexture(symbols[finalSymbolIndex]);
                        totalSpins++;
                        if (
                            totalSpins ===
                            reelsRef.current.length * visibleSymbols
                        ) {
                            setIsSpinning(false);
                            if (spinButtonRef.current) {
                                spinButtonRef.current.setInteractive();
                            }
                            checkForWin.call(this);
                        }
                    },
                });
            });
        });
    };

    const checkForWin = function (this: Phaser.Scene) {
        const middleRow = reelsRef.current.map(
            (reel: Phaser.GameObjects.Image[]) => reel[1]
        );

        const firstSymbolTexture = middleRow[0].texture.key;
        const isWin = middleRow.every(
            (slot) => slot.texture.key === firstSymbolTexture
        );

        if (isWin) {
            if (winSound) {
                winSound.play();
            }

            winMessage = this.add.text(140, 180, "YOU WIN!", {
                fontSize: "32px",
                color: "green",
            });

            this.tweens.add({
                targets: winMessage,
                scale: { from: 0, to: 1 },
                alpha: { from: 0, to: 1 },
                duration: 1000,
                ease: "Bounce.easeOut",
                onComplete: () => {
                    this.tweens.add({
                        targets: winMessage,
                        scale: { from: 1, to: 1.2 },
                        yoyo: true,
                        repeat: -1,
                        duration: 500,
                        ease: "Sine.easeInOut",
                    });
                },
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

    return (
        <div className="slot-game">
            <div className="slot-machine-frame">
                <div ref={gameRef}></div>
                <div ref={reactMountRef}></div>{" "}
            </div>
        </div>
    );
};

export default PhaserGame;

