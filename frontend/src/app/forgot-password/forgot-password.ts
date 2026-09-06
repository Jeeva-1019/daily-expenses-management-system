import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {

  email = '';

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  onSubmit(): void {

    if (!this.email) {
      alert('Please enter your email address');
      return;
    }

    this.auth.forgotPassword(this.email).subscribe({
   next: (response) => {

  console.log('FULL RESPONSE:', response);
  console.log('TOKEN:', response.token);
  console.log('TOKEN TYPE:', typeof response.token);

  if (!response.token) {
    alert('Backend did not return a reset token');
    return;
  }

  localStorage.setItem('resetToken', response.token);

  console.log(
    'SAVED TOKEN:',
    localStorage.getItem('resetToken')
  );

  alert(response.message);

  this.router.navigate(['/reset-password']);

},

      error: (error) => {
        alert(error.error?.message || 'Something went wrong');
      }
    });

  }
}