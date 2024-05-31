import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions, TextInput } from "react-native";

import { Md5 } from "ts-md5";

import HeaderView from "../../components/headerview";
import LinearButton from "../../components/linearbutton";
import AlertCtrl from "../../components/alertctrl";
import ToastCtrl from "../../components/toastctrl";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();

function UserChangeInfo({ navigation, route }: any): React.JSX.Element {
	// 控件
	// 参数
	const { type, modify } = route.params;
	let passdata = React.useRef<any>({
		pwd0: "",
		pwd: "",
		pwd2: "",
	});
	let mobiledata = React.useRef<any>({
		mobile: "",
		code: "",
		pwd: "",
		pwd2: "",
	});
	// 变量
	let modifyval = React.useRef<string>("修改");
	let holder = React.useRef<string>("");
	let title = React.useRef<string>("");
	let step = React.useRef<string>("verify");
	let wait = React.useRef<number>(0); // 倒计时
	let cachehandle = React.useRef<any>(null); // 倒计时句柄
	let waitbtnsz = React.useRef<string>("获取验证码");
	let result = React.useRef<string>("");
	// 数据
	// 状态
	const [isrender, setisRender] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (type == "mobile" && modify != "modify") {
			modifyval.current = "设置";
			step.current = "sendcode";
			holder.current = "请输入您的手机号";
		}
		if (type == "mobile") {
			title.current = modifyval.current + "手机号";
		} else if (type == "email") {
			title.current = modifyval.current + "邮箱";
		} else if (type == "pass") {
			title.current = "修改密码";
		} else {
			navigation.goBack();
		}
		console.log("%c Line:57 🍏 step.current", "color:#33a5ff", step.current);
		setisRender(val => !val);
	}, [])

	// 输入框内容变更
	const OnClange = (type: string, valtype: string, value: string) => {
		if (type == "pass") {
			passdata.current[valtype] = value;
		} else if (type == "mobile") {
			mobiledata.current[valtype] = value;
		}
		setisRender(val => !val);
	}

	// 动态获取按钮文字
	const getBtntext = () => {
		let text = "";
		if (type == "pass") {
			text = "确认修改";
		} else if (type == "mobile") {
			if (step.current == "sendcode") {
				text = "立即绑定";
			} else if (step.current == "verify" || step.current == "setpass") {
				text = "下一步";
			} else if (step.current == "ok") {
				text = "返回";
			}
		}
		return text;
	}

	// 点击按钮
	const onPress = () => {
		if (type == "pass") {
			change_pass();
		} else if (type == "mobile") {
			if (step.current == "sendcode") {
				change_mobile("code");
			} else if (step.current == "verify") {
				change_mobile("verify");
			} else if (step.current == "setpass") {
				change_mobile("setpass");
			} else if (step.current == "ok") {
				navigation.goBack();
			}
		}
	}

	// 修改密码
	const change_pass = () => {
		var mobile = us.mobile;
		var name = us.user.uname;
		var pwd0 = passdata.current.pwd0;
		var pwd = passdata.current.pwd;
		var pwd2 = passdata.current.pwd2;

		var errmsg = "";
		if (pwd.length < 6)
			errmsg += "新密码长度不足。\n";
		else if (pwd0 == pwd)
			errmsg += "原密码和新密码相同。\n";
		else if (mobile.indexOf(pwd) >= 0)
			errmsg += "手机号或Email不应包含密码。\n";
		else if (name.indexOf(pwd) >= 0)
			errmsg += "昵称不应包含密码。\n";
		else if (pwd.indexOf(mobile) >= 0)
			errmsg += "密码不应包含手机号或Email。\n";
		else if (pwd.indexOf(name) >= 0)
			errmsg += "密码不应包含昵称。\n";
		else if (pwd != pwd2)
			errmsg += "两次输入密码不一致。\n";
		if (errmsg != "") {
			AlertCtrl.show({
				header: "输入错误",
				key: "pass_err_alert",
				message: errmsg,
				buttons: [{
					text: "确定",
					handler: () => {
						AlertCtrl.close("pass_err_alert");
					}
				}]
			})
			return;
		}

		pwd0 = Md5.hashStr(pwd0);
		pwd = Md5.hashStr(pwd);
		http.post(ENV.api + ENV.user, { method: "changepwd_v2", id: us.user.uid, p0: pwd0, p1: pwd, token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				ToastCtrl.show({ message: "密码已重置", duration: 2000, viewstyle: "short_toast", key: "pass_success_toast" });
				navigation.goBack();
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
			} else {
				AlertCtrl.show({
					header: "密码重置失败",
					key: "pass_err_alert",
					message: resp_data.msg,
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close("pass_err_alert");
						}
					}]
				})
			}
		});
	};

	// 修改手机号
	const change_mobile = (type: string) => {
		result.current = "";
		if (modifyval.current == "设置") {
			return set_mobile();
		}

		var mobile = mobiledata.current.mobile;

		var data;
		var pwd = Md5.hashStr(mobiledata.current.pwd);
		if (step.current == "verify") {
			data = { method: "changeaccount", step: step, pwd: pwd, uid: us.user.uid, token: us.user.token };
		} else if (step.current == "sendcode") {
			if (wait.current > 0) return;
			if (type == "mobile" && !us.ismobile(mobile)) {
				AlertCtrl.show({
					header: "输入错误",
					key: "mobile_err_alert",
					message: "手机号格式不正确。",
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close("mobile_err_alert");
						}
					}]
				})
				return;
			} else if (type == "email" && !us.isemail(mobile)) {
				AlertCtrl.show({
					header: "输入错误",
					key: "mobile_err_alert",
					message: "Email格式不正确。",
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close("mobile_err_alert");
						}
					}]
				})
				return;
			}
			data = { method: "changeaccount", step: step, pwd: pwd, mobile: mobile, uid: us.user.uid, token: us.user.token };
		} else if (step.current == "code") {
			var code = parseInt(mobiledata.current.code);
			if (code < 1000 || code > 999999) {
				AlertCtrl.show({
					header: "输入错误",
					key: "verify_err_alert",
					message: "验证码格式不正确。",
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close("verify_err_alert");
						}
					}]
				})
				return;
			}
			data = { method: "changeaccount", step: step, pwd: pwd, mobile: mobile, code: code, uid: us.user.uid, token: us.user.token };
		}
		http.post(ENV.api + ENV.user, data).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				if (resp_data.detail) {
					ToastCtrl.show({ message: resp_data.detail, duration: 2000, viewstyle: "medium_toast", key: "setmobile_success_toast" });
				}

				if (step.current == "verify") {
					if (type == "mobile") {
						holder.current = "输入新手机号";
						ToastCtrl.show({ message: "验证码已发送到您的手机", duration: 1000, viewstyle: "superior_toast", key: "verify_success_toast" });
					} else if (type == "email") {
						holder.current = "输入新邮箱";
						ToastCtrl.show({ message: "验证码已发送到您的邮箱", duration: 1000, viewstyle: "superior_toast", key: "verify_success_toast" });
					}
					step.current = "sendcode";
				} else if (step.current == "sendcode") {
					wait.current = 60;
					clearInterval(cachehandle.current);
					cachehandle.current = setInterval(() => {
						countdown();
					}, 1000);
				} else if (step.current == "code") {
					if (type == "mobile") {
						result.current = "您的手机已修改";
					} else if (type == "email") {
						result.current = "您的邮箱已修改";
						us.setMobile(mobile);
					}
					step.current = "ok";
				}
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				result.current = "登录过期，请重新登录";
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App修改手机号页" } });
			} else {
				result.current = resp_data.msg;
			}
		});
	}

	// 设置手机号
	const set_mobile = () => {
		//设置手机号，输入手机号，
		//后台验证手机号是否使用
		//后台没有使用发送验证码，确定机主身份。
		//输入验证码
		//验证码错误，提示重新输入
		//错误次数多，提示明天再试
		//设置输入密码
		var code = 0;
		var mobile = mobiledata.current.mobile;
		var data;

		if (step.current == "sendcode") {
			if (wait.current > 0) return;
			if (!us.ismobile(mobile)) {
				AlertCtrl.show({
					header: "输入错误",
					key: "mobile_err_alert",
					message: "手机号格式不正确。",
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close("mobile_err_alert");
						}
					}]
				})
				return;
			}
			data = { method: "setmobile", step: step, mobile: mobile, uid: us.user.uid, token: us.user.token };
		} else if (step.current == "code") {
			code = parseInt(mobiledata.current.code);
			if (code < 1000 || code > 999999) {
				AlertCtrl.show({
					header: "输入错误",
					key: "verify_err_alert",
					message: "验证码格式不正确。",
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close("verify_err_alert");
						}
					}]
				})
				return;
			}
			data = { method: "setmobile", step: step, mobile: mobile, code: code, uid: us.user.uid, token: us.user.token };
		} else if (step.current == "setpass") {
			code = parseInt(mobiledata.current.code);

			var pwd = mobiledata.current.pwd;
			var pwd2 = mobiledata.current.pwd2;

			var errmsg = "";
			if (pwd.length < 6)
				errmsg += "新密码长度不足。\n";
			else if (mobile.indexOf(pwd) >= 0)
				errmsg += "手机号不应包含密码。\n";
			//if(name.indexOf(pwd)>=0)
			//	errmsg+="昵称不应包含密码。\n";
			else if (pwd.indexOf(mobile) >= 0)
				errmsg += "密码不应包含手机号。\n";
			//if(pwd.indexOf(name)>=0)
			//	errmsg+="密码不应包含昵称。\n";
			else if (pwd != pwd2)
				errmsg += "两次输入密码不一致。\n";
			if (errmsg != "") {
				AlertCtrl.show({
					header: "输入错误",
					key: "pass_err_alert",
					message: errmsg,
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close("pass_err_alert");
						}
					}]
				})
				return;
			}

			pwd = Md5.hashStr(mobiledata.current.pwd);

			data = { method: "setmobile", step: step, mobile: mobile, code: code, pwd: pwd, uid: us.user.uid, token: us.user.token };
		}
		http.post(ENV.api + ENV.user, data).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				if (resp_data.detail) {
					ToastCtrl.show({ message: resp_data.detail, duration: 2000, viewstyle: "medium_toast", key: "setmobile_success_toast" });
				}
				if (step.current == "sendcode") {
					holder.current = "输入新手机号";
					ToastCtrl.show({ message: "验证码已发送到您的手机", duration: 1000, viewstyle: "superior_toast", key: "verify_success_toast" });
					wait.current = 60;
					clearInterval(cachehandle.current);
					cachehandle.current = setInterval(() => {
						countdown();
					}, 1000);
				} else if (step.current == "code") {
					//if(this.type=="mobile"){
					//	result.current = "您的手机已修改";
					//}else if(this.type=="email"){
					//	result.current = "您的邮箱已修改";
					//	this.us.setMobile(mobile);
					//}
					step.current = "setpass";
				} else if (step.current == "setpass") {
					result.current = "您的手机号码和密码已设置";
					step.current = "ok";
				}
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				result.current = "登录过期，请重新登录";
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App修改手机号页" } });
			} else {
				result.current = resp_data.msg;
			}
		});
	}

	const countdown = () => {
		if (wait.current > 0) {
			wait.current--;
			waitbtnsz.current = wait.current + "秒后重发";
		}
		if (wait.current == 0) {
			clearInterval(cachehandle.current);
			waitbtnsz.current = "重发验证码";
		}
	}

	return (
		<View style={styles.changeinfo_container}>
			<HeaderView data={{
				title: "",
				backicon: "close",
				backiconsize: 30,
				backiconcolor: theme.comment,
				isShowSearch: false,
			}} method={{
				back: () => { navigation.goBack() },
			}} />
			<View style={styles.changeinfo_con}>
				{type == "pass" && <View>
					<Text style={styles.change_title}>{title.current}</Text>
					<View style={styles.chnage_list}>
						<TextInput
							style={styles.input}
							value={passdata.current.pwd0}
							onChangeText={(value) => { OnClange("pass", "pwd0", value) }}
							placeholder="旧密码"
							placeholderTextColor={theme.placeholder}
							secureTextEntry={true}
						/>
						<TextInput
							style={styles.input}
							value={passdata.current.pwd}
							onChangeText={(value) => { OnClange("pass", "pwd", value) }}
							placeholder="新密码 (最少6位数)"
							placeholderTextColor={theme.placeholder}
							secureTextEntry={true}
						/>
						<TextInput
							style={[styles.input, { marginBottom: 2 }]}
							value={passdata.current.pwd2}
							onChangeText={(value) => { OnClange("pass", "pwd2", value) }}
							placeholder="请确认新密码"
							placeholderTextColor={theme.placeholder}
							secureTextEntry={true}
						/>
						<Text style={styles.pass_tip}>{"请使用超过6位的数字或者字母设置新密码"}</Text>
					</View>
				</View>}
				{(type == "mobile" || type == "email") && <View>
					{step.current == "sendcode" && <>
						<Text style={[styles.change_title, { marginBottom: 41 }]}>{title.current}</Text>
						<View style={[styles.chnage_list, { marginTop: 0 }]}>
							<TextInput
								style={styles.input}
								value={mobiledata.current.mobile}
								onChangeText={(value) => { OnClange("mobile", "mobile", value) }}
								placeholder={holder.current}
								placeholderTextColor={theme.placeholder}
							/>
							<View style={styles.input_view}>
								<TextInput style={styles.waitinput}
									value={mobiledata.current.code}
									onChangeText={(value) => { OnClange("mobile", "code", value) }}
									placeholder="验证码"
									placeholderTextColor={theme.placeholder}
								/>
								<Pressable onPress={() => { }}>
									<Text style={styles.codetext}>{waitbtnsz.current}</Text>
								</Pressable>
							</View>
						</View>
						<Text style={styles.change_result}>{result.current}</Text>
					</>}
					{step.current == "verify" && <>
						<Text style={styles.change_title}>{"请验证您的密码"}</Text>
						<Text style={styles.verify_text}>{"该账户已绑定：" + us.user.mobile}</Text>
						<Text style={[styles.verify_text, { marginBottom: 47 }]}>{"请在下方输入用户密码验证您是此账户的拥有者"}</Text>
						<TextInput
							style={[styles.input, { marginBottom: 20 }]}
							value={mobiledata.current.pwd}
							onChangeText={(value) => { OnClange("mobile", "pwd", value) }}
							placeholder="密码"
							placeholderTextColor={theme.placeholder}
							secureTextEntry={true}
						/>
						<Text style={styles.change_result}>{result.current}</Text>
					</>}
					{step.current == "setpass" && <>
						<Text style={[styles.change_title, { marginBottom: 41 }]}>{"设置密码"}</Text>
						<TextInput
							style={[styles.input, { marginBottom: 20 }]}
							value={mobiledata.current.pwd}
							onChangeText={(value) => { OnClange("mobile", "pwd", value) }}
							placeholder="请为手机登录输入密码"
							placeholderTextColor={theme.placeholder}
							secureTextEntry={true}
						/>
						<TextInput
							style={[styles.input, { marginBottom: 20 }]}
							value={mobiledata.current.pwd}
							onChangeText={(value) => { OnClange("mobile", "pwd2", value) }}
							placeholder="请再次输入密码"
							placeholderTextColor={theme.placeholder}
							secureTextEntry={true}
						/>
						<Text style={styles.change_result}>{result.current}</Text>
					</>}
					{step.current == "ok" && <Text style={styles.change_result}>{result.current}</Text>}
				</View>}
				<LinearButton containerStyle={styles.footer_btn} text={getBtntext()} onPress={onPress} />
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	changeinfo_container: {
		flex: 1,
		backgroundColor: theme.toolbarbg
	},
	changeinfo_con: {
		paddingVertical: 16,
		paddingHorizontal: 35,
	},
	change_title: {
		fontSize: 25,
		color: theme.tit2,
	},
	change_result: {
		fontSize: 16,
		textAlign: "center",
		color: theme.tit2,
		marginTop: 20,
		marginBottom: 10,
		fontWeight: "500"
	},
	chnage_list: {
		marginTop: 41,
		marginHorizontal: 5,
	},
	input: {
		padding: 0,
		paddingLeft: 23,
		backgroundColor: theme.bg,
		color: theme.tit2,
		height: 44,
		borderRadius: 30,
		marginBottom: 20,
	},
	pass_tip: {
		fontSize: 12,
		color: theme.placeholder,
		marginLeft: 23,
	},
	input_view: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.bg,
		height: 44,
		borderRadius: 30,
		paddingLeft: 23,
	},
	waitinput: {
		flex: 1,
		padding: 0,
	},
	codetext: {
		fontSize: 14,
		color: theme.tit2,
		marginLeft: 10,
		marginRight: 24,
	},
	verify_text: {
		fontSize: 13,
		color: theme.placeholder,
		marginTop: 13,
	},
	footer_btn: {
		marginTop: 63,
	}
});
export default UserChangeInfo;