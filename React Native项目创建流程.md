# 一、 创建项目
```bash
npx react-native@latest init nosetime
```

# 二、 安装依赖

Android从React Native 0.60及更高版本开始，插件依赖的链接是自动的。所以不需要运行 `react-native link`

如果你在Mac上开发iOS，你需要安装pod（通过Cocoapods）来完成插件依赖的链接。

```bash
npx pod-install ios
```

### 1. React Navigation

React Navigation是一个为App提供一种在屏幕之间转换和管理导航历史记录的库。

```bash
# using npm
npm install @react-navigation/native
npm install react-native-screens react-native-safe-area-context
npm install @react-navigation/native-stack

# OR using Yarn
yarn add @react-navigation/native
yarn add react-native-screens react-native-safe-area-context
yarn add @react-navigation/native-stack
```

`react-native-screens` 需要一个额外的配置步骤才能在Android设备上正常工作。编辑 `MainActivity.kt` 或 `MainActivity.java` 文件，该文件位于 `android/app/src/main/java/<your package name>/` 路径下。

将以下代码添加到`MainActivity`类的主体中：

```
// Kotlin
class MainActivity: ReactActivity() {
  // ...
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
  // ...
}

// Java
public class MainActivity extends ReactActivity {
  // ...
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);
  }
  // ...
}
```

并确保在包语句下面的文件顶部添加导入语句 `import android.os.Bundle;`


#### 2. Bottom Tabs Navigator

屏幕底部的一个简单的标签栏，可让您在不同的路线之间切换。

```bash
# using npm
npm install @react-navigation/bottom-tabs

# OR using Yarn
yarn add @react-navigation/bottom-tabs
```


### 3. React Native SVG

React Native自带的`Image`组件无法渲染SVG，因此需要使用React Native SVG 在React Native项目中渲染SVG。

```bash
# using npm
npm install react-native-svg
npm install react-native-svg-transformer

# OR using Yarn
yarn add react-native-svg
yarn add react-native-svg-transformer
```


### 4. React Native Vector Icons

React Native Vector Icons是一个为React Native项目提供图标的库。可以使用`Icon`组件来渲染自定义图标。

```bash
# using npm
npm install react-native-vector-icons @types/react-native-vector-icons

# OR using Yarn
yarn add react-native-vector-icons @types/react-native-vector-icons
```

要使Android上的字体管理更流畅，请使用以下方法：

在 `android/app/build.gradle` 文件添加：

```gradle
apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")
```

要使用自定义的字体，请在 `android/app/build.gradle` 文件添加：

```gradle
project.ext.vectoricons = [
    iconFontNames: [ 'iconfont.ttf' ] // Specify font files
]
```

以下步骤是可选的，仅当您打算使用Icon.getImageSource函数时才是必要的。

1. 在 `android/settings.gradle` 文件中，进行以下添加：

```gradle
include ':react-native-vector-icons'
project (':react-native-vector-icons').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-vector-icons/android')
```

2. 在 `android/app/build.gradle` 文件中，添加 `:react-native-vector-icons` 启动屏幕项目作为编译时依赖项：

```gradle
...
dependencies {
    ...
    implementation project(':react-native-vector-icons')
}
```

### 5. Emotion Native

Emotion Native是一个为React Native项目提供样式的库。可以避免使用`StyleSheet`，使用`css`函数来定义样式。

```bash
# using npm
npm install @emotion/react @emotion/native

# OR using Yarn
yarn add @emotion/react @emotion/native
```


### 6. @homielab/react-native-auto-scroll

自动水平滚动文字，应用场景：公告轮播文字

```bash
# using npm
npm install @homielab/react-native-auto-scroll

# OR using Yarn
yarn add @homielab/react-native-auto-scroll
```


### 7. React Native Storage

这是一个本地持久存储的封装，可以同时支持 react-native(AsyncStorage)和浏览器(localStorage)。ES6 语法，promise 异步读取，使用 jest 进行了完整的单元测试。

```bash
# using npm
npm install react-native-storage
npm install @react-native-async-storage/async-storage

# OR using Yarn
yarn add react-native-storage
yarn add @react-native-async-storage/async-storage
```


### 8. Axios

基于 Promise 的浏览器和 node.js HTTP 客户端

