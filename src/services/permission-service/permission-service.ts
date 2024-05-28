import { Platform, AppState } from "react-native";
import { checkMultiple, requestMultiple, PERMISSIONS } from "react-native-permissions";

import ToastCtrl from "../../components/toastctrl";

import theme from "../../configs/theme";
import AlertCtrl from "../../components/alertctrl";

class PermissionService {
	private per_toast: any;
	private permissionmsg: any = {
		camera: {
			name: "相机（摄像头）及存储权限使用说明:",
			description: "我们需要访问您的相机（摄像头）和存储权限，以便您可以进行拍摄和上传照片。不授权上述权限，不影响App其他功能的正常使用",
			alertmsg: "请前往设置页面允许香水时代App访问手机相机及存储，否则相关内容无法使用。",
			permissions: [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE, PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE]
		},
		write: {
			name: "存储权限使用说明:",
			description: "我们需要访问您的存储权限用于读取/写入图片等功能。不授权上述权限，不影响App其他功能的正常使用",
			alertmsg: "请前往设置页面允许香水时代App访问手机存储，否则相关内容无法使用。",
			permissions: [PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE, PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE]
		},
		scan: {
			name: "相机（摄像头）权限使用说明:",
			description: "我们需要访问您的相机（摄像头）权限，以便您可以进行扫描识别二维码/条形码。不授权上述权限，不影响App其他功能的正常使用",
			alertmsg: "请前往设置页面允许香水时代App访问手机相机，否则相关内容无法使用。",
			permissions: [PERMISSIONS.ANDROID.CAMERA]
		}
	} // 权限参数

	constructor() {
		if (Platform.OS == "android") {
			AppState.addEventListener("change", (state: string) => {
				if (state === "active") {
					this.closeToast();
				}
			})
		}
	}

	// 批量检测权限
	async checkPermissions(permissions: any) {
		try {
			const result = await checkMultiple(permissions);
			let hasPermission: any[] = [];
			Object.values(result).forEach((item) => {
				hasPermission.push(item === "granted");
			})
			const allTrue = hasPermission.every((item) => item === true);
			return allTrue;
		} catch {
			return false;
		}
	}

	// 关闭toast提示弹窗
	closeToast() {
		if (this.per_toast) {
			ToastCtrl.close(this.per_toast);
		}
	}

	checkPermission(type: string) {
		return new Promise(async (resolve, reject) => {
			if (Platform.OS == "android") {
				const hasPermission = await this.checkPermissions(this.permissionmsg[type].permissions);
				if (hasPermission) {
					resolve(true);
				} else {
					this.per_toast = ToastCtrl.show({
						message: this.permissionmsg[type].name + "\n" + this.permissionmsg[type].description,
						duration: 0,
						key: "permission_toast",
						position: "top",
						viewstyle: "",
					});
					requestMultiple(this.permissionmsg[type].permissions).then((result) => {
						let hasPermission: any[] = [];
						Object.values(result).forEach((item) => {
							hasPermission.push(item === "granted");
						})
						const allTrue = hasPermission.every((item) => item === true);
						if (allTrue) {
							this.closeToast();
							resolve(true);
						} else {
							AlertCtrl.show({
								header: "授予权限",
								key: "permission_alert",
								message: this.permissionmsg[type].alertmsg,
								buttons: [{
									text: "确定",
									handler: () => {
										AlertCtrl.close("permission_alert");
									}
								}]
							})
							resolve(false);
						}
					}).catch((error) => { });
				}
			} else {
				resolve(true);
			}
		})
	}
}

const permissionService = new PermissionService();
export default permissionService;