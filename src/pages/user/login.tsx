import React from "react";
import {
	View,
	Text,
	Image,
	ImageBackground,
	StyleSheet,
	TextInput,
	Pressable,
	Dimensions,
	BackHandler,
	NativeEventEmitter
} from "react-native";

import { Md5 } from "ts-md5";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Icon from "../../assets/iconfont";
import theme from "../../configs/theme";
import cache from "../../hooks/storage/storage";

import { ENV } from "../../configs/ENV";
import http from "../../utils/api/http";
import us from "../../services/user-service/user-service";
import AlertCtrl from "../../components/alertctrl";
import ToastCtrl from "../../components/toastctrl";

const { height, width } = Dimensions.get("window");
const events = new NativeEventEmitter();


const isemail = (email: string) => {
	if (!email || email.length < 7) return false;
	var regex = /^[a-z0-9]+([\+_\-\.]?[a-z0-9]+)*@([a-z0-9]+[\-]?[a-z0-9]*\.)+[a-z]{2,6}$/i;
	return regex.test(email);
}

const ismobile = (mobile: string) => {
	if (!mobile || mobile.length != 11) return false;
	var regex = /^1[3-9]\d{9}$/;
	return regex.test(mobile);
}

const LoginScreen = ({ user, setstep, setuser, login, goback }: any) => {
	return (
		<>
			<View style={styles.inputview}>
				<Icon name="user" style={styles.inputlefticon} />
				<TextInput
					style={styles.input}
					value={user.mobile}
					onChangeText={(e) => setuser({ ...user, mobile: e })}
					placeholder="用户名/手机号/邮箱"
					placeholderTextColor={theme.toolbarbg}
				/>
			</View>
			<View style={styles.inputview}>
				<Icon name="lock1" style={styles.inputlefticon} />
				<TextInput
					style={styles.input}
					value={user.pwd}
					onChangeText={(e) => setuser({ ...user, pwd: e })}
					placeholder="密码"
					placeholderTextColor={theme.toolbarbg}
					secureTextEntry={true}
				/>
				<Icon name="query" style={styles.inputrighticon} onPress={() => { setstep("1") }} />
			</View>
			<Pressable style={styles.landingbtn} onPress={login}>
				<Text style={styles.landingtext}>登录</Text>
			</Pressable>
			<Pressable onPress={() => setstep("register")}>
				<Text style={styles.nouser}>没有账号？快速注册</Text>
			</Pressable>
			<View style={styles.otherlogin}>
				<View style={styles.otherloginView}>
					<View style={styles.otherloginicon}>
						<Icon name="weixin" size={30} style={styles.anticon} />
						<Text style={styles.otherloginname}>微信登陆</Text>
					</View>
					<View style={styles.otherloginicon}>
						<Icon name="weibo" size={30} style={styles.anticon} />
						<Text style={styles.otherloginname}>微博登陆</Text>
					</View>
				</View>
				<Pressable onPress={goback}>
					<Text style={styles.suibian}>{"> 随便逛逛"}</Text>
				</Pressable>
			</View>
		</>
	)
}

