import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions, Image, ScrollView } from "react-native";

import HeaderView from "../../components/headerview";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";

import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";
import LinearButton from "../../components/linearbutton";
import { ShadowedView } from "react-native-fast-shadow";
import us from "../../services/user-service/user-service";
import FastImage from "react-native-fast-image";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();

function Lottery({ navigation, route }: any): React.JSX.Element {
	// 控件
	// 参数
	const lottery_motion = require("../../assets/images/lottery/lottery_motion.gif");
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
	let lottery_start = React.useRef<any>(null);
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
		// points.current = route.params.points;
		setIsRender(val => !val);
	}, [])

	const setEndImage = (type: string) => {
		if (type == "no") {
			lottery_end.current = ENV.image + "/lot/no" + Math.floor(Math.random() * 10 + 1) + '.png';
		} else {
			lottery_end.current = ENV.image + "/lot/yes" + Math.floor(Math.random() * 5 + 1) + '.png';
		}
	}

	const start_lottery = () => {
		clearInterval(timer.current);
		start_time.current = new Date().getTime();
		state.current = "in0.5s";
		setIsRender(val => !val);

		lottery.current = null;
		/* http.post(ENV.points + "?uid=" + us.user.uid, { method: "lotv2", point: point.current, token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App积分抽奖页" } });
			}
			lottery.current = resp_data;
			//20200215直接通过事件传递点数，避免刷新延迟，减少请求
			if (lottery.current.val >= 0) {
				events.emit("jifen_newpoint", lottery.current.val);
				points.current = lottery.current.val;
			}
			setIsRender(val => !val);
		}); */
		setTimeout(() => {
			lottery.current = { msg: "OK", lose: 1, }
			setIsRender(val => !val);
		}, 1000)
		timer.current = setInterval(() => {
			let t = new Date().getTime() - start_time.current;
			let src = "";
			//超时很久了，退出
			console.log("%c Line:89 🍷", "color:#ffdd4d", state.current);
			if (t > 20000) {
				clearInterval(timer.current);
				// src = '../assets/svg/userjifen/icontip' + Math.floor(Math.random() * 20 + 1) + '.svg';
				/* this.popoverCtrl.create({
					component: LotteryFullscreenPage,
					componentProps: { src: this.src, desc: "抽奖失败,请检查网络后重试", sure: "接受指引", showbg: false },
					cssClass: 'fullwidth-popover lottery',
					event: ev,
					translucent: true
				}).then((popover) => { popover.present() }); */
				setEndImage("no");
				lottery_start.current = ENV.image + "/lot/lottery.gif?" + Math.random();
				state.current = "init";
				setIsRender(val => !val);
			} else if (t > 2000) {
				if (lottery.current) {//2s后获取到数据后处理
					clearInterval(timer.current);
					if (lottery.current.msg == "OK") {
						if (lottery.current.lose) {
							//src = '../assets/svg/userjifen/icontip' + Math.floor(Math.random() * 20 + 1) + '.svg';
							state.current = "result";
							/* this.popoverCtrl.create({
								component: LotteryFullscreenPage,
								componentProps: {
									src: this.src,
									desc: lottery.current.note,
									cnname: this.lottery.cnmsg,
									enname: this.lottery.enmsg,
									sure: "我知道了",
									showbg: false
								},
								cssClass: 'fullwidth-popover lottery',
								event: ev,
								translucent: true
							}).then((popover) => { popover.present() }); */
							setEndImage("no");
							setIsRender(val => !val);
						} else {
							if (lottery.current.img) {
								src = ENV.image + lottery.current.img;
							} else if (lottery.current.iid) {
								src = ENV.image + "/perfume/" + lottery.current.iid + ".jpg!m";
							}
							state.current = "result";
							/* this.popoverCtrl.create({
								component: LotteryFullscreenPage,
								componentProps: {
									src: ENV.image + lottery.current.img,
									desc: "你抽到了奖品！",
									sure: "收下奖品",
									cnname: this.lottery.name.replace(/\（.*\）/, "").replace(/\(.*\)/, ""),
									enname: this.lottery.enname, ml: this.lottery.ml,
									showbg: true
								},
								cssClass: 'fullwidth-popover lottery',
								event: ev,
								translucent: true
							}).then((popover) => { popover.present() }); */
							setEndImage("yes");
							setIsRender(val => !val);
						}
					} else {
						// src = '../assets/svg/userjifen/icontip' + Math.floor(Math.random() * 20 + 1) + '.svg';
						/* this.popoverCtrl.create({
							component: LotteryFullscreenPage,
							componentProps: { src: this.src, desc: lottery.current.msg, sure: "接受指引", showbg: false },
							cssClass: 'fullwidth-popover lottery',
							event: ev,
							translucent: true
						}).then((popover) => { popover.present() }); */
						state.current = "init";
						lottery_start.current = ENV.image + "/lot/lottery.gif?" + Math.random();
						setEndImage("no");
						setIsRender(val => !val);
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
					{state.current == "init" && <FastImage style={[styles.machine_img, styles.machine_no4]}
						source={{ uri: ENV.image + "/lot/no4.png" }} />}
					{(state.current == "in0.5s" && lottery_start.current) && <FastImage style={[styles.machine_img, styles.machine_start]} source={
						{ uri: lottery_start.current }
					} />}
					{state.current == "motion" && <FastImage style={[styles.machine_img, styles.machine_motion]} source={{
						uri: ENV.image + "/lot/lottery_motion.gif"
					}} />}
					{(state.current == "result" && lottery_end.current) && <FastImage style={[styles.machine_img, styles.machine_motion]}
						source={{ uri: lottery_end.current }} />}
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
	machine_start: {

	},
	machine_no4: {
	},
	machine_motion: {

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
	}
});
export default Lottery;