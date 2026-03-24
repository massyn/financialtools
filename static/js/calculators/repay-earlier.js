/**
 * Repay Earlier Calculator
 * Helps users understand the impact of extra repayments or target payoff dates
 */

class RepayEarlierCalculator {
  constructor() {
    this.form = document.getElementById('loanDetailsForm');
    this.tab1Btn = document.getElementById('tab-extra');
    this.tab2Btn = document.getElementById('tab-target');
    this.panel1 = document.getElementById('panel-extra');
    this.panel2 = document.getElementById('panel-target');
    this.calcExtraBtn = document.getElementById('calcExtraBtn');
    this.calcTargetBtn = document.getElementById('calcTargetBtn');
    this.resultsContainer = document.getElementById('resultsContainer');

    this.activeTab = 'extra';
    this.attachEventListeners();
  }

  attachEventListeners() {
    this.tab1Btn.addEventListener('click', () => this.switchTab('extra'));
    this.tab2Btn.addEventListener('click', () => this.switchTab('target'));
    this.calcExtraBtn.addEventListener('click', () => this.calculateExtra());
    this.calcTargetBtn.addEventListener('click', () => this.calculateTarget());
  }

  switchTab(tab) {
    this.activeTab = tab;
    this.resultsContainer.innerHTML = '';

    if (tab === 'extra') {
      this.tab1Btn.classList.add('active');
      this.tab2Btn.classList.remove('active');
      this.panel1.classList.remove('d-none');
      this.panel2.classList.add('d-none');
    } else {
      this.tab2Btn.classList.add('active');
      this.tab1Btn.classList.remove('active');
      this.panel2.classList.remove('d-none');
      this.panel1.classList.add('d-none');
    }
  }

  getLoanDetails() {
    return {
      principal: parseFloat(document.getElementById('loanAmount').value),
      annualRate: parseFloat(document.getElementById('interestRate').value),
      termYears: parseFloat(document.getElementById('loanTerm').value),
      frequency: document.getElementById('paymentFrequency').value
    };
  }

  validateLoanDetails(d) {
    let ok = true;
    const fields = [
      ['loanAmount', d.principal, 'Loan amount is required'],
      ['interestRate', d.annualRate, 'Interest rate is required'],
      ['loanTerm', d.termYears, 'Loan term is required']
    ];
    for (const [id, val, msg] of fields) {
      const el = document.getElementById(id);
      if (!val || val <= 0 || isNaN(val)) {
        FinanceUtils.setValidation(el, false, msg);
        ok = false;
      } else {
        FinanceUtils.setValidation(el, true);
      }
    }
    return ok;
  }

