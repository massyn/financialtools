import React, { useState } from 'react'
import { formatCurrency, validateRequired, getValidationClass, getValidationMessage } from '../utils/formatters'

function SimpleInvestmentCalculator() {
  const [monthlyAmount, setMonthlyAmount] = useState('100')
  const [investmentYears, setInvestmentYears] = useState('30')
  const [annualReturn, setAnnualReturn] = useState('4')
  const [results, setResults] = useState(null)
  const [errors, setErrors] = useState({})

  const calculateInvestment = () => {
    const newErrors = {}
    
    if (!validateRequired(monthlyAmount)) {
      newErrors.monthlyAmount = getValidationMessage('Monthly Amount', monthlyAmount)
    }
    if (!validateRequired(investmentYears)) {
      newErrors.investmentYears = getValidationMessage('Investment Years', investmentYears)
    }
    if (!validateRequired(annualReturn)) {
      newErrors.annualReturn = getValidationMessage('Annual Return', annualReturn)
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return
    }

    const monthly = parseFloat(monthlyAmount)
    const years = parseFloat(investmentYears)
    const returnRate = parseFloat(annualReturn) / 100
    const monthlyRate = returnRate / 12
    const totalMonths = years * 12
    
    // Calculate total amount saved (principal)
    const totalSaved = monthly * totalMonths
    
    // Calculate simple return (each monthly payment earns simple interest for its time invested)
    let simpleReturn = 0
    for (let month = 1; month <= totalMonths; month++) {
      const monthsRemaining = totalMonths - month + 1
      const yearsRemaining = monthsRemaining / 12
      simpleReturn += monthly * returnRate * yearsRemaining
    }
    const totalWithSimpleReturn = totalSaved + simpleReturn
    
    // Calculate compound return using future value of annuity formula
    // FV = PMT * [((1 + r)^n - 1) / r]
    const futureValue = monthly * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate
    const compoundReturn = futureValue - totalSaved
    
    setResults({
      monthlyAmount: monthly,
      years: years,
      returnRate: returnRate,
      totalSaved: Math.round(totalSaved),
      simpleReturn: Math.round(simpleReturn),
      totalWithSimpleReturn: Math.round(totalWithSimpleReturn),
      compoundReturn: Math.round(compoundReturn),
      futureValue: Math.round(futureValue),
      compoundAdvantage: Math.round(compoundReturn - simpleReturn)
    })
  }

  return (
    <div className="row">
      <div className="col-12 col-lg-10 col-xl-8 mx-auto">
        <h2 className="text-center mb-4">Simple Investment Calculator</h2>
        
        <div className="card border-primary shadow-sm">
          <div className="card-body bg-light">
            <h5 className="card-title text-primary mb-3">Investment Details</h5>
            
            <div className="row">
              <div className="col-12 col-md-4">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Monthly Savings Amount ($) *</label>
                  <input 
                    type="number" 
                    className={`${getValidationClass(monthlyAmount)} form-control-lg`}
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(e.target.value)}
                    placeholder="e.g., 100"
                  />
                  {errors.monthlyAmount && <div className="invalid-feedback d-block">{errors.monthlyAmount}</div>}
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Investment Period (years) *</label>
                  <input 
                    type="number" 
                    className={`${getValidationClass(investmentYears)} form-control-lg`}
                    value={investmentYears}
                    onChange={(e) => setInvestmentYears(e.target.value)}
                    placeholder="e.g., 30"
                  />
                  {errors.investmentYears && <div className="invalid-feedback d-block">{errors.investmentYears}</div>}
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Expected Annual Return (%) *</label>
                  <input 
                    type="number" 
                    step="0.1"
                    className={`${getValidationClass(annualReturn)} form-control-lg`}
                    value={annualReturn}
                    onChange={(e) => setAnnualReturn(e.target.value)}
                    placeholder="e.g., 4.0"
                  />
                  {errors.annualReturn && <div className="invalid-feedback d-block">{errors.annualReturn}</div>}
                </div>
              </div>
            </div>
            
            <div className="d-grid gap-2">
              <button className="btn btn-success btn-lg" onClick={calculateInvestment}>
                <i className="bi bi-graph-up-arrow"></i> Calculate Investment Returns
              </button>
            </div>
          </div>
        </div>

        {results && (
          <div className="mt-4">
            <div className="card">
              <div className="card-body">
                <div className="alert alert-info mb-3">
                  <small><strong>Important:</strong> This calculator provides estimates based on consistent monthly contributions and assumed annual returns. Actual investment returns vary and past performance doesn't guarantee future results. Consider consulting with a financial advisor for personalized investment advice.</small>
                </div>
                
                <h5>Investment Summary</h5>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead className="table-success">
                      <tr>
                        <th>Investment Component</th>
                        <th>Details</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Monthly Contribution</strong></td>
                        <td>Regular savings amount</td>
                        <td className="text-end">{formatCurrency(results.monthlyAmount)}</td>
                      </tr>
                      <tr>
                        <td><strong>Investment Period</strong></td>
                        <td>Total years of investing</td>
                        <td className="text-end">{results.years} years</td>
                      </tr>
                      <tr>
                        <td><strong>Expected Annual Return</strong></td>
                        <td>Assumed yearly growth rate</td>
                        <td className="text-end">{(results.returnRate * 100).toFixed(1)}%</td>
                      </tr>
                      <tr className="table-warning">
                        <td><strong>Total Amount Saved</strong></td>
                        <td>Your total contributions ({results.years} years × {formatCurrency(results.monthlyAmount)}/month × 12)</td>
                        <td className="text-end">{formatCurrency(results.totalSaved)}</td>
                      </tr>
                      <tr>
                        <td><strong>Simple Return (No Compounding)</strong></td>
                        <td>Returns without compound interest</td>
                        <td className="text-end">{formatCurrency(results.simpleReturn)}</td>
                      </tr>
                      <tr>
                        <td><strong>Total with Simple Return</strong></td>
                        <td>Principal + Simple returns</td>
                        <td className="text-end">{formatCurrency(results.totalWithSimpleReturn)}</td>
                      </tr>
                      <tr className="table-success">
                        <td><strong>Compound Return</strong></td>
                        <td>Returns with monthly compounding</td>
                        <td className="text-end">{formatCurrency(results.compoundReturn)}</td>
                      </tr>
                      <tr className="table-success">
                        <td><strong>Total with Compound Interest</strong></td>
                        <td>Principal + Compound returns</td>
                        <td className="text-end"><strong>{formatCurrency(results.futureValue)}</strong></td>
                      </tr>
                      <tr className="table-primary">
                        <td><strong>Compound Interest Advantage</strong></td>
                        <td>Additional returns from compounding</td>
                        <td className="text-end"><strong>{formatCurrency(results.compoundAdvantage)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="row mt-4">
                  <div className="col-12 col-md-3">
                    <div className="card border-warning">
                      <div className="card-body text-center">
                        <h6 className="card-title">Total Saved</h6>
                        <h4 className="text-warning">{formatCurrency(results.totalSaved)}</h4>
                        <small className="text-muted">Your contributions</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <div className="card border-info">
                      <div className="card-body text-center">
                        <h6 className="card-title">Simple Returns</h6>
                        <h4 className="text-info">{formatCurrency(results.totalWithSimpleReturn)}</h4>
                        <small className="text-muted">Without compounding</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <div className="card border-success">
                      <div className="card-body text-center">
                        <h6 className="card-title">Compound Returns</h6>
                        <h4 className="text-success">{formatCurrency(results.futureValue)}</h4>
                        <small className="text-muted">With compounding</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <div className="card border-primary">
                      <div className="card-body text-center">
                        <h6 className="card-title">Compound Advantage</h6>
                        <h4 className="text-primary">{formatCurrency(results.compoundAdvantage)}</h4>
                        <small className="text-muted">Extra from compounding</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-success mt-4">
                  <h6><i className="bi bi-lightbulb"></i> Key Investment Insights:</h6>
                  <ul className="mb-0">
                    <li><strong>Time is powerful:</strong> Over {results.years} years, compound interest adds {formatCurrency(results.compoundAdvantage)} to your returns</li>
                    <li><strong>Consistency matters:</strong> Regular {formatCurrency(results.monthlyAmount)}/month contributions grow to {formatCurrency(results.futureValue)}</li>
                    <li><strong>Growth multiplier:</strong> Your {formatCurrency(results.totalSaved)} investment grows to {(results.futureValue / results.totalSaved).toFixed(1)}x its original value</li>
                    <li><strong>Annual compound growth:</strong> Each year your investment grows by approximately {(results.returnRate * 100).toFixed(1)}%</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SimpleInvestmentCalculator