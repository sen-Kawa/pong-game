<script setup lang="ts">
import { socket } from '@/sockets/sockets';
import { ref } from 'vue';
import { type Player, type GameUpdate } from 'common-types'

interface Game {
	players: {
        0: Player,
        1: Player
    },
    matchid: number
}

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
        matchid: 0
    }
});

socket.on("game_update", (update: Game) => {
    console.log("Update: " + update);
    if (update)
        game_state.value.game = update;
})

function makeMove(newVec: number) {
    const update: GameUpdate = {
        player: game_state.value.game.players[props.player_number as 0 | 1],
        gameid: props.match.id
    };

    update.player.vector = newVec;
    console.log(update);
	socket.emit("move", update);
}

function moveUp() {
    makeMove(-3);
}

function moveDown() {
    makeMove(3);
}

function reset() {
    makeMove(0);
}

document.addEventListener('keydown', (event) => {
	if (event.key == 's') {
		moveDown();
	} else if(event.key == 'w') {
		moveUp();
	}
})
document.addEventListener('keyup', (event) => {
	if (event.key == 's' || event.key == 'w') {
		reset();
	}
})

const interval = setInterval(drawGame, 33);

function drawGame() {
	const c = document.getElementById("game-canvas") as HTMLCanvasElement;
	if (c === null) {
		console.log("cant get canvas");
        clearInterval(interval);
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
	state.players[0].pos += state.players[0].vector;
	state.players[1].pos += state.players[1].vector;
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, state.players[0].pos, 50, 100);
	ctx.fillRect(c.width - 50, state.players[1].pos, 50, 100);
}
</script>

<template>
	<canvas id="game-canvas" width="600" height="480" style="border: 1px solid grey;"></canvas>
</template>
