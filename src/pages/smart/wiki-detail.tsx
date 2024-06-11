import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image } from "react-native";

import { FlashList } from "@shopify/flash-list";
import FastImage from "react-native-fast-image";

import HeaderView from "../../components/headerview";
import ListBottomTip from "../../components/listbottomtip";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";
import events from "../../hooks/events/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";
import RnImage from "../../components/RnImage";
import WebView from "react-native-webview";

const { width, height } = Dimensions.get("window");

function WikiDetail({ navigation, route }: any): React.JSX.Element {

	// 控件
	const classname = "WikiDetailPage";
	// 参数
	const id = route.params && route.params.id ? route.params.id : 0;
	// 变量
	let type = React.useRef<string>("");
	let page = React.useRef<number>(1);
	let orderby = React.useRef<string>("hot");
	let desc = React.useRef<any>({ hot: "-", star: "-", brand: false, year: "-" })
	let cnt = React.useRef<number>(0);
	// 数据
	let like_ = React.useRef<any[]>([]);
	let canbuy_ = React.useRef<any[]>([]);
	let wikidata = React.useRef<any>({});
	let items = React.useRef<any[]>([]);
	let intro = React.useRef<any>(null);
	// 状态
	let [canbuy, setCanbuy] = React.useState<boolean>(false);
	let noMore = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		if (id >= 10000000 && id <= 10099999) type.current = "brand";
		else if (id >= 11000000 && id <= 11099999) type.current = "odor";
		else if (id >= 14000000 && id <= 14099999) type.current = "fragrance";
		else if (id >= 12000000 && id <= 12099999) type.current = "perfumer";
		init();
	}, [])

	const init = () => {
		cache.getItem(classname + id).then((cacheobj: any) => {
			if (cacheobj) {
				setwikidata(cacheobj);
			}
		}).catch(() => {
			http.post(ENV.wiki + "?type=" + type.current + "&id=" + id, { uid: us.user.uid, did: us.did }).then((resp_data: any) => {
				cache.saveItem(classname + id, resp_data, 600);
				setwikidata(resp_data);
			});
		});
	}

	const setwikidata = (data: any) => {
		data.title = data.name;
		if (data.name != data.oriname) {
			data.title += " " + data.oriname;
		}
		wikidata.current = data;
		intro.current = changeurl(data.desc);
		islike([id]);
		loadMore(null);
	}

	const changehref = (match: any, url: string, title: string) => {
		//console.log("changehref=", match, url, title);

		//20230418 shibo:若a标签内存在style属性则保留该属性
		let urls = /style="(.*?)"/.exec(match), style = "";
		if (urls && urls.length > 0) style = urls[0];

		//<a href=" /xiangshui/168678-diao-duyao-zidu-dior-poison.html">迪奥紫Dior Poison
		var id = 0;
		var pos = url.indexOf("/xiangshui/");
		if (pos > 0) {
			id = parseInt(url.substr(pos + 11, 6));
			//console.log(typeof id);
			if (typeof id == "number")
				return '<a href=\'#/?{"page":"item-detail","id":' + id + '}\'' + style + ">" + title + "</a>";
			//return "<a href='#/tab/itemdetail?type=item&id="+id+"&title="+title+"'>"+title+"</a>";
		}
		return title;
	}
	const changeurl = (sz: string) => {
		if (sz == null) return "";
		sz = sz.replace(/\n/g, "<p>");
		let sz_data = sz.split(/<p>/g).map((item: any, index: number) => {
			if (item.startsWith("<b>")) {
				return (<Text key={index} style={[styles.intro_text, { fontWeight: "700" }]}>&emsp;&emsp;{item.replace(/<b>|<\/b>/g, "")}</Text>)
			} else if (item.startsWith("<a")) {
				const linkText = item.match(/>(.*?)</)[1];
				const linkUrl = item.match(/href="(.*?)"/)[1];
				return <Text key={index}><Text style={[styles.intro_text, { color: theme.tit }]}>&emsp;&emsp;{linkText}</Text></Text>;
			} else {
				return <Text key={index} style={styles.intro_text}>&emsp;&emsp;{item}</Text>;
			}
		});
		return sz_data;
	};

	const loadMore = (e: any) => {
		var url = "";
		if (type.current == "brand") {
			url = ENV.search + "?type=item&in=" + type.current + "id&word=" + id + "&page=" + page.current + "&orderby=" + orderby.current + "&desc=" + desc.current[orderby.current] + "&canbuy=" + canbuy;
		} else {
			url = ENV.search + "?type=item&in=" + type.current + "&word=" + wikidata.current.name + "&page=" + page.current + "&orderby=" + orderby.current + "&desc=" + desc.current[orderby.current] + "&canbuy=" + canbuy;
		}
		http.get(url).then((resp_data: any) => {
			if (items.current.length != 0 && items.current.length > cnt.current) {
				if (items.current[items.current.length - 1].id == resp_data.item.data[resp_data.item.data.length - 1].id) {
					noMore.current = true;
					page.current++;
					return;
				}
			}

			cnt.current = resp_data.item.cnt;
			if (page.current == 1)
				items.current = resp_data.item.data;
			else
				items.current = items.current.concat(resp_data.item.data);

			// nocanbuy = items.current.length == 0;

			if (resp_data.item.data.length < 10) {
				noMore.current = true;
			} else {
				noMore.current = false;
			}
			page.current++;
			buys(resp_data.item.data);
		});
	}

	const buys = (resp: any) => {
		let ids = [];
		for (let i in resp) ids.push(resp[i].id);
		http.post(ENV.api + ENV.mall, { method: "canbuy", uid: us.user.uid, ids: ids }).then((resp_data: any) => {
			for (let i in resp_data) canbuy_.current[resp_data[i]] = 1;
			setIsRender(val => !val);
		});
	}

	const islike = (ids: any) => {
		if (!us.user.uid) {
			return;
		}
		http.post(ENV.api + ENV.wiki, { method: "islike", uid: us.user.uid, ids: ids }).then((resp_data: any) => {
			for (var i in resp_data) like_.current[resp_data[i]] = 1;
		});
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: wikidata.current.name,
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}}>
				<Pressable style={Globalstyles.title_text_con} onPress={() => { }}>
					<Icon name={like_.current[id] ? "fav" : "fav-outline"} size={22} color={like_.current[id] ? theme.redchecked : theme.tit2} />
				</Pressable>
			</HeaderView>
			{(items.current && items.current.length > 0) && <FlashList data={items.current}
				extraData={isrender}
				estimatedItemSize={100}
				onEndReached={() => { }}
				onEndReachedThreshold={0.1}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ backgroundColor: theme.toolbarbg, paddingTop: 20, }}
				keyExtractor={(item: any) => item.id}
				ListHeaderComponent={(
					<>
						<View style={styles.wiki_header_con}>
							<View style={styles.wiki_image}>
								{type.current == "brand" && <Image style={{ width: "100%", height: "100%" }}
									defaultSource={require("../../assets/images/nopic.png")}
									source={{ uri: ENV.image + "/brand/" + (wikidata.current.id % 100000) + ".jpg" }}
									resizeMode="contain"
								/>}
								{type.current == "odor" && <Image style={{ width: "100%", height: "100%" }}
									defaultSource={require("../../assets/images/nopic.png")}
									source={{ uri: ENV.image + "/odor/" + (wikidata.current.id % 100000) + ".jpg" }}
									resizeMode="contain"
								/>}
								{type.current == "perfumer" && <RnImage style={{ width: "100%", height: "100%" }}
									source={{ uri: ENV.image + "/nosevi/" + wikidata.current.id + ".jpg" }}
									resizeMode="contain"
								/>}
								{(type.current == "fragrance" && ((wikidata.current.id >= 14000001 && wikidata.current.id <= 14000012) || wikidata.current.id == 14000021)) && <Image style={{ width: "100%", height: "100%" }}
									defaultSource={require("../../assets/images/nopic.png")}
									source={{ uri: ENV.image + "/fragrance/" + wikidata.current.id + ".jpg" }}
									resizeMode="contain"
								/>}
							</View>
							<Text style={styles.wiki_title}>{wikidata.current.title}</Text>
						</View>
						{intro.current && <View style={{ paddingHorizontal: 15 }}>
							{intro.current}
						</View>}
					</>
				)}
				renderItem={({ item, index }: any) => {
					return (
						<></>
					)
				}}
			// ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={items.current.length > 0} />}
			/>}
		</View>
	);
}

const styles = StyleSheet.create({
	wiki_header_con: {
		alignItems: "center",
	},
	wiki_image: {
		width: width * 0.25,
		height: width * 0.25,
	},
	wiki_title: {
		fontSize: 17,
		fontWeight: "bold",
		marginTop: 16,
		marginBottom: 10,
		color: theme.text2,
		fontFamily: "PingFang SC",
	},
	intro_text: {
		color: theme.comment,
		fontSize: 13,
		lineHeight: 20,
		marginTop: 13,
		fontFamily: "PingFang SC",
	},

});

export default WikiDetail;