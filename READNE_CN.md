这是一个新的[**React Native**](https://reactnative.dev)项目，使用[`@react native community/cli`](https://github.com/react-native-community/cli)引导.

# 入门

>**注意**：确保您已完成[Rreact Native - Environment Setup](https://reactnative.dev/docs/environment-setup)说明，直到 "创建新应用程序" 步骤，然后再继续。

## 步骤1：启动Metro服务器

首先，您需要启动**Metro**，这是 React Native 附带的 JavaScript 捆绑器。

要启动Metro，请从React Native项目的终端运行以下命令：

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## 步骤2：启动应用程序

如果想要 Metro Bundler 在自己的设备中运行。从 React Native 项目的根目录打开一个新终端。运行以下命令以启动 Android 或 iOS 应用：

### Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

如果一切设置正确，您应该很快看到您的应用程序在**Android 模拟器**或**iOS 模拟器**中运行，前提是您正确设置了**模拟器**。

这是运行应用程序的一种方式——您也可以分别从**Android Studio**和**Xcode**中直接运行它。

## 步骤3: 修改应用

现在，你已成功运行该应用，让我们对其进行修改。

在您选择的文本编辑器中打开 `App.tsx` 并编辑一些行。

**Android**：按两次<kbd>R</kbd>键或从 **Developer Menu** 中选择 **"Reload"**（<kbd>Ctrl</kbd> + <kbd>M</kbd> （on Window and Linux） or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> （on macOS））以查看您的更改！

**iOS**：在 iOS 模拟器中点击 <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> 以重新加载应用程序并查看您的更改！

## 祝贺！🎉

您已成功运行并修改了 React Native 应用程序。 🥳

### 现在怎么办？
- 如果你想将这个新的 React Native 代码添加到现有应用程序中，请查看[Integration guide](https://reactnative.dev/docs/integration-with-existing-apps)。
如果你想了解更多关于 React Native 的信息，请查看 [Introduction to React Native](https://reactnative.dev/docs/getting-started)。

# 故障

如果无法实现此功能，请参阅[Troubleshooting](https://reactnative.dev/docs/troubleshooting)页面。

# 了解更多信息

要了解有关 React Native 的更多信息，请查看以下资源：

- [React Native Website](https://reactnative.dev) - 了解有关 React Native 的更多信息。
- [Getting Started](https://reactnative.dev/docs/environment-setup) - React Native 概述以及如何设置环境。
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - React Native 基础知识的导览。
- [Blog](https://reactnative.dev/blog) - 阅读最新的官方 React Native 博客文章。
- [`@facebook/react-native`](https://github.com/facebook/react-native) - 开源 React Native 的 GitHub存储库。
