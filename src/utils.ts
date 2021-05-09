import { SkeletonBinary } from './spine/runtime/SkeletonBinary3.5.js';
const parse = (data: Uint8Array) => {
  const parser = new SkeletonBinary();
  parser.data = data;
  parser.initJson();
  return parser.json;
};
export function ReqSkelData(path: string) {
  return new Promise((res, rej) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.responseType = 'arraybuffer';
    xhr.onloadend = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        res(parse(new Uint8Array(xhr.response)));
      } else {
        rej(xhr.status);
      }
    };
    xhr.send();
  });
}

export function isMobile() {
  if (
    window.navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i,
    )
  ) {
    return true; // 移动端
  } else {
    return false; // PC端
  }
}
export function isFirefox() {
  return window.navigator.userAgent.indexOf('Firefox') !== -1;
}
// export function rgba2str(color:Color){
//   return `#${color.r.toString(16)}${color.g.toString(16)}${color.b.toString(16)}${color.a.toString(16)}`
// }
export function downloadBlob(b: Blob, filename: string) {
  const url = URL.createObjectURL(b);
  const ele = window.document.createElement('a');
  ele.href = url;
  ele.download = filename + '.webm';
  ele.click();
}