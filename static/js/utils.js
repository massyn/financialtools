/**
 * Shared utility functions for Finance Tools calculators
 */

const FinanceUtils = {
  /**
   * Format a number as currency (AUD)
   * @param {number|string} amount - The amount to format
   * @returns {string} Formatted currency string (e.g., "$123,456")
   */
  formatCurrency(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) return '$0';
    return '$' + Math.round(num).toLocaleString();
  },

  /**
   * Validate that a value is required, non-empty, and a positive number
   * @param {any} value - The value to validate
   * @returns {boolean} True if valid, false otherwise
   */
  validateRequired(value) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return false;
    }
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  },

  /**
   * Set validation state on an input element (Bootstrap 5 classes)
   * @param {HTMLElement} input - The input element
   * @param {boolean} isValid - Whether the input is valid
   * @param {string} message - Error message to display (if invalid)
   */
  setValidation(input, isValid, message = '') {
    // Remove existing validation classes
    input.classList.remove('is-valid', 'is-invalid');

    // Remove existing feedback
    const existingFeedback = input.parentElement.querySelector('.invalid-feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }

    if (isValid) {
      input.classList.add('is-valid');
    } else {
      input.classList.add('is-invalid');

      // Add error message if provided
      if (message) {
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = message;
        input.parentElement.appendChild(feedback);
      }
    }
  },

  /**
   * Clear all validation states from a form
   * @param {HTMLFormElement} form - The form element
   */
  clearValidation(form) {
    const inputs = form.querySelectorAll('.form-control, .form-select');
    inputs.forEach(input => {
      input.classList.remove('is-valid', 'is-invalid');
    });

    const feedbacks = form.querySelectorAll('.invalid-feedback');
    feedbacks.forEach(feedback => feedback.remove());
  },

  /**
   * Format a number with commas (no currency symbol)
   * @param {number|string} num - The number to format
   * @returns {string} Formatted number string
   */
  formatNumber(num) {
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return '0';
    return Math.round(parsed).toLocaleString();
  },

  /**
   * Format a number as percentage
   * @param {number|string} num - The number to format (e.g., 0.055 or 5.5)
   * @param {number} decimals - Number of decimal places (default: 2)
   * @returns {string} Formatted percentage string (e.g., "5.50%")
   */
  formatPercent(num, decimals = 2) {
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return '0%';
    return parsed.toFixed(decimals) + '%';
  }
};

// Make available globally
window.FinanceUtils = FinanceUtils;
