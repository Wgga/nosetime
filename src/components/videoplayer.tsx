import React from "react";
import {
	View,
	Dimensions,
	Image,
	Text,
	TouchableWithoutFeedback,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
	Pressable,
	StatusBar,
} from "react-native";

import Video from "react-native-video";
import Orientation from "react-native-orientation-locker";
import Slider from "@react-native-community/slider";
import LinearGradient from "react-native-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

import Switch from "./switch";

import events from "../hooks/events";

import Icon from "../assets/iconfont";
import theme from "../configs/theme";

const screenWidth = Dimensions.get("window").width;

function formatTime(second: string) {
	let h = 0, i = 0, s = parseInt(second);
	if (s > 60) {
		i = parseInt((s / 60).toString());
		s = parseInt((s % 60).toString());
	}
	// 补零
	let zero = function (v: number) {
		return (v >> 0) < 10 ? "0" + v : v;
	};
	return [zero(h), zero(i), zero(s)].join(":");
}


interface PropsType {
	ref?: any,
	source: string,	// 视频源
	poster?: string,	// 封面
	classname?: string,	// 当前页面名称
	showPoster?: boolean,	// 是否显示视频封面
	showControl?: boolean, // 是否显示视频控制组件
	isPlaying?: boolean,	// 视频是否正在播放
	currentTime?: number,	// 视频当前播放的时间
	duration?: number,	// 视频的总时长
	isFullScreen?: boolean,	// 当前是否全屏显示
	playFromBeginning?: boolean,	// 是否从头开始播放
	children?: any,	// 子组件
}

export default class VideoPlayer extends React.Component<PropsType> {

	public videoRef: any = null;
	public readonly state: any = {
		ref: this.props.ref,
		source: this.props.source,	// 视频源
		poster: this.props.poster ? this.props.poster : "",	// 封面
		classname: this.props.classname ? this.props.classname : "",	// 当前页面名称
		videoWidth: screenWidth,	// 默认视频宽度
		videoHeight: screenWidth * 1080 / 1728,	// 默认视频高度
		showPoster: this.props.showPoster != undefined ? this.props.showPoster : true,	// 是否显示视频封面
		showControl: false,	// 是否显示控制条
		isPlaying: this.props.isPlaying != undefined ? this.props.isPlaying : false,	// 是否正在播放
		currentTime: 0,	// 当前播放时间
		duration: 0,	// 视频总时长
		isFullScreen: false,	// 是否全屏
		playFromBeginning: this.props.playFromBeginning ? this.props.playFromBeginning : false,	// 是否从头开始播放
		isBuffering: false,	// 是否正在缓冲
		isShowMenu: false,	// 是否显示菜单
		isRepeat: false,	// 是否循环播放
		children: this.props.children ? this.props.children : null,	// 子组件
	} as any;

	constructor(props: any) {
		super(props);
	}

