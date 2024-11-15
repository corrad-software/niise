export function buildNuxtTemplate({ title, name }) {
  return `<script setup>
    definePageMeta({
      title: "${title}",
      middleware: ["auth"],
      requiresAuth: true,
    });
    </script>
    
    <template>
      <div>
        <LayoutsBreadcrumb />
        <rs-card>
          <template #header>
            <div>
              ${title}
            </div>
          </template>
          <template #body>
            <div>
              Content for ${title}
            </div>
          </template>
        </rs-card>
      </div>
    </template>
    
    <style scoped>
    /* Add your styles here */
    </style>
    `;
}
