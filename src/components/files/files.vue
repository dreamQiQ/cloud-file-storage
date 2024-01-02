<template>
  <div>
    <div class="card card-flush">
      <div class="card-header pt-8">
        <div class="card-title">
          <!-- 搜索 -->
          <div class="d-flex align-items-center position-relative my-1">
            <i class="ki-duotone ki-magnifier fs-1 position-absolute ms-6">
              <span class="path1"></span>
              <span class="path2"></span>
            </i>
            <input
              v-model="searchValue"
              type="text"
              class="form-control form-control-solid w-250px ps-15"
              placeholder="搜索文件"
              @change="resetList"
            />
          </div>
        </div>
        <div class="card-toolbar">
          <div
            class="d-flex justify-content-end"
            data-kt-filemanager-table-toolbar="base"
          >
            <!-- 返回上一级 -->
            <button
              v-if="dirList.length > 1"
              type="button"
              class="btn btn-icon btn-light-primary me-3"
              @click="returnUpperLevel"
            >
              <i class="ki-duotone ki-exit-up fs-2">
                <span class="path1"></span>
                <span class="path2"></span>
              </i>
            </button>
            <!-- 新增文件夹 -->
            <button
              type="button"
              class="btn btn-flex btn-light-primary me-3"
              @click="showNewFolder"
            >
              <i class="ki-duotone ki-add-folder fs-2">
                <span class="path1"></span>
                <span class="path2"></span> </i
              >新建文件夹
            </button>
            <!-- 上传文件 -->
            <el-upload
              ref="excel-upload"
              action=""
              :auto-upload="false"
              :show-file-list="false"
              :on-change="uploadComplexChange"
            >
              <button type="button" class="btn btn-flex btn-primary">
                <i class="ki-duotone ki-folder-up fs-2">
                  <span class="path1"></span>
                  <span class="path2"></span> </i
                >上传文件
              </button>
            </el-upload>
          </div>
        </div>
      </div>
      <div class="card-body pt-8">
        <div class="d-flex flex-stack">
          <!-- 文件路径 -->
          <div class="badge badge-lg badge-light-primary">
            <div class="d-flex align-items-center flex-wrap">
              <i class="ki-duotone ki-abstract-32 fs-2x text-primary me-3">
                <span class="path1"></span>
                <span class="path2"></span>
              </i>
              <template v-for="item in dirList">
                <span class="cursor-pointer" @click="jumpPath(item)">{{
                  item === "/" ? "根目录" : item
                }}</span>
                <i class="ki-duotone ki-right fs-2x text-primary mx-1"></i>
              </template>
            </div>
          </div>
          <!-- 统计 -->
          <div class="badge badge-lg badge-primary">
            <span id="kt_file_manager_items_counter">{{ total || 0 }} 项</span>
          </div>
        </div>
        <Datatable
          :header="tableHeader"
          :data="tableData"
          :loading="loading"
          :total="total"
          :itemsPerPage="pageSize"
          :currentPage="pageNum"
          :checkboxEnabled="false"
          :checkNewItem="checkNewItem"
          @pageChange="pageChange"
          @update:itemsPerPage="itemsPerPageChange"
          @cancelNewItem="cancelNewItem"
          @submitNewItem="submitNewItem"
        >
          <template v-slot:name="{ row: data }">
            <div
              class="d-flex align-items-center"
              :class="{ 'cursor-pointer': data.type === 1 }"
              @click="nextDir(data)"
            >
              <span v-if="rename !== data.name">
                <span v-if="data.type === 1" class="icon-wrapper">
                  <i class="ki-duotone ki-folder fs-2x text-primary me-4">
                    <span class="path1"></span>
                    <span class="path2"></span>
                  </i>
                </span>
                <span>{{ data.name }}</span>
              </span>
              <!-- 重命名 -->
              <div
                v-else="rename === data.name"
                class="d-flex align-items-center"
              >
                <span>
                  <i class="ki-duotone ki-folder fs-2x text-primary me-4">
                    <span class="path1"></span>
                    <span class="path2"></span>
                  </i>
                </span>
                <input
                  v-model="renameVal"
                  type="text"
                  name="new_folder_name"
                  placeholder="请输入文件夹名称"
                  class="form-control mw-250px me-3"
                />
                <el-button
                  :loading="renameLoading"
                  class="btn btn-icon btn-light-primary me-3"
                  @click="submitRename(data)"
                >
                  <span class="indicator-label">
                    <i class="ki-duotone ki-check fs-1"></i>
                  </span>
                </el-button>
                <el-button
                  :loading="renameLoading"
                  class="btn btn-icon btn-light-danger"
                  @click="cancelRename"
                >
                  <span class="indicator-label">
                    <i class="ki-duotone ki-cross fs-1">
                      <span class="path1"></span>
                      <span class="path2"></span>
                    </i>
                  </span>
                </el-button>
              </div>
            </div>
          </template>
          <template v-slot:lastModified="{ row: data }">
            {{ data.lastModified }}
          </template>
          <template v-slot:size="{ row: data }">
            {{ data.size }}
          </template>
          <template v-slot:handle="{ row: data }">
            <div class="d-flex justify-content-end">
              <div class="ms-2">
                <el-popover
                  v-if="data.type === 2"
                  :width="300"
                  trigger="click"
                  placement="bottom-end"
                  popper-style="padding: 0px;"
                >
                  <template #reference>
                    <el-button
                      class="btn btn-sm btn-icon btn-light btn-active-light-primary"
                      @click="createShareLink(data)"
                    >
                      <i class="ki-duotone ki-fasten fs-5 m-0">
                        <span class="path1"></span>
                        <span class="path2"></span>
                      </i>
                    </el-button>
                  </template>
                  <div class="card-body p-5">
                    <div
                      class="d-flex"
                      :class="{ 'd-none': !createShareLoading }"
                    >
                      <div class="me-5" data-kt-indicator="on">
                        <span class="indicator-progress">
                          <span
                            class="spinner-border spinner-border-sm align-middle ms-2"
                          ></span>
                        </span>
                      </div>
                      <div class="fs-6 text-gray-900">生成分享链接...</div>
                    </div>
                    <div
                      class="d-flex flex-column text-start"
                      :class="{ 'd-none': createShareLoading }"
                    >
                      <div class="d-flex mb-3">
                        <i
                          class="ki-duotone ki-check fs-2 text-success me-3"
                        ></i>
                        <div class="fs-6 text-gray-900">分享链接</div>
                      </div>
                      <input
                        v-model="shareLink"
                        type="text"
                        class="form-control form-control-sm"
                      />
                      <div class="text-muted fw-normal mt-2 fs-8 px-3">
                        只读
                        <a
                          class="ms-2 cursor-pointer"
                          @click="fileDownload(data)"
                        >
                          文件下载
                        </a>
                      </div>
                    </div>
                  </div>
                </el-popover>
              </div>
              <div class="ms-2">
                <el-popover
                  placement="bottom-start"
                  :width="150"
                  trigger="click"
                  popper-style="padding: 0px;"
                >
                  <template #reference>
                    <el-button
                      class="btn btn-sm btn-icon btn-light btn-active-light-primary"
                    >
                      <i class="ki-duotone ki-dots-square fs-5 m-0">
                        <span class="path1"></span>
                        <span class="path2"></span>
                        <span class="path3"></span>
                        <span class="path4"></span>
                      </i>
                    </el-button>
                  </template>
                  <div
                    class="menu menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-150px py-4"
                    data-kt-menu="true"
                  >
                    <div
                      v-if="data.type !== 1"
                      class="menu-item px-3"
                      @click="fileDownload(data)"
                    >
                      <a class="menu-link px-3">下载文件</a>
                    </div>
                    <div
                      v-if="data.type !== 1"
                      class="menu-item px-3"
                      @click="fileRename(data)"
                    >
                      <a class="menu-link px-3">重命名</a>
                    </div>
                    <div
                      v-if="data.type !== 1"
                      class="menu-item px-3"
                      @click="moveFolder(data)"
                    >
                      <a class="menu-link px-3">移至文件夹</a>
                    </div>
                    <div class="menu-item px-3" @click="fileDelete(data)">
                      <a class="menu-link text-danger px-3">删除</a>
                    </div>
                  </div>
                </el-popover>
              </div>
            </div>
          </template>
        </Datatable>
      </div>
    </div>
  </div>
  <!-- 移动文件夹 -->
  <div ref="moveFolderRef" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered mw-650px">
      <div class="modal-content">
        <form class="form" action="#">
          <div class="modal-header">
            <h2 class="fw-bold">移至文件夹</h2>
            <div
              class="btn btn-icon btn-sm btn-active-icon-primary"
              @click="cancelFileFolder"
            >
              <i class="ki-duotone ki-cross fs-1">
                <span class="path1"></span>
                <span class="path2"></span>
              </i>
            </div>
          </div>
          <div class="modal-body pt-10 pb-15 px-lg-17">
            <i
              v-show="nextLevelVal !== '/'"
              class="ki-duotone ki-left mb-6 cursor-pointer"
              style="font-size: 24px"
              @click="goBackFolder"
            >
              <span class="path1"></span>
              <span class="path2"></span>
            </i>

            <div v-if="folderList.length" class="form-group fv-row">
              <template v-for="item in folderList" :key="item.name">
                <div class="d-flex">
                  <div class="form-check form-check-custom form-check-solid">
                    <input
                      v-model="radioVal"
                      class="form-check-input me-3"
                      name="move_to_folder"
                      type="radio"
                      :value="item.path"
                    />

                    <label
                      class="form-check-label"
                      @click="folderNextLevel(item)"
                    >
                      <div class="fw-bold">
                        <i class="ki-duotone ki-folder fs-2 text-primary me-2">
                          <span class="path1"></span>
                          <span class="path2"></span>
                        </i>
                        {{ item.name }}
                      </div>
                    </label>
                  </div>
                </div>
                <div class="separator separator-dashed my-5"></div>
              </template>
            </div>
            <div v-else class="dataTables_empty" style="text-align: center">
              暂无数据
            </div>
            <div class="d-flex flex-center mt-12">
              <button
                type="button"
                class="btn btn-light me-6"
                @click="cancelFileFolder"
              >
                取 消
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="checkFileFolder"
              >
                <span class="indicator-label">保 存</span>
                <span class="indicator-progress">
                  Please wait...
                  <span
                    class="spinner-border spinner-border-sm align-middle ms-2"
                  ></span>
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  toRefs,
  reactive,
  computed,
  ref,
} from "vue";
import Datatable from "@/components/kt-datatable/KTDataTable.vue";
import ApiService from "@/core/services/ApiService";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { toastr } from "@/core/plugins/toastr";
import { Modal } from "bootstrap";
import makeData from "@/components/files/data.js";

