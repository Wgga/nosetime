import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, TextInput } from "react-native";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import HeaderView from "../../components/headerview";
import Switch from "../../components/switch";
import LinearButton from "../../components/linearbutton";
import AlertCtrl from "../../components/controller/alertctrl";
import WheelPicker from "../../components/wheelpicker";
import { ModalPortal, SlideAnimation } from "../../components/modals";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";
import { Globalstyles } from "../../utils/globalmethod";

const { width, height } = Dimensions.get("window");

const AddressPicker = ({ params }: any) => {

	const { data, index, key, type, title, SelectedAddress } = params;

	const [selectedIndex, setSelectedIndex] = React.useState(index == -1 ? 0 : index);

	return (
		<View style={styles.picker_content}>
			<View style={styles.picker_header}>
				<Pressable style={{ marginLeft: 10 }} hitSlop={16} onPress={() => {
					ModalPortal.dismiss(key)
				}}><Text style={styles.picker_btn}>{"取消"}</Text></Pressable>
				<Text style={styles.picker_title}>{title}</Text>
				<Pressable style={{ marginRight: 10 }} hitSlop={16} onPress={() => {
					SelectedAddress(type, data[selectedIndex]);
					ModalPortal.dismiss(key);
				}}><Text style={[styles.picker_btn, { fontWeight: "500" }]}>{"确定"}</Text></Pressable>
			</View>
			<WheelPicker options={data}
				selectedIndex={selectedIndex}
				visibleRest={3}
				onChange={(index: number) => setSelectedIndex(index)}
				selectedIndicatorStyle={{ backgroundColor: "#EFEFEF", borderRadius: 10 }}
				itemTextStyle={{ fontSize: 16, color: "#333333" }}
				containerStyle={{ backgroundColor: theme.toolbarbg }}
			/>
		</View>
	)
}

