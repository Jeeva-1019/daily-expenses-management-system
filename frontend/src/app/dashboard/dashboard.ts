import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';

import {
  Chart,
  DoughnutController,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartConfiguration,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

import { Auth } from '../services/auth';
import { Expense, ExpenseService } from '../services/expense';
import { Router } from '@angular/router';
import { Analytics } from '../services/analytics';


// Register Doughnut chart components
Chart.register(
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement
);


@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})



export class Dashboard implements OnInit {

  // Logged-in user name
  userName = '';

  // Analytics
  analyticsData: any = null;

  totalSpending: number = 0;
  averageExpense: number = 0;
  topCategory: string | null = null;

  analyticsInsight: string = '';
  analyticsInsights: string[] = [];

  // Expenses
  expenses: Expense[] = [];


  // Dashboard summary values
  totalExpenses = 0;
  monthlyExpenses = 0;
  totalCategories = 0;

  todayExpenses = 0;

  topCategoryAmount = 0;


  // Category chart data
  categoryChartData: {
    category: string;
    amount: number;
  }[] = [];


  // Doughnut chart type
  public categoryChartType: 'doughnut' = 'doughnut';


  // Doughnut chart configuration
  public categoryChartDataConfig:
    ChartConfiguration<'doughnut'>['data'] = {

    labels: [],

    datasets: [
      {
        data: [],

        backgroundColor: [
          '#0d6efd',
          '#198754',
          '#ffc107',
          '#dc3545',
          '#6f42c1',
          '#fd7e14',
          '#20c997',
          '#0dcaf0'
        ],

        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };


  // Chart options
  public categoryChartOptions:
    ChartConfiguration<'doughnut'>['options'] = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        position: 'bottom'
      }

    }

  };


  public monthlyChartType: 'bar' = 'bar';

public monthlyChartDataConfig:
  ChartConfiguration<'bar'>['data'] = {

  labels: [],

  datasets: [
    {
      data: [],
      label: 'Monthly Expenses',
      backgroundColor: '#0d6efd',
      borderColor: '#0b5ed7',
      borderWidth: 1
    }
  ]

};

