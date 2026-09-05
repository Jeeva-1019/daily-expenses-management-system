import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalyticsData {
  user_id: number;
  total_spending: number;
  average_expense: number;
  top_category: string | null;
  category_summary: {
    [category: string]: number;
  };
    insight: string;
    insights: string[];
}

export interface AnalyticsResponse {
  userId: number;
  analysis: AnalyticsData;
}

@Injectable({
  providedIn: 'root'
})
export class Analytics {

  private apiUrl = 'http://localhost:3000/api/analytics';

  constructor(private http: HttpClient) {}

  getAnalytics(): Observable<AnalyticsResponse> {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<AnalyticsResponse>(
      this.apiUrl,
      { headers }
    );
  }
}