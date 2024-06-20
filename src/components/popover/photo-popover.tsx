import React from "react";
import { View, StyleSheet, Text } from "react-native";

import Gallery from "react-native-awesome-gallery";

import { ModalPortal } from "../../components/modals";

import theme from "../../configs/theme";

import Icon from "../../assets/iconfont";


const PhotoPopover = React.memo(({ modalparams }: any) => {

	// 控件
	const slideref = React.useRef<any>(null);
	// 参数
	const { slideimglist, key } = modalparams;
	// 变量
	const [currentindex, setCurrentindex] = React.useState<number>(0); // 当前索引
	// 数据
	// 状态

	React.useEffect(() => {
		slideref.current.setIndex(modalparams.slideimgindex, false);
	}, [])

	const closePopover = () => {
		ModalPortal.dismiss(key);
	}

	return (
		<>
			<Gallery ref={slideref} style={{ backgroundColor: "transparent" }}
				data={slideimglist}
				keyExtractor={(item: any) => item}
				initialIndex={currentindex}
				emptySpaceWidth={0}
				disableVerticalSwipe={true}
				onTap={closePopover}
				onIndexChange={React.useCallback((index: number) => {
					setCurrentindex(index);
				}, [])}
			/>
			<View style={styles.pagination}>
				<Text style={styles.pagination_text}>{(currentindex + 1) + " / " + slideimglist.length}</Text>
			</View>
		</>
	);
})

const styles = StyleSheet.create({
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
	}
})

export default PhotoPopover;