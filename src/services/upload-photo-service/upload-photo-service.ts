import ImagePicker from "react-native-image-crop-picker";

import ToastCtrl from "../../components/toastctrl";
import AlertCtrl from "../../components/alertctrl";

import permissionService from "../permission-service/permission-service";
import us from "../user-service/user-service";

import http from "../../utils/api/http";

import events from "../../hooks/events/events";

import { ENV } from "../../configs/ENV";

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

	async buttonClicked(params: any) {
		let type = params.index == 0 ? "camera" : "write";
		if (!(await permissionService.checkPermission(type))) return;
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
			this.changeAvatar();
		}
	}

	async emitavatar() {
		let params = { avatar: this.myImage };
		events.publish("change_avatar", params);
	}

	changeAvatar() {
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