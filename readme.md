# spine viewer
The next spine viewer for [prts.wiki](http://prts.wiki/w/Widget:Spinev2)
## setup for development
```sh
git clone https://github.com/MooncellWiki/spine-viewer.git
cd spine-viewer
git submodule update --init --recursive
cd material-ui-color
yarn
yarn build
cd ..
yarn 
yarn dev
```
open [Widget:Spinev2/dev](http://prts.wiki/w/Widget:Spinev2/dev)

## todo
- [ ] rm material-ui-color submodule when [this pr](https://github.com/mikbry/material-ui-color/issues/141) released