const MallAddressEdit = React.memo(({ navigation, route }: any) => {
	// 控件
	// 参数
	// 变量
	let add = React.useRef<any>({
		maid: 0, maname: "", mamobile: "", maidcard: "", maaddress: "", madefault: 0, maprov: "", macity: "", maregion: "", mastreet: ""
	});
	let id = React.useRef<number>(0);
	let cnt = React.useRef<number>(0);
	let lists = React.useRef<any>({
		provs: { items: [], title: "选择省" },
		citys: { items: [], title: "选择市" },
		regions: { items: [], title: "选择区" },
		streets: { items: [], title: "选择街道" }
	});
	let ipadd = React.useRef<any>({});
	// 数据
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (route.params) {
			id.current = route.params.id ? route.params.id : 0;
			cnt.current = route.params.cnt ? route.params.cnt : 0;
		}
		init()
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
			lists.current.provs.items = resp_data;
			defaultprov();
		});
	}

	const getmindata = (type: string) => {
		let mini = "0";
		let key = type + "s";
		let minc = lists.current[key].items[mini].c;
		let minn = lists.current[key].items[mini].n;
		for (let i in lists.current[key].items) {
			if (lists.current[key].items[i].n == add.current["ma" + type] || lists.current[key].items[i].n == ipadd.current[type]) {
				mini = i;
				minc = lists.current[key].items[mini].c;
				minn = lists.current[key].items[mini].n;
				break;
			}
			if (lists.current[key].items[i].c < minc) {
				mini = i;
				minc = lists.current[key].items[mini].c;
				minn = lists.current[key].items[mini].n;
			}
		}
		if (minn != add.current["ma" + type]) {
			add.current["ma" + type] = minn;
		}
		return { minn, mini, minc };
	}

	const defaultprov = () => {
		if (!lists.current.provs.items) return;
		if (lists.current.provs.items.length == 0) return;
		let mindata = getmindata("prov");
		lists.current.citys.items = lists.current.provs.items[mindata.mini].sub;
		defaultcity();
	}
	const defaultcity = () => {
		if (!lists.current.citys.items) return;
		let mindata = getmindata("city");
		if (lists.current.citys.items[mindata.mini].sub.length) {
			lists.current.regions.items = lists.current.citys.items[mindata.mini].sub;
		} else {
			lists.current.regions.items = null;
			lists.current.streets.items = null;
			add.current.maregion = "";
			add.current.mastreet = "";
		}
		defaultregion();
	}
	const defaultregion = () => {
		if (!lists.current.regions.items) return;
		let mindata = getmindata("region");
		if (mindata.minc > 0) {
			http.get(ENV.mall + "?method=street&id=" + mindata.minc).then((resp_data: any) => {
				if (resp_data.length) {
					lists.current.streets.items = resp_data;
					defaultstreet();
				} else {
					lists.current.streets.items = null;
					add.current.mastreet = "";
				}
			});
		}
	}
	const defaultstreet = () => {
		if (!lists.current.streets.items) return;
		getmindata("street");
		setIsRender(val => !val);
	}

	const SelectedAddress = (type: string, data: any) => {
		add.current["ma" + type] = data.n;
		if (type == "prov") {
			add.current.macity = "";
			add.current.maregion = "";
			add.current.mastreet = "";

			if (data.sub.length) {
				lists.current.citys.items = data.sub;
				defaultcity();
			}
		} else if (type == "city") {
			add.current.maregion = "";
			add.current.mastreet = "";

			if (data.sub.length) {
				lists.current.regions.items = data.sub;
				defaultregion();
			}
		} else if (type == "region") {
			add.current.mastreet = "";

			if (parseInt(data.c) > 0) {
				http.get(ENV.mall + "?method=street&id=" + data.c).then((resp_data: any) => {
					if (resp_data.length) {
						lists.current.streets.items = resp_data;
						defaultstreet();
					}
				});

			}
		} else if (type == "street") {
			add.current.mastreet = data.n;
		}
		setIsRender(val => !val);
	}

	const seladdress = (type: string) => {
		let key = type + "s";
		let data = lists.current[key].items,
			index = lists.current[key].items.findIndex((item: any) => item.n == add.current["ma" + type]),
			title = lists.current[key].title;
		ModalPortal.show((
			<AddressPicker params={{ data, index, type, title, key: "address_picker_popover", SelectedAddress, }} />
		), {
			key: "address_picker_popover",
			width,
			rounded: false,
			useNativeDriver: true,
			onTouchOutside: () => {
				ModalPortal.dismiss("address_picker_popover");
			},
			onHardwareBackPress: () => {
				ModalPortal.dismiss("address_picker_popover");
				return true;
			},
			animationDuration: 300,
			type: "bottomModal",
		})
	};

	const onChange = (type: string, value: string | boolean) => {
		add.current[type] = value;
		setIsRender(val => !val);
	}

	return (
		<View style={Globalstyles.container}>
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
				<Pressable onPress={() => { seladdress("prov") }} style={styles.toggle_con}>
					<Text style={styles.address_label}>{"所在省："}<Text style={styles.address_val}>{add.current.maprov}</Text></Text>
					<Icon name="r-return" size={16} color={theme.text1} />
				</Pressable>
				<Pressable onPress={() => { seladdress("city") }} style={styles.toggle_con}>
					<Text style={styles.address_label}>{"所在市："}<Text style={styles.address_val}>{add.current.macity}</Text></Text>
					<Icon name="r-return" size={16} color={theme.text1} />
				</Pressable>
				<Pressable onPress={() => { seladdress("region") }} style={styles.toggle_con}>
					<Text style={styles.address_label}>{"所在区："}<Text style={styles.address_val}>{add.current.maregion}</Text></Text>
					<Icon name="r-return" size={16} color={theme.text1} />
				</Pressable>
				<Pressable onPress={() => { seladdress("street") }} style={styles.toggle_con}>
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
			<LinearButton containerStyle={styles.footer_con} text="保存" onPress={save} />
		</View>
	);
})
const styles = StyleSheet.create({
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
		padding: 10,
	},
	address_detail_input: {
		padding: 0,
		margin: 0,
		flex: 1,
		textAlignVertical: "top",
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
	picker_content: {
		backgroundColor: "#F7F7F7",
		paddingHorizontal: 10,
	},
	picker_header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 16
	},
	picker_btn: {
		fontSize: 16,
		color: theme.tit,
		fontFamily: "PingFang SC"
	},
	picker_title: {
		fontSize: 16,
		color: theme.color,
	}
});
export default MallAddressEdit;