```bash
# using npm
npm install axios

# OR using Yarn
yarn add axios
```

### 9. React Native Gesture Handler

Gesture Handler 旨在取代 React Native 的内置触摸系统

```bash
# using npm
npm install react-native-gesture-handler

# OR using Yarn
yarn add react-native-gesture-handler
```


### 10. React Native Linear Gradient

Linear Gradient 是一个为React Native项目提供渐变色的库

```bash
# using npm
npm install react-native-linear-gradient

# OR using Yarn
yarn add react-native-linear-gradient
```


### 11. React Native Orientation Locker

一个 react-native 模块，可以监听设备的方向变化，获取当前方向，锁定到首选方向。

```bash
# using npm
npm install react-native-orientation-locker

# OR using Yarn
yarn add react-native-orientation-locker
```

iOS

将以下内容添加到项目的AppDelegate.m中：

```obj-c
+ #import "Orientation.h"

@implementation AppDelegate

// ...

+ - (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
+   return [Orientation getOrientation];
+ }

@end
```

Android

将以下内容添加到android/app/src/main/AndroidManifest.xml
```xml
      <activity
        ....
+       android:configChanges="keyboard|keyboardHidden|orientation|screenSize"
        android:windowSoftInputMode="adjustResize">

          ....

      </activity>

```

实现onConfigurationChanged方法（在MainActivity.java中）

```Java
// ...

+ import android.content.Intent;
+ import android.content.res.Configuration;

public class MainActivity extends ReactActivity {

+    @Override
+    public void onConfigurationChanged(Configuration newConfig) {
+        super.onConfigurationChanged(newConfig);
+        Intent intent = new Intent("onConfigurationChanged");
+        intent.putExtra("newConfig", newConfig);
+        this.sendBroadcast(intent);
+    }

    // ......
}
```

将以下内容添加到MainApplication.java

```Java
+ import org.wonday.orientation.OrientationActivityLifecycle;
  @Override
  public void onCreate() {
+     registerActivityLifecycleCallbacks(OrientationActivityLifecycle.getInstance());
  }
```

### 12. React Native Reanimated

React Native Reanimated 是由 Software Mansion 构建的强大动画库。

使用 Reanimated，您可以轻松创建在 UI 线程上运行的流畅动画和交互。

```bash
# using npm
npm install react-native-reanimated

# OR using Yarn
yarn add react-native-reanimated
```


### 13. React Native Splash Screen

用于 react-native 的启动屏幕 API，它可以通过编程方式隐藏和显示启动屏幕。适用于 iOS 和 Android。

```bash
# using npm
npm install react-native-splash-screen

# OR using Yarn
yarn add react-native-splash-screen
```

Android

1. 在 `android/settings.gradle` 文件中，进行以下添加：

```gradle
include ':react-native-splash-screen'
project(':react-native-splash-screen').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-splash-screen/android')
```

2. 在 `android/app/build.gradle` 文件中，添加 `:react-native-splash-screen` 启动屏幕项目作为编译时依赖项：

```gradle
...
dependencies {
    ...
    implementation project(':react-native-splash-screen')
}
```

通过以下更改更新 `MainActivity.java` 以使用 `react-native-splash-screen`

```Java
+ import android.os.Bundle;
import com.facebook.react.ReactActivity;
// react-native-splash-screen >= 0.3.1
import org.devio.rn.splashscreen.SplashScreen;  // here
// react-native-splash-screen < 0.3.1
import com.cboy.rn.splashscreen.SplashScreen;  // here

public class MainActivity extends ReactActivity {
   @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this);  // here
        super.onCreate(savedInstanceState);
    }
    // ...other code
}
```

在 `app/src/main/res/layout` 中创建一个名为 `launch_screen.xml` 的文件（如果 `layout` 文件夹不存在，则创建该文件夹）。文件的内容应如下所示：

```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:orientation="vertical" android:layout_width="match_parent"
    android:layout_height="match_parent">
    <ImageView android:layout_width="match_parent" android:layout_height="match_parent" android:src="@drawable/launch_screen" android:scaleType="centerCrop" />
</RelativeLayout>
```

通过创建一个 `launch_screen.png` 文件并将其放在适当的 `drawable` 文件夹中，自定义启动屏幕。Android自动缩放可绘制，因此您不一定需要提供所有手机密度的图像。

