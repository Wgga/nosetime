import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions, ScrollView, Image, TextInput } from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import WebView from "react-native-webview";

import us from "../../services/user-service/user-service";
import upService from "../../services/upload-photo-service/upload-photo-service";

import HeaderView from "../../components/headerview";
import LinearButton from "../../components/linearbutton";
import AlertCtrl from "../../components/alertctrl";
import ActionSheetCtrl from "../../components/actionsheetctrl";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();

function MallIdcardEdit({ navigation }: any): React.JSX.Element {
	// 控件
	// 变量
	let imgface = React.useRef<string>("https://img.xssdcdn.com/static/mall/idcard/imgface.jpg");
	let imgbage = React.useRef<string>("https://img.xssdcdn.com/static/mall/idcard/imgbage.jpg");
	let pictype = React.useRef<string>("");
	// 参数
	const defultimagface = "https://img.xssdcdn.com/static/mall/idcard/imgface.jpg";
	const defultimagbage = "https://img.xssdcdn.com/static/mall/idcard/imgbage.jpg";
	const classname = "MallIdcardEditPage";
	// 数据
	let idcard = React.useRef<any>({
		idcardname: "", idcardno: "", sec: "", imgface: "", imgbage: "", showidcardedittip: ""
	});
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	useFocusEffect(
		React.useCallback(() => {
			init();
		}, [])
	);

	const init = () => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App跨境实名认证页" } });
		}
		http.post(ENV.mall + "?uid=" + us.user.uid, { method: "getidcard", token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_EXPIRE" || resp_data.msg == "TOKEN_ERR") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App跨境实名认证页" } });
			}
			if (resp_data.msg != "OK") {
				if (resp_data.showidcardedittip) {
					handleTip(resp_data.showidcardedittip);
					idcard.current.showidcardedittip = resp_data.showidcardedittip;
				}
				return;
			}
			idcard.current = resp_data;
			handleTip(resp_data.showidcardedittip);
			if (resp_data.sec) {
				if (idcard.current.imgface == "1") {
					imgface.current = ENV.api + ENV.mall + "?uid=" + us.user.uid + "&method=getidcardimg&type=face&sec=" + resp_data.sec;
				}
				if (idcard.current.imgbage == "1") {
					imgbage.current = ENV.api + ENV.mall + "?uid=" + us.user.uid + "&method=getidcardimg&type=bage&sec=" + resp_data.sec;
				}
			}
			setIsRender(val => !val);
		});
	}

	// 处理Tip
	const handleTip = (str: string) => {
		let idcardtip: any[] = str.split("<br>");
		for (let i = 0; i < idcardtip.length; i++) {
			let replacedStr = idcardtip[i].split(/<em>(.*?)<\/em>/g).map((item: any, index: number) => {
				return index % 2 === 1 ? (<Text key={index} style={{ color: theme.redchecked, fontSize: 14 }}>{item}</Text>) : item
			});
			idcardtip[i] = (<Text key={i} style={{ color: theme.placeholder, fontSize: 14, lineHeight: 25 }}>{replacedStr}</Text>)
		}
		idcard.current["idcard_tip"] = idcardtip;
	}

	const save = () => {
		if (idcard.current.idcardname == "") {
			AlertCtrl.show({
				header: "付款人身份证姓名为空!",
				key: "empty_uname_alert",
				message: "请输入付款人身份证姓名",
				buttons: [{
					text: "确定",
					handler: () => {
						AlertCtrl.close("empty_uname_alert")
					}
				}]
			});
			return;
		}
		//没有修改的身份证里面有*号，不用提示错误，后台不会保存更新
		if (idcard.current.idcardno && idcard.current.idcardno != "" && idcard.current.idcardno.indexOf("*") < 0) {
			if (idcard.current.idcardno.length != 18) {
				AlertCtrl.show({
					header: "身份证错误",
					key: "sfz_err_alert",
					message: "身份证应为18位",
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close("sfz_err_alert")
						}
					}]
				});
				return;
			}
			var id = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}([0-9]|x|X)$/;
			if (id.test(idcard.current.idcardno) === true) {
				// 验证前面17位数字，首先定义前面17位系数
				let sevenTeenIndex = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
				// 截取参数前17位
				let front_seventeen = idcard.current.idcardno.slice(0, 17);
				// 截取第18位
				let eighteen = idcard.current.idcardno.slice(17, 18).toUpperCase();
				// 这里如果是X要转换成小写，如果是数字在这里是字符串类型,则转换成数字类型，好做判断
				//eighteen = isNaN(parseInt(eighteen)) ? eighteen.toLowerCase() : parseInt(eighteen);
				// 定义一个变量计算系数乘积之和余数
				let remainder = 0;
				//利用循环计算前17位数与系数乘积并添加到一个数组中
				// charAt()类似数组的访问下标一样，访问单个字符串的元素,返回的是一个字符串因此要转换成数字
				for (let i = 0; i < 17; i++) {
					remainder = (remainder += parseInt(front_seventeen.charAt(i)) * sevenTeenIndex[i]) % 11;
				}
				//余数对应数字数组
				let remainderKeyArr = [1, 0, "X", 9, 8, 7, 6, 5, 4, 3, 2];
				// 取得余数对应的值
				//let remainderKey = remainderKeyArr[remainder];// === "X" ? remainderKeyArr[remainder].toLowerCase() : remainderKeyArr[remainder];
				//console.log(remainderKey);
				//console.log(eighteen)
				// 如果最后一位数字对应上了余数所对应的值，则验证合格，否则不合格,
				// 由于不确定最后一个数字是否是大小写的X，所以还是都转换成小写进行判断
				if (eighteen != remainderKeyArr[remainder]) {
					AlertCtrl.show({
						header: "身份证错误",
						key: "sfz_err_alert",
						message: "请仔细检查",
						buttons: [{
							text: "确定",
							handler: () => {
								AlertCtrl.close("sfz_err_alert")
							}
						}]
					});
					return;
				}
			} else {
				AlertCtrl.show({
					header: "身份证错误",
					key: "sfz_err_alert",
					message: "请仔细检查",
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close("sfz_err_alert")
						}
					}]
				});
				return;
			}
		} else {
			//return //身份证号不是必填的，这个地方不能加return
		}

		//20220125:修改身份证信息接口参数修改为传递idcardno和idcardname
		http.post(ENV.mall + "?uid=" + us.user.uid, {
			method: "updateidcard", token: us.user.token, idcardno: idcard.current.idcardno, idcardname: idcard.current.idcardname
		}).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_EXPIRE" || resp_data.msg == "TOKEN_ERR") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App跨境实名认证页" } });
			} else if (resp_data.msg == "OK") {
				navigation.goback();
			} else {
				AlertCtrl.show({
					header: "保存失败!",
					key: "save_err_alert",
					message: resp_data.msg,
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close("save_err_alert")
						}
					}]
				});
			}
		});
	}

	const onChange = (val: string, type: string) => {
		idcard.current[type] = val;
		setIsRender(val => !val);
	}

	React.useEffect(() => {
		events.addListener("photo_upload" + classname + us.user.uid, (dataurl: string) => {
			uploadpic_by_dataurl(dataurl);
		});

		return () => {
			events.removeAllListeners("photo_upload" + classname + us.user.uid);
		}
	}, [])

	const openfiledlg = (type: string) => {
		pictype.current = type;
		ActionSheetCtrl.show({
			key: "filedlg_action_sheet",
			buttons: [{
				text: "拍照",
				style: { color: theme.tit2 },
				handler: () => {
					ActionSheetCtrl.close("filedlg_action_sheet");
					setTimeout(() => { buttonClicked(0) }, 300);
				}
			}, {
				text: "从相册选择",
				style: { color: theme.tit2 },
				handler: () => {
					ActionSheetCtrl.close("filedlg_action_sheet");
					setTimeout(() => { buttonClicked(1) }, 300);
				}
			}, {
				text: "取消",
				style: { color: theme.tit },
				handler: () => {
					ActionSheetCtrl.close("filedlg_action_sheet");
				}
			}],
			onTouchOutside: () => {
				ActionSheetCtrl.close("filedlg_action_sheet");
			},
		})
	}

	const buttonClicked = (index: number) => {
		let params = {
			index: index,
			quality: 0.8,
			isCrop: false,
			includeBase64: true,
			src: "photoupload",
			classname,
			maxWidth: 1024,
			maxHeight: 1024,
		}
		upService.buttonClicked(params);
	}

	const uploadpic_by_dataurl = (dataurl: string) => {
		http.post(ENV.mall + "?uid=" + us.user.uid, {
			method: "updateidcardimg", token: us.user.token, Filedata: dataurl, type: pictype.current
		}).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_EXPIRE" || resp_data.msg == "TOKEN_ERR") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App跨境实名认证页" } });
			} else if (resp_data.msg == "OK") {
				if (resp_data.sec) {
					if (resp_data.type == "face") {
						imgface.current = ENV.api + ENV.mall + "?uid=" + us.user.uid + "&method=getidcardimg&type=face&sec=" + resp_data.sec;
					}
					if (resp_data.type == "bage") {
						imgbage.current = ENV.api + ENV.mall + "?uid=" + us.user.uid + "&method=getidcardimg&type=bage&sec=" + resp_data.sec;
					}
				}
			} else {
				AlertCtrl.show({
					header: "保存失败!",
					key: "save_err_alert",
					message: resp_data.msg,
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close("save_err_alert")
						}
					}]
				});
			}
		});
	}

	return (
		<View style={styles.idcard_container}>
			<HeaderView
				data={{
					title: "跨境购物实名认证",
					isShowSearch: false,
				}}
				method={{
					back: () => { navigation.goBack() },
				}} />
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.idcard_con}>
				<View style={styles.idcard_img_item}>
					<Image style={styles.idcard_img}
						defaultSource={{ uri: defultimagface }}
						source={{ uri: imgface.current }}
					/>
					<Pressable onPress={() => { openfiledlg("face") }} style={styles.idcard_btn}>
						<Icon name="add" size={35} color={theme.placeholder} style={styles.idcard_btn_icon} />
						{imgface.current == defultimagface && <Text>{"上传身份证姓名面照片"}</Text>}
						{imgface.current != defultimagface && <Text>{"重新上传姓名面照片"}</Text>}
					</Pressable>
				</View>
				<View style={styles.idcard_img_item}>
					<Image style={styles.idcard_img}
						defaultSource={{ uri: defultimagbage }}
						source={{ uri: imgbage.current }}
					/>
					<Pressable onPress={() => { openfiledlg("bage") }} style={styles.idcard_btn}>
						<Icon name="add" size={35} color={theme.placeholder} style={styles.idcard_btn_icon} />
						{imgbage.current == defultimagbage && <Text>{"上传身份证国徽面照片"}</Text>}
						{imgbage.current != defultimagbage && <Text>{"重新上传国徽面照片"}</Text>}
					</Pressable>
				</View>
				<View style={styles.idcard_input_con}>
					<View style={styles.idcard_input}>
						<Icon name="ren" size={23} color="#8A8A8A" style={styles.input_icon} />
						<TextInput style={styles.input}
							value={idcard.current.idcardname}
							onChangeText={(name: string) => {
								onChange(name, "idcardname");
							}}
							placeholder="付款人身份证姓名"
							placeholderTextColor={theme.placeholder}
						/>
					</View>
					<View style={styles.idcard_input}>
						<Icon name="shenfenzheng" size={28} color="#8A8A8A" style={styles.input_icon} />
						<TextInput style={styles.input}
							value={idcard.current.idcardno}
							onChangeText={(no: string) => {
								onChange(no, "idcardno");
							}}
							placeholder="付款人身份证号"
							placeholderTextColor={theme.placeholder}
						/>
					</View>
				</View>
				<LinearButton containerStyle={styles.footer_btn} text="保存" onPress={save} />
				{idcard.current.showidcardedittip && <View style={styles.idcard_msg}>
					<View>{idcard.current.idcard_tip}</View>
				</View>}
			</ScrollView>
		</View>
	);
}
const styles = StyleSheet.create({
	idcard_container: {
		flex: 1,
		backgroundColor: theme.toolbarbg
	},
	idcard_con: {
		paddingTop: 15,
		paddingHorizontal: 20,
	},
	idcard_img_item: {
		padding: 15,
		borderWidth: 1,
		borderStyle: "dashed",
		borderColor: theme.placeholder,
		borderRadius: 5,
		marginBottom: 10,
		flexDirection: "row",
		alignItems: "center",
	},
	idcard_img: {
		flex: 1,
		aspectRatio: 149 / 95,
		borderRadius: 2,
		backgroundColor: theme.bg
	},
	idcard_btn: {
		marginLeft: 30,
		alignItems: "center",
	},
	idcard_btn_icon: {
		marginBottom: 10,
	},
	idcard_input_con: {
		marginTop: 28,
	},
	idcard_input: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 35,
	},
	input_icon: {
		width: 30,
		height: 30,
		textAlign: "center",
		lineHeight: 30,
		marginRight: 15,
	},
	input: {
		flex: 1,
		height: 42,
		backgroundColor: theme.bg,
		padding: 0,
		paddingLeft: 21,
		borderRadius: 25,
	},
	footer_btn: {
		marginHorizontal: 20,
	},
	idcard_msg: {
		marginTop: 28,
		marginBottom: 100,
	}
});
export default MallIdcardEdit;