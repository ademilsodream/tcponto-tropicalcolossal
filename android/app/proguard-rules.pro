# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Manter números de linha para stack traces legíveis em produção.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ---------------------------------------------------------------------------
# Capacitor
# A ponte JS->nativa resolve plugins e métodos por reflexão. Sem estes keeps, o
# R8 remove/renomeia as classes e o app abre com tela branca.
# ---------------------------------------------------------------------------
-keepattributes *Annotation*, JavascriptInterface, Signature, InnerClasses, EnclosingMethod

-keep class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod public <methods>;
}
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Plugins usados pelo app: App, Device, Geolocation, PushNotifications
-keep class com.capacitorjs.plugins.** { *; }

# Cordova (bridge legado incluído pelo Capacitor)
-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**

# Código da aplicação (MainActivity é instanciada por nome pelo manifest)
-keep class com.tcponto.app.** { *; }

# Firebase / Google Play Services usados pelas push notifications
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**
