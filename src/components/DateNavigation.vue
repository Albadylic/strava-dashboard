<script setup lang="ts">
import { ref, watch } from 'vue'
import { addWeeks, addMonths } from 'date-fns'

const props = defineProps<{
  label: string
  modelValue: Date
  isCurrentPeriod: boolean
  mode: 'week' | 'month'
}>()

const emit = defineEmits<{
  'update:modelValue': [date: Date]
}>()

const menuOpen = ref(false)
const pickerMonth = ref(props.modelValue.getMonth())
const pickerYear = ref(props.modelValue.getFullYear())

watch(() => props.modelValue, (val) => {
  pickerMonth.value = val.getMonth()
  pickerYear.value = val.getFullYear()
})

function prev() {
  const newDate = props.mode === 'week'
    ? addWeeks(props.modelValue, -1)
    : addMonths(props.modelValue, -1)
  emit('update:modelValue', newDate)
}

function next() {
  const newDate = props.mode === 'week'
    ? addWeeks(props.modelValue, 1)
    : addMonths(props.modelValue, 1)
  emit('update:modelValue', newDate)
}

function today() {
  emit('update:modelValue', new Date())
}

function onDatePicked(date: unknown) {
  menuOpen.value = false
  if (date instanceof Date) {
    emit('update:modelValue', date)
  }
}

function onMonthPicked(month: number) {
  menuOpen.value = false
  emit('update:modelValue', new Date(pickerYear.value, month, 1))
}
</script>

<template>
  <div class="d-flex align-center ga-1">
    <v-btn icon variant="text" size="small" @click="prev">
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>

    <v-menu v-model="menuOpen" :close-on-content-click="false">
      <template #activator="{ props: menuProps }">
        <v-btn variant="text" v-bind="menuProps">
          <v-icon start>mdi-calendar</v-icon>
          {{ label }}
        </v-btn>
      </template>
      <v-date-picker
        v-if="mode === 'month'"
        :view-mode="'months'"
        :month="pickerMonth"
        :year="pickerYear"
        @update:month="onMonthPicked"
        @update:year="(y: number) => pickerYear = y"
      />
      <v-date-picker
        v-else
        :model-value="modelValue"
        @update:model-value="onDatePicked"
        show-adjacent-months
        first-day-of-week="1"
      />
    </v-menu>

    <v-btn
      icon
      variant="text"
      size="small"
      :disabled="isCurrentPeriod"
      @click="next"
    >
      <v-icon>mdi-chevron-right</v-icon>
    </v-btn>

    <v-btn
      v-if="!isCurrentPeriod"
      variant="tonal"
      size="small"
      @click="today"
    >
      Today
    </v-btn>
  </div>
</template>
