/**
 * Refinance Calculator
 * Compares current loan with potential refinance options
 */

class RefinanceCalculator {
  constructor() {
    // Cache DOM elements
    this.form = document.getElementById('refinanceForm');
    this.inputs = {
      currentOutstandingAmount: document.getElementById('currentOutstandingAmount'),
      currentInterestRate: document.getElementById('currentInterestRate'),
      currentPaymentAmount: document.getElementById('currentPaymentAmount'),
      currentPaymentFrequency: document.getElementById('currentPaymentFrequency'),
      newInterestRate: document.getElementById('newInterestRate'),
      newLoanTerm: document.getElementById('newLoanTerm')
    };
    this.resultsContainer = document.getElementById('resultsContainer');
    this.currentPaymentLabel = document.getElementById('currentPaymentLabel');

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
    this.inputs.currentPaymentFrequency.addEventListener('change', () => {
      const frequency = this.inputs.currentPaymentFrequency.value;
      this.currentPaymentLabel.textContent = `Current ${frequency === 'weekly' ? 'Weekly' : 'Monthly'} Payment ($) *`;

      // Update placeholder
      const placeholder = frequency === 'weekly' ? 'e.g., 550' : 'e.g., 2,400';
      this.inputs.currentPaymentAmount.placeholder = placeholder;
    });
  }

  validate() {
    let isValid = true;

    // Validate current outstanding amount
    if (!FinanceUtils.validateRequired(this.inputs.currentOutstandingAmount.value)) {
      FinanceUtils.setValidation(this.inputs.currentOutstandingAmount, false, 'Outstanding amount is required and must be a positive number');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.currentOutstandingAmount, true);
    }

