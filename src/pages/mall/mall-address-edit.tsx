import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, TextInput } from "react-native";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import HeaderView from "../../components/headerview";
import Switch from "../../components/switch";
import LinearButton from "../../components/linearbutton";
import AlertCtrl from "../../components/alertctrl";
import WheelPicker from "../../components/wheelpicker";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function MallAddressEdit({ navigation, route }: any): React.JSX.Element {
	// 控件
	// 参数
	// 变量
	let add = React.useRef<any>({});
	let id = React.useRef<number>(0);
	let cnt = React.useRef<number>(0);
	let provs = React.useRef<any>([]);
	let citys = React.useRef<any>([]);
	let regions = React.useRef<any>([]);
	let streets = React.useRef<any>([]);
	let ipadd = React.useRef<any>({});
	// 数据
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false);

	React.useEffect(() => {
		init()
		if (route.params) {
			id.current = route.params.id ? route.params.id : 0;
			cnt.current = route.params.cnt ? route.params.cnt : 0;
		}
	}, [])

	const init = () => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App编辑地址页" } });
		}
		if (id.current > 0) {
			http.post(ENV.mall + "?uid=" + us.user.uid, { method: "getaddress", token: us.user.token, id: id.current }).then((resp_data: any) => {
				if (resp_data.msg == "TOKEN_EXPIRE" || resp_data.msg == "TOKEN_ERR") {
					us.delUser();
					return navigation.navigate("Page", { screen: "Login", params: { src: "App编辑地址页" } });
				}
				//20220812 shibo:若当前不存在地址或当前地址不为默认地址，则编辑地址里默认按钮不开启
				if (cnt.current == 0 || resp_data.madefault == 1) {
					resp_data.madefault = 1;
				} else {
					resp_data.madefault = 0;
				}
				add.current = resp_data;
				getbasearea()
			});

		} else {
			http.get(ENV.mall + "?method=ipaddress").then((resp_data: any) => {
				ipadd.current = resp_data;
				getbasearea()
			});
		}
	}

	const open_alert = (params: any) => {
		AlertCtrl.show({
			header: params.header,
			message: params.message,
			key: params.key + "_empty_alert",
			buttons: [{
				text: "确定",
				handler: () => {
					AlertCtrl.close(params.key + "_empty_alert");
				}
			}]
		})
	}

	const save = () => {
		if (add.current.maname == "") {
			open_alert({ header: "收货人姓名为空!", message: "请输入收货人姓名", key: "name" });
			return;
		}
		if (!us.ismobile(add.current.mamobile)) {
			open_alert({ header: "手机号格式不正确!", message: "请输入正确的手机号", key: "mobile" });
			return;
		}
		if (add.current.maprov == "") {
			open_alert({ header: "省为空!", message: "请输入省", key: "prov" });
			return;
		}
		if (add.current.macity == "") {
			open_alert({ header: "市为空!", message: "请输入市", key: "city" });
			return;
		}
		if (add.current.maregion == "") {
			open_alert({ header: "区为空!", message: "请输入区", key: "region" });
			return;
		}
		if (add.current.maaddress == "") {
			open_alert({ header: "地址为空!", message: "请输入收货地址", key: "address" });
			return;
		}
		//20220123 新版不保存maidcard删除
		if (add.current.maidcard) {
			delete add.current.maidcard;
		}
		http.post(ENV.mall + "?uid=" + us.user.uid, { method: "addaddress", token: us.user.token, data: add.current }).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_EXPIRE" || resp_data.msg == "TOKEN_ERR") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App编辑地址页" } });
			} else if (resp_data.msg == "OK") {
				events.publish("nosetime_reload_orderconfirmpage", resp_data.add);
				navigation.goBack();
			} else {
				open_alert({ header: "请注意", message: resp_data.msg, key: "adderr" });
			}
		});
	}

	const getbasearea = () => {
		http.get(ENV.mall + "?method=basearea").then((resp_data: any) => {
			provs.current = resp_data;
			defaultprov();
		});
	}

	const defaultprov = () => {
		if (!provs.current) return;
		if (provs.current.length == 0) return;
		let mini = "0";
		let minc = provs.current[mini].c;
		let minn = provs.current[mini].n;
		for (let i in provs.current) {
			if (provs.current[i].n == add.current.maprov || provs.current[i].n == ipadd.current.prov) {
				mini = i;
				minc = provs.current[mini].c;
				minn = provs.current[mini].n;
				break;
			}
			if (provs.current[i].c < minc) {
				mini = i;
				minc = provs.current[mini].c;
				minn = provs.current[mini].n;
			}
		}
		if (minn != add.current.maprov) {
			add.current.maprov = minn;
		}
		citys.current = provs.current[mini].sub;
		defaultcity();
	}

	const defaultcity = () => {
		if (!citys.current) return;
		let mini = "0";
		let minc = citys.current[mini].c;
		let minn = citys.current[mini].n;
		for (let i in citys.current) {
			if (citys.current[i].n == add.current.macity || citys.current[i].n == ipadd.current.city) {
				mini = i;
				minc = citys.current[mini].c;
				minn = citys.current[mini].n;
				break;
			}
			if (citys.current[i].c < minc) {
				mini = i;
				minc = citys.current[mini].c;
				minn = citys.current[mini].n;
			}
		}
		if (minn != add.current.macity)
			add.current.macity = minn;
		if (citys.current[mini].sub.length) {
			regions.current = citys.current[mini].sub;
		} else {
			regions.current = null;
			streets.current = null;
			add.current.maregion = "";
			add.current.mastreet = "";
		}
		defaultregion();
	}

	const defaultregion = () => {
		if (!regions.current) return;
		let mini = "0";
		let minc = regions.current[mini].c;
		let minn = regions.current[mini].n;
		for (let i in regions.current) {
			if (regions.current[i].n == add.current.maregion) {
				mini = i;
				minc = regions.current[mini].c;
				minn = regions.current[mini].n;
				break;
			}
			if (regions.current[i].c < minc) {
				mini = i;
				minc = regions.current[mini].c;
				minn = regions.current[mini].n;
			}
		}
		if (minn != add.current.maregion)
			add.current.maregion = minn;
		if (minc > 0) {
			http.get(ENV.mall + "?method=street&id=" + minc).then((resp_data: any) => {
				if (resp_data.length) {
					streets.current = resp_data;
					defaultstreet();
				} else {
					streets.current = null;
					add.current.mastreet = "";
				}
			});
		}
	}
	const defaultstreet = () => {
		if (!streets.current) return;
		let mini = "0";
		let minc = streets.current[mini].c;
		let minn = streets.current[mini].n;
		for (let i in streets.current) {
			if (streets.current[i].n == add.current.mastreet) {
				mini = i;
				minc = streets.current[mini].c;
				minn = streets.current[mini].n;
				break;
			}
			if (streets.current[i].c < minc) {
				mini = i;
				minc = streets.current[mini].c;
				minn = streets.current[mini].n;
			}
		}
		if (minn != add.current.mastreet) {
			add.current.mastreet = minn;
		}
		setIsRender(val => !val);
	}

	const seladdress = () => {
	};

	const onChange = (type: string, value: string | boolean) => {
		add.current[type] = value;
		setIsRender(val => !val);
	}

	return (
		<View style={styles.address_edit_con}>
			<HeaderView data={{
				title: id.current > 0 ? "编辑地址" : "添加新地址",
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}} />
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.address_list_con}>
				<View style={styles.goods_item_con}>
					<Text style={styles.goods_item_label}>{"收货人："}</Text>
					<TextInput style={styles.goods_item_input}
						value={add.current.maname}
						onChangeText={(val: string) => {
							onChange("maname", val);
						}}
						placeholder="收货人姓名"
						placeholderTextColor={theme.placeholder}
					/>
				</View>
				<View style={styles.goods_item_con}>
					<Text style={styles.goods_item_label}>{"手机号："}</Text>
					<TextInput style={styles.goods_item_input}
						value={add.current.mamobile}
						onChangeText={(val: string) => {
							onChange("mamobile", val);
						}}
						placeholder="收货人手机号"
						placeholderTextColor={theme.placeholder}
					/>
				</View>
				<Pressable onPress={seladdress} style={styles.toggle_con}>
					<Text style={styles.address_label}>{"所在省："}<Text style={styles.address_val}>{add.current.maprov}</Text></Text>
					<Icon name="r-return" size={16} color={theme.text1} />
				</Pressable>
				<Pressable onPress={seladdress} style={styles.toggle_con}>
					<Text style={styles.address_label}>{"所在市："}<Text style={styles.address_val}>{add.current.macity}</Text></Text>
					<Icon name="r-return" size={16} color={theme.text1} />
				</Pressable>
				<Pressable onPress={seladdress} style={styles.toggle_con}>
					<Text style={styles.address_label}>{"所在区："}<Text style={styles.address_val}>{add.current.maregion}</Text></Text>
					<Icon name="r-return" size={16} color={theme.text1} />
				</Pressable>
				<Pressable onPress={seladdress} style={styles.toggle_con}>
					<Text style={styles.address_label}>{"所在街道："}<Text style={styles.address_val}>{add.current.mastreet}</Text></Text>
					<Icon name="r-return" size={16} color={theme.text1} />
				</Pressable>
				<View style={styles.address_detail}>
					<TextInput style={styles.address_detail_input}
						value={add.current.maaddress}
						onChangeText={(val: string) => {
							onChange("maaddress", val);
						}}
						placeholder="道路名、小区机构、楼栋单元、门牌号"
						placeholderTextColor={theme.placeholder}
					/>
				</View>
				<View style={styles.toggle_con}>
					<Text style={styles.toggle_text}>{"设为默认地址"}</Text>
					<GestureHandlerRootView style={{ alignItems: "flex-end" }}>
						<Switch value={add.current.madefault}
							onValueChange={(val: boolean) => {
								onChange("madefault", val);
							}}
							activeColor={theme.primary}
							inactiveColor={theme.bg}
							circleStyle={{ backgroundColor: theme.toolbarbg }}
						/>
					</GestureHandlerRootView>
				</View>
			</ScrollView>
			<LinearButton containerStyle={styles.footer_con} text="保存" onPress={() => { }} />
		</View>
	);
}
const styles = StyleSheet.create({
	address_edit_con: {
		height: "100%",
		backgroundColor: theme.toolbarbg
	},
	address_list_con: {
		paddingTop: 8,
		paddingBottom: 50,
	},
	goods_item_con: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 17,
		paddingHorizontal: 13,
		borderBottomWidth: 1,
		borderBottomColor: theme.border,
	},
	goods_item_label: {
		fontSize: 14,
		color: theme.color
	},
	goods_item_input: {
		flex: 1,
		padding: 0,
		margin: 0,
		fontSize: 14,
	},
	address_label: {
		fontSize: 14,
		color: theme.text1
	},
	address_val: {
		color: theme.placeholder
	},
	address_detail: {
		height: 110,
		borderBottomWidth: 1,
		borderBottomColor: theme.border,
		paddingTop: 10,
		paddingLeft: 10
	},
	address_detail_input: {
		padding: 0,
		margin: 0,
	},
	toggle_con: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 17,
		paddingHorizontal: 13,
		borderBottomWidth: 1,
		borderBottomColor: theme.border,
	},
	toggle_text: {
		fontSize: 14,
		color: theme.text2
	},
	footer_con: {
		paddingHorizontal: 40,
		paddingVertical: 21,
		backgroundColor: theme.toolbarbg,
	},
});
export default MallAddressEdit;