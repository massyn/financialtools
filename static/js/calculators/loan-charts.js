/**
 * Loan Calculator charts (Chart.js)
 * Colours are slots 1 (blue) and 2 (orange) of the validated categorical
 * palette, so the pair stays distinguishable for colour-blind readers.
 */

const LoanCharts = {
  colours: {
    borrowed: '#2a78d6',
    interest: '#eb6834',
    surface: '#ffffff',
    text: '#52514e',
    grid: '#e9ecef'
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
  }
};

window.LoanCharts = LoanCharts;
