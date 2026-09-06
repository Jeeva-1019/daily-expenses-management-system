import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './guards/auth-guard';
import { Expenses } from './expenses/expenses';
import { AddExpense } from './expenses/add-expense/add-expense';
import { EditExpense } from './expenses/edit-expense/edit-expense';
import { ForgotPassword } from './forgot-password/forgot-password';
import { ResetPassword } from './reset-password/reset-password';

export const routes: Routes = [
      {
    path: 'login',
    component: Login
  },
   {
    path: 'register',
    component: Register
  },
  {
  path: 'forgot-password',
  component: ForgotPassword
},
{
  path: 'reset-password',
  component: ResetPassword
},
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
  path: 'expenses',
  component: Expenses,
  canActivate: [authGuard]
  }, 
  {
  path: 'expenses/add',
  component: AddExpense,
  canActivate: [authGuard]
  },
  {
  path: 'expenses/edit/:id',
  component: EditExpense,
  canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
