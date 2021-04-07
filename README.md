Frontend for [https://github.com/jschoch/ESPels]

preview here: [http://espels.s3-us-west-2.amazonaws.com/index.html]

uses react and websockets to make awesome

Todo:

 [x] fix ws reconnections
 [] Make pure threading view
 [x] when beginning threading store the staring point somewhere, calculate delta when moving offets
 [] Add angle DRO
 [] virtual control buttons
 [] send messages, maybe all logging to webUI
 [] mode specific run screens

Fix: 

1. WS reconnection timer not workig well with react hooks
