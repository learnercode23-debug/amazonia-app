/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)` | `/(auth)/name` | `/(auth)/otp` | `/(auth)/phone` | `/(auth)/welcome` | `/(tabs)` | `/(tabs)/` | `/(tabs)/cart` | `/(tabs)/orders` | `/(tabs)/products` | `/(tabs)/profile` | `/_sitemap` | `/cart` | `/name` | `/orders` | `/otp` | `/phone` | `/products` | `/profile` | `/welcome`;
      DynamicRoutes: `/product/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/product/[id]`;
    }
  }
}
