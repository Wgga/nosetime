import React from "react";
import { ScrollView as RNScrollView, View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions, Image, Platform, Linking } from "react-native";

import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { Blurhash } from "react-native-blurhash";
import { Brightness } from "react-native-color-matrix-image-filters";
import { ShadowedView } from "react-native-fast-shadow";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AlertCtrl from "../../components/alertctrl";
import ToastCtrl from "../../components/toastctrl";

import http from "../../utils/api/http";

import us from "../../services/user-service/user-service";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();
const AppVersion = ENV.AppMainVersion + '.' + ENV.AppMiniVersion + '.' + ENV.AppBuildVersion;

const Person = React.memo(({ navigation }: any) => {

	// 控件
	// 变量
	const [isrender, setisRender] = React.useState(false); // 是否渲染

	// 数据
	let fullname = React.useRef<string>(""); // 签名香名称
	let signperfume = React.useRef<any>({}); // 签名香数据

	React.useEffect(() => {
		if (us.user.uiid > 0) {
			cache.getItem("item" + us.user.uiid + "getinfo").then((cacheobj) => {
				if (cacheobj) {
					signperfume.current = cacheobj;
					fullname.current = cacheobj.ifullname;
					setisRender(val => !val);
				}
			}).catch(() => {
				http.get(ENV.item + "?method=getinfo&id=" + us.user.uiid).then((resp_data: any) => {
					signperfume.current = resp_data;
					fullname.current = resp_data.ifullname;
					cache.saveItem("item" + us.user.uiid + "getinfo", resp_data, 60);
					setisRender(val => !val);
				});
			});
		} else {
			// 20230516 shibo:修复删除签名香后退出重进数据未更新
			signperfume.current = { iid: null };
			fullname.current = '';
			setisRender(val => !val);
		}
	}, [])

	// 更改头像
	const changeAvatar = () => {
		console.log("%c Line:61 🥓", "color:#e41a6a", "changeAvatar");
	}

	// 更改昵称
	const changeName = () => {
		console.log("%c Line:71 🥓", "color:#e41a6a", "changeName");
	}

	// 更改性别
	const changeGender = () => {
		console.log("%c Line:81 🥓", "color:#e41a6a", "changeGender");
	}

	// 更改地区
	const changeLocation = () => {
		console.log("%c Line:91 🥓", "color:#e41a6a", "changeLocation");
	}

	// 更改签名香
	const changePerfume = () => {
		console.log("%c Line:101 🥓", "color:#e41a6a", "changePerfume");
	}

	// 更改简介
	const changeIntro = () => {
		console.log("%c Line:111 🥓", "color:#e41a6a", "changeIntro");
	}

	return (
		<GestureHandlerRootView>
			<ScrollView contentContainerStyle={styles.setting_list_con}
				showsVerticalScrollIndicator={false}>
				<ShadowedView style={styles.list_item_con}>
					<Pressable onPress={changeAvatar} style={styles.list_item}>
						<Text style={styles.item_title}>{"头像"}</Text>
						<View style={styles.item_msg}>
							<Image style={styles.item_user_avatar}
								source={{ uri: ENV.avatar + us.user.uid + ".jpg?" + us.user.uface }}
							/>
							<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
						</View>
					</Pressable>
					<Pressable onPress={changeName} style={styles.list_item}>
						<Text style={styles.item_title}>{"昵称"}</Text>
						<View style={styles.item_msg}>
							{us.user.uname && <Text style={styles.item_msg_text}>{us.user.uname}</Text>}
							{!us.user.uname && <Text style={styles.item_msg_text}>{"请设置昵称"}</Text>}
							<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
						</View>
					</Pressable>
					<Pressable onPress={changeGender} style={styles.list_item}>
						<Text style={styles.item_title}>{"性别"}</Text>
						<View style={styles.item_msg}>
							{us.user.ugender == "m" && <Text style={styles.item_msg_text}>{"男"}</Text>}
							{us.user.ugender == "f" && <Text style={styles.item_msg_text}>{"女"}</Text>}
							<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
						</View>
					</Pressable>
					<Pressable onPress={changeLocation} style={styles.list_item}>
						<Text style={styles.item_title}>{"地区"}</Text>
						<View style={styles.item_msg}>
							{us.user.ulocation && <Text style={styles.item_msg_text}>{us.user.ulocation}</Text>}
							{!us.user.ulocation && <Text style={styles.item_msg_text}>{"无"}</Text>}
							<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
						</View>
					</Pressable>
				</ShadowedView>
				<ShadowedView style={styles.list_item_con}>
					<Pressable onPress={changePerfume}>
						<View style={styles.list_item}>
							<Text style={styles.item_title}>{"签名香"}</Text>
							<View style={styles.item_msg}>
								{fullname.current && <Text style={styles.item_msg_text}>{"修改"}</Text>}
								{!fullname.current && <Text style={styles.item_msg_text}>{"无"}</Text>}
								<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
							</View>
						</View>
						<View style={styles.item_info_text_con}>
							<Text style={styles.item_info_text}>{fullname.current}</Text>
						</View>
					</Pressable>
				</ShadowedView>
				<ShadowedView style={styles.list_item_con}>
					<Pressable onPress={changeIntro}>
						<View style={styles.list_item}>
							<Text style={styles.item_title}>{"简介"}</Text>
							<View style={styles.item_msg}>
								{!us.user.udesc && <Text style={styles.item_msg_text}>{"未填写"}</Text>}
								<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
							</View>
						</View>
						{us.user.udesc && <ScrollView style={styles.item_info_text_con}>
							<Text style={styles.item_info_text}>{us.user.udesc}</Text>
						</ScrollView>}
					</Pressable>
				</ShadowedView>
			</ScrollView>
		</GestureHandlerRootView>
	)
})

