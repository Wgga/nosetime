import React from "react";
import { StyleSheet, Animated } from "react-native";

interface IState {
	stickyLayoutY: number,
	stickyTabY: number,
	stickyScrollY: Animated.Value
}

/**
 * 滑动吸顶效果组件
 * @export
 * @class StickyTab
 */
export default class StickyTab extends React.Component<any, IState> {


	readonly state: IState = {
		stickyTabY: -1,
		stickyScrollY: new Animated.Value(0),
		stickyLayoutY: 0
	}
	// 兼容代码，防止没有传头部高度
	_onLayout = (event: any) => {
		this.setState({
			stickyLayoutY: event.nativeEvent.layout.y,
		})
	}


	render() {
		const { stickyTabY, stickyScrollY, children, style } = this.props
		const { stickyLayoutY } = this.state
		let y = stickyTabY !== -1 ? stickyTabY : stickyLayoutY
		const translateY = stickyScrollY.interpolate({
			inputRange: [-1, 0, y, y + 1],
			outputRange: [0, 0, 0, 1],
			useNativeDriver: false
		})

		return (
			<Animated.View
				onLayout={this._onLayout}
				style={[
					style,
					styles.container,
					{ transform: [{ translateY }] }
				]}
			>
				{children}
			</Animated.View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		zIndex: 100,
		height: 50,
	}
})