<script setup lang="ts">
import { onMounted } from 'vue'
import { usePersonalRecords } from '@/composables/usePersonalRecords'
import PersonalRecordCard from '@/components/PersonalRecordCard.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

const { records, loading, progress, loadingDetails, detailProgress, detailTotal, allFetched, fetchAll } = usePersonalRecords()

onMounted(() => {
  if (!allFetched.value) {
    fetchAll()
  }
})
</script>

<template>
  <div>
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Personal Records</h1>
        <p class="text-body-1 text-medium-emphasis">Best times for standard distances</p>
      </div>
    </div>

    <div v-if="loading" class="text-center mb-6">
      <v-progress-circular indeterminate color="primary" size="48" class="mb-2" />
      <p class="text-body-1 text-medium-emphasis">
        Loading activities... {{ progress }} fetched
      </p>
    </div>

    <div v-else-if="loadingDetails" class="text-center mb-6">
      <v-progress-linear
        :model-value="detailTotal > 0 ? (detailProgress / detailTotal) * 100 : 0"
        color="primary"
        class="mb-2"
        rounded
      />
      <p class="text-body-1 text-medium-emphasis">
        Fetching run details... {{ detailProgress }} / {{ detailTotal }}
      </p>
    </div>

    <LoadingOverlay :loading="false" />

    <v-row>
      <v-col
        v-for="record in records"
        :key="record.distance"
        cols="12"
        sm="6"
        lg="3"
      >
        <PersonalRecordCard :record="record" />
      </v-col>
    </v-row>
  </div>
</template>
