import { sendAuthRequest, requestPayment } from "native-wechat";
import { Linking } from "react-native";

class WechatService {

	isInstalled(successFn: (result: any) => void, failFn?: () => void) {
		// 判断微信是否安装
		Linking.canOpenURL("weixin://").then(supported => {
			if (supported) {
				// 微信已安装
				successFn(supported)
			} else {
				// 微信未安装
				failFn && failFn()
			}
		})
	}

	auth(scope: string, state: string, successFn: (result: any) => void, failFn?: (error: any) => void) {
		// 微信授权
		sendAuthRequest({ scope, state }).then((result: any) => {
			successFn(result);
		}).catch((error: any) => {
			failFn && failFn(error);
		})
	}

	share(shareInfo: any, successFn?: () => void, failFn?: () => void) {

	}

	payment(payInfo: any, successFn: (result: any) => void, failFn?: (error: any) => void) {
		requestPayment(JSON.parse(payInfo)).then((result: any) => {
			successFn(result)
		}).catch((error: any) => {
			failFn && failFn(error);
		})
	}
}
const wechatService = new WechatService();
export default wechatService;