import ImagePicker from "react-native-image-crop-picker";

import ToastCtrl from "../../components/toastctrl";
import AlertCtrl from "../../components/alertctrl";

import permissionService from "../permission-service/permission-service";
import us from "../user-service/user-service";

import http from "../../utils/api/http";

import events from "../../hooks/events";

import { ENV } from "../../configs/ENV";
import ActionSheetCtrl from "../../components/actionsheetctrl";
import theme from "../../configs/theme";

class UploadPhotoService {
	public myImage: string = "";
	public params: any = {
		index: 0,
		isCrop: false,
		quality: 0.9,
		maxWidth: 1024,
		maxHeight: 1024,
		src: ""
	}

	changeAvatar(data: any) {
		let params = {
			index: 0,
			quality: 0.9,
			includeBase64: true,
			maxWidth: 400,
			maxHeight: 400,
			src: "useravatar",
			classname: data.classname,
			isCrop: true,
		}
		ActionSheetCtrl.show({
			key: "avatar_action_sheet",
			buttons: [{
				text: "拍照",
				style: { color: theme.redchecked },
				handler: () => {
					ActionSheetCtrl.close("avatar_action_sheet");
					setTimeout(() => { upService.buttonClicked(params, data.style) }, 300);
				}
			}, {
				text: "从相册选择",
				style: { color: theme.tit2 },
				handler: () => {
					ActionSheetCtrl.close("avatar_action_sheet");
					params["index"] = 1;
					setTimeout(() => { upService.buttonClicked(params, data.style) }, 300);
				}
			}, {
				text: "取消",
				style: { color: theme.tit },
				handler: () => {
					ActionSheetCtrl.close("avatar_action_sheet");
				}
			}],
		})
	}

	async buttonClicked(params: any, style?: any) {
		let type = params.index == 0 ? "camera" : "write";
		if (!(await permissionService.checkPermission(type, style))) return;
		this.params = params;
		let options = {
			includeBase64: true,
			cropping: params.isCrop,
			compressImageQuality: params.quality,
			compressImageMaxWidth: params.maxWidth,
			compressImageMaxHeight: params.maxHeight,
			cropperStatusBarColor: "#FFFFFF",
			cropperCircleOverlay: this.params.src == "useravatar" ? true : false,
		}
		if (params.index == 0) {//相机
			ImagePicker.openCamera({ ...options, mediaType: "photo" }).then((image: any) => {
				this.uploadpic(image);
			}).catch(() => { })
		} else {
			ImagePicker.openPicker({ ...options, mediaType: "photo" }).then((image) => {
				this.uploadpic(image);
			}).catch(() => { })
		}
	}

	uploadpic(file: any) {
		this.uploadpic_by_dataurl(`data:${file.mime};base64,${file.data}`);
	}

	uploadpic_by_dataurl(dataurl: string) {
		this.myImage = dataurl;
		if (this.params.src == "photoupload") {
			events.publish("photo_upload" + this.params.classname + us.user.uid, this.myImage);
		} else if (this.params.src == "useravatar") {
			this._changeAvatar();
		}
	}

	async emitavatar() {
		let params = { avatar: this.myImage };
		events.publish(this.params.classname + "change_avatar", params);
	}

	_changeAvatar() {
		http.post(ENV.user, { method: "changepic", id: us.user.uid, token: us.user.token, Filedata: this.myImage }).then((resp_data: any) => {
			if (parseFloat(resp_data.msg) > 0) {
				ToastCtrl.show({ message: "头像已修改", duration: 2000, viewstyle: "short_toast", key: "changeAvatar_success_alert" });
				us.user.uface = resp_data.msg;
				us.saveUser(us.user);
				this.emitavatar();
			} else {
				AlertCtrl.show({
					header: "头像修改失败",
					key: "changeAvatar_err_alert",
					message: resp_data.msg,
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close("changeAvatar_err_alert");
						}
					}]
				})
			}
		});
	}
}

const upService = new UploadPhotoService();
export default upService;