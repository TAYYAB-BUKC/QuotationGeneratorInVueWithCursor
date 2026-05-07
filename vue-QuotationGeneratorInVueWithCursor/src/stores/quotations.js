import { defineStore } from 'pinia'

export const useQuotationStore = defineStore('quotations', {
  state: () => ({
    quotations: []
  }),
  actions: {
    createQuotation(payload) {
      this.quotations.unshift({
        ...payload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      })
    },
    updateQuotation(id, payload) {
      const index = this.quotations.findIndex((item) => item.id === id)
      if (index === -1) {
        return
      }

      this.quotations[index] = {
        ...this.quotations[index],
        ...payload
      }
    },
    deleteQuotation(id) {
      this.quotations = this.quotations.filter((item) => item.id !== id)
    }
  },
  persist: {
    key: 'quotation-management-store'
  }
})
