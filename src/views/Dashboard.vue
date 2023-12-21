<template>
  <FilesList className="h-md-100 mb-5 mb-xl-10"></FilesList>
</template>

<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { defineComponent } from "vue";
import FilesList from "@/components/files/files.vue";

export default defineComponent({
  name: "dashboard",
  components: {
    FilesList,
  },
  setup() {
    return {
      getAssetPath,
    };
  },
});
</script>
