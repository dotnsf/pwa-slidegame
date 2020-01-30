# pwa-slidegame

## Overview

So called **Slide 16 Game** with PWA(Progressive Web Application) enabled.


## Demo application URL

https://pwa-slidegame.mybluemix.net/


## How to install demo application

- Open above **Demo application URL** with your **mobile browser**.

- Select **Add to Home screen**

- You will see application icon in your home screen.


## How to play

- Tap application icon in your home screen, then application would be run.

- Choose category from list, and you will see illustrated images for that category in your carousel.

- Choose(Tap) one image, and you will see Slide 15 Puzzle game with selected image.

- If you could clear that game, you will see your moves and seconds for your game, and that would be recorded in remote database.


## Special feature as PWA

- Installed application would **cache** remote HTTP request for offline timing automatically.

- You can play this game even when you are offline(don't have network connection) with above cache. But in that case, you can **NOT** record your result.

  - If you want to play this game offline, you need to cache request and images before.


## How to make this application as PWA.

- Download required remote js and css files in local folder.

- Prepare manifest.json, and specify its path in &lt;head&gt;.

- Prepare pwa_192.png and pwa_512.png, which are required as PWA.

- Prepare serviceworker.js with required information.


## References for PWA

https://32877.xii.jp/view/how-to-PWA-with-Push-Notification-01

https://32877.xii.jp/view/how-to-PWA-with-Push-Notification-02


## Copyright

2020 [K.Kimura @ Juge.Me](https://github.com/dotnsf) all rights reserved.
