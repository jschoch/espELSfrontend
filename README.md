Frontend for [https://github.com/jschoch/ESPels]

preview here: [http://espels.s3-us-west-2.amazonaws.com/index.html]

uses react and websockets to make awesome

Todo:

 [] Add better landing page and prompt to set mode
 [] fix ws reconnections
 [] add rapid back with adjustable speed/pitch
 [] maybe don't have giant single file with code and UI everywhere
 [] Make pure threading view
 [x] when beginning threading store the staring point somewhere, calculate delta when moving offets
 [] Add angle DRO
 [] virtual control buttons
 [] implement warning/info flash logging to webUI
 [] mode specific run screens

Fix: 

1. WS reconnection timer not workig well with react hooks
