/**
 * Loan Calculator
 * Calculates loan payments, amortization schedules, and extra payment impacts
 */

class LoanCalculator {
  constructor() {
    // Cache DOM elements
    this.form = document.getElementById('loanForm');
    this.inputs = {
      loanAmount: document.getElementById('loanAmount'),
      interestRate: document.getElementById('interestRate'),
      loanTerm: document.getElementById('loanTerm'),
      extraPayment: document.getElementById('extraPayment'),
      paymentFrequency: document.getElementById('paymentFrequency')
    };
    this.resultsContainer = document.getElementById('resultsContainer');
    this.extraPaymentLabel = document.getElementById('extraPaymentLabel');

    // Attach event listeners
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Handle form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.calculate();
    });

    // Update extra payment label when frequency changes
    this.inputs.paymentFrequency.addEventListener('change', () => {
      const frequency = this.inputs.paymentFrequency.value;
      this.extraPaymentLabel.textContent = `Extra Payment per ${frequency === 'weekly' ? 'Week' : 'Month'} ($)`;

      // Update placeholder
      const placeholder = frequency === 'weekly' ? 'e.g., 50' : 'e.g., 200';
      this.inputs.extraPayment.placeholder = placeholder;
    });
  }

  validate() {
    let isValid = true;

    // Validate loan amount
    if (!FinanceUtils.validateRequired(this.inputs.loanAmount.value)) {
      FinanceUtils.setValidation(this.inputs.loanAmount, false, 'Loan amount is required and must be a positive number');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.loanAmount, true);
    }

    // Validate interest rate
    if (!FinanceUtils.validateRequired(this.inputs.interestRate.value)) {
      FinanceUtils.setValidation(this.inputs.interestRate, false, 'Interest rate is required and must be a positive number');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.interestRate, true);
    }

    // Validate loan term
    if (!FinanceUtils.validateRequired(this.inputs.loanTerm.value)) {
      FinanceUtils.setValidation(this.inputs.loanTerm, false, 'Loan term is required and must be a positive number');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.loanTerm, true);
    }

    return isValid;
  }

  calculate() {
    // Clear previous validation
    FinanceUtils.clearValidation(this.form);

    // Validate inputs
    if (!this.validate()) {
      return;
    }

    // Parse input values
    const principal = parseFloat(this.inputs.loanAmount.value);
    const annualRate = parseFloat(this.inputs.interestRate.value) / 100;
    const monthlyRate = annualRate / 12;
    const numberOfPayments = parseFloat(this.inputs.loanTerm.value) * 12;
    const extra = parseFloat(this.inputs.extraPayment.value) || 0;
    const isWeekly = this.inputs.paymentFrequency.value === 'weekly';

    // Calculate monthly payment using standard mortgage formula
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const displayPayment = isWeekly ? monthlyPayment / (52/12) : monthlyPayment;
    const displayExtra = isWeekly ? extra / (52/12) : extra;

    // Calculate totals
    const totalAmount = monthlyPayment * numberOfPayments;
    const totalInterest = totalAmount - principal;

    // Generate amortization schedules
    const amortizationSchedule = this.calculateAmortization(principal, monthlyRate, monthlyPayment, numberOfPayments);

    let extraResults = null;
    if (extra > 0) {
      extraResults = this.calculateWithExtra(
        principal,
        monthlyRate,
        monthlyPayment,
        numberOfPayments,
        extra,
        totalInterest,
        displayExtra,
        isWeekly
      );
    }

    // Display results
    this.displayResults({
      monthlyPayment: Math.round(monthlyPayment),
      displayPayment: Math.round(displayPayment),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      amortizationSchedule,
      paymentFrequency: this.inputs.paymentFrequency.value,
      loanAmount: principal,
      loanTerm: parseFloat(this.inputs.loanTerm.value),
      extraResults
    });
  }

  calculateAmortization(principal, monthlyRate, monthlyPayment, numberOfPayments) {
    const schedule = [];
    let balance = principal;

    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });

      if (balance <= 0) break;
    }

    return schedule;
  }

  calculateWithExtra(principal, monthlyRate, monthlyPayment, numberOfPayments, extra, totalInterest, displayExtra, isWeekly) {
    let extraBalance = principal;
    let totalInterestWithExtra = 0;
    let extraPaymentsMonth = 0;
    const extraAmortizationSchedule = [];

    for (let month = 1; month <= numberOfPayments; month++) {
      if (extraBalance > 0) {
        const extraInterestPayment = extraBalance * monthlyRate;
        const extraPrincipalPayment = monthlyPayment - extraInterestPayment;
        const totalExtraPrincipal = extraPrincipalPayment + extra;

        extraBalance -= totalExtraPrincipal;
        totalInterestWithExtra += extraInterestPayment;
        extraPaymentsMonth = month;

        if (extraBalance <= 0) {
          extraBalance = 0;
        }

        extraAmortizationSchedule.push({
          month,
          payment: monthlyPayment + extra,
          principal: totalExtraPrincipal,
          interest: extraInterestPayment,
          balance: Math.max(0, extraBalance)
        });

        if (extraBalance <= 0) break;
      }
    }

    const yearsSaved = (numberOfPayments - extraPaymentsMonth) / 12;
    const interestSaved = totalInterest - totalInterestWithExtra;

    return {
      totalInterestWithExtra: Math.round(totalInterestWithExtra),
      interestSaved: Math.round(interestSaved),
      yearsSaved: yearsSaved.toFixed(1),
      displayExtra: Math.round(displayExtra),
      extraAmortizationSchedule,
      extraPaymentsMonth
    };
  }

  calculateSuggestion() {
    const principal = parseFloat(this.inputs.loanAmount.value);
    const annualRate = parseFloat(this.inputs.interestRate.value) / 100;
    const monthlyRate = annualRate / 12;
    const numberOfPayments = parseFloat(this.inputs.loanTerm.value) * 12;
    const isWeekly = this.inputs.paymentFrequency.value === 'weekly';
    const extraPaymentAmount = 100;

    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const displayExtraAmount = isWeekly ? extraPaymentAmount / (52/12) : extraPaymentAmount;
    const totalInterest = (monthlyPayment * numberOfPayments) - principal;

    let extraBalance = principal;
    let totalInterestWithExtra = 0;
    let extraPaymentsMonth = 0;

    for (let month = 1; month <= numberOfPayments; month++) {
      if (extraBalance > 0) {
        const extraInterestPayment = extraBalance * monthlyRate;
        const extraPrincipalPayment = monthlyPayment - extraInterestPayment;
        const totalExtraPrincipal = extraPrincipalPayment + extraPaymentAmount;

        extraBalance -= totalExtraPrincipal;
        totalInterestWithExtra += extraInterestPayment;
        extraPaymentsMonth = month;

        if (extraBalance <= 0) {
          extraBalance = 0;
          break;
        }
      }
    }

    const yearsSaved = (numberOfPayments - extraPaymentsMonth) / 12;
    const interestSaved = totalInterest - totalInterestWithExtra;

    return {
      displayExtraAmount,
      yearsSaved: yearsSaved.toFixed(1),
      interestSaved,
      frequency: isWeekly ? 'week' : 'month'
    };
  }

  displayResults(results) {
    const frequencyLabel = results.paymentFrequency === 'weekly' ? 'Weekly' : 'Monthly';
    const frequencyLower = results.paymentFrequency === 'weekly' ? 'week' : 'month';

    let html = `
      <div class="mt-4">
        <div class="card">
          <div class="card-body">
            <h5>Loan Comparison</h5>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Scenario</th>
                    <th>${frequencyLabel} Payment</th>
                    <th>Total Amount Paid</th>
                    <th>Total Interest</th>
                    <th>Loan Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Standard Loan</strong></td>
                    <td>${FinanceUtils.formatCurrency(results.displayPayment)}</td>
                    <td>${FinanceUtils.formatCurrency(results.totalAmount)}</td>
                    <td>${FinanceUtils.formatCurrency(results.totalInterest)}</td>
                    <td>${results.loanTerm} years</td>
                  </tr>
    `;

    if (results.extraResults) {
      const totalWithExtra = results.extraResults.totalInterestWithExtra + results.loanAmount;
      const newTerm = (results.loanTerm - parseFloat(results.extraResults.yearsSaved)).toFixed(1);
      const totalSavings = results.totalAmount - totalWithExtra;

      html += `
                  <tr class="table-success">
                    <td>
                      <strong>With Extra Payments</strong><br/>
                      <small class="text-muted">+${FinanceUtils.formatCurrency(results.extraResults.displayExtra)}/${frequencyLower}</small>
                    </td>
                    <td>${FinanceUtils.formatCurrency(results.displayPayment + results.extraResults.displayExtra)}</td>
                    <td>${FinanceUtils.formatCurrency(totalWithExtra)}</td>
                    <td>${FinanceUtils.formatCurrency(results.extraResults.totalInterestWithExtra)}</td>
                    <td>${newTerm} years</td>
                  </tr>
                  <tr class="table-warning">
                    <td><strong>Your Savings</strong></td>
                    <td>-</td>
                    <td>${FinanceUtils.formatCurrency(totalSavings)}</td>
                    <td>${FinanceUtils.formatCurrency(results.extraResults.interestSaved)}</td>
                    <td>${results.extraResults.yearsSaved} years saved</td>
                  </tr>
      `;
    }

    html += `
                </tbody>
              </table>
            </div>
    `;

    // Show suggestion if no extra payment
    if (!results.extraResults) {
      const suggestion = this.calculateSuggestion();
      html += `
            <div class="alert alert-info">
              <h6><i class="bi bi-lightbulb"></i> Consider making an extra payment!</h6>
              <p class="mb-2">By just paying an extra <strong>${FinanceUtils.formatCurrency(suggestion.displayExtraAmount)}</strong> per ${suggestion.frequency}, you could:</p>
              <div class="row">
                <div class="col-md-6">
                  <strong>Save ${suggestion.yearsSaved} years</strong> off your loan
                </div>
                <div class="col-md-6">
                  <strong>Save ${FinanceUtils.formatCurrency(suggestion.interestSaved)}</strong> in interest
                </div>
              </div>
              <small class="text-muted mt-2 d-block">
                Try entering ${FinanceUtils.formatCurrency(suggestion.displayExtraAmount)} in the "Extra Payment per ${suggestion.frequency === 'week' ? 'Week' : 'Month'}" field above to see the full comparison.
              </small>
            </div>
      `;
    }

    html += `
          </div>
        </div>

        <div class="card mt-3">
          <div class="card-body">
            <h5>Amortization Schedule</h5>
            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
              <table class="table table-striped table-sm">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Payment</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Balance</th>
                    ${results.extraResults ? '<th>Extra Payment Balance</th>' : ''}
                  </tr>
                </thead>
                <tbody>
    `;

    // Show first 120 months (10 years)
    const displayLimit = Math.min(results.amortizationSchedule.length, 120);
    for (let i = 0; i < displayLimit; i++) {
      const row = results.amortizationSchedule[i];
      html += `
                  <tr>
                    <td>${row.month}</td>
                    <td>${FinanceUtils.formatCurrency(row.payment)}</td>
                    <td>${FinanceUtils.formatCurrency(row.principal)}</td>
                    <td>${FinanceUtils.formatCurrency(row.interest)}</td>
                    <td>${FinanceUtils.formatCurrency(row.balance)}</td>
      `;

      if (results.extraResults) {
        const extraRow = results.extraResults.extraAmortizationSchedule[i];
        html += `<td>${FinanceUtils.formatCurrency(extraRow ? extraRow.balance : 0)}</td>`;
      }

      html += `</tr>`;
    }

    html += `
                </tbody>
              </table>
            </div>
    `;

    if (results.amortizationSchedule.length > 120) {
      html += `<small class="text-muted">Showing first 10 years. Full schedule available on calculation.</small>`;
    }

    html += `
          </div>
        </div>
      </div>
    `;

    this.resultsContainer.innerHTML = html;
  }
}

// Initialize calculator on page load
document.addEventListener('DOMContentLoaded', () => {
  new LoanCalculator();
});
