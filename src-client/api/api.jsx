import axios from 'axios';
import { getAuth } from 'firebase/auth';

const instance = axios.create({
  baseURL: 'http://127.0.0.1:3000/'
});

instance.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const token = await user.getIdToken();
  if (user) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
