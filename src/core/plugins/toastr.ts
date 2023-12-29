import toastrEl from "toastr";
import "toastr/build/toastr.min.css";
import "@/assets/sass/core/vendors/plugins/_toastr.scss";

// info success warning error

// closeButton	显示关闭按钮
// debug	开启debug模式
// progressBar	显示进度条
// onclick	鼠标点击事件
// showDuration	显示动作时间
// hideDuration	隐藏动作时间
// timeOut	显示时间,0为永久显示
// extendedTimeOut	鼠标移动过后显示显示时间
// positionClass toast-top-left right center toast-bottom-left right center toast-top-full-width
const defaultOptions = {
    closeButton: true,//显示关闭按钮
    progressBar: true,//显示进度条
}

export const toastr = {
    success(message: string, title?: string, options?: object) {
        toastrEl.success(message, title, options = { ...defaultOptions, ...options });
    },
    error(message: string, title?: string, options?: object) {
        toastrEl.error(message, title, options = { ...defaultOptions, ...options });
    },
    info(message: string, title?: string, options?: object) {
        toastrEl.info(message, title, options = { ...defaultOptions, ...options });
    },
    warning(message: string, title?: string, options?: object) {
        toastrEl.warning(message, title, options = { ...defaultOptions, ...options });
    }
}