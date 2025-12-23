export const formatCurrency = (amount) => {
  const num = parseFloat(amount)
  if (isNaN(num)) return '$0'
  return '$' + Math.round(num).toLocaleString()
}

export const validateRequired = (value) => {
  return value && value.trim() !== '' && !isNaN(parseFloat(value)) && parseFloat(value) > 0
}

export const getValidationClass = (value, isRequired = true) => {
  if (!isRequired) return 'form-control'
  return validateRequired(value) ? 'form-control' : 'form-control is-invalid'
}

export const getValidationMessage = (fieldName, value, isRequired = true) => {
  if (!isRequired) return ''
  if (!value || value.trim() === '') {
    return `${fieldName} is required`
  }
  if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
    return `${fieldName} must be a valid positive number`
  }
  return ''
}