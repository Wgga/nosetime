import { Dimensions, NativeEventEmitter } from "react-native";

import cache from "../../hooks/storage/storage";
import http from "../../utils/api/http";
import { ENV } from "../../configs/ENV";

const Winwidth = Dimensions.get("window").width;
const events = new NativeEventEmitter();

class ItemService {

	// hsl转换为rgb
	hslToRgb(h: any, s: any, l: any) {
		h = parseInt(h) / 360;
		s = parseInt(s) / 100;
		l = parseInt(l) / 100;
		let r, g, b;
		if (s === 0) {
			r = g = b = l; // 饱和度为0时，即灰色
		} else {
			const hue2rgb = (p: number, q: number, t: number) => {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1 / 6) return p + (q - p) * 6 * t;
				if (t < 1 / 2) return q;
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			};
			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
	// rgb转换为hsb
	rgbToHsb(r: number, g: number, b: number) {
		r /= 255;
		g /= 255;
		b /= 255;
		let max = Math.max(r, g, b);
		let min = Math.min(r, g, b);
		let delta = max - min;
		let h = 0, s, v = max;
		s = max === 0 ? 0 : delta / max;
		if (max === min) {
			h = 0; // 灰色，无色相
		} else {
			switch (max) {
				case r:
					h = (g - b) / delta + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / delta + 2;
					break;
				case b:
					h = (r - g) / delta + 4;
					break;
			}
			h /= 6;
		}
		return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
	}
	// hsl转换为hsb
	hslToHsb(h: string, s: string, l: string) {
		const rgb = this.hslToRgb(h, s, l);
		return this.rgbToHsb(rgb[0], rgb[1], rgb[2]);
	}
	// 处理hsb
	handlehsb(h: number, s: number, b: number, type: any = null) {
		let s1, b1;
		if (s >= 60) {
			s1 = Math.round(s - (s - 60) / 1.2);
		} else {
			s1 = s;
		}
		if (type) {
			b1 = Math.round(b - (b - 70) / 2) - 5;
		} else {
			b1 = Math.round(b - (b - 70) / 2);
		}
		return [h, s1, b1];
	}
	// hsb转化为hsl
	hsbToHsl(h: number, s: number, b: number) {
		h = h / 360;
		s = s / 100;
		b = b / 100;
		let l = (2 - s) * b / 2;
		if (l !== 0) {
			if (l === 1) {
				s = 0;
			} else if (l < 0.5) {
				s = s * b / (l * 2);
			} else {
				s = s * b / (2 - l * 2);
			}
		}
		return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
	}
}
const itemService = new ItemService();
export default itemService;