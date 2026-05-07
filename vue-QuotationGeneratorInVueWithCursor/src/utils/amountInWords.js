const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen'
]

const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function twoDigitToWords(number) {
  if (number < 20) {
    return ONES[number]
  }

  const tens = Math.floor(number / 10)
  const remainder = number % 10
  return `${TENS[tens]}${remainder ? ` ${ONES[remainder]}` : ''}`
}

function threeDigitToWords(number) {
  const hundreds = Math.floor(number / 100)
  const remainder = number % 100

  if (!hundreds) {
    return twoDigitToWords(remainder)
  }

  const hundredsPart = `${ONES[hundreds]} Hundred`
  const remainderPart = remainder ? ` ${twoDigitToWords(remainder)}` : ''
  return `${hundredsPart}${remainderPart}`
}

function integerToWords(value) {
  if (value === 0) {
    return 'Zero'
  }

  const parts = []
  const crore = Math.floor(value / 10000000)
  const lakh = Math.floor((value % 10000000) / 100000)
  const thousand = Math.floor((value % 100000) / 1000)
  const hundreds = value % 1000

  if (crore) {
    parts.push(`${threeDigitToWords(crore)} Crore`)
  }
  if (lakh) {
    parts.push(`${threeDigitToWords(lakh)} Lakh`)
  }
  if (thousand) {
    parts.push(`${threeDigitToWords(thousand)} Thousand`)
  }
  if (hundreds) {
    parts.push(threeDigitToWords(hundreds))
  }

  return parts.join(' ')
}

export function toPkrWords(amount) {
  const safeAmount = Number(amount) || 0
  const rupees = Math.floor(safeAmount)
  const paisa = Math.round((safeAmount - rupees) * 100)

  const rupeesWords = integerToWords(rupees)
  const paisaWords = paisa ? ` and ${integerToWords(paisa)} Paisa` : ''

  return `PKR ${rupeesWords} Rupees${paisaWords} Only`
}
