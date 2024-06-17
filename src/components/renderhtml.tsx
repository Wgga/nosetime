import React, { PureComponent } from "react";
import { Pressable, Text, View } from "react-native";
import { parseDocument, ElementType } from "htmlparser2";
import FastImage from "react-native-fast-image";

interface RenderHtmlProps {
	contentWidth: number;
	html: string;
	tagsStyles?: any;
	ignoreDomNode?: (node: any) => boolean;
	onPress?: any;
}

interface WrapperProps {
	children?: React.ReactNode;
	key?: number;
	style?: any;
}

export default class RenderHtml extends PureComponent<RenderHtmlProps> {

	textTags: any[] = ["span", "strong", "em"];
	tagsStyles: any = {
		p: { fontSize: 16, lineHeight: 24 },
		strong: { fontWeight: "bold", fontFamily: "PingFang SC" }
	}

	constructor(props: any) {
		super(props);
		if (props.tagsStyles) {
			this.tagsStyles = { ...this.tagsStyles, ...props.tagsStyles };
		}
	}


	renderTextNode(textNode: any, index: number) {
		return <Text key={index} style={this.tagsStyles[textNode.name]}>{textNode.data}</Text>;
	}

	renderElement(element: any, index: number) {
		if (typeof this.props.ignoreDomNode === "function" && this.props.ignoreDomNode(element)) {
			return null;
		}

		const Wrapper: React.ComponentType<WrapperProps> = this.textTags.indexOf(element.name) > -1 ? Text : View;

		if (element.name === "img" && element.parent.name != "a") {
			return (
				this.rederImage(element, index)
			)
		} else if (element.name === "a") {
			return (
				this.renderLink(element, index)
			)
		} else {
			return (
				<Wrapper key={index} style={this.tagsStyles[element.name]}>
					{element.children.map((c: any, i: number) => this.renderNode(c, i))}
				</Wrapper>
			);
		}

	}

	renderLink(node: any, index: number) {
		let href = node.attribs.href;
		let obj = JSON.parse(href.substr(href.indexOf("?") + 1).replace(/%22/g, '"'));
		return (
			<Pressable key={index} onPress={() => {
				console.log("%c Line:63 🍐", "color:#4fff4B");
			}}>
				<Text>{href}</Text>
				{node.children.map((c: any, i: number) => this.renderNode(c, i))}
			</Pressable>
		)
	}

	rederImage(node: any, index: number) {
		let imgWH: any[] = [],
			tempW: number = this.props.contentWidth,
			tempH: number = 0;
		let cover = node.attribs.src;
		if (cover) {
			imgWH = cover.split(/S(\d+)x(\d+)/g);
			if (imgWH) {
				tempH = imgWH[2] * tempW / imgWH[1];
			}
		}
		return (
			<FastImage key={index} style={{ width: tempW, height: tempH }}
				source={{ uri: cover }} />
		)
	}

	renderNode(node: any, index: number) {
		switch (node.type) {
			case ElementType.Text:
				return this.renderTextNode(node, index);
			case ElementType.Tag:
				return this.renderElement(node, index);
		}
		return null;
	}

	render() {
		const document = parseDocument(this.props.html);
		return document.children.map((c, i) => {
			const val = this.renderNode(c, i);
			console.log("%c Line:85 🍊 val", "color:#2eafb0", val);
			return val
		});
	}
}