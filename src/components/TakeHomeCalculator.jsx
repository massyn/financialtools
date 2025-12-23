import React, { useState, useEffect } from 'react'
import { formatCurrency, validateRequired, getValidationClass, getValidationMessage } from '../utils/formatters'
import taxData from '../tax.json'

function TakeHomeCalculator() {
  const [paymentFrequency, setPaymentFrequency] = useState('monthly')
  const [annualSalary, setAnnualSalary] = useState('')
  const [includesSuper, setIncludesSuper] = useState('yes')
  const [medicareLevy, setMedicareLevy] = useState('yes')
  const [salarySacrifice, setSalarySacrifice] = useState('0')
  const [taxYear, setTaxYear] = useState('')
  const [results, setResults] = useState(null)
  const [errors, setErrors] = useState({})

  // Get available tax years and set default to most recent
  useEffect(() => {
    const years = Object.keys(taxData.rates).sort().reverse()
    if (years.length > 0) {
      setTaxYear(years[0])
    }
  }, [])

  const calculateTakeHome = () => {
    const newErrors = {}
    
    if (!validateRequired(annualSalary)) {
      newErrors.annualSalary = getValidationMessage('Annual Salary', annualSalary)
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return
    }

    const salary = parseFloat(annualSalary)
    const sacrificePercent = parseFloat(salarySacrifice) || 0
    const taxYearData = taxData.rates[taxYear]
    const lookupData = taxData.lookup[taxYear]

    // Step 1: Calculate superannuation
    let superAmount = 0
    let grossSalary = salary

    if (includesSuper === 'yes') {
      const superRate = lookupData.super
      superAmount = salary * superRate / (1 + superRate)
      grossSalary = salary - superAmount
    }

    // Step 2: Calculate salary sacrifice
    const sacrificeAmount = grossSalary * (sacrificePercent / 100)
    const taxableIncome = grossSalary - sacrificeAmount

    // Step 3: Calculate income tax (on taxable income after salary sacrifice)
    let incomeTax = 0
    const taxBracket = taxYearData.find(bracket =>
      taxableIncome >= bracket.from_range &&
      (bracket.to_range === -1 || bracket.to_range === 999999999999 || taxableIncome <= bracket.to_range)
    )

    if (taxBracket) {
      const taxableOver = Math.max(0, taxableIncome - taxBracket.over)
      incomeTax = taxBracket.base + (taxableOver * taxBracket.c)
    }

    // Step 4: Calculate medicare levy (on taxable income after salary sacrifice)
    let medicareAmount = 0
    if (medicareLevy === 'yes') {
      medicareAmount = taxableIncome * lookupData.medicare_levy
    }

    // Step 5: Calculate take home pay
    const totalTax = incomeTax + medicareAmount
    const takeHomeAnnual = taxableIncome - totalTax

    // Step 6: Calculate tax savings from salary sacrifice
    // Calculate what the tax would be WITHOUT salary sacrifice for comparison
    let incomeTaxWithoutSacrifice = 0
    const taxBracketWithoutSacrifice = taxYearData.find(bracket =>
      grossSalary >= bracket.from_range &&
      (bracket.to_range === -1 || bracket.to_range === 999999999999 || grossSalary <= bracket.to_range)
    )

    if (taxBracketWithoutSacrifice) {
      const taxableOver = Math.max(0, grossSalary - taxBracketWithoutSacrifice.over)
      incomeTaxWithoutSacrifice = taxBracketWithoutSacrifice.base + (taxableOver * taxBracketWithoutSacrifice.c)
    }

    const medicareWithoutSacrifice = medicareLevy === 'yes' ? grossSalary * lookupData.medicare_levy : 0
    const totalTaxWithoutSacrifice = incomeTaxWithoutSacrifice + medicareWithoutSacrifice
    const taxSavings = totalTaxWithoutSacrifice - totalTax

    // Step 7: Calculate periodic amounts
    const takeHomeMonthly = takeHomeAnnual / 12
    const takeHomeWeekly = takeHomeAnnual / 52
    const takeHomePeriodic = paymentFrequency === 'weekly' ? takeHomeWeekly : takeHomeMonthly

    // Step 8: Calculate total superannuation
    const totalSuper = superAmount + sacrificeAmount

    setResults({
      employerSalary: salary,
      includesSuper: includesSuper === 'yes',
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
      paymentFrequency
    })
  }

  return (
    <div className="row">
      <div className="col-12 col-xl-10 mx-auto">
        <h2 className="text-center mb-4">Take Home Pay Calculator</h2>
        
        <div className="card border-primary shadow-sm">
          <div className="card-body bg-light">
            <h5 className="card-title text-primary mb-3">Salary Details</h5>
            
            <div className="row">
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Payment Frequency *</label>
                  <select 
                    className="form-select form-select-lg" 
                    value={paymentFrequency}
                    onChange={(e) => setPaymentFrequency(e.target.value)}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Annual Salary ($) *</label>
                  <input 
                    type="number" 
                    className={`${getValidationClass(annualSalary)} form-control-lg`}
                    value={annualSalary}
                    onChange={(e) => setAnnualSalary(e.target.value)}
                    placeholder="e.g., 75,000"
                  />
                  {errors.annualSalary && <div className="invalid-feedback d-block">{errors.annualSalary}</div>}
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Tax Year *</label>
                  <select 
                    className="form-select form-select-lg" 
                    value={taxYear}
                    onChange={(e) => setTaxYear(e.target.value)}
                  >
                    {Object.keys(taxData.rates).sort().reverse().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Does salary include superannuation? *</label>
                  <select
                    className="form-select form-select-lg"
                    value={includesSuper}
                    onChange={(e) => setIncludesSuper(e.target.value)}
                  >
                    <option value="no">No - Salary excludes super</option>
                    <option value="yes">Yes - Salary includes super</option>
                  </select>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Pay Medicare Levy? *</label>
                  <select
                    className="form-select form-select-lg"
                    value={medicareLevy}
                    onChange={(e) => setMedicareLevy(e.target.value)}
                  >
                    <option value="yes">Yes - Standard rate</option>
                    <option value="no">No - Exempt</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">
                    Salary Sacrifice to Super (%)
                    <small className="text-muted ms-2">Optional - Additional voluntary super contribution</small>
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    value={salarySacrifice}
                    onChange={(e) => setSalarySacrifice(e.target.value)}
                    placeholder="e.g., 5"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                  <small className="form-text text-muted">
                    Enter the percentage of your gross salary to sacrifice into super. This reduces your taxable income.
                  </small>
                </div>
              </div>
            </div>
            
            <div className="d-grid gap-2">
              <button className="btn btn-success btn-lg" onClick={calculateTakeHome}>
                <i className="bi bi-calculator"></i> Calculate Take Home Pay
              </button>
            </div>
          </div>
        </div>

        {results && (
          <div className="mt-4">
            <div className="card">
              <div className="card-body">
                <div className="alert alert-info mb-3">
                  <small><strong>Important:</strong> This calculation is based on standard Australian tax rates for {taxYear} and does not include other deductions, rebates, or personal circumstances that may affect your actual take-home pay. Consult a tax professional for personalized advice.</small>
                </div>
                
                <h5>Take Home Pay Breakdown</h5>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead className="table-success">
                      <tr>
                        <th>Component</th>
                        <th>Details</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Employer Stated Salary</strong></td>
                        <td>Annual salary as provided by employer</td>
                        <td className="text-end">{formatCurrency(results.employerSalary)}</td>
                      </tr>
                      {results.includesSuper && (
                        <tr className="table-warning">
                          <td><strong>Less: Superannuation</strong></td>
                          <td>Super component ({(results.superRate * 100).toFixed(2)}% included in salary)</td>
                          <td className="text-end">-{formatCurrency(results.superAmount)}</td>
                        </tr>
                      )}
                      <tr className="table-primary">
                        <td><strong>Base (Gross) Pay</strong></td>
                        <td>Salary {results.includesSuper ? 'after super deduction' : '(excludes super)'}</td>
                        <td className="text-end">{formatCurrency(results.grossSalary)}</td>
                      </tr>
                      {results.sacrificeAmount > 0 && (
                        <tr className="table-info">
                          <td><strong>Less: Salary Sacrifice</strong></td>
                          <td>Voluntary super contribution ({results.sacrificePercent}% of gross salary)</td>
                          <td className="text-end">-{formatCurrency(results.sacrificeAmount)}</td>
                        </tr>
                      )}
                      {results.sacrificeAmount > 0 && (
                        <tr className="table-light">
                          <td><strong>Taxable Income</strong></td>
                          <td>Income after salary sacrifice (subject to tax)</td>
                          <td className="text-end">{formatCurrency(results.taxableIncome)}</td>
                        </tr>
                      )}
                      <tr>
                        <td><strong>Less: Income Tax</strong></td>
                        <td>
                          Tax bracket: {formatCurrency(results.taxBracket.from_range)} - {results.taxBracket.to_range === -1 || results.taxBracket.to_range === 999999999999 ? '∞' : formatCurrency(results.taxBracket.to_range)}
                          <br/>
                          <small className="text-muted">Base: {formatCurrency(results.taxBracket.base)} + {(results.taxBracket.c * 100).toFixed(1)}% over {formatCurrency(results.taxBracket.over)}</small>
                        </td>
                        <td className="text-end">-{formatCurrency(results.incomeTax)}</td>
                      </tr>
                      {results.medicareAmount > 0 && (
                        <tr>
                          <td><strong>Less: Medicare Levy</strong></td>
                          <td>2.0% of taxable income</td>
                          <td className="text-end">-{formatCurrency(results.medicareAmount)}</td>
                        </tr>
                      )}
                      <tr className="table-success">
                        <td><strong>Take Home Pay (Annual)</strong></td>
                        <td>Net pay after all deductions</td>
                        <td className="text-end"><strong>{formatCurrency(results.takeHomeAnnual)}</strong></td>
                      </tr>
                      <tr className="table-success">
                        <td><strong>Take Home Pay ({results.paymentFrequency === 'weekly' ? 'Weekly' : 'Monthly'})</strong></td>
                        <td>Net pay per {results.paymentFrequency === 'weekly' ? 'week' : 'month'}</td>
                        <td className="text-end"><strong>{formatCurrency(results.takeHomePeriodic)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {results.sacrificeAmount > 0 && (
                  <div className="alert alert-success mt-3">
                    <h6 className="alert-heading">Salary Sacrifice Impact</h6>
                    <div className="row">
                      <div className="col-12 col-md-4">
                        <strong>Tax Savings:</strong> {formatCurrency(results.taxSavings)}
                      </div>
                      <div className="col-12 col-md-4">
                        <strong>Total Superannuation:</strong> {formatCurrency(results.totalSuper)}
                      </div>
                      <div className="col-12 col-md-4">
                        <strong>Net Take Home Reduction:</strong> {formatCurrency(results.sacrificeAmount - results.taxSavings)}
                      </div>
                    </div>
                    <hr />
                    <small className="text-muted">
                      By sacrificing {formatCurrency(results.sacrificeAmount)} into super, you save {formatCurrency(results.taxSavings)} in tax.
                      Your take-home pay reduces by only {formatCurrency(results.sacrificeAmount - results.taxSavings)},
                      while your super increases by {formatCurrency(results.sacrificeAmount)}.
                    </small>
                  </div>
                )}

                <div className="row mt-4">
                  <div className="col-12 col-md-6">
                    <div className="card border-primary">
                      <div className="card-body text-center">
                        <h6 className="card-title">Annual Take Home</h6>
                        <h4 className="text-primary">{formatCurrency(results.takeHomeAnnual)}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className={`card ${results.paymentFrequency === 'weekly' ? 'border-info' : 'border-success'}`}>
                      <div className="card-body text-center">
                        <h6 className="card-title">{results.paymentFrequency === 'weekly' ? 'Weekly' : 'Monthly'} Take Home</h6>
                        <h4 className={results.paymentFrequency === 'weekly' ? 'text-info' : 'text-success'}>
                          {formatCurrency(results.takeHomePeriodic)}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TakeHomeCalculator