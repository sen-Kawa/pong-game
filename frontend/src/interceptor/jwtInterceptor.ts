import axios from "axios";

const baseUrl = `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/`;
const jwtInterceptor = axios.create({});

jwtInterceptor.interceptors.request.use((config) => {

    return config;
  });

  jwtInterceptor.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      if (error.response.status === 401) {

        var response = await axios.get(
          baseUrl + "refresh",
          {
			headers: {
			'Content-Type': 'application/json'
		  },
		  withCredentials: true
		}
        );
        return axios(error.config);
      } else {
        return Promise.reject(error);
      }
    }
  );

  export default jwtInterceptor;