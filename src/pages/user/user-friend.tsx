import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image, FlatList } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderView from "../../components/headerview";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlelevelLeft, handlelevelTop } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";
import LinearGradient from "react-native-linear-gradient";
import CareView from "../../components/careView";

const { width, height } = Dimensions.get("window");

function UserFriend({ navigation, route }: any): React.JSX.Element {

	// 控件
	const classname = "UserFriend";
	const insets = useSafeAreaInsets();
	// 参数
	// 变量
	let name = React.useRef<string>("");
	let uid = React.useRef<number>(0);
	let carecnt = React.useRef<number>(0);
	let fanscnt = React.useRef<number>(0);
	let curpage = React.useRef<number>(1);
	const [curTab, setCurTab] = React.useState<string>("care");
	// 数据
	let carelist = React.useRef<any[]>([]);
	let fanslist = React.useRef<any[]>([]);
	let like_ = React.useRef<any>({});
	// 状态
	let isempty = React.useRef<boolean>(false);
	let isemptyo = React.useRef<boolean>(false);
	let carenoMore = React.useRef<boolean>(false);
	let fansnoMore = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (route.params) {
			name.current = route.params.name ? route.params.name : "";
			uid.current = route.params.uid ? route.params.uid : 0;
			carecnt.current = route.params.carecnt ? route.params.carecnt : 0;
			fanscnt.current = route.params.fanscnt ? route.params.fanscnt : 0;
		}
		init()
	}, []);

	const init = () => {
		if (uid.current == us.user.uid) name.current = "我";
		getdata("care");
	}

	const getdata = (type: string) => {
		http.post(ENV.user, { method: "get" + type, id: uid.current }).then((resp_data: any) => {
			cache.saveItem(classname + type + uid.current, resp_data, 10);
			if (type == "care") {
				carelist.current = resp_data;
			} else {
				fanslist.current = resp_data;
			}
			if (resp_data.length == 0) {
				if (uid.current == us.user.uid) {
					isempty.current = true;
				} else {
					isemptyo.current = true;
				}
			}
			if (resp_data.length < 20) {
				if (type == "care") {
					carenoMore.current = true;
				} else {
					fansnoMore.current = true;
				}
			}
			let ids = [];
			for (let i in resp_data) ids.push(resp_data[i].id);
			islike(ids);
		});
	}

	const islike = (ids: any) => {
		if (curTab == "care") {
			// for (var i in ids) {
			// 	like_.current[ids[i]] = 1;
			// }
			setIsRender(val => !val);
			return;
		}
	};

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: name.current + "的友邻",
				isShowSearch: false,
				style: { zIndex: 0 },
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
				}
			}} method={{
				back: () => { navigation.goBack() },
			}}>
				<View style={[Globalstyles.header_bg, { height: 90 + insets.top }]}>
					<Image style={{ width: "100%", height: "100%" }}
						source={require("../../assets/images/headbgpage/friendbg.jpg")}
					/>
				</View>
			</HeaderView>
			<View style={[Globalstyles.container, Globalstyles.list_content]}>
				<View style={styles.friend_tab}>
					<Pressable style={styles.tabbar} onPress={() => { setCurTab("care") }}>
						<Text style={[styles.tabbar_text, curTab == "care" && styles.activetab]}>{"关注 " + carecnt.current}</Text>
						{curTab == "care" && <Text style={styles.tabline}></Text>}
					</Pressable>
					<Pressable style={styles.tabbar} onPress={() => { setCurTab("fans") }}>
						<Text style={[styles.tabbar_text, curTab == "fans" && styles.activetab]}>{"粉丝 " + fanscnt.current}</Text>
						{curTab == "fans" && <Text style={styles.tabline}></Text>}
					</Pressable>
				</View>
				<CareView data={{
					items: curTab == "care" ? carelist.current : fanslist.current,
					likedata: like_.current,
					type: curTab,
				}} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	friend_tab: {
		flexDirection: "row",
		alignItems: "center",
	},
	tabbar: {
		flexGrow: 1,
		paddingVertical: 16,
		alignItems: "center"
	},
	tabbar_text: {
		fontSize: 15,
		color: theme.placeholder
	},
	activetab: {
		color: theme.text1,
	},
	tabline: {
		position: "absolute",
		bottom: 10,
		width: 20,
		height: 1.5,
		backgroundColor: theme.text1
	},
	item_btn_con: {
		justifyContent: "center",
		marginLeft: 40,
	},
	item_btn: {
		minWidth: 68,
		height: 30,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 20,
		paddingHorizontal: 6,
	},
	btn_text: {
		color: theme.toolbarbg,
		fontWeight: "500",
		fontSize: 14,
		fontFamily: "PingFang SC",
	},
	btn_text2: {
		color: "#808080",
		fontWeight: "500",
		fontSize: 14,
		fontFamily: "PingFang SC",
	}
});

export default UserFriend;