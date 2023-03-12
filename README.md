Frontend for [https://github.com/jschoch/ESPels]

preview here: [http://espels.s3-us-west-2.amazonaws.com/index.html]

uses react and websockets to make awesome

# running

the .env should start the npm server on 0.0.0.0
if you are developing you may want a map created, gulp config is in .env


```
npm start
```

# building

```
npm run build
# bundle all files
npx gulp
```

Todo:

 - [] make Jog tab on "new jog" ui default
 - [] convert all json to msgpack
 - [x] lock UI on rapid move
 - [x] add UI lock to "new jog" ui
 - [] Add better landing page and prompt to set mode
 - [?] fix ws reconnections
 - [] move threading into it's own tab
 - [. ] maybe don't have giant single file with code and UI everywhere
 - [] Add angle DRO
 - [] virtual control buttons
 - [x] implement warning/info flash logging to webUI
 - [] mode specific run screens
 - [x] add rapid back with adjustable speed/pitch 
 - [x] when beginning threading store the staring point somewhere, calculate delta when moving offets

Fix: 

1. WS reconnection timer not workig well with react hooks
