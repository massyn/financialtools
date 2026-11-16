/**
 * Take Home Pay Calculator
 * Calculates take-home pay based on Australian tax rates
 */

class TakeHomeCalculator {
  constructor() {
    // Cache DOM elements
    this.form = document.getElementById('takeHomeForm');
    this.inputs = {
      annualSalary: document.getElementById('annualSalary'),
      includesSuper: document.getElementById('includesSuper'),
      medicareLevy: document.getElementById('medicareLevy'),
      salarySacrifice: document.getElementById('salarySacrifice'),
      taxYear: document.getElementById('taxYear')
    };
    this.formSection = document.getElementById('salaryDetails');
    this.resultsContainer = document.getElementById('resultsContainer');
    this.taxData = window.TAX_DATA;

    this.selectCurrentTaxYear();

    // Attach event listeners
    this.attachEventListeners();
  }

  /**
   * Default the tax year to the current Australian financial year
   * (1 July - 30 June), e.g. "2026-27". Done in the browser rather than at
   * build time so the default stays right without a rebuild. If the current
   * year has no rates yet, the dropdown keeps its first (latest) option.
   */
  selectCurrentTaxYear() {
    const today = new Date();
    const startYear = today.getMonth() >= 6 ? today.getFullYear() : today.getFullYear() - 1;
    const current = `${startYear}-${String(startYear + 1).slice(-2)}`;
    if (this.taxData.rates[current]) {
      this.inputs.taxYear.value = current;
    }
  }

  attachEventListeners() {
    // Handle form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.calculate()) {
        // Collapse the questions so the results take focus; the header reopens them
        bootstrap.Collapse.getOrCreateInstance(this.formSection).hide();
      }
    });

    // Thousand-separate the salary as the user types
    FinanceUtils.attachThousandsSeparator(this.inputs.annualSalary);
  }

  getSalary() {
    return FinanceUtils.parseAmount(this.inputs.annualSalary.value);
  }

  validate() {
    let isValid = true;

    // Validate annual salary
    if (!FinanceUtils.validateRequired(this.getSalary())) {
      FinanceUtils.setValidation(this.inputs.annualSalary, false, 'Annual salary is required and must be a positive number');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.annualSalary, true);
    }

    return isValid;
  }

  /**
   * Income tax on an amount for one year's brackets. The bracket is chosen by
   * its "over" threshold (the highest one the income exceeds), so incomes that
   * fall between one bracket's to_range and the next's from_range, such as
   * fractional dollars, still land in the right bracket.
   */
  incomeTax(income, brackets) {
    const bracket = brackets.reduce((match, b) => (income > b.over ? b : match), brackets[0]);
    return { tax: bracket.base + Math.max(0, income - bracket.over) * bracket.c, bracket };
  }

  calculate() {
    // Clear previous validation
    FinanceUtils.clearValidation(this.form);

    // Validate inputs
    if (!this.validate()) {
      return false;
    }

    // Parse input values
    const salary = this.getSalary();
    const sacrificePercent = parseFloat(this.inputs.salarySacrifice.value) || 0;
    const taxYear = this.inputs.taxYear.value;
    const includesSuper = this.inputs.includesSuper.value === 'yes';
    const payMedicareLevy = this.inputs.medicareLevy.value === 'yes';

    const taxYearData = this.taxData.rates[taxYear];
    const lookupData = this.taxData.lookup[taxYear];

    // Step 1: Split the salary into base pay and employer super. A salary that
    // includes super is the package; one that excludes it is the base pay.
    const superRate = lookupData.super;
    const grossSalary = includesSuper ? salary / (1 + superRate) : salary;
    const superAmount = grossSalary * superRate;
    const salaryPackage = grossSalary + superAmount;

    // Step 2: Calculate salary sacrifice
    const sacrificeAmount = grossSalary * (sacrificePercent / 100);
    const taxableIncome = grossSalary - sacrificeAmount;

    // Step 3: Calculate income tax (on taxable income after salary sacrifice)
    const { tax: incomeTax, bracket: taxBracket } = this.incomeTax(taxableIncome, taxYearData);

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
    const incomeTaxWithoutSacrifice = this.incomeTax(grossSalary, taxYearData).tax;

    const medicareWithoutSacrifice = payMedicareLevy ? grossSalary * lookupData.medicare_levy : 0;
    const totalTaxWithoutSacrifice = incomeTaxWithoutSacrifice + medicareWithoutSacrifice;
    const taxSavings = totalTaxWithoutSacrifice - totalTax;

    // Step 7: Calculate total superannuation
    const totalSuper = superAmount + sacrificeAmount;

    // Values are passed unrounded; formatCurrency rounds for display so the
    // periodic tabs are derived from exact annual figures.
    this.displayResults({
      baseSalary: grossSalary,
      salaryPackage,
      superRate,
      superAmount,
      sacrificePercent,
      sacrificeAmount,
      taxBracket,
      incomeTax,
      medicareRate: lookupData.medicare_levy,
      medicareAmount,
      taxSavings,
      totalSuper,
      takeHomeAnnual,
      taxYear
    });

    return true;
  }

  displayResults(results) {
    const pct = (rate) => `${parseFloat((rate * 100).toFixed(2))}%`;

    // Super is split out of the package under Income; everything else
    // reduces base salary to take-home pay.
    const expenses = [];
    if (results.sacrificeAmount > 0) {
      expenses.push([`Salary sacrifice (${pct(results.sacrificePercent / 100)})`, results.sacrificeAmount]);
    }
    expenses.push([`Income tax (${pct(results.taxBracket.c)} marginal rate)`, results.incomeTax]);
    if (results.medicareAmount > 0) {
      expenses.push([`Medicare levy (${pct(results.medicareRate)})`, results.medicareAmount]);
    }
    const totalExpenses = expenses.reduce((sum, [, amount]) => sum + amount, 0);

    // A ledger per tab, scaled from annual figures: itemised amounts sit in the
    // middle column, totals in the right, so base salary - total expenses = take-home.
    const breakdownTable = (divisor) => {
      const money = (annual) => FinanceUtils.formatCurrency(annual / divisor);
      const bold = (text) => `<strong>${text}</strong>`;
      const section = (title) => `
                  <tr class="table-light">
                    <th colspan="3" class="text-uppercase small text-muted">${title}</th>
                  </tr>`;
      const item = (label, annual) => `
                  <tr>
                    <td class="ps-4">${label}</td>
                    <td class="text-end">${money(annual)}</td>
                    <td></td>
                  </tr>`;
      const total = (label, annual, rowClass = '') => `
                  <tr class="${rowClass}">
                    <td>${bold(label)}</td>
                    <td></td>
                    <td class="text-end">${bold(money(annual))}</td>
                  </tr>`;

      return `
              <div class="table-responsive">
                <table class="table mb-0">
                  <thead class="table-success">
                    <tr><th>Component</th><th></th><th class="text-end">Amount</th></tr>
                  </thead>
                  <tbody>
                    ${section('Income')}
                    ${total('Salary package', results.salaryPackage)}
                    ${item(`Super (${pct(results.superRate)})`, results.superAmount)}
                    ${total('Base salary', results.baseSalary)}
                    ${section('Expenses')}
                    ${expenses.map(([label, amount]) => item(label, amount)).join('')}
                    ${total('Total expenses', totalExpenses)}
                    ${section('Net')}
                    ${total('Take-home pay', results.takeHomeAnnual, 'table-success')}
                  </tbody>
                </table>
              </div>`;
    };

    const tabs = [
      { id: 'breakdown-annual', label: 'Annual', divisor: 1 },
      { id: 'breakdown-monthly', label: 'Monthly', divisor: 12 },
      { id: 'breakdown-weekly', label: 'Weekly', divisor: 52 }
    ];

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
            <ul class="nav nav-tabs" role="tablist">
              ${tabs.map((tab, i) => `
              <li class="nav-item" role="presentation">
                <button class="nav-link${i === 0 ? ' active' : ''}" id="${tab.id}-tab" data-bs-toggle="tab"
                        data-bs-target="#${tab.id}" type="button" role="tab" aria-controls="${tab.id}"
                        aria-selected="${i === 0}">${tab.label}</button>
              </li>`).join('')}
            </ul>
            <div class="tab-content border border-top-0 rounded-bottom p-2 mb-3">
              ${tabs.map((tab, i) => `
              <div class="tab-pane fade${i === 0 ? ' show active' : ''}" id="${tab.id}" role="tabpanel"
                   aria-labelledby="${tab.id}-tab">
                ${breakdownTable(tab.divisor)}
              </div>`).join('')}
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
