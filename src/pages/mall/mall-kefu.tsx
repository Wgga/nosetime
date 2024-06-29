import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, useWindowDimensions, Image, TextInput } from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";

import ListBottomTip from "../../components/listbottomtip";
import RnImage from "../../components/RnImage";
import HeaderView from "../../components/headerview";
import AutoSizeImage from "../../components/autosizeimage";
import { ModalPortal } from "../../components/modals";
import PhotoPopover from "../../components/popover/photo-popover";
import ActionSheetCtrl from "../../components/actionsheetctrl";
import ToastCtrl from "../../components/toastctrl";

import upService from "../../services/upload-photo-service/upload-photo-service";
import us from "../../services/user-service/user-service";
import wss from "../../services/wss-service/wss-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, toCamelCase } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";
import Photo from "../../assets/svg/photo.svg";


const { width, height } = Dimensions.get("window");

const MallKefu = React.memo(({ navigation, route }: any) => {

	// 控件
	const classname: string = "MallKefuPage";
	const windowD = useWindowDimensions();
	let listref = React.useRef<any>(null);
	let inputref = React.useRef<any>(null);
	// 参数
	// 变量
	let send_content = React.useRef<string>("");
	let currentLink = React.useRef<any>("");
	// 数据
	let items = React.useRef<any[]>([]);
	let lastmsg = React.useRef<number>(0); // 最近消息时间
	let lasttime = React.useRef<number>(0); // 计算显示时间时用的变量
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据

	// 页面初始化触发
	React.useEffect(() => {
		init();
		subscribe();

		events.publish("nosetime_kfnotify", false);
		// 接收图片
		events.subscribe("photo_upload" + classname + us.user.uid, (dataurl: string) => {
			uploadpic_by_dataurl(dataurl);
		});

		return () => {
			events.unsubscribe("nosetime_oldmsg");
			events.unsubscribe("nosetime_presence");
			events.unsubscribe("nosetime_newmsg");
			events.unsubscribe("nosetime_echo");
			events.unsubscribe("nosetime_revoke");
			events.unsubscribe("nosetime_kfnotify");
			events.unsubscribe("photo_upload" + classname + us.user.uid);
		}
	}, [])

	// 进入页面触发
	useFocusEffect(
		React.useCallback(() => {
			events.publish("nosetime_kfnotify", false);
			// 进入/离开客服页面改变缓存中消息到new参数, 代表客服消息已读
			cache.getItem("messagedata").then((cacheobj) => {
				cacheobj.new = 0;
				cache.saveItem("messagedata", cacheobj, 24 * 3600);
				events.publish("nosetime_newmsg");
			}).catch(() => { });
			return () => {
				events.publish("nosetime_kfnotify", true);
			}
		}, [])
	)

	const subscribe = () => {
		events.subscribe("nosetime_oldmsg", (data: any) => {
			setmsg(data, "events_old");
		});

		events.subscribe("nosetime_presence", (data: any) => {
			if (!data || data.length == 0) return;
			setmsg(data, "events_presence");
		});

		events.subscribe("nosetime_newmsg", (item: any) => {
			if (!item) return;
			sendnewmsg(item);
			//20230915 yy 有可能上面有一条或者多条没有收到，没触发这个消息，通过https获取一下
			http.post(ENV.kefu + "?uid=" + us.user.uid, { method: "newmsg", token: us.user.token, fromtm: lastmsg.current }).then((resp_data: any) => {
				if (resp_data.msg == "OK") {
					setmsg(resp_data.items, "new");

					cache.getItem("userupdatedata").then((cacheobj) => {
						if (cacheobj && cacheobj.dbgkf1841) {
							let res: any = [];
							let start = items.current.length - 20;
							if (start < 0) start = 0;
							for (let i = start; i < items.current.length; ++i) {
								res.push(items.current[i].id);
							}
							http.post(ENV.usage, { method: "kf", uid: us.user.uid, data: res }).then((resp_data: any) => { });
						}
					})
				} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") { //20240229 shibo:处理token失效
					us.delUser();
					return navigation.navigate("Page", { screen: "Login", params: { src: "App客服页" } });
				}
			})
		})

		events.subscribe("nosetime_echo", (item) => {
			console.log("nosetime.echo", items.current, item);
			setoktag(item);
		});

		events.subscribe("nosetime_revoke", (item) => {
			//console.log("nosetime_revoke");
			let i: any = 0;
			for (i in items.current) {
				if (items.current[i].time == item.time) {
					//console.log("delete items.current");
					items.current.splice(i, 1);
					return;
				}
			}
			//20230825 撤回后，删除缓存数据，并尽快失效，好更新完整数据
			cache.saveItem(classname + us.user.uid, items.current, 1);
		});
	}

	const setoktag = (data: any) => {
		if (data.id == undefined) return;
		let i = items.current.findIndex((item: any) => item.id == data.id);
		items.current[i].time = data.time;
		items.current[i].id = data.newid;
		if (items.current[i].loading == 1) items.current[i].loading = 0;
		if (items.current[i].error == 1) items.current[i].error = 0;
	}

	const init = () => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App客服页" } });
		}
		cache.getItem(classname + us.user.uid).then((cacheobj) => {
			if (cacheobj && cacheobj.length == 0) return;
			setmsg(cacheobj, "init");
			checkin();
		}).catch(() => {
			// fall here if item is expired or doesn't exist 
			//console.log("this.cache.getItem:NO RESULT",this.classname+"publish",this.id);
			checkin();
		});
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
					setmsg(resp_data.items, "new");
				} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {//20240229 shibo:处理token失效
					us.delUser();
					return navigation.navigate("Page", { screen: "Login", params: { src: "App客服页" } });
				}
			});
		});
	}

	const calc_sztime = () => {
		lasttime.current = 0;
		us.calc_sztime(items.current, lasttime.current);
		setIsRender(val => !val);
	}

	const sortByID = (a: any, b: any) => {
		return a.id - b.id;
	}

	const uniqueitems = (items: any, key: string) => {
		const map = new Map();
		return items.reduce((acc: any, obj: any) => {
			if (!map.has(obj[key])) {
				map.set(obj[key], true);
				acc.push(obj);
			}
			return acc;
		}, []);
	}

	// 发送新消息
	const sendnewmsg = (msg: any) => {
		setmsg([msg], "events_new");
		us.calc_last_sztime(items.current, lasttime.current);
	}

	// 设置新/旧信息，并更新缓存，type: new/old
	const setmsg = (data: any, type: string) => {
		if (!data || data.length == 0) return;
		let types = ["nosetime_presence", "old", "events_old"];
		let redata = [...data].reverse();
		if (type != "init" && !(type.includes("events"))) {
			data.sort(sortByID);
		}
		if (type == "events_new") {
			items.current = uniqueitems(redata.concat(items.current), "id");
		} else {
			items.current = uniqueitems(items.current.concat(redata), "id");
		}
		if (type == "new" || type == "init") {
			// 由于使用列表翻转，所以此处取lastmsg也需要翻转
			lastmsg.current = items.current[0].time;
		}
		if (types.includes(type)) {
			cache.saveItem(classname + us.user.uid, [...items.current].reverse(), 600);
		}
		calc_sztime();
	}

	// 处理信息中的特殊字符(&nbsp;、<p>)
	const handleblank = (sz: string) => {
		sz = sz.replace(/&nbsp;/g, " ").replace(/<\/p>/g, "").replace(/<p>/g, "\n");
		return sz;
	}
	// 处理自动回复信息
	const handleAutomsg = (sz: string) => {
		sz = sz.replace(/<(?!br).*?>/gi, "").replace(/\n<br>|<br>/g, "\n");
		return <Text style={styles.item_automsg_text}>{sz}</Text>
	}
	// 处理链接信息
	const handlelink = (sz: string) => {
		let link = JSON.parse(sz);
		let msg = (
			<Pressable onPress={() => { gotolink(link) }}>
				{link.link_href && <Text style={styles.link_msg}>{"给您发了一篇" + link.type}</Text>}
				<View style={styles.link_msg_con}>
					{link.img && <RnImage style={styles.link_msg_img}
						source={{ uri: ENV.image + link.img }}
						errsrc={require("../../assets/images/noxx.png")}
						resizeMode={"contain"}
					/>}
					{link.pic_src && <RnImage style={[styles.link_msg_img, !(link.link_href.match(/topic|pinpai|qiwei/g)) && { width: 105 }]}
						source={{ uri: link.pic_src.indexOf("https:") < 0 ? "https:" + link.pic_src : link.pic_src }}
						errsrc={require("../../assets/images/noxx.png")}
						resizeMode={"contain"}
					/>}
					<View style={styles.link_info}>
						<Text numberOfLines={2} style={styles.link_info_tit}>{handleblank(link.title)}</Text>
						{link.link_href && <Text style={styles.link_info_tit}>{link.page == "article-detail" ? "点击查看全文>>" : `点击查看${link.type}>>`}</Text>}
						{!link.link_href && <Text style={styles.link_info_price}>{handleblank(link.price)}</Text>}
					</View>
				</View>
			</Pressable>
		)
		return msg;
	}
	// 跳转链接
	const gotolink = (item: any) => {
		if (item.link_href && item.page == "media-list-detail") {
			navigation.navigate("Page", { screen: "MediaListDetail", params: { mid: item.mid, id: item.viid, src: "APP客服页" } });
			return;
		}
		if (item.link_href && item.page == "social-shequ-detail") {
			navigation.navigate("Page", { screen: "SocialShequDetail", params: { ctdlgid: item.id, src: "APP客服页" } });
			return;
		}
		let screen = toCamelCase(item.page);
		navigation.navigate("Page", { screen: screen, params: { id: item.id, src: "APP客服页" } });
	}
	// 处理图片信息
	const handleimg = (sz: string) => {
		let data = JSON.parse(sz), uri = "";

		if (data.uri) {
			if (data.uri.indexOf("data:image") == 0) {
				uri = data.uri;
			} else {
				uri = "data:image/jpeg;base64," + data.uri;
			}
		} else {
			uri = ENV.image + data.url;
		}
		return (
			<Pressable onPress={() => { open_PhotoPopover(uri) }}>
				<AutoSizeImage style={{ width: "100%", minHeight: 100 }} uri={uri} />
			</Pressable>
		);
	}
	// 查看图片大图
	const open_PhotoPopover = (uri: string) => {
		ModalPortal.show((
			<PhotoPopover modalparams={{
				key: "kefu_photo_popover",
				slideimgindex: 0,
				slideimglist: [uri]
			}} />
		), {
			key: "kefu_photo_popover",
			width,
			height,
			rounded: false,
			useNativeDriver: true,
			onTouchOutside: () => {
				ModalPortal.dismiss("kefu_photo_popover");
			},
			onHardwareBackPress: () => {
				ModalPortal.dismiss("kefu_photo_popover");
				return true;
			},
			animationDuration: 300,
			modalStyle: { backgroundColor: "transparent" },
		})
	}

	// 加载上一页
	const fetch = () => {
		// 由于使用列表翻转，所以此处取lastmsg也需要翻转
		let totm = items.current.length > 0 ? items.current[items.current.length - 1].time : lastmsg.current;
		wss.send({ method: "oldmsg", totm: totm, uid: us.user.uid, token: us.user.token }).then((T: any) => {
			console.log("is send2", T);
		}, (T: any) => {
			console.log("not send2", T);
			http.post(ENV.kefu + "?uid=" + us.user.uid, { method: "oldmsg", token: us.user.token, totm: totm }).then((resp_data: any) => {
				if (resp_data.msg == "OK") {
					setmsg(resp_data.items, "old");
				} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {//20240229 shibo:处理token失效
					us.delUser();
					return navigation.navigate("Page", { screen: "Login", params: { src: "App客服页" } });
				}
			});
		});
	}

	// 选择图片方式
	const openfiledlg = () => {
		ActionSheetCtrl.show({
			key: "filedlg_action_sheet",
			buttons: [{
				text: "拍照",
				style: { color: theme.tit2 },
				handler: () => {
					ActionSheetCtrl.close("filedlg_action_sheet");
					setTimeout(() => { buttonClicked(0) }, 300);
				}
			}, {
				text: "从相册选择",
				style: { color: theme.tit2 },
				handler: () => {
					ActionSheetCtrl.close("filedlg_action_sheet");
					setTimeout(() => { buttonClicked(1) }, 300);
				}
			}, {
				text: "取消",
				style: { color: theme.tit },
				handler: () => {
					ActionSheetCtrl.close("filedlg_action_sheet");
				}
			}],
		})
	}

	// 选择图片
	const buttonClicked = (index: number) => {
		let params = {
			index: index,
			quality: 0.9,
			isCrop: false,
			includeBase64: true,
			src: "photoupload",
			classname,
			maxWidth: 1024,
			maxHeight: 1024,
		}
		upService.buttonClicked(params);
	}

	// 请求上传图片接口
	const uploadpic_by_dataurl = (dataurl: string) => {
		let time = Math.floor((new Date().getTime()) / 1000);
		let id = Math.floor((new Date().getTime()));
		let replytext = JSON.stringify({ uri: dataurl, percent: "0%", brightness: 1 });
		sendnewmsg({ dir: 2, type: 4, content: replytext, id, time, loading: 1 });
		//后台要存储图片，需要加前缀
		http.post(ENV.mall + "?type=kefu&uid=" + us.user.uid, { method: "savepic_dataurl", token: us.user.token, Filedata: dataurl }).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				publish(null, { id, url: resp_data.url });
				items.current[0].content = JSON.stringify({ uri: dataurl, percent: "0%", brightness: 1, url: resp_data.url });
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App客服页" } });
			}
		});
	}

	// 处理发送信息回调
	const handleres = (res: any, type: string) => {
		if (res.type != 4) {
			sendnewmsg(res);
		} else {
			us.calc_last_sztime(items.current, lasttime.current);
		}
		send_content.current = "";
		if (res.type == 3 && type == "error") backupupload(res);
		if (res.type == 3) {
			currentLink.current = null;
		} else {
			setTimeout(() => { try { seterrortag(res) } catch (e) { } }, 3000);
		}
		setIsRender(val => !val);
	}

	// 发送信息
	const publish = (link: any, img: any) => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App客服页" } });
		}
		//本地显示时间
		let time = Math.floor((new Date().getTime()) / 1000);
		let id = Math.floor((new Date().getTime()));

		var replytext = send_content.current.trim();
		//类型：1文本 2html 3链接 4图片 10回执（不显）
		if (link && link != "send") {
			replytext = JSON.stringify(link);

			let item: any = { dir: 2, type: 3, content: replytext, id, time };
			wss.send({ method: "msg", type: 3, content: replytext, id, uid: us.user.uid, token: us.user.token }).then((T: any) => {
				console.log("is send3", T);
				Object.assign(item, { loading: 1 });
				handleres(item, "success");
			}, (T: any) => {
				console.log("not send3", T);
				Object.assign(item, { error: 1, errmsg: T });
				handleres(item, "error");
			});
		} else if (img && img != 1) {
			replytext = JSON.stringify(img);
			id = img.id;

			let item = { dir: 2, type: 4, content: replytext, id, time, loading: 1 };
			wss.send({ method: "msg", type: 4, content: replytext, id, uid: us.user.uid, token: us.user.token }).then((T: any) => {
				console.log("is send4", T);
				handleres(item, "success");
			}, (T: any) => {
				console.log("not send4", T);
				handleres(item, "error");
			});
		} else {
			if (replytext == "") return;

			let item = { dir: 2, type: 1, content: replytext, time, id, loading: 1, error: 0 };
			console.log("%c Line:486 🧀 item", "color:#3f7cff", item);
			wss.send({ method: "msg", type: 1, content: replytext, id, uid: us.user.uid, token: us.user.token }).then((T: any) => {
				console.log("is send5", T, id);
				handleres(item, "success");
			}, (T: any) => {
				console.log("not send5", T, id);
				Object.assign(item, { errmsg: T });
				handleres(item, "error");
			});
		}
	};

	// 设置信息超时标志
	const seterrortag = (item: any) => {
		for (var i in items.current) {
			if (items.current[i].id == item.id) {
				if (items.current[i].loading == 1) {
					items.current[i].loading = 0;
					items.current[i].error = 1;
					backupupload(item);
					ToastCtrl.show({ message: "信息发送超时", duration: 1000, viewstyle: "short_toast", key: "msg_error_toast" });
				}
				return;
			}
		}
	}

	// 使用接口重新发送信息
	const backupupload = (item: any, src: any = null) => {
		http.post(ENV.kefu + "?uid=" + us.user.uid, { method: "sendmsg", token: us.user.token, item: item }).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				setoktag(item);
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {//20240229 shibo:处理token失效
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App客服页" } });
			}
		}, (error) => {
			if (error && !error.ok) {
				setTimeout(() => {
					item.loading = 0;
					item.error = 1;
					if (src) ToastCtrl.show({ message: "信息发送超时", duration: 1000, viewstyle: "short_toast", key: "msg_error_toast" });
				}, 2000);
			}
		});
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
			}}></HeaderView>
			<FlashList ref={listref} data={items.current}
				extraData={isrender}
				inverted
				estimatedItemSize={100}
				onEndReachedThreshold={0.1}
				onEndReached={() => {
					items.current.length > 0 && fetch();
				}}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ backgroundColor: theme.bg }}
				keyExtractor={(item: any, index: number) => item.id + "_" + index}
				renderItem={({ item, index }: any) => {
					return (
						<>
							{(item.sztime != undefined && item.sztime != "") && <Text style={styles.item_sztime}>{item.sztime}</Text>}
							{item.type == 2 && <View style={styles.item_automsg}>{handleAutomsg(item.content)}</View>}
							{item.type != 2 && <View style={[styles.item_container, {
								flexDirection: item.dir == 1 ? "row" : "row-reverse",
							}]}>
								<View style={styles.item_avatar_con}>
									{item.dir == 1 && <Image style={styles.item_avatar} source={{ uri: ENV.image + "/mobileicon.png" }} />}
									{item.dir == 2 && <Image style={styles.item_avatar} source={{ uri: ENV.avatar + us.user.uid + ".jpg!l?" + us.user.uface }} />}
									<View style={[styles.item_triangle, item.dir == 2 && styles.item_triangle_right]}></View>
								</View>
								<View style={[
									styles.item_content,
									item.dir == 2 && styles.item_content_right,
									(item.type == 3 && item.dir == 1) && { flexShrink: 0, width: windowD.width * 0.85 },
									(item.type == 3 && item.dir == 2) && { flexShrink: 0, width: windowD.width * 0.70 }
								]}>
									{item.type == 1 && <Text style={[styles.item_msg, item.dir == 2 && styles.item_msg_right]}>{handleblank(item.content)}</Text>}
									{item.type == 2 && <Text style={[styles.item_msg, item.dir == 2 && styles.item_msg_right]}>{item.content}</Text>}
									{item.type == 3 && <View style={[styles.item_msg, item.dir == 2 && { ...styles.item_msg_right, paddingVertical: 0 }]}>{handlelink(item.content)}</View>}
									{item.type == 4 && <View style={[styles.item_msg, item.dir == 2 && styles.item_msg_right]}>{handleimg(item.content)}</View>}
								</View>
							</View>}
						</>
					)
				}}
				ListHeaderComponent={<ListBottomTip noMore={null} isShowTip={items.current.length > 0} />}
			/>
			<View style={styles.footer_con}>
				<Pressable style={styles.footer_icon}>
					<Photo width={27} height={27} />
				</Pressable>
				<View style={styles.footer_input_con}>
					<TextInput ref={inputref}
						style={styles.footer_input}
						onChangeText={(val: string) => {
							send_content.current = val;
							setIsRender(val => !val);
						}}
						value={send_content.current}
						multiline={true}
					/>
				</View>
				<Pressable style={styles.footer_icon} onPress={() => { publish("send", 1) }}>
					<Text style={styles.send_text}>{"发送"}</Text>
				</Pressable>
			</View>
		</View>
	);
})

