import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import Home from './components/Home'
import HomeLoanCalculator from './components/HomeLoanCalculator'
import BorrowingCapacityCalculator from './components/AffordabilityCalculator'
import RefinanceCalculator from './components/RefinanceCalculator'
import TakeHomeCalculator from './components/TakeHomeCalculator'
import SimpleInvestmentCalculator from './components/SimpleInvestmentCalculator'

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top shadow-sm">
          <div className="container">
            <Link className="navbar-brand" to="/">Finance Tools</Link>
            <button 
              className="navbar-toggler" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    Loans
                  </a>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/loan-calculator">Loan Calculator</Link></li>
                    <li><Link className="dropdown-item" to="/borrowing-capacity">Borrowing Capacity Calculator</Link></li>
                    <li><Link className="dropdown-item" to="/refinance">Refinance Calculator</Link></li>
                  </ul>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    Salary
                  </a>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/take-home">Take Home Pay Calculator</Link></li>
                  </ul>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    Investment
                  </a>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/simple-investment">Simple Investment Calculator</Link></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="container" style={{marginTop: '80px'}}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/loan-calculator" element={<HomeLoanCalculator />} />
            <Route path="/borrowing-capacity" element={<BorrowingCapacityCalculator />} />
            <Route path="/refinance" element={<RefinanceCalculator />} />
            <Route path="/take-home" element={<TakeHomeCalculator />} />
            <Route path="/simple-investment" element={<SimpleInvestmentCalculator />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App