import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "./store"

// 在整个应用程序中使用，而不是简单的 `useDispatch` 和 `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()