  // Standard amortisation payment formula
  calcBasePayment(principal, monthlyRate, totalMonths) {
    if (monthlyRate === 0) return principal / totalMonths;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
           (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  // Simulate amortisation, return { months, totalInterest }
  simulateLoan(principal, monthlyRate, monthlyPayment) {
    let balance = principal;
    let totalInterest = 0;
    let months = 0;
    const MAX = 1200; // 100 years safety cap
    while (balance > 0.01 && months < MAX) {
      const interest = balance * monthlyRate;
      totalInterest += interest;
      const principalPaid = monthlyPayment - interest;
      balance -= principalPaid;
      months++;
    }
    return { months, totalInterest };
  }

  // Convert monthly payment/values to the display frequency
  toFrequency(monthlyAmount, frequency) {
    return frequency === 'weekly' ? monthlyAmount * 12 / 52 : monthlyAmount;
  }

  calculateExtra() {
    FinanceUtils.clearValidation(document.getElementById('loanDetailsForm'));
    FinanceUtils.clearValidation(document.getElementById('extraForm'));

    const d = this.getLoanDetails();
    if (!this.validateLoanDetails(d)) return;

    const extraPerPeriodEl = document.getElementById('extraPayment');
    const extraPerPeriod = parseFloat(extraPerPeriodEl.value);
    if (!extraPerPeriod || extraPerPeriod <= 0 || isNaN(extraPerPeriod)) {
      FinanceUtils.setValidation(extraPerPeriodEl, false, 'Extra repayment amount is required');
      return;
    }
    FinanceUtils.setValidation(extraPerPeriodEl, true);

    const { principal, annualRate, termYears, frequency } = d;
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = termYears * 12;

    const baseMonthlyPayment = this.calcBasePayment(principal, monthlyRate, totalMonths);
    // Convert extra to monthly equivalent
    const extraMonthly = frequency === 'weekly' ? extraPerPeriod * 52 / 12 : extraPerPeriod;
    const newMonthlyPayment = baseMonthlyPayment + extraMonthly;

    const base = this.simulateLoan(principal, monthlyRate, baseMonthlyPayment);
    const withExtra = this.simulateLoan(principal, monthlyRate, newMonthlyPayment);

    const monthsSaved = base.months - withExtra.months;
    const interestSaved = base.totalInterest - withExtra.totalInterest;

    this.displayExtraResults({
      frequency,
      basePayment: this.toFrequency(baseMonthlyPayment, frequency),
      newPayment: this.toFrequency(newMonthlyPayment, frequency),
      extraPerPeriod,
      originalMonths: base.months,
      newMonths: withExtra.months,
      monthsSaved,
      originalInterest: base.totalInterest,
      newInterest: withExtra.totalInterest,
      interestSaved
    });
  }

  calculateTarget() {
    FinanceUtils.clearValidation(document.getElementById('loanDetailsForm'));
    FinanceUtils.clearValidation(document.getElementById('targetForm'));

    const d = this.getLoanDetails();
    if (!this.validateLoanDetails(d)) return;

    const targetYearsEl = document.getElementById('targetYears');
    const targetYears = parseFloat(targetYearsEl.value);
    if (!targetYears || targetYears <= 0 || isNaN(targetYears)) {
      FinanceUtils.setValidation(targetYearsEl, false, 'Target term is required');
      return;
    }
    if (targetYears >= d.termYears) {
      FinanceUtils.setValidation(targetYearsEl, false, `Target must be less than the original term of ${d.termYears} years`);
      return;
    }
    FinanceUtils.setValidation(targetYearsEl, true);

    const { principal, annualRate, termYears, frequency } = d;
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = termYears * 12;
    const targetMonths = targetYears * 12;

    const baseMonthlyPayment = this.calcBasePayment(principal, monthlyRate, totalMonths);
    const targetMonthlyPayment = this.calcBasePayment(principal, monthlyRate, targetMonths);
    const extraMonthly = targetMonthlyPayment - baseMonthlyPayment;

    const base = this.simulateLoan(principal, monthlyRate, baseMonthlyPayment);
    const target = this.simulateLoan(principal, monthlyRate, targetMonthlyPayment);

    const monthsSaved = base.months - target.months;
    const interestSaved = base.totalInterest - target.totalInterest;

    this.displayTargetResults({
      frequency,
      basePayment: this.toFrequency(baseMonthlyPayment, frequency),
      targetPayment: this.toFrequency(targetMonthlyPayment, frequency),
      extraPerPeriod: this.toFrequency(extraMonthly, frequency),
      originalMonths: base.months,
      targetMonths: target.months,
      targetYears,
      monthsSaved,
      originalInterest: base.totalInterest,
      targetInterest: target.totalInterest,
      interestSaved
    });
  }

  formatMonths(months) {
    const y = Math.floor(months / 12);
    const m = Math.round(months % 12);
    if (m === 0) return `${y} year${y !== 1 ? 's' : ''}`;
    return `${y} year${y !== 1 ? 's' : ''}, ${m} month${m !== 1 ? 's' : ''}`;
  }

  displayExtraResults(r) {
    const freqLabel = r.frequency === 'weekly' ? 'Weekly' : 'Monthly';

    const html = `
      <div class="mt-4">
        <div class="card border-success shadow-sm">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0"><i class="bi bi-graph-down-arrow"></i> Extra Repayment Impact</h5>
          </div>
          <div class="card-body">

            <div class="row g-3 mb-4">
              <div class="col-12 col-md-4">
                <div class="card bg-light text-center h-100">
                  <div class="card-body">
                    <div class="text-muted small mb-1">Time Saved</div>
                    <div class="h4 text-success fw-bold">${this.formatMonths(r.monthsSaved)}</div>
                    <div class="text-muted small">From ${this.formatMonths(r.originalMonths)} down to ${this.formatMonths(r.newMonths)}</div>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="card bg-light text-center h-100">
                  <div class="card-body">
                    <div class="text-muted small mb-1">Interest Saved</div>
                    <div class="h4 text-success fw-bold">${FinanceUtils.formatCurrency(r.interestSaved)}</div>
                    <div class="text-muted small">Total interest reduced</div>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="card bg-light text-center h-100">
                  <div class="card-body">
                    <div class="text-muted small mb-1">New ${freqLabel} Payment</div>
                    <div class="h4 text-primary fw-bold">${FinanceUtils.formatCurrency(r.newPayment)}</div>
                    <div class="text-muted small">Up from ${FinanceUtils.formatCurrency(r.basePayment)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-striped">
                <thead class="table-light">
                  <tr>
                    <th></th>
                    <th class="text-center">Standard Loan</th>
                    <th class="text-center bg-success-subtle">With Extra Repayments</th>
                    <th class="text-center">Saving</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>${freqLabel} Payment</strong></td>
                    <td class="text-center">${FinanceUtils.formatCurrency(r.basePayment)}</td>
                    <td class="text-center">${FinanceUtils.formatCurrency(r.newPayment)}</td>
                    <td class="text-center text-danger">+${FinanceUtils.formatCurrency(r.extraPerPeriod)}</td>
                  </tr>
                  <tr>
                    <td><strong>Loan Term</strong></td>
                    <td class="text-center">${this.formatMonths(r.originalMonths)}</td>
                    <td class="text-center">${this.formatMonths(r.newMonths)}</td>
                    <td class="text-center text-success fw-bold">${this.formatMonths(r.monthsSaved)} less</td>
                  </tr>
                  <tr>
                    <td><strong>Total Interest</strong></td>
                    <td class="text-center">${FinanceUtils.formatCurrency(r.originalInterest)}</td>
                    <td class="text-center">${FinanceUtils.formatCurrency(r.newInterest)}</td>
                    <td class="text-center text-success fw-bold">${FinanceUtils.formatCurrency(r.interestSaved)} saved</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    `;

    this.resultsContainer.innerHTML = html;
    this.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  displayTargetResults(r) {
    const freqLabel = r.frequency === 'weekly' ? 'Weekly' : 'Monthly';

    const html = `
      <div class="mt-4">
        <div class="card border-primary shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0"><i class="bi bi-flag"></i> Target Payoff Plan</h5>
          </div>
          <div class="card-body">

            <div class="row g-3 mb-4">
              <div class="col-12 col-md-4">
                <div class="card bg-light text-center h-100">
                  <div class="card-body">
                    <div class="text-muted small mb-1">Extra Per ${freqLabel === 'Weekly' ? 'Week' : 'Month'}</div>
                    <div class="h4 text-primary fw-bold">${FinanceUtils.formatCurrency(r.extraPerPeriod)}</div>
                    <div class="text-muted small">On top of your regular payment</div>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="card bg-light text-center h-100">
                  <div class="card-body">
                    <div class="text-muted small mb-1">Interest Saved</div>
                    <div class="h4 text-success fw-bold">${FinanceUtils.formatCurrency(r.interestSaved)}</div>
                    <div class="text-muted small">By finishing ${this.formatMonths(r.monthsSaved)} earlier</div>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="card bg-light text-center h-100">
                  <div class="card-body">
                    <div class="text-muted small mb-1">New ${freqLabel} Payment</div>
                    <div class="h4 text-primary fw-bold">${FinanceUtils.formatCurrency(r.targetPayment)}</div>
                    <div class="text-muted small">Up from ${FinanceUtils.formatCurrency(r.basePayment)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-striped">
                <thead class="table-light">
                  <tr>
                    <th></th>
                    <th class="text-center">Standard Loan</th>
                    <th class="text-center bg-primary-subtle">Target: ${r.targetYears} Years</th>
                    <th class="text-center">Saving</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>${freqLabel} Payment</strong></td>
                    <td class="text-center">${FinanceUtils.formatCurrency(r.basePayment)}</td>
                    <td class="text-center">${FinanceUtils.formatCurrency(r.targetPayment)}</td>
                    <td class="text-center text-danger">+${FinanceUtils.formatCurrency(r.extraPerPeriod)} extra</td>
                  </tr>
                  <tr>
                    <td><strong>Loan Term</strong></td>
                    <td class="text-center">${this.formatMonths(r.originalMonths)}</td>
                    <td class="text-center">${this.formatMonths(r.targetMonths)}</td>
                    <td class="text-center text-success fw-bold">${this.formatMonths(r.monthsSaved)} less</td>
                  </tr>
                  <tr>
                    <td><strong>Total Interest</strong></td>
                    <td class="text-center">${FinanceUtils.formatCurrency(r.originalInterest)}</td>
                    <td class="text-center">${FinanceUtils.formatCurrency(r.targetInterest)}</td>
                    <td class="text-center text-success fw-bold">${FinanceUtils.formatCurrency(r.interestSaved)} saved</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    `;

    this.resultsContainer.innerHTML = html;
    this.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new RepayEarlierCalculator();
});