const RegisterScreen = ({ navigation, user, setuser, setstep, setwaitbtnsz, login }: any) => {

	// 数据
	const [agree, setagree] = React.useState(false);

	const register = () => {
		console.log("register", user);
		var mobile = user.mobile;
		var name = user.name;
		var pwd = user.pwd;
		var pwd2 = user.pwd2;
		var errmsg = "";
		var header = "输入错误";
		if (!isemail(mobile) && !ismobile(mobile))
			errmsg += "手机号/Email格式不正确\n";
		else if (name.length < 2)
			errmsg += "昵称长度不足\n";
		else if (pwd.length < 6)
			errmsg += "密码长度不足\n";
		else if (mobile.indexOf(pwd) >= 0)
			errmsg += "手机号或Email不应包含密码\n";
		else if (name.indexOf(pwd) >= 0)
			errmsg += "昵称不应包含密码\n";
		else if (pwd.indexOf(mobile) >= 0)
			errmsg += "密码不应包含手机号或Email\n";
		else if (pwd.indexOf(name) >= 0)
			errmsg += "密码不应包含昵称\n";
		else if (pwd != pwd2)
			errmsg += "两次输入密码不一致\n";
		else if (!agree) {
			header = "使用协议";
			errmsg = "您必须同意香水时代使用协议才能完成注册";
		}
		if (errmsg != "") {
			AlertCtrl.show({
				header: header,
				message: errmsg.replace(/\n/g, ""),
				buttons: [{
					text: "确定",
					handler: () => {
						AlertCtrl.close()
					}
				}]
			})
			return;
		}
		pwd = Md5.hashStr(Md5.hashStr(pwd) + Md5.hashStr(mobile.toLowerCase() + "@Nosetime"));

		http.post(ENV.user, { method: "registerv2", mobile: mobile, pwd: pwd, name: name, gender: user.gender, from: "app" }).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				ToastCtrl.show({ message: "恭喜！您已注册成功", duration: 2000, viewstyle: "medium_toast" });
				login(mobile, user.pwd);
			} else if (resp_data.msg == "verify") {
				setstep("verify");
				setwaitbtnsz("获取验证码");
			} else {
				AlertCtrl.show({
					header: "注册失败",
					message: resp_data.msg,
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close()
						}
					}]
				})
			}
		})
	}

	return (
		<>
			<View style={styles.inputview}>
				<Icon name="sixin1" style={styles.inputlefticon} />
				<TextInput
					style={styles.input}
					value={user.mobile}
					onChangeText={(e) => setuser({ ...user, mobile: e })}
					maxLength={35}
					placeholder="手机号/邮箱"
					placeholderTextColor="#fff"
				/>
			</View>
			<View style={styles.inputview}>
				<Icon name="xiaolian" style={styles.inputlefticon} />
				<TextInput
					style={styles.input}
					value={user.name}
					onChangeText={(e) => setuser({ ...user, name: e })}
					maxLength={35}
					placeholder="昵称"
					placeholderTextColor="#fff"
				/>
			</View>
			<View style={styles.inputview}>
				<Icon name="lock1" style={styles.inputlefticon} />
				<TextInput
					style={styles.input}
					value={user.pwd}
					onChangeText={(e) => setuser({ ...user, pwd: e })}
					maxLength={35}
					placeholder="设置6位以上密码"
					placeholderTextColor="#fff"
					secureTextEntry={true}
				/>
			</View>
			<View style={styles.inputview}>
				<Icon name="lock1" style={styles.inputlefticon} />
				<TextInput
					style={styles.input}
					value={user.pwd2}
					onChangeText={(e) => setuser({ ...user, pwd2: e })}
					maxLength={35}
					placeholder="再次输入密码"
					placeholderTextColor="#fff"
					secureTextEntry={true}
				/>
			</View>
			<View style={styles.radiobox}>
				<Pressable style={[styles.radioItem, { marginRight: 45 }]} onPress={() => setuser({ ...user, gender: "f" })}>
					{user.gender === "f" && <Icon name="radio-button-on" style={styles.radio_btn} />}
					{user.gender !== "f" && <Icon name="radio-button-off" style={styles.radio_btn} />}
					<Text style={styles.radioText}>女士</Text>
				</Pressable>
				<Pressable style={styles.radioItem} onPress={() => setuser({ ...user, gender: "m" })}>
					{user.gender === "m" && <Icon name="radio-button-on" style={styles.radio_btn} />}
					{user.gender !== "m" && <Icon name="radio-button-off" style={styles.radio_btn} />}
					<Text style={styles.radioText}>男士</Text>
				</Pressable>
			</View>
			<View style={[styles.radiobox]}>
				<Pressable style={[styles.radioItem, { marginRight: 10 }]} onPress={() => setagree(!agree)}>
					{!agree && <Icon name="radio" style={styles.radio_uncheck} />}
					{agree && <View style={styles.radio_checked_con}><View style={styles.radio_checked_bg}></View><Icon name="radio-checked" style={styles.radio_checked} /></View>}
				</Pressable>
				<Pressable onPress={() => setagree(!agree)}>
					<Text style={{ fontSize: 12, color: theme.toolbarbg }}>
						我已阅读并同意
						<Text style={{ color: "#E4E8FF" }} onPress={() => navigation.navigate("Page", { screen: "Protocol", params: { title: "香水时代使用协议", type: "protocol" } })}>《香水时代使用协议》</Text>
					</Text>
				</Pressable>
			</View>
			<Pressable style={[styles.landingbtn, { marginTop: 3 }]} onPress={register}>
				<Text style={styles.landingtext}>注册</Text>
			</Pressable>
		</>
	)
}

