import React, { useState } from 'react'
import { formatCurrency, validateRequired, getValidationClass, getValidationMessage } from '../utils/formatters'

function BorrowingCapacityCalculator() {
  const [monthlyPayment, setMonthlyPayment] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [paymentFrequency, setPaymentFrequency] = useState('monthly')
  const [results, setResults] = useState(null)
  const [errors, setErrors] = useState({})

  const calculateBorrowingCapacity = () => {
    const newErrors = {}
    
    if (!validateRequired(monthlyPayment)) {
      newErrors.monthlyPayment = getValidationMessage('Monthly Payment', monthlyPayment)
    }
    if (!validateRequired(interestRate)) {
      newErrors.interestRate = getValidationMessage('Interest Rate', interestRate)
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return
    }

    const payment = parseFloat(monthlyPayment)
    const annualRate = parseFloat(interestRate) / 100
    const monthlyRate = annualRate / 12
    const isWeekly = paymentFrequency === 'weekly'
    const actualMonthlyPayment = isWeekly ? payment * (52/12) : payment

    const affordabilityData = []

    for (let years = 5; years <= 35; years += 5) {
      const numberOfPayments = years * 12
      
      const loanAmount = actualMonthlyPayment * ((1 - Math.pow(1 + monthlyRate, -numberOfPayments)) / monthlyRate)
      const totalPayment = actualMonthlyPayment * numberOfPayments
      const totalInterest = totalPayment - loanAmount

      affordabilityData.push({
        years,
        loanAmount: Math.round(loanAmount),
        totalPayment: Math.round(totalPayment),
        totalInterest: Math.round(totalInterest)
      })
    }

    setResults({
      data: affordabilityData,
      paymentFrequency,
      originalPayment: payment
    })
  }

  return (
    <div className="row">
      <div className="col-12 col-lg-10 col-xl-8 mx-auto">
        <h2 className="text-center mb-4">Borrowing Capacity Calculator</h2>
        
        <div className="card border-primary shadow-sm">
          <div className="card-body bg-light">
            <h5 className="card-title text-primary mb-3">Borrowing Capacity Details</h5>
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
                  <label className="form-label fw-bold text-dark">{paymentFrequency === 'weekly' ? 'Weekly' : 'Monthly'} Payment Amount ($) *</label>
                  <input 
                    type="number" 
                    className={`${getValidationClass(monthlyPayment)} form-control-lg`}
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(e.target.value)}
                    placeholder={`e.g., ${paymentFrequency === 'weekly' ? '600' : '2,500'}`}
                  />
                  {errors.monthlyPayment && <div className="invalid-feedback d-block">{errors.monthlyPayment}</div>}
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
            
            <div className="d-grid gap-2">
              <button className="btn btn-primary btn-lg" onClick={calculateBorrowingCapacity}>
                <i className="bi bi-calculator"></i> Calculate Borrowing Capacity
              </button>
            </div>
          </div>
        </div>

        {results && (
          <div className="mt-4">
            <div className="card">
              <div className="card-body">
                <div className="alert alert-warning mb-3">
                  <small><strong>Important:</strong> While this calculator shows what the mathematics suggest you could potentially borrow, please note that banks and lenders use additional criteria to assess your eligibility, including income verification, credit history, existing debts, and lending policies. These results are indicative only and should be used as a starting point for your research.</small>
                </div>
                
                <h5>Borrowing Capacity Analysis</h5>
                <p className="text-muted">Based on a {results.paymentFrequency} payment of {formatCurrency(results.originalPayment)} at {interestRate}% interest rate:</p>
                
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Loan Term (Years)</th>
                        <th>Maximum Loan Amount</th>
                        <th>Total Amount Paid</th>
                        <th>Total Interest Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.data.map((row, index) => (
                        <tr key={index}>
                          <td>{row.years}</td>
                          <td>{formatCurrency(row.loanAmount)}</td>
                          <td>{formatCurrency(row.totalPayment)}</td>
                          <td>{formatCurrency(row.totalInterest)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="alert alert-info mt-3">
                  <small>
                    <strong>Note:</strong> These calculations assume a fixed interest rate and do not include 
                    additional costs such as insurance, taxes, or fees. Actual loan terms may vary based on 
                    your credit score, income, and other factors.
                  </small>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BorrowingCapacityCalculator