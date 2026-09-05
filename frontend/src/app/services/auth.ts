import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      {
        email,
        password
      }
    );
  }

  register(
  name: string,
  email: string,
  password: string
): Observable<any> {
  return this.http.post(
    `${this.apiUrl}/register`,
    {
      name,
      email,
      password
    }
  );
}

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  saveUser(user: { id: number; name: string; email: string }): void {
  localStorage.setItem('user', JSON.stringify(user));
}

  getUser(): { id: number; name: string; email: string } | null {
  const user = localStorage.getItem('user');

  return user ? JSON.parse(user) : null;
}
}

