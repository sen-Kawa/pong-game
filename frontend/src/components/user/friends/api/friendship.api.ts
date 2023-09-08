import axios from 'axios'
import jwtInterceptor from '@/interceptor/jwtInterceptor'
//const BASE_URL = `${import.meta.env.VITE_BACKEND_SERVER_URI}/users`
const BASE_URL = 'http://localhost:3000/users'

export async function postAddFriend(friendName: string) {
  const requestOptions: RequestInit = {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ friendName: friendName })
  }
  const response = await fetch(`${BASE_URL}/addFriend/`, requestOptions)
  if (!response.ok) {
    const responseData = await response.json()
    return responseData
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
	console.log('Request succesful', response.data);
	console.log('Request response', response);
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
  	const response = await jwtInterceptor.delete(`${BASE_URL}/removeFriend/`, requestOptions)
	console.log('in delete api', displayName);
	console.log('Request succesful in deleteFriend api', response.data);
  } catch (error) {
	console.error('Error making the request in deleteFriend api', error);
  }
}

export async function getFriendList() {
  const requestOptions: RequestInit = {
    method: 'GET',
    credentials: 'include'
  }
  try {
  	const response = await fetch(`${BASE_URL}/friends/`, requestOptions)
	if (!response.ok) {
		throw new Error('Failed fetching friends list.');
	}
  	const responseData = await response.json();
  	return responseData
  } catch (error) {
	  console.error('Error fetching friends list: ', error);
	  throw error;
  }
}
