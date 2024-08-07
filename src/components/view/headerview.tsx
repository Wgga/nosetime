import React from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Animated, Easing, Dimensions } from "react-native";

import { ShadowedView } from "react-native-fast-shadow";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Icon from "../../assets/iconfont";

import theme from "../../configs/theme";

const { width, height } = Dimensions.get("window");

const HeaderView = React.memo(({ data, method, children, MenuChildren = null }: any) => {

	// 控件
	const insets = useSafeAreaInsets();

	// 参数
	const {
		title,
		backicon,
		backiconsize,
		backiconcolor,
		placeholder,
		word,
		isShowSearch,
		isautoFocus,
		style,
		childrenstyle,
		showmenu
	} = data;
	const { fun, setWord, Search, back } = method;

	// 数据
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	// 变量
	let animatedValue = React.useRef<Animated.Value>(new Animated.Value(0)).current; // 动画值
	let animated = React.useRef<any>(null); // 动画实例
	let titleWidth = React.useRef<number>(0); // 标题宽度
	let viewWidth = React.useRef<number>(0); // 标题最大显示宽度
	let viewstyle = React.useRef<any>({}); // 视图样式

	React.useEffect(() => {
		viewWidth.current = Math.round(width - 128);
		return () => {
			animated.current && animated.current.stop();
		}
	}, [])

	const startAnimation = () => {
		animated.current = Animated.timing(animatedValue, {
			toValue: 1,
			duration: 15000,
			delay: 2000,
			easing: Easing.linear,
			useNativeDriver: true
		})
		animated.current.start(({ finished }: any) => {
			// 动画结束后重新调用
			if (finished) {
				animatedValue.setValue(0);
				startAnimation();
			}
		});
	}

	const createviewstyle = () => {
		viewstyle.current = {
			position: "absolute",
			left: 0,
			top: 0,
			flexDirection: "row",
			alignItems: "center",
			transform: [{
				translateX: animatedValue.interpolate({
					inputRange: [0, 1],
					outputRange: [0, -titleWidth.current]
				})
			}]
		}
		setIsRender(val => !val);
	}

	return (
		<>
			<View style={[styles.title_con, style, { paddingTop: insets.top }]}>
				<Icon name={backicon ? backicon : "leftarrow"}
					onPress={back}
					size={backiconsize ? backiconsize : 20}
					color={backiconcolor ? backiconcolor : theme.text2}
					style={[styles.title_icon, childrenstyle?.headercolor]}
				/>
				{isShowSearch && <View style={styles.searchbar_con}>
					<TextInput ref={ref => { if (ref && isautoFocus) { ref.focus() } }}
						style={styles.searchbar}
						multiline={false}
						placeholder={placeholder}
						autoFocus={isautoFocus}
						onChangeText={text => {
							setWord(text)
						}}
						value={word}
						onSubmitEditing={(e) => {
							if (!e.nativeEvent.text) return
							Search(word);
						}}
					/>
					<View style={styles.search_icon_con}>
						{word && <Icon name="close1" size={16} color={theme.placeholder2} onPress={fun} />}
						<Icon name="search2" size={16} color={theme.text2} style={styles.search_icon} onPress={() => { Search(word) }} />
					</View>
				</View>}
				{title && <Animated.View style={[styles.title_text_con, childrenstyle?.headertitle]}>
					<Animated.View style={viewstyle.current}>
						<Text onLayout={(e) => {
							if (title.length * 16 > viewWidth.current) {
								titleWidth.current = title.length * 16 + 50;
								createviewstyle();
								startAnimation();
							} else {
								titleWidth.current = viewWidth.current;
								setIsRender(val => !val);
							}
						}} style={[
							styles.title_text,
							childrenstyle?.headercolor,
							{ width: titleWidth.current, textAlign: title.length * 16 > viewWidth.current ? "left" : "center" }
						]}>{title}</Text>
						{title.length * 16 > viewWidth.current && <Text style={[
							styles.title_text,
							childrenstyle?.headercolor,
							{ width: titleWidth.current }
						]}>{title}</Text>}
					</Animated.View>
				</Animated.View>}
				{children}
			</View>
			{MenuChildren && <ShadowedView style={[styles.menu_con, { marginTop: insets.top + 40, display: showmenu ? "flex" : "none" }]}>
				<MenuChildren />
			</ShadowedView>}
		</>
	);
})

const styles = StyleSheet.create({
	title_con: {
		backgroundColor: theme.toolbarbg,
		flexDirection: "row",
		alignItems: "flex-end",
		justifyContent: "space-between",
		zIndex: 1,
	},
	title_icon: {
		width: 44,
		height: 44,
		textAlign: "center",
		lineHeight: 44,
		fontWeight: "bold",
		zIndex: 1
	},
	title_text_con: {
		flex: 1,
		height: 44,
		overflow: "hidden",
		marginHorizontal: 20,
		backgroundColor: "transparent",
		zIndex: 1,
	},
	title_text: {
		height: 44,
		lineHeight: 44,
		fontSize: 16,
		fontWeight: "500",
		fontFamily: "PingFang SC",
		color: theme.text2,
	},
	leftarrow: {
		marginLeft: 9,
	},
	searchbar_con: {
		position: "relative",
		flex: 1,
		height: 36,
		borderRadius: 30,
		backgroundColor: theme.bg,
		alignItems: "center",
		flexDirection: "row",
		marginRight: 13,
		marginBottom: 4,
	},
	searchbar: {
		backgroundColor: "transparent",
		fontSize: 12,
		flex: 1,
		color: theme.text2,
		padding: 0,
		paddingLeft: 20,
	},
	search_icon_con: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 10,
	},
	search_icon: {
		marginLeft: 9,
		borderLeftWidth: 1,
		borderLeftColor: theme.border,
		paddingLeft: 9
	},
	menu_con: {
		position: "absolute",
		top: 0,
		right: 0,
		marginRight: 20,
		backgroundColor: theme.toolbarbg,
		paddingHorizontal: 10,
		borderRadius: 5,
		overflow: "hidden",
		shadowOpacity: 0.2,
		shadowRadius: 10,
		shadowOffset: {
			width: 0,
			height: 0,
		},
		zIndex: 2,
	},
})

export default HeaderView;
