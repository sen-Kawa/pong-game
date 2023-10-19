<template>
	<canvas id="game-canvas" width="600" height="450" style="background-color: black; border: 1px solid grey;"></canvas>
    <h3>{{ playerInfo }}</h3>
</template>


<script setup lang="ts">
    import { socket } from '@/sockets/sockets';
    import { ref, onUnmounted } from 'vue';
    import {type GameUpdate } from 'common-types'
    import { useAuthStore } from '@/stores/auth';

    let keyUp: string = 'w'
    let keyDown: string = 's'
    const playerInfo = ref('Control your player with [w] for up and [s] for down.')
    const elementColor:string = 'white'
    const paddleWidth = 15
    const paddleHeight = 70
    let fieldWidth = 0
    let fieldHeight = 0
    const ballRadius = 8

    const props = defineProps(['match', 'player_number']);
    const pre_bounce = ref(0)
    const game_state = ref({
        game: {
            started: false,
            players: {
                0: {
                    pos: 0,
                    vector: 0
                },
                1: {
                    pos: 0,
                    vector: 0
                }
            },
            ball: {
                    xPos: 100,
                    yPos: 100,
                    xVec: 1.5,
                    yVec: -1.5
            },
            score: [0, 0]
        }
    });

    const beep = () => {
        var snd = new Audio("data:audio/wav;base64, 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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
        snd.play();
    }

    const setKeysRightSide = () => {
        keyUp = 'p'
        keyDown = 'l'
    }

    socket.on("game_update", (update: GameUpdate) => {
        const player_number = props.player_number === 0 ? 1 : 0;
        if (update && props.match.id === update.gameid) {
            game_state.value.game.players[player_number] = update.player;
            switch (props.player_number) {
                case 0:
                    if (update.ball.xVec > 0 && update.ball.xPos != pre_bounce.value) {
                        game_state.value.game.ball = update.ball;
                        pre_bounce.value = 0;
                        game_state.value.game.score = update.scores;
                    }
                    break;

                case 1:
                    if (update.ball.xVec < 0  && update.ball.xPos != pre_bounce.value) {
                        game_state.value.game.ball = update.ball;
                        pre_bounce.value = 0;
                        game_state.value.game.score = update.scores;
                    }
                    break;
            }
        }
    })

    socket.on("start_game", (game: GameUpdate) => {
        console.log("Game started")
        game_state.value.game.started = true;
        const player_number = props.player_number == 1 ? 1 : 0;
        game_state.value.game.players[player_number] = game.player;
        if (player_number == 1) {
            game_state.value.game.ball = game.ball;
        }
        interval = setInterval(drawGame, 1000/ 50)
    })

    // socket.on("game_update2", (update2) => {
    //     // const player_number = props.player_number == 0 ? 1 : 0;
    //     // const player_number = props.player_number == 0 ? 1 : 0;
    //     // const player_number = props.player_number == 0 ? 1 : 0;
    //     // console.log("Update:", update2)

    //     if (update2[0].playerId !== props.player_number) {
    //         const player_number = update2[0].playerId == 0 ? 0 : 1
    //         console.log("Update:", update2)
    //         // let a: string = string(update2[0].playerId)
    //         game_state.value.game.players[player_number].pos = update2[0].paddlePos


    //     }
            
    //     // if (update && props.match.id == update.gameid) {
    //     //     game_state.value.game.players[player_number] = update.player;
    //     //     console.log("Update:", update)
    //     // }      
    // })

    onUnmounted(() => {
        console.log("Unmounted")
        clearInterval(interval);
    })

    function makeMove(newVec: number) {
        const player = game_state.value.game.players[props.player_number as 0 | 1];
        player.vector = newVec;
        player.pos += newVec;
    }

    function moveUp() { makeMove(-3) }

    function moveDown() { makeMove(3) }

    function reset() { makeMove(0) }

    function keyDownHandler(event: any) {
        if (event.key == keyDown) {
            moveDown();
        } else if(event.key == keyUp) {
            moveUp();
        }
    }

    function keyUpHandler(event: any) {
        if (event.key == keyDown || event.key == keyUp) {
            reset();
        }
    }

    document.addEventListener('keydown', (event) => {
        keyDownHandler(event)
    })
    document.addEventListener('keyup', (event) => {
        keyUpHandler(event)
    })

    const drawBall = (x: number, y: number, ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = elementColor
        ctx.beginPath()
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2, false)
        ctx.closePath()
        ctx.fill()
    }

    const drawNet = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = elementColor
        for(let i: number = 0; i < 450; i += 10) {
            ctx.fillRect(300 - 2, i, 4, 5)
        }   
    }

    const drawScore = (player0Score: number, player1Score: number, ctx: CanvasRenderingContext2D) => {
        // adapt for numbers > 10 !!
        // player0Score = 0
        // player1Score = 5
        ctx.fillStyle = elementColor
        ctx.font = '65px arial'
        ctx.fillText(player0Score.toString(), 220, 70)
        ctx.fillText(player1Score.toString(), 350, 70)
    }

    const drawPaddle = (x: number,y: number, ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "white"
        ctx.fillRect(x, y, paddleWidth, paddleHeight)
    }

    const gameInit = () => {
        // console.log(" Player number ==> ", props.player_number)
        // console.log("Props: ", props)
        // console.log("matchid: ", props.match.id)
        // console.log("match (all): ", props.match)
        // change the key and info if player is on the right side (maybe put it to a setup function later)
        if (props.player_number === 1) {
            playerInfo.value = 'Control your player with [p] for up and [l] for down.'
            setKeysRightSide()
        }
        game_state.value.game.players[0].pos = 450 / 2
        game_state.value.game.players[1].pos = 450 / 2

        let uptdate: GameUpdate = {
            player: game_state.value.game.players[props.player_number as 0 | 1],
            ball: game_state.value.game.ball,
            gameid: props.match.id,
            scores: [0, 0]
        }
        socket.emit("player_connected", uptdate)
    }

    function drawGame() {
        const c = document.getElementById("game-canvas") as HTMLCanvasElement;
        if (c === null) {
            console.log("cant get canvas");
            document.removeEventListener("keydown", (event) => {
                keyUpHandler(event)
            });
            document.removeEventListener("keyup", (event) => {
                keyUpHandler(event)
            });
            return;
        }
        const ctx = c.getContext("2d");
        if (ctx === null) {
            console.log("Cant get canvas");
            clearInterval(interval);
            return;
        }
        if (props.match === undefined) {
            console.log("Not in a match");
            clearInterval(interval);
            return;
        }
        const state = game_state.value.game;
        
        // bounce paddle left player and check for point
        if ( state.ball.xPos <= 0 + paddleWidth && 
                state.ball.yPos <= state.players[0].pos + paddleHeight/2 &&
                state.ball.yPos >= state.players[0].pos - paddleHeight/2 ) {
                state.ball.xPos = 0 + paddleWidth + 1
                pre_bounce.value = state.ball.xVec

            if (state.ball.xVec < 0) {
                state.ball.xVec = state.ball.xVec * -1.4
                state.ball.yVec = state.ball.yVec * 1.4
            }
            beep()
        } else  if ( state.ball.xPos <= 0 && state.ball.xVec < 0 ) {
            state.ball.xVec = 1
            state.ball.yVec = -1
            // beep()
            state.score[1] += 1
            state.ball.xPos = ballRadius + paddleWidth + 1
            state.ball.yPos = state.players[0].pos
        }

        // bounce paddle right player and check for point
        if ( state.ball.xPos >= c.width - paddleWidth && 
                state.ball.yPos <= state.players[1].pos + paddleHeight/2 &&
                state.ball.yPos >= state.players[1].pos - paddleHeight/2 ) {
                state.ball.xPos = c.width - paddleWidth - 1
                pre_bounce.value = state.ball.xVec

            if (state.ball.xVec > 0) {
                state.ball.xVec = state.ball.xVec * -2
            }
            beep()
        } else if ( state.ball.xPos >= c.width && state.ball.xVec > 0 ) {
            state.ball.xVec = -1
            state.ball.yVec = -1
            // beep()
            state.score[0] += 1
            state.ball.xPos = c.width - ballRadius - paddleWidth - 1
            state.ball.yPos = state.players[1].pos
        }

        // bounce upper or lower wall

        if (state.ball.yPos - ballRadius <= 0) {
            state.ball.yVec = state.ball.yVec * -1
        }

        if (state.ball.yPos + ballRadius >= c.height) {
            state.ball.yVec = state.ball.yVec * -1
        }


        // update ball position
        if ((state.ball.xVec > 0 && props.player_number === 1) || (state.ball.xVec < 0 && props.player_number === 0)) {
            state.ball.xPos += state.ball.xVec
            state.ball.yPos += state.ball.yVec
        }

        state.players[0].pos += state.players[0].vector
        if (state.players[0].pos <= 0)
            state.players[0].pos = 0
        if (state.players[0].pos >= 449)
            state.players[0].pos = 449

        state.players[1].pos += state.players[1].vector
        if (state.players[1].pos <= 0)
            state.players[1].pos = 0
        if (state.players[1].pos >= 449)
            state.players[1].pos = 449
        ctx.clearRect(0, 0, c.width, c.height)
        drawNet(ctx)
        drawScore(state.score[0], state.score[1], ctx)
        drawPaddle(0, state.players[0].pos - paddleHeight/2, ctx)
        drawPaddle(c.width - 1 - paddleWidth,state.players[1].pos - paddleHeight/2, ctx)
        drawBall(state.ball.xPos, state.ball.yPos, ctx)

        const update: GameUpdate = {
            player: state.players[props.player_number as 0 | 1],
            ball: state.ball,
            gameid: props.match.id,
            scores: state.score as [number, number]
        };
        socket.emit("move", update);
    }

    

    gameInit()
    const userStore = useAuthStore()
    let interval: any;
</script>