您可以在以下文件夹中创建启动屏幕：

* `drawable-ldpi`
* `drawable-mdpi`
* `drawable-hdpi`
* `drawable-xhdpi`
* `drawable-xxhdpi`
* `drawable-xxxhdpi`

如果您希望启动屏幕是透明的，请执行以下步骤。

打开 `android/app/src/main/res/values/styles.xml` 并将 `<item name="android:windowIsTranslucent">true</item>` 添加到文件中。它应该是这样的：

```xml
<resources>
    <!-- Base application theme. -->
    <style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">
        <!-- Customize your theme here. -->
        <!--设置透明背景-->
        <item name="android:windowIsTranslucent">true</item>
    </style>
</resources>
```

如果要在显示启动屏幕时自定义状态栏的颜色：

创建 `android/app/src/main/res/values/colors.xml` 并添加

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="status_bar_color">#00000000</color>
</resources>
```

在 `android/app/src/main/res/values/styles.xml` 中为此创建样式定义：

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="SplashScreenTheme" parent="SplashScreen_SplashTheme">
        <item name="colorPrimary">@color/status_bar_color</item>
        <item name="colorPrimaryDark">@color/status_bar_color</item>
        <item name="colorAccent">@color/status_bar_color</item>
    </style>
</resources>
```

IOS

使用以下添加内容更新AppDelegate.m：

```obj-c
#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import "RNSplashScreen.h"

#import <React/RCTRootView.h>
#if RCT_NEW_ARCH_ENABLED
#import <React/RCTFabricSurfaceHostingProxyRootView.h>
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // ...other code

    bool didLaunchFinish = [super application:application didFinishLaunchingWithOptions:launchOptions];

    if (didLaunchFinish) {
        UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;

        // Force disable dark mode
        if (@available(iOS 13.0, *)) {
        rootViewController.view.overrideUserInterfaceStyle = UIUserInterfaceStyleLight;
        }

        // change rootView background
        rootViewController.view.backgroundColor = [[UIColor alloc] initWithRed:0.0f green:0.0f blue:0.0f alpha:1];
    }

    [RNSplashScreen show];

    return didLaunchFinish;
}

- (UIView *)createRootViewWithBridge:(RCTBridge *)bridge
                          moduleName:(NSString *)moduleName
                           initProps:(NSDictionary *)initProps
{
  UIView * view = [super createRootViewWithBridge:bridge moduleName:moduleName initProps:initProps];

#if RCT_NEW_ARCH_ENABLED
  RCTFabricSurfaceHostingProxyRootView * rootView = (RCTFabricSurfaceHostingProxyRootView *)view;
#else
  RCTRootView * rootView = (RCTRootView *)view;
#endif

  // workaround:
  UIStoryboard *sb = [UIStoryboard storyboardWithName:@"LaunchScreen" bundle:nil];
  UIViewController *vc = [sb instantiateInitialViewController];
  rootView.loadingView = vc.view;

  return rootView;
}

@end

```

通过 `LaunchScreen.storyboard` 或 `LaunchScreen.xib` 自定义启动屏幕

