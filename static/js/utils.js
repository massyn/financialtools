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
  },

  /**
   * URL Parameter & Sharing Functions
   */

  /**
   * Load form values from URL parameters
   * @param {Array<string>} fieldIds - Array of form field IDs to populate
   */
  loadFromUrlParams(fieldIds) {
    const urlParams = new URLSearchParams(window.location.search);

    fieldIds.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (!element) return;

      const value = urlParams.get(fieldId);
      if (value !== null) {
        element.value = value;
      }
    });
  },

  /**
   * Generate a shareable URL with current form field values
   * @param {Array<string>} fieldIds - Array of form field IDs to include
   * @returns {string} URL with query parameters
   */
  generateShareUrl(fieldIds) {
    const params = new URLSearchParams();

    fieldIds.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (!element) return;

      const value = element.value;
      if (value !== null && value !== '') {
        params.set(fieldId, value);
      }
    });

    const baseUrl = window.location.origin + window.location.pathname;
    const queryString = params.toString();

    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  },

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (e) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  },

  /**
   * Setup share button functionality
   * @param {Array<string>} fieldIds - Array of form field IDs to include in share URL
   * @param {string} buttonId - ID of the share button element
   */
  setupShareButton(fieldIds, buttonId) {
    const shareButton = document.getElementById(buttonId);
    if (!shareButton) {
      console.warn(`Share button with ID '${buttonId}' not found`);
      return;
    }

    shareButton.addEventListener('click', async () => {
      const shareUrl = FinanceUtils.generateShareUrl(fieldIds);
      const success = await FinanceUtils.copyToClipboard(shareUrl);

      // Show feedback
      const originalHtml = shareButton.innerHTML;
      if (success) {
        shareButton.innerHTML = '<i class="bi bi-check-circle"></i> Copied!';
        shareButton.classList.remove('btn-outline-primary');
        shareButton.classList.add('btn-success');

        setTimeout(() => {
          shareButton.innerHTML = originalHtml;
          shareButton.classList.remove('btn-success');
          shareButton.classList.add('btn-outline-primary');
        }, 2000);
      } else {
        shareButton.innerHTML = '<i class="bi bi-x-circle"></i> Failed';
        shareButton.classList.add('btn-danger');

        setTimeout(() => {
          shareButton.innerHTML = originalHtml;
          shareButton.classList.remove('btn-danger');
        }, 2000);
      }
    });
  }
};

// Make available globally
window.FinanceUtils = FinanceUtils;
