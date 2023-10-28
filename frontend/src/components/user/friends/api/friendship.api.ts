import jwtInterceptor from '@/interceptor/jwtInterceptor'
const BASE_URL = `${import.meta.env.VITE_BACKEND_SERVER_URI}/users`
//const BASE_URL = 'http://localhost:3000/users'

export async function postAddFriend(friendName: string) {
  const requestOptions = {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    },
  }
  const requestBody = JSON.stringify({ friendName: friendName })
  try {
  	const response = await jwtInterceptor.post(`${BASE_URL}/addFriend/`, requestBody, requestOptions)
	return response.data
  } catch (error) {
	console.error('Error making the request', error);
	throw error
	}
}

export async function postFindUser(name: string) {
  const requestOptions = {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    },
  }
  const requestBody = JSON.stringify({ name: name })
  try {
  	const response = await jwtInterceptor.post(`${BASE_URL}/find/`, requestBody, requestOptions)
	return response
  } catch (error) {
	console.error('Error making the request', error);
	throw error
	}
}

export async function deleteFriend(displayName: string) {
  const requestOptions = {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({ friendName: displayName })
  }
  try {
  	await jwtInterceptor.delete(`${BASE_URL}/removeFriend/`, requestOptions)
  } catch (error) {
	console.error('Error making the request in deleteFriend api', error);
	throw error
  }
}

export async function getFriendList() {
  const requestOptions = {
    withCredentials: true,
  }
  try {
  	const response = await jwtInterceptor.get(`${BASE_URL}/friends/`, requestOptions)
	return response.data
  } catch (error) {
	  console.error('Error fetching friends list: ', error);
	  throw error;
  }
}