**了解更多信息 [examples](https://github.com/crazycodeboy/react-native-splash-screen/tree/master/examples)**

- [via LaunchScreen.storyboard Tutorial](https://github.com/crazycodeboy/react-native-splash-screen/blob/master/add-LaunchScreen-tutorial-for-ios.md)


### 14. React Native Stars

react-native-stars 是一个多功能的 React Native Star Review 组件，具有半星兼容性和自定义图像、星形大小、星数、星间距和值显示。

```bash
# using npm
npm install react-native-stars

# OR using Yarn
yarn add react-native-stars
```


### 15. React Native Tab View

React Native Tab View 是 React Native 的跨平台 Tab View 组件。

```bash
# using npm
npm install react-native-tab-view
npm install react-native-pager-view

# OR using Yarn
yarn add react-native-tab-view
yarn add react-native-pager-view
```


### 16. React Native Video

React Native Video 是 React Native 的播放视频组件。

```bash
# using npm
npm install react-native-video @types/react-native-video

# OR using Yarn
yarn add react-native-video @types/react-native-video
```

Android

1. 在 `android/settings.gradle` 文件中，进行以下添加：

```gradle
include ':react-native-video'
project (':react-native-video').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-video/android')
```

2. 在 `android/app/build.gradle` 文件中，添加 `:react-native-video` 启动屏幕项目作为编译时依赖项：

```gradle
...
dependencies {
    ...
    implementation project(':react-native-video')
}
```

3. 在 `android/build.gradle` 文件中设置以下变量来禁用或启用以下功能：

useExoplayerIMA-启用Google IMA SDK（广告支持）

useExoplayerRtsp-启用RTSP支持

useExoplayerSmoothStreaming-启用SmoothStreaming-支持

useExoplayerDash-启用Dash支持

useExoplayerHls-启用HLS支持

这些功能中的每一个都会增加APK的大小，所以只启用您需要的功能。默认情况下，启用的功能包括：`useExoplayerSmoothStreaming`、`useExopplayerDash`、`useExoplayerHls`


### 17. React Native WebView

React Native WebView 是 React Native 的社区维护的 WebView 组件。它旨在替代内置的 WebView

```bash
# using npm
npm install react-native-webview

# OR using Yarn
yarn add react-native-webview
```


### 18. TS MD5

TypeScript 的 MD5 实现。

```bash
# using npm
npm install ts-md5

# OR using Yarn
yarn add ts-md5
```


### 19. @react-native-community/slider

@react-native-community/slider 是一个 React Native 进度条滑动组件。

```bash
# using npm
npm install @react-native-community/slider

# OR using Yarn
yarn add @react-native-community/slider
```


### 20. React Native Device Info

React Native Device Info 是一个用于获取有关设备的信息的 React Native 库

```bash
# using npm
npm install react-native-device-info

# OR using Yarn
yarn add react-native-device-info
```

如果你想使用Install Referrer跟踪，你需要将此配置添加到Proguard配置中

```properties
# 添加到 proguard-rules.pro 文件中
-keep class com.android.installreferrer.api.** {
  *;
}
```

如果您在发布的apk上遇到hasGms（）问题，请将以下规则添加到Proguard配置中

```properties
# 添加到 proguard-rules.pro 文件中
-keep class com.google.android.gms.common.** {*;}
```

### 21. react-native-blurhash

react-native-blurhash 是一个 React Native 模糊效果组件。

```bash
# using npm
npm install react-native-blurhash

# OR using Yarn
yarn add react-native-blurhash
```

### 22. @shopify/flash-list

@shopify/flash-list 是一个 快速和高性能的 React Native 列表组件。

```bash
# using npm
npm install @shopify/flash-list

# OR using Yarn
yarn add @shopify/flash-list
```

### 23. FastImage

FastImage 是一个用于 React Native 的快速图像组件。在很大程度上像浏览器一样处理图像缓存。

```bash
# using npm
npm install react-native-fast-image

# OR using Yarn
yarn add react-native-fast-image
```

### 24. react-native-fast-shadow

react-native-fast-shadow 是一个用于 React Native 的快速高质量Android阴影组件。

```bash
# using npm
npm install react-native-fast-shadow

# OR using Yarn
yarn add react-native-fast-shadow
```

### 25. react-native-image-viewing

react-native-image-viewing 是一个用于 React Native 的图像查看器组件。

```bash
# using npm
npm install react-native-image-viewing

# OR using Yarn
yarn add react-native-image-viewing
```

### 26. react-native-reanimated-carousel

react-native-reanimated-carousel 是一个用于 React Native 的可定制的轮播组件。

```bash
# using npm
npm install react-native-reanimated-carousel

# OR using Yarn
yarn add react-native-reanimated-carousel
```

### 27. react-native-text-size

react-native-text-size 是一个用于 React Native 在布局之前准确测量文本，并从应用程序（Android和iOS）中获取字体信息组件。

```bash
# using npm
npm install react-native-text-size

# OR using Yarn
yarn add react-native-text-size
```

### 28. react-native-system-navigation-bar

react-native-system-navigation-bar 是一个用于 React Native 的系统导航栏组件, 允许您自定义 Android 的系统导航栏。

```bash
# using npm
npm install react-native-system-navigation-bar

# OR using Yarn
yarn add react-native-system-navigation-bar
```


# 三、 打包 release APK
```bash
cd ./android

./gradlew assembleRelease
```