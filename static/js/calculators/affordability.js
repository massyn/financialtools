/**
 * Borrowing Capacity Calculator
 * Calculates maximum loan amounts based on payment capacity
 */

class AffordabilityCalculator {
  constructor() {
    // Cache DOM elements
    this.form = document.getElementById('affordabilityForm');
    this.inputs = {
      paymentAmount: document.getElementById('paymentAmount'),
      interestRate: document.getElementById('interestRate'),
      paymentFrequency: document.getElementById('paymentFrequency')
    };
    this.resultsContainer = document.getElementById('resultsContainer');
    this.paymentLabel = document.getElementById('paymentLabel');

    // Attach event listeners
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Handle form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.calculate();
    });

    // Update payment label when frequency changes
    this.inputs.paymentFrequency.addEventListener('change', () => {
      const frequency = this.inputs.paymentFrequency.value;
      this.paymentLabel.textContent = `${frequency === 'weekly' ? 'Weekly' : 'Monthly'} Payment Amount ($) *`;

      // Update placeholder
      const placeholder = frequency === 'weekly' ? 'e.g., 600' : 'e.g., 2,500';
      this.inputs.paymentAmount.placeholder = placeholder;
    });
  }

  validate() {
    let isValid = true;

    // Validate payment amount
    if (!FinanceUtils.validateRequired(this.inputs.paymentAmount.value)) {
      FinanceUtils.setValidation(this.inputs.paymentAmount, false, 'Payment amount is required and must be a positive number');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.paymentAmount, true);
    }

    // Validate interest rate
    if (!FinanceUtils.validateRequired(this.inputs.interestRate.value)) {
      FinanceUtils.setValidation(this.inputs.interestRate, false, 'Interest rate is required and must be a positive number');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.interestRate, true);
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
    const payment = parseFloat(this.inputs.paymentAmount.value);
    const annualRate = parseFloat(this.inputs.interestRate.value) / 100;
    const monthlyRate = annualRate / 12;
    const isWeekly = this.inputs.paymentFrequency.value === 'weekly';
    const actualMonthlyPayment = isWeekly ? payment * (52/12) : payment;

    // Calculate borrowing capacity for different terms
    const affordabilityData = [];

    for (let years = 5; years <= 35; years += 5) {
      const numberOfPayments = years * 12;

      // Present value of annuity formula
      const loanAmount = actualMonthlyPayment * ((1 - Math.pow(1 + monthlyRate, -numberOfPayments)) / monthlyRate);
      const totalPayment = actualMonthlyPayment * numberOfPayments;
      const totalInterest = totalPayment - loanAmount;

      affordabilityData.push({
        years,
        loanAmount: Math.round(loanAmount),
        totalPayment: Math.round(totalPayment),
        totalInterest: Math.round(totalInterest)
      });
    }

    // Display results
    this.displayResults({
      data: affordabilityData,
      paymentFrequency: this.inputs.paymentFrequency.value,
      originalPayment: payment,
      interestRate: this.inputs.interestRate.value
    });
  }

  displayResults(results) {
    const frequencyLabel = results.paymentFrequency === 'weekly' ? 'weekly' : 'monthly';

    let html = `
      <div class="mt-4">
        <div class="card">
          <div class="card-body">
            <div class="alert alert-warning mb-3">
              <small>
                <strong>Important:</strong> While this calculator shows what the mathematics suggest you could potentially borrow,
                please note that banks and lenders use additional criteria to assess your eligibility, including income verification,
                credit history, existing debts, and lending policies. These results are indicative only and should be used as a
                starting point for your research.
              </small>
            </div>

            <h5>Borrowing Capacity Analysis</h5>
            <p class="text-muted">
              Based on a ${frequencyLabel} payment of ${FinanceUtils.formatCurrency(results.originalPayment)}
              at ${results.interestRate}% interest rate:
            </p>

            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Loan Term (Years)</th>
                    <th>Maximum Loan Amount</th>
                    <th>Total Amount Paid</th>
                    <th>Total Interest Paid</th>
                  </tr>
                </thead>
                <tbody>
    `;

    results.data.forEach(row => {
      html += `
                  <tr>
                    <td>${row.years}</td>
                    <td>${FinanceUtils.formatCurrency(row.loanAmount)}</td>
                    <td>${FinanceUtils.formatCurrency(row.totalPayment)}</td>
                    <td>${FinanceUtils.formatCurrency(row.totalInterest)}</td>
                  </tr>
      `;
    });

    html += `
                </tbody>
              </table>
            </div>

            <div class="alert alert-info mt-3">
              <small>
                <strong>Note:</strong> These calculations assume a fixed interest rate and do not include
                additional costs such as insurance, taxes, or fees. Actual loan terms may vary based on
                your credit score, income, and other factors.
              </small>
            </div>
          </div>
        </div>
      </div>
    `;

    this.resultsContainer.innerHTML = html;
  }
}

// Initialize calculator on page load
document.addEventListener('DOMContentLoaded', () => {
  new AffordabilityCalculator();
});
