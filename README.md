Frontend for [https://github.com/jschoch/ESPels]

release v0.0.3 build: [http://espels.s3-us-west-2.amazonaws.com/release_0_0_3/index.html]

uses react and websockets to make awesome

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

