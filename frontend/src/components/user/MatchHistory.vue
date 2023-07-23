<script setup lang="ts">
import MatchItemVue from '@/components/match/MatchItem.vue'

interface MatchResult {
  id: number;
  completed: boolean;
  start: Date;
  end: Date;
  players: {
    id: number;
    score: number;
    name: string;
    email: string;
  }[];
}

const match: MatchResult = {
  id: 1,
  completed: true,
  start: new Date('2023-07-08T13:47:45.386Z'),
  end: new Date('2023-07-08T14:47:45.386Z'),
  players: [
    {
      id: 1,
      score: 4,
      email: 'alice@prisma.io',
      name: 'Alice'
    },
    {
      id: 2,
      score: 0,
      email: 'bob@prisma.io',
      name: 'Bob'
    }
  ]
}
</script>

<template>
  <div class="text-center">
    this is the Matchhistory tap
  </div>
  <MatchItemVue :match="match" />
</template>
