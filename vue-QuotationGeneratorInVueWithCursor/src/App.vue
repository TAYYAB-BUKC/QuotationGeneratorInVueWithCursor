<script setup>
import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuotationStore } from './stores/quotations'
import { toPkrWords } from './utils/amountInWords'
import {
  downloadAllQuotationsPdf,
  downloadAllQuotationsWord,
  downloadQuotationPdf,
  downloadQuotationWord
} from './utils/quotationDocuments'

const quotationStore = useQuotationStore()
const { quotations } = storeToRefs(quotationStore)

const baseUnits = ['EACH', 'NUMBER', 'PAIR']
const units = ref([...baseUnits])
const customUnit = ref('')
const editingId = ref('')

const form = reactive({
  lprNo: '',
  openingDate: '',
  nsn: '',
  qty: '',
  unit: baseUnits[0],
  partNo: '',
  parentEquipment: '',
  description: '',
  countryOfOrigin: '',
  make: '',
  model: '',
  itConform: 'Yes',
  validity: '',
  unitPrice: '',
  dealerCertificate: '',
  deliveryPeriod: '',
  note: ''
})

const totalPrice = computed(() => {
  const qty = Number(form.qty) || 0
  const unitPrice = Number(form.unitPrice) || 0
  return qty * unitPrice
})

const amountInWords = computed(() => toPkrWords(totalPrice.value))

function addCustomUnit() {
  const value = customUnit.value.trim().toUpperCase()
  if (!value || units.value.includes(value)) {
    customUnit.value = ''
    return
  }
  units.value.push(value)
  form.unit = value
  customUnit.value = ''
}

function resetForm() {
  editingId.value = ''
  form.lprNo = ''
  form.openingDate = ''
  form.nsn = ''
  form.qty = ''
  form.unit = units.value[0] || 'EACH'
  form.partNo = ''
  form.parentEquipment = ''
  form.description = ''
  form.countryOfOrigin = ''
  form.make = ''
  form.model = ''
  form.itConform = 'Yes'
  form.validity = ''
  form.unitPrice = ''
  form.dealerCertificate = ''
  form.deliveryPeriod = ''
  form.note = ''
}

function submitQuotation() {
  const payload = {
    lprNo: form.lprNo.trim(),
    openingDate: form.openingDate,
    nsn: form.nsn.trim(),
    qty: Number(form.qty),
    unit: form.unit,
    partNo: form.partNo.trim(),
    parentEquipment: form.parentEquipment.trim(),
    description: form.description.trim(),
    countryOfOrigin: form.countryOfOrigin.trim(),
    make: form.make.trim(),
    model: form.model.trim(),
    itConform: form.itConform,
    validity: form.validity.trim(),
    unitPrice: Number(form.unitPrice),
    totalPrice: totalPrice.value,
    amountInWords: amountInWords.value,
    dealerCertificate: form.dealerCertificate.trim(),
    deliveryPeriod: form.deliveryPeriod.trim(),
    note: form.note.trim()
  }

  if (editingId.value) {
    quotationStore.updateQuotation(editingId.value, payload)
  } else {
    quotationStore.createQuotation(payload)
  }
  resetForm()
}

function editQuotation(record) {
  editingId.value = record.id
  form.lprNo = record.lprNo
  form.openingDate = record.openingDate
  form.nsn = record.nsn
  form.qty = record.qty
  form.unit = record.unit
  if (!units.value.includes(record.unit)) {
    units.value.push(record.unit)
  }
  form.partNo = record.partNo
  form.parentEquipment = record.parentEquipment
  form.description = record.description
  form.countryOfOrigin = record.countryOfOrigin
  form.make = record.make
  form.model = record.model
  form.itConform = record.itConform
  form.validity = record.validity
  form.unitPrice = record.unitPrice
  form.dealerCertificate = record.dealerCertificate
  form.deliveryPeriod = record.deliveryPeriod
  form.note = record.note
}
</script>

