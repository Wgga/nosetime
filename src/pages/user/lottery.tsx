import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, Image, ScrollView } from "react-native";

import { GifPlayerView } from "react-native-gif-player";
import { ShadowedView } from "react-native-fast-shadow";

import HeaderView from "../../components/view/headerview";
import LotteryPopover from "../../components/popover/lottery-popover";
import { ModalPortal } from "../../components/modals";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import events from "../../hooks/events";

import theme from "../../configs/theme";

import { ENV } from "../../configs/ENV";

const { width, height } = Dimensions.get("window");

function Lottery({ navigation, route }: any): React.JSX.Element {
	// 控件
	// 参数
	const lottery_motion = require("../../assets/images/lottery/lottery_motion.gif");
	const lottery_start = require("../../assets/images/lottery/lottery.gif");
	const nolist = [
		require("../../assets/images/lottery/no1.png"),
		require("../../assets/images/lottery/no2.png"),
		require("../../assets/images/lottery/no3.png"),
		require("../../assets/images/lottery/no4.png"),
		require("../../assets/images/lottery/no5.png"),
		require("../../assets/images/lottery/no6.png"),
		require("../../assets/images/lottery/no7.png"),
		require("../../assets/images/lottery/no8.png"),
		require("../../assets/images/lottery/no9.png"),
		require("../../assets/images/lottery/no10.png"),
	];
	const yeslist = [
		require("../../assets/images/lottery/yes1.png"),
		require("../../assets/images/lottery/yes2.png"),
		require("../../assets/images/lottery/yes3.png"),
		require("../../assets/images/lottery/yes4.png"),
		require("../../assets/images/lottery/yes5.png"),
	];
	// 变量
	let state = React.useRef<string>("init");
	let lottery_end = React.useRef<any>(null);
	let result_img = React.useRef<any>(null);
	let point = React.useRef<number>(40);
	let points = React.useRef<number>(1000);
	let timer = React.useRef<any>(null);
	let start_time = React.useRef<number>(0);
	// 数据
	let lottery = React.useRef<any>(null);
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据

	React.useEffect(() => {
		point.current = route.params.point;
		points.current = route.params.points;
		setIsRender(val => !val);

		return () => {
			ModalPortal.dismissAll();
		}
	}, [])

	const setEndImage = (type: string) => {
		const list = type === "no" ? nolist : yeslist;
		const max = type === "no" ? 10 : 5;
		lottery_end.current = list[Math.floor(Math.random() * max)];
		while (!lottery_end.current) {
			lottery_end.current = list[Math.floor(Math.random() * max)];
		}
		setIsRender(val => !val);
	}

	const lottery_popover = (data: any) => {
		ModalPortal.show((
			<LotteryPopover data={data} />
		), {
			key: "lottery_popover",
			width: width,
			height: height,
			rounded: false,
			useNativeDriver: true,
			onTouchOutside: () => {
				ModalPortal.dismiss("lottery_popover");
			},
			onHardwareBackPress: () => {
				ModalPortal.dismiss("lottery_popover");
				return true;
			},
			animationDuration: 300,
			modalStyle: { backgroundColor: "transparent", justifyContent: "center" },
		})
	}

	const start_lottery = () => {
		clearInterval(timer.current);
		start_time.current = new Date().getTime();
		state.current = "in0.5s";
		setIsRender(val => !val);

		lottery.current = null;
		http.post(ENV.points + "?uid=" + us.user.uid, { method: "lotv2", point: point.current, token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App积分抽奖页" } });
			}
			lottery.current = resp_data;
			//20200215直接通过事件传递点数，避免刷新延迟，减少请求
			if (lottery.current.val >= 0) {
				events.publish("jifen_newpoint", lottery.current.val);
				points.current = lottery.current.val;
			}
			setIsRender(val => !val);
		});
		timer.current = setInterval(() => {
			let t = new Date().getTime() - start_time.current;
			//超时很久了，退出
			if (t > 20000) {
				clearInterval(timer.current);
				lottery_popover({
					image: Math.floor(Math.random() * 20 + 1),
					desc: "抽奖失败,请检查网络后重试",
					sure: "接受指引",
					type: 1,
					showbg: false
				});
				state.current = "init";
				setEndImage("no");
			} else if (t > 2000) {
				if (lottery.current) {//2s后获取到数据后处理
					clearInterval(timer.current);
					if (lottery.current.msg == "OK") {
						if (lottery.current.lose) {
							state.current = "result";
							lottery_popover({
								image: Math.floor(Math.random() * 20 + 1),
								desc: lottery.current.note,
								cnname: lottery.current.cnmsg,
								enname: lottery.current.enmsg,
								type: 1,
								sure: "我知道了",
								showbg: false
							});
							setEndImage("no");
						} else {
							let image = "";
							if (lottery.current.img) {
								image = ENV.image + lottery.current.img;
							} else if (lottery.current.iid) {
								image = ENV.image + "/perfume/" + lottery.current.iid + ".jpg!m";
							}
							state.current = "result";
							lottery_popover({
								image,
								desc: "你抽到了奖品！",
								cnname: lottery.current.name.replace(/\（.*\）/, "").replace(/\(.*\)/, ""),
								enname: lottery.current.enname,
								ml: lottery.current.ml,
								type: 2,
								sure: "收下奖品",
								showbg: true
							});
							setEndImage("yes");
						}
					} else {
						lottery_popover({
							image: Math.floor(Math.random() * 20 + 1),
							desc: lottery.current.msg,
							sure: "接受指引",
							type: 1,
							showbg: false
						});
						state.current = "init";
						setEndImage("no");
					}
				}
			} else if (t > 500) {
				if (state.current != "motion") {
					state.current = "motion";
					setIsRender(val => !val);
				}
			}
		}, 100);
	}

	return (
		<View style={styles.lottery_container}>
			<Image style={styles.lottery_bg}
				source={require("../../assets/images/lottery/lottery_bg.jpg")}
			/>
			<HeaderView data={{
				title: "命运女神的指引和馈赠",
				style: { backgroundColor: "transparent" },
				isShowSearch: false,
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
				}
			}} method={{
				back: () => { navigation.goBack() },
			}} />
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.lottery_con}>
				<View style={styles.lottery_machine}>
					<Image style={[
						styles.machine_img,
						{ opacity: state.current == "init" ? 1 : 0 }
					]} source={require("../../assets/images/lottery/no4.png")} />

					<GifPlayerView source={lottery_start}
						style={[
							styles.machine_img,
							{ opacity: state.current == "in0.5s" ? 1 : 0 }
						]}
						loopCount={1}
						paused={state.current != "in0.5s"}
					/>

					<GifPlayerView source={lottery_motion}
						style={[
							styles.machine_img,
							{ opacity: state.current == "motion" ? 1 : 0 }
						]}
						loopCount={0}
						paused={state.current != "motion"}
					/>

					{lottery_end.current && <Image style={[
						styles.machine_img,
						{ opacity: (state.current == "result" && lottery_end.current) ? 1 : 0 }
					]} source={lottery_end.current} />}
				</View>
				<ShadowedView style={styles.lottery_btn}>
					{(points.current < point.current) && <Text style={styles.lottery_btn_text}>{"积分不足"}</Text>}
					{(points.current >= point.current) && <>
						{(state.current == "init" || state.current == "result") && <Pressable onPress={start_lottery}>
							<Text style={styles.lottery_btn_text}>{"拉下摇杆"}</Text>
						</Pressable>}
						{(state.current == "in0.5s" || state.current == "motion") && <Text style={styles.lottery_btn_text}>{"······"}</Text>}
					</>}
				</ShadowedView>
				<View style={styles.instruction}>
					<View style={styles.item_top_border}></View>
					<View style={styles.instruction_item}>
						<Text style={styles.item_title}>{"抽奖说明"}</Text>
						<Text style={[styles.item_margin, styles.item_text]}>{"1.单次消耗" + point.current + "积分，有概率抽到：实物奖品（香水小样、非香水类奖品），或字条（空奖）"}</Text>
						<Text style={[styles.item_margin, styles.item_text]}>{"2.抽到的实物奖品，将直接加入购物车"}</Text>
						<Text style={[styles.item_margin, styles.item_text]}>{"3.奖品有效期为90天，过期失效"}</Text>
						<Text style={[styles.item_margin, styles.item_text]}>{"4.奖品仅支持随国内仓订单一同发货领取"}</Text>
						<View style={[styles.item_margin, styles.item_text_con]}>
							<Text style={styles.item_text}>{"5.参与积分抽奖视为同意"}</Text>
							<Pressable onPress={() => {
								navigation.navigate("Page", { screen: "Protocol", params: { title: "积分规则", type: "jfrule" } })
							}}><Text style={styles.item_text_link}>{"《积分规则》"}</Text></Pressable>
						</View>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}
const styles = StyleSheet.create({
	lottery_container: {
		flex: 1,
		backgroundColor: theme.toolbarbg
	},
	lottery_bg: {
		position: "absolute",
		width: width,
		height: height,
	},
	lottery_con: {
		paddingHorizontal: 40,
		paddingBottom: 90,
		alignItems: "center",
	},
	lottery_machine: {
		width: (width - 80) * 0.8,
		height: (width - 80) * 0.8,
		marginTop: 50,
	},
	machine_img: {
		position: "absolute",
		width: "100%",
		height: "100%",
	},
	lottery_btn: {
		width: 170,
		height: 40,
		borderRadius: 25,
		overflow: "hidden",
		marginTop: 50,
		backgroundColor: "#59447B",
		shadowOpacity: 1,
		shadowRadius: 0,
		shadowColor: "#382348",
		shadowOffset: {
			width: 1,
			height: 2.5,
		},
	},
	lottery_btn_text: {
		width: 170,
		height: 40,
		lineHeight: 40,
		textAlign: "center",
		fontSize: 13,
		color: theme.toolbarbg
	},
	instruction: {
		width: "100%",
		paddingHorizontal: 6,
		marginTop: 50,
		borderRadius: 8,
		borderBottomColor: "rgba(50,50,50,0.6)",
		borderBottomWidth: 1,
		backgroundColor: "rgba(154,119,210,0.3)"
	},
	instruction_item: {
		borderRadius: 6,
		overflow: "hidden",
		borderWidth: 1,
		borderColor: "rgba(252,252,254,0.3)",
		marginVertical: 6,
	},
	item_margin: {
		marginTop: 6,
		paddingHorizontal: 22,
	},
	item_title: {
		fontSize: 15,
		marginVertical: 10,
		fontWeight: "500",
		fontFamily: "PingFang SC",
		color: "rgba(255,255,255,0.7)",
		textAlign: "center",
	},
	item_text_con: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	item_text: {
		fontSize: 12,
		color: "rgba(255,255,255,0.7)",
	},
	item_text_link: {
		fontSize: 12,
		color: "#8695FF",
	},
	item_top_border: {
		position: "absolute",
		left: 0,
		right: 0,
		height: "100%",
		borderRadius: 8,
		borderColor: "#A38EE5",
		borderWidth: 1,
		borderLeftWidth: 0.001,
		borderRightWidth: 0.001,
		borderBottomWidth: 0,
	},
});
export default Lottery;