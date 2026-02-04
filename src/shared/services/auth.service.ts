
import http from './api';
import { LoginFormSchema } from '../../modules/auth/login/schema';

// This is a mock service as per the manual's example
class AuthService {
  async login(reqBody: LoginFormSchema): Promise<{ token: string }> {
    console.log('Attempting to log in with:', reqBody);
    // In a real application, you would make an API call:
    // const response = await http.post('/auth/login', reqBody);
    // return response.data;

    // Mocking the API call with a delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (reqBody.email === 'admin@example.com' && reqBody.password === 'password') {
          resolve({ token: 'fake-jwt-token-for-demonstration' });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }
}

export default new AuthService();
