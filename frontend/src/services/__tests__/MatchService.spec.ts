import { beforeEach, describe, expect, it } from 'vitest';
import MatchService from '../MatchService';

const backendURL = import.meta.env.VITE_BACKEND_SERVER_URI;

describe('MatchService', () => {
    let matchService: MatchService;

    beforeEach(() => {
        matchService = new MatchService(backendURL);
    });

    it('fetches data', async () => {
        const data = await matchService.fetchData();

        expect(data.length).greaterThan(0);
    });

    it('fetches the match history', async () => {
        const matchHistory = await matchService.getMatchHistory();

        expect(matchHistory.length).greaterThan(0);
    });
});
