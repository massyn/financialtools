import React, { useState } from 'react'
import { formatCurrency, validateRequired, getValidationClass, getValidationMessage } from '../utils/formatters'

function HomeLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [loanTerm, setLoanTerm] = useState('')
  const [extraPayment, setExtraPayment] = useState('')
  const [paymentFrequency, setPaymentFrequency] = useState('monthly')
  const [results, setResults] = useState(null)
  const [errors, setErrors] = useState({})

  const calculateLoan = () => {
    const newErrors = {}
    
    if (!validateRequired(loanAmount)) {
      newErrors.loanAmount = getValidationMessage('Loan Amount', loanAmount)
    }
    if (!validateRequired(interestRate)) {
      newErrors.interestRate = getValidationMessage('Interest Rate', interestRate)
    }
    if (!validateRequired(loanTerm)) {
      newErrors.loanTerm = getValidationMessage('Loan Term', loanTerm)
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return
    }

    const principal = parseFloat(loanAmount)
    const annualRate = parseFloat(interestRate) / 100
    const monthlyRate = annualRate / 12
    const numberOfPayments = parseFloat(loanTerm) * 12
    const extra = parseFloat(extraPayment) || 0
    const isWeekly = paymentFrequency === 'weekly'

    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    const displayPayment = isWeekly ? monthlyPayment / (52/12) : monthlyPayment
    const displayExtra = isWeekly ? extra / (52/12) : extra

    const totalAmount = monthlyPayment * numberOfPayments
    const totalInterest = totalAmount - principal

    const amortizationSchedule = []
    const extraAmortizationSchedule = []
    
    let balance = principal
    let extraBalance = principal
    let totalInterestWithExtra = 0
    let extraPaymentsMonth = 0

    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = balance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      balance -= principalPayment

      amortizationSchedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      })

      if (extraBalance > 0) {
        const extraInterestPayment = extraBalance * monthlyRate
        const extraPrincipalPayment = monthlyPayment - extraInterestPayment
        const totalExtraPrincipal = extraPrincipalPayment + extra
        
        extraBalance -= totalExtraPrincipal
        totalInterestWithExtra += extraInterestPayment
        extraPaymentsMonth = month

        if (extraBalance <= 0) {
          extraBalance = 0
        }

        extraAmortizationSchedule.push({
          month,
          payment: monthlyPayment + extra,
          principal: totalExtraPrincipal,
          interest: extraInterestPayment,
          balance: Math.max(0, extraBalance)
        })
      }

      if (balance <= 0) break
    }

    const yearsSaved = (numberOfPayments - extraPaymentsMonth) / 12
    const interestSaved = totalInterest - totalInterestWithExtra

    setResults({
      monthlyPayment: Math.round(monthlyPayment),
      displayPayment: Math.round(displayPayment),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      amortizationSchedule,
      paymentFrequency,
      extraResults: extra > 0 ? {
        totalInterestWithExtra: Math.round(totalInterestWithExtra),
        interestSaved: Math.round(interestSaved),
        yearsSaved: yearsSaved.toFixed(1),
        displayExtra: Math.round(displayExtra),
        extraAmortizationSchedule
      } : null
    })
  }

  return (
    <div className="row">
      <div className="col-12 col-lg-10 col-xl-8 mx-auto">
        <h2 className="text-center mb-4">Loan Calculator</h2>
        
        <div className="card border-primary shadow-sm">
          <div className="card-body bg-light">
            <h5 className="card-title text-primary mb-3">Loan Details</h5>
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
                  <label className="form-label fw-bold text-dark">Loan Amount ($) *</label>
                  <input 
                    type="number" 
                    className={`${getValidationClass(loanAmount)} form-control-lg`}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="e.g., 500,000"
                  />
                  {errors.loanAmount && <div className="invalid-feedback d-block">{errors.loanAmount}</div>}
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Interest Rate (%) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className={`${getValidationClass(interestRate)} form-control-lg`}
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="e.g., 5.5"
                  />
                  {errors.interestRate && <div className="invalid-feedback d-block">{errors.interestRate}</div>}
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-12 col-sm-6">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Loan Term (years) *</label>
                  <input 
                    type="number" 
                    className={`${getValidationClass(loanTerm)} form-control-lg`}
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    placeholder="e.g., 30"
                  />
                  {errors.loanTerm && <div className="invalid-feedback d-block">{errors.loanTerm}</div>}
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary">Extra Payment per {paymentFrequency === 'weekly' ? 'Week' : 'Month'} ($)</label>
                  <input 
                    type="number" 
                    className="form-control form-control-lg" 
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(e.target.value)}
                    placeholder={`e.g., ${paymentFrequency === 'weekly' ? '50' : '200'}`}
                  />
                </div>
              </div>
            </div>
            
            <div className="d-grid gap-2">
              <button className="btn btn-primary btn-lg" onClick={calculateLoan}>
                <i className="bi bi-calculator"></i> Calculate Loan
              </button>
            </div>
          </div>
        </div>

        {results && (
          <div className="mt-4">
            <div className="card">
              <div className="card-body">
                <h5>Loan Comparison</h5>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Scenario</th>
                        <th>{results.paymentFrequency === 'weekly' ? 'Weekly' : 'Monthly'} Payment</th>
                        <th>Total Amount Paid</th>
                        <th>Total Interest</th>
                        <th>Loan Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Standard Loan</strong></td>
                        <td>{formatCurrency(results.displayPayment)}</td>
                        <td>{formatCurrency(results.totalAmount)}</td>
                        <td>{formatCurrency(results.totalInterest)}</td>
                        <td>{loanTerm} years</td>
                      </tr>
                      {results.extraResults && (
                        <tr className="table-success">
                          <td><strong>With Extra Payments</strong><br/>
                              <small className="text-muted">+{formatCurrency(results.extraResults.displayExtra)}/{results.paymentFrequency === 'weekly' ? 'week' : 'month'}</small>
                          </td>
                          <td>{formatCurrency(results.displayPayment + results.extraResults.displayExtra)}</td>
                          <td>{formatCurrency(results.extraResults.totalInterestWithExtra + parseFloat(loanAmount))}</td>
                          <td>{formatCurrency(results.extraResults.totalInterestWithExtra)}</td>
                          <td>{(parseFloat(loanTerm) - parseFloat(results.extraResults.yearsSaved)).toFixed(1)} years</td>
                        </tr>
                      )}
                      {results.extraResults && (
                        <tr className="table-warning">
                          <td><strong>Your Savings</strong></td>
                          <td>-</td>
                          <td>{formatCurrency(parseFloat(results.totalAmount) - (results.extraResults.totalInterestWithExtra + parseFloat(loanAmount)))}</td>
                          <td>{formatCurrency(results.extraResults.interestSaved)}</td>
                          <td>{results.extraResults.yearsSaved} years saved</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {!results.extraResults && (
                  (() => {
                    const extraPaymentAmount = 100
                    const principal = parseFloat(loanAmount)
                    const annualRate = parseFloat(interestRate) / 100
                    const monthlyRate = annualRate / 12
                    const numberOfPayments = parseFloat(loanTerm) * 12
                    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
                    const displayPaymentAmount = paymentFrequency === 'weekly' ? monthlyPayment / (52/12) : monthlyPayment
                    const displayExtraAmount = paymentFrequency === 'weekly' ? extraPaymentAmount / (52/12) : extraPaymentAmount
                    
                    let extraBalance = principal
                    let totalInterestWithExtra = 0
                    let extraPaymentsMonth = 0

                    for (let month = 1; month <= numberOfPayments; month++) {
                      if (extraBalance > 0) {
                        const extraInterestPayment = extraBalance * monthlyRate
                        const extraPrincipalPayment = monthlyPayment - extraInterestPayment
                        const totalExtraPrincipal = extraPrincipalPayment + extraPaymentAmount
                        
                        extraBalance -= totalExtraPrincipal
                        totalInterestWithExtra += extraInterestPayment
                        extraPaymentsMonth = month

                        if (extraBalance <= 0) {
                          extraBalance = 0
                          break
                        }
                      }
                    }

                    const yearsSaved = (numberOfPayments - extraPaymentsMonth) / 12
                    const interestSaved = results.totalInterest - totalInterestWithExtra

                    return (
                      <div className="alert alert-info">
                        <h6><i className="bi bi-lightbulb"></i> Consider making an extra payment!</h6>
                        <p className="mb-2">By just paying an extra <strong>{formatCurrency(displayExtraAmount)}</strong> per {paymentFrequency === 'weekly' ? 'week' : 'month'}, you could:</p>
                        <div className="row">
                          <div className="col-md-6">
                            <strong>Save {yearsSaved.toFixed(1)} years</strong> off your loan
                          </div>
                          <div className="col-md-6">
                            <strong>Save {formatCurrency(interestSaved)}</strong> in interest
                          </div>
                        </div>
                        <small className="text-muted mt-2 d-block">Try entering {formatCurrency(displayExtraAmount)} in the "Extra Payment per {paymentFrequency === 'weekly' ? 'Week' : 'Month'}" field above to see the full comparison.</small>
                      </div>
                    )
                  })()
                )}
              </div>
            </div>

            <div className="card mt-3">
              <div className="card-body">
                <h5>Amortization Schedule</h5>
                <div className="table-responsive" style={{maxHeight: '400px', overflowY: 'auto'}}>
                  <table className="table table-striped table-sm">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Payment</th>
                        <th>Principal</th>
                        <th>Interest</th>
                        <th>Balance</th>
                        {results.extraResults && <th>Extra Payment Balance</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {results.amortizationSchedule.slice(0, 120).map((row, index) => (
                        <tr key={index}>
                          <td>{row.month}</td>
                          <td>{formatCurrency(row.payment)}</td>
                          <td>{formatCurrency(row.principal)}</td>
                          <td>{formatCurrency(row.interest)}</td>
                          <td>{formatCurrency(row.balance)}</td>
                          {results.extraResults && (
                            <td>
                              {formatCurrency(results.extraResults.extraAmortizationSchedule[index]?.balance || 0)}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {results.amortizationSchedule.length > 120 && (
                  <small className="text-muted">Showing first 10 years. Full schedule available on calculation.</small>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomeLoanCalculator