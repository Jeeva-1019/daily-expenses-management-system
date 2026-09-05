import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpenseService } from '../../services/expense';

@Component({
  selector: 'app-add-expense',
  imports: [FormsModule],
  templateUrl: './add-expense.html',
  styleUrl: './add-expense.scss'
})
export class AddExpense {

  title = '';
  amount: number | null = null;
  category = '';
  expense_date = '';
  description = '';

  errorMessage = '';
  successMessage = '';

  constructor(
    private expenseService: ExpenseService,
    private router: Router
  ) {}

  addExpense(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.title ||
      !this.amount ||
      !this.category ||
      !this.expense_date
    ) {
      this.errorMessage =
        'Please fill in all required fields';

      return;
    }

    const expense = {
      title: this.title,
      amount: this.amount,
      category: this.category,
      expense_date: this.expense_date,
      description: this.description
    };

    this.expenseService.addExpense(expense).subscribe({

      next: (response) => {

        console.log('Expense added:', response);

        this.successMessage =
          'Expense added successfully!';

        // Go back to expenses page
        setTimeout(() => {
          this.router.navigate(['/expenses'], {
            replaceUrl: true
          });
        }, 1000);
      },

      error: (error) => {

        console.error('Add expense error:', error);

        this.errorMessage =
          error.error?.message ||
          'Failed to add expense';
      }

    });
  }
  goBack(): void {
  this.router.navigate(['/expenses']);
}
}