import type { App } from "vue";
import type { AxiosResponse } from "axios";
import axios from "axios";
import VueAxios from "vue-axios";
import JwtService from "@/core/services/JwtService";
import { ElMessage } from "element-plus";

/**
 * @description service to call HTTP request via Axios
 */
class ApiService {
  /**
   * @description property to share vue instance
   */
  public static vueInstance: App;

  /**
   * @description initialize vue axios
   */
  public static init(app: App<Element>) {
    ApiService.vueInstance = app;
    ApiService.vueInstance.use(VueAxios, axios);
    // baseURL
    // ApiService.vueInstance.axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL;
    ApiService.vueInstance.axios.defaults.baseURL = '/api';
    // 数据类型
    ApiService.vueInstance.axios.defaults.headers.common["Accept"] = "application/json";
    // 请求配置
    ApiService.vueInstance.axios.interceptors.request.use((config: any) => {
      config.url = '/gomk/archived-file' + config.url
      return config
    }, error => {
      ElMessage.error(error)
      return Promise.reject(error)
    })
    // 响应配置
    ApiService.vueInstance.axios.interceptors.response.use(response => {
      const { data, config } = response;
      switch (data.code) {
        case 403:
          ElMessage.error(data.message || data.msg || '权限不足')
          break
        case 500:
          ElMessage.error(data.message || data.msg || '后台服务错误')
          break
        case 1001:
          ElMessage.error(data.message || data.msg || '后台服务错误')
          break
        case 1000:
          ElMessage.error(data.message || data.msg || '后台服务错误')
          break
        default:
          return data
      }
    }, err => {
      const STATUS_MESSAGE = {
        401: '未授权，请登录',
        403: '服务端拒绝访问',
        404: '请求地址出错',
        408: '请求超时',
        500: '服务器内部错误',
        501: '服务未实现',
        502: '网关错误',
        503: '服务不可用',
        504: '网关超时',
        505: 'HTTP版本不受支持',
      }
      const status = err.response.status
      const message = err.response?.data?.message || err.response?.data?.msg || STATUS_MESSAGE[status]
      // ElMessage.error(`${status}-${message}`)
      return Promise.reject(message)
    })
  }

  /**
   * @description set the default HTTP request headers
   */
  public static setHeader(): void {
    ApiService.vueInstance.axios.defaults.headers.common[
      "Authorization"
    ] = `Token ${JwtService.getToken()}`;
    ApiService.vueInstance.axios.defaults.headers.common["Accept"] = "application/json";
  }

  /**
   * @description send the GET HTTP request
   * @param resource: string
   * @param params: AxiosRequestConfig
   * @returns Promise<AxiosResponse>
   */
  public static query(resource: string, params: any): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.get(resource, params);
  }

  /**
   * @description send the GET HTTP request
   * @param resource: string
   * @param slug: string
   * @returns Promise<AxiosResponse>
   */
  public static get(
    resource: string,
  ): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.get(`${resource}`);
  }

  /**
   * @description set the POST HTTP request
   * @param resource: string
   * @param params: AxiosRequestConfig
   * @returns Promise<AxiosResponse>
   */
  public static post(resource: string, params: any): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.post(`${resource}`, params);
  }

  /**
   * @description send the UPDATE HTTP request
   * @param resource: string
   * @param slug: string
   * @param params: AxiosRequestConfig
   * @returns Promise<AxiosResponse>
   */
  public static update(
    resource: string,
    slug: string,
    params: any
  ): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.put(`${resource}/${slug}`, params);
  }

  /**
   * @description Send the PUT HTTP request
   * @param resource: string
   * @param params: AxiosRequestConfig
   * @returns Promise<AxiosResponse>
   */
  public static put(resource: string, params: any): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.put(`${resource}`, params);
  }

  /**
   * @description Send the DELETE HTTP request
   * @param resource: string
   * @returns Promise<AxiosResponse>
   */
  public static delete(resource: string): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.delete(resource);
  }

  public static download(url, method: string, filename?: string, params?: object) {
    return ApiService.vueInstance.axios({
      url,
      method,
      responseType: 'blob',
      params,
    }).then(data => {
      const content: object = data
      const blob = new Blob([content as BlobPart])
      if ('download' in document.createElement('a')) {
        const elink = document.createElement('a')
        elink.download = filename as string
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href)
        document.body.removeChild(elink)
      } else {
        const file = new File([blob], filename as string);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    })
  }
}

export default ApiService;
