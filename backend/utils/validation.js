exports.validateCardNumber = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(number)) return false;
    let sum = 0, isEven = false;
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };
  
  exports.validateExpiryDate = (expiryDate) => {
    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear() % 100;
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    return expMonth >= 1 && expMonth <= 12 && (expYear > currentYear || (expYear === currentYear && expMonth >= currentMonth));
  };
  
  