const styles = StyleSheet.create({
	item_sztime: {
		marginVertical: 10,
		marginHorizontal: 100,
		textAlign: "center",
		fontSize: 14,
		color: theme.placeholder2
	},
	item_automsg: {
		width: width * 0.9,
		padding: 14,
		marginVertical: 15,
		marginHorizontal: "auto",
		backgroundColor: theme.toolbarbg,
		borderRadius: 5,
		overflow: "hidden",
	},
	item_automsg_text: {
		fontSize: 14,
		color: theme.tit2,
		lineHeight: 21,
	},
	item_container: {
		padding: 7,
		alignItems: "flex-start",
	},
	item_avatar_con: {
		justifyContent: "center",
	},
	item_avatar: {
		height: 36,
		width: 36,
		borderRadius: 50,
	},
	item_triangle_right: {
		left: -16,
		right: 0,
		borderRightColor: "transparent",
		borderLeftColor: theme.dialogbox,
	},
	item_triangle: {
		position: "absolute",
		right: -16,
		width: 0,
		height: 0,
		borderWidth: 8,
		borderTopColor: "transparent",
		borderBottomColor: "transparent",
		borderLeftColor: "transparent",
		borderRightColor: theme.toolbarbg,
	},
	item_content: {
		flexShrink: 1,
		marginRight: 10,
	},
	item_content_right: {
		marginRight: 0,
		marginLeft: 10
	},
	item_msg: {
		backgroundColor: theme.toolbarbg,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 5,
		marginLeft: 16,
		lineHeight: 26,
		overflow: "hidden",
	},
	item_msg_right: {
		marginLeft: 0,
		marginRight: 16,
		backgroundColor: theme.dialogbox,
	},
	link_msg: {
		fontSize: 15,
		fontWeight: "500",
		fontFamily: "PingFang SC",
		color: theme.text1,
	},
	link_msg_con: {
		marginVertical: 10,
		flexDirection: "row",
	},
	link_msg_img: {
		width: 66,
		height: 66,
		borderRadius: 8,
		backgroundColor: theme.toolbarbg,
		overflow: "hidden",
	},
	link_info: {
		marginLeft: 10,
		flex: 1
	},
	link_info_tit: {
		fontSize: 13,
		color: theme.tit2,
		lineHeight: 20
	},
	link_info_price: {
		fontSize: 14,
		lineHeight: 26,
		color: theme.color
	},
	footer_con: {
		borderTopColor: theme.border,
		borderTopWidth: 1,
		backgroundColor: theme.toolbarbg,
		flexDirection: "row",
		alignItems: "center",
		paddingBottom: 10,
		paddingTop: 10,
	},
	footer_icon: {
		width: 48,
		alignItems: "center",
		justifyContent: "center",
	},
	footer_input_con: {
		flex: 1,
		paddingLeft: 10,
	},
	footer_input: {
		padding: 0,
		fontSize: 13,
		maxHeight: 76,
		lineHeight: 18,
		color: theme.text1,
		borderBottomColor: theme.border,
		borderBottomWidth: 1,
	},
	send_text: {
		fontSize: 13,
		color: theme.tit2
	}
});

export default MallKefu;