import React, { useState } from 'react'
import { formatCurrency, validateRequired, getValidationClass, getValidationMessage } from '../utils/formatters'

function RefinanceCalculator() {
  const [currentOutstandingAmount, setCurrentOutstandingAmount] = useState('')
  const [currentInterestRate, setCurrentInterestRate] = useState('')
  const [currentPaymentFrequency, setCurrentPaymentFrequency] = useState('monthly')
  const [currentPaymentAmount, setCurrentPaymentAmount] = useState('')
  
  const [newInterestRate, setNewInterestRate] = useState('')
  const [newLoanTerm, setNewLoanTerm] = useState('')
  
  const [results, setResults] = useState(null)
  const [errors, setErrors] = useState({})

  const calculateRefinance = () => {
    const newErrors = {}
    
    if (!validateRequired(currentOutstandingAmount)) {
      newErrors.currentOutstandingAmount = getValidationMessage('Outstanding Amount', currentOutstandingAmount)
    }
    if (!validateRequired(currentInterestRate)) {
      newErrors.currentInterestRate = getValidationMessage('Current Interest Rate', currentInterestRate)
    }
    if (!validateRequired(currentPaymentAmount)) {
      newErrors.currentPaymentAmount = getValidationMessage('Current Payment Amount', currentPaymentAmount)
    }
    if (!validateRequired(newInterestRate)) {
      newErrors.newInterestRate = getValidationMessage('New Interest Rate', newInterestRate)
    }
    if (!validateRequired(newLoanTerm)) {
      newErrors.newLoanTerm = getValidationMessage('New Loan Term', newLoanTerm)
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return
    }

    const outstandingAmount = parseFloat(currentOutstandingAmount)
    const currentRate = parseFloat(currentInterestRate) / 100
    const currentPayment = parseFloat(currentPaymentAmount)
    const newRate = parseFloat(newInterestRate) / 100
    const newTermYears = parseFloat(newLoanTerm)
    
    const isCurrentWeekly = currentPaymentFrequency === 'weekly'
    const currentMonthlyPayment = isCurrentWeekly ? currentPayment * (52/12) : currentPayment
    
    const currentMonthlyRate = currentRate / 12
    const newMonthlyRate = newRate / 12
    const newNumberOfPayments = newTermYears * 12

    const newMonthlyPayment = (outstandingAmount * newMonthlyRate * Math.pow(1 + newMonthlyRate, newNumberOfPayments)) / 
                              (Math.pow(1 + newMonthlyRate, newNumberOfPayments) - 1)

    const newWeeklyPayment = newMonthlyPayment / (52/12)

    let currentRemainingPayments = 0
    if (currentMonthlyRate > 0) {
      const temp = Math.log(1 - (outstandingAmount * currentMonthlyRate) / currentMonthlyPayment) / Math.log(1 + currentMonthlyRate)
      currentRemainingPayments = Math.max(0, -temp)
    }

    const currentRemainingYears = currentRemainingPayments / 12
    const currentTotalRemaining = currentMonthlyPayment * currentRemainingPayments
    const currentRemainingInterest = currentTotalRemaining - outstandingAmount

    const newTotalAmount = newMonthlyPayment * newNumberOfPayments
    const newTotalInterest = newTotalAmount - outstandingAmount

    const interestSavings = currentRemainingInterest - newTotalInterest
    const paymentDifference = newMonthlyPayment - currentMonthlyPayment
    const timeDifference = newTermYears - currentRemainingYears

    setResults({
      currentLoan: {
        monthlyPayment: Math.round(currentMonthlyPayment),
        weeklyPayment: Math.round(currentMonthlyPayment / (52/12)),
        remainingYears: currentRemainingYears.toFixed(1),
        totalRemaining: Math.round(currentTotalRemaining),
        remainingInterest: Math.round(currentRemainingInterest),
        paymentFrequency: currentPaymentFrequency
      },
      newLoan: {
        monthlyPayment: Math.round(newMonthlyPayment),
        weeklyPayment: Math.round(newWeeklyPayment),
        loanTerm: newTermYears,
        totalAmount: Math.round(newTotalAmount),
        totalInterest: Math.round(newTotalInterest)
      },
      comparison: {
        interestSavings: Math.round(interestSavings),
        paymentDifference: Math.round(paymentDifference),
        timeDifference: timeDifference.toFixed(1),
        totalSavings: Math.round(interestSavings + (paymentDifference * newNumberOfPayments))
      }
    })
  }

  return (
    <div className="row">
      <div className="col-12 col-xl-10 mx-auto">
        <h2 className="text-center mb-4">Refinance Calculator</h2>
        
        <div className="card border-primary shadow-sm">
          <div className="card-body bg-light">
            <h5 className="card-title text-primary mb-3">Current Loan Details</h5>
            
            <div className="row">
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Current Payment Frequency *</label>
                  <select 
                    className="form-select form-select-lg" 
                    value={currentPaymentFrequency}
                    onChange={(e) => setCurrentPaymentFrequency(e.target.value)}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-12 col-lg-4">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Outstanding Amount ($) *</label>
                  <input 
                    type="number" 
                    className={`${getValidationClass(currentOutstandingAmount)} form-control-lg`}
                    value={currentOutstandingAmount}
                    onChange={(e) => setCurrentOutstandingAmount(e.target.value)}
                    placeholder="e.g., 350,000"
                  />
                  {errors.currentOutstandingAmount && <div className="invalid-feedback d-block">{errors.currentOutstandingAmount}</div>}
                </div>
              </div>
              <div className="col-12 col-lg-4">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Current Interest Rate (%) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className={`${getValidationClass(currentInterestRate)} form-control-lg`}
                    value={currentInterestRate}
                    onChange={(e) => setCurrentInterestRate(e.target.value)}
                    placeholder="e.g., 6.5"
                  />
                  {errors.currentInterestRate && <div className="invalid-feedback d-block">{errors.currentInterestRate}</div>}
                </div>
              </div>
              <div className="col-12 col-lg-4">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Current {currentPaymentFrequency === 'weekly' ? 'Weekly' : 'Monthly'} Payment ($) *</label>
                  <input 
                    type="number" 
                    className={`${getValidationClass(currentPaymentAmount)} form-control-lg`}
                    value={currentPaymentAmount}
                    onChange={(e) => setCurrentPaymentAmount(e.target.value)}
                    placeholder={`e.g., ${currentPaymentFrequency === 'weekly' ? '550' : '2,400'}`}
                  />
                  {errors.currentPaymentAmount && <div className="invalid-feedback d-block">{errors.currentPaymentAmount}</div>}
                </div>
              </div>
            </div>

            <hr className="my-4" />
            
            <h5 className="card-title text-success mb-3">New Loan Details</h5>
            
            <div className="row">
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">New Interest Rate (%) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className={`${getValidationClass(newInterestRate)} form-control-lg`}
                    value={newInterestRate}
                    onChange={(e) => setNewInterestRate(e.target.value)}
                    placeholder="e.g., 5.2"
                  />
                  {errors.newInterestRate && <div className="invalid-feedback d-block">{errors.newInterestRate}</div>}
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">New Loan Term (years) *</label>
                  <input 
                    type="number" 
                    className={`${getValidationClass(newLoanTerm)} form-control-lg`}
                    value={newLoanTerm}
                    onChange={(e) => setNewLoanTerm(e.target.value)}
                    placeholder="e.g., 25"
                  />
                  {errors.newLoanTerm && <div className="invalid-feedback d-block">{errors.newLoanTerm}</div>}
                </div>
              </div>
            </div>
            
            <div className="d-grid gap-2">
              <button className="btn btn-success btn-lg" onClick={calculateRefinance}>
                <i className="bi bi-calculator"></i> Compare Refinance Options
              </button>
            </div>
          </div>
        </div>

        {results && (
          <div className="mt-4">
            <div className="card">
              <div className="card-body">
                <div className="alert alert-info mb-3">
                  <small><strong>Important:</strong> This comparison is based on the information provided and does not include refinancing costs, fees, or other charges that may apply. Please consult with your lender for a complete analysis including all associated costs.</small>
                </div>
                
                <h5>Refinance Comparison</h5>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th></th>
                        <th className="text-center">Current Loan<br/><small className="text-muted">Continue as-is</small></th>
                        <th className="text-center bg-success-subtle">Refinanced Loan<br/><small className="text-muted">New {results.newLoan.loanTerm} year term</small></th>
                        <th className="text-center bg-warning-subtle">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>{results.currentLoan.paymentFrequency === 'weekly' ? 'Weekly' : 'Monthly'} Payment</strong></td>
                        <td className="text-center">
                          {results.currentLoan.paymentFrequency === 'weekly' 
                            ? formatCurrency(results.currentLoan.weeklyPayment)
                            : formatCurrency(results.currentLoan.monthlyPayment)
                          }
                        </td>
                        <td className="text-center">
                          {results.currentLoan.paymentFrequency === 'weekly'
                            ? formatCurrency(results.newLoan.weeklyPayment)
                            : formatCurrency(results.newLoan.monthlyPayment)
                          }
                        </td>
                        <td className="text-center">
                          <span className={results.comparison.paymentDifference < 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                            {results.comparison.paymentDifference < 0 ? '' : '+'}
                            {results.currentLoan.paymentFrequency === 'weekly'
                              ? formatCurrency(Math.abs(Math.round(results.comparison.paymentDifference / (52/12))))
                              : formatCurrency(Math.abs(results.comparison.paymentDifference))
                            }
                            {results.comparison.paymentDifference < 0 ? ' saved' : ' more'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Loan Term</strong></td>
                        <td className="text-center">{results.currentLoan.remainingYears} years</td>
                        <td className="text-center">{results.newLoan.loanTerm} years</td>
                        <td className="text-center">
                          <span className={results.comparison.timeDifference > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                            {results.comparison.timeDifference > 0 ? '+' : ''}
                            {Math.abs(results.comparison.timeDifference)} years
                            {results.comparison.timeDifference > 0 ? ' longer' : ' shorter'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Total Interest</strong></td>
                        <td className="text-center">{formatCurrency(results.currentLoan.remainingInterest)}</td>
                        <td className="text-center">{formatCurrency(results.newLoan.totalInterest)}</td>
                        <td className="text-center">
                          <span className={results.comparison.interestSavings > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                            {results.comparison.interestSavings > 0 ? '' : '+'}
                            {formatCurrency(Math.abs(results.comparison.interestSavings))}
                            {results.comparison.interestSavings > 0 ? ' saved' : ' more'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Total Cost of Loan</strong></td>
                        <td className="text-center">{formatCurrency(results.currentLoan.totalRemaining)}</td>
                        <td className="text-center">{formatCurrency(results.newLoan.totalAmount)}</td>
                        <td className="text-center">
                          <span className={(results.currentLoan.totalRemaining - results.newLoan.totalAmount) > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                            {(results.currentLoan.totalRemaining - results.newLoan.totalAmount) > 0 ? '' : '+'}
                            {formatCurrency(Math.abs(results.currentLoan.totalRemaining - results.newLoan.totalAmount))}
                            {(results.currentLoan.totalRemaining - results.newLoan.totalAmount) > 0 ? ' saved' : ' more'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {results.comparison.interestSavings > 0 && (
                  <div className="alert alert-success">
                    <h6><i className="bi bi-check-circle"></i> Potential Benefits of Refinancing:</h6>
                    <div className="row">
                      <div className="col-12 col-lg-4">
                        <strong>Interest Savings:</strong><br/>
                        <span className="h5 text-success">{formatCurrency(results.comparison.interestSavings)}</span>
                      </div>
                      <div className="col-12 col-lg-4">
                        <strong>Payment Change:</strong><br/>
                        <span className={`h5 ${results.comparison.paymentDifference < 0 ? 'text-success' : 'text-danger'}`}>
                          {results.comparison.paymentDifference < 0 ? '-' : '+'}
                          {formatCurrency(Math.abs(results.comparison.paymentDifference))}/month
                        </span>
                      </div>
                      <div className="col-12 col-lg-4">
                        <strong>Term Change:</strong><br/>
                        <span className={`h5 ${results.comparison.timeDifference > 0 ? 'text-danger' : 'text-success'}`}>
                          {results.comparison.timeDifference > 0 ? '+' : ''}
                          {Math.abs(results.comparison.timeDifference)} years
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {results.comparison.interestSavings <= 0 && (
                  <div className="alert alert-warning">
                    <h6><i className="bi bi-exclamation-triangle"></i> Refinancing May Not Be Beneficial</h6>
                    <p className="mb-0">Based on the provided information, refinancing may result in higher total interest costs. Consider the impact of refinancing fees and whether the new terms meet your financial goals.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default RefinanceCalculator