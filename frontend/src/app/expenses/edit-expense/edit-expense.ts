import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Expense, ExpenseService } from '../../services/expense';

@Component({
  selector: 'app-edit-expense',
  imports: [FormsModule],
  templateUrl: './edit-expense.html',
  styleUrl: './edit-expense.scss'
})
export class EditExpense implements OnInit {

  expenseId!: number;

  title = '';
  amount: number | null = null;
  category = '';
  expense_date = '';
  description = '';

  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private expenseService: ExpenseService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.expenseId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.loadExpense();
  }

  loadExpense(): void {

    this.expenseService.getExpenses().subscribe({

      next: (expenses) => {

        const expense = expenses.find(
          item => item.id === this.expenseId
        );

        if (!expense) {
          this.errorMessage = 'Expense not found';
          return;
        }

        this.title = expense.title;
        this.amount = expense.amount;
        this.category = expense.category;
        this.expense_date = expense.expense_date? expense.expense_date.substring(0, 10): '';
        this.description = expense.description || '';

      },

      error: (error) => {

        console.error('Load expense error:', error);

        this.errorMessage = 'Failed to load expense';

      }

    });
  }

  updateExpense(): void {

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

    const expense: Expense = {

      title: this.title,
      amount: this.amount,
      category: this.category,
      expense_date: this.expense_date,
      description: this.description

    };

    this.expenseService
      .updateExpense(this.expenseId, expense)
      .subscribe({

        next: (response) => {

          console.log('Expense updated:', response);

          this.successMessage =
            'Expense updated successfully!';

          setTimeout(() => {

            this.router.navigate(['/expenses'], {
              replaceUrl: true
            });

          }, 1000);

        },

        error: (error) => {

          console.error('Update expense error:', error);
          console.log('Status:', error.status);
          console.log('Response:', error.error);
          this.errorMessage =
            error.error?.message ||
            'Failed to update expense';

        }

      });
  }

  cancel(): void {

    this.router.navigate(['/expenses']);

  }
}