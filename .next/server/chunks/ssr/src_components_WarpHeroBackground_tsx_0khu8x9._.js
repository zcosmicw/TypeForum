module.exports=[59790,a=>{"use strict";var b=a.i(87924),c=a.i(72131);let d=`#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);


  // ===================================================

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  // ===================================================

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  #ifdef ADD_HELPERS
  v_responsiveHelperBox = uv;
  v_responsiveHelperBox *= responsiveBoxScale;
  v_responsiveHelperBox += boxOrigin * (responsiveBoxScale - 1.);
  #endif

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  v_patternUV *= .01;

  // ===================================================

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`,e=8294400;class f{parentElement;canvasElement;gl;program=null;uniformLocations={};fragmentShader;rafId=null;lastRenderTime=0;currentFrame=0;speed=0;currentSpeed=0;providedUniforms;mipmaps=[];hasBeenDisposed=!1;resolutionChanged=!0;textures=new Map;minPixelRatio;maxPixelCount;isSafari=(function(){let a=navigator.userAgent.toLowerCase();return a.includes("safari")&&!a.includes("chrome")&&!a.includes("android")})();uniformCache={};textureUnitMap=new Map;ownerDocument;constructor(a,b,c,d,f=0,g=0,i=2,j=e,k=[]){if(a?.nodeType===1)this.parentElement=a;else throw Error("Paper Shaders: parent element must be an HTMLElement");if(this.ownerDocument=a.ownerDocument,!this.ownerDocument.querySelector("style[data-paper-shader]")){const a=this.ownerDocument.createElement("style");a.innerHTML=h,a.setAttribute("data-paper-shader",""),this.ownerDocument.head.prepend(a)}const l=this.ownerDocument.createElement("canvas");this.canvasElement=l,this.parentElement.prepend(l),this.fragmentShader=b,this.providedUniforms=c,this.mipmaps=k,this.currentFrame=g,this.minPixelRatio=i,this.maxPixelCount=j;const m=l.getContext("webgl2",d);if(!m)throw Error("Paper Shaders: WebGL is not supported in this browser");this.gl=m,this.initProgram(),this.setupPositionAttribute(),this.setupUniforms(),this.setUniformValues(this.providedUniforms),this.setupResizeObserver(),visualViewport?.addEventListener("resize",this.handleVisualViewportChange),this.setSpeed(f),this.parentElement.setAttribute("data-paper-shader",""),this.parentElement.paperShaderMount=this,this.ownerDocument.addEventListener("visibilitychange",this.handleDocumentVisibilityChange)}initProgram=()=>{let a=function(a,b,c){let d=a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.MEDIUM_FLOAT),e=d?d.precision:null;e&&e<23&&(b=b.replace(/precision\s+(lowp|mediump)\s+float;/g,"precision highp float;"),c=c.replace(/precision\s+(lowp|mediump)\s+float/g,"precision highp float").replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g,"$1 highp $3"));let f=g(a,a.VERTEX_SHADER,b),h=g(a,a.FRAGMENT_SHADER,c);if(!f||!h)return null;let i=a.createProgram();return i?(a.attachShader(i,f),a.attachShader(i,h),a.linkProgram(i),a.getProgramParameter(i,a.LINK_STATUS))?(a.detachShader(i,f),a.detachShader(i,h),a.deleteShader(f),a.deleteShader(h),i):(console.error("Unable to initialize the shader program: "+a.getProgramInfoLog(i)),a.deleteProgram(i),a.deleteShader(f),a.deleteShader(h),null):null}(this.gl,d,this.fragmentShader);a&&(this.program=a)};setupPositionAttribute=()=>{let a=this.gl.getAttribLocation(this.program,"a_position"),b=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,b),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),this.gl.STATIC_DRAW),this.gl.enableVertexAttribArray(a),this.gl.vertexAttribPointer(a,2,this.gl.FLOAT,!1,0,0)};setupUniforms=()=>{let a={u_time:this.gl.getUniformLocation(this.program,"u_time"),u_pixelRatio:this.gl.getUniformLocation(this.program,"u_pixelRatio"),u_resolution:this.gl.getUniformLocation(this.program,"u_resolution")};Object.entries(this.providedUniforms).forEach(([b,c])=>{if(a[b]=this.gl.getUniformLocation(this.program,b),c instanceof HTMLImageElement){let c=`${b}AspectRatio`;a[c]=this.gl.getUniformLocation(this.program,c)}}),this.uniformLocations=a};renderScale=1;parentWidth=0;parentHeight=0;parentDevicePixelWidth=0;parentDevicePixelHeight=0;devicePixelsSupported=!1;resizeObserver=null;setupResizeObserver=()=>{this.resizeObserver=new ResizeObserver(([a])=>{if(a?.borderBoxSize[0]){let b=a.devicePixelContentBoxSize?.[0];void 0!==b&&(this.devicePixelsSupported=!0,this.parentDevicePixelWidth=b.inlineSize,this.parentDevicePixelHeight=b.blockSize),this.parentWidth=a.borderBoxSize[0].inlineSize,this.parentHeight=a.borderBoxSize[0].blockSize}this.handleResize()}),this.resizeObserver.observe(this.parentElement)};handleVisualViewportChange=()=>{this.resizeObserver?.disconnect(),this.setupResizeObserver()};handleResize=()=>{let a=0,b=0,c=Math.max(1,window.devicePixelRatio),d=visualViewport?.scale??1;if(this.devicePixelsSupported){let e=Math.max(1,this.minPixelRatio/c);a=this.parentDevicePixelWidth*e*d,b=this.parentDevicePixelHeight*e*d}else{var e;let f,g,h=Math.max(c,this.minPixelRatio)*d;this.isSafari&&(h*=Math.max(1,(e=this.ownerDocument,(g=Math.round(100*(f=outerWidth/((visualViewport?.scale??1)*(visualViewport?.width??window.innerWidth)+(window.innerWidth-e.documentElement.clientWidth)))))%5==0?g/100:33===g?1/3:67===g?2/3:133===g?4/3:f))),a=Math.round(this.parentWidth)*h,b=Math.round(this.parentHeight)*h}let f=Math.min(1,Math.sqrt(this.maxPixelCount)/Math.sqrt(a*b)),g=Math.round(a*f),h=Math.round(b*f),i=g/Math.round(this.parentWidth);(this.canvasElement.width!==g||this.canvasElement.height!==h||this.renderScale!==i)&&(this.renderScale=i,this.canvasElement.width=g,this.canvasElement.height=h,this.resolutionChanged=!0,this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),this.render(performance.now()))};render=a=>{if(this.hasBeenDisposed)return;if(null===this.program)return void console.warn("Tried to render before program or gl was initialized");let b=a-this.lastRenderTime;this.lastRenderTime=a,0!==this.currentSpeed&&(this.currentFrame+=b*this.currentSpeed),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.gl.useProgram(this.program),this.gl.uniform1f(this.uniformLocations.u_time,.001*this.currentFrame),this.resolutionChanged&&(this.gl.uniform2f(this.uniformLocations.u_resolution,this.gl.canvas.width,this.gl.canvas.height),this.gl.uniform1f(this.uniformLocations.u_pixelRatio,this.renderScale),this.resolutionChanged=!1),this.gl.drawArrays(this.gl.TRIANGLES,0,6),0!==this.currentSpeed?this.requestRender():this.rafId=null};requestRender=()=>{null!==this.rafId&&cancelAnimationFrame(this.rafId),this.rafId=requestAnimationFrame(this.render)};setTextureUniform=(a,b)=>{if(!b.complete||0===b.naturalWidth)throw Error(`Paper Shaders: image for uniform ${a} must be fully loaded`);let c=this.textures.get(a);c&&this.gl.deleteTexture(c),this.textureUnitMap.has(a)||this.textureUnitMap.set(a,this.textureUnitMap.size);let d=this.textureUnitMap.get(a);this.gl.activeTexture(this.gl.TEXTURE0+d);let e=this.gl.createTexture();this.gl.bindTexture(this.gl.TEXTURE_2D,e),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,b),this.mipmaps.includes(a)&&(this.gl.generateMipmap(this.gl.TEXTURE_2D),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_LINEAR));let f=this.gl.getError();if(f!==this.gl.NO_ERROR||null===e)return void console.error("Paper Shaders: WebGL error when uploading texture:",f);this.textures.set(a,e);let g=this.uniformLocations[a];if(g){this.gl.uniform1i(g,d);let c=`${a}AspectRatio`,e=this.uniformLocations[c];if(e){let a=b.naturalWidth/b.naturalHeight;this.gl.uniform1f(e,a)}}};areUniformValuesEqual=(a,b)=>a===b||!!(Array.isArray(a)&&Array.isArray(b))&&a.length===b.length&&a.every((a,c)=>this.areUniformValuesEqual(a,b[c]));setUniformValues=a=>{this.gl.useProgram(this.program),Object.entries(a).forEach(([a,b])=>{let c=b;if(b instanceof HTMLImageElement&&(c=`${b.src.slice(0,200)}|${b.naturalWidth}x${b.naturalHeight}`),this.areUniformValuesEqual(this.uniformCache[a],c))return;this.uniformCache[a]=c;let d=this.uniformLocations[a];if(!d)return void console.warn(`Uniform location for ${a} not found`);if(b instanceof HTMLImageElement)this.setTextureUniform(a,b);else if(Array.isArray(b)){let c=null,e=null;if(void 0!==b[0]&&Array.isArray(b[0])){let d=b[0].length;if(!b.every(a=>a.length===d))return void console.warn(`All child arrays must be the same length for ${a}`);c=b.flat(),e=d}else e=(c=b).length;switch(e){case 2:this.gl.uniform2fv(d,c);break;case 3:this.gl.uniform3fv(d,c);break;case 4:this.gl.uniform4fv(d,c);break;case 9:this.gl.uniformMatrix3fv(d,!1,c);break;case 16:this.gl.uniformMatrix4fv(d,!1,c);break;default:console.warn(`Unsupported uniform array length: ${e}`)}}else"number"==typeof b?this.gl.uniform1f(d,b):"boolean"==typeof b?this.gl.uniform1i(d,+!!b):console.warn(`Unsupported uniform type for ${a}: ${typeof b}`)})};getCurrentFrame=()=>this.currentFrame;setFrame=a=>{this.currentFrame=a,this.lastRenderTime=performance.now(),this.render(performance.now())};setSpeed=(a=1)=>{this.speed=a,this.setCurrentSpeed(this.ownerDocument.hidden?0:a)};setCurrentSpeed=a=>{this.currentSpeed=a,null===this.rafId&&0!==a&&(this.lastRenderTime=performance.now(),this.rafId=requestAnimationFrame(this.render)),null!==this.rafId&&0===a&&(cancelAnimationFrame(this.rafId),this.rafId=null)};setMaxPixelCount=(a=e)=>{this.maxPixelCount=a,this.handleResize()};setMinPixelRatio=(a=2)=>{this.minPixelRatio=a,this.handleResize()};setUniforms=a=>{this.setUniformValues(a),this.providedUniforms={...this.providedUniforms,...a},this.render(performance.now())};handleDocumentVisibilityChange=()=>{this.setCurrentSpeed(this.ownerDocument.hidden?0:this.speed)};dispose=()=>{this.hasBeenDisposed=!0,null!==this.rafId&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.gl&&this.program&&(this.textures.forEach(a=>{this.gl.deleteTexture(a)}),this.textures.clear(),this.gl.deleteProgram(this.program),this.program=null,this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,null),this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,null),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.getError()),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),visualViewport?.removeEventListener("resize",this.handleVisualViewportChange),this.ownerDocument.removeEventListener("visibilitychange",this.handleDocumentVisibilityChange),this.uniformLocations={},this.canvasElement.remove(),delete this.parentElement.paperShaderMount}}function g(a,b,c){let d=a.createShader(b);return d?(a.shaderSource(d,c),a.compileShader(d),a.getShaderParameter(d,a.COMPILE_STATUS))?d:(console.error("An error occurred compiling the shaders: "+a.getShaderInfoLog(d)),a.deleteShader(d),null):null}let h=`@layer paper-shaders {
  :where([data-paper-shader]) {
    isolation: isolate;
    position: relative;

    & canvas {
      contain: strict;
      display: block;
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      corner-shape: inherit;
    }
  }
}`;function i(a){if(a.naturalWidth<1024&&a.naturalHeight<1024){if(a.naturalWidth<1||a.naturalHeight<1)return;let b=a.naturalWidth/a.naturalHeight;a.width=Math.round(b>1?1024*b:1024),a.height=Math.round(b>1?1024:1024/b)}}async function j(a){let b={},c=[];return Object.entries(a).forEach(([a,d])=>{if("string"==typeof d){let e=d||"data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";if(!(a=>{try{if(a.startsWith("/"))return!0;return new URL(a),!0}catch{return!1}})(e))return void console.warn(`Uniform "${a}" has invalid URL "${e}". Skipping image loading.`);let f=new Promise((c,d)=>{let f=new Image;(a=>{try{if(a.startsWith("/"))return!1;return new URL(a,window.location.origin).origin!==window.location.origin}catch{return!1}})(e)&&(f.crossOrigin="anonymous"),f.onload=()=>{i(f),b[a]=f,c()},f.onerror=()=>{console.error(`Could not set uniforms. Failed to load image at ${e}`),d()},f.src=e});c.push(f)}else d instanceof HTMLImageElement&&i(d),b[a]=d}),await Promise.all(c),b}let k=(0,c.forwardRef)(function({fragmentShader:a,uniforms:d,webGlContextAttributes:e,speed:g=0,frame:h=0,width:i,height:k,minPixelRatio:l,maxPixelCount:m,mipmaps:n,style:o,...p},q){var r;let s,t,[u,v]=(0,c.useState)(!1),w=(0,c.useRef)(null),x=(0,c.useRef)(null),y=(0,c.useRef)(e);(0,c.useEffect)(()=>((async()=>{let b=await j(d);w.current&&!x.current&&(x.current=new f(w.current,a,b,y.current,g,h,l,m,n),v(!0))})(),()=>{x.current?.dispose(),x.current=null}),[a]),(0,c.useEffect)(()=>{let a=!1;return(async()=>{let b=await j(d);a||x.current?.setUniforms(b)})(),()=>{a=!0}},[d,u]),(0,c.useEffect)(()=>{x.current?.setSpeed(g)},[g,u]),(0,c.useEffect)(()=>{x.current?.setMaxPixelCount(m)},[m,u]),(0,c.useEffect)(()=>{x.current?.setMinPixelRatio(l)},[l,u]),(0,c.useEffect)(()=>{x.current?.setFrame(h)},[h,u]);let z=(r=[w,q],s=c.useRef(void 0),t=c.useCallback(a=>{let b=r.map(b=>{if(null!=b){if("function"==typeof b){let c=b(a);return"function"==typeof c?c:()=>{b(null)}}return b.current=a,()=>{b.current=null}}});return()=>{b.forEach(a=>a?.())}},r),c.useMemo(()=>r.every(a=>null==a)?null:a=>{s.current&&(s.current(),s.current=void 0),null!=a&&(s.current=t(a))},r));return(0,b.jsx)("div",{ref:z,style:void 0!==i||void 0!==k?{width:"string"==typeof i&&!1===isNaN(+i)?+i:i,height:"string"==typeof k&&!1===isNaN(+k)?+k:k,...o}:o,...p})});k.displayName="ShaderMount";let l={fit:"none",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0},m={none:0,contain:1,cover:2};function n(a){if(Array.isArray(a))return 4===a.length?a:3===a.length?[...a,1]:p;if("string"!=typeof a)return p;let b,c,d,e=1;if(a.startsWith("#")){var f;[b,c,d,e]=(3===(f=(f=a).replace(/^#/,"")).length&&(f=f.split("").map(a=>a+a).join("")),6===f.length&&(f+="ff"),[parseInt(f.slice(0,2),16)/255,parseInt(f.slice(2,4),16)/255,parseInt(f.slice(4,6),16)/255,parseInt(f.slice(6,8),16)/255])}else if(a.startsWith("rgb")){let f;[b,c,d,e]=(f=a.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i))?[parseInt(f[1]??"0")/255,parseInt(f[2]??"0")/255,parseInt(f[3]??"0")/255,void 0===f[4]?1:parseFloat(f[4])]:[0,0,0,1]}else{let f;if(!a.startsWith("hsl"))return console.error("Unsupported color format",a),p;[b,c,d,e]=function(a){let b,c,d,[e,f,g,h]=a,i=e/360,j=f/100,k=g/100;if(0===f)b=c=d=k;else{let a=(a,b,c)=>(c<0&&(c+=1),c>1&&(c-=1),c<1/6)?a+(b-a)*6*c:c<.5?b:c<2/3?a+(b-a)*(2/3-c)*6:a,e=k<.5?k*(1+j):k+j-k*j,f=2*k-e;b=a(f,e,i+1/3),c=a(f,e,i),d=a(f,e,i-1/3)}return[b,c,d,h]}((f=a.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i))?[parseInt(f[1]??"0"),parseInt(f[2]??"0"),parseInt(f[3]??"0"),void 0===f[4]?1:parseFloat(f[4])]:[0,0,0,1])}return[o(b,0,1),o(c,0,1),o(d,0,1),o(e,0,1)]}let o=(a,b,c)=>Math.min(Math.max(a,b),c),p=[0,0,0,1],q=`
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`,r=`
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`,s=`
  color += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);
`,t=`#version 300 es
precision mediump float;

uniform float u_time;
uniform float u_scale;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colors[10];
uniform float u_colorsCount;
uniform float u_proportion;
uniform float u_softness;
uniform float u_shape;
uniform float u_shapeScale;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_swirlIterations;

in vec2 v_patternUV;

out vec4 fragColor;

${q}
${r}
float randomG(vec2 p) {
  vec2 uv = floor(p) / 100. + .5;
  return texture(u_noiseTexture, fract(uv)).g;
}
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomG(i);
  float b = randomG(i + vec2(1.0, 0.0));
  float c = randomG(i + vec2(0.0, 1.0));
  float d = randomG(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}


void main() {
  vec2 uv = v_patternUV;
  uv *= .5;

  const float firstFrameOffset = 118.;
  float t = 0.0625 * (u_time + firstFrameOffset);

  float n1 = valueNoise(uv * 1. + t);
  float n2 = valueNoise(uv * 2. - t);
  float angle = n1 * TWO_PI;
  uv.x += 4. * u_distortion * n2 * cos(angle);
  uv.y += 4. * u_distortion * n2 * sin(angle);

  float swirl = u_swirl;
  for (int i = 1; i <= 20; i++) {
    if (i >= int(u_swirlIterations)) break;
    float iFloat = float(i);
    //    swirl *= (1. - smoothstep(.0, .25, length(fwidth(uv))));
    uv.x += swirl / iFloat * cos(t + iFloat * 1.5 * uv.y);
    uv.y += swirl / iFloat * cos(t + iFloat * 1. * uv.x);
  }

  float proportion = clamp(u_proportion, 0., 1.);

  float shape = 0.;
  if (u_shape < .5) {
    vec2 checksShape_uv = uv * (.5 + 3.5 * u_shapeScale);
    shape = .5 + .5 * sin(checksShape_uv.x) * cos(checksShape_uv.y);
    shape += .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
  } else if (u_shape < 1.5) {
    vec2 stripesShape_uv = uv * (2. * u_shapeScale);
    float f = fract(stripesShape_uv.y);
    shape = smoothstep(.0, .55, f) * (1.0 - smoothstep(.45, 1., f));
    shape += .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
  } else {
    float shapeScaling = 5. * (1. - u_shapeScale);
    float e0 = 0.45 - shapeScaling;
    float e1 = 0.55 + shapeScaling;
    shape = smoothstep(min(e0, e1), max(e0, e1), 1.0 - uv.y + 0.3 * (proportion - 0.5));
  }

  float mixer = shape * (u_colorsCount - 1.);
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  float aa = fwidth(shape);
  for (int i = 1; i < 10; i++) {
    if (i >= int(u_colorsCount)) break;
    float m = clamp(mixer - float(i - 1), 0.0, 1.0);

    float localMixerStart = floor(m);
    float softness = .5 * u_softness + fwidth(m);
    float smoothed = smoothstep(max(0., .5 - softness - aa), min(1., .5 + softness + aa), m - localMixerStart);
    float stepped = localMixerStart + smoothed;

    m = mix(stepped, m, u_softness);

    vec4 c = u_colors[i];
    c.rgb *= c.a;
    gradient = mix(gradient, c, m);
  }

  vec3 color = gradient.rgb;
  float opacity = gradient.a;

  ${s}

  fragColor = vec4(color, opacity);
}
`,u={checks:0,stripes:1,edge:2},v={name:"Default",params:{...l,rotation:0,speed:1,frame:0,colors:["#121212","#9470ff","#121212","#8838ff"],proportion:.45,softness:1,distortion:.25,swirl:.8,swirlIterations:10,shapeScale:.1,shape:"checks"}},w=[v,{name:"Cauldron Pot",params:{...l,scale:.9,rotation:160,speed:10,frame:0,colors:["#a7e58b","#324472","#0a180d"],proportion:.64,softness:1.5,distortion:.2,swirl:.86,swirlIterations:7,shapeScale:.6,shape:"edge"}},{name:"Live Ink",params:{...l,scale:1.2,rotation:44,offsetY:-.3,speed:2.5,frame:0,colors:["#111314","#9faeab","#f3fee7","#f3fee7"],proportion:.05,softness:0,distortion:.25,swirl:.8,swirlIterations:10,shapeScale:.28,shape:"checks"}},{name:"Kelp",params:{...l,scale:.8,rotation:50,speed:20,frame:0,colors:["#dbff8f","#404f3e","#091316"],proportion:.67,softness:0,distortion:0,swirl:.2,swirlIterations:3,shapeScale:1,shape:"stripes"}},{name:"Nectar",params:{...l,scale:2,offsetY:.6,rotation:0,speed:4.2,frame:0,colors:["#151310","#d3a86b","#f0edea"],proportion:.24,softness:1,distortion:.21,swirl:.57,swirlIterations:10,shapeScale:.75,shape:"edge"}},{name:"Passion",params:{...l,scale:2.5,rotation:1.35,speed:3,frame:0,colors:["#3b1515","#954751","#ffc085"],proportion:.5,softness:1,distortion:.09,swirl:.9,swirlIterations:6,shapeScale:.25,shape:"checks"}}],x=(0,c.memo)(function({speed:a=v.params.speed,frame:c=v.params.frame,colors:d=v.params.colors,proportion:e=v.params.proportion,softness:f=v.params.softness,distortion:g=v.params.distortion,swirl:h=v.params.swirl,swirlIterations:i=v.params.swirlIterations,shapeScale:j=v.params.shapeScale,shape:l=v.params.shape,fit:o=v.params.fit,scale:p=v.params.scale,rotation:q=v.params.rotation,originX:r=v.params.originX,originY:s=v.params.originY,offsetX:w=v.params.offsetX,offsetY:x=v.params.offsetY,worldWidth:y=v.params.worldWidth,worldHeight:z=v.params.worldHeight,...A}){let B={u_colors:d.map(n),u_colorsCount:d.length,u_proportion:e,u_softness:f,u_distortion:g,u_swirl:h,u_swirlIterations:i,u_shapeScale:j,u_shape:u[l],u_noiseTexture:void 0,u_scale:p,u_rotation:q,u_fit:m[o],u_offsetX:w,u_offsetY:x,u_originX:r,u_originY:s,u_worldWidth:y,u_worldHeight:z};return(0,b.jsx)(k,{...A,speed:a,frame:c,fragmentShader:t,uniforms:B})},function(a,b){for(let c in a){if("colors"===c){let c=Array.isArray(a.colors),d=Array.isArray(b.colors);if(!c||!d){if(!1===Object.is(a.colors,b.colors))return!1;continue}if(a.colors?.length!==b.colors?.length||!a.colors?.every((a,c)=>a===b.colors?.[c]))return!1;continue}if(!1===Object.is(a[c],b[c]))return!1}return!0});a.s(["default",0,function(){let[a,d]=(0,c.useState)(!1);if((0,c.useEffect)(()=>{d(!0)},[]),!a)return(0,b.jsx)("div",{className:"absolute inset-0 bg-bg-surface"});let e=w?.[0]?.params||{};return(0,b.jsx)(x,{...e,style:{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:.35}})}],59790)}];

//# sourceMappingURL=src_components_WarpHeroBackground_tsx_0khu8x9._.js.map