	render() {
		return (
			<View style={styles.container} onLayout={this._onLayout}>
				<Video ref={(ref: any) => this.state.ref = ref}
					source={{ uri: this.state.source }}
					rate={1.0} // 播放速度
					volume={1.0} // 播放音量
					muted={false} // 是否设置静音
					paused={!this.state.isPlaying} // 是否设置暂停
					controls={!this.state.showPoster} // 是否显示控制条
					playWhenInactive={false} // 当通知或控制中心位于视频前面时，是否继续播放(仅IOS)
					playInBackground={false} // 当应用程序处于后台时，是否继续播放音频(仅IOS)
					ignoreSilentSwitch={"ignore"} // 控制 iOS 静默开关行为( ignore 即使设置了静音开关，也可以播放音频)
					progressUpdateInterval={250.0} // onProgress 事件之间的延迟
					onLoadStart={this._onLoadStart} // 视频加载开始
					onLoad={this._onLoaded} // 视频加载完成
					onProgress={this._onProgressChanged} // 视频播放进度
					onEnd={this._onPlayEnd} // 视频播放结束
					onError={this._onPlayError} // 视频播放失败
					onBuffer={this._onBuffering} // 视频缓冲
					onFullscreenPlayerWillPresent={() => {
						Orientation.lockToLandscape();
						this.setState((state: any) => {
							state.isFullScreen = true;
						})
					}}
					onFullscreenPlayerWillDismiss={() => {
						Orientation.lockToPortrait();
						this.setState((state: any) => {
							state.isFullScreen = false;
						})
					}}
					style={{ width: this.state.videoWidth, height: this.state.videoHeight }}
				/>
				{this.state.showPoster && <Pressable style={[styles.poster_con, { width: this.state.videoWidth, height: this.state.videoHeight }]} onPress={() => { this.hidePoster() }}>
					<Image style={[styles.poster_con, { width: this.state.videoWidth, height: this.state.videoHeight }]}
						resizeMode={"cover"}
						source={{ uri: this.state.poster }}
					/>
					<View style={styles.play_con}>
						{this.state.children}
						<View style={styles.play_btn}>
							<Image style={styles.playButton}
								resizeMode="cover"
								source={require("../assets/images/player/play.png")}
							/>
						</View>
					</View>
				</Pressable>}
				{/* {!this.state.showPoster && <TouchableWithoutFeedback onPress={() => { this.hideControl() }}>
					<View style={[styles.video_con, { zIndex: 1 }]}>
						{(!this.state.isPlaying || this.state.showControl) &&
							<TouchableWithoutFeedback onPress={() => { this.onPressPlayButton() }}>
								{this.state.isPlaying ? <Icon name="pause1" size={50} color="#fff" /> : <Icon name="play1" size={50} color="#fff" />}
							</TouchableWithoutFeedback>
						}
					</View>
				</TouchableWithoutFeedback>}
				{(!this.state.showPoster && this.state.isBuffering) && <View style={[styles.video_con, { zIndex: 0 }]}>
					<ActivityIndicator size="large" color="#fff" />
				</View>}
				{this.state.showControl && <LinearGradient
					colors={["transparent", "rgba(0,0,0,0.8)"]}
					start={{ x: 0.5, y: 0 }}
					end={{ x: 0.5, y: 1 }}
					style={[styles.control, { width: this.state.videoWidth, zIndex: 1 }]}
				>
					<View style={styles.control_btn}>
						<TouchableOpacity activeOpacity={0.3} onPress={() => { this.onControlPlayPress() }}
							style={{ padding: 7 }}>
							{this.state.isPlaying ? <Icon name="pause1" size={24} color="#fff" /> : <Icon name="play1" size={24} color="#fff" />}
						</TouchableOpacity>
						<Text style={styles.time}>{formatTime(this.state.currentTime)} / </Text>
						<Text style={styles.time}>{formatTime(this.state.duration)}</Text>
					</View>
					<View style={styles.control_btn}>
						<TouchableOpacity style={styles.setting1} activeOpacity={0.3} onPress={() => { this.onControlMenuPress() }}>
							<Icon name="setting1" size={18} color="#fff" />
						</TouchableOpacity>
						{this.state.isShowMenu && <Animated.View entering={ZoomIn} exiting={ZoomOut} style={styles.setting_con}>
							<View style={styles.setting_item}>
								<Text style={styles.setting_label}>{"速度"}</Text>
								<Icon name="r-return" size={16} color={"#fff"} />
							</View>
							<Pressable style={styles.setting_item} onPress={() => {
								this.setState({ isRepeat: !this.state.isRepeat });
							}}>
								<Text style={styles.setting_label}>{"洗脑循环"}</Text>
								<GestureHandlerRootView style={{ alignItems: "flex-end" }}>
									<Switch value={this.state.isRepeat}
										onValueChange={(val: boolean) => { }}
										activeColor={"rgba(255,255,255,0.5)"}
										inactiveColor={"transparent"}
										containerStyle={{ width: 32, height: 20, borderColor: "rgba(255,255,255,0.5)", borderWidth: 1, paddingHorizontal: 0 }}
										circleStyle={{ width: 18, height: 18, backgroundColor: theme.toolbarbg }}
									/>
								</GestureHandlerRootView>
							</Pressable>
						</Animated.View>}
						<TouchableOpacity activeOpacity={0.3} onPress={() => { this.onControlShrinkPress() }}>
							{this.state.isFullScreen ? <Icon name="exitfull" size={18} color="#fff" /> : <Icon name="full" size={18} color="#fff" />}
						</TouchableOpacity>
					</View>
					<Slider
						style={styles.slider_con}
						maximumTrackTintColor={"rgba(255,255,255,0.2)"}
						minimumTrackTintColor={"rgb(183,218,255)"}
						thumbImage={require("../assets/images/player/icon_slider.png")}
						value={this.state.currentTime}
						minimumValue={0}
						maximumValue={this.state.duration}
						onValueChange={(currentTime) => { this.onSliderValueChanged(currentTime) }}
					/>
				</LinearGradient>} */}
			</View>
		)
	}

