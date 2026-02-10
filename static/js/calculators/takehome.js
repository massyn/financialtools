/**
 * Take Home Pay Calculator
 * Calculates take-home pay based on Australian tax rates
 */

class TakeHomeCalculator {
  constructor() {
    // Cache DOM elements
    this.form = document.getElementById('takeHomeForm');
    this.inputs = {
      paymentFrequency: document.getElementById('paymentFrequency'),
      annualSalary: document.getElementById('annualSalary'),
      includesSuper: document.getElementById('includesSuper'),
      medicareLevy: document.getElementById('medicareLevy'),
      salarySacrifice: document.getElementById('salarySacrifice'),
      taxYear: document.getElementById('taxYear')
    };
    this.resultsContainer = document.getElementById('resultsContainer');
    this.taxData = window.TAX_DATA;

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

    // Validate annual salary
    if (!FinanceUtils.validateRequired(this.inputs.annualSalary.value)) {
      FinanceUtils.setValidation(this.inputs.annualSalary, false, 'Annual salary is required and must be a positive number');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.annualSalary, true);
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
    const salary = parseFloat(this.inputs.annualSalary.value);
    const sacrificePercent = parseFloat(this.inputs.salarySacrifice.value) || 0;
    const taxYear = this.inputs.taxYear.value;
    const includesSuper = this.inputs.includesSuper.value === 'yes';
    const payMedicareLevy = this.inputs.medicareLevy.value === 'yes';
    const paymentFrequency = this.inputs.paymentFrequency.value;

    const taxYearData = this.taxData.rates[taxYear];
    const lookupData = this.taxData.lookup[taxYear];

    // Step 1: Calculate superannuation
    let superAmount = 0;
    let grossSalary = salary;

    if (includesSuper) {
      const superRate = lookupData.super;
      superAmount = salary * superRate / (1 + superRate);
      grossSalary = salary - superAmount;
    }

    // Step 2: Calculate salary sacrifice
    const sacrificeAmount = grossSalary * (sacrificePercent / 100);
    const taxableIncome = grossSalary - sacrificeAmount;

    // Step 3: Calculate income tax (on taxable income after salary sacrifice)
    let incomeTax = 0;
    const taxBracket = taxYearData.find(bracket =>
      taxableIncome >= bracket.from_range &&
      (bracket.to_range === -1 || bracket.to_range === 999999999999 || taxableIncome <= bracket.to_range)
    );

    if (taxBracket) {
      const taxableOver = Math.max(0, taxableIncome - taxBracket.over);
      incomeTax = taxBracket.base + (taxableOver * taxBracket.c);
    }

    // Step 4: Calculate medicare levy (on taxable income after salary sacrifice)
    let medicareAmount = 0;
    if (payMedicareLevy) {
      medicareAmount = taxableIncome * lookupData.medicare_levy;
    }

    // Step 5: Calculate take home pay
    const totalTax = incomeTax + medicareAmount;
    const takeHomeAnnual = taxableIncome - totalTax;

    // Step 6: Calculate tax savings from salary sacrifice
    // Calculate what the tax would be WITHOUT salary sacrifice for comparison
    let incomeTaxWithoutSacrifice = 0;
    const taxBracketWithoutSacrifice = taxYearData.find(bracket =>
      grossSalary >= bracket.from_range &&
      (bracket.to_range === -1 || bracket.to_range === 999999999999 || grossSalary <= bracket.to_range)
    );

    if (taxBracketWithoutSacrifice) {
      const taxableOver = Math.max(0, grossSalary - taxBracketWithoutSacrifice.over);
      incomeTaxWithoutSacrifice = taxBracketWithoutSacrifice.base + (taxableOver * taxBracketWithoutSacrifice.c);
    }

    const medicareWithoutSacrifice = payMedicareLevy ? grossSalary * lookupData.medicare_levy : 0;
    const totalTaxWithoutSacrifice = incomeTaxWithoutSacrifice + medicareWithoutSacrifice;
    const taxSavings = totalTaxWithoutSacrifice - totalTax;

    // Step 7: Calculate periodic amounts
    const takeHomeMonthly = takeHomeAnnual / 12;
    const takeHomeWeekly = takeHomeAnnual / 52;
    const takeHomePeriodic = paymentFrequency === 'weekly' ? takeHomeWeekly : takeHomeMonthly;

    // Step 8: Calculate total superannuation
    const totalSuper = superAmount + sacrificeAmount;

    // Display results
    this.displayResults({
      employerSalary: salary,
      includesSuper,
      superRate: lookupData.super,
      superAmount: Math.round(superAmount),
      grossSalary: Math.round(grossSalary),
      sacrificePercent,
      sacrificeAmount: Math.round(sacrificeAmount),
      taxableIncome: Math.round(taxableIncome),
      taxBracket,
      incomeTax: Math.round(incomeTax),
      medicareAmount: Math.round(medicareAmount),
      totalTax: Math.round(totalTax),
      taxSavings: Math.round(taxSavings),
      totalSuper: Math.round(totalSuper),
      takeHomeAnnual: Math.round(takeHomeAnnual),
      takeHomeMonthly: Math.round(takeHomeMonthly),
      takeHomeWeekly: Math.round(takeHomeWeekly),
      takeHomePeriodic: Math.round(takeHomePeriodic),
      paymentFrequency,
      taxYear
    });
  }

