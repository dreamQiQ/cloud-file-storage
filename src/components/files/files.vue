<template>
  <div>
    <div class="card card-flush">
      <div class="card-header pt-8">
        <div class="card-title">
          <!--begin::Search-->
          <div class="d-flex align-items-center position-relative my-1">
            <i class="ki-duotone ki-magnifier fs-1 position-absolute ms-6">
              <span class="path1"></span>
              <span class="path2"></span>
            </i>
            <input
              type="text"
              data-kt-filemanager-table-filter="search"
              class="form-control form-control-solid w-250px ps-15"
              placeholder="搜索文件"
              @change="searchFiles"
            />
          </div>
          <!--end::Search-->
        </div>
        <!--begin::Card toolbar-->
        <div class="card-toolbar">
          <!--begin::Toolbar-->
          <div
            class="d-flex justify-content-end"
            data-kt-filemanager-table-toolbar="base"
          >
            <!--begin::Add customer-->
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
            <!--end::Add customer-->
          </div>
          <!--end::Toolbar-->
        </div>
        <!--end::Card toolbar-->
      </div>
      <div class="card-body pt-8">
        <Datatable
          :header="tableHeader"
          :data="tableData"
          :loading="loading"
          :total="total"
          :itemsPerPage="pageSize"
          :currentPage="pageNum"
          :checkboxEnabled="false"
          @pageChange="pageChange"
          @update:itemsPerPage="itemsPerPageChange"
        >
          <template v-slot:fileName="{ row: data }">
            {{ data.fileName }}
          </template>
          <template v-slot:createdAt="{ row: data }">
            {{ data.createdAt }}
          </template>
          <template v-slot:fileSize="{ row: data }">
            {{ data.fileSize }}
          </template>
          <template v-slot:fileAddr="{ row: data }">
            {{ data.fileAddr }}
          </template>
          <template v-slot:fileSource="{ row: data }">
            {{ fileSourceMap[data.fileSource] }}
          </template>
          <template v-slot:handle="{ row }">
            <el-button class="btn btn-sm btn-primary" @click="fileDownload(row)"
              >下载</el-button
            >
          </template>
        </Datatable>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, toRefs, reactive } from "vue";
import Datatable from "@/components/kt-datatable/KTDataTable.vue";
import ApiService from "@/core/services/ApiService";
import { ElMessage } from "element-plus";

export default defineComponent({
  name: "kt-datatables",
  components: {
    Datatable,
  },
  setup(props, context) {
    type typeState = {
      tableHeader: Array<object>;
      tableData: Array<object>;
      loading: boolean;
      total: number;
      pageSize: number;
      pageNum: number;
      fileName: string;
      fileSourceMap: object;
    };
    const state: typeState = reactive({
      tableHeader: [],
      tableData: [],
      loading: false,
      total: 0,
      pageSize: 25,
      pageNum: 1,
      fileName: "",
      fileSourceMap: {
        COM_VX: "企业微信",
      },
    });

    onMounted(() => {
      tableListInit();
      getTableList();
    });

    // 列表初始化
    function tableListInit() {
      state.tableHeader = [
        {
          columnName: "文件名",
          columnLabel: "fileName",
        },
        {
          columnName: "上传时间",
          columnLabel: "createdAt",
        },
        {
          columnName: "文件大小",
          columnLabel: "fileSize",
        },
        {
          columnName: "附件",
          columnLabel: "fileAddr",
        },
        {
          columnName: "文件来源",
          columnLabel: "fileSource",
        },
        {
          columnName: "操作",
          columnLabel: "handle",
        },
      ];
    }

    // 获取列表数据
    async function getTableList() {
      try {
        const { pageSize, pageNum, fileName } = state;
        state.loading = true;
        state.tableData = [];
        let url = `/gomk/archived-file/cloud-files/query-page?pageSize=${pageSize}&pageNum=${pageNum}`;
        if (fileName) url = url + `&fileName=${fileName}`;
        const { data } = await ApiService.get(url);
        state.tableData = data.list;
        state.total = data.total;
        state.fileName = "";
        state.pageSize = data.pageSize;
        state.loading = false;
      } catch (err: any) {
        state.loading = false;
        ElMessage.error(err);
      }
    }

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
    // 查询
    const searchFiles = (e) => {
      state.fileName = e.target.value;
      getTableList();
    };

    // 文件上传
    const uploadComplexChange = async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file.raw);
        await ApiService.post(
          "/gomk/archived-file/cloud-files/upload-file",
          formData
        );
        ElMessage.success("上传成功");
        resetList();
      } catch (err: any) {
        ElMessage.error(err);
      }
    };
    // 重置
    const resetList = () => {
      state.pageNum = 1;
      getTableList();
    };

    // 文件下载
    const fileDownload = async (row: any) => {
      try {
        await ApiService.download(
          `/gomk/archived-file/cloud-files/download-file?id=${row.id}`,
          "get",
          row.fileName
        );
        ElMessage.success("下载成功");
      } catch (error) {
        ElMessage.error(`下载失败，${error}`);
      }
    };

    return {
      ...toRefs(state),
      pageChange,
      itemsPerPageChange,
      searchFiles,
      uploadComplexChange,
      fileDownload,
    };
  },
});
</script>
