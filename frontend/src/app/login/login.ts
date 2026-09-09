import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  email = '';
  password = '';
  errorMessage = '';
  successMessage = '';
  showPassword= false;

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  login(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.auth.login(this.email, this.password).subscribe({

      next: (response) => {

        console.log('Login successful:', response);

        this.auth.saveToken(response.token);
        this.auth.saveUser(response.user);

        this.successMessage = 'Login successful!';

        // Go to dashboard
        this.router.navigate(['/dashboard'], { replaceUrl: true });

      },

      error: (error) => {

        console.error('Login error:', error);

        this.errorMessage =
          error.error?.message || 'Invalid email or password';

      }

    });
  }
}