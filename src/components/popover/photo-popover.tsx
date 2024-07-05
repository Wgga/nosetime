import React from "react";
import { View, StyleSheet, Text, Image, Dimensions, Pressable } from "react-native";

import FastImage from "react-native-fast-image";
import Carousel from "react-native-reanimated-carousel";
import { LongPressGestureHandler } from "react-native-gesture-handler";

import { ModalPortal } from "../../components/modals";

import theme from "../../configs/theme";

import Icon from "../../assets/iconfont";
import AutoSizeImage from "../autosizeimage";
import ActionSheetCtrl from "../actionsheetctrl";
import AlertCtrl from "../alertctrl";
import http from "../../utils/api/http";
import ToastCtrl from "../toastctrl";
import { ENV } from "../../configs/ENV";
import us from "../../services/user-service/user-service";
import events from "../../hooks/events";

const { width, height } = Dimensions.get("window");

const PhotoPopover = React.memo(({ modalparams }: any) => {

	// 控件
	const slideref = React.useRef<any>(null);
	// 参数
	const { slideimglist, key, slideimgindex } = modalparams;
	// 变量
	const [currentindex, setCurrentIndex] = React.useState<number>(slideimgindex); // 当前索引
	// 数据
	// 状态

	React.useEffect(() => {
	}, [])

	const closePopover = () => {
		ModalPortal.dismiss(key);
	}

	const openAlert = (item: any, index: number) => {
		ActionSheetCtrl.show({
			key: "delphoto_action_sheet",
			textStyle: { color: "#262626" },
			buttons: [{
				text: "删除",
				handler: () => {
					ActionSheetCtrl.close("delphoto_action_sheet");
					remove(index, item)
				}
			}, {
				text: "取消",
				handler: () => {
					ActionSheetCtrl.close("delphoto_action_sheet");
				}
			}],
		})
	}

	const remove = (index: number, item: any) => {
		AlertCtrl.show({
			header: "确定要删除吗？",
			key: "del_photo_alert",
			message: "",
			buttons: [{
				text: "取消",
				handler: () => {
					AlertCtrl.close("del_photo_alert");
					_remove(index, item);
				}
			}, {
				text: "确定",
				handler: () => {
					AlertCtrl.close("del_photo_alert");
				}
			}],
		})
	}

	const _remove = (index: number, item: any) => {
		http.post(ENV.pic + "?uid=" + us.user.uid, { token: us.user.token, method: "mediahideablum", mid: item.replace(/[^0-9]/g, "") }).then((resp_data: any) => {
			if (resp_data.msg == 'OK') {
				slideimglist.splice(index, 1);
				if (slideimglist.length == 0) closePopover();
				ToastCtrl.show({ message: "图片已从相册删除", duration: 2000, viewstyle: "medium_toast", key: "delphoto_success_toast" });
				events.publish('remove_userphoto');
			} else if (resp_data.msg == 'TOKEN_ERR' || resp_data.msg == 'TOKEN_EXPIRE') {
				us.delUser();
			} else {
				AlertCtrl.show({
					header: "删除失败!",
					key: "del_photo_error_alert",
					message: resp_data.msg,
					buttons: [{
						text: "取消",
						handler: () => {
							AlertCtrl.close("del_photo_error_alert");
							_remove(index, item);
						}
					}, {
						text: "确定",
						handler: () => {
							AlertCtrl.close("del_photo_error_alert");
						}
					}],
				})
			}
		});
	}

	return (
		<>
			<Carousel
				width={width}
				data={slideimglist}
				defaultIndex={slideimgindex}
				autoPlayInterval={3000}
				scrollAnimationDuration={500}
				autoPlay={false}
				loop={false}
				panGestureHandlerProps={{
					activeOffsetX: [-10, 10],
				}}
				onSnapToItem={(index: number) => {
					setCurrentIndex(index);
				}}
				renderItem={({ item, index }: any) => (
					<LongPressGestureHandler>
						<Pressable key={item.code} onPress={closePopover} style={{ justifyContent: "center", flex: 1 }}>
							<View style={styles.image_con}>
								<View style={{ alignItems: "flex-end" }}>
									{key == "user_photo_popover" && <Icon name="sandian1" size={20} color={theme.toolbarbg}
										style={styles.ellipsis}
										onPress={() => { openAlert(item, index) }} />}
									<AutoSizeImage style={{ width: "100%", minHeight: 100, maxHeight: 520 }} uri={item} />
								</View>
							</View>
						</Pressable>
					</LongPressGestureHandler>
				)}
			/>
			<View style={styles.pagination}>
				<Text style={styles.pagination_text}>{(currentindex + 1) + " / " + slideimglist.length}</Text>
			</View>
		</>
	);
})

const styles = StyleSheet.create({
	image_con: {
		width,
		justifyContent: "center",
		alignItems: "center",
	},
	pagination: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 50,
		justifyContent: "center",
		alignItems: "center"
	},
	pagination_text: {
		fontSize: 20,
		color: theme.toolbarbg
	},
	ellipsis: {
		width: 30,
		height: 30,
		textAlign: "center",
		lineHeight: 30,
	}
})

export default PhotoPopover;