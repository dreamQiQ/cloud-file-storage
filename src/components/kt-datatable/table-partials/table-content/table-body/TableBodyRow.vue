<template>
  <tbody class="fw-semibold text-gray-600">
    <!-- 新建文件夹 -->
    <tr v-if="checkNewItem">
      <td class="fv-row">
        <div class="d-flex align-items-center">
          <span>
            <i class="ki-duotone ki-folder fs-2x text-primary me-4">
              <span class="path1"></span>
              <span class="path2"></span>
            </i>
          </span>
          <input
            v-model="newfolderName"
            type="text"
            name="new_folder_name"
            placeholder="请输入文件夹名称"
            class="form-control mw-250px me-3"
          />
          <button
            class="btn btn-icon btn-light-primary me-3"
            @click="submitNewItem"
          >
            <span class="indicator-label">
              <i class="ki-duotone ki-check fs-1"></i>
            </span>
            <span class="indicator-progress">
              <span
                class="spinner-border spinner-border-sm align-middle"
              ></span>
            </span>
          </button>
          <button class="btn btn-icon btn-light-danger" @click="cancelNewItem">
            <span class="indicator-label">
              <i class="ki-duotone ki-cross fs-1">
                <span class="path1"></span>
                <span class="path2"></span>
              </i>
            </span>
            <span class="indicator-progress">
              <span
                class="spinner-border spinner-border-sm align-middle"
              ></span>
            </span>
          </button>
        </div>
      </td>
      <td v-for="i in header.length - 1"></td>
    </tr>
    <template v-if="data.length" v-for="(row, i) in data" :key="i">
      <tr>
        <td v-if="checkboxEnabled">
          <div
            class="form-check form-check-sm form-check-custom form-check-solid"
          >
            <input
              class="form-check-input"
              type="checkbox"
              :value="row[checkboxLabel]"
              v-model="selectedItems"
              @change="onChange"
            />
          </div>
        </td>
        <template v-for="(properties, j) in header" :key="j">
          <td :class="{ 'text-end': j === header.length - 1 }">
            <slot :name="`${properties.columnLabel}`" :row="row">
              {{ row }}
            </slot>
          </td>
        </template>
      </tr>
    </template>
  </tbody>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  name: "table-body-row",
  components: {},
  props: {
    header: { type: Array as () => Array<any>, required: true },
    data: { type: Array as () => Array<any>, required: true },
    currentlySelectedItems: { type: Array, required: false, default: () => [] },
    checkboxEnabled: { type: Boolean, required: false, default: false },
    checkNewItem: { type: Boolean, required: false, default: false },
    checkboxLabel: {
      type: String as () => string,
      required: false,
      default: "id",
    },
  },
  emits: ["on-select", "cancel-new-item", "submit-new-item"],
  setup(props, { emit }) {
    const selectedItems = ref<Array<any>>([]);
    const newfolderName = ref<string>("");

    watch(
      () => [...props.currentlySelectedItems],
      (currentValue) => {
        if (props.currentlySelectedItems.length !== 0) {
          selectedItems.value = [
            ...new Set([...selectedItems.value, ...currentValue]),
          ];
        } else {
          selectedItems.value = [];
        }
      }
    );

    watch(
      () => props.checkNewItem,
      () => {
        newfolderName.value = "";
      }
    );

    const onChange = () => {
      emit("on-select", selectedItems.value);
    };

    // 新增文件夹
    const submitNewItem = () => {
      emit("submit-new-item", newfolderName.value);
    };

    // 取消新增
    const cancelNewItem = () => {
      newfolderName.value = "";
      emit("cancel-new-item");
    };

    return {
      selectedItems,
      onChange,
      submitNewItem,
      cancelNewItem,
      newfolderName,
    };
  },
});
</script>
