/**
 * Loan Repayment Calculator charts (Chart.js)
 * Colours come from the validated categorical palette, so each pair stays
 * distinguishable for colour-blind readers. Borrowed/principal and interest
 * keep the same colours in every chart; the two scenarios get their own pair.
 */

const LoanCharts = {
  colours: {
    borrowed: '#2a78d6',
    interest: '#eb6834',
    standard: '#6250d6',
    withExtra: '#1baf7a',
    surface: '#ffffff',
    text: '#52514e',
    grid: '#e9ecef'
  },

  compactMoney: new Intl.NumberFormat('en-AU', {
    style: 'currency', currency: 'AUD', notation: 'compact', maximumFractionDigits: 1
  }),

  /** Shared axis styling: recessive grid, muted text, no axis border line. */
  axis(options = {}) {
    return {
      border: { display: false },
      grid: { color: this.colours.grid },
      ticks: { color: this.colours.text },
      ...options
    };
  },

  legend() {
    return {
      position: 'top',
      align: 'start',
      labels: { color: this.colours.text, usePointStyle: true, pointStyle: 'rectRounded', boxWidth: 10 }
    };
  },

  /**
   * Group a monthly amortisation schedule into loan years.
   * @returns {Array<{year: number, principal: number, interest: number, balance: number}>}
   */
  byYear(schedule) {
    const years = [];
    schedule.forEach((row) => {
      const index = Math.ceil(row.month / 12) - 1;
      years[index] ??= { year: index + 1, principal: 0, interest: 0, balance: 0 };
      years[index].principal += row.principal;
      years[index].interest += row.interest;
      years[index].balance = row.balance;
    });
    return years;
  },

  instances: {},

  /**
   * Draw a chart into a canvas, replacing any chart already drawn there
   * (results are re-rendered on every calculation).
   */
  render(canvasId, config) {
    this.instances[canvasId]?.destroy();
    this.instances[canvasId] = new Chart(document.getElementById(canvasId), config);
  },

  /**
   * Total cost of the loan: one horizontal bar per scenario, stacking the
   * amount borrowed and the interest paid on it, with the total at the bar end.
   * @param {string} canvasId - Canvas element ID
   * @param {Array<{label: string, borrowed: number, interest: number}>} scenarios
   */
  totalCost(canvasId, scenarios) {
    const c = this.colours;
    const money = (value) => FinanceUtils.formatCurrency(value);
    const compact = new Intl.NumberFormat('en-AU', {
      style: 'currency', currency: 'AUD', notation: 'compact', maximumFractionDigits: 1
    });

    // Label each bar with its total just past the end of the bar
    const totalLabels = {
      id: 'totalLabels',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const lastBars = chart.getDatasetMeta(chart.data.datasets.length - 1).data;
        ctx.save();
        ctx.fillStyle = c.text;
        ctx.font = '600 13px system-ui, sans-serif';
        ctx.textBaseline = 'middle';
        lastBars.forEach((bar, i) => {
          ctx.fillText(money(scenarios[i].borrowed + scenarios[i].interest), bar.x + 8, bar.y);
        });
        ctx.restore();
      }
    };

    this.render(canvasId, {
      type: 'bar',
      data: {
        labels: scenarios.map(s => s.label),
        datasets: [
          {
            label: 'Borrowed',
            data: scenarios.map(s => s.borrowed),
            backgroundColor: c.borrowed
          },
          {
            label: 'Interest',
            data: scenarios.map(s => s.interest),
            backgroundColor: c.interest,
            // 2px surface gap from the borrowed segment, rounded data end
            borderColor: c.surface,
            borderWidth: { left: 2, top: 0, right: 0, bottom: 0 },
            borderSkipped: false,
            borderRadius: { topRight: 4, bottomRight: 4 }
          }
        ]
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        maxBarThickness: 36,
        layout: { padding: { right: 90 } },
        interaction: { mode: 'index', axis: 'y', intersect: false },
        scales: {
          x: {
            stacked: true,
            beginAtZero: true,
            border: { display: false },
            grid: { color: c.grid },
            ticks: { color: c.text, callback: (value) => compact.format(value) }
          },
          y: {
            stacked: true,
            border: { display: false },
            grid: { display: false },
            ticks: { color: c.text, font: { weight: '600' } }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'start',
            labels: { color: c.text, usePointStyle: true, pointStyle: 'rectRounded', boxWidth: 10 }
          },
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.dataset.label}: ${money(item.raw)}`,
              footer: (items) => `Total: ${money(items.reduce((sum, item) => sum + item.raw, 0))}`
            }
          }
        }
      },
      plugins: [totalLabels]
    });
  },

  /**
   * Loan balance at the end of each year, one line per scenario. A line stops
   * once its loan is paid off, and is labelled at its end.
   * @param {string} canvasId - Canvas element ID
   * @param {number} principal - Amount borrowed (the balance at year 0)
   * @param {number} termYears - Loan term, which sets the x axis length
   * @param {Array<{label: string, colour: string, schedule: Array}>} scenarios
   */
  balanceOverTime(canvasId, principal, termYears, scenarios) {
    const c = this.colours;
    const money = (value) => FinanceUtils.formatCurrency(value);
    const years = Array.from({ length: Math.ceil(termYears) + 1 }, (_, year) => year);

    const datasets = scenarios.map((scenario) => {
      const balances = [principal, ...this.byYear(scenario.schedule).map(y => y.balance)];
      return {
        label: scenario.label,
        data: years.map(year => (year < balances.length ? balances[year] : null)),
        borderColor: scenario.colour,
        backgroundColor: scenario.colour,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBorderColor: c.surface,
        pointHoverBorderWidth: 2,
        tension: 0
      };
    });

    // Name each line above and to the left of where it ends (payoff), so the
    // label stays inside the plot even when the line runs to the last year
    const endLabels = {
      id: 'endLabels',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.font = '600 12px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = c.text;
        chart.data.datasets.forEach((dataset, i) => {
          const points = chart.getDatasetMeta(i).data.filter((_, j) => dataset.data[j] !== null);
          const last = points[points.length - 1];
          if (last) ctx.fillText(dataset.label, last.x - 6, last.y - 8);
        });
        ctx.restore();
      }
    };

    this.render(canvasId, {
      type: 'line',
      data: { labels: years, datasets },
      options: {
        maintainAspectRatio: false,
        layout: { padding: { right: 20, top: 10 } },
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: this.axis({
            grid: { display: false },
            title: { display: true, text: 'Year', color: c.text },
            ticks: { color: c.text, maxTicksLimit: 11 }
          }),
          y: this.axis({
            beginAtZero: true,
            ticks: { color: c.text, callback: (value) => this.compactMoney.format(value) }
          })
        },
        plugins: {
          legend: datasets.length > 1 ? this.legend() : { display: false },
          tooltip: {
            filter: (item) => item.raw !== null,
            callbacks: {
              title: (items) => `End of year ${items[0].label}`,
              label: (item) => ` ${item.dataset.label}: ${money(item.raw)}`
            }
          }
        }
      },
      plugins: [endLabels]
    });
  },

  /**
   * Principal and interest paid in each year of one scenario, stacked.
   * @param {string} canvasId - Canvas element ID
   * @param {Array} schedule - Monthly amortisation schedule
   */
  yearlySplit(canvasId, schedule) {
    const c = this.colours;
    const money = (value) => FinanceUtils.formatCurrency(value);
    const years = this.byYear(schedule);

    this.render(canvasId, {
      type: 'bar',
      data: {
        labels: years.map(y => y.year),
        datasets: [
          {
            label: 'Principal',
            data: years.map(y => y.principal),
            backgroundColor: c.borrowed
          },
          {
            label: 'Interest',
            data: years.map(y => y.interest),
            backgroundColor: c.interest,
            // 2px surface gap from the principal segment, rounded data end
            borderColor: c.surface,
            borderWidth: { bottom: 2, top: 0, left: 0, right: 0 },
            borderSkipped: false,
            borderRadius: { topLeft: 4, topRight: 4 }
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        categoryPercentage: 0.9,
        barPercentage: 0.9,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: this.axis({
            stacked: true,
            grid: { display: false },
            title: { display: true, text: 'Year', color: c.text },
            ticks: { color: c.text, maxTicksLimit: 11 }
          }),
          y: this.axis({
            stacked: true,
            beginAtZero: true,
            ticks: { color: c.text, callback: (value) => this.compactMoney.format(value) }
          })
        },
        plugins: {
          legend: this.legend(),
          tooltip: {
            callbacks: {
              title: (items) => `Year ${items[0].label}`,
              label: (item) => ` ${item.dataset.label}: ${money(item.raw)}`,
              footer: (items) => `Total paid: ${money(items.reduce((sum, item) => sum + item.raw, 0))}`
            }
          }
        }
      }
    });
  }
};

window.LoanCharts = LoanCharts;
