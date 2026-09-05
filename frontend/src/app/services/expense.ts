import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Expense {
  id?: number;
  title: string;
  amount: number;
  category: string;
  expense_date: string;
  description?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private apiUrl = 'http://localhost:3000/api/expenses';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  addExpense(expense: Expense): Observable<any> {
    return this.http.post(
      this.apiUrl,
      expense,
      { headers: this.getHeaders() }
    );
  }

  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  updateExpense(id: number, expense: Expense): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      expense,
      { headers: this.getHeaders() }
    );
  }

  deleteExpense(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }
}