export function isMobile(): boolean {
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
export function isFirefox(): boolean {
  return window.navigator.userAgent.indexOf('Firefox') !== -1;
}
// export function rgba2str(color:Color){
//   return `#${color.r.toString(16)}${color.g.toString(16)}${color.b.toString(16)}${color.a.toString(16)}`
// }
export function downloadBlob(b: Blob, filename: string): void {
  const url = URL.createObjectURL(b);
  const ele = window.document.createElement('a');
  ele.href = url;
  ele.download = filename + '.webm';
  ele.click();
}
