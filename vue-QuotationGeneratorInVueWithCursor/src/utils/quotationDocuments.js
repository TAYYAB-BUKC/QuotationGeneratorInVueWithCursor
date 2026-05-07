import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx'
import { saveAs } from 'file-saver'

const FIELD_LABELS = [
  ['LPR NO', 'lprNo'],
  ['OPENING DATE', 'openingDate'],
  ['NSN', 'nsn'],
  ['QTY', 'qty'],
  ['UNIT', 'unit'],
  ['PART NO', 'partNo'],
  ['PARENT EQUIPMENT', 'parentEquipment'],
  ['DESCRIPTION', 'description'],
  ['COUNTRY OF ORIGIN', 'countryOfOrigin'],
  ['MAKE', 'make'],
  ['MODEL', 'model'],
  ['IT CONFORM', 'itConform'],
  ['VALIDITY', 'validity'],
  ['UNIT PRICE WITH GST', 'unitPrice'],
  ['AUTHORIZE DEALER CERTIFICATE', 'dealerCertificate'],
  ['TOTAL PRICE WITH GST', 'totalPrice'],
  ['AMOUNT IN WORDS', 'amountInWords'],
  ['DELIVERY PERIOD', 'deliveryPeriod'],
  ['NOTE', 'note']
]

function toDisplayValue(record, key) {
  if (key === 'unitPrice' || key === 'totalPrice') {
    return Number(record[key] || 0).toFixed(2)
  }
  return `${record[key] ?? ''}`
}

export function downloadQuotationPdf(record) {
  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text('Quotation Record', 14, 15)

  autoTable(doc, {
    startY: 22,
    head: [['Field', 'Value']],
    body: FIELD_LABELS.map(([label, key]) => [label, toDisplayValue(record, key)]),
    styles: { fontSize: 10, cellPadding: 2.5 },
    headStyles: { fillColor: [28, 28, 28] },
    columnStyles: {
      0: { cellWidth: 62 },
      1: { cellWidth: 120 }
    }
  })

  doc.save(`quotation-${record.lprNo || record.id}.pdf`)
}

export function downloadAllQuotationsPdf(records) {
  const doc = new jsPDF()
  records.forEach((record, index) => {
    if (index > 0) {
      doc.addPage()
    }
    doc.setFontSize(14)
    doc.text(`Quotation Record ${index + 1}`, 14, 15)

    autoTable(doc, {
      startY: 22,
      head: [['Field', 'Value']],
      body: FIELD_LABELS.map(([label, key]) => [label, toDisplayValue(record, key)]),
      styles: { fontSize: 10, cellPadding: 2.5 },
      headStyles: { fillColor: [28, 28, 28] },
      columnStyles: {
        0: { cellWidth: 62 },
        1: { cellWidth: 120 }
      }
    })
  })

  doc.save('quotations-all.pdf')
}

function createDocxTableRows(record) {
  return FIELD_LABELS.map(
    ([label, key]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })]
          }),
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            children: [new Paragraph(toDisplayValue(record, key))]
          })
        ]
      })
  )
}

export async function downloadQuotationWord(record) {
  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: 'Quotation Record', heading: 'Heading1' }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: createDocxTableRows(record)
          })
        ]
      }
    ]
  })

  const blob = await Packer.toBlob(document)
  saveAs(blob, `quotation-${record.lprNo || record.id}.docx`)
}

export async function downloadAllQuotationsWord(records) {
  const sections = records.map((record, index) => ({
    children: [
      new Paragraph({ text: `Quotation Record ${index + 1}`, heading: 'Heading1' }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: createDocxTableRows(record)
      })
    ]
  }))

  const document = new Document({ sections })
  const blob = await Packer.toBlob(document)
  saveAs(blob, 'quotations-all.docx')
}