<template>
  <main class="page">
    <h1>Quotation Management</h1>

    <form class="form-grid" @submit.prevent="submitQuotation">
      <label>
        <span>LPR NO</span>
        <input v-model.trim="form.lprNo" required />
      </label>
      <label>
        <span>OPENING DATE</span>
        <input v-model="form.openingDate" type="date" required />
      </label>
      <label>
        <span>NSN</span>
        <input v-model.trim="form.nsn" required />
      </label>
      <label>
        <span>QTY</span>
        <input v-model.number="form.qty" type="number" min="0" step="1" required />
      </label>

      <div class="unit-block">
        <label>
          <span>UNIT</span>
          <select v-model="form.unit" required>
            <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
          </select>
        </label>
        <div class="custom-unit">
          <input v-model="customUnit" placeholder="Add custom unit" />
          <button type="button" @click="addCustomUnit">Add</button>
        </div>
      </div>

      <label>
        <span>PART NO</span>
        <input v-model.trim="form.partNo" required />
      </label>
      <label>
        <span>PARENT EQUIPMENT</span>
        <input v-model.trim="form.parentEquipment" required />
      </label>
      <label class="full">
        <span>DESCRIPTION</span>
        <textarea v-model.trim="form.description" rows="3" required />
      </label>
      <label>
        <span>COUNTRY OF ORIGIN</span>
        <input v-model.trim="form.countryOfOrigin" required />
      </label>
      <label>
        <span>MAKE</span>
        <input v-model.trim="form.make" required />
      </label>
      <label>
        <span>MODEL</span>
        <input v-model.trim="form.model" required />
      </label>
      <label>
        <span>IT CONFORM</span>
        <select v-model="form.itConform" required>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </label>
      <label>
        <span>VALIDITY</span>
        <input v-model.trim="form.validity" required />
      </label>
      <label>
        <span>UNIT PRICE WITH GST</span>
        <input v-model.number="form.unitPrice" type="number" min="0" step="0.01" required />
      </label>
      <label>
        <span>AUTHORIZE DEALER CERTIFICATE</span>
        <input v-model.trim="form.dealerCertificate" required />
      </label>
      <label>
        <span>TOTAL PRICE WITH GST</span>
        <input :value="totalPrice.toFixed(2)" disabled />
      </label>
      <label class="full">
        <span>AMOUNT IN WORDS</span>
        <input :value="amountInWords" disabled />
      </label>
      <label>
        <span>DELIVERY PERIOD</span>
        <input v-model.trim="form.deliveryPeriod" required />
      </label>
      <label class="full">
        <span>NOTE</span>
        <textarea v-model.trim="form.note" rows="2" required />
      </label>

      <div class="actions full">
        <button type="submit">{{ editingId ? 'Update Quotation' : 'Create Quotation' }}</button>
        <button type="button" class="secondary" @click="resetForm">Reset</button>
        <button
          type="button"
          class="secondary"
          :disabled="!quotations.length"
          @click="downloadAllQuotationsPdf(quotations)"
        >
          Download All PDF
        </button>
        <button
          type="button"
          class="secondary"
          :disabled="!quotations.length"
          @click="downloadAllQuotationsWord(quotations)"
        >
          Download All Word
        </button>
      </div>
    </form>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>LPR NO</th>
            <th>NSN</th>
            <th>QTY</th>
            <th>UNIT</th>
            <th>TOTAL PRICE</th>
            <th>OPENING DATE</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!quotations.length">
            <td colspan="7" class="empty">No quotations yet.</td>
          </tr>
          <tr v-for="item in quotations" :key="item.id">
            <td>{{ item.lprNo }}</td>
            <td>{{ item.nsn }}</td>
            <td>{{ item.qty }}</td>
            <td>{{ item.unit }}</td>
            <td>{{ Number(item.totalPrice).toFixed(2) }}</td>
            <td>{{ item.openingDate }}</td>
            <td class="table-actions">
              <button type="button" @click="editQuotation(item)">Edit</button>
              <button type="button" class="danger" @click="quotationStore.deleteQuotation(item.id)">
                Delete
              </button>
              <button type="button" class="secondary" @click="downloadQuotationPdf(item)">
                Download PDF
              </button>
              <button type="button" class="secondary" @click="downloadQuotationWord(item)">
                Download Word
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

.page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px;
  color: #151515;
  font-family: Arial, sans-serif;
}

h1 {
  margin-top: 0;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}

input,
textarea,
select,
button {
  border: 1px solid #d5d5d5;
  border-radius: 6px;
  padding: 8px 10px;
  font: inherit;
}

textarea {
  resize: vertical;
}

.full {
  grid-column: 1 / -1;
}

.unit-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.custom-unit {
  display: flex;
  gap: 8px;
}

button {
  background: #1f2937;
  color: #fff;
  border: none;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secondary {
  background: #4b5563;
}

.danger {
  background: #dc2626;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #e5e7eb;
  padding: 8px;
  text-align: left;
  font-size: 13px;
}

th {
  background: #f3f4f6;
}

.table-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.empty {
  text-align: center;
}

@media (max-width: 800px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
