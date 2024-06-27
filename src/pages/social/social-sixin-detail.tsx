import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";

import { Messy } from "@vokhuyet/react-native-messy";

import HeaderView from "../../components/headerview";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function SocialSixinDetail({ navigation, route }: any): React.JSX.Element {

	// 控件
	const classname = "SocialSixinDetailPage";
	// 参数
	// 变量
	let fromuser = React.useRef<any>({ uid: 0, uface: 0, uname: "" })
	// 数据
	let items = React.useRef<any[]>([]);
	let firstmsg = React.useRef<number>(0); // 最早消息时间
	let lastmsg = React.useRef<number>(0); // 最近消息时间
	let lasttime = React.useRef<number>(0); // 计算显示时间时用的变量
	// 状态
	const [isblist, setIsBlList] = React.useState<boolean>(false); // 是否在黑名单中
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据

	React.useEffect(() => {
		init()

		if (route.params && route.params.fromuser) {
			fromuser.current = route.params.fromuser;
		}
		if (us.user && us.user.ublock && us.user.ublock.indexOf(fromuser.current.uid) >= 0) {
			setIsBlList(true);
		} else {
			setIsBlList(false);
		}

		if (fromuser.current.uface == 0 && fromuser.current.uname == "") {
			http.post(ENV.user, { method: "getuname", uid: fromuser.current.uid }).then((resp_data: any) => {
				fromuser.current.uface = resp_data.uface;
				fromuser.current.uname = resp_data.uname;
				setIsRender(val => !val)
			});
		}
	}, []);

	const init = () => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App私信详情页" } });
		}

		cache.getItem(classname + us.user.uid + '-' + fromuser.current.uid).then((cacheobj) => {
			if (cacheobj && cacheobj.length > 0) {
				items.current = cacheobj;
				lastmsg.current = items.current[items.current.length - 1].time;
				calc_sztime();
			}
			checkin();
		}).catch(() => {
			// fall here if item is expired or doesn't exist 
			//console.log('this.cache.getItem:NO RESULT',this.classname+'publish',this.id);
			checkin();
			return;
		});
	}

	const checkin = () => {
		http.post(ENV.sixin + "?uid=" + us.user.uid, { method: 'checkin', token: us.user.token, fromid: fromuser.current.uid }).then((resp_data: any) => {
			if (resp_data.firstmsg == undefined || resp_data.items == undefined) return;
			firstmsg.current = resp_data.firstmsg;
			if (!resp_data.items || resp_data.items.length == 0) {
				return;
			}

			items.current = resp_data.items;
			lastmsg.current = items.current[items.current.length - 1].time;
			cache.saveItem(classname + us.user.uid + "-" + fromuser.current.uid, items.current, 24 * 3600);
			calc_sztime();
		});
	}

	const calc_sztime = () => {
		lasttime.current = 0;
		us.calc_sztime(items.current, lasttime.current);
		scrollend();
		setIsRender(val => !val);
	}

	const scrollend = () => {
		// setTimeout(() => { try { listref.current?.scrollToEnd({ animated: false }) } catch (e) { } }, 100);
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: fromuser.current.uname,
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}}></HeaderView>
			<Messy />
		</View>
	);
}

const styles = StyleSheet.create({
});

export default SocialSixinDetail;