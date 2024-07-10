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
	let curpage = React.useRef<any>({
		care: 1,
		fans: 1
	});
	let noMore = React.useRef<any>({
		care: false,
		fans: false
	})
	let curtab = React.useRef<string>("care");
	// 数据
	let list = React.useRef<any>({
		care: [],
		fans: []
	});
	let like_ = React.useRef<any>({});
	// 状态
	let isempty = React.useRef<boolean>(false);
	let isemptyo = React.useRef<boolean>(false);
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
		getdata("init");
	}

	const getdata = (type: string) => {
		if (type == "loadMore") {
			if (noMore.current[curtab.current]) return;
			curpage.current[curtab.current]++;
		}
		http.post(ENV.user, { method: "get" + curtab.current, id: uid.current, page: curpage.current[curtab.current] }).then((resp_data: any) => {
			if (type == "init") {
				list.current[curtab.current] = resp_data;
			} else {
				list.current[curtab.current] = list.current[curtab.current].concat(resp_data);
			}

			if (type == "init" && resp_data.length == 0) {
				if (uid.current == us.user.uid) isempty.current = true;
				else isemptyo.current = true;
			}

			if (resp_data.length < 20) {
				noMore.current[curtab.current] = true;
			}

			let ids = [];
			for (let i in resp_data) ids.push(resp_data[i].id);
			islike(ids);
		});
	}

	const islike = (ids: any) => {
		if (curtab.current == "care") {
			for (var i in ids) {
				like_.current[ids[i]] = 1;
			}
			setIsRender(val => !val);
			return;
		}
		if (!us.user.uid) {
			setIsRender(val => !val);
			return;
		}
		http.post(ENV.user, { method: "islike", uid: us.user.uid, ids: ids }).then((resp_data: any) => {
			for (var i in resp_data) {
				like_.current[resp_data[i]] = 1;
			}
			setIsRender(val => !val);
		});
	};

	const toogle = (type: string) => {
		if (curtab.current == type) return;
		curtab.current = type;
		setIsRender(val => !val);
		if (type != "fans") return;
		getdata("init");
	}

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
					<Pressable style={styles.tabbar} onPress={() => { toogle("care") }}>
						<Text style={[styles.tabbar_text, curtab.current == "care" && styles.activetab]}>{"关注 " + carecnt.current}</Text>
						{curtab.current == "care" && <Text style={styles.tabline}></Text>}
					</Pressable>
					<Pressable style={styles.tabbar} onPress={() => { toogle("fans"); }}>
						<Text style={[styles.tabbar_text, curtab.current == "fans" && styles.activetab]}>{"粉丝 " + fanscnt.current}</Text>
						{curtab.current == "fans" && <Text style={styles.tabline}></Text>}
					</Pressable>
				</View>
				<CareView data={{
					items: list.current[curtab.current],
					likedata: like_.current,
					type: curtab.current,
					isShowCS: false,
					noMore: noMore.current[curtab.current],
					isempty: isempty.current,
					isemptyo: isemptyo.current,
					navigation,
				}} method={{ loadMore: getdata }} />
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