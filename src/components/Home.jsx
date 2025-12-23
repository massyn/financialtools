import React from 'react'

function Home() {
  return (
    <div className="row">
      <div className="col-md-8 mx-auto">
        <h1 className="text-center mb-4">Finance Tools</h1>
        
        <div className="alert alert-warning" role="alert">
          <strong>Disclaimer:</strong> This is general advice, and particular circumstances may alter the results. 
          Please consult with a financial advisor for personalized advice.
        </div>

        <div className="mt-5">
          <h3 className="mb-4">Available Finance Tools</h3>
          
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-primary">
                <tr>
                  <th>Tool</th>
                  <th>Description</th>
                  <th>Key Features</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Loan Calculator</strong>
                    <br/>
                    <small className="text-muted">Loan Payment Analysis</small>
                  </td>
                  <td>
                    Calculate your loan repayments, total interest, and view detailed amortization schedules for any loan type.
                  </td>
                  <td>
                    <ul className="mb-0 ps-3">
                      <li>Monthly/Weekly payments</li>
                      <li>Amortization tables</li>
                      <li>Extra payment impact</li>
                      <li>Interest savings analysis</li>
                    </ul>
                  </td>
                  <td>
                    <a href="/loan-calculator" className="btn btn-primary">
                      <i className="bi bi-calculator"></i> Calculate
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Borrowing Capacity Calculator</strong>
                    <br/>
                    <small className="text-muted">Maximum Loan Amount</small>
                  </td>
                  <td>
                    Determine the maximum loan amount you could potentially borrow based on your payment capacity.
                  </td>
                  <td>
                    <ul className="mb-0 ps-3">
                      <li>Payment-based analysis</li>
                      <li>Multiple term options</li>
                      <li>Interest comparison</li>
                      <li>Indicative results</li>
                    </ul>
                  </td>
                  <td>
                    <a href="/borrowing-capacity" className="btn btn-primary">
                      <i className="bi bi-calculator"></i> Calculate
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Refinance Calculator</strong>
                    <br/>
                    <small className="text-muted">Loan Comparison Tool</small>
                  </td>
                  <td>
                    Compare your current loan with potential refinance options to identify potential savings.
                  </td>
                  <td>
                    <ul className="mb-0 ps-3">
                      <li>Side-by-side comparison</li>
                      <li>Interest savings analysis</li>
                      <li>Payment difference tracking</li>
                      <li>Total cost evaluation</li>
                    </ul>
                  </td>
                  <td>
                    <a href="/refinance" className="btn btn-primary">
                      <i className="bi bi-calculator"></i> Calculate
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Take Home Pay Calculator</strong>
                    <br/>
                    <small className="text-muted">Salary & Tax Analysis</small>
                  </td>
                  <td>
                    Calculate your take-home pay after tax, superannuation, and Medicare levy based on Australian tax rates.
                  </td>
                  <td>
                    <ul className="mb-0 ps-3">
                      <li>Australian tax brackets</li>
                      <li>Superannuation calculations</li>
                      <li>Medicare levy inclusion</li>
                      <li>Multiple tax year support</li>
                    </ul>
                  </td>
                  <td>
                    <a href="/take-home" className="btn btn-primary">
                      <i className="bi bi-calculator"></i> Calculate
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Simple Investment Calculator</strong>
                    <br/>
                    <small className="text-muted">Growth & Compound Interest</small>
                  </td>
                  <td>
                    Calculate your investment growth with compound interest based on regular monthly contributions.
                  </td>
                  <td>
                    <ul className="mb-0 ps-3">
                      <li>Monthly contribution planning</li>
                      <li>Compound interest calculations</li>
                      <li>Simple vs compound comparison</li>
                      <li>Long-term growth projections</li>
                    </ul>
                  </td>
                  <td>
                    <a href="/simple-investment" className="btn btn-primary">
                      <i className="bi bi-graph-up-arrow"></i> Calculate
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="alert alert-light mt-4">
            <small className="text-muted">
              <i className="bi bi-info-circle"></i>
              <strong>Quick Tip:</strong> All calculators support both monthly and weekly payment frequencies. 
              Start with any tool that matches your current financial planning needs.
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home