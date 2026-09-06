import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword {

  password = '';
  confirmPassword = '';

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  onSubmit(): void {

    if (!this.password || !this.confirmPassword) {
      alert('Please enter both passwords');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (this.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    const token = localStorage.getItem('resetToken');

    if (!token) {
      alert('Reset token not found. Please request a new password reset.');
      return;
    }

    this.auth.resetPassword(token, this.password).subscribe({
      next: (response) => {
        alert(response.message);

        localStorage.removeItem('resetToken');

        this.router.navigate(['/login']);
      },

      error: (error) => {
        alert(error.error?.message || 'Something went wrong');
      }
    });
  }
}