const Account = React.memo(({ navigation, showgiftcode }: any) => {

	// 数据
	// 状态

	// 跳转页面
	const gotodetail = (page: string, item: any = null) => {
		console.log("%c Line:171 🍐", "color:#e41a6a");
	}

	// 兑换礼品
	const exchange = () => {
		console.log("%c Line:175 🥟", "color:#b03734", "exchange");
	}

	const logout = () => {
		http.post(ENV.user, { method: "logout", id: us.user.uid, token: us.user.token }).then(() => { }).catch(() => { });
		us.delUser();
		events.emit("nosetime_userlogout");
		navigation.navigate("Tabs", { screen: "Home" });
	}

	return (
		<RNScrollView contentContainerStyle={styles.setting_list_con}
			showsVerticalScrollIndicator={false}>
			<ShadowedView style={styles.list_item_con}>
				<Pressable onPress={() => {
					gotodetail("mall-address");
				}} style={styles.list_item}>
					<Text style={styles.item_title}>{"管理收货地址"}</Text>
					<View style={styles.item_msg}>
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</Pressable>
				<Pressable onPress={() => {
					gotodetail("mall-idcard-edit");
				}} style={styles.list_item}>
					<Text style={styles.item_title}>{"跨境购物实名认证"}</Text>
					<View style={styles.item_msg}>
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</Pressable>
				<Pressable onPress={() => {
					gotodetail("mall-coupon");
				}} style={styles.list_item}>
					<Text style={styles.item_title}>{"优惠券"}</Text>
					<View style={styles.item_msg}>
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</Pressable>
				{showgiftcode && <Pressable onPress={exchange} style={styles.list_item}>
					<Text style={styles.item_title}>{"礼品码兑换"}</Text>
					<View style={styles.item_msg}>
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</Pressable>}
			</ShadowedView>
			<ShadowedView style={styles.list_item_con}>
				{us.user.showmodifypass && <Pressable onPress={() => {
					gotodetail("user-change-pass", "modify");
				}} style={styles.list_item}>
					<Text style={styles.item_title}>{"修改密码"}</Text>
					<View style={styles.item_msg}>
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</Pressable>}
				{us.user.showsetmobile && <Pressable onPress={() => {
					gotodetail("user-change-account", "set");
				}} style={styles.list_item}>
					<Text style={styles.item_title}>{"绑定手机"}</Text>
					<View style={styles.item_msg}>
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</Pressable>}
				{us.user.showmodifymobile && <Pressable onPress={() => {
					gotodetail("user-change-account", "set");
				}} style={styles.list_item}>
					<Text style={styles.item_title}>{"更改手机"}</Text>
					<View style={styles.item_msg}>
						<Text style={styles.item_msg_text}>{us.user.mobile}</Text>
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</Pressable>}
				{us.user.showmodifyemail && <Pressable onPress={() => {
					gotodetail("user-change-account", "modify");
				}} style={styles.list_item}>
					<Text style={styles.item_title}>{"更改邮箱"}</Text>
					<View style={styles.item_msg}>
						<Text style={styles.item_msg_text}>{us.user.mobile}</Text>
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</Pressable>}
			</ShadowedView>
			<Pressable onPress={logout} style={styles.logout_btn}>
				<LinearGradient
					colors={["#81B4EC", "#9BA6F5"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					locations={[0, 1]}
					style={[styles.logout_btn_bg, { zIndex: 1, transform: [{ translateY: -2 }, { translateX: -2 }] }]}
				></LinearGradient>
				<LinearGradient
					colors={["#61A2E9", "#95A0EB"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					locations={[0, 1]}
					style={styles.logout_btn_bg}
				></LinearGradient>
				<Text style={styles.logout_btn_text}>{"退出登录"}</Text>
			</Pressable>
			<View style={styles.about_list_con}>
				<View style={styles.protocol_con}>
					<Pressable onPress={() => {
						navigation.navigate("Page", { screen: "Protocol", params: { title: "香水时代使用协议", type: "protocol" } })
					}}>
						<Text style={styles.protocol_text}>{"使用协议"}</Text>
					</Pressable>
					<Text style={styles.protocol_text_line}>{"|"}</Text>
					<Pressable onPress={() => {
						navigation.navigate("Page", { screen: "Protocol", params: { title: "香水时代隐私政策", type: "privacy" } })
					}}>
						<Text style={styles.protocol_text}>{"隐私政策"}</Text>
					</Pressable>
				</View>
			</View>
		</RNScrollView>
	)
})

const System = React.memo(({ navigation, copyrightyear }: any) => {
	// 变量
	const [cacheSize, setCacheSize] = React.useState("0.00MB");
	let filterkeys = React.useRef<any>([]);

	// 跳转页面
	const gotodetail = (page: string, item: any = null) => {
		switch (page) {
			case "user-unregister":
				navigation.navigate("Page", { screen: "UserUnregister" })
				break;
			case "user-feedback":
				navigation.navigate("Page", { screen: "UserFeedback", params: { title: "用户反馈" } })
				break;
			case "protocol":
				navigation.navigate("Page", { screen: "Protocol", params: { title: "香水时代使用协议", type: "protocol" } })
				break;
			case "privacy":
				navigation.navigate("Page", { screen: "Protocol", params: { title: "香水时代使用协议", type: "privacy" } })
				break;
			default:
				break;
		}
	}

	React.useEffect(() => {
		getCacheSize().then((size: string) => {
			setCacheSize(size);
		})
	}, [])

	// 获取缓存大小
	const getCacheSize = async () => {
		try {
			const keys = await AsyncStorage.getAllKeys();
			filterkeys.current = keys.filter((key: string) => key.indexOf("UserService") === -1);
			const cacheData = await AsyncStorage.multiGet(keys);
			let cacheSize = 0;

			cacheData.forEach(([key, value]: any) => {
				cacheSize += key.length;
				cacheSize += value.length;
			});

			return (cacheSize / 1024 / 1024).toFixed(2) + "MB";
		} catch (error) {
			return "0.00MB";
		}
	}

	// 清除缓存
	const clearCache = () => {
		AlertCtrl.show({
			header: "你确定要清除缓存吗？",
			key: "clear_cache_alert",
			message: "",
			buttons: [{
				text: '取消',
				handler: () => {
					AlertCtrl.close("clear_cache_alert");
				}
			}, {
				text: "确定",
				handler: () => {
					AlertCtrl.close("clear_cache_alert");
					cache.clear(filterkeys.current);
					setCacheSize("0.00MB");
					http.post(ENV.update, { uid: us.user.uid, did: us.did, ver: AppVersion }).then((resp_data: any) => {
						cache.saveItem('userupdate', resp_data, 24 * 3600);
					})
					ToastCtrl.show({ message: "清除成功", duration: 2000, viewstyle: "short_toast", key: "clear_cache_toast" });
				}
			}]
		})
	}

	// 更新版本
	const checkUpdate = () => {
		if (!(Platform.OS == "android")) return;
		http.get(ENV.update + "?brand=" + us.deviceinfo.brand).then((resp_data: any) => {
			if (parseInt(resp_data.nversion) > parseFloat(ENV.AppNVersion)) {
				Linking.openURL(resp_data.scheme);
			} else {
				ToastCtrl.show({ message: "当前版本已是最新版本", duration: 2000, viewstyle: "medium_toast", key: "new_version_toast" });
			}
		})
	}

	return (
		<RNScrollView contentContainerStyle={styles.setting_list_con}
			showsVerticalScrollIndicator={false}>
			<ShadowedView style={styles.list_item_con}>
				<Pressable onPress={() => {
					gotodetail("user-feedback");
				}} style={styles.list_item}>
					<Text style={styles.item_title}>{"意见反馈"}</Text>
					<View style={styles.item_msg}>
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</Pressable>
				<Pressable onPress={() => {
					gotodetail("user-unregister");
				}} style={styles.list_item}>
					<Text style={styles.item_title}>{"注销账户"}</Text>
					<View style={styles.item_msg}>
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</Pressable>
				<Pressable onPress={clearCache} style={styles.list_item}>
					<Text style={styles.item_title}>{"清除缓存"}</Text>
					<View style={styles.item_msg}>
						<Text style={styles.item_msg_text}>{cacheSize}</Text>
					</View>
				</Pressable>
				<Pressable onPress={checkUpdate} style={styles.list_item}>
					<Text style={styles.item_title}>{"版本更新"}</Text>
					<View style={styles.item_msg}>
						<Text style={styles.item_msg_text}>{"V" + AppVersion}</Text>
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</Pressable>
			</ShadowedView>
			<View style={styles.about_list_con}>
				<View style={styles.protocol_con}>
					<Pressable onPress={() => {
						gotodetail("protocol");
					}}>
						<Text style={styles.protocol_text}>{"使用协议"}</Text>
					</Pressable>
					<Text style={styles.protocol_text_line}>{"|"}</Text>
					<Pressable onPress={() => {
						gotodetail("privacy");
					}}>
						<Text style={styles.protocol_text}>{"隐私政策"}</Text>
					</Pressable>
				</View>
				<Text style={styles.about_text}>{"Copyright © 2014-" + copyrightyear}</Text>
				<Text style={styles.about_text}>{" 郑州美芬计算机科技有限公司 "}</Text>
				<Text style={styles.about_text}>{"NoseTime.com 版权所有"}</Text>
				<Text style={styles.about_text}>{"豫ICP备14010206号-3A"}</Text>
			</View>
		</RNScrollView>
	)
})

function UserSetting({ navigation }: any): React.JSX.Element {
	// 控件
	const insets = useSafeAreaInsets();
	// 变量
	const [index, setIndex] = React.useState(0);
	let copyrightyear = React.useRef<string>("");
	// 数据
	// 状态
	let showgiftcode = React.useRef<boolean>(false); // 是否显示兑换码
	const [routes] = React.useState([
		{ key: "person", title: "个人" },
		{ key: "account", title: "账户" },
		{ key: "system", title: "系统" },
	]);
	// 参数
	const tabbar_icon = [
		require("../../assets/images/setting/person.png"),
		require("../../assets/images/setting/account.png"),
		require("../../assets/images/setting/system.png"),
	];
	// 状态

	React.useEffect(() => {
		events.addListener("userupdatedata", (result: any) => {
			if (result) {
				showgiftcode.current = result.showgiftcode == 1 ? true : false;
				copyrightyear.current = result.copyrightyear;
			} else {
				showgiftcode.current = false;
				copyrightyear.current = new Date().getFullYear().toString();
			}
		})

		cache.getItem("userupdatedata").then((cacheobj) => {
			if (cacheobj) {
				showgiftcode.current = cacheobj.showgiftcode == 1 ? true : false;
				copyrightyear.current = cacheobj.copyrightyear;
			} else {
				showgiftcode.current = false;
				copyrightyear.current = new Date().getFullYear().toString();
			}
		}).catch(() => { });

		return () => {
			events.removeAllListeners("userupdatedata");
		}
	}, [])

	return (
		<View style={styles.setting_con}>
			<Pressable style={[styles.leftback, { marginTop: insets.top }]} onPress={() => { navigation.goBack(); }}>
				<Icon name="leftarrow" size={20} color={theme.toolbarbg} style={styles.backicon} />
			</Pressable>
			<Brightness amount={0.85} style={styles.header_bg_con}>
				<LinearGradient
					colors={["transparent", theme.bg]}
					start={{ x: 0, y: 0 }}
					end={{ x: 0, y: 1 }}
					locations={[0.5, 1]}
					style={styles.linear_bg}
				></LinearGradient>
				<Blurhash style={styles.header_bg}
					blurhash={us.user.blurhash}
					decodeWidth={32}
					decodeHeight={32}
					decodePunch={1}
					resizeMode="cover"
					decodeAsync={true}
				/>
			</Brightness>
			<View style={[styles.setting_header, { paddingTop: insets.top ? insets.top + 30 : 55 }]}>
				<Image style={styles.user_avatar}
					source={{ uri: ENV.avatar + us.user.uid + ".jpg?" + us.user.uface }}
				/>
				<Text style={styles.setting_text}>{"个人设置"}</Text>
			</View>
			<TabView style={{ backgroundColor: "transparent", marginTop: 20 }}
				navigationState={{ index, routes }}
				renderScene={SceneMap({
					person: () => <Person navigation={navigation} />,
					account: () => <Account navigation={navigation} showgiftcode={showgiftcode.current} />,
					system: () => <System navigation={navigation} copyrightyear={copyrightyear.current} />,
				})}
				renderTabBar={(props: any) => {
					return (
						<View style={styles.tabbar_con}>
							<View style={styles.tabbar_icon_con}>
								{tabbar_icon.map((item: any, index: number) => {
									return (
										<View key={index} style={styles.tabbar_icon}>
											<Image style={styles.tabbar_icon_img} source={item} resizeMode="contain" />
										</View>
									)
								})}
							</View>
							<TabBar {...props}
								activeColor={theme.tit2}
								inactiveColor="rgba(46,46,46,0.6)"
								indicatorStyle={{ backgroundColor: "#444", width: 20, height: 2, bottom: 9, left: "14%" }}
								android_ripple={{ color: "transparent" }}
								indicatorContainerStyle={{ backgroundColor: "transparent" }}
								labelStyle={{ fontSize: 15, fontWeight: "500" }}
								style={styles.tabbar}
							/>
						</View>
					)
				}}
				onIndexChange={() => { }}
				initialLayout={{ width }}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	setting_con: {
		height: height,
		backgroundColor: theme.bg,
	},
	leftback: {
		position: "absolute",
		left: 0,
		top: 0,
		zIndex: 1
	},
	backicon: {
		width: 44,
		height: 44,
		textAlign: "center",
		lineHeight: 44,
		fontWeight: "bold",
	},
	header_bg_con: {
		position: "absolute",
		width: width,
		height: height * 0.75,
		overflow: "hidden",
	},
	linear_bg: {
		...StyleSheet.absoluteFillObject,
		zIndex: 1,
	},
	header_bg: {
		...StyleSheet.absoluteFillObject,
		margin: -30,
	},
	setting_header: {
		alignItems: "center",
	},
	user_avatar: {
		width: 60,
		height: 60,
		borderRadius: 30,
		borderWidth: 1,
		borderColor: theme.toolbarbg,
	},
	setting_text: {
		fontSize: 18,
		color: theme.tit2,
		marginTop: 6,
	},
	tabbar_con: {
		height: 94,
		justifyContent: "flex-end",
		marginHorizontal: 20,
		marginBottom: 20,
	},
	tabbar_icon_con: {
		width: "100%",
		height: 90,
		position: "absolute",
		top: 0,
		flexDirection: "row",
	},
	tabbar_icon: {
		flex: 1,
		alignItems: "center",
	},
	tabbar_icon_img: {
		width: 20,
		height: "100%",
	},
	tabbar: {
		backgroundColor: "rgba(255,255,255,0.65)",
		shadowColor: "transparent",
		borderRadius: 10,
	},
	setting_list_con: {
		paddingTop: 5,
		paddingHorizontal: 20,
		paddingBottom: 100,
	},
	list_item_con: {
		paddingVertical: 5,
		marginBottom: 20,
		borderRadius: 10,
		backgroundColor: "rgba(255,255,255,0.65)",
		shadowColor: "rgba(0,0,0,0.1)",
		shadowOpacity: 1,
		shadowRadius: 6.7,
		shadowOffset: {
			width: 0,
			height: 0,
		},
	},
	list_item: {
		paddingVertical: 12,
		paddingLeft: 20,
		paddingRight: 15,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	item_title: {
		color: theme.tit2,
		fontSize: 15,
		fontFamily: "PingFang SC",
		height: 32,
		lineHeight: 32,
	},
	item_msg: {
		flexDirection: "row",
		alignItems: "center",
	},
	item_msg_text: {
		fontSize: 14,
		color: theme.placeholder
	},
	item_icon: {
		transform: [{ rotate: "180deg" }],
		marginLeft: 5,
	},
	item_user_avatar: {
		width: 32,
		height: 32,
		borderRadius: 50,
	},
	item_info_text_con: {
		maxHeight: 100,
		marginBottom: 10,
	},
	item_info_text: {
		marginHorizontal: 20,
		color: theme.comment,
		fontSize: 12,
	},
	logout_btn: {
		marginTop: 25,
		marginBottom: 20,
		padding: 12,
		borderRadius: 30,
		overflow: "hidden",
		alignItems: "center",
	},
	logout_btn_text: {
		fontSize: 16,
		color: theme.toolbarbg,
		zIndex: 2,
	},
	logout_btn_bg: {
		...StyleSheet.absoluteFillObject,
		borderRadius: 30,
		zIndex: 0,
	},
	about_list_con: {
		alignItems: "center",
	},
	protocol_con: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 27,
	},
	protocol_text: {
		fontSize: 12,
		color: "#7189DD",
		fontFamily: "PingFang SC",
		fontWeight: "500",
		lineHeight: 23,
	},
	protocol_text_line: {
		fontSize: 12,
		transform: [{ scale: 0.8 }],
		marginHorizontal: 5,
		color: theme.border,
		fontFamily: "PingFang SC",
		fontWeight: "500",
	},
	about_text: {
		fontSize: 12,
		color: theme.placeholder,
		lineHeight: 23,
	}
});
export default UserSetting;