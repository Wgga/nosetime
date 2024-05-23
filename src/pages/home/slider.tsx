import React from "react";
import { Text, Dimensions, View, StyleSheet, Pressable, ImageBackground } from "react-native";

import Carousel from "react-native-reanimated-carousel";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { LongPressGestureHandler } from "react-native-gesture-handler";

const width = Dimensions.get("window").width;

function Slider({ navigation, banner, setSliderHeight }: any): React.JSX.Element {

	// 控件
	const ref = React.useRef<any>(null);
	// 变量
	const [currentIndex, setCurrentIndex] = React.useState<number>(0);

	const onLayout = (event: any) => {
		const { height: viewHeight } = event.nativeEvent.layout;
		setSliderHeight(viewHeight);
	};

	return (
		<View onLayout={onLayout} style={styles.container}>
			<Carousel
				ref={ref}
				width={width}
				data={banner}
				defaultIndex={0}
				autoPlayInterval={3000}
				scrollAnimationDuration={500}
				autoPlay={true}
				autoFillData
				panGestureHandlerProps={{
					activeOffsetX: [-10, 10],
				}}
				onSnapToItem={(index: number) => {
					setCurrentIndex(index);
				}}
				renderItem={({ item, index }: any) => (
					<LongPressGestureHandler>
						<Pressable key={item.code} onPress={() => navigation.navigate("Page", { screen: "ArticleDetail", params: { id: item.code } })}>
							<View style={styles.container}>
								<ImageBackground style={styles.image_box}
									source={{ uri: ENV.image + item.img, cache: "force-cache" }} resizeMode="cover" />
								<View style={styles.title_box}>
									<Text style={styles.title} numberOfLines={1}>{item.title}</Text>
									<Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
								</View>
							</View>
						</Pressable>
					</LongPressGestureHandler>
				)}
			/>
			<View style={styles.indicatorContainer}>
				{banner.map((item: any, index: number) => (
					<View key={item.code} style={[styles.dotstyle, { opacity: index === currentIndex ? 1 : 0.3 }]}></View>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		aspectRatio: 390 / 273,
	},
	image_box: {
		position: "absolute",
		width: "100%",
		height: "100%",
		backgroundColor: "rgba(129, 129, 129, 0.09)"
	},
	title_box: {
		position: "absolute",
		width: "100%",
		bottom: "10%",
		height: 50,
		textAlign: "left",
		marginTop: -10,
		color: theme.toolbarbg,
		paddingLeft: 30,
	},
	title: {
		fontSize: 19,
		height: 28,
		lineHeight: 28,
		fontWeight: "bold",
		textShadowColor: theme.textShadow,
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 8,
		letterSpacing: 1,
		color: theme.toolbarbg,
	},
	subtitle: {
		fontSize: 16,
		height: 22,
		lineHeight: 22,
		textShadowColor: theme.textShadow,
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 5,
		color: theme.toolbarbg,
	},
	indicatorContainer: {
		position: "absolute",
		flexDirection: "row",
		bottom: "5%",
		right: 20,
	},
	dotstyle: {
		marginLeft: 4,
		marginRight: 4,
		width: 20,
		height: 2,
		borderRadius: 1,
		opacity: 0.3,
		backgroundColor: theme.toolbarbg,
	},
})

export default Slider;

