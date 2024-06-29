/* import React from "react";
import { View, Text } from "react-native";

function Mall(): React.JSX.Element {
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text>Mall!</Text>
		</View>
	);
}

export default Mall;
 */
import React from "react";
import { View, PanResponder, Animated, Dimensions, StyleSheet, Text } from "react-native";

import theme from "../../configs/theme";

class Mall extends React.Component {

	public panResponder: any;
	public knowledgeitems: any[] = [0, 1, 2];
	public state: any = {
		initX: 0,
		initY: 0,
		add_trans: false,
		cart_back: true,
		dis: 0,
		abs_dis: 0,
		rate: 0,
		carouselArr: [0, 1, 2],
		carouselStyleArr: [
			{ left: "6%", transform: [{ scale: 1 }], opacity: 0.7, zIndex: 1 },
			{ left: "27%", transform: [{ scale: 1.25 }], opacity: 1, zIndex: 3 },
			{ left: "48%", transform: [{ scale: 1 }], opacity: 0.7, zIndex: 1 }
		],
		currentkey: 1,
		pan: new Animated.ValueXY()
	}

	constructor(props: any) {
		super(props);

		let carouselArr: any[] = [0, 1, 2],
			carouselStyleArr: any[] = [];

		this.panResponder = PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: () => true,
			onPanResponderStart: (e, gestureState) => {
				this.setState({
					initX: e.nativeEvent.pageX,
					initY: e.nativeEvent.pageY,
					add_trans: false,
					cart_back: true
				});
			},
			onPanResponderMove: (e, gestureState) => {
				if (Math.abs(gestureState.dx) / Math.abs(gestureState.dy) < 1 || Math.abs(gestureState.dy) / Math.abs(gestureState.dx) === Infinity) {
					this.setState({ cart_back: true });
					return;
				}
				this.setState({ cart_back: false, dis: gestureState.dx, abs_dis: Math.abs(gestureState.dx) });
				let rate = Math.abs(gestureState.dx) / Dimensions.get("window").width;
				this.setState({ rate: rate });
				const style1 = { transform: [{ scale: 1.25 - 0.25 * rate }], opacity: 1 - 0.3 * rate },
					style2 = { transform: [{ scale: 1 + 0.25 * rate }], opacity: 0.7 + 0.3 * rate };
				if (gestureState.dx < 0) {
					carouselStyleArr[carouselArr[0]] = { left: `${(6 + 27 * rate)}%` };
					carouselStyleArr[carouselArr[1]] = { ...style1, left: `${(28 - 27 * rate)}%` };
					carouselStyleArr[carouselArr[2]] = { ...style2, left: `${(48 - 27 * rate)}%`, zIndex: 0.25 * rate > 0.04 ? 3 : 1 };

					this.setState({ carouselStyleArr })
				} else {
					carouselStyleArr[carouselArr[0]] = { ...style2, left: `${(6 + 27 * rate)}%`, zIndex: 0.25 * rate > 0.04 ? 3 : 1 };
					carouselStyleArr[carouselArr[1]] = { ...style1, left: `${(28 + 27 * rate)}%` };
					carouselStyleArr[carouselArr[2]] = { left: `${(48 - 50 * rate)}%` };

					this.setState({ carouselStyleArr })
				}
			},
			onPanResponderRelease: (e, gestureState) => {
				if (this.state.cart_back) return;
				this.setState({ add_trans: true });
				let endX = e.nativeEvent.pageX;

				if (this.state.initX - endX > 0) {
					this.setState({ currentkey: this.state.currentkey + 1 % this.knowledgeitems.length });
					carouselArr.push((carouselArr[carouselArr.length - 1] + 1) % this.knowledgeitems.length); // 在末尾添加新元素
					carouselArr.shift();
					this.setState({ carouselArr });
				} else {
					this.setState({ currentkey: (this.state.currentkey - 1 + this.knowledgeitems.length) % this.knowledgeitems.length });
					carouselArr.unshift((carouselArr[0] - 1 + this.knowledgeitems.length) % this.knowledgeitems.length); // 在开头添加新元素
					carouselArr.pop();
					this.setState({ carouselArr });
				}

				carouselStyleArr[carouselArr[0]] = { left: "6%", transform: [{ scale: 1 }], opacity: 0.7, zIndex: 1 };
				carouselStyleArr[carouselArr[1]] = { left: "27%", transform: [{ scale: 1.25 }], opacity: 1, zIndex: 3 };
				carouselStyleArr[carouselArr[2]] = { left: "48%", transform: [{ scale: 1 }], opacity: 0.7, zIndex: 1 };

				this.setState({ carouselStyleArr });
			}
		});
	}

	render() {
		return (
			<View style={styles.swiper_content} {...this.panResponder.panHandlers}>
				{this.knowledgeitems && this.knowledgeitems.map((item, index) => {
					return (
						<View key={item} style={[
							styles.swiper_container,
							this.state.carouselStyleArr[index],
							index == this.state.carouselArr[0] ? this.state.carouselStyleArr[this.state.carouselArr[0]] : null,
							index == this.state.carouselArr[1] ? this.state.carouselStyleArr[this.state.carouselArr[1]] : null,
							index == this.state.carouselArr[2] ? this.state.carouselStyleArr[this.state.carouselArr[2]] : null,
						]}>
							<Text style={styles.swiper_title}>{item}</Text>
						</View>
					)
				})}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	swiper_content: {
		width: "100%",
		height: "100%",
		position: "relative",
		marginLeft: 3,
		backgroundColor: "red"
	},
	swiper_container: {
		width: 180,
		height: 190,
		borderRadius: 8,
		position: "absolute",
		left: "27%",
		top: "50%",
		backgroundColor: "blue",
		overflow: "hidden",
		shadowRadius: 10,
		zIndex: 20
	},
	swiper_title: {
		fontSize: 50,
		color: "#fff",
	}
});

export default Mall