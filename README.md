Frontend for [https://github.com/jschoch/ESPels]

release v0.0.6 build: Only currently working on Firefox (PC) or "Firefox Beta" (google play store)

Latest build
http://espels.s3.us-west-2.amazonaws.com/dev_06/index-cors5.html

uses react websockets and EventSource SSE

Updated to use React 18 and Node v20.11.0

# running

the .env should start the npm server on 0.0.0.0
if you are developing you may want a map created, gulp config is in .env


```
npm start
```

# building

```
# install serve to serve production build

#build local
npm run build

#build optimized production
npm run build -p

#run built production

serve ./build 
# bundle all files
npx gulp
```

# updated version 

this is living in your ubuntu wsl 22 instance
`/home/schoch/dev/espELSfrontend`

