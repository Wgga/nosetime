// @flow

import React, { Children, cloneElement } from 'react';
import { View, StyleSheet, PixelRatio } from 'react-native';
import type { ModalFooterProps } from '../type';

const styles = StyleSheet.create({
	border: {
		borderColor: '#CCD0D5',
		borderTopWidth: 1 / PixelRatio.get(),
	},
	actionsVertical: {
		height: 200,
		flexDirection: 'column',
	},
	actionsHorizontal: {
		flexDirection: 'row',
	},
});

const ModalActionList = ({
	style,
	children,
	bordered = true,
}: ModalFooterProps) => {
	const containerStyle = children.length > 2
		? styles.actionsVertical
		: styles.actionsHorizontal;

	const border = bordered
		? styles.border
		: null;

	// apply horizontal border if actions legnth is 2 & bordered is true
	const content = children.length === 2
		? Children.map(children, ((child, index) => cloneElement(child, {
			bordered: (1 % index === 0 && bordered),
		})))
		: children;

	return (
		<View style={[containerStyle, border, style]}>
			{content}
		</View>
	);
};

export default ModalActionList;
