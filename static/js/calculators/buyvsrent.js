/**
 * Buy vs Rent Calculator
 * Compares true housing costs and wealth accumulation over loan term
 */

let spendingChart = null;
        let wealthChart = null;
        let monthlyPaymentChart = null;

        function validate() {
            let isValid = true;
            const form = document.getElementById('buyVsRentForm');

            // Clear previous validation
            FinanceUtils.clearValidation(form);

            // Validate property price
            const propertyPrice = document.getElementById('propertyPrice');
            if (!FinanceUtils.validateRequired(propertyPrice.value)) {
                FinanceUtils.setValidation(propertyPrice, false, 'Property price is required and must be positive');
                isValid = false;
            } else {
                FinanceUtils.setValidation(propertyPrice, true);
            }

            // Validate loan term
            const loanTerm = document.getElementById('loanTerm');
            if (!FinanceUtils.validateRequired(loanTerm.value)) {
                FinanceUtils.setValidation(loanTerm, false, 'Loan term is required and must be positive');
                isValid = false;
            } else {
                FinanceUtils.setValidation(loanTerm, true);
            }

            // Validate interest rate
            const interestRate = document.getElementById('interestRate');
            if (!FinanceUtils.validateRequired(interestRate.value)) {
                FinanceUtils.setValidation(interestRate, false, 'Interest rate is required and must be positive');
                isValid = false;
            } else {
                FinanceUtils.setValidation(interestRate, true);
            }

            // Validate weekly rent
            const weeklyRent = document.getElementById('weeklyRent');
            if (!FinanceUtils.validateRequired(weeklyRent.value)) {
                FinanceUtils.setValidation(weeklyRent, false, 'Weekly rent is required and must be positive');
                isValid = false;
            } else {
                FinanceUtils.setValidation(weeklyRent, true);
            }

            // Validate investment amount
            const investmentAmount = document.getElementById('investmentAmount');
            if (!FinanceUtils.validateRequired(investmentAmount.value)) {
                FinanceUtils.setValidation(investmentAmount, false, 'Investment amount is required and must be positive');
                isValid = false;
            } else {
                FinanceUtils.setValidation(investmentAmount, true);
            }

            return isValid;
        }

        function updateWeeklyCosts() {
            const propertyPrice = parseFloat(document.getElementById('propertyPrice').value);
            const loanTerm = parseFloat(document.getElementById('loanTerm').value);
            const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;
            const councilRates = parseFloat(document.getElementById('councilRates').value);
            const insurance = parseFloat(document.getElementById('insurance').value);
            const maintenance = parseFloat(document.getElementById('maintenance').value);
            const weeklyRent = parseFloat(document.getElementById('weeklyRent').value);

            // Get investment amount and convert to weekly if needed
            const investmentAmount = parseFloat(document.getElementById('investmentAmount').value);
            const investmentFrequency = document.getElementById('investmentFrequency').value;
            const weeklyInvestment = investmentFrequency === 'monthly' ? (investmentAmount * 12 / 52) : investmentAmount;

            const monthlyRate = interestRate / 12;
            const numPayments = loanTerm * 12;
            const monthlyPayment = propertyPrice * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                                   (Math.pow(1 + monthlyRate, numPayments) - 1);
            const weeklyMortgage = (monthlyPayment * 12) / 52;
            const weeklyOther = (councilRates + insurance + maintenance) / 52;
            const buyingWeekly = weeklyMortgage + weeklyOther;

            // Update buying labels
            document.getElementById('monthlyMortgage').textContent = '$' + monthlyPayment.toFixed(0);
            document.getElementById('weeklyMortgage').textContent = '$' + weeklyMortgage.toFixed(0);
            document.getElementById('buyingWeeklyCost').textContent = '$' + buyingWeekly.toFixed(0);

            // Update renting labels
            document.getElementById('weeklyRentDisplay').textContent = '$' + weeklyRent.toFixed(0);
            document.getElementById('weeklyInvestmentDisplay').textContent = '$' + weeklyInvestment.toFixed(0);
            document.getElementById('rentingWeeklyCost').textContent = '$' + (weeklyRent + weeklyInvestment).toFixed(0);

            // Calculate how much renter needs to contribute to match buyer's payment
            const contributionToMatch = buyingWeekly - weeklyRent;
            if (contributionToMatch > 0) {
                document.getElementById('investmentHelper').innerHTML =
                    `💡 <strong>To match the buyer's weekly payment of $${buyingWeekly.toFixed(0)}:</strong><br>` +
                    `You need to contribute <strong>$${contributionToMatch.toFixed(0)}/week</strong> on top of rent.<br>` +
                    `<span style="font-size: 11px;">(Currently investing: $${weeklyInvestment.toFixed(0)}/week)</span>`;
            } else {
                document.getElementById('investmentHelper').innerHTML =
                    `✓ Rent alone exceeds the buyer's weekly payment.`;
            }
        }

        function calculate() {
            // Validate inputs
            if (!validate()) {
                return;
            }

            // Get inputs
            const cpiRate = parseFloat(document.getElementById('cpiRate').value) / 100;
            const propertyPrice = parseFloat(document.getElementById('propertyPrice').value);
            const loanTerm = parseFloat(document.getElementById('loanTerm').value);
            const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;
            const councilRates = parseFloat(document.getElementById('councilRates').value);
            const insurance = parseFloat(document.getElementById('insurance').value);
            const maintenance = parseFloat(document.getElementById('maintenance').value);
            const weeklyRent = parseFloat(document.getElementById('weeklyRent').value);
            const rentIncrease = parseFloat(document.getElementById('rentIncrease').value) / 100;
            const propertyGrowth = parseFloat(document.getElementById('propertyGrowth').value) / 100;

            // Get investment amount and convert to weekly if needed
            const investmentAmount = parseFloat(document.getElementById('investmentAmount').value);
            const investmentFrequency = document.getElementById('investmentFrequency').value;
            const weeklyInvestment = investmentFrequency === 'monthly' ? (investmentAmount * 12 / 52) : investmentAmount;

            const investmentIncrease = parseFloat(document.getElementById('investmentIncrease').value) / 100;
            const investmentReturn = parseFloat(document.getElementById('investmentReturn').value) / 100;

            updateWeeklyCosts();

            // Calculate mortgage payment (P&I over loan term)
            const monthlyRate = interestRate / 12;
            const numPayments = loanTerm * 12;
            const monthlyPayment = propertyPrice * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                                   (Math.pow(1 + monthlyRate, numPayments) - 1);
            const annualMortgagePayment = monthlyPayment * 12;

            // Calculate year by year
            const years = [];
            const buyingCumulativeSpending = [];
            const rentingCumulativeSpending = [];  // Rent + investments
            const buyingWealth = [];
            const rentingWealth = [];
            const buyingMonthlyPayment = [];
            const rentingMonthlyPayment = [];

            let totalCashSpentBuying = 0;  // All mortgage payments (principal + interest)
            let totalCashSpentRenting = 0;  // All rent paid
            let totalInvestedByRenter = 0;  // All investments made by renter
            let cumulativeRenterCashOut = 0;  // Running total of rent + investments
            let totalInterestPaid = 0;
            let totalPrincipalPaid = 0;
            let totalRatesInsuranceMaintenance = 0;
            let loanBalance = propertyPrice;
            let currentRent = weeklyRent * 52;
            let propertyValue = propertyPrice;
            let renterInvestmentBalance = 0;
            let currentInvestment = weeklyInvestment * 52;  // Annual investment (will increase each year)

            for (let year = 1; year <= loanTerm; year++) {
                // BUYING
                let yearInterest = 0;
                let yearPrincipal = 0;

                // Calculate interest and principal for each month of the year
                for (let month = 0; month < 12; month++) {
                    const monthInterest = loanBalance * monthlyRate;
                    const monthPrincipal = monthlyPayment - monthInterest;
                    yearInterest += monthInterest;
                    yearPrincipal += monthPrincipal;
                    loanBalance -= monthPrincipal;
                }

                totalInterestPaid += yearInterest;
                totalPrincipalPaid += yearPrincipal;
                totalRatesInsuranceMaintenance += councilRates + insurance + maintenance;

                // Total cash spent (all mortgage payments + ongoing costs)
                totalCashSpentBuying += annualMortgagePayment + councilRates + insurance + maintenance;

                // Property appreciation
                propertyValue *= (1 + propertyGrowth);

                // RENTING
                totalCashSpentRenting += currentRent;

                // Renter invests specified amount (increases each year)
                totalInvestedByRenter += currentInvestment;
                renterInvestmentBalance = (renterInvestmentBalance + currentInvestment) * (1 + investmentReturn);
                cumulativeRenterCashOut = totalCashSpentRenting + totalInvestedByRenter;

                // Track data for charts
                years.push(year);
                buyingCumulativeSpending.push(totalCashSpentBuying);
                rentingCumulativeSpending.push(cumulativeRenterCashOut);  // Rent + investments
                buyingWealth.push(propertyValue);  // Property value (asset)
                rentingWealth.push(renterInvestmentBalance);  // Investment portfolio

                // Monthly payments (for comparison chart) - use current year's values
                const buyingMonthly = (annualMortgagePayment + councilRates + insurance + maintenance) / 12;
                const rentingMonthly = (currentRent + currentInvestment) / 12;  // Rent + investment for this year
                buyingMonthlyPayment.push(buyingMonthly);
                rentingMonthlyPayment.push(rentingMonthly);

                // Increase for next year
                currentRent *= (1 + rentIncrease);
                currentInvestment *= (1 + investmentIncrease);
            }

            // Final year calculations
            const finalPropertyValue = propertyValue;
            const totalHousingCostBuying = totalInterestPaid + totalRatesInsuranceMaintenance;
            const capitalGainedBuying = finalPropertyValue - propertyPrice;
            const investmentGainedRenting = renterInvestmentBalance - totalInvestedByRenter;

            const buyerNetPosition = finalPropertyValue - totalHousingCostBuying;
            const renterNetPosition = renterInvestmentBalance - totalCashSpentRenting;
            const totalRenterCashOut = totalCashSpentRenting + totalInvestedByRenter;

            const winner = buyerNetPosition > renterNetPosition ? 'buying' : 'renting';
            const advantage = Math.abs(buyerNetPosition - renterNetPosition);

            // CPI Adjusted values (convert future dollars to today's purchasing power)
            const cpiMultiplier = Math.pow(1 + cpiRate, loanTerm);
            const propertyValueCPIAdjusted = finalPropertyValue / cpiMultiplier;
            const investmentPortfolioCPIAdjusted = renterInvestmentBalance / cpiMultiplier;
            const buyerNetPositionCPIAdjusted = buyerNetPosition / cpiMultiplier;
            const renterNetPositionCPIAdjusted = renterNetPosition / cpiMultiplier;
            const winnerCPIAdjusted = buyerNetPositionCPIAdjusted > renterNetPositionCPIAdjusted ? 'buying' : 'renting';
            const advantageCPIAdjusted = Math.abs(buyerNetPositionCPIAdjusted - renterNetPositionCPIAdjusted);

            // Year after loan term calculations
            const nextYearBuyingCost = councilRates + insurance + maintenance;
            const nextYearRentCost = weeklyRent * 52 * Math.pow(1 + rentIncrease, loanTerm);
            const nextYearDifference = nextYearRentCost - nextYearBuyingCost;
            const tenYearSavings = nextYearDifference * 10;

            // Display winner banner
            const winnerBannerHtml = `
                <div class="winner-banner">
                    <h2>${winner === 'buying' ? '🏠 Buying Wins' : '🏢 Renting Wins'}</h2>
                    <div class="amount">$${advantage.toLocaleString('en-AU', {maximumFractionDigits: 0})}</div>
                    <div class="subtext">Better net wealth position after ${loanTerm} years</div>
                </div>
            `;
            document.getElementById('winnerBanner').innerHTML = winnerBannerHtml;

            // Display simple summary
            const simpleSummaryHtml = `
                <tr class="section-header">
                    <td></td>
                    <td>🏠 Buying</td>
                    <td>🏢 Renting</td>
                </tr>
                <tr>
                    <td><strong>Total paid over ${loanTerm} years</strong></td>
                    <td>$${totalCashSpentBuying.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td>$${totalCashSpentRenting.toLocaleString('en-AU', {maximumFractionDigits: 0})}<br><span style="font-size: 13px; color: #666;">Rent only</span></td>
                </tr>
                <tr>
                    <td><strong>Invested</strong></td>
                    <td>—</td>
                    <td>$${totalInvestedByRenter.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
                <tr>
                    <td><strong>Asset value (year ${loanTerm})</strong></td>
                    <td>$${finalPropertyValue.toLocaleString('en-AU', {maximumFractionDigits: 0})}<br><span style="font-size: 13px; color: #666;">Property value</span></td>
                    <td>$${renterInvestmentBalance.toLocaleString('en-AU', {maximumFractionDigits: 0})}<br><span style="font-size: 13px; color: #666;">Investment portfolio</span></td>
                </tr>
                <tr>
                    <td><strong>Capital gained</strong></td>
                    <td>$${capitalGainedBuying.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td>$${investmentGainedRenting.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>NET POSITION</strong><br><span style="font-size: 13px; font-weight: normal; color: #666;">Assets minus housing costs</span></td>
                    <td class="${winner === 'buying' ? 'winner' : 'loser'}" style="font-size: 20px;">${buyerNetPosition >= 0 ? '+' : ''}$${buyerNetPosition.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td class="${winner === 'renting' ? 'winner' : 'loser'}" style="font-size: 20px;">${renterNetPosition >= 0 ? '+' : ''}$${renterNetPosition.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
            `;
            document.getElementById('simpleSummary').innerHTML = simpleSummaryHtml;

            // Display CPI-adjusted summary
            document.getElementById('cpiRateDisplay').textContent = (cpiRate * 100).toFixed(1);
            const cpiAdjustedSummaryHtml = `
                <tr class="section-header">
                    <td></td>
                    <td>🏠 Buying</td>
                    <td>🏢 Renting</td>
                </tr>
                <tr>
                    <td><strong>Nominal value (year ${loanTerm})</strong></td>
                    <td>$${finalPropertyValue.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td>$${renterInvestmentBalance.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
                <tr>
                    <td><strong>Real value (in today's dollars)</strong></td>
                    <td>$${propertyValueCPIAdjusted.toLocaleString('en-AU', {maximumFractionDigits: 0})}<br><span style="font-size: 13px; color: #666;">What you can actually buy with it</span></td>
                    <td>$${investmentPortfolioCPIAdjusted.toLocaleString('en-AU', {maximumFractionDigits: 0})}<br><span style="font-size: 13px; color: #666;">What you can actually buy with it</span></td>
                </tr>
                <tr>
                    <td><strong>Inflation impact</strong></td>
                    <td style="color: #dc3545;">-$${(finalPropertyValue - propertyValueCPIAdjusted).toLocaleString('en-AU', {maximumFractionDigits: 0})}<br><span style="font-size: 13px; color: #666;">(${((1 - propertyValueCPIAdjusted/finalPropertyValue) * 100).toFixed(0)}% lost to inflation)</span></td>
                    <td style="color: #dc3545;">-$${(renterInvestmentBalance - investmentPortfolioCPIAdjusted).toLocaleString('en-AU', {maximumFractionDigits: 0})}<br><span style="font-size: 13px; color: #666;">(${((1 - investmentPortfolioCPIAdjusted/renterInvestmentBalance) * 100).toFixed(0)}% lost to inflation)</span></td>
                </tr>
                <tr class="total-row">
                    <td><strong>REAL NET POSITION</strong><br><span style="font-size: 13px; font-weight: normal; color: #666;">After inflation adjustment</span></td>
                    <td class="${winnerCPIAdjusted === 'buying' ? 'winner' : 'loser'}" style="font-size: 20px;">${buyerNetPositionCPIAdjusted >= 0 ? '+' : ''}$${buyerNetPositionCPIAdjusted.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td class="${winnerCPIAdjusted === 'renting' ? 'winner' : 'loser'}" style="font-size: 20px;">${renterNetPositionCPIAdjusted >= 0 ? '+' : ''}$${renterNetPositionCPIAdjusted.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
                <tr>
                    <td colspan="3" style="text-align: center; padding: 15px; background: #fffbeb; font-size: 14px; color: #92400e;">
                        <strong>Reality Check:</strong> ${winnerCPIAdjusted === winner ?
                            `Even after inflation, <strong>${winnerCPIAdjusted}</strong> still wins by $${advantageCPIAdjusted.toLocaleString('en-AU', {maximumFractionDigits: 0})} in real purchasing power.` :
                            `⚠️ The winner changes! After CPI adjustment, <strong>${winnerCPIAdjusted}</strong> actually wins by $${advantageCPIAdjusted.toLocaleString('en-AU', {maximumFractionDigits: 0})} in real terms.`}
                    </td>
                </tr>
            `;
            document.getElementById('cpiAdjustedSummary').innerHTML = cpiAdjustedSummaryHtml;

            // Update detailed summary title
            document.getElementById('detailedSummaryTitle').textContent = `${loanTerm}-Year Detailed Summary`;

            // Display detailed summary table
            const summaryTableHtml = `
                <tr class="section-header">
                    <td></td>
                    <td>🏠 Buying</td>
                    <td>🏢 Renting</td>
                </tr>
                <tr>
                    <td><strong>Total Cash Out (${loanTerm} years)</strong></td>
                    <td>$${totalCashSpentBuying.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td>$${totalRenterCashOut.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
                <tr>
                    <td style="padding-left: 30px; font-size: 14px; color: #666;">└─ Mortgage principal</td>
                    <td style="font-size: 14px; color: #666;">$${totalPrincipalPaid.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td style="font-size: 14px; color: #666;">—</td>
                </tr>
                <tr>
                    <td style="padding-left: 30px; font-size: 14px; color: #666;">└─ Mortgage interest</td>
                    <td style="font-size: 14px; color: #666;">$${totalInterestPaid.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td style="font-size: 14px; color: #666;">—</td>
                </tr>
                <tr>
                    <td style="padding-left: 30px; font-size: 14px; color: #666;">└─ Rates, insurance, maintenance</td>
                    <td style="font-size: 14px; color: #666;">$${totalRatesInsuranceMaintenance.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td style="font-size: 14px; color: #666;">—</td>
                </tr>
                <tr>
                    <td style="padding-left: 30px; font-size: 14px; color: #666;">└─ Rent paid</td>
                    <td style="font-size: 14px; color: #666;">—</td>
                    <td style="font-size: 14px; color: #666;">$${totalCashSpentRenting.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
                <tr>
                    <td style="padding-left: 30px; font-size: 14px; color: #666;">└─ Invested</td>
                    <td style="font-size: 14px; color: #666;">—</td>
                    <td style="font-size: 14px; color: #666;">$${totalInvestedByRenter.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
                <tr class="section-header">
                    <td><strong>What You Own After ${loanTerm} Years</strong></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td style="padding-left: 30px;">Property value</td>
                    <td>$${finalPropertyValue.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td>$0</td>
                </tr>
                <tr>
                    <td style="padding-left: 30px;">Investment portfolio</td>
                    <td>$0</td>
                    <td>$${renterInvestmentBalance.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
                <tr>
                    <td style="padding-left: 30px; font-size: 14px; color: #666;">└─ Capital gained</td>
                    <td style="font-size: 14px; color: #666;">$${capitalGainedBuying.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td style="font-size: 14px; color: #666;">$${(renterInvestmentBalance > 0 ? renterInvestmentBalance : 0).toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
                <tr class="section-header">
                    <td><strong>True Housing Cost</strong></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td style="padding-left: 30px; font-size: 14px; color: #666;">Money lost to housing</td>
                    <td style="font-size: 14px; color: #666;">$${totalHousingCostBuying.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td style="font-size: 14px; color: #666;">$${totalCashSpentRenting.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
                <tr class="total-row ${winner === 'buying' ? '' : ''}">
                    <td><strong>NET POSITION (Assets - Housing Cost)</strong></td>
                    <td class="${winner === 'buying' ? 'winner' : 'loser'}">$${buyerNetPosition.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td class="${winner === 'renting' ? 'winner' : 'loser'}">$${renterNetPosition.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
            `;
            document.getElementById('summaryTable').innerHTML = summaryTableHtml;

            // Display future comparison
            const futureComparisonHtml = `
                <h3>📅 What Happens After Year ${loanTerm}?</h3>
                <div class="comparison-row">
                    <span>Year ${loanTerm + 1} housing cost (Buyer):</span>
                    <span>$${nextYearBuyingCost.toLocaleString('en-AU', {maximumFractionDigits: 0})}/year</span>
                </div>
                <div class="comparison-row">
                    <span>Year ${loanTerm + 1} housing cost (Renter):</span>
                    <span>$${nextYearRentCost.toLocaleString('en-AU', {maximumFractionDigits: 0})}/year</span>
                </div>
                <div class="comparison-row">
                    <span>Annual savings by owning:</span>
                    <span>$${nextYearDifference.toLocaleString('en-AU', {maximumFractionDigits: 0})}/year</span>
                </div>
                <div class="comparison-row">
                    <span>10-year savings (years ${loanTerm + 1}-${loanTerm + 10}):</span>
                    <span>$${tenYearSavings.toLocaleString('en-AU', {maximumFractionDigits: 0})}</span>
                </div>
            `;
            document.getElementById('futureComparison').innerHTML = `<div class="future-comparison">${futureComparisonHtml}</div>`;

            // Display detailed breakdown comparison table
            const detailedBreakdownHtml = `
                <tr class="section-header">
                    <td></td>
                    <td>🏠 Buying</td>
                    <td>🏢 Renting</td>
                </tr>
                <tr class="section-header">
                    <td colspan="3"><strong>Cash Flow Summary</strong></td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Mortgage payments (P&I)</td>
                    <td>$${(annualMortgagePayment * loanTerm).toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td>—</td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Rates, insurance, maintenance</td>
                    <td>$${totalRatesInsuranceMaintenance.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td>—</td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Rent paid</td>
                    <td>—</td>
                    <td>$${totalCashSpentRenting.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Investments</td>
                    <td>—</td>
                    <td>$${totalInvestedByRenter.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
                <tr style="background: #f8f9fa; font-weight: 600;">
                    <td style="padding-left: 20px;"><strong>Total Cash Out</strong></td>
                    <td><strong>$${totalCashSpentBuying.toLocaleString('en-AU', {maximumFractionDigits: 0})}</strong></td>
                    <td><strong>$${totalRenterCashOut.toLocaleString('en-AU', {maximumFractionDigits: 0})}</strong></td>
                </tr>
                <tr class="section-header">
                    <td colspan="3"><strong>What Went Where (Money Lost)</strong></td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Principal payments (built equity)</td>
                    <td>$${totalPrincipalPaid.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td>—</td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Mortgage interest</td>
                    <td>$${totalInterestPaid.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td>—</td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Rates, insurance, maintenance</td>
                    <td>$${totalRatesInsuranceMaintenance.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td>—</td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Rent paid</td>
                    <td>—</td>
                    <td>$${totalCashSpentRenting.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
                <tr style="background: #f8f9fa; font-weight: 600;">
                    <td style="padding-left: 20px;"><strong>True Housing Cost (not recovered)</strong></td>
                    <td><strong>$${totalHousingCostBuying.toLocaleString('en-AU', {maximumFractionDigits: 0})}</strong></td>
                    <td><strong>$${totalCashSpentRenting.toLocaleString('en-AU', {maximumFractionDigits: 0})}</strong></td>
                </tr>
                <tr class="section-header">
                    <td colspan="3"><strong>Wealth Accumulation</strong></td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Property value (start)</td>
                    <td>$${propertyPrice.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td>—</td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Property value (year ${loanTerm})</td>
                    <td>$${finalPropertyValue.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td>—</td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Property capital gain</td>
                    <td>$${capitalGainedBuying.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                    <td>—</td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Total invested</td>
                    <td>—</td>
                    <td>$${totalInvestedByRenter.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Investment gains</td>
                    <td>—</td>
                    <td>$${investmentGainedRenting.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Investment portfolio value</td>
                    <td>—</td>
                    <td>$${renterInvestmentBalance.toLocaleString('en-AU', {maximumFractionDigits: 0})}</td>
                </tr>
                <tr style="background: #f8f9fa; font-weight: 600;">
                    <td style="padding-left: 20px;"><strong>Total Assets (year ${loanTerm})</strong></td>
                    <td><strong>$${finalPropertyValue.toLocaleString('en-AU', {maximumFractionDigits: 0})}</strong></td>
                    <td><strong>$${renterInvestmentBalance.toLocaleString('en-AU', {maximumFractionDigits: 0})}</strong></td>
                </tr>
            `;
            document.getElementById('detailedBreakdown').innerHTML = detailedBreakdownHtml;

            // Display insights
            const cashOutDiff = totalCashSpentBuying - totalRenterCashOut;
            const housingCostDiff = totalHousingCostBuying - totalCashSpentRenting;
            const wealthDiff = finalPropertyValue - renterInvestmentBalance;
            const insightsHtml = `
                <div class="insight-box">
                    <h4>💡 Key Insights</h4>
                    <p><strong>Total cash out:</strong> The buyer spent $${totalCashSpentBuying.toLocaleString('en-AU', {maximumFractionDigits: 0})} over ${loanTerm} years, while the renter spent $${totalRenterCashOut.toLocaleString('en-AU', {maximumFractionDigits: 0})} (rent + investments). ${cashOutDiff > 0 ? 'The buyer spent $' + cashOutDiff.toLocaleString('en-AU', {maximumFractionDigits: 0}) + ' more.' : 'The renter spent $' + Math.abs(cashOutDiff).toLocaleString('en-AU', {maximumFractionDigits: 0}) + ' more.'}</p>
                    <p><strong>True housing cost (money lost):</strong> The buyer lost $${totalHousingCostBuying.toLocaleString('en-AU', {maximumFractionDigits: 0})} to interest and ongoing costs. The renter lost $${totalCashSpentRenting.toLocaleString('en-AU', {maximumFractionDigits: 0})} to rent. ${housingCostDiff > 0 ? 'The buyer lost $' + housingCostDiff.toLocaleString('en-AU', {maximumFractionDigits: 0}) + ' more to housing costs.' : 'The renter lost $' + Math.abs(housingCostDiff).toLocaleString('en-AU', {maximumFractionDigits: 0}) + ' more to housing costs.'}</p>
                    <p><strong>Wealth accumulation:</strong> The buyer owns a property worth $${finalPropertyValue.toLocaleString('en-AU', {maximumFractionDigits: 0})} (gained $${capitalGainedBuying.toLocaleString('en-AU', {maximumFractionDigits: 0})} in appreciation). The renter has investments worth $${renterInvestmentBalance.toLocaleString('en-AU', {maximumFractionDigits: 0})} (gained $${investmentGainedRenting.toLocaleString('en-AU', {maximumFractionDigits: 0})} in returns). ${wealthDiff > 0 ? 'The buyer has $' + wealthDiff.toLocaleString('en-AU', {maximumFractionDigits: 0}) + ' more in assets.' : 'The renter has $' + Math.abs(wealthDiff).toLocaleString('en-AU', {maximumFractionDigits: 0}) + ' more in assets.'}</p>
                    <p><strong>The future:</strong> From year ${loanTerm + 1} onwards, the buyer pays only $${nextYearBuyingCost.toLocaleString('en-AU', {maximumFractionDigits: 0})}/year in ongoing costs (no mortgage). The renter still pays $${nextYearRentCost.toLocaleString('en-AU', {maximumFractionDigits: 0})}/year in rent (with ongoing increases). That's $${nextYearDifference.toLocaleString('en-AU', {maximumFractionDigits: 0})}/year saved by owning, or $${tenYearSavings.toLocaleString('en-AU', {maximumFractionDigits: 0})} over the next 10 years.</p>
                </div>
            `;
            document.getElementById('insights').innerHTML = insightsHtml;

            document.getElementById('results').style.display = 'block';

            // Draw spending chart
            const spendingCtx = document.getElementById('spendingChart').getContext('2d');

            if (spendingChart) {
                spendingChart.destroy();
            }

            spendingChart = new Chart(spendingCtx, {
                type: 'line',
                data: {
                    labels: years,
                    datasets: [{
                        label: 'Buying (mortgage + costs)',
                        data: buyingCumulativeSpending,
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        tension: 0.1,
                        fill: true
                    }, {
                        label: 'Renting (rent + investments)',
                        data: rentingCumulativeSpending,
                        borderColor: '#ffc107',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                callback: function(value) {
                                    return '$' + (value / 1000).toFixed(0) + 'k';
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Year'
                            }
                        }
                    }
                }
            });

            // Draw wealth chart
            const wealthCtx = document.getElementById('wealthChart').getContext('2d');

            if (wealthChart) {
                wealthChart.destroy();
            }

            wealthChart = new Chart(wealthCtx, {
                type: 'line',
                data: {
                    labels: years,
                    datasets: [{
                        label: 'Buying (property value)',
                        data: buyingWealth,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0.1,
                        fill: true
                    }, {
                        label: 'Renting (investment portfolio)',
                        data: rentingWealth,
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                callback: function(value) {
                                    return '$' + (value / 1000).toFixed(0) + 'k';
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Year'
                            }
                        }
                    }
                }
            });

            // Draw monthly payment chart
            const monthlyPaymentCtx = document.getElementById('monthlyPaymentChart').getContext('2d');

            if (monthlyPaymentChart) {
                monthlyPaymentChart.destroy();
            }

            monthlyPaymentChart = new Chart(monthlyPaymentCtx, {
                type: 'line',
                data: {
                    labels: years,
                    datasets: [{
                        label: 'Buying (mortgage + rates/insurance/maintenance)',
                        data: buyingMonthlyPayment,
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        tension: 0.1,
                        borderWidth: 3
                    }, {
                        label: 'Renting (rent + investment)',
                        data: rentingMonthlyPayment,
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        tension: 0.1,
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Total Monthly Outlay (cash going out each month)'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString('en-AU', {maximumFractionDigits: 0});
                                }
                            },
                            title: {
                                display: true,
                                text: 'Monthly Cost'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Year'
                            }
                        }
                    }
                }
            });
        }

        // Update investment label when frequency changes
        document.getElementById('investmentFrequency').addEventListener('change', function() {
            const frequency = this.value;
            const label = document.getElementById('investmentAmountLabel');
            label.textContent = frequency === 'weekly' ? 'Weekly Investment Amount ($)' : 'Monthly Investment Amount ($)';
            updateWeeklyCosts();
        });

        // Add event listeners for live updates
        const inputs = ['cpiRate', 'propertyPrice', 'loanTerm', 'interestRate', 'councilRates', 'insurance', 'maintenance',
                       'weeklyRent', 'investmentAmount', 'investmentIncrease', 'investmentFrequency'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', updateWeeklyCosts);
        });