export default defineComponent({
  name: "kt-datatables",
  components: {
    Datatable,
  },
  setup() {
    type typeState = {
      tableHeader: Array<object>;
      tableData: Array<object>;
      loading: boolean;
      total: number;
      pageSize: number;
      pageNum: number;
      checkNewItem: boolean;
      dirList: Array<string>;
      searchValue: string;
      shareLink: string;
      createShareLoading: boolean;
      rename: string;
      renameVal: string;
      renameType: string;
      renameLoading: boolean;
      radioVal: string;
      folderList: Array<any>;
      nextLevelVal: string;
      modalInstance: any;
      moveFolderVal: {
        name: string;
        path: string;
      };
    };
    const state: typeState = reactive({
      tableHeader: [],
      tableData: [],
      loading: false,
      total: 0,
      pageSize: 25,
      pageNum: 1,
      checkNewItem: false,
      dirList: ["/"],
      searchValue: "",
      shareLink: "",
      createShareLoading: false,
      rename: "",
      renameVal: "",
      renameType: "",
      renameLoading: false,
      radioVal: "",
      folderList: [],
      nextLevelVal: "/",
      modalInstance: "",
      moveFolderVal: {
        name: "",
        path: "",
      },
    });

    const moveFolderRef = ref();

    const fullPath = computed(() => {
      let path = state.dirList.join("/");
      if (path !== "/") path = path.slice(1) + "/";
      return path;
    });

    onMounted(() => {
      tableListInit();
      getTableList();
      getFolderList();

      // 实例
      state.modalInstance = new Modal(moveFolderRef.value);
    });

    // 列表初始化
    function tableListInit() {
      state.tableHeader = [
        {
          columnName: "文件名",
          columnLabel: "name",
        },
        {
          columnName: "最后修改时间",
          columnLabel: "lastModified",
        },
        {
          columnName: "文件大小",
          columnLabel: "size",
        },
        {
          columnName: "操作",
          columnLabel: "handle",
        },
      ];
    }

    // 下一级文件
    const nextDir = (data: any) => {
      if (state.rename) return false;
      const { name, type } = data;
      if (type === 2) return false;
      state.checkNewItem = false;
      state.dirList.push(name);
      resetList();
    };

    // 获取列表数据
    async function getTableList() {
      try {
        const { pageSize, pageNum, searchValue } = state;
        state.loading = true;
        state.tableData = [];
        let url = `/minio/page-file?pageSize=${pageSize}&pageNum=${pageNum}&dir=${fullPath.value}`;
        if (searchValue) url = url + `&searchValue=${searchValue}`;
        const { data } = await ApiService.get(url);
        state.tableData = data.list;
        state.total = data.total;
        state.searchValue = "";
        state.pageSize = data.pageSize;
        state.loading = false;
      } catch (err: any) {
        state.loading = false;
        toastr.error(err);
      }
    }

    // 跳转路径
    const jumpPath = (dirName: string) => {
      const index = state.dirList.findIndex((i) => i === dirName);
      state.dirList = state.dirList.slice(0, index + 1);
      state.checkNewItem = false;
      resetList();
    };

    // 修改页码
    function pageChange(page) {
      state.pageNum = page;
      getTableList();
    }
    // 修改每页条数
    const itemsPerPageChange = (value: number) => {
      state.pageNum = 1;
      state.pageSize = value;
      getTableList();
    };

    // 文件上传
    const uploadComplexChange = async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file.raw);
        formData.append("sourcePath", fullPath.value);
        await ApiService.post("/minio/upload-file", formData);
        toastr.success("上传成功");
        resetList();
      } catch (err: any) {
        toastr.error(err);
      }
    };
    // 重置
    const resetList = () => {
      state.pageNum = 1;
      getTableList();
    };

    // 显示新增文件夹
    const showNewFolder = () => {
      state.checkNewItem = true;
    };

    // 新增文件夹
    const submitNewItem = async (folderName) => {
      try {
        if (!folderName) {
          toastr.warning("文件夹名称不能为空");
          return false;
        }
        await ApiService.post("/minio/create-dir", {
          parentDir: fullPath.value,
          dirName: folderName,
        });
        state.checkNewItem = false;
        toastr.success("新增成功");
        resetList();
      } catch (error: any) {
        toastr.error(error);
      }
    };

    // 取消新建
    const cancelNewItem = () => {
      state.checkNewItem = false;
      toastr.warning("已取消");
    };
    // 返回上一级
    const returnUpperLevel = () => {
      const UpperLevel = state.dirList[state.dirList.length - 2];
      jumpPath(UpperLevel);
    };

    // 生成分享链接
    const createShareLink = (data) => {
      try {
        if (!(fullPath.value && data.name)) {
          toastr.warning("文件路径不存在");
          return false;
        }
        state.createShareLoading = true;
        state.shareLink = `${import.meta.env.VITE_APP_API_URL}${
          import.meta.env.VITE_APP_BASE_URL
        }/minio/download?path=${fullPath.value}${data.name}`;
        state.createShareLoading = false;
      } catch (error: any) {
        state.createShareLoading = false;
        toastr.error(error);
      }
    };

    // 下载文件
    const fileDownload = async (data) => {
      try {
        const downloadUrl = `${import.meta.env.VITE_APP_API_URL}${
          import.meta.env.VITE_APP_BASE_URL
        }/minio/download?path=${fullPath.value}${data.name}`;

        const elink = document.createElement("a");
        elink.download = data.name as string;
        elink.style.display = "none";
        elink.href = downloadUrl;
        document.body.appendChild(elink);
        elink.click();
        URL.revokeObjectURL(elink.href);
        document.body.removeChild(elink);

        toastr.success("下载成功");
      } catch (error) {
        toastr.error(`下载失败，${error}`);
      }
    };

    // 文件删除
    const fileDelete = async (data: any) => {
      const { name, type } = data;
      const message =
        type === 1
          ? "内部文件将一并删除，确定要删除该文件夹吗？"
          : "确定要删除该文件吗？";
      Swal.fire({
        text: message,
        icon: "warning",
        buttonsStyling: false,
        showCancelButton: true,
        confirmButtonText: "确 定",
        cancelButtonText: "取 消",
        heightAuto: false,
        customClass: {
          confirmButton: "btn btn-danger",
          cancelButton: "btn btn-active-light-primary",
        },
      }).then(async ({ value }) => {
        if (value) {
          try {
            await ApiService.delete(`/minio/delete-file`, {
              parentDir: fullPath.value,
              fileName: name,
              type,
            });
            toastr.success("删除成功");
            resetList();
          } catch (err: any) {
            toastr.error(`删除失败，${err}`);
          }
        } else {
          toastr.warning(`已取消`);
        }
      });
    };

    // 重命名
    const fileRename = (data: any) => {
      const typeIndex = data.name.lastIndexOf(".");
      state.rename = data.name;
      if (typeIndex !== -1) {
        state.renameVal = data.name.slice(0, typeIndex);
        state.renameType = data.name.slice(typeIndex);
      } else {
        state.renameVal = data.name;
        state.renameType = "";
      }
    };
    const submitRename = (data: any) => {
      const { type } = data;
      const message =
        type === 1 ? "确定要修改该文件夹名称吗？" : "确定要修改该文件名称吗？";
      Swal.fire({
        text: message,
        icon: "warning",
        buttonsStyling: false,
        showCancelButton: true,
        confirmButtonText: "确 定",
        cancelButtonText: "取 消",
        heightAuto: false,
        customClass: {
          confirmButton: "btn btn-danger",
          cancelButton: "btn btn-active-light-primary",
        },
      }).then(async ({ value }) => {
        if (value) {
          try {
            state.renameLoading = true;
            await ApiService.put("/minio/move-file", {
              parentDir: fullPath.value,
              fileName: data.name,
              targetDir: fullPath.value,
              targetFileName: state.renameVal + state.renameType,
            });
            state.rename = "";
            state.renameVal = "";
            state.renameType = "";
            state.renameLoading = false;
            toastr.success("重命名成功");
            resetList();
          } catch (error: any) {
            state.renameLoading = false;
            toastr.error(`重命名失败${error}`);
          }
        } else {
          state.rename = "";
          state.renameVal = "";
          toastr.warning(`已取消`);
        }
      });
    };
    // 取消重命名
    const cancelRename = () => {
      setTimeout(() => {
        state.rename = "";
        state.renameVal = "";
        toastr.warning(`已取消`);
      }, 0);
    };

    // 移至文件夹
    const moveFolder = (data) => {
      if (!state.folderList.length) return false;
      state.nextLevelVal = "/";
      state.moveFolderVal.name = data.name;
      state.moveFolderVal.path = fullPath.value;
      state.modalInstance.show();
    };

    // 文件夹列表
    const getFolderList = async () => {
      try {
        const { data } = await ApiService.get(
          `/minio/list-dir?dir=${state.nextLevelVal || "/"}`
        );
        if (!(data && data.length)) {
          toastr.warning(`下级文件夹不存在`);
          return false;
        }
        state.folderList = data;
      } catch (error) {
        toastr.error(`获取文件夹列表失败`);
      }
    };

    // 下一级文件夹
    const folderNextLevel = (item) => {
      state.nextLevelVal = item.path;
      getFolderList();
    };

    // 返回上一级
    const goBackFolder = () => {
      if (state.nextLevelVal === "/") return false;
      const index = state.nextLevelVal.slice(0, -1).lastIndexOf("/");
      state.nextLevelVal =
        state.nextLevelVal.slice(0, -1).slice(0, index) + "/";
      getFolderList();
    };

    // 修改文件文件夹
    const checkFileFolder = async () => {
      try {
        const { name, path } = state.moveFolderVal;

        console.log("11111111111", name, path, state.radioVal);
        if (!state.radioVal) {
          toastr.warning(`请选择文件夹`);
          return false;
        }

        if (state.total === 1) {
          Swal.fire({
            text: "文件移出后该文件夹将被删除，请确认！",
            icon: "warning",
            buttonsStyling: false,
            showCancelButton: true,
            confirmButtonText: "确 定",
            cancelButtonText: "取 消",
            heightAuto: false,
            customClass: {
              confirmButton: "btn btn-danger",
              cancelButton: "btn btn-active-light-primary",
            },
          }).then(async ({ value }) => {
            if (value) {
              await ApiService.put("/minio/move-file", {
                parentDir: path,
                fileName: name,
                targetDir: state.radioVal,
              });
              toastr.success(`移动成功`);
              cancelFileFolder();
              resetList();
            } else {
              toastr.warning(`已取消`);
              cancelFileFolder();
              resetList();
            }
          });
        } else {
          await ApiService.put("/minio/move-file", {
            parentDir: path,
            fileName: name,
            targetDir: state.radioVal,
          });
          toastr.success(`移动成功`);
          cancelFileFolder();
          resetList();
        }
      } catch (error) {
        toastr.success(`移动失败`);
        cancelFileFolder();
        resetList();
      }
    };

    // 取消修改文件文件夹
    const cancelFileFolder = () => {
      state.radioVal = "";
      state.moveFolderVal = {
        name: "",
        path: "",
      };
      state.modalInstance.hide();
    };

    return {
      ...toRefs(state),
      moveFolderRef,
      nextDir,
      resetList,
      pageChange,
      jumpPath,
      itemsPerPageChange,
      uploadComplexChange,
      showNewFolder,
      returnUpperLevel,
      submitNewItem,
      cancelNewItem,
      createShareLink,
      fileDownload,
      fileDelete,
      fileRename,
      submitRename,
      cancelRename,
      moveFolder,
      folderNextLevel,
      goBackFolder,
      checkFileFolder,
      cancelFileFolder,
    };
  },
});
</script>
