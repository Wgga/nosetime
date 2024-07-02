import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";

import { FlashList } from "@shopify/flash-list";

import HeaderView from "../../components/headerview";
import ListBottomTip from "../../components/listbottomtip";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";
import VideoPlayer from "../../components/videoplayer";

const { width, height } = Dimensions.get("window");

function MediaListDetail({ navigation, route }: any): React.JSX.Element {

	// 控件
	const classname = "MediaListDetailPage";
	// 参数
	// 变量
	let id = React.useRef<number>(0);
	let mid = React.useRef<number>(0);
	let itemdata = React.useRef<any>({});
	let mediadata = React.useRef<any>({});
	let statdata = React.useRef<any>({});
	let like_ = React.useRef<any>({});
	let curpage = React.useRef<number>(1);
	let replydata = React.useRef<any[]>([]);
	// 数据
	// 状态
	let noMore = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		if (route.params) {
			id.current = route.params.id ? route.params.id : 0;
			mid.current = route.params.mid ? route.params.mid : 0;
		}
		init();
	}, []);

	// 获取单品页数据
	const getItemData = () => {
		return new Promise((resolve, reject) => {
			http.get(ENV.item + "?id=" + id.current).then((resp_data: any) => {
				itemdata.current = resp_data;
				resolve(1);
			})
		})
	}

	// 获取视频详情数据
	const getMediaDetail = () => {
		return new Promise((resolve, reject) => {
			cache.getItem(classname + mid.current + "medialist").then((cacheobj: any) => {
				if (cacheobj) {
					setmediadata(cacheobj);
					resolve(1);
				}
			}).catch(() => {
				http.get(ENV.item + "?method=mediadetail&id=" + id.current + "&mid=" + mid.current).then((resp_data: any) => {
					cache.saveItem(classname + mid.current + "piclist", resp_data, 600);
					setmediadata(resp_data);
					resolve(1);
				})
			})
		})
	}
	// 设置视频数据
	const setmediadata = (data: any) => {
		mediadata.current = data;
		if (mediadata.current.mtype == 10) {
			//20220516 shibo:去除视频名称的多ID
			mediadata.current.newvname = mediadata.current.vname.replace(/\d{6}|.mp4/g, '').trim();
			mediadata.current.mainvname = mediadata.current.newvname.split(/:|：/)[0];
			mediadata.current.subvname = mediadata.current.newvname.split(/:|：/)[1];
			mediadata.current.time = mediadata.current.tm.slice(0, 10);
		} else {
			mediadata.current.time = mediadata.current.mtime.slice(0, 10);
		}
	}

	const getStatData = () => {
		return new Promise((resolve, reject) => {
			http.get(ENV.pic + "?method=getstat&mid=" + mid.current + "&t=" + (new Date).getTime()).then((resp_data: any) => {
				statdata.current = resp_data;
				resolve(1);
			});
		})
	}
	// 是否喜好
	const islike = () => {
		if (!us.user.uid) {
			return;
		}
		http.post(ENV.pic, { method: "islike", uid: us.user.uid, mid: mid.current }).then((resp_data: any) => {
			if (resp_data == "1") {
				like_.current[mid.current] = 1;
			} else {
				like_.current[mid.current] = 0;
			}
		});
	}
	// 获取评论数据
	const getReplyData = (page: number) => {
		http.get(ENV.pic + "?method=getreply&mid=" + mid.current + "&page=" + curpage.current + "&t=" + (new Date).getTime()).then((resp_data: any) => {
			replydata.current = resp_data.items
			curpage.current = page;
			favs(resp_data)
		})
	}

	//获取用户曾点过的赞
	const favs = (resp: any) => {
		if (!us.user.uid) {
			setIsRender(val => !val);
			return;
		}
		let favsid = []
		for (let i in resp.items) {
			favsid.push(resp.items[i].id)
			if (resp.items[i].sub) {
				for (let j in resp.items[i].sub) {
					favsid.push(resp.items[i].sub[j].id)
				}
			}
		}
		http.post(ENV.pic, { method: "islikecomment", uid: us.user.uid, ids: favsid }).then((resp_data: any) => {
			for (var i in resp_data) {
				like_.current[resp_data[i]] = 1;
			}
			setIsRender(val => !val);
		});
	}

	const init = () => {
		Promise.all([getItemData(), getMediaDetail(), getStatData()]).then((data: any) => {
			islike();
			getReplyData(1);
		})
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: itemdata.current.title,
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg },
				childrenstyle: {
					headercolor: { color: theme.text2 },
					headertitle: { opacity: 1 },
				}
			}} method={{
				back: () => { navigation.goBack(); },
			}} />
			<FlashList data={replydata.current}
				keyExtractor={(item: any, index: number) => item.id}
				extraData={isrender}
				estimatedItemSize={100}
				onEndReachedThreshold={0.1}
				onEndReached={() => {
					if (replydata.current && replydata.current.length > 0) {

					}
				}}
				ListHeaderComponent={<>
					{mediadata.current.mp4URL && <VideoPlayer
						source={mediadata.current.mp4URL}
						poster={mediadata.current.vpicurl}
						classname={classname + mid.current}
					></VideoPlayer>}
					<View style={styles.media_info}>
						{mediadata.current.mainvname && <Text style={styles.main_name}>{mediadata.current.mainvname}</Text>}
						{mediadata.current.subvname && <Text style={styles.sub_name}>{mediadata.current.subvname}</Text>}
						{itemdata.current.fragrance && <View style={styles.fragrance_con}>
							<Text style={styles.fragrance_title}>{"香调："}</Text>
							<Text style={styles.fragrance_text} onPress={() => { }}>{itemdata.current.fragrance}</Text>
						</View>}
						<View style={styles.fragrance_list}>
							{(itemdata.current.top && itemdata.current.top.length > 0) && <View style={[styles.fragrance_con, styles.list_con]}>
								<Text style={styles.fragrance_title}>{"前调："}</Text>
								{itemdata.current.top.map((item: any) =>
									<Text key={item} style={[styles.fragrance_text, { marginRight: 8 }]}>{item}</Text>
								)}
							</View>}
							{(itemdata.current.middle && itemdata.current.middle.length > 0) && <View style={[styles.fragrance_con, styles.list_con]}>
								<Text style={styles.fragrance_title}>{"中调："}</Text>
								{itemdata.current.middle.map((item: any) =>
									<Text key={item} style={[styles.fragrance_text, { marginRight: 8 }]}>{item}</Text>
								)}
							</View>}
							{(itemdata.current.base && itemdata.current.base.length > 0) && <View style={[styles.fragrance_con, styles.list_con]}>
								<Text style={styles.fragrance_title}>{"后调："}</Text>
								{itemdata.current.base.map((item: any) =>
									<Text key={item} style={[styles.fragrance_text, { marginRight: 8 }]}>{item}</Text>
								)}
							</View>}
						</View>
						<View style={styles.media_btn}>
							<View style={styles.btn_con}>
								{mediadata.current.time && <>
									<Icon name="time1" size={16} color={"#808080"} />
									<Text style={styles.btn_text}>{mediadata.current.time}</Text>
								</>}
								{statdata.current.click && <>
									<Icon name="play" size={16} color={"#808080"} />
									<Text style={styles.btn_text}>{statdata.current.click}</Text>
								</>}
							</View>
							<View style={styles.btn_con}>
								<>
									<Icon name={like_.current[mid.current] ? "heart-checked" : "heart"} size={16} color={like_.current[mid.current] ? theme.redchecked : "#808080"} />
									{statdata.current.fav && <Text style={styles.btn_text}>{statdata.current.fav}</Text>}
								</>
								<>
									<Icon name="message" size={16} color={"#808080"} />
									{replydata.current.length > 0 && <Text style={[styles.btn_text, { marginRight: 0 }]}>{replydata.current.length}</Text>}
								</>
								{/* <Icon name="share2" size={16} color={"#808080"} /> */}
							</View>
						</View>
					</View>
				</>}
				contentContainerStyle={{}}
				renderItem={({ item, index }: any) => {
					return (
						<></>
					)
				}}
				ListFooterComponent={< ListBottomTip noMore={noMore.current} isShowTip={replydata.current && replydata.current.length > 0} />}
			/>
		</View >
	);
}

const styles = StyleSheet.create({
	media_info: {
		paddingVertical: 24,
		paddingHorizontal: 19,
		backgroundColor: theme.toolbarbg,
	},
	main_name: {
		fontSize: 20,
		color: theme.tit2,
		fontWeight: "500",
		fontFamily: "PingFang SC",
	},
	sub_name: {
		fontSize: 14,
		color: theme.text2,
		marginTop: 5
	},
	fragrance_con: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 11
	},
	fragrance_title: {
		fontSize: 14,
		color: theme.text2,
	},
	fragrance_text: {
		fontSize: 14,
		color: "#808080"
	},
	list_con: {
		marginTop: 5,
		marginRight: 10,
	},
	fragrance_list: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	media_btn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: 14,
	},
	btn_con: {
		flexDirection: "row",
		alignItems: "center",
	},
	btn_text: {
		fontSize: 13,
		color: "#808080",
		marginLeft: 5,
		marginRight: 15,
	}
});

export default MediaListDetail;