#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

#import "RNSplashScreen.h"
#import "Orientation.h"

#import <React/RCTRootView.h>
#if RCT_NEW_ARCH_ENABLED
#import <React/RCTFabricSurfaceHostingProxyRootView.h>
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"nosetime";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

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

- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
	return [Orientation getOrientation];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
