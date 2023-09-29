import { MockedRequest, RestHandler, rest, type DefaultBodyType } from 'msw'

const backendURL = import.meta.env.VITE_BACKEND_SERVER_URI

// Mock data
export const matches = [
  {
    id: 1,
    start: '2023-07-08T13:47:45.386Z',
    end: '2023-07-08T14:47:45.386Z',
    players: [
      {
        playerId: 1,
        matchId: 1,
        score: 4,
        player: {
          id: 1,
          email: 'alice@prisma.io',
          name: 'Alice'
        }
      },
      {
        playerId: 2,
        matchId: 1,
        score: 0,
        player: {
          id: 2,
          email: 'bob@prisma.io',
          name: 'Bob'
        }
      }
    ]
  },
  {
    id: 2,
    start: '2021-06-24T14:13:53.081Z',
    end: '2022-06-24T15:13:53.081Z',
    players: [
      {
        playerId: 1,
        matchId: 3,
        score: 0,
        player: {
          id: 1,
          email: 'alice@prisma.io',
          name: 'Alice'
        }
      },
      {
        playerId: 2,
        matchId: 3,
        score: 1,
        player: {
          id: 2,
          email: 'bob@prisma.io',
          name: 'Bob'
        }
      }
    ]
  },
  // in progress
  {
    id: 3,
    start: '2021-06-24T14:13:53.081Z',
    players: [
      {
        playerId: 1,
        matchId: 3,
        score: 0,
        player: {
          id: 1,
          email: 'alice@prisma.io',
          name: 'Alice'
        }
      },
      {
        playerId: 2,
        matchId: 3,
        score: 1,
        player: {
          id: 2,
          email: 'bob@prisma.io',
          name: 'Bob'
        }
      }
    ]
  },
  // created, but not started
  {
    id: 4,
    players: [
      {
        playerId: 1,
        matchId: 3,
        player: {
          id: 1,
          email: 'alice@prisma.io',
          name: 'Alice'
        }
      }
    ]
  }
]

export const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [
//MATCH HISTORY REST HANDLERS
  rest.get(`${backendURL}/match`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(matches))
  }),

  rest.post(`${backendURL}/match/me`, (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(matches[2]))
  }),
  
//FRIENDSHIP REST HANDLERS
  rest.get(`${backendURL}/users/friends/`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),

  rest.post(`${backendURL}/users/addFriend`, (req, res, ctx) => {
	  interface MyRequestBody {
		  friendName?: string;
	  }
	const requestBody: MyRequestBody | null | undefined = req.body as MyRequestBody;
	if (requestBody && requestBody.friendName === 'Not Found')
		return res(ctx.status(404), ctx.json(['User not found']))
	else if (requestBody && requestBody.friendName === 'Unauthorized')
		return res(ctx.status(401), ctx.json(['Unauthorized']))
	else if (requestBody && requestBody.friendName === 'Bad Request')
		return res(ctx.status(400), ctx.json(['Bad Request']))
	else if (requestBody && requestBody.friendName === 'Forbidden')
		return res(ctx.status(403), ctx.json(['Forbidden']))
	else
		return res(ctx.status(200), ctx.text(''))

  }),

  rest.post(`${backendURL}/users/find`, (req, res, ctx) => {
	  interface MyRequestBody {
		  name?: string;
	  }
	const requestBody: MyRequestBody | null | undefined = req.body as MyRequestBody;
	if (requestBody && requestBody.name === 'Mimi')
    	return res(ctx.status(200), ctx.json({}))
	else if (requestBody && (requestBody.name === 'bobb' || requestBody.name === 'Bob'))
    	return res(ctx.status(200), ctx.json([{ displayName: 'Bobu', userName: 'bobby' }]))
  }),

  rest.delete(`${backendURL}/users/removeFriend`, (req, res, ctx) => {
	  interface MyRequestBody {
		  friendName?: string;
	  }
	const requestBody: MyRequestBody | null | undefined = req.body as MyRequestBody;
	if (requestBody && requestBody.friendName === 'Mimi')
    	return res(ctx.status(400))
	else
    	return res(ctx.status(200))
  }),

]
