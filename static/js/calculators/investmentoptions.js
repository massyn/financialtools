/**
 * Investment Options Calculator
 * Compares different investment strategies (mattress, savings, ETFs, super)
 */

class InvestmentOptionsCalculator {
    constructor() {
        // Cache DOM elements
        this.form = document.getElementById('investmentOptionsForm');
        this.inputs = {
            investmentAmount: document.getElementById('investmentAmount'),
            investmentFrequency: document.getElementById('investmentFrequency'),
            investmentYears: document.getElementById('investmentYears'),
            savingsRate: document.getElementById('savingsRate'),
            etfRate: document.getElementById('etfRate'),
            superRate: document.getElementById('superRate'),
            marginalTaxRate: document.getElementById('marginalTaxRate')
        };
        this.resultsContainer = document.getElementById('results');

        // Chart instances
        this.charts = {
            summary: null,
            comparison: null,
            individual: []
        };

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

        // Validate investment amount
        if (!FinanceUtils.validateRequired(this.inputs.investmentAmount.value)) {
            FinanceUtils.setValidation(this.inputs.investmentAmount, false, 'Investment amount is required and must be positive');
            isValid = false;
        } else {
            FinanceUtils.setValidation(this.inputs.investmentAmount, true);
        }

        // Validate investment years
        if (!FinanceUtils.validateRequired(this.inputs.investmentYears.value)) {
            FinanceUtils.setValidation(this.inputs.investmentYears, false, 'Investment period is required and must be positive');
            isValid = false;
        } else {
            FinanceUtils.setValidation(this.inputs.investmentYears, true);
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
        const amount = parseFloat(this.inputs.investmentAmount.value);
        const frequency = this.inputs.investmentFrequency.value;
        const years = parseFloat(this.inputs.investmentYears.value);

        // Parse parameter values
        const savingsRate = parseFloat(this.inputs.savingsRate.value) / 100;
        const etfRate = parseFloat(this.inputs.etfRate.value) / 100;
        const superRate = parseFloat(this.inputs.superRate.value) / 100;
        const marginalTaxRate = parseFloat(this.inputs.marginalTaxRate.value) / 100;

        // Build investment types with user parameters
        const investmentTypes = [
            {
                name: 'Under a Mattress',
                rate: 0,
                taxRate: 0,
                description: 'No investment returns',
                color: '#6c757d'
            },
            {
                name: 'Savings Account',
                rate: savingsRate,
                taxRate: marginalTaxRate,
                description: `${(savingsRate * 100).toFixed(1)}% p.a. (interest taxed at ${(marginalTaxRate * 100).toFixed(1)}%)`,
                color: '#0dcaf0'
            },
            {
                name: 'ETFs',
                rate: etfRate,
                taxRate: marginalTaxRate * 0.5, // 50% CGT discount
                description: `${(etfRate * 100).toFixed(1)}% p.a. (CGT at ${(marginalTaxRate * 50).toFixed(1)}%)`,
                color: '#0d6efd'
            },
            {
                name: 'Superannuation',
                rate: superRate,
                taxRate: 0.15, // Super earnings taxed at 15%
                description: `${(superRate * 100).toFixed(1)}% p.a. (earnings taxed at 15%)`,
                color: '#198754'
            }
        ];

        // Calculate monthly contribution (all calculations use monthly)
        const monthlyContribution = frequency === 'weekly' ? (amount * 52 / 12) : amount;
        const totalMonths = years * 12;
        const totalSaved = monthlyContribution * totalMonths;

        // Calculate results for each investment type (with yearly breakdown)
        const results = investmentTypes.map(type => {
            const yearlyData = this.calculateYearlyGrowth(monthlyContribution, type.rate, type.taxRate, years);
            const finalValue = yearlyData[yearlyData.length - 1].balance;
            const returns = finalValue - totalSaved;
            const taxPaid = yearlyData[yearlyData.length - 1].totalTaxPaid;

            return {
                name: type.name,
                rate: type.rate,
                taxRate: type.taxRate,
                description: type.description,
                color: type.color,
                totalSaved: totalSaved,
                returns: returns,
                finalValue: finalValue,
                taxPaid: taxPaid,
                yearlyData: yearlyData
            };
        });

        // Find best option (excluding mattress)
        const investmentOptions = results.slice(1); // Skip mattress
        const bestOption = investmentOptions.reduce((best, current) =>
            current.finalValue > best.finalValue ? current : best
        );

        // Calculate maximum gain vs mattress
        const mattressValue = results[0].finalValue;
        const maxGain = bestOption.finalValue - mattressValue;

        // Display results
        this.displayResults(results, bestOption, maxGain, {
            amount,
            frequency,
            years,
            totalSaved
        });
    }

    calculateFutureValue(monthlyContribution, annualRate, totalMonths) {
        if (annualRate === 0) {
            // No returns (mattress)
            return monthlyContribution * totalMonths;
        }

        const monthlyRate = annualRate / 12;

        // Future value of annuity formula: PMT * [((1 + r)^n - 1) / r]
        const futureValue = monthlyContribution *
            (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;

        return futureValue;
    }

    calculateYearlyGrowth(monthlyContribution, annualRate, taxRate, years) {
        const yearlyData = [];
        const monthlyRate = annualRate / 12;
        let balance = 0;
        let contributions = 0;
        let totalTaxPaid = 0;

        // Year 0
        yearlyData.push({
            year: 0,
            contributions: 0,
            balance: 0,
            returns: 0,
            taxPaid: 0,
            totalTaxPaid: 0
        });

        for (let year = 1; year <= years; year++) {
            let yearStartBalance = balance;
            let yearContributions = 0;

            for (let month = 1; month <= 12; month++) {
                contributions += monthlyContribution;
                yearContributions += monthlyContribution;

                if (annualRate > 0) {
                    // Add contribution and growth
                    const growth = (balance + monthlyContribution) * monthlyRate;
                    balance = balance + monthlyContribution + growth;
                } else {
                    balance = contributions;
                }
            }

            // Calculate tax on investment returns for the year
            const yearReturns = balance - yearStartBalance - yearContributions;
            const yearTax = yearReturns > 0 ? yearReturns * taxRate : 0;
            balance -= yearTax;
            totalTaxPaid += yearTax;

            yearlyData.push({
                year: year,
                contributions: contributions,
                balance: balance,
                returns: balance - contributions,
                taxPaid: yearTax,
                totalTaxPaid: totalTaxPaid
            });
        }

        return yearlyData;
    }

    displayResults(results, bestOption, maxGain, inputs) {
        // Update summary text
        const frequencyText = inputs.frequency === 'weekly' ? 'week' : 'month';
        document.getElementById('summaryText').textContent =
            `Investing ${FinanceUtils.formatCurrency(inputs.amount)} per ${frequencyText} for ${inputs.years} years`;

        // Build comparison table
        const mattressValue = results[0].finalValue;
        let tableHtml = '';

        results.forEach(result => {
            const differenceVsMattress = result.finalValue - mattressValue;
            const isMattress = result.name === 'Under a Mattress';
            const isBest = result.name === bestOption.name;
            const isSuper = result.name === 'Superannuation';
            const rowClass = isBest ? 'table-success' : '';

            tableHtml += `
                <tr class="${rowClass}">
                    <td>
                        <strong>${result.name}</strong>
                        ${isBest ? '<span class="badge bg-success ms-2">Best Option</span>' : ''}
                        ${isSuper ? '<br><small class="text-warning"><i class="bi bi-exclamation-triangle"></i> Subject to contribution limits and access restrictions</small>' : ''}
                        <br><small class="text-muted">${result.description}</small>
                    </td>
                    <td>${result.rate === 0 ? '0%' : (result.rate * 100).toFixed(1) + '% p.a.'}</td>
                    <td class="text-end ${result.returns > 0 ? 'text-success' : ''}">
                        ${result.returns > 0 ? '+' : ''}${FinanceUtils.formatCurrency(result.returns)}
                    </td>
                    <td class="text-end ${result.taxPaid > 0 ? 'text-danger' : 'text-muted'}">
                        ${result.taxPaid > 0 ? '-' : ''}${FinanceUtils.formatCurrency(result.taxPaid)}
                    </td>
                    <td class="text-end"><strong>${FinanceUtils.formatCurrency(result.finalValue)}</strong></td>
                    <td class="text-end ${differenceVsMattress > 0 ? 'text-success fw-bold' : 'text-muted'}">
                        ${isMattress ? '-' : '+' + FinanceUtils.formatCurrency(differenceVsMattress)}
                    </td>
                </tr>
            `;
        });

        document.getElementById('comparisonBody').innerHTML = tableHtml;

        // Update best option cards
        document.getElementById('bestOption').textContent = bestOption.name;
        document.getElementById('bestValue').textContent =
            `Final value: ${FinanceUtils.formatCurrency(bestOption.finalValue)}`;
        document.getElementById('maxGain').textContent =
            FinanceUtils.formatCurrency(maxGain);

        // Show results
        this.resultsContainer.style.display = 'block';

        // Draw charts
        this.drawCharts(results, inputs.years);
    }

    drawCharts(results, years) {
        // Destroy existing charts
        if (this.charts.summary) {
            this.charts.summary.destroy();
        }
        if (this.charts.comparison) {
            this.charts.comparison.destroy();
        }
        this.charts.individual.forEach(chart => chart.destroy());
        this.charts.individual = [];

        // Draw comparison bar chart (right below the table)
        const comparisonCtx = document.getElementById('comparisonBarChart').getContext('2d');
        this.charts.comparison = new Chart(comparisonCtx, {
            type: 'bar',
            data: {
                labels: results.map(r => r.name),
                datasets: [
                    {
                        label: 'Contributions',
                        data: results.map(r => r.totalSaved),
                        backgroundColor: '#ffc107',
                        borderColor: '#ffc107',
                        borderWidth: 1
                    },
                    {
                        label: 'Investment Returns (After Tax)',
                        data: results.map(r => r.returns),
                        backgroundColor: results.map(r => r.color),
                        borderColor: results.map(r => r.color),
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += '$' + context.parsed.y.toLocaleString('en-AU', {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                });
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + (value / 1000).toFixed(0) + 'k';
                            }
                        }
                    }
                }
            }
        });

        // Prepare data for summary chart
        const labels = Array.from({length: years + 1}, (_, i) => `Year ${i}`);

        // Draw summary chart (all options together)
        const summaryCtx = document.getElementById('summaryChart').getContext('2d');
        const summaryDatasets = results.map(result => ({
            label: result.name,
            data: result.yearlyData.map(d => d.balance),
            borderColor: result.color,
            backgroundColor: result.color + '20',
            tension: 0.1,
            fill: true
        }));

        this.charts.summary = new Chart(summaryCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: summaryDatasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Investment Growth Comparison'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + (value / 1000).toFixed(0) + 'k';
                            }
                        }
                    }
                }
            }
        });

        // Draw individual charts for each option
        const chartsContainer = document.getElementById('individualChartsContainer');
        chartsContainer.innerHTML = '';

        results.forEach((result, index) => {
            const chartDiv = document.createElement('div');
            chartDiv.className = 'col-md-6 mb-4';
            chartDiv.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">${result.name}</h6>
                        <div style="height: 250px;">
                            <canvas id="individualChart${index}"></canvas>
                        </div>
                    </div>
                </div>
            `;
            chartsContainer.appendChild(chartDiv);

            // Create chart
            const ctx = document.getElementById(`individualChart${index}`).getContext('2d');
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Contributions',
                            data: result.yearlyData.map(d => d.contributions),
                            borderColor: '#ffc107',
                            backgroundColor: '#ffc10720',
                            tension: 0.1,
                            fill: true
                        },
                        {
                            label: 'Total Value',
                            data: result.yearlyData.map(d => d.balance),
                            borderColor: result.color,
                            backgroundColor: result.color + '20',
                            tension: 0.1,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                boxWidth: 12,
                                font: {
                                    size: 11
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + (value / 1000).toFixed(0) + 'k';
                                },
                                font: {
                                    size: 10
                                }
                            }
                        },
                        x: {
                            ticks: {
                                font: {
                                    size: 10
                                }
                            }
                        }
                    }
                }
            });

            this.charts.individual.push(chart);
        });
    }
}

// Initialize calculator on page load
document.addEventListener('DOMContentLoaded', () => {
    new InvestmentOptionsCalculator();
});