    // Validate current interest rate
    if (!FinanceUtils.validateRequired(this.inputs.currentInterestRate.value)) {
      FinanceUtils.setValidation(this.inputs.currentInterestRate, false, 'Current interest rate is required and must be a positive number');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.currentInterestRate, true);
    }

    // Validate current payment amount
    if (!FinanceUtils.validateRequired(this.inputs.currentPaymentAmount.value)) {
      FinanceUtils.setValidation(this.inputs.currentPaymentAmount, false, 'Current payment amount is required and must be a positive number');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.currentPaymentAmount, true);
    }

    // Validate new interest rate
    if (!FinanceUtils.validateRequired(this.inputs.newInterestRate.value)) {
      FinanceUtils.setValidation(this.inputs.newInterestRate, false, 'New interest rate is required and must be a positive number');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.newInterestRate, true);
    }

    // Validate new loan term
    if (!FinanceUtils.validateRequired(this.inputs.newLoanTerm.value)) {
      FinanceUtils.setValidation(this.inputs.newLoanTerm, false, 'New loan term is required and must be a positive number');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.newLoanTerm, true);
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
    const outstandingAmount = parseFloat(this.inputs.currentOutstandingAmount.value);
    const currentRate = parseFloat(this.inputs.currentInterestRate.value) / 100;
    const currentPayment = parseFloat(this.inputs.currentPaymentAmount.value);
    const newRate = parseFloat(this.inputs.newInterestRate.value) / 100;
    const newTermYears = parseFloat(this.inputs.newLoanTerm.value);

    const isCurrentWeekly = this.inputs.currentPaymentFrequency.value === 'weekly';
    const currentMonthlyPayment = isCurrentWeekly ? currentPayment * (52/12) : currentPayment;

    const currentMonthlyRate = currentRate / 12;
    const newMonthlyRate = newRate / 12;
    const newNumberOfPayments = newTermYears * 12;

    // Calculate new loan payment
    const newMonthlyPayment = (outstandingAmount * newMonthlyRate * Math.pow(1 + newMonthlyRate, newNumberOfPayments)) /
                              (Math.pow(1 + newMonthlyRate, newNumberOfPayments) - 1);

    const newWeeklyPayment = newMonthlyPayment / (52/12);

    // Calculate current loan remaining payments
    let currentRemainingPayments = 0;
    if (currentMonthlyRate > 0) {
      const temp = Math.log(1 - (outstandingAmount * currentMonthlyRate) / currentMonthlyPayment) / Math.log(1 + currentMonthlyRate);
      currentRemainingPayments = Math.max(0, -temp);
    }

    const currentRemainingYears = currentRemainingPayments / 12;
    const currentTotalRemaining = currentMonthlyPayment * currentRemainingPayments;
    const currentRemainingInterest = currentTotalRemaining - outstandingAmount;

    // Calculate new loan totals
    const newTotalAmount = newMonthlyPayment * newNumberOfPayments;
    const newTotalInterest = newTotalAmount - outstandingAmount;

    // Calculate comparison metrics
    const interestSavings = currentRemainingInterest - newTotalInterest;
    const paymentDifference = newMonthlyPayment - currentMonthlyPayment;
    const timeDifference = newTermYears - currentRemainingYears;

    // Display results
    this.displayResults({
      currentLoan: {
        monthlyPayment: Math.round(currentMonthlyPayment),
        weeklyPayment: Math.round(currentMonthlyPayment / (52/12)),
        remainingYears: currentRemainingYears.toFixed(1),
        totalRemaining: Math.round(currentTotalRemaining),
        remainingInterest: Math.round(currentRemainingInterest),
        paymentFrequency: this.inputs.currentPaymentFrequency.value
      },
      newLoan: {
        monthlyPayment: Math.round(newMonthlyPayment),
        weeklyPayment: Math.round(newWeeklyPayment),
        loanTerm: newTermYears,
        totalAmount: Math.round(newTotalAmount),
        totalInterest: Math.round(newTotalInterest)
      },
      comparison: {
        interestSavings: Math.round(interestSavings),
        paymentDifference: Math.round(paymentDifference),
        timeDifference: timeDifference.toFixed(1),
        totalSavings: Math.round(interestSavings + (paymentDifference * newNumberOfPayments))
      }
    });
  }

  displayResults(results) {
    const frequencyLabel = results.currentLoan.paymentFrequency === 'weekly' ? 'Weekly' : 'Monthly';
    const currentPayment = results.currentLoan.paymentFrequency === 'weekly'
      ? results.currentLoan.weeklyPayment
      : results.currentLoan.monthlyPayment;

    const newPayment = results.currentLoan.paymentFrequency === 'weekly'
      ? results.newLoan.weeklyPayment
      : results.newLoan.monthlyPayment;

    const paymentDifference = results.currentLoan.paymentFrequency === 'weekly'
      ? Math.round(results.comparison.paymentDifference / (52/12))
      : results.comparison.paymentDifference;

    const totalSavings = results.currentLoan.totalRemaining - results.newLoan.totalAmount;

    let html = `
      <div class="mt-4">
        <div class="card">
          <div class="card-body">
            <div class="alert alert-info mb-3">
              <small>
                <strong>Important:</strong> This comparison is based on the information provided and does not include
                refinancing costs, fees, or other charges that may apply. Please consult with your lender for a complete
                analysis including all associated costs.
              </small>
            </div>

            <h5>Refinance Comparison</h5>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th></th>
                    <th class="text-center">
                      Current Loan<br/>
                      <small class="text-muted">Continue as-is</small>
                    </th>
                    <th class="text-center bg-success-subtle">
                      Refinanced Loan<br/>
                      <small class="text-muted">New ${results.newLoan.loanTerm} year term</small>
                    </th>
                    <th class="text-center bg-warning-subtle">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>${frequencyLabel} Payment</strong></td>
                    <td class="text-center">${FinanceUtils.formatCurrency(currentPayment)}</td>
                    <td class="text-center">${FinanceUtils.formatCurrency(newPayment)}</td>
                    <td class="text-center">
                      <span class="${paymentDifference < 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}">
                        ${paymentDifference < 0 ? '' : '+'}${FinanceUtils.formatCurrency(Math.abs(paymentDifference))}
                        ${paymentDifference < 0 ? ' saved' : ' more'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Loan Term</strong></td>
                    <td class="text-center">${results.currentLoan.remainingYears} years</td>
                    <td class="text-center">${results.newLoan.loanTerm} years</td>
                    <td class="text-center">
                      <span class="${results.comparison.timeDifference > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}">
                        ${results.comparison.timeDifference > 0 ? '+' : ''}${Math.abs(results.comparison.timeDifference)} years
                        ${results.comparison.timeDifference > 0 ? ' longer' : ' shorter'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Total Interest</strong></td>
                    <td class="text-center">${FinanceUtils.formatCurrency(results.currentLoan.remainingInterest)}</td>
                    <td class="text-center">${FinanceUtils.formatCurrency(results.newLoan.totalInterest)}</td>
                    <td class="text-center">
                      <span class="${results.comparison.interestSavings > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}">
                        ${results.comparison.interestSavings > 0 ? '' : '+'}${FinanceUtils.formatCurrency(Math.abs(results.comparison.interestSavings))}
                        ${results.comparison.interestSavings > 0 ? ' saved' : ' more'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Total Cost of Loan</strong></td>
                    <td class="text-center">${FinanceUtils.formatCurrency(results.currentLoan.totalRemaining)}</td>
                    <td class="text-center">${FinanceUtils.formatCurrency(results.newLoan.totalAmount)}</td>
                    <td class="text-center">
                      <span class="${totalSavings > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}">
                        ${totalSavings > 0 ? '' : '+'}${FinanceUtils.formatCurrency(Math.abs(totalSavings))}
                        ${totalSavings > 0 ? ' saved' : ' more'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
    `;

    if (results.comparison.interestSavings > 0) {
      html += `
            <div class="alert alert-success">
              <h6><i class="bi bi-check-circle"></i> Potential Benefits of Refinancing:</h6>
              <div class="row">
                <div class="col-12 col-lg-4">
                  <strong>Interest Savings:</strong><br/>
                  <span class="h5 text-success">${FinanceUtils.formatCurrency(results.comparison.interestSavings)}</span>
                </div>
                <div class="col-12 col-lg-4">
                  <strong>Payment Change:</strong><br/>
                  <span class="h5 ${paymentDifference < 0 ? 'text-success' : 'text-danger'}">
                    ${paymentDifference < 0 ? '-' : '+'}${FinanceUtils.formatCurrency(Math.abs(paymentDifference))}/month
                  </span>
                </div>
                <div class="col-12 col-lg-4">
                  <strong>Term Change:</strong><br/>
                  <span class="h5 ${results.comparison.timeDifference > 0 ? 'text-danger' : 'text-success'}">
                    ${results.comparison.timeDifference > 0 ? '+' : ''}${Math.abs(results.comparison.timeDifference)} years
                  </span>
                </div>
              </div>
            </div>
      `;
    } else {
      html += `
            <div class="alert alert-warning">
              <h6><i class="bi bi-exclamation-triangle"></i> Refinancing May Not Be Beneficial</h6>
              <p class="mb-0">
                Based on the provided information, refinancing may result in higher total interest costs.
                Consider the impact of refinancing fees and whether the new terms meet your financial goals.
              </p>
            </div>
      `;
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
  new RefinanceCalculator();
});