const ResetScreen = ({ user, setuser, result, resetpwd, waitbtnsz }: any) => {

	return (
		<>
			{(user.step === "1" || user.step === "2") &&
				<>
					<View style={styles.inputview}>
						<Icon name="sixin1" style={styles.inputlefticon} />
						<TextInput
							style={styles.input}
							value={user.mobile}
							onChangeText={(e) => setuser({ ...user, mobile: e })}
							placeholder="用户名/手机号/邮箱"
							placeholderTextColor="#fff"
						/>
					</View>
					<View style={styles.inputview}>
						<Icon name="secure" style={styles.inputlefticon} />
						<TextInput
							style={styles.input}
							value={user.code}
							onChangeText={(e) => setuser({ ...user, code: e })}
							placeholder="验证码"
							placeholderTextColor="#fff"
						/>
						<Pressable onPress={() => {
							resetpwd("1", "resetpwd");
						}}>
							<Text style={styles.codetext}>{waitbtnsz}</Text>
						</Pressable>
					</View>
					<Pressable style={styles.landingbtn} onPress={() => {
						resetpwd("2", "resetpwd");
					}}>
						<Text style={styles.landingtext}>下一步</Text>
					</Pressable>
				</>
			}
			{user.step === "3" &&
				<>
					<View style={styles.inputview}>
						<Icon name="lock1" style={styles.inputlefticon} />
						<TextInput
							style={styles.input}
							value={user.pwd}
							onChangeText={(e) => setuser({ ...user, pwd: e })}
							placeholder="设置6位以上新密码"
							placeholderTextColor="#fff"
							secureTextEntry={true}
						/>
					</View>
					<View style={styles.inputview}>
						<Icon name="lock1" style={styles.inputlefticon} />
						<TextInput
							style={styles.input}
							value={user.pwd2}
							onChangeText={(e) => setuser({ ...user, pwd2: e })}
							placeholder="再次输入密码"
							placeholderTextColor="#fff"
							secureTextEntry={true}
						/>
					</View>
					<Pressable style={styles.landingbtn} onPress={() => {
						resetpwd("3", "resetpwd");
					}}>
						<Text style={styles.landingtext}>下一步</Text>
					</Pressable>
					<Text style={{ color: theme.toolbarbg, fontSize: 13, marginTop: 18, marginBottom: 10 }}>{result}</Text>
				</>
			}
			{user.step === "4" &&
				<Pressable style={styles.landingbtn} onPress={() => { setuser({ ...user, step: "login" }); }}>
					<Text style={styles.landingtext}>立即登录</Text>
				</Pressable>
			}
		</>
	)
}

const VerifyScreen = ({ user, setuser, verify, waitbtnsz }: any) => {

	return (
		<>
			{user.step === "verify" &&
				<>
					<View style={styles.inputview}>
						<Icon name="secure" style={styles.inputlefticon} />
						<TextInput
							style={styles.input}
							value={user.code}
							onChangeText={(e) => setuser({ ...user, code: e })}
							placeholder="验证码"
							placeholderTextColor="#fff"
						/>
						<Pressable onPress={() => { verify("1", "verify"); }}>
							<Text style={styles.codetext}>{waitbtnsz}</Text>
						</Pressable>
					</View>
					<Pressable style={styles.landingbtn} onPress={() => { verify("2", "verify"); }}>
						<Text style={styles.landingtext}>确定</Text>
					</Pressable>
				</>
			}
			{user.step === "5" &&
				<Pressable style={styles.landingbtn} onPress={() => { setuser({ ...user, step: "login" }); }}>
					<Text style={styles.landingtext}>立即登录</Text>
				</Pressable>
			}
		</>
	)
}

