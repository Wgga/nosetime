import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";
import HeaderView from "../../components/headerview";
import wss from "../../services/wss-service/wss-service";

const { width, height } = Dimensions.get("window");

function MallKefu({ navigation, route }: any): React.JSX.Element {

	// 控件
	const classname: string = "MallKefuPage";
	// 参数
	// 变量
	// 数据
	let items = React.useRef<any[]>([]);
	let lastmsg = React.useRef<number>(0); //最近消息时间
	// 状态

	React.useEffect(() => {
		init()
	}, [])

	const init = () => {
		cache.getItem(classname + us.user.uid).then((cacheobj) => {
			if (cacheobj && cacheobj.length > 0) {
				console.log("from cache", cacheobj);
				items.current = cacheobj;
				lastmsg.current = items.current[items.current.length - 1].time;
				calc_sztime();
				// setTimeout(() => { try { this.content.scrollToBottom(0) } catch (e) { } }, 100);
			}
			checkin();
		}).catch(() => {
			// fall here if item is expired or doesn't exist 
			//console.log('this.cache.getItem:NO RESULT',this.classname+'publish',this.id);
			checkin();
			return;
		});
	}

	const calc_sztime = () => {
		lastmsg.current = 0;
		for (let i in items.current) {
			if (items.current[i].time - lastmsg.current > 60) {
				items.current[i].sztime = us.formattime(items.current[i].time);
			} else {
				items.current[i].sztime = "";
			}
			lastmsg.current = items.current[i].time;
		}
	}

	const checkin = () => {
		console.log("send checkin");
		//点开客服界面时，根据 最新获取时间 获取 客服回复，发送活跃消息，状态2活跃
		//从缓存中读取信息，并查看是否有更新
		//20230825 checkin失败后，部分消息可能获取不到
		wss.send({ method: "checkin", lastmsg: lastmsg.current, uid: us.user.uid, token: us.user.token, ver: ENV.AppNVersion }).then((T: any) => {
			console.log("is send1");
			//临时测试代码
			http.post(ENV.kefu + "?uid=" + us.user.uid, { method: "checkinok", token: us.user.token }).then((resp_data: any) => { });
		}, (T: any) => {
			console.log("not send1");
			http.post(ENV.kefu + "?uid=" + us.user.uid, { method: "newmsg", token: us.user.token, fromtm: lastmsg.current }).then((resp_data: any) => {
				if (resp_data.msg == "OK") {
					newmsg(resp_data.items);
				} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {//20240229 shibo:处理token失效
					us.delUser();
					return navigation.navigate("Page", { screen: "Login", params: { src: "App客服页" } });
				}
			});
		});
	}

	const sortByID = (a: any, b: any) => {
		return a.id - b.id;
	}

	//20230825 数据与现有显示数据合并，去除重复，并缓存
	const newmsg = (data: any) => {
		if (data && data.length > 0) {
			data = data.concat(items.current);
			data.sort(sortByID);
			let lastid = 0;
			for (let i = data.length - 1; i >= 0; --i) {
				//20230915 时间，方向，内容完全一样才识别为一样，进行除重
				if (lastid == data[i].id) {
					data.splice(i, 1);
				}
				lastid = data[i].id;
			}
			items.current = data;
			//20230909 新消息不缓存，避免取不到以前的消息
			//cache.saveItem(classname + us.user.uid, items.current, 3600);
			calc_sztime();

			lastmsg.current = items.current[items.current.length - 1].time;
		}
	}

	return (
		<View style={[Globalstyles.container, { backgroundColor: theme.bg }]}>
			<HeaderView data={{
				title: "在线客服",
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}}>
			</HeaderView>
		</View>
	);
}

const styles = StyleSheet.create({
});

export default MallKefu;