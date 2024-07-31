import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";

// 为 slice state 定义一个类型
interface PerfumeState {
	value: number;
}

// 使用该类型定义初始 state
const initialState: PerfumeState = {
	value: 0,
};

export const PerfumeSlice = createSlice({
	name: "perfume",
	// `createSlice` 将从 `initialState` 参数推断 state 类型
	initialState,
	reducers: {

	},
});

export const { } = PerfumeSlice.actions;
// 选择器等其他代码可以使用导入的 `RootState` 类型
export const selectCount = (state: RootState) => state.perfume.value;

export default PerfumeSlice.reducer;