<template>
	<canvas id="game-canvas" width="600" height="450" style="background-color: black; border: 1px solid grey;"></canvas>
    <h3>{{ playerInfo }}</h3>
</template>


<script setup lang="ts">
    import { socket } from '@/sockets/sockets';
    import { ref } from 'vue';
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

    const props = defineProps(['match', 'player_number']);
    const game_state = ref({
        game: {
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
            ballPos: {
                    xPos: 350,
                    yPos: 300
            }
        }
    });

    const setKeysRightSide = () => {
        keyUp = 'p'
        keyDown = 'l'
    }

    socket.on("game_update", (update: GameUpdate) => {
        const player_number = props.player_number == 0 ? 1 : 0;
        if (update && props.match.id == update.gameid)
            game_state.value.game.players[player_number] = update.player;
    })


    socket.on("game_update2", (update2) => {
        // const player_number = props.player_number == 0 ? 1 : 0;
        // const player_number = props.player_number == 0 ? 1 : 0;
        // const player_number = props.player_number == 0 ? 1 : 0;
        // console.log("Update:", update2)

        if (update2[0].playerId !== props.player_number) {
            const player_number = update2[0].playerId == 0 ? 0 : 1
            console.log("Update:", update2)
            // let a: string = string(update2[0].playerId)
            game_state.value.game.players[player_number].pos = update2[0].paddlePos


        }
            
        // if (update && props.match.id == update.gameid) {
        //     game_state.value.game.players[player_number] = update.player;
        //     console.log("Update:", update)
        // }      
    })


    function makeMove(newVec: number) {
        const update: GameUpdate = {
            player: game_state.value.game.players[props.player_number as 0 | 1],
            gameid: props.match.id
        };
        const update2 = {
            gameId: props.match.id,
            playerId: props.player_number,
            paddlePos: game_state.value.game.players[props.player_number as 0 | 1].pos
        }

        update.player.vector = newVec;
        update.player.pos += newVec;
        socket.emit("move", update);
        socket.emit("move2", update2)

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
        let ballRadius = 8
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

    const drawScore = (player1Score: number, player2Score: number, ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = elementColor
        ctx.font = '65px arial'
        ctx.fillText("0", 250, 70)
        ctx.fillText("1", 320, 70)
    }

    const drawPaddle = (x: number,y: number, ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "white"
        ctx.fillRect(x, y, paddleWidth, paddleHeight)
    }

    function drawGame() {
        const c = document.getElementById("game-canvas") as HTMLCanvasElement;
        if (c === null) {
            console.log("cant get canvas");
            clearInterval(interval);
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
        drawScore(0, 1, ctx)
        drawPaddle(0, state.players[0].pos - paddleHeight/2, ctx)
        drawPaddle(c.width - 1 - paddleWidth,state.players[1].pos - paddleHeight/2, ctx)
        drawBall(state.ballPos.xPos, state.ballPos.yPos, ctx)
    }

    const gameInit = () => {
        console.log(" Player number ==> ", props.player_number)
        console.log("Props: ", props)
        console.log("matchid: ", props.match.id)
        console.log("match (all): ", props.match)
        // change the key and info if player is on the right side (maybe put it to a setup function later)
        if (props.player_number === 1) {
            playerInfo.value = 'Control your player with [p] for up and [l] for down.'
            setKeysRightSide()
        }
        game_state.value.game.players[0].pos = 450 / 2
        game_state.value.game.players[1].pos = 450 / 2
    }

    gameInit()
    const userStore = useAuthStore()
    const interval = setInterval(drawGame, 1000/ 50);
</script>


