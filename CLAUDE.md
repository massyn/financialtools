# Finance Tools

Static site of Australian personal finance calculators. `build.py` renders the Jinja2 templates in
`templates/` to `dist/`, and the GitHub Actions workflow deploys `dist/` to Cloudflare Pages on every
push to `main`.

## Commands

- Build: `python build.py`
- Preview: `python -m http.server 8000 --directory dist`, then open http://localhost:8000
- There is no test suite. Check calculator changes in a browser against the built site, and check the
  figures by hand for at least one known case.

## Layout

- `templates/pages/<tool>.html` holds the form for one calculator; `templates/base.html` holds the
  shared shell (sidebar, Bootstrap, utilities).
- `static/js/calculators/<tool>.js` holds that calculator's logic and results rendering, as one class.
- `static/js/utils.js` (`FinanceUtils`) holds shared formatting and validation helpers.
- `static/data/tax.json` holds the tax brackets and the super/Medicare rates per financial year. It is
  injected into pages as `window.TAX_DATA`. Add each new financial year here.

## Calculator UI pattern

`take-home` (`templates/pages/take-home.html`, `static/js/calculators/takehome.js`) is the reference
implementation. New and updated calculators follow it.

### Thousand-separated money inputs

- Money fields are `type="text" inputmode="numeric" autocomplete="off"`, not `type="number"`
  (a number input cannot show separators). Rates, percentages and years stay `type="number"`.
- Wire each one with `FinanceUtils.attachThousandsSeparator(input)`, which reformats on `input` and keeps
  the caret after the same digit.
- Read it with `FinanceUtils.parseAmount(input.value)` (commas stripped) before validating or
  calculating; plain `parseFloat("500,000")` returns 500.

### Collapsible question section

- The form sits in `<div id="..." class="collapse show">` inside the card. The card title is a
  `button.collapse-toggle` with `data-bs-toggle="collapse"` and a `bi-chevron-up` icon; the chevron
  rotation lives in `custom.css`.
- `calculate()` returns `true` on success and `false` when validation fails. Only on success does the
  submit handler hide the form with `bootstrap.Collapse.getOrCreateInstance(...).hide()`, so the user
  sees the results and can reopen the questions from the header.
- Lay the questions out in tidy rows of two or three related fields (`col-md-6` / `col-md-4`).

### Tabbed Annual / Monthly / Weekly results

- Results show one table per period on Bootstrap tabs: Annual (first, active by default), Monthly,
  Weekly. Each tab divides the same annual figures (divisors 1, 12, 52).
- Do not ask a "payment frequency" question when it only changes how results are displayed; the tabs
  replace it. Keep it when it changes the calculation itself (for example, weekly loan repayments).
- Pass unrounded values to the renderer and let `FinanceUtils.formatCurrency` round, so periodic figures
  come from exact annual ones.
- Results tables read as a ledger: Component | itemised amount | Amount. Totals are bold in the right
  column; items they are built from are indented in the middle column, so the right column reads as a
  running sum (base salary - total expenses = take-home pay).

### Charts

- Chart.js, pinned to an exact version with an integrity hash, loaded only on pages that chart.
- A calculator's charts live in their own file (e.g. `loan-charts.js`), loaded before the calculator
  script; the calculator passes it plain data after rendering the results HTML.
- Destroy and redraw a chart on every calculation (see `LoanCharts.render()`).
- Colours come from the validated categorical palette in fixed order: `#2a78d6` (blue), `#eb6834`
  (orange), `#1baf7a` (aqua). Keep a legend, a tooltip, recessive grid lines, and a table elsewhere on the
  page that holds the same numbers.

### Other conventions

- Default the tax year to the current Australian financial year (1 July - 30 June), worked out in the
  browser so it stays right without a rebuild; fall back to the latest year in `tax.json`.
- Pick a tax bracket by its `over` threshold, not by `from_range`/`to_range`, so fractional incomes
  never fall between brackets.
- CDN scripts and stylesheets are pinned to an exact version with an `integrity` hash. Regenerate the
  hash whenever the version changes.

## Todo: bring other calculators to the pattern

- [x] **loan-calculator**: thousand separators on Loan Amount and Extra Payment; collapsible form;
      Total Cost of the Loan chart. Payment frequency kept as a question.
- [ ] **borrowing-capacity**: thousand separators on the payment amount; collapsible form. Payment
      frequency describes the input amount, so it stays a question.
- [ ] **refinance**: thousand separators on Outstanding Amount and Current Payment Amount; collapsible
      form. Current payment frequency is an input, so it stays.
- [ ] **repay-earlier**: thousand separators on Loan Amount and Extra Payment; collapse both forms
      (loan details and target). Payment frequency drives the calculation, so it stays.
- [ ] **sell-and-buy**: thousand separators on Sale Price, Outstanding Loan, Conveyancer Costs (x2),
      Current Monthly Repayment and Purchase Price; collapse both forms.
- [ ] **buy-vs-rent**: thousand separators on Property Price, Council Rates, Insurance, Maintenance,
      Weekly Rent and Weekly Investment Amount; collapsible form. Review whether the investment
      frequency question is display-only and could become tabs.
- [ ] **simple-investment**: thousand separators on Monthly Savings Amount; collapsible form.
- [ ] **investment-options**: thousand separators on Investment Amount; collapsible form. Review whether
      the investment frequency question is display-only and could become tabs.
- [x] **Shared helper**: thousand-separator formatting and parsing moved into `FinanceUtils`.
- [ ] **Table height cap**: `custom.css` caps every `.table-responsive` at 500px with an inner scrollbar
      (the home page opts out with `.table-uncapped`). Decide per calculator whether long tables should
      scroll inside a box or flow with the page.
