Frontend for [https://github.com/jschoch/ESPels]

preview here: [http://espels.s3-us-west-2.amazonaws.com/index.html]

uses react and websockets to make awesome

Todo:

 - [] make Jog tab on "new jog" ui default
 - [] lock UI on rapid move
 - [] add UI lock to "new jog" ui
 - [] Add better landing page and prompt to set mode
 - [] fix ws reconnections
 - [] when "new jog" ui done, make "old jog" ui the threading display
 - [. ] maybe don't have giant single file with code and UI everywhere
 - [] Add angle DRO
 - [] virtual control buttons
 - [] implement warning/info flash logging to webUI
 - [] mode specific run screens
 - [x] add rapid back with adjustable speed/pitch 
 - [x] when beginning threading store the staring point somewhere, calculate delta when moving offets

Fix: 

1. WS reconnection timer not workig well with react hooks