  displayResults(results) {
    const frequencyLabel = results.paymentFrequency === 'weekly' ? 'Weekly' : 'Monthly';
    const frequencyLower = results.paymentFrequency === 'weekly' ? 'week' : 'month';

    let html = `
      <div class="mt-4">
        <div class="card">
          <div class="card-body">
            <div class="alert alert-info mb-3">
              <small>
                <strong>Important:</strong> This calculation is based on standard Australian tax rates for ${results.taxYear}
                and does not include other deductions, rebates, or personal circumstances that may affect your actual take-home pay.
                Consult a tax professional for personalized advice.
              </small>
            </div>

            <h5>Take Home Pay Breakdown</h5>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead class="table-success">
                  <tr>
                    <th>Component</th>
                    <th>Details</th>
                    <th class="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Employer Stated Salary</strong></td>
                    <td>Annual salary as provided by employer</td>
                    <td class="text-end">${FinanceUtils.formatCurrency(results.employerSalary)}</td>
                  </tr>
    `;

    if (results.includesSuper) {
      html += `
                  <tr class="table-warning">
                    <td><strong>Less: Superannuation</strong></td>
                    <td>Super component (${(results.superRate * 100).toFixed(2)}% included in salary)</td>
                    <td class="text-end">-${FinanceUtils.formatCurrency(results.superAmount)}</td>
                  </tr>
      `;
    }

    html += `
                  <tr class="table-primary">
                    <td><strong>Base (Gross) Pay</strong></td>
                    <td>Salary ${results.includesSuper ? 'after super deduction' : '(excludes super)'}</td>
                    <td class="text-end">${FinanceUtils.formatCurrency(results.grossSalary)}</td>
                  </tr>
    `;

    if (results.sacrificeAmount > 0) {
      html += `
                  <tr class="table-info">
                    <td><strong>Less: Salary Sacrifice</strong></td>
                    <td>Voluntary super contribution (${results.sacrificePercent}% of gross salary)</td>
                    <td class="text-end">-${FinanceUtils.formatCurrency(results.sacrificeAmount)}</td>
                  </tr>
                  <tr class="table-light">
                    <td><strong>Taxable Income</strong></td>
                    <td>Income after salary sacrifice (subject to tax)</td>
                    <td class="text-end">${FinanceUtils.formatCurrency(results.taxableIncome)}</td>
                  </tr>
      `;
    }

    const toRangeLabel = results.taxBracket.to_range === -1 || results.taxBracket.to_range === 999999999999
      ? '∞'
      : FinanceUtils.formatCurrency(results.taxBracket.to_range);

    html += `
                  <tr>
                    <td><strong>Less: Income Tax</strong></td>
                    <td>
                      Tax bracket: ${FinanceUtils.formatCurrency(results.taxBracket.from_range)} - ${toRangeLabel}
                      <br/>
                      <small class="text-muted">
                        Base: ${FinanceUtils.formatCurrency(results.taxBracket.base)} +
                        ${(results.taxBracket.c * 100).toFixed(1)}% over ${FinanceUtils.formatCurrency(results.taxBracket.over)}
                      </small>
                    </td>
                    <td class="text-end">-${FinanceUtils.formatCurrency(results.incomeTax)}</td>
                  </tr>
    `;

    if (results.medicareAmount > 0) {
      html += `
                  <tr>
                    <td><strong>Less: Medicare Levy</strong></td>
                    <td>2.0% of taxable income</td>
                    <td class="text-end">-${FinanceUtils.formatCurrency(results.medicareAmount)}</td>
                  </tr>
      `;
    }

    html += `
                  <tr class="table-success">
                    <td><strong>Take Home Pay (Annual)</strong></td>
                    <td>Net pay after all deductions</td>
                    <td class="text-end"><strong>${FinanceUtils.formatCurrency(results.takeHomeAnnual)}</strong></td>
                  </tr>
                  <tr class="table-success">
                    <td><strong>Take Home Pay (${frequencyLabel})</strong></td>
                    <td>Net pay per ${frequencyLower}</td>
                    <td class="text-end"><strong>${FinanceUtils.formatCurrency(results.takeHomePeriodic)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
    `;

    if (results.sacrificeAmount > 0) {
      const netReduction = results.sacrificeAmount - results.taxSavings;
      html += `
            <div class="alert alert-success mt-3">
              <h6 class="alert-heading">Salary Sacrifice Impact</h6>
              <div class="row">
                <div class="col-12 col-md-4">
                  <strong>Tax Savings:</strong> ${FinanceUtils.formatCurrency(results.taxSavings)}
                </div>
                <div class="col-12 col-md-4">
                  <strong>Total Superannuation:</strong> ${FinanceUtils.formatCurrency(results.totalSuper)}
                </div>
                <div class="col-12 col-md-4">
                  <strong>Net Take Home Reduction:</strong> ${FinanceUtils.formatCurrency(netReduction)}
                </div>
              </div>
              <hr />
              <small class="text-muted">
                By sacrificing ${FinanceUtils.formatCurrency(results.sacrificeAmount)} into super, you save ${FinanceUtils.formatCurrency(results.taxSavings)} in tax.
                Your take-home pay reduces by only ${FinanceUtils.formatCurrency(netReduction)},
                while your super increases by ${FinanceUtils.formatCurrency(results.sacrificeAmount)}.
              </small>
            </div>
      `;
    }

    html += `
            <div class="row mt-4">
              <div class="col-12 col-md-6">
                <div class="card border-primary">
                  <div class="card-body text-center">
                    <h6 class="card-title">Annual Take Home</h6>
                    <h4 class="text-primary">${FinanceUtils.formatCurrency(results.takeHomeAnnual)}</h4>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="card ${results.paymentFrequency === 'weekly' ? 'border-info' : 'border-success'}">
                  <div class="card-body text-center">
                    <h6 class="card-title">${frequencyLabel} Take Home</h6>
                    <h4 class="${results.paymentFrequency === 'weekly' ? 'text-info' : 'text-success'}">
                      ${FinanceUtils.formatCurrency(results.takeHomePeriodic)}
                    </h4>
                  </div>
                </div>
              </div>
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
  new TakeHomeCalculator();
});
