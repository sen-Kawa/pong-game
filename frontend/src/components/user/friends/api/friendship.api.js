const BASE_URL = `${import.meta.env.VITE_BACKEND_SERVER_URI}/users`;

export async function postAddFriend(friendName) {
	const requestOptions = {
		method: "POST",
		credentials: "include",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ friendName: friendName }),
	};
	const response = await fetch(`${BASE_URL}/addFriend/`, requestOptions);
	if (!response.ok) {
		const responseData = await response.json();
		return responseData;
	}
}

export async function postFindUser(name) {
	const requestOptions = {
		method: "POST",
		credentials: "include",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ name: name }),
	};
    const response = await fetch(`${BASE_URL}/find/`, requestOptions);
	
	if (response.ok) {
		const userData = await response.json();
		return userData;
	}
}

export async function deleteFriend(displayName) {
	const requestOptions = {
		method: "DELETE",
		credentials: "include",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ friendName: displayName })
	};
	await fetch(`${BASE_URL}/removeFriend/`, requestOptions);
}

export async function getFriendList() {
	const requestOptions = {
		method: "GET",
		credentials: "include"
	};
    const response = await fetch(`${BASE_URL}/friends/`, requestOptions);
	const responseData = await response.json();
	return responseData;
}
