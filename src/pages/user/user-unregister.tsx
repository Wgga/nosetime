import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions } from "react-native";

import { Md5 } from "ts-md5";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

import HeaderView from "../../components/headerview";
import AlertCtrl from "../../components/alertctrl";
import AlertInputPopover from "../../components/popover/alertinput-popover";
import { ModalPortal } from "../../components/modals";
import ToastCtrl from "../../components/toastctrl";
import LinearButton from "../../components/linearbutton";

import us from "../../services/user-service/user-service";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();

const UserUnregister = React.memo(({ navigation }: any) => {
	// 控件
	// 变量
	let type = React.useRef<string>("unregister");
	let user = React.useRef<any>({ mobile: "", pwd: "" });
	// 数据
	let prelogin = React.useRef<any>({});
	const [terms, setTerms] = React.useState<any>([]);
	// 参数
	// 状态

	React.useEffect(() => {
		http.get(ENV.terms + "?method=" + type.current, "text").then((resp_data: any) => {
			let term_list = resp_data.trim().split("\n").map((item: any, index: number) => {
				return index > 0 ? (<Text key={index} style={styles.unregister_text}>{item}</Text>) : (<Text key={index} style={styles.unregister_title}>{item}</Text>);
			})
			setTerms(term_list);
		});
	}, [])

	// 输入框弹窗
	const unregister_alert = (type: string) => {
		if (us.user.mobile.indexOf('@weixin') > 0 || us.user.mobile.indexOf('@weibo') > 0) {
			confirm_alert("confirm");
		} else {
			ModalPortal.show((
				<AlertInputPopover data={{
					header: type == "password" ? "请输入密码" : "请输入账号",
					message: "",
					inputs: [{
						type,
						value: type == "password" ? user.current.pwd : user.current.mobile,
						onChangeText: (value: any) => {
							type == "password" ? user.current.pwd = value : user.current.mobile = value;
						},
						placeholder: type == "password" ? "请输入密码" : "请输入账号",
					}],
					buttons: [{
						text: "取消",
						handler: () => {
							ModalPortal.dismiss(type + "_alert");
							user.current = {
								mobile: "",
								pwd: ""
							}
						}
					}, {
						text: "确认",
						handler: () => {
							if (type == "password") {
								signIn();
							} else {
								ModalPortal.dismiss(type + "_alert");
								unregister_alert("password");
							}
						}
					}],
				}}
				/>
			), {
				key: type + "_alert",
				width: width,
				rounded: false,
				useNativeDriver: true,
				onTouchOutside: () => {
					ModalPortal.dismiss(type + "_alert");
					user.current = {
						mobile: "",
						pwd: ""
					}
				},
				animationDuration: 300,
				modalStyle: { backgroundColor: "transparent" },
			})
		}
	}

	// 确认注销弹窗
	const confirm_alert = (type: string) => {
		AlertCtrl.show({
			header: type == "confirm" ? "确定要注销账户吗？" : "再次确定要注销账户吗？",
			key: type + "_alert",
			message: "",
			buttons: type == "confirm" ? [{
				text: "取消",
				handler: () => {
					AlertCtrl.close("confirm_alert");
					ToastCtrl.show({ message: "您选择了取消操作", duration: 2000, viewstyle: "medium_toast", key: "cancel_toast" });
				}
			}, {
				text: "确定",
				handler: () => {
					AlertCtrl.close("confirm_alert");
					confirm_alert("confirm2");
				}
			}] : [{
				text: "确定",
				handler: () => {
					AlertCtrl.close("confirm2_alert");
					unregister();
				}
			}, {
				text: "取消",
				handler: () => {
					AlertCtrl.close("confirm2_alert");
					ToastCtrl.show({ message: "您选择了取消操作", duration: 2000, viewstyle: "medium_toast", key: "cancel_toast" });
				}
			}]
		});
	}

	// 注销账户
	const unregister = () => {
		http.post(ENV.api + ENV.user, { method: "unregister", uid: us.user.uid, token: us.user.token }).then((resp_data: any) => {
			ToastCtrl.show({ message: "您的账户已注销", duration: 2000, viewstyle: "medium_toast", key: "unregister_toast" });
			us.delUser();
			events.emit("nosetime_userlogout");
			navigation.navigate("Tabs", { screen: "Home" });
		}).catch(() => { });
	}


	// 登录验证
	const post = (mobile: string, pwd: string, token: string) => {
		http.post(ENV.user, { method: "login", mobile: mobile, pwd: pwd, token: token }).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				confirm_alert("confirm");
			} else {
				AlertCtrl.show({
					header: "登录失败!",
					key: "login_err_alert",
					message: resp_data.msg,
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close("login_err_alert")
						}
					}]
				});
			}
		}).catch(() => { });
	}

	// 预登陆验证
	const signIn = () => {
		let pwd = "";
		if ((us.isemail(user.current.mobile) || us.ismobile(user.current.mobile)) && user.current.pwd.length >= 6) {
			if (prelogin.current !== null) {
				if (prelogin.current.type == "old")
					post(user.current.mobile, Md5.hashStr(user.current.pwd), "");
				else if (prelogin.current.type == "new") {
					pwd = Md5.hashStr(Md5.hashStr(user.current.pwd) + Md5.hashStr(user.current.mobile.toLowerCase() + "@Nosetime"));
					post(user.current.mobile, Md5.hashStr(pwd + prelogin.current.token), prelogin.current.token);
				} else {
					prelogin.current = null;
				}
			} else {
				http.post(ENV.user, { method: "prelogin", mobile: user.current.mobile }).then((resp_data: any) => {
					prelogin.current = resp_data;
					if (prelogin.current.type == "old") {
						post(user.current.mobile, Md5.hashStr(pwd), "");
					} else if (prelogin.current.type == "new") {
						pwd = Md5.hashStr(Md5.hashStr(user.current.pwd) + Md5.hashStr(user.current.mobile.toLowerCase() + "@Nosetime"));
						post(user.current.mobile, Md5.hashStr(pwd + prelogin.current.token), prelogin.current.token);
					} else if (prelogin.current.type == "verify") {
						prelogin.current = null;
						AlertCtrl.show({
							header: "用户名或密码错误",
							key: "user_pwd_err_alert",
							message: "",
							buttons: [{
								text: "确定",
								handler: () => {
									AlertCtrl.close("user_pwd_err_alert")
								}
							}]
						});
					} else {
						prelogin.current = null;
						AlertCtrl.show({
							header: "用户名或密码错误",
							key: "user_pwd_err_alert",
							message: "",
							buttons: [{
								text: "确定",
								handler: () => {
									AlertCtrl.close("user_pwd_err_alert")
								}
							}]
						});
					}
				}).catch((error: any) => {
					AlertCtrl.show({
						header: "请查看是否连上网络",
						key: "network_err_alert",
						message: error,
						buttons: [{
							text: "确定",
							handler: () => {
								AlertCtrl.close("network_err_alert")
							}
						}]
					});
				})
			}
		} else {
			AlertCtrl.show({
				header: "用户名或密码错误",
				key: "user_pwd_err_alert",
				message: "",
				buttons: [{
					text: "确定",
					handler: () => {
						AlertCtrl.close("user_pwd_err_alert")
					}
				}]
			});
		}
	}

	return (
		<View style={styles.unregister_container}>
			<HeaderView
				data={{
					title: "账户注销",
					isShowSearch: false,
				}}
				method={{
					back: () => { navigation.goBack() },
				}} />
			<View style={styles.unregister_con}>{terms}</View>
			<LinearButton containerStyle={styles.footer_btn} text="继续注销" onPress={() => { unregister_alert("mobile") }} />
		</View>
	);
})

const styles = StyleSheet.create({
	unregister_container: {
		flex: 1,
		backgroundColor: theme.toolbarbg,
	},
	unregister_con: {
		marginVertical: 20,
		marginHorizontal: 25,
	},
	unregister_title: {
		fontSize: 16,
		color: "#000",
		marginBottom: 15,
	},
	unregister_text: {
		fontSize: 14,
		color: theme.comment,
		marginBottom: 10,
	},
	footer_btn: {
		marginTop: 63,
		marginHorizontal: 35,
	}
});
export default UserUnregister;