	/// -------Video组件回调事件-------

	_onLoadStart = () => {
		console.log("%c Line:207 🥐 视频开始加载", "color:#3f7cff");
	};

	_onBuffering = ({ isBuffering }: any) => {
		this.setState({ isBuffering: isBuffering })
	};

	_onLoaded = (data: any) => {
		console.log("%c Line:215 🧀 视频加载完成", "color:#ed9ec7");
		this.setState({
			duration: data.duration,
			isBuffering: false
		});
	};

	_onProgressChanged = (data: any) => {
		// console.log("%c Line:223 🍏 视频进度更新", "color:#7f2b82");
		if (this.state.isPlaying) {
			this.setState({
				currentTime: data.currentTime,
			})
		}
	};

	_onPlayEnd = () => {
		console.log("%c Line:232 🍞 视频播放结束", "color:#33a5ff");
		if (this.state.isRepeat) {
			this.videoRef.seek(0);
			this.setState({
				currentTime: 0,
				isPlaying: true,
				playFromBeginning: true
			});
		} else {
			this.setState({
				isPlaying: false,
				playFromBeginning: true
			});
		}
	};

	_onPlayError = () => {
		console.log("%c Line:249 🌭 视频播放失败", "color:#93c0a4");
	};

	///-------控件点击事件-------

	/// 控制播放器工具栏的显示和隐藏
	hideControl() {
		if (this.state.showControl) {
			this.setState({
				showControl: false,
			})
		} else {
			// 5秒后自动隐藏工具栏
			this.setState({
				showControl: true,
			}, () => {
				// setTimeout(() => {
				// 	this.setState({
				// 		showControl: false
				// 	})
				// }, 5000)
			})
		}
	}

	// 隐藏视频封面
	hidePoster() {
		let isPlay = !this.state.isPlaying;
		this.setState({
			isPlaying: isPlay,
			showPoster: false,
			videoHeight: screenWidth * 1080 / 1920,
		});
	}

	// 点击了工具栏
	onControlMenuPress() {
		let isShowMenu = !this.state.isShowMenu;
		this.setState({
			isShowMenu,
		});
	}

	/// 点击了播放器正中间的播放按钮
	onPressPlayButton() {
		let isPlay = !this.state.isPlaying;
		this.setState({
			isPlaying: isPlay
		});
		if (this.state.playFromBeginning) {
			this.videoRef.seek(0);
			this.setState({
				playFromBeginning: false,
			})
		}
	}

	/// 点击了工具栏上的播放按钮
	onControlPlayPress() {
		this.onPressPlayButton();
	}

