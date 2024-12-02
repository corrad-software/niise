<script setup>
import { useLayoutStore } from "~/stores/layout";
import { useWindowSize } from "vue-window-size";

const layoutStore = useLayoutStore();
const mobileWidth = layoutStore.mobileWidth;

const { width } = useWindowSize();
const windowWidth = ref(width);

const props = defineProps({
  events: {
    type: Array,
    required: true,
  },
});

const isMobile = computed(() => {
  return windowWidth.value < mobileWidth;
});

const getTimeDifference = (currentDate, nextDate) => {
  if (!nextDate) return "";

  // Parse dates and ensure they're in the correct timezone
  const current = new Date(currentDate);
  const next = new Date(nextDate);

  // Calculate difference in milliseconds
  const diff = Math.abs(current - next);

  // Convert to minutes
  const minutes = Math.floor(diff / (1000 * 60));

  // If less than 1 minute
  if (minutes < 1) {
    return "1 minit";
  }

  // If less than 60 minutes
  if (minutes < 60) {
    return `${minutes} minit`;
  }

  // If less than 24 hours
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} jam`;
  }

  // If more than 24 hours
  const days = Math.floor(hours / 24);
  return `${days} hari`;
};

const getStatusColor = (type) => {
  switch (type) {
    case "creation":
      return "bg-gray-500";
    case "semakan":
      return "bg-blue-500";
    case "approval":
      return "bg-green-500";
    case "penerimaan":
      return "bg-success";
    case "penolakan":
      return "bg-danger";
    default:
      return "bg-gray-500";
  }
};

const formatDate = (date) => {
  return (
    new Date(date).toLocaleDateString("ms-MY", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " PTG"
  );
};

const getStatusIcon = (type) => {
  switch (type) {
    case "creation":
      return "ph:plus";
    case "semakan":
      return "ph:check";
    case "approval":
      return "ph:shield-check";
    case "penerimaan":
      return "ph:check-circle";
    case "penolakan":
      return "ph:x-circle";
    default:
      return "ph:plus";
  }
};

const getStatusText = (event) => {
  const statusMap = {
    creation: "Permohonan Didaftarkan",
    semakan: "Semakan Dilakukan",
    approval: event.status,
    penerimaan: "Permohonan Diterima",
    penolakan: "Permohonan Ditolak",
  };
  return statusMap[event.type] || event.status;
};

// Compute events with time differences
const eventsWithTimeDiff = computed(() => {
  const sortedEvents = [...props.events].reverse();
  return sortedEvents.map((event, index) => {
    const previousEvent = index > 0 ? sortedEvents[index - 1] : null;
    return {
      ...event,
      timeDiff: previousEvent
        ? getTimeDifference(previousEvent.date, event.date)
        : "",
    };
  });
});
</script>

<template>
  <div class="flow-root">
    <ul role="list">
      <li v-for="(event, eventIdx) in eventsWithTimeDiff" :key="eventIdx">
        <div class="relative pb-12">
          <span
            v-if="eventIdx !== events.length - 1"
            class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
            aria-hidden="true"
          />
          <div class="relative flex gap-x-4">
            <div class="relative">
              <span
                :class="[
                  getStatusColor(event.type),
                  'h-8 w-8 rounded-full flex items-center justify-center',
                ]"
              >
                <Icon
                  :name="getStatusIcon(event.type)"
                  class="h-5 w-5 text-white"
                />
              </span>
            </div>
            <div class="flex-1">
              <div
                :class="[
                  'flex gap-x-4',
                  isMobile ? 'flex-col' : 'justify-between',
                ]"
              >
                <div :class="[isMobile ? 'mb-2' : '']">
                  <div class="flex items-baseline gap-x-2">
                    <span class="font-medium text-gray-900">{{
                      getStatusText(event)
                    }}</span>
                    <span v-if="event.details" class="text-gray-500">{{
                      event.details
                    }}</span>
                  </div>
                  <div v-if="event.user" class="mt-1">
                    <p class="text-sm text-gray-500">
                      {{ event.user.pangkat }} {{ event.user.nama }} ({{
                        event.user.noPegawai
                      }})
                    </p>
                  </div>
                </div>
                <div :class="[isMobile ? 'text-left' : 'flex-none text-right']">
                  <p class="text-sm text-gray-500">
                    {{ formatDate(event.date) }}
                  </p>
                  <p
                    v-if="event.timeDiff && eventIdx !== 0"
                    class="text-xs text-red-400 mt-1"
                  >
                    Kurang dari {{ event.timeDiff }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
@media (max-width: 640px) {
  .timeline-container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