function Login({ route, navigation }: any): React.JSX.Element {

	// 控件
	const insets = useSafeAreaInsets();

	// 参数
	const { src } = route.params;

	// 数据
	const [user, setuser] = React.useState<any>({
		gender: "f",
		mobile: "",
		pwd: "",
		pwd2: "",
		name: "",
		code: "",
		step: "login",
	}); // 用户信息
	const [waitbtnsz, setwaitbtnsz] = React.useState<string>("获取验证码"); // 验证码按钮文字
	const [prelogin, setPrelogin] = React.useState<any>(null); // 预登录
	const [result, setResult] = React.useState<string>(""); // 登录结果

	// 变量
	let step = React.useRef<string>("login"); // 步骤
	let wait = React.useRef<number>(0); // 倒计时
	let cachehandle = React.useRef<any>(null); // 倒计时句柄

	const countdown = () => {
		if (wait.current > 0) {
			wait.current--;
			setwaitbtnsz(wait.current + "秒后重发");
		}
		if (wait.current == 0) {
			clearInterval(cachehandle.current);
			setwaitbtnsz("获取验证码");
		}
	}

	const setstep = (val: string, type: string) => {
		step.current = val;
		if (type == "verify" && val == "2") return;
		setuser({ ...user, step: val });
	}

	// 重置密码
	const reset_verify = (val: string, type: string) => {
		setstep(val, type);
		console.log(type, user, step.current);
		let mobile = user.mobile;
		let data;
		let p1;
		if (step.current === "1") {
			if (wait.current > 0) return;
			if (!isemail(mobile) && !ismobile(mobile)) {
				AlertCtrl.show({
					header: "输入错误",
					message: "手机号/Email格式不正确。",
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close()
						}
					}]
				});
				return;
			}
			data = { method: type, step: 1, mobile: mobile };
		} else if (step.current === "2") {
			if (!user.code) {
				ToastCtrl.show({ message: "请输入验证码", duration: 2000, viewstyle: "medium_toast" });
				return;
			}
			if (parseInt(user.code) < 1000 || parseInt(user.code) > 999999) {
				AlertCtrl.show({
					header: "输入错误",
					message: "验证码格式不正确。",
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close()
						}
					}]
				});
				return
			}
			data = { method: type, step: 2, mobile: mobile, code: user.code };
		} else if (type == "resetpwd" && step.current === "3") {
			var pwd = user.pwd;
			var pwd2 = user.pwd2;
			var errmsg = "";
			if (pwd.length < 6)
				errmsg += "密码长度不足。\n";
			else if (mobile.indexOf(pwd) >= 0)
				errmsg += "手机号或Email不应包含密码。\n";
			else if (pwd.indexOf(mobile) >= 0)
				errmsg += "密码不应包含手机号或Email。\n";
			else if (pwd != pwd2)
				errmsg += "两次输入密码不一致。\n";
			if (errmsg != "") {
				AlertCtrl.show({
					header: "输入错误",
					message: errmsg,
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close()
						}
					}]
				});
				return
			}

			p1 = Md5.hashStr(pwd);

			data = { method: type, step: 3, mobile: mobile, code: user.code, p1: p1 };
		}
		http.post(ENV.user, data).then((resp_data: any) => {
			console.log("resp_data=", resp_data);
			if (resp_data.msg == "OK") {
				//登录后处理，参考LoginCtrl
				if (step.current == "1") {
					if (isemail(mobile)) {
						ToastCtrl.show({ message: "验证码已发送到您的邮箱", duration: 1000, viewstyle: "superior_toast" });
					} else {
						ToastCtrl.show({ message: "验证码已发送到您的手机", duration: 1000, viewstyle: "superior_toast" });
					}
					wait.current = 60;
					clearInterval(cachehandle.current);
					cachehandle.current = setInterval(() => {
						countdown();
					}, 1000);
					setwaitbtnsz(wait.current + "秒后重发");
					if (type == "resetpwd") setstep("2", type);
				} else if (step.current == "2") {
					if (type == "verify") {
						setstep("5", type)
					} else {
						setstep("3", type);
					}
				} else if (type == "resetpwd" && step.current == "3") {
					setstep("4", type);
				}
			} else {
				if (type == "resetpwd" && step.current == "2") {
					setResult(resp_data.msg);
				}
				AlertCtrl.show({
					header: "失败",
					message: resp_data.msg,
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close()
						}
					}]
				})
			}
		})
	};

	const goback = () => {
		if (user.step === "login") {
			if (navigation.canGoBack()) {
				navigation.goBack();
			} else {
				navigation.navigate("Tabs", { screen: "Home" });
			}
		} else {
			setuser({ ...user, step: "login", code: "" });
		}
	}

	const changegender = () => {
		/*
		let alert = this.alertCtrl.create({
			title: "设置性别",
			message: "",
			buttons: [{
				text: "我是男生",
				//role: "cancel",
				//handler: () = >{console.log("Cancel clicked");}
			},
			{
				text: "我是女生",
				//handler: () = >{console.log("Buy clicked");}
			}]
		});
		alert.present();*/


		/*$ionicPopup.show({
			title: "设置性别",
			buttons: [{ //Array[Object] (可选)。放在弹窗footer内的按钮。
				text: " 我是男生",
				type: "button-positive ion-male",
				onTap: function(e){return "m"}
			}, {
				text: " 我是女生",
				type: "button-assertive ion-female",
				onTap: function(e){return "f"}
			}]
		}).then(function(resp){
			if(resp=="f")
				gender="我是女生";
			else if(resp=="m")
				gender="我是男生";
			else
				return;

			try {
				$cordovaToast.showShortBottom(gender);
			} catch(e){
				console.log(gender);
			}

			this.us.user.ugender=resp;
			this.us.saveUser(this.us.user);
			this.us.setGender(resp);
			//window.localStorage.setItem("user",JSON.stringify(this.us.user));
			//window.localStorage.setItem("gender",$rootScope.gender);

			$http.post(ENV.api+ENV.user,"method=changegender&id="+this.us.user.uid+"&token="+this.us.user.token+"&gender="+resp);
		});*/
	}

	//支付成功跳转：如果需要刷新，跳转到本login页面时加 parentPage:this 参数，并需要有 init 函数
	const goBackAfterLogin = () => {
		cache.removeItem("usercollections" + us.user.uid);
		if (src) {
			navigation.goBack();
		} else {
			navigation.navigate("Tabs", { screen: "User" });
		}
		// this.events.publish("user_reload");
		events.emit("nosetime_userlogin");
	}

	//登录验证
	const post = (mobile: string, pwd: string, token: string) => {
		// console.log("method=login&mobile="+mobile+"&pwd="+pwd+"&token="+token);
		http.post(ENV.user, { method: "login", mobile: mobile, pwd: pwd, token: token }).then((resp_data: any) => {
			console.log("resp_data=", resp_data);
			if (resp_data.msg == "OK") {
				//登录后处理，需要同步修改RegisterCtrl相关代码
				ToastCtrl.show({ message: "您已成功登录", duration: 1000, viewstyle: "medium_toast" });

				us.saveUser(resp_data);
				us.setMobile(mobile);
				us.setGender(resp_data.ugender);

				if (us.user.ugender != "f" && us.user.ugender != "m") {
					changegender();
				}
				//console.log("login =>request");
				//2020-3-11yak这个http请求会让页面跳转延迟
				http.post(ENV.points + "?uid=" + us.user.uid, { method: "increasetip", token: us.user.token }).then((resp_data: any) => {
					console.log("resp_data=", resp_data);
					if (resp_data.msg && resp_data.msg.indexOf("+") > 0) {
						ToastCtrl.show({ message: resp_data.msg, duration: 1000, viewstyle: "medium_toast" });
					}
					goBackAfterLogin();
				});
			} else {
				AlertCtrl.show({
					header: "登录失败!",
					message: resp_data.msg,
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close()
						}
					}]
				});
			}
		}).catch((error: any) => {
			AlertCtrl.show({
				header: error,
				message: "",
				buttons: [{
					text: "确定",
					handler: () => {
						AlertCtrl.close()
					}
				}]
			});
		});
	}

	// 预登录
	const signIn = () => {
		console.log("Sign-In", user.mobile, user.pwd);
		let pwd = "";
		if ((isemail(user.mobile) || ismobile(user.mobile)) && user.pwd.length >= 6) {
			console.log("Sign-In 1");
			if (prelogin !== null) {
				console.log("Sign-In 2", prelogin);
				if (prelogin.type == "old") {
					post(user.mobile, Md5.hashStr(user.pwd), "");
				} else if (prelogin.type == "new") {
					pwd = Md5.hashStr(Md5.hashStr(user.pwd) + Md5.hashStr(user.mobile.toLowerCase() + "@Nosetime"));
					post(user.mobile, Md5.hashStr(pwd + prelogin.token), prelogin.token);
				} else {
					setPrelogin(null);
				}
			} else {
				console.log("Sign-In 3");
				console.log("Sign-In 4", ENV.api + ENV.user);
				http.post(ENV.user, { method: "prelogin", mobile: user.mobile }).then((resp_data: any) => {
					console.log("Sign-In 7");
					console.log("resp_data=", resp_data);
					setPrelogin(resp_data);
					if (resp_data.type == "old") {
						post(user.mobile, Md5.hashStr(user.pwd), "");
					} else if (resp_data.type == "new") {
						pwd = Md5.hashStr(Md5.hashStr(user.pwd) + Md5.hashStr(user.mobile.toLowerCase() + "@Nosetime"));
						post(user.mobile, Md5.hashStr(pwd + resp_data.token), resp_data.token);
					} else if (resp_data.type == "verify") {
						step.current = "verify";
						setwaitbtnsz("获取验证码");
						setPrelogin(null);
					} else {
						AlertCtrl.show({
							header: "用户名或密码错误",
							message: "",
							buttons: [{
								text: "确定",
								handler: () => {
									AlertCtrl.close()
								}
							}]
						});
						setPrelogin(null);
					}
				}).catch((error: any) => {
					// this.loadingCtrl.dismiss();
					AlertCtrl.show({
						header: "请查看是否连上网络",
						message: error,
						buttons: [{
							text: "确定",
							handler: () => {
								AlertCtrl.close()
							}
						}]
					});
				})
			}
		} else {
			console.log("Sign-In 5");
			AlertCtrl.show({
				header: "用户名或密码错误",
				message: "",
				buttons: [{
					text: "确定",
					handler: () => {
						AlertCtrl.close()
					}
				}]
			});
		}
		console.log("Sign-In 6");
	}

	/* React.useEffect(() => {
		const backAction = () => {
			if (!navigation.isFocused()) return false;
			if (user.step !== "login") {
				setuser({ ...user, step: "login", code: "" });
				return true
			} else {
				return false
			}
		}
		const backhandler = BackHandler.addEventListener("hardwareBackPress", backAction)

		return () => {
			backhandler.remove()
		}
	}, [navigation, user.step]); */

	return (
		<>
			<ImageBackground style={{ width: "100%", height: "100%" }} source={require("../../assets/images/bg/login.jpg")}>
				<Pressable style={[styles.leftback, { marginTop: insets.top }]} onPress={goback}>
					<Icon name="leftarrow" style={styles.backicon} />
				</Pressable>
				<View style={styles.centerbox}>
					<Image style={[styles.logo, { marginTop: insets.top + 44 }]} resizeMode="contain" source={require("../../assets/images/bg/nlogo.png")} />
					{(user.step === "1" || user.step === "2") && <Text style={styles.resetText}>重置密码</Text>}
					{user.step === "3" && <Text style={styles.resetText}>验证通过</Text>}
					{user.step === "4" && <Text style={styles.resetText}>恭喜您，新密码设置成功！</Text>}
					{user.step === "verify" && <Text style={styles.resetText}>安全验证</Text>}
					{user.step === "5" && <Text style={styles.resetText}>恭喜您，验证成功！</Text>}
					{user.step === "login" &&
						<LoginScreen
							user={user}
							step={step}
							setstep={(val: string) => {
								step.current = val;
								setuser({ ...user, step: val });
							}}
							setuser={setuser}
							login={signIn}
							goback={goback}
						/>
					}
					{user.step === "register" &&
						<RegisterScreen
							user={user}
							setuser={setuser}
							login={signIn}
							navigation={navigation}
						/>
					}
					{(user.step === "1" || user.step === "2" || user.step === "3" || user.step === "4") &&
						<ResetScreen
							user={user}
							setuser={setuser}
							result={result}
							resetpwd={reset_verify}
							waitbtnsz={waitbtnsz}
						/>
					}
					{(user.step === "verify" || user.step === "5") &&
						<VerifyScreen
							user={user}
							setuser={setuser}
							verify={reset_verify}
							waitbtnsz={waitbtnsz}
						/>
					}
				</View>
			</ImageBackground>
		</>
	)
}