public monthlyChartOptions:
  ChartConfiguration<'bar'>['options'] = {

  responsive: true,

  maintainAspectRatio: false,

  plugins: {

    legend: {
      display: true
    }

  },

  scales: {

    y: {
      beginAtZero: true,

      ticks: {
        callback: function(value) {
          return '₹' + value;
        }
      }

    }

  }

};


  constructor(
    private auth: Auth,
    private expenseService: ExpenseService,
    private router: Router,
    private analytics: Analytics
  ) {}


  ngOnInit(): void {

    // Get logged-in user
    const user = this.auth.getUser();

    console.log('Logged-in user:', user);


    if (user) {

      this.userName = user.name;

    }


    // Load expenses
    this.loadExpenses();
    this.loadAnalytics();
  }


  // ==========================================
  // LOAD EXPENSES
  // ==========================================

  loadExpenses(): void {

    this.expenseService.getExpenses().subscribe({

      next: (data) => {

        console.log('Dashboard expenses:', data);

        this.expenses = data;

        this.calculateSummary();

      },

      error: (error) => {

        console.error(
          'Dashboard expense error:',
          error
        );

      }

    });

  }


  // ==========================================
  // CALCULATE DASHBOARD SUMMARY
  // ==========================================

  calculateSummary(): void {


    // ------------------------------------------
    // TOTAL EXPENSES
    // ------------------------------------------

    this.totalExpenses = this.expenses.reduce(

      (total, expense) =>
        total + Number(expense.amount),

      0

    );


    // ------------------------------------------
    // CURRENT MONTH EXPENSES
    // ------------------------------------------

    const currentDate = new Date();

    const currentMonth =
      currentDate.getMonth();

    const currentYear =
      currentDate.getFullYear();


    this.monthlyExpenses = this.expenses

      .filter(expense => {

        const expenseDate =
          new Date(expense.expense_date);

        return (

          expenseDate.getMonth() === currentMonth &&

          expenseDate.getFullYear() === currentYear

        );

      })

      .reduce(

        (total, expense) =>
          total + Number(expense.amount),

        0

      );


    // ------------------------------------------
    // TOTAL CATEGORIES
    // ------------------------------------------

    const categories = new Set(

      this.expenses.map(
        expense => expense.category
      )

    );

    this.totalCategories =
      categories.size;


    // ------------------------------------------
    // TODAY'S EXPENSES
    // ------------------------------------------

    const today = new Date();


    const todayString =

      today.getFullYear() +
      '-' +

      String(
        today.getMonth() + 1
      ).padStart(2, '0') +

      '-' +

      String(
        today.getDate()
      ).padStart(2, '0');


    this.todayExpenses = this.expenses

      .filter(expense => {

        return (

          expense.expense_date
            .substring(0, 10) ===
          todayString

        );

      })

      .reduce(

        (total, expense) =>
          total + Number(expense.amount),

        0

      );


    // ------------------------------------------
    // CATEGORY TOTALS
    // ------------------------------------------

    const categoryTotals:
      { [key: string]: number } = {};


    this.expenses.forEach(expense => {

      const category =
        expense.category;

      const amount =
        Number(expense.amount);


      if (categoryTotals[category]) {

        categoryTotals[category] += amount;

      } else {

        categoryTotals[category] = amount;

      }

    });


    // ------------------------------------------
    // TOP SPENDING CATEGORY
    // ------------------------------------------

    let highestCategory = '';

    let highestAmount = 0;


    Object.keys(categoryTotals).forEach(
      category => {

        if (
          categoryTotals[category] >
          highestAmount
        ) {

          highestAmount =
            categoryTotals[category];

          highestCategory =
            category;

        }

      }
    );


    this.topCategory =
      highestCategory || 'None';

    this.topCategoryAmount =
      highestAmount;


    // ------------------------------------------
    // CATEGORY-WISE CHART DATA
    // ------------------------------------------

    this.categoryChartData =
      Object.keys(categoryTotals).map(
        category => ({

          category: category,

          amount:
            categoryTotals[category]

        })

      );


    console.log(
      'Category chart data:',
      this.categoryChartData
    );


    // ------------------------------------------
    // UPDATE DOUGHNUT CHART
    // ------------------------------------------

    this.categoryChartDataConfig = {

      labels:
        this.categoryChartData.map(
          item => item.category
        ),

      datasets: [

        {

          data:
            this.categoryChartData.map(
              item => item.amount
            ),


          // Chart colors
          backgroundColor: [

            '#0d6efd',
            '#198754',
            '#ffc107',
            '#dc3545',
            '#6f42c1',
            '#fd7e14',
            '#20c997',
            '#0dcaf0'

          ],


          // White border between slices
          borderColor: '#ffffff',

          borderWidth: 2

        }

      ]

    };

    // ==========================================
// MONTHLY EXPENSE CHART
// ==========================================

const monthlyTotals: {
  [key: string]: number
} = {};

this.expenses.forEach(expense => {

  const expenseDate =
    new Date(expense.expense_date);

  const year =
    expenseDate.getFullYear();

  const month =
    expenseDate.getMonth();

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  const monthYear =
    `${monthNames[month]} ${year}`;

  const amount =
    Number(expense.amount);

  if (monthlyTotals[monthYear]) {

    monthlyTotals[monthYear] += amount;

  } else {

    monthlyTotals[monthYear] = amount;

  }

});


// Update monthly bar chart

this.monthlyChartDataConfig = {

  labels: Object.keys(monthlyTotals),

  datasets: [

    {

      data: Object.values(monthlyTotals),

      label: 'Monthly Expenses',

      backgroundColor: '#0d6efd',

      borderColor: '#0b5ed7',

      borderWidth: 1

    }

  ]

};

console.log(
  'Monthly chart data:',
  monthlyTotals
);

  }


  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {

    this.auth.logout();

    this.router.navigate(
      ['/login'],
      {
        replaceUrl: true
      }
    );

  }


  // ==========================================
  // ADD EXPENSE
  // ==========================================

  addExpense(): void {

    this.router.navigate(
      ['/expenses']
    );

  }


  // ==========================================
  // VIEW ALL EXPENSES
  // ==========================================

  viewAllExpenses(): void {

    this.router.navigate(
      ['/expenses']
    );

  }

loadAnalytics(): void {
  this.analytics.getAnalytics().subscribe({
    next: (response) => {

      console.log('Analytics Data:', response);

      this.analyticsData = response.analysis;

      this.totalSpending = response.analysis.total_spending;

      this.averageExpense = response.analysis.average_expense;

      this.topCategory = response.analysis.top_category || '';

      this.analyticsInsight = response.analysis.insight;

      this.analyticsInsights = response.analysis.insights;
    },

    error: (error) => {
      console.error('Analytics Error:', error);
    }
  });
}

}