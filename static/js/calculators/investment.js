/**
 * Simple Investment Calculator
 * Calculates investment growth with compound interest
 */

class InvestmentCalculator {
  constructor() {
    // Cache DOM elements
    this.form = document.getElementById('investmentForm');
    this.inputs = {
      monthlyAmount: document.getElementById('monthlyAmount'),
      investmentYears: document.getElementById('investmentYears'),
      annualReturn: document.getElementById('annualReturn')
    };
    this.resultsContainer = document.getElementById('resultsContainer');

    // Attach event listeners
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Handle form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.calculate();
    });
  }

  validate() {
    let isValid = true;

    // Validate monthly amount
    if (!FinanceUtils.validateRequired(this.inputs.monthlyAmount.value)) {
      FinanceUtils.setValidation(this.inputs.monthlyAmount, false, 'Monthly amount is required and must be a positive number');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.monthlyAmount, true);
    }

    // Validate investment years
    if (!FinanceUtils.validateRequired(this.inputs.investmentYears.value)) {
      FinanceUtils.setValidation(this.inputs.investmentYears, false, 'Investment years is required and must be a positive number');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.investmentYears, true);
    }

    // Validate annual return
    if (!FinanceUtils.validateRequired(this.inputs.annualReturn.value)) {
      FinanceUtils.setValidation(this.inputs.annualReturn, false, 'Annual return is required and must be a positive number');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.annualReturn, true);
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
    const monthly = parseFloat(this.inputs.monthlyAmount.value);
    const years = parseFloat(this.inputs.investmentYears.value);
    const returnRate = parseFloat(this.inputs.annualReturn.value) / 100;
    const monthlyRate = returnRate / 12;
    const totalMonths = years * 12;

    // Calculate total amount saved (principal)
    const totalSaved = monthly * totalMonths;

    // Calculate simple return (each monthly payment earns simple interest for its time invested)
    let simpleReturn = 0;
    for (let month = 1; month <= totalMonths; month++) {
      const monthsRemaining = totalMonths - month + 1;
      const yearsRemaining = monthsRemaining / 12;
      simpleReturn += monthly * returnRate * yearsRemaining;
    }
    const totalWithSimpleReturn = totalSaved + simpleReturn;

    // Calculate compound return using future value of annuity formula
    // FV = PMT * [((1 + r)^n - 1) / r]
    const futureValue = monthly * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
    const compoundReturn = futureValue - totalSaved;

    // Display results
    this.displayResults({
      monthlyAmount: monthly,
      years: years,
      returnRate: returnRate,
      totalSaved: Math.round(totalSaved),
      simpleReturn: Math.round(simpleReturn),
      totalWithSimpleReturn: Math.round(totalWithSimpleReturn),
      compoundReturn: Math.round(compoundReturn),
      futureValue: Math.round(futureValue),
      compoundAdvantage: Math.round(compoundReturn - simpleReturn)
    });
  }

  displayResults(results) {
    const growthMultiplier = (results.futureValue / results.totalSaved).toFixed(1);

    let html = `
      <div class="mt-4">
        <div class="card">
          <div class="card-body">
            <div class="alert alert-info mb-3">
              <small>
                <strong>Important:</strong> This calculator provides estimates based on consistent monthly contributions
                and assumed annual returns. Actual investment returns vary and past performance doesn't guarantee future results.
                Consider consulting with a financial advisor for personalized investment advice.
              </small>
            </div>

            <h5>Investment Summary</h5>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead class="table-success">
                  <tr>
                    <th>Investment Component</th>
                    <th>Details</th>
                    <th class="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Monthly Contribution</strong></td>
                    <td>Regular savings amount</td>
                    <td class="text-end">${FinanceUtils.formatCurrency(results.monthlyAmount)}</td>
                  </tr>
                  <tr>
                    <td><strong>Investment Period</strong></td>
                    <td>Total years of investing</td>
                    <td class="text-end">${results.years} years</td>
                  </tr>
                  <tr>
                    <td><strong>Expected Annual Return</strong></td>
                    <td>Assumed yearly growth rate</td>
                    <td class="text-end">${(results.returnRate * 100).toFixed(1)}%</td>
                  </tr>
                  <tr class="table-warning">
                    <td><strong>Total Amount Saved</strong></td>
                    <td>
                      Your total contributions (${results.years} years × ${FinanceUtils.formatCurrency(results.monthlyAmount)}/month × 12)
                    </td>
                    <td class="text-end">${FinanceUtils.formatCurrency(results.totalSaved)}</td>
                  </tr>
                  <tr>
                    <td><strong>Simple Return (No Compounding)</strong></td>
                    <td>Returns without compound interest</td>
                    <td class="text-end">${FinanceUtils.formatCurrency(results.simpleReturn)}</td>
                  </tr>
                  <tr>
                    <td><strong>Total with Simple Return</strong></td>
                    <td>Principal + Simple returns</td>
                    <td class="text-end">${FinanceUtils.formatCurrency(results.totalWithSimpleReturn)}</td>
                  </tr>
                  <tr class="table-success">
                    <td><strong>Compound Return</strong></td>
                    <td>Returns with monthly compounding</td>
                    <td class="text-end">${FinanceUtils.formatCurrency(results.compoundReturn)}</td>
                  </tr>
                  <tr class="table-success">
                    <td><strong>Total with Compound Interest</strong></td>
                    <td>Principal + Compound returns</td>
                    <td class="text-end"><strong>${FinanceUtils.formatCurrency(results.futureValue)}</strong></td>
                  </tr>
                  <tr class="table-primary">
                    <td><strong>Compound Interest Advantage</strong></td>
                    <td>Additional returns from compounding</td>
                    <td class="text-end"><strong>${FinanceUtils.formatCurrency(results.compoundAdvantage)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="row mt-4">
              <div class="col-12 col-md-3">
                <div class="card border-warning">
                  <div class="card-body text-center">
                    <h6 class="card-title">Total Saved</h6>
                    <h4 class="text-warning">${FinanceUtils.formatCurrency(results.totalSaved)}</h4>
                    <small class="text-muted">Your contributions</small>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="card border-info">
                  <div class="card-body text-center">
                    <h6 class="card-title">Simple Returns</h6>
                    <h4 class="text-info">${FinanceUtils.formatCurrency(results.totalWithSimpleReturn)}</h4>
                    <small class="text-muted">Without compounding</small>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="card border-success">
                  <div class="card-body text-center">
                    <h6 class="card-title">Compound Returns</h6>
                    <h4 class="text-success">${FinanceUtils.formatCurrency(results.futureValue)}</h4>
                    <small class="text-muted">With compounding</small>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="card border-primary">
                  <div class="card-body text-center">
                    <h6 class="card-title">Compound Advantage</h6>
                    <h4 class="text-primary">${FinanceUtils.formatCurrency(results.compoundAdvantage)}</h4>
                    <small class="text-muted">Extra from compounding</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="alert alert-success mt-4">
              <h6><i class="bi bi-lightbulb"></i> Key Investment Insights:</h6>
              <ul class="mb-0">
                <li>
                  <strong>Time is powerful:</strong> Over ${results.years} years, compound interest adds
                  ${FinanceUtils.formatCurrency(results.compoundAdvantage)} to your returns
                </li>
                <li>
                  <strong>Consistency matters:</strong> Regular ${FinanceUtils.formatCurrency(results.monthlyAmount)}/month
                  contributions grow to ${FinanceUtils.formatCurrency(results.futureValue)}
                </li>
                <li>
                  <strong>Growth multiplier:</strong> Your ${FinanceUtils.formatCurrency(results.totalSaved)} investment
                  grows to ${growthMultiplier}x its original value
                </li>
                <li>
                  <strong>Annual compound growth:</strong> Each year your investment grows by approximately
                  ${(results.returnRate * 100).toFixed(1)}%
                </li>
              </ul>
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
  new InvestmentCalculator();
});