const styles = StyleSheet.create({
	leftback: {
		position: "absolute",
		left: 0,
		top: 0,
	},
	backicon: {
		width: 44,
		height: 44,
		textAlign: "center",
		lineHeight: 44,
		color: theme.toolbarbg,
		fontSize: 20,
		fontWeight: "bold",
	},
	logo: {
		height: height * 0.2,
		marginBottom: 35
	},
	centerbox: {
		flex: 1,
		alignItems: "center"
	},
	inputview: {
		flexDirection: "row",
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		borderRadius: 20,
		width: 255,
		height: 39,
		marginBottom: 10,
		alignItems: "center",
		paddingRight: 10
	},
	input: {
		padding: 0,
		flex: 1,
		color: theme.toolbarbg,
	},
	inputlefticon: {
		width: 39,
		fontSize: 20,
		marginLeft: 5,
		color: theme.toolbarbg,
		textAlign: "center",
	},
	inputrighticon: {
		width: 25,
		fontSize: 20,
		marginLeft: 5,
		color: theme.toolbarbg,
		textAlign: "center",
	},
	landingbtn: {
		width: 240,
		height: 42,
		backgroundColor: "#9BABFA",
		borderRadius: 22,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 26,
		marginBottom: 16
	},
	landingtext: {
		color: theme.toolbarbg,
		fontSize: 16
	},
	nouser: {
		color: theme.toolbarbg,
		fontSize: 14,
		marginTop: 6
	},
	otherlogin: {
		width: "100%",
		alignItems: "center",
		marginTop: 49
	},
	otherloginView: {
		flexDirection: "row",
		justifyContent: "center",
	},
	suibian: {
		marginTop: 49,
		fontSize: 13,
		color: theme.toolbarbg,
		textAlign: "center"
	},
	otherloginicon: {
		alignItems: "center",
		marginLeft: 28,
		marginRight: 28
	},
	anticon: {
		width: 45,
		height: 54,
		fontSize: 47,
		color: theme.toolbarbg,
	},
	otherloginname: {
		fontSize: 13,
		color: theme.toolbarbg,
		marginTop: 10,
	},
	codetext: {
		color: "#E4E8FF",
		fontSize: 13
	},
	resetText: {
		fontSize: 16,
		marginBottom: 35,
		color: theme.toolbarbg
	},
	radiobox: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: 20,
		paddingBottom: 25,
	},
	radioItem: {
		flexDirection: "row",
		alignItems: "center"
	},
	radioText: {
		color: theme.toolbarbg,
		marginLeft: 5.8
	},
	radio_btn: {
		fontSize: 12,
		color: theme.toolbarbg
	},
	radio_uncheck: {
		fontSize: 13,
		color: theme.toolbarbg
	},
	radio_checked_con: {
		position: "relative"
	},
	radio_checked_bg: {
		position: "absolute",
		width: 13,
		height: 13,
		left: 0,
		top: .5,
		backgroundColor: theme.toolbarbg,
		borderRadius: 7.5,
	},
	radio_checked: {
		fontSize: 13,
		color: "#9ba4fa"
	}
})

export default Login;