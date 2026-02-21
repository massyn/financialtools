/**
 * Sell and Buy Another Calculator
 * Calculate the financial impact of selling one property and buying another
 */

class SellAndBuyCalculator {
  constructor() {
    // Cache DOM elements
    this.sellingForm = document.getElementById('sellingForm');
    this.buyingForm = document.getElementById('buyingForm');
    this.inputs = {
      salePrice: document.getElementById('salePrice'),
      outstandingLoan: document.getElementById('outstandingLoan'),
      agentCommission: document.getElementById('agentCommission'),
      sellingConveyancerCosts: document.getElementById('sellingConveyancerCosts'),
      currentRepayment: document.getElementById('currentRepayment'),
      purchasePrice: document.getElementById('purchasePrice'),
      interestRate: document.getElementById('interestRate'),
      loanTerm: document.getElementById('loanTerm'),
      state: document.getElementById('state'),
      buyingConveyancerCosts: document.getElementById('buyingConveyancerCosts')
    };
    this.resultsContainer = document.getElementById('resultsContainer');

    // Field IDs for URL sharing
    this.shareableFields = [
      'salePrice',
      'outstandingLoan',
      'agentCommission',
      'sellingConveyancerCosts',
      'currentRepayment',
      'purchasePrice',
      'interestRate',
      'loanTerm',
      'state',
      'buyingConveyancerCosts'
    ];

    // Load values from URL if present
    this.loadFromUrl();

    // Attach event listeners
    this.attachEventListeners();

    // Setup share button
    this.setupSharing();
  }

  /**
   * Load form values from URL parameters
   */
  loadFromUrl() {
    // Check if there are any URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const hasParams = urlParams.toString().length > 0;

    // Load the values
    FinanceUtils.loadFromUrlParams(this.shareableFields);

    // Auto-calculate if URL params were present
    if (hasParams) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        this.calculate();
      }, 100);
    }
  }

  /**
   * Setup share button functionality
   */
  setupSharing() {
    FinanceUtils.setupShareButton(this.shareableFields, 'shareButton');
  }

  attachEventListeners() {
    // Handle buying form submission (which triggers the calculation)
    this.buyingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.calculate();
    });
  }

  validate() {
    let isValid = true;
    const forms = [this.sellingForm, this.buyingForm];

    // Clear previous validation
    forms.forEach(form => FinanceUtils.clearValidation(form));

    // Validate sale price
    if (!FinanceUtils.validateRequired(this.inputs.salePrice.value)) {
      FinanceUtils.setValidation(this.inputs.salePrice, false, 'Sale price is required');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.salePrice, true);
    }

    // Validate outstanding loan
    if (!FinanceUtils.validateRequired(this.inputs.outstandingLoan.value)) {
      FinanceUtils.setValidation(this.inputs.outstandingLoan, false, 'Outstanding loan is required');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.outstandingLoan, true);
    }

    // Validate agent commission
    if (!FinanceUtils.validateRequired(this.inputs.agentCommission.value)) {
      FinanceUtils.setValidation(this.inputs.agentCommission, false, 'Agent commission is required');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.agentCommission, true);
    }

    // Validate purchase price
    if (!FinanceUtils.validateRequired(this.inputs.purchasePrice.value)) {
      FinanceUtils.setValidation(this.inputs.purchasePrice, false, 'Purchase price is required');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.purchasePrice, true);
    }

    // Validate interest rate
    if (!FinanceUtils.validateRequired(this.inputs.interestRate.value)) {
      FinanceUtils.setValidation(this.inputs.interestRate, false, 'Interest rate is required');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.interestRate, true);
    }

    // Validate loan term
    if (!FinanceUtils.validateRequired(this.inputs.loanTerm.value)) {
      FinanceUtils.setValidation(this.inputs.loanTerm, false, 'Loan term is required');
      isValid = false;
    } else {
      FinanceUtils.setValidation(this.inputs.loanTerm, true);
    }

    return isValid;
  }

  /**
   * Calculate stamp duty based on state and property price
   */
  calculateStampDuty(price, state) {
    const brackets = this.getStampDutyBrackets(state);

    for (let bracket of brackets) {
      if (price <= bracket.max || bracket.max === Infinity) {
        return bracket.base + (price - bracket.min) * bracket.rate;
      }
    }

    return 0;
  }

  /**
   * Get stamp duty brackets for each state
   * Source: State revenue offices (2026 rates for established homes)
   */
  getStampDutyBrackets(state) {
    const brackets = {
      'NSW': [
        { min: 0, max: 16000, base: 0, rate: 0.0125 },
        { min: 16000, max: 32000, base: 200, rate: 0.015 },
        { min: 32000, max: 85000, base: 440, rate: 0.0175 },
        { min: 85000, max: 319000, base: 1367.50, rate: 0.035 },
        { min: 319000, max: 1022000, base: 9557.50, rate: 0.045 },
        { min: 1022000, max: Infinity, base: 41192.50, rate: 0.055 }
      ],
      'VIC': [
        { min: 0, max: 25000, base: 0, rate: 0.014 },
        { min: 25000, max: 130000, base: 350, rate: 0.024 },
        { min: 130000, max: 960000, base: 2870, rate: 0.06 },
        { min: 960000, max: Infinity, base: 52670, rate: 0.055 }
      ],
      'QLD': [
        { min: 0, max: 5000, base: 0, rate: 0 },
        { min: 5000, max: 75000, base: 0, rate: 0.015 },
        { min: 75000, max: 540000, base: 1050, rate: 0.035 },
        { min: 540000, max: 1000000, base: 17325, rate: 0.045 },
        { min: 1000000, max: Infinity, base: 38025, rate: 0.0575 }
      ],
      'SA': [
        { min: 0, max: 12000, base: 0, rate: 0.01 },
        { min: 12000, max: 30000, base: 120, rate: 0.02 },
        { min: 30000, max: 50000, base: 480, rate: 0.03 },
        { min: 50000, max: 100000, base: 1080, rate: 0.035 },
        { min: 100000, max: 200000, base: 2830, rate: 0.04 },
        { min: 200000, max: 250000, base: 6830, rate: 0.045 },
        { min: 250000, max: 300000, base: 9080, rate: 0.05 },
        { min: 300000, max: 500000, base: 11580, rate: 0.055 },
        { min: 500000, max: Infinity, base: 22580, rate: 0.0575 }
      ],
      'WA': [
        { min: 0, max: 120000, base: 0, rate: 0.019 },
        { min: 120000, max: 150000, base: 2280, rate: 0.028 },
        { min: 150000, max: 360000, base: 3120, rate: 0.039 },
        { min: 360000, max: 725000, base: 11310, rate: 0.049 },
        { min: 725000, max: Infinity, base: 29195, rate: 0.051 }
      ],
      'TAS': [
        { min: 0, max: 3000, base: 50, rate: 0 },
        { min: 3000, max: 25000, base: 50, rate: 0.0175 },
        { min: 25000, max: 75000, base: 435, rate: 0.025 },
        { min: 75000, max: 200000, base: 1685, rate: 0.035 },
        { min: 200000, max: 375000, base: 6060, rate: 0.04 },
        { min: 375000, max: 725000, base: 13060, rate: 0.0425 },
        { min: 725000, max: Infinity, base: 27935, rate: 0.045 }
      ],
      'ACT': [
        { min: 0, max: 200000, base: 0, rate: 0 },
        { min: 200000, max: 300000, base: 0, rate: 0.0122 },
        { min: 300000, max: 500000, base: 1220, rate: 0.0298 },
        { min: 500000, max: 750000, base: 7180, rate: 0.0405 },
        { min: 750000, max: 1000000, base: 17305, rate: 0.0455 },
        { min: 1000000, max: 1455000, base: 28680, rate: 0.0495 },
        { min: 1455000, max: Infinity, base: 51202.50, rate: 0.059 }
      ],
      'NT': [
        { min: 0, max: 525000, base: 0, rate: 0 },
        { min: 525000, max: 3000000, base: 0, rate: 0.0495 },
        { min: 3000000, max: 5000000, base: 122512.50, rate: 0.0545 },
        { min: 5000000, max: Infinity, base: 231512.50, rate: 0.059 }
      ]
    };

    return brackets[state] || brackets['NSW'];
  }

  /**
   * Calculate transfer/registration fees
   * This is a simplified estimate - actual fees vary by state and circumstance
   */
  calculateTransferFees(state) {
    const fees = {
      'NSW': 150,
      'VIC': 110,
      'QLD': 200,
      'SA': 180,
      'WA': 170,
      'TAS': 150,
      'ACT': 440,
      'NT': 150
    };

    return fees[state] || 150;
  }

  /**
   * Calculate monthly loan payment using standard mortgage formula
   */
  calculateMonthlyPayment(principal, annualRate, years) {
    const monthlyRate = annualRate / 12;
    const numberOfPayments = years * 12;

    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }

    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  calculate() {
    // Validate inputs
    if (!this.validate()) {
      return;
    }

    // Parse selling inputs
    const salePrice = parseFloat(this.inputs.salePrice.value);
    const outstandingLoan = parseFloat(this.inputs.outstandingLoan.value);
    const agentCommission = parseFloat(this.inputs.agentCommission.value) / 100;
    const sellingConveyancerCosts = parseFloat(this.inputs.sellingConveyancerCosts.value) || 0;
    const currentRepayment = parseFloat(this.inputs.currentRepayment.value) || 0;

    // Calculate selling costs
    const commissionAmount = salePrice * agentCommission;
    const totalSellingCosts = commissionAmount + sellingConveyancerCosts;
    const netFromSale = salePrice - commissionAmount - sellingConveyancerCosts - outstandingLoan;

    // Parse buying inputs
    const purchasePrice = parseFloat(this.inputs.purchasePrice.value);
    const interestRate = parseFloat(this.inputs.interestRate.value) / 100;
    const loanTerm = parseFloat(this.inputs.loanTerm.value);
    const state = this.inputs.state.value;
    const buyingConveyancerCosts = parseFloat(this.inputs.buyingConveyancerCosts.value) || 0;

    // Calculate buying costs
    const stampDuty = this.calculateStampDuty(purchasePrice, state);
    const transferFees = this.calculateTransferFees(state);
    const totalBuyingCosts = stampDuty + transferFees + buyingConveyancerCosts;

    // Calculate new loan amount
    const deposit = netFromSale;
    const newLoanAmount = Math.max(0, purchasePrice + totalBuyingCosts - deposit);

    // Calculate monthly payment
    const monthlyPayment = this.calculateMonthlyPayment(newLoanAmount, interestRate, loanTerm);

    // Calculate deltas
    const loanDelta = newLoanAmount - outstandingLoan;
    const repaymentDelta = currentRepayment > 0 ? monthlyPayment - currentRepayment : null;

    // Display results
    this.displayResults({
      // Selling
      salePrice,
      commissionAmount,
      sellingConveyancerCosts,
      outstandingLoan,
      netFromSale,

      // Buying
      purchasePrice,
      stampDuty,
      transferFees,
      buyingConveyancerCosts,
      totalBuyingCosts,
      deposit,
      newLoanAmount,
      monthlyPayment,

      // Deltas
      loanDelta,
      repaymentDelta,
      currentRepayment,

      // Config
      state,
      interestRate,
      loanTerm
    });
  }

  displayResults(results) {
    const loanIncreased = results.loanDelta > 0;
    const repaymentIncreased = results.repaymentDelta !== null && results.repaymentDelta > 0;

    let html = `
      <div class="card mt-4 border-primary shadow">
        <div class="card-body">
          <h5 class="card-title text-primary mb-4"><i class="bi bi-clipboard-data"></i> Quick Snapshot</h5>

          <!-- Quick Summary Table -->
          <div class="table-responsive mb-4">
            <table class="table table-bordered">
              <thead class="table-light">
                <tr>
                  <th style="width: 30%">Item</th>
                  <th class="text-end" style="width: 23%">Current (Selling)</th>
                  <th class="text-end" style="width: 23%">New (Buying)</th>
                  <th class="text-end" style="width: 24%">Total Costs</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Property Value</strong></td>
                  <td class="text-end">${FinanceUtils.formatCurrency(results.salePrice)}</td>
                  <td class="text-end">${FinanceUtils.formatCurrency(results.purchasePrice)}</td>
                  <td class="text-end ${results.purchasePrice > results.salePrice ? 'text-success' : 'text-danger'}">
                    ${results.purchasePrice > results.salePrice ? '+' : ''}${FinanceUtils.formatCurrency(results.purchasePrice - results.salePrice)}
                  </td>
                </tr>
                <tr class="table-warning">
                  <td><strong>Transaction Costs</strong></td>
                  <td class="text-end text-danger">
                    ${FinanceUtils.formatCurrency(results.commissionAmount + results.sellingConveyancerCosts)}
                    <br><small class="text-muted">Agent + Conveyancing</small>
                  </td>
                  <td class="text-end text-danger">
                    ${FinanceUtils.formatCurrency(results.totalBuyingCosts)}
                    <br><small class="text-muted">Stamp + Transfer + Conveyancing</small>
                  </td>
                  <td class="text-end text-danger fw-bold">
                    ${FinanceUtils.formatCurrency(results.commissionAmount + results.sellingConveyancerCosts + results.totalBuyingCosts)}
                  </td>
                </tr>
                <tr>
                  <td><strong>Loan Balance</strong></td>
                  <td class="text-end">${FinanceUtils.formatCurrency(results.outstandingLoan)}</td>
                  <td class="text-end">${FinanceUtils.formatCurrency(results.newLoanAmount)}</td>
                  <td class="text-end ${loanIncreased ? 'text-danger' : 'text-success'} fw-bold">
                    ${loanIncreased ? '+' : ''}${FinanceUtils.formatCurrency(results.loanDelta)}
                    ${loanIncreased ? '<i class="bi bi-arrow-up"></i>' : '<i class="bi bi-arrow-down"></i>'}
                  </td>
                </tr>
                ${results.repaymentDelta !== null ? `
                <tr>
                  <td><strong>Monthly Repayment</strong></td>
                  <td class="text-end">${FinanceUtils.formatCurrency(results.currentRepayment)}</td>
                  <td class="text-end">${FinanceUtils.formatCurrency(results.monthlyPayment)}</td>
                  <td class="text-end ${repaymentIncreased ? 'text-danger' : 'text-success'} fw-bold">
                    ${repaymentIncreased ? '+' : ''}${FinanceUtils.formatCurrency(results.repaymentDelta)}
                    ${repaymentIncreased ? '<i class="bi bi-arrow-up"></i>' : '<i class="bi bi-arrow-down"></i>'}
                  </td>
                </tr>
                ` : ''}
                <tr class="table-info">
                  <td><strong>Cash from Sale</strong></td>
                  <td class="text-end">-</td>
                  <td class="text-end" colspan="2"><strong>${FinanceUtils.formatCurrency(results.netFromSale)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr class="my-4">
          <h5 class="text-secondary mb-3"><i class="bi bi-file-earmark-text"></i> Detailed Breakdown</h5>

          <!-- Selling Summary -->
          <div class="mb-4">
            <h6 class="text-danger"><i class="bi bi-house-dash"></i> Sale Proceeds</h6>
            <div class="table-responsive">
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td>Sale Price</td>
                    <td class="text-end fw-bold">${FinanceUtils.formatCurrency(results.salePrice)}</td>
                  </tr>
                  <tr>
                    <td>Agent Commission (${(results.commissionAmount / results.salePrice * 100).toFixed(2)}%)</td>
                    <td class="text-end text-danger">-${FinanceUtils.formatCurrency(results.commissionAmount)}</td>
                  </tr>
                  <tr>
                    <td>Conveyancer Costs</td>
                    <td class="text-end text-danger">-${FinanceUtils.formatCurrency(results.sellingConveyancerCosts)}</td>
                  </tr>
                  <tr>
                    <td>Outstanding Loan</td>
                    <td class="text-end text-danger">-${FinanceUtils.formatCurrency(results.outstandingLoan)}</td>
                  </tr>
                  <tr class="table-success">
                    <td><strong>Net Proceeds</strong></td>
                    <td class="text-end fw-bold">${FinanceUtils.formatCurrency(results.netFromSale)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Buying Summary -->
          <div class="mb-4">
            <h6 class="text-success"><i class="bi bi-house-add"></i> New Purchase (${results.state})</h6>
            <div class="table-responsive">
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td>Purchase Price</td>
                    <td class="text-end fw-bold">${FinanceUtils.formatCurrency(results.purchasePrice)}</td>
                  </tr>
                  <tr>
                    <td>Stamp Duty (${results.state})</td>
                    <td class="text-end text-danger">+${FinanceUtils.formatCurrency(results.stampDuty)}</td>
                  </tr>
                  <tr>
                    <td>Transfer Fees</td>
                    <td class="text-end text-danger">+${FinanceUtils.formatCurrency(results.transferFees)}</td>
                  </tr>
                  <tr>
                    <td>Conveyancer Costs</td>
                    <td class="text-end text-danger">+${FinanceUtils.formatCurrency(results.buyingConveyancerCosts)}</td>
                  </tr>
                  <tr>
                    <td><strong>Total Cost</strong></td>
                    <td class="text-end fw-bold">${FinanceUtils.formatCurrency(results.purchasePrice + results.totalBuyingCosts)}</td>
                  </tr>
                  <tr class="table-info">
                    <td>Deposit (from sale proceeds)</td>
                    <td class="text-end text-success">-${FinanceUtils.formatCurrency(results.deposit)}</td>
                  </tr>
                  <tr class="table-warning">
                    <td><strong>New Loan Required</strong></td>
                    <td class="text-end fw-bold">${FinanceUtils.formatCurrency(results.newLoanAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Loan Comparison -->
          <div class="mb-4">
            <h6 class="text-primary"><i class="bi bi-arrow-left-right"></i> Loan Comparison</h6>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th class="text-end">Previous</th>
                    <th class="text-end">New</th>
                    <th class="text-end">Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Loan Balance</strong></td>
                    <td class="text-end">${FinanceUtils.formatCurrency(results.outstandingLoan)}</td>
                    <td class="text-end">${FinanceUtils.formatCurrency(results.newLoanAmount)}</td>
                    <td class="text-end ${loanIncreased ? 'text-danger' : 'text-success'} fw-bold">
                      ${loanIncreased ? '+' : ''}${FinanceUtils.formatCurrency(results.loanDelta)}
                      ${loanIncreased ? '<i class="bi bi-arrow-up"></i>' : '<i class="bi bi-arrow-down"></i>'}
                    </td>
                  </tr>
    `;

    if (results.repaymentDelta !== null) {
      html += `
                  <tr>
                    <td><strong>Monthly Repayment</strong></td>
                    <td class="text-end">${FinanceUtils.formatCurrency(results.currentRepayment)}</td>
                    <td class="text-end">${FinanceUtils.formatCurrency(results.monthlyPayment)}</td>
                    <td class="text-end ${repaymentIncreased ? 'text-danger' : 'text-success'} fw-bold">
                      ${repaymentIncreased ? '+' : ''}${FinanceUtils.formatCurrency(results.repaymentDelta)}
                      ${repaymentIncreased ? '<i class="bi bi-arrow-up"></i>' : '<i class="bi bi-arrow-down"></i>'}
                    </td>
                  </tr>
      `;
    } else {
      html += `
                  <tr>
                    <td><strong>New Monthly Repayment</strong></td>
                    <td class="text-end" colspan="2">-</td>
                    <td class="text-end fw-bold">${FinanceUtils.formatCurrency(results.monthlyPayment)}</td>
                  </tr>
      `;
    }

    html += `
                </tbody>
              </table>
            </div>
          </div>

          <!-- Key Insights -->
          <div class="alert alert-info">
            <h6 class="alert-heading"><i class="bi bi-info-circle"></i> Key Insights</h6>
            <ul class="mb-0">
              <li>Your net proceeds from the sale are <strong>${FinanceUtils.formatCurrency(results.netFromSale)}</strong></li>
              <li>Your new loan will be <strong>${FinanceUtils.formatCurrency(results.newLoanAmount)}</strong> over ${results.loanTerm} years at ${(results.interestRate * 100).toFixed(2)}%</li>
              ${results.deposit >= (results.purchasePrice + results.totalBuyingCosts)
                ? '<li class="text-success"><strong>Great news!</strong> You can purchase the property without a mortgage.</li>'
                : `<li>Monthly repayment will be <strong>${FinanceUtils.formatCurrency(results.monthlyPayment)}</strong></li>`
              }
              ${loanIncreased
                ? `<li class="text-warning">Your loan will increase by <strong>${FinanceUtils.formatCurrency(results.loanDelta)}</strong></li>`
                : `<li class="text-success">Your loan will decrease by <strong>${FinanceUtils.formatCurrency(Math.abs(results.loanDelta))}</strong></li>`
              }
              ${results.repaymentDelta !== null && repaymentIncreased
                ? `<li class="text-warning">Your monthly repayments will increase by <strong>${FinanceUtils.formatCurrency(results.repaymentDelta)}</strong></li>`
                : results.repaymentDelta !== null && !repaymentIncreased
                ? `<li class="text-success">Your monthly repayments will decrease by <strong>${FinanceUtils.formatCurrency(Math.abs(results.repaymentDelta))}</strong></li>`
                : ''
              }
            </ul>
          </div>

          <!-- Additional Costs Note -->
          <div class="alert alert-secondary">
            <small>
              <strong>Note:</strong> This calculation includes stamp duty, transfer fees, and conveyancing costs but does not include other costs such as:
              building and pest inspections, removalist costs, or any loan application fees.
              Please consult with your financial advisor for a complete cost analysis.
            </small>
          </div>
        </div>
      </div>
    `;

    this.resultsContainer.innerHTML = html;
  }
}

// Initialize calculator on page load
document.addEventListener('DOMContentLoaded', () => {
  new SellAndBuyCalculator();
});
