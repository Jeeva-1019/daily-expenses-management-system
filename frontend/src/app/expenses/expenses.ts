import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Expense, ExpenseService } from '../services/expense';

@Component({
  selector: 'app-expenses',
  imports: [],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss'
})
export class Expenses implements OnInit {

  expenses: Expense[] = [];

  constructor(
    private expenseService: ExpenseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.expenseService.getExpenses().subscribe({

      next: (data) => {
        console.log('Expenses:', data);
        this.expenses = data;
      },

      error: (error) => {
        console.error('Get expenses error:', error);
      }

    });
  }

  addExpense(): void {
    this.router.navigate(['/expenses/add']);
  }
  editExpense(id: number): void {
  this.router.navigate(['/expenses/edit', id]);
}
goToDashboard(): void {
  this.router.navigate(['/dashboard']);
}

deleteExpense(id: number): void {

  const confirmed = confirm(
    'Are you sure you want to delete this expense?'
  );

  if (!confirmed) {
    return;
  }

  this.expenseService.deleteExpense(id).subscribe({

    next: (response) => {

      console.log('Expense deleted:', response);

      this.loadExpenses();

    },

    error: (error) => {

      console.error('Delete expense error:', error);

    }

  });
}
}