<script setup lang="ts">
import { buildAuthUrl } from '@/services/strava-auth'

const authUrl = buildAuthUrl()
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-8 text-center">
          <v-icon icon="mdi-run" size="64" color="primary" class="mb-4" />
          <v-card-title class="text-h4 font-weight-bold mb-2">
            Strava Dashboard
          </v-card-title>
          <v-card-subtitle class="text-body-1 mb-6">
            Track your running progress
          </v-card-subtitle>
          <v-card-actions class="justify-center">
            <v-btn
              :href="authUrl"
              color="primary"
              size="large"
              variant="flat"
              prepend-icon="mdi-strava"
            >
              Connect with Strava
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