	/// 点击了工具栏上的全屏按钮
	onControlShrinkPress() {
		if (!this.state.isFullScreen) {
			this.videoRef.presentFullscreenPlayer();
			Orientation.lockToLandscape();
			this.setState((state: any) => {
				state.isFullScreen = true;
			})
			StatusBar.setHidden(true);
		} else {
			this.videoRef.dismissFullscreenPlayer();
			Orientation.lockToPortrait();
			this.setState((state: any) => {
				state.isFullScreen = false;
			})
			StatusBar.setHidden(false);
		}
		// events.publish(this.state.classname + "fullScreenChange", !this.state.isFullScreen);
	}

	/// 进度条值改变
	onSliderValueChanged(currentTime: number) {
		this.videoRef.seek(currentTime);
		if (this.state.isPlaying) {
			this.setState({
				currentTime: currentTime
			})
		} else {
			this.setState({
				currentTime: currentTime,
				isPlaying: true,
				showPoster: false
			})
		}
	}

	/// 屏幕旋转时宽高会发生变化，可以在onLayout的方法中做处理，比监听屏幕旋转更加及时获取宽高变化
	_onLayout = (event: any) => {
		let { width, height } = event.nativeEvent.layout;
		this.setState({
			videoWidth: width,
			videoHeight: this.state.showPoster ? width * 1080 / 1728 : width * 1080 / 1920,
		})
	};

	/// -------外部调用事件方法-------

	///播放视频，提供给外部调用
	playVideo() {
		this.setState({
			isPlaying: true,
			showPoster: false
		})
	}

	/// 暂停播放，提供给外部调用
	pauseVideo() {
		this.setState({
			isPlaying: false,
		})
	}

	/// 切换视频并可以指定视频开始播放的时间，提供给外部调用
	switchVideo(source: string, seekTime: number) {
		this.setState({
			source,
			currentTime: seekTime,
			isPlaying: true,
			showPoster: false
		});
		this.videoRef.seek(seekTime);
	}
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		backgroundColor: "#000",
		// height: screenWidth * 1080 / 1728,
	},
	video_con: {
		...StyleSheet.absoluteFillObject,
		alignItems: "center",
		justifyContent: "center",
	},
	poster_con: {
		position: "absolute",
	},
	play_con: {
		position: "absolute",
		right: 0,
		bottom: 0,
		marginRight: 25,
		marginBottom: 25,
		width: 72,
		height: 72,
	},
	play_btn: {
		width: "100%",
		height: "100%",
		borderWidth: 6,
		borderColor: "rgba(255,255,255,0.5)",
		borderRadius: 50,
		position: "relative",
		zIndex: 1
	},
	playButton: {
		width: "100%",
		height: "100%",
	},
	ball: {
		position: "absolute",
		width: "100%",
		height: "100%",
		backgroundColor: "red",
		borderRadius: 50,
		zIndex: 0,
	},
	control: {
		position: "absolute",
		left: 0,
		bottom: 0,
		height: 41,
		paddingLeft: 20,
		paddingRight: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	control_btn: {
		flexDirection: "row",
		alignItems: "center",
	},
	time: {
		fontSize: 12,
		color: "white",
	},
	setting1: {
		marginRight: 20,
	},
	setting_con: {
		position: "absolute",
		bottom: 41,
		right: 0,
		width: 150,
		backgroundColor: "rgba(28,28,28,.9)",
		paddingVertical: 7,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 10,
		zIndex: 99,
	},
	setting_item: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		height: 30,
		paddingHorizontal: 10,
		paddingVertical: 5,
	},
	setting_label: {
		fontSize: 13,
		color: "#eee"
	},
	slider_con: {
		position: "absolute",
		width: "auto",
		top: -10,
		left: 7,
		right: 0,
	},
	ripple: {
		position: "absolute",
		backgroundColor: "rgba(205, 205, 205, 0.6)",
		borderRadius: 100,
		width: 100,
		height: 100,
	},
});