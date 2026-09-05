import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  name = '';
  email = '';
  password = '';

  errorMessage = '';
  successMessage = '';

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  register(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Please enter name, email and password';
      return;
    }

    this.auth.register(
      this.name,
      this.email,
      this.password
    ).subscribe({

      next: (response) => {

        console.log('Registration successful:', response);

        this.successMessage = 'Registration successful! Please login.';

        this.name = '';
        this.email = '';
        this.password = '';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },

      error: (error) => {

        console.error('Registration error:', error);

        this.errorMessage =
          error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}