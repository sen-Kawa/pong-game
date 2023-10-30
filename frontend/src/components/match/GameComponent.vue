<template>
    <h2 class="component-subtitle">No. {{ match.id }}: {{matchStore.currentLeftPlayer}} ./. {{matchStore.currentRightPlayer}}</h2>
    <br>
	<div class="game">
		<div class="map-menu">
			<label for="mapSelect">Select Map: </label>
			<select id="mapSelect" v-model="selectedMap">
				<option v-for="image in mapPaths" :value="image.path" :key="image.path">{{image.name}}</option>
			</select>
		</div>
		<div class="canvas-container" :style="{ backgroundImage: `url(${selectedMap})`}">
			<canvas id="game-canvas" :width="fieldWidth" :height="fieldHeight" style="background-color: transparent; border: 1px solid grey;"></canvas>
		</div>
	</div>
    <h1 style="color: red;" v-if="game_state.game.paused">Game is paused</h1>
    <h3 class="details">{{ playerInfo }}</h3>
</template>


<script setup lang="ts">
    import { socket } from '@/sockets/sockets';
    import { ref, onUnmounted, onMounted } from 'vue';
    import { type GameUpdate } from 'common-types';
    // import { paddleHeight, paddleWidth, ballRadius, fieldHeight, fieldWidth } from 'common-types'
    import { useMatchStore } from '../../stores/match.js';

    const paddleWidth = 15
    const paddleHeight = 70
    const ballRadius = 8
    const fieldWidth = 600
    const fieldHeight = 450

	const mapPaths = [
		{ name: 'default', path: '/black.jpg' },
		{ name: 'space', path: '/space.jpg' },
		{ name: 'desert', path: '/desert.jpg' },
		{ name: 'forest', path: '/forest.jpg' },
		{ name: 'underwater', path: '/underwater.jpg' },
		{ name: 'trippy', path: '/trippy.jpg' },
	];
	const selectedMap = ref(mapPaths[0].path);
    let keyUp: string = 'w'
    let keyDown: string = 's'
    const playerInfo = ref('Control your player with [w] for up and [s] for down.')
    const elementColor:string = 'white'

    const matchStore = useMatchStore()

    let interval: any
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
            ball: {
                    xPos: 100,
                    yPos: 100,
                    xVec: 1.5,
                    yVec: -1.5
            },
            score: [0, 0],
            paused: false,
        }
    });

    // const beep = () => {
    //     var snd = new Audio("data:audio/wav;base64, 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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
    //     snd.play();
    // }

    // const setKeysRightSide = () => {
    //     keyUp = 'p'
    //     keyDown = 'l'
    // }

    socket.on("game_update", (update: GameUpdate) => {
        game_state.value.game = update;
    })

    socket.on("start_game", () => {
        interval = setInterval(drawGame, 1000/ 50)
    })

     // when player joins the game the player name is updated
    socket.on("player_one_name", (playerOneName: string) => {
        matchStore.currentRightPlayer = playerOneName
    })

    onUnmounted(() => {
        clearInterval(interval);
        document.removeEventListener("keydown", (event) => {
            keyUpHandler(event)
        });
        document.removeEventListener("keyup", (event) => {
            keyUpHandler(event)
        });
    })

    function moveUp() { socket.emit("move_up", [props.match.id]) }

    function moveDown() { socket.emit("move_down", [props.match.id]) }

    function stop() { socket.emit("stop", [props.match.id]) }

    function keyDownHandler(event: any) {
        if (event.key == keyDown) {
            moveDown();
        } else if(event.key == keyUp) {
            moveUp();
        }
    }

    function keyUpHandler(event: any) {
        if (event.key == keyDown || event.key == keyUp) {
            stop();
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

    socket.on("connect", () => {
        if (props.match) {
            socket.emit("player_connected", [props.match.id])
        }
    })

    const gameInit = () => {
        // change the key and info if player is on the right side (maybe put it to a setup function later)
        game_state.value.game.players[0].pos = 450 / 2
        game_state.value.game.players[1].pos = 450 / 2
        socket.emit("player_connected", [props.match.id])
    }

    function drawGame() {
        const c = document.getElementById("game-canvas") as HTMLCanvasElement;
        if (c === null) {
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
            clearInterval(interval);
            return;
        }
        ctx.clearRect(0, 0, c.width, c.height)
        const state = game_state.value.game;
        drawNet(ctx)
        drawScore(state.score[0], state.score[1], ctx)
        drawPaddle(0, state.players[0].pos - paddleHeight/2, ctx)
        drawPaddle(c.width - 1 - paddleWidth,state.players[1].pos - paddleHeight/2, ctx)
        drawBall(state.ball.xPos, state.ball.yPos, ctx)
    }

    onMounted(() => {
        gameInit()
        const c = document.getElementById("game-canvas") as HTMLCanvasElement;
        if (c === null) {
            clearInterval(interval);
            return;
        }
        const ctx = c.getContext("2d");
        if (ctx === null) {
            clearInterval(interval);
            return;
        }
        ctx.clearRect(0, 0, c.width, c.height)
    });
</script>

<style scoped>

.canvas-container {
	background-size: cover;
	width: 600px;
	height: 450px;
	display: block;
	margin: auto;
}

.map-menu {
	font-size: 25px;
	position: absolute;
	margin-left: 50px;
	color: grey;
	border: 2px dashed grey;
	border-radius: 20px;
	padding: 20px;
}

#mapSelect {
	font-size: 25px;
	padding: 5px;
}
</style>

