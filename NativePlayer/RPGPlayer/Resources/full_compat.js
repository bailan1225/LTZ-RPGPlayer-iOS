// === Full Compatibility Bundle (merged from 26 files) ===
// Order matches ArkFullCompatJS.fileOrder in TranslatorConfig.swift

/* === stbvorbis_stream_asm.js === */
var Module=typeof Module!=="undefined"?Module:{};var moduleOverrides={};var key;for(key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}Module["arguments"]=[];Module["thisProgram"]="./this.program";Module["quit"]=function(status,toThrow){throw toThrow};Module["preRun"]=[];Module["postRun"]=[];var ENVIRONMENT_IS_WEB=false;var ENVIRONMENT_IS_WORKER=false;var ENVIRONMENT_IS_NODE=false;var ENVIRONMENT_IS_SHELL=false;ENVIRONMENT_IS_WEB=typeof window==="object";ENVIRONMENT_IS_WORKER=typeof importScripts==="function";ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof require==="function"&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}else{return scriptDirectory+path}}if(ENVIRONMENT_IS_NODE){scriptDirectory=__dirname+"/";var nodeFS;var nodePath;Module["read"]=function shell_read(filename,binary){var ret;ret=tryParseAsDataURI(filename);if(!ret){if(!nodeFS)nodeFS=require("fs");if(!nodePath)nodePath=require("path");filename=nodePath["normalize"](filename);ret=nodeFS["readFileSync"](filename)}return binary?ret:ret.toString()};Module["readBinary"]=function readBinary(filename){var ret=Module["read"](filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/")}Module["arguments"]=process["argv"].slice(2);if(typeof module!=="undefined"){module["exports"]=Module}process["on"]("uncaughtException",function(ex){if(!(ex instanceof ExitStatus)){throw ex}});process["on"]("unhandledRejection",function(reason,p){process["exit"](1)});Module["quit"]=function(status){process["exit"](status)};Module["inspect"]=function(){return"[Emscripten Module object]"}}else if(ENVIRONMENT_IS_SHELL){if(typeof read!="undefined"){Module["read"]=function shell_read(f){var data=tryParseAsDataURI(f);if(data){return intArrayToString(data)}return read(f)}}Module["readBinary"]=function readBinary(f){var data;data=tryParseAsDataURI(f);if(data){return data}if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof quit==="function"){Module["quit"]=function(status){quit(status)}}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WEB){if(document.currentScript){scriptDirectory=document.currentScript.src}}else{scriptDirectory=self.location.href}if(scriptDirectory.indexOf("blob:")!==0){scriptDirectory=scriptDirectory.split("/").slice(0,-1).join("/")+"/"}else{scriptDirectory=""}Module["read"]=function shell_read(url){try{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText}catch(err){var data=tryParseAsDataURI(url);if(data){return intArrayToString(data)}throw err}};if(ENVIRONMENT_IS_WORKER){Module["readBinary"]=function readBinary(url){try{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}catch(err){var data=tryParseAsDataURI(url);if(data){return data}throw err}}}Module["readAsync"]=function readAsync(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}var data=tryParseAsDataURI(url);if(data){onload(data.buffer);return}onerror()};xhr.onerror=onerror;xhr.send(null)};Module["setWindowTitle"]=function(title){document.title=title}}else{}var out=Module["print"]||(typeof console!=="undefined"?console.log.bind(console):typeof print!=="undefined"?print:null);var err=Module["printErr"]||(typeof printErr!=="undefined"?printErr:typeof console!=="undefined"&&console.warn.bind(console)||out);for(key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}moduleOverrides=undefined;var STACK_ALIGN=16;function staticAlloc(size){var ret=STATICTOP;STATICTOP=STATICTOP+size+15&-16;return ret}function dynamicAlloc(size){var ret=HEAP32[DYNAMICTOP_PTR>>2];var end=ret+size+15&-16;HEAP32[DYNAMICTOP_PTR>>2]=end;if(end>=TOTAL_MEMORY){var success=enlargeMemory();if(!success){HEAP32[DYNAMICTOP_PTR>>2]=ret;return 0}}return ret}function alignMemory(size,factor){if(!factor)factor=STACK_ALIGN;var ret=size=Math.ceil(size/factor)*factor;return ret}function getNativeTypeSize(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return 4}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0);return bits/8}else{return 0}}}}function warnOnce(text){if(!warnOnce.shown)warnOnce.shown={};if(!warnOnce.shown[text]){warnOnce.shown[text]=1;err(text)}}var asm2wasmImports={"f64-rem":function(x,y){return x%y},debugger:function(){debugger}};var jsCallStartIndex=1;var functionPointers=new Array(0);function addFunction(func,sig){var base=0;for(var i=base;i<base+0;i++){if(!functionPointers[i]){functionPointers[i]=func;return jsCallStartIndex+i}}throw"Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS."}function removeFunction(index){functionPointers[index-jsCallStartIndex]=null}var funcWrappers={};function getFuncWrapper(func,sig){if(!func)return;assert(sig);if(!funcWrappers[sig]){funcWrappers[sig]={}}var sigCache=funcWrappers[sig];if(!sigCache[func]){if(sig.length===1){sigCache[func]=function dynCall_wrapper(){return dynCall(sig,func)}}else if(sig.length===2){sigCache[func]=function dynCall_wrapper(arg){return dynCall(sig,func,[arg])}}else{sigCache[func]=function dynCall_wrapper(){return dynCall(sig,func,Array.prototype.slice.call(arguments))}}}return sigCache[func]}function makeBigInt(low,high,unsigned){return unsigned?+(low>>>0)+ +(high>>>0)*4294967296:+(low>>>0)+ +(high|0)*4294967296}function dynCall(sig,ptr,args){if(args&&args.length){return Module["dynCall_"+sig].apply(null,[ptr].concat(args))}else{return Module["dynCall_"+sig].call(null,ptr)}}var Runtime={dynCall:dynCall};var GLOBAL_BASE=8;var ABORT=0;var EXITSTATUS=0;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}var globalScope=this;function getCFunc(ident){var func=Module["_"+ident];assert(func,"Cannot call unknown function "+ident+", make sure it is exported");return func}var JSfuncs={stackSave:function(){stackSave()},stackRestore:function(){stackRestore()},arrayToC:function(arr){var ret=stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret},stringToC:function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){var len=(str.length<<2)+1;ret=stackAlloc(len);stringToUTF8(str,ret,len)}return ret}};var toC={string:JSfuncs["stringToC"],array:JSfuncs["arrayToC"]};function ccall(ident,returnType,argTypes,args,opts){function convertReturnValue(ret){if(returnType==="string")return Pointer_stringify(ret);if(returnType==="boolean")return Boolean(ret);return ret}var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func.apply(null,cArgs);ret=convertReturnValue(ret);if(stack!==0)stackRestore(stack);return ret}function cwrap(ident,returnType,argTypes,opts){argTypes=argTypes||[];var numericArgs=argTypes.every(function(type){return type==="number"});var numericRet=returnType!=="string";if(numericRet&&numericArgs&&!opts){return getCFunc(ident)}return function(){return ccall(ident,returnType,argTypes,arguments,opts)}}function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=+1?tempDouble>+0?(Math_min(+Math_floor(tempDouble/+4294967296),+4294967295)|0)>>>0:~~+Math_ceil((tempDouble-+(~~tempDouble>>>0))/+4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type)}}function getValue(ptr,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":return HEAP8[ptr>>0];case"i8":return HEAP8[ptr>>0];case"i16":return HEAP16[ptr>>1];case"i32":return HEAP32[ptr>>2];case"i64":return HEAP32[ptr>>2];case"float":return HEAPF32[ptr>>2];case"double":return HEAPF64[ptr>>3];default:abort("invalid type for getValue: "+type)}return null}var ALLOC_NORMAL=0;var ALLOC_STACK=1;var ALLOC_STATIC=2;var ALLOC_DYNAMIC=3;var ALLOC_NONE=4;function allocate(slab,types,allocator,ptr){var zeroinit,size;if(typeof slab==="number"){zeroinit=true;size=slab}else{zeroinit=false;size=slab.length}var singleType=typeof types==="string"?types:null;var ret;if(allocator==ALLOC_NONE){ret=ptr}else{ret=[typeof _malloc==="function"?_malloc:staticAlloc,stackAlloc,staticAlloc,dynamicAlloc][allocator===undefined?ALLOC_STATIC:allocator](Math.max(size,singleType?1:types.length))}if(zeroinit){var stop;ptr=ret;assert((ret&3)==0);stop=ret+(size&~3);for(;ptr<stop;ptr+=4){HEAP32[ptr>>2]=0}stop=ret+size;while(ptr<stop){HEAP8[ptr++>>0]=0}return ret}if(singleType==="i8"){if(slab.subarray||slab.slice){HEAPU8.set(slab,ret)}else{HEAPU8.set(new Uint8Array(slab),ret)}return ret}var i=0,type,typeSize,previousType;while(i<size){var curr=slab[i];type=singleType||types[i];if(type===0){i++;continue}if(type=="i64")type="i32";setValue(ret+i,curr,type);if(previousType!==type){typeSize=getNativeTypeSize(type);previousType=type}i+=typeSize}return ret}function getMemory(size){if(!staticSealed)return staticAlloc(size);if(!runtimeInitialized)return dynamicAlloc(size);return _malloc(size)}function Pointer_stringify(ptr,length){if(length===0||!ptr)return"";var hasUtf=0;var t;var i=0;while(1){t=HEAPU8[ptr+i>>0];hasUtf|=t;if(t==0&&!length)break;i++;if(length&&i==length)break}if(!length)length=i;var ret="";if(hasUtf<128){var MAX_CHUNK=1024;var curr;while(length>0){curr=String.fromCharCode.apply(String,HEAPU8.subarray(ptr,ptr+Math.min(length,MAX_CHUNK)));ret=ret?ret+curr:curr;ptr+=MAX_CHUNK;length-=MAX_CHUNK}return ret}return UTF8ToString(ptr)}function AsciiToString(ptr){var str="";while(1){var ch=HEAP8[ptr++>>0];if(!ch)return str;str+=String.fromCharCode(ch)}}function stringToAscii(str,outPtr){return writeAsciiToMemory(str,outPtr,false)}var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;function UTF8ArrayToString(u8Array,idx){var endPtr=idx;while(u8Array[endPtr])++endPtr;if(endPtr-idx>16&&u8Array.subarray&&UTF8Decoder){return UTF8Decoder.decode(u8Array.subarray(idx,endPtr))}else{var u0,u1,u2,u3,u4,u5;var str="";while(1){u0=u8Array[idx++];if(!u0)return str;if(!(u0&128)){str+=String.fromCharCode(u0);continue}u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u3=u8Array[idx++]&63;if((u0&248)==240){u0=(u0&7)<<18|u1<<12|u2<<6|u3}else{u4=u8Array[idx++]&63;if((u0&252)==248){u0=(u0&3)<<24|u1<<18|u2<<12|u3<<6|u4}else{u5=u8Array[idx++]&63;u0=(u0&1)<<30|u1<<24|u2<<18|u3<<12|u4<<6|u5}}}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}}function UTF8ToString(ptr){return UTF8ArrayToString(HEAPU8,ptr)}function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023}if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=2097151){if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=67108863){if(outIdx+4>=endIdx)break;outU8Array[outIdx++]=248|u>>24;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else{if(outIdx+5>=endIdx)break;outU8Array[outIdx++]=252|u>>30;outU8Array[outIdx++]=128|u>>24&63;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}}outU8Array[outIdx]=0;return outIdx-startIdx}function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){++len}else if(u<=2047){len+=2}else if(u<=65535){len+=3}else if(u<=2097151){len+=4}else if(u<=67108863){len+=5}else{len+=6}}return len}var UTF16Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf-16le"):undefined;function UTF16ToString(ptr){var endPtr=ptr;var idx=endPtr>>1;while(HEAP16[idx])++idx;endPtr=idx<<1;if(endPtr-ptr>32&&UTF16Decoder){return UTF16Decoder.decode(HEAPU8.subarray(ptr,endPtr))}else{var i=0;var str="";while(1){var codeUnit=HEAP16[ptr+i*2>>1];if(codeUnit==0)return str;++i;str+=String.fromCharCode(codeUnit)}}}function stringToUTF16(str,outPtr,maxBytesToWrite){if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647}if(maxBytesToWrite<2)return 0;maxBytesToWrite-=2;var startPtr=outPtr;var numCharsToWrite=maxBytesToWrite<str.length*2?maxBytesToWrite/2:str.length;for(var i=0;i<numCharsToWrite;++i){var codeUnit=str.charCodeAt(i);HEAP16[outPtr>>1]=codeUnit;outPtr+=2}HEAP16[outPtr>>1]=0;return outPtr-startPtr}function lengthBytesUTF16(str){return str.length*2}function UTF32ToString(ptr){var i=0;var str="";while(1){var utf32=HEAP32[ptr+i*4>>2];if(utf32==0)return str;++i;if(utf32>=65536){var ch=utf32-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}else{str+=String.fromCharCode(utf32)}}}function stringToUTF32(str,outPtr,maxBytesToWrite){if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647}if(maxBytesToWrite<4)return 0;var startPtr=outPtr;var endPtr=startPtr+maxBytesToWrite-4;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343){var trailSurrogate=str.charCodeAt(++i);codeUnit=65536+((codeUnit&1023)<<10)|trailSurrogate&1023}HEAP32[outPtr>>2]=codeUnit;outPtr+=4;if(outPtr+4>endPtr)break}HEAP32[outPtr>>2]=0;return outPtr-startPtr}function lengthBytesUTF32(str){var len=0;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343)++i;len+=4}return len}function allocateUTF8(str){var size=lengthBytesUTF8(str)+1;var ret=_malloc(size);if(ret)stringToUTF8Array(str,HEAP8,ret,size);return ret}function allocateUTF8OnStack(str){var size=lengthBytesUTF8(str)+1;var ret=stackAlloc(size);stringToUTF8Array(str,HEAP8,ret,size);return ret}function demangle(func){return func}function demangleAll(text){var regex=/__Z[\w\d_]+/g;return text.replace(regex,function(x){var y=demangle(x);return x===y?x:x+" ["+y+"]"})}function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e}if(!err.stack){return"(no stack trace available)"}}return err.stack.toString()}function stackTrace(){var js=jsStackTrace();if(Module["extraStackTrace"])js+="\n"+Module["extraStackTrace"]();return demangleAll(js)}var PAGE_SIZE=16384;var WASM_PAGE_SIZE=65536;var ASMJS_PAGE_SIZE=16777216;var MIN_TOTAL_MEMORY=16777216;function alignUp(x,multiple){if(x%multiple>0){x+=multiple-x%multiple}return x}var HEAP,buffer,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBuffer(buf){Module["buffer"]=buffer=buf}function updateGlobalBufferViews(){Module["HEAP8"]=HEAP8=new Int8Array(buffer);Module["HEAP16"]=HEAP16=new Int16Array(buffer);Module["HEAP32"]=HEAP32=new Int32Array(buffer);Module["HEAPU8"]=HEAPU8=new Uint8Array(buffer);Module["HEAPU16"]=HEAPU16=new Uint16Array(buffer);Module["HEAPU32"]=HEAPU32=new Uint32Array(buffer);Module["HEAPF32"]=HEAPF32=new Float32Array(buffer);Module["HEAPF64"]=HEAPF64=new Float64Array(buffer)}var STATIC_BASE,STATICTOP,staticSealed;var STACK_BASE,STACKTOP,STACK_MAX;var DYNAMIC_BASE,DYNAMICTOP_PTR;STATIC_BASE=STATICTOP=STACK_BASE=STACKTOP=STACK_MAX=DYNAMIC_BASE=DYNAMICTOP_PTR=0;staticSealed=false;function abortOnCannotGrowMemory(){abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value "+TOTAL_MEMORY+", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or (4) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")}if(!Module["reallocBuffer"])Module["reallocBuffer"]=function(size){var ret;try{if(ArrayBuffer.transfer){ret=ArrayBuffer.transfer(buffer,size)}else{var oldHEAP8=HEAP8;ret=new ArrayBuffer(size);var temp=new Int8Array(ret);temp.set(oldHEAP8)}}catch(e){return false}var success=_emscripten_replace_memory(ret);if(!success)return false;return ret};function enlargeMemory(){var PAGE_MULTIPLE=Module["usingWasm"]?WASM_PAGE_SIZE:ASMJS_PAGE_SIZE;var LIMIT=2147483648-PAGE_MULTIPLE;if(HEAP32[DYNAMICTOP_PTR>>2]>LIMIT){return false}var OLD_TOTAL_MEMORY=TOTAL_MEMORY;TOTAL_MEMORY=Math.max(TOTAL_MEMORY,MIN_TOTAL_MEMORY);while(TOTAL_MEMORY<HEAP32[DYNAMICTOP_PTR>>2]){if(TOTAL_MEMORY<=536870912){TOTAL_MEMORY=alignUp(2*TOTAL_MEMORY,PAGE_MULTIPLE)}else{TOTAL_MEMORY=Math.min(alignUp((3*TOTAL_MEMORY+2147483648)/4,PAGE_MULTIPLE),LIMIT)}}var replacement=Module["reallocBuffer"](TOTAL_MEMORY);if(!replacement||replacement.byteLength!=TOTAL_MEMORY){TOTAL_MEMORY=OLD_TOTAL_MEMORY;return false}updateGlobalBuffer(replacement);updateGlobalBufferViews();return true}var byteLength;try{byteLength=Function.prototype.call.bind(Object.getOwnPropertyDescriptor(ArrayBuffer.prototype,"byteLength").get);byteLength(new ArrayBuffer(4))}catch(e){byteLength=function(buffer){return buffer.byteLength}}var TOTAL_STACK=Module["TOTAL_STACK"]||5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;if(TOTAL_MEMORY<TOTAL_STACK)err("TOTAL_MEMORY should be larger than TOTAL_STACK, was "+TOTAL_MEMORY+"! (TOTAL_STACK="+TOTAL_STACK+")");if(Module["buffer"]){buffer=Module["buffer"]}else{{buffer=new ArrayBuffer(TOTAL_MEMORY)}Module["buffer"]=buffer}updateGlobalBufferViews();function getTotalMemory(){return TOTAL_MEMORY}function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Module["dynCall_v"](func)}else{Module["dynCall_vi"](func,callback.arg)}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATEXIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){callRuntimeCallbacks(__ATEXIT__);runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}function addOnInit(cb){__ATINIT__.unshift(cb)}function addOnPreMain(cb){__ATMAIN__.unshift(cb)}function addOnExit(cb){__ATEXIT__.unshift(cb)}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}function writeStringToMemory(string,buffer,dontAddNull){warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!");var lastChar,end;if(dontAddNull){end=buffer+lengthBytesUTF8(string);lastChar=HEAP8[end]}stringToUTF8(string,buffer,Infinity);if(dontAddNull)HEAP8[end]=lastChar}function writeArrayToMemory(array,buffer){HEAP8.set(array,buffer)}function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i)}if(!dontAddNull)HEAP8[buffer>>0]=0}function unSign(value,bits,ignore){if(value>=0){return value}return bits<=32?2*Math.abs(1<<bits-1)+value:Math.pow(2,bits)+value}function reSign(value,bits,ignore){if(value<=0){return value}var half=bits<=32?Math.abs(1<<bits-1):Math.pow(2,bits-1);if(value>=half&&(bits<=32||value>half)){value=-2*half+value}return value}var Math_abs=Math.abs;var Math_cos=Math.cos;var Math_sin=Math.sin;var Math_tan=Math.tan;var Math_acos=Math.acos;var Math_asin=Math.asin;var Math_atan=Math.atan;var Math_atan2=Math.atan2;var Math_exp=Math.exp;var Math_log=Math.log;var Math_sqrt=Math.sqrt;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_pow=Math.pow;var Math_imul=Math.imul;var Math_fround=Math.fround;var Math_round=Math.round;var Math_min=Math.min;var Math_max=Math.max;var Math_clz32=Math.clz32;var Math_trunc=Math.trunc;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function getUniqueRunDependency(id){return id}function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["preloadedImages"]={};Module["preloadedAudios"]={};var memoryInitializer=null;var dataURIPrefix="data:application/octet-stream;base64,";function isDataURI(filename){return String.prototype.startsWith?filename.startsWith(dataURIPrefix):filename.indexOf(dataURIPrefix)===0}var ASM_CONSTS=[];STATIC_BASE=GLOBAL_BASE;STATICTOP=STATIC_BASE+3392;__ATINIT__.push();memoryInitializer="data:application/octet-stream;base64,AAAAAAAAAAAAAQICAwMDAwQEBAQEBAQEAAEAAIAAAABWAAAAQAAAAD605DMJkfMzi7IBNDwgCjQjGhM0YKkcNKfXJjRLrzE0UDs9NHCHSTQjoFY0uJJkNFVtczSIn4E0/AuKNJMEkzRpkpw0Mr+mND+VsTSTH7005GnJNK2A1jQ2ceQ0pknzNIiMATXA9wk1Bu8SNXZ7HDXApiY1N3sxNdoDPTVeTEk1O2FWNblPZDX8JXM1inmBNYbjiTV82ZI1hWScNVKOpjUzYbE1Jei8NdwuyTXOQdY1QS7kNVcC8zWPZgE2T88JNvXDEjaYTRw26HUmNjJHMTZ0zDw2XhFJNmUiVjbODGQ2uN5yNpdTgTYcu4k2cq6SNq82nDaBXaY2NS2xNsewvDbk88g2AQPWNmDr4zYeu/I2okABN+umCTfxmBI3yR8cNx5FJjc9EzE3HpU8N2/WSDei41U398ljN4mXcjevLYE3vpKJN3SDkjfmCJw3viymN0f5sDd5ebw3/rjIN0fE1TeSqOM3+HPyN8AaATiTfgk4+W0SOAbyGzhiFCY4Vt8wONhdPDiSm0g48qRVODOHYzhuUHI40weBOGtqiTiCWJI4KtubOAn8pThoxbA4O0K8OCl+yDighdU42WXjOOgs8jjp9AA5RlYJOQ5DEjlRxBs5teMlOX+rMDmiJjw5xWBIOVNmVTmDRGM5aAlyOQHigDkkQok5nS2SOXutmzljy6U5mZGwOQ0LvDlmQ8g5C0fVOTIj4znt5fE5Hc8AOgUuCTowGBI6qZYbOhWzJTq3dzA6fO87OgomSDrHJ1U65gFjOnjCcTo7vIA66RmJOsYCkjrbf5s6y5qlOthdsDrv07s6swjIOogI1Tqf4OI6B5/xOlypADvQBQk7Xu0ROw9pGzuEgiU7/UMwO2e4Ozth60c7TelUO12/Yjuce3E7f5aAO7rxiDv515E7R1KbO0FqpTsnKrA74py7OxLOxzsXytQ7IJ7iOzVY8TumgwA8p90IPJjCETyCOxs8AVIlPFQQMDxhgTs8yLBHPOWqVDzofGI81DRxPM9wgDyWyYg8Oq2RPMAkmzzFOaU8hfavPOVluzyCk8c8uYvUPLRb4jx5EfE8+10APYm1CD3flxE9Ag4bPY0hJT253C89bUo7PUB2Rz2RbFQ9hTpiPSLucD0qS4A9f6GIPYiCkT1I95o9WAmlPfLCrz34Lrs9A1nHPW1N1D1cGeI90crwPVs4AD53jQg+M20RPpDgGj4n8SQ+LqkvPocTOz7KO0c+TS5UPjf4YT6Ep3A+jyWAPnN5iD7iV5E+3MmaPvnYpD5tj68+G/i6PpUexz4zD9Q+F9fhPj2E8D7GEgA/cmUIP5NCET8rsxo/zsAkP7F1Lz+y3Do/ZQFHPx3wUz/7tWE/+2BwPwAAgD9PZ2dTLi9zdGJfdm9yYmlzLmMAZi0+YWxsb2MuYWxsb2NfYnVmZmVyX2xlbmd0aF9pbl9ieXRlcyA9PSBmLT50ZW1wX29mZnNldAB2b3JiaXNfZGVjb2RlX2luaXRpYWwAZi0+Ynl0ZXNfaW5fc2VnID4gMABnZXQ4X3BhY2tldF9yYXcAZi0+Ynl0ZXNfaW5fc2VnID09IDAAbmV4dF9zZWdtZW50AHZvcmJpc19kZWNvZGVfcGFja2V0X3Jlc3QAIWMtPnNwYXJzZQBjb2RlYm9va19kZWNvZGVfc2NhbGFyX3JhdwAhYy0+c3BhcnNlIHx8IHogPCBjLT5zb3J0ZWRfZW50cmllcwBjb2RlYm9va19kZWNvZGVfZGVpbnRlcmxlYXZlX3JlcGVhdAB6IDwgYy0+c29ydGVkX2VudHJpZXMAY29kZWJvb2tfZGVjb2RlX3N0YXJ0AChuICYgMykgPT0gMABpbWRjdF9zdGVwM19pdGVyMF9sb29wADAAZ2V0X3dpbmRvdwBmLT50ZW1wX29mZnNldCA9PSBmLT5hbGxvYy5hbGxvY19idWZmZXJfbGVuZ3RoX2luX2J5dGVzAHN0YXJ0X2RlY29kZXIAdm9yYmlzYy0+c29ydGVkX2VudHJpZXMgPT0gMABjb21wdXRlX2NvZGV3b3JkcwB6ID49IDAgJiYgeiA8IDMyAGxlbltpXSA+PSAwICYmIGxlbltpXSA8IDMyAGF2YWlsYWJsZVt5XSA9PSAwAGsgPT0gYy0+c29ydGVkX2VudHJpZXMAY29tcHV0ZV9zb3J0ZWRfaHVmZm1hbgBjLT5zb3J0ZWRfY29kZXdvcmRzW3hdID09IGNvZGUAbGVuICE9IE5PX0NPREUAaW5jbHVkZV9pbl9zb3J0AHBvdygoZmxvYXQpIHIrMSwgZGltKSA+IGVudHJpZXMAbG9va3VwMV92YWx1ZXMAKGludCkgZmxvb3IocG93KChmbG9hdCkgciwgZGltKSkgPD0gZW50cmllcw==";var tempDoublePtr=STATICTOP;STATICTOP+=16;function copyTempFloat(ptr){HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1]=HEAP8[ptr+1];HEAP8[tempDoublePtr+2]=HEAP8[ptr+2];HEAP8[tempDoublePtr+3]=HEAP8[ptr+3]}function copyTempDouble(ptr){HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1]=HEAP8[ptr+1];HEAP8[tempDoublePtr+2]=HEAP8[ptr+2];HEAP8[tempDoublePtr+3]=HEAP8[ptr+3];HEAP8[tempDoublePtr+4]=HEAP8[ptr+4];HEAP8[tempDoublePtr+5]=HEAP8[ptr+5];HEAP8[tempDoublePtr+6]=HEAP8[ptr+6];HEAP8[tempDoublePtr+7]=HEAP8[ptr+7]}function ___assert_fail(condition,filename,line,func){abort("Assertion failed: "+Pointer_stringify(condition)+", at: "+[filename?Pointer_stringify(filename):"unknown filename",line,func?Pointer_stringify(func):"unknown function"])}function _abort(){Module["abort"]()}var _llvm_floor_f64=Math_floor;function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest);return dest}function ___setErrNo(value){if(Module["___errno_location"])HEAP32[Module["___errno_location"]()>>2]=value;return value}DYNAMICTOP_PTR=staticAlloc(4);STACK_BASE=STACKTOP=alignMemory(STATICTOP);STACK_MAX=STACK_BASE+TOTAL_STACK;DYNAMIC_BASE=alignMemory(STACK_MAX);HEAP32[DYNAMICTOP_PTR>>2]=DYNAMIC_BASE;staticSealed=true;var ASSERTIONS=false;function intArrayFromString(stringy,dontAddNull,length){var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array}function intArrayToString(array){var ret=[];for(var i=0;i<array.length;i++){var chr=array[i];if(chr>255){if(ASSERTIONS){assert(false,"Character code "+chr+" ("+String.fromCharCode(chr)+")  at offset "+i+" not in 0x00-0xFF.")}chr&=255}ret.push(String.fromCharCode(chr))}return ret.join("")}var decodeBase64=typeof atob==="function"?atob:function(input){var keyStr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var output="";var chr1,chr2,chr3;var enc1,enc2,enc3,enc4;var i=0;input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");do{enc1=keyStr.indexOf(input.charAt(i++));enc2=keyStr.indexOf(input.charAt(i++));enc3=keyStr.indexOf(input.charAt(i++));enc4=keyStr.indexOf(input.charAt(i++));chr1=enc1<<2|enc2>>4;chr2=(enc2&15)<<4|enc3>>2;chr3=(enc3&3)<<6|enc4;output=output+String.fromCharCode(chr1);if(enc3!==64){output=output+String.fromCharCode(chr2)}if(enc4!==64){output=output+String.fromCharCode(chr3)}}while(i<input.length);return output};function intArrayFromBase64(s){if(typeof ENVIRONMENT_IS_NODE==="boolean"&&ENVIRONMENT_IS_NODE){var buf;try{buf=Buffer.from(s,"base64")}catch(_){buf=new Buffer(s,"base64")}return new Uint8Array(buf.buffer,buf.byteOffset,buf.byteLength)}try{var decoded=decodeBase64(s);var bytes=new Uint8Array(decoded.length);for(var i=0;i<decoded.length;++i){bytes[i]=decoded.charCodeAt(i)}return bytes}catch(_){throw new Error("Converting base64 string to bytes failed.")}}function tryParseAsDataURI(filename){if(!isDataURI(filename)){return}return intArrayFromBase64(filename.slice(dataURIPrefix.length))}function invoke_iii(index,a1,a2){var sp=stackSave();try{return Module["dynCall_iii"](index,a1,a2)}catch(e){stackRestore(sp);if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}Module.asmGlobalArg={Math:Math,Int8Array:Int8Array,Int16Array:Int16Array,Int32Array:Int32Array,Uint8Array:Uint8Array,Uint16Array:Uint16Array,Uint32Array:Uint32Array,Float32Array:Float32Array,Float64Array:Float64Array,NaN:NaN,Infinity:Infinity,byteLength:byteLength};Module.asmLibraryArg={abort:abort,assert:assert,enlargeMemory:enlargeMemory,getTotalMemory:getTotalMemory,abortOnCannotGrowMemory:abortOnCannotGrowMemory,invoke_iii:invoke_iii,___assert_fail:___assert_fail,___setErrNo:___setErrNo,_abort:_abort,_emscripten_memcpy_big:_emscripten_memcpy_big,_llvm_floor_f64:_llvm_floor_f64,DYNAMICTOP_PTR:DYNAMICTOP_PTR,tempDoublePtr:tempDoublePtr,ABORT:ABORT,STACKTOP:STACKTOP,STACK_MAX:STACK_MAX};var asm=function(global,env,buffer){"almost asm";var Int8View=global.Int8Array;var HEAP8=new Int8View(buffer);var Int16View=global.Int16Array;var HEAP16=new Int16View(buffer);var Int32View=global.Int32Array;var HEAP32=new Int32View(buffer);var Uint8View=global.Uint8Array;var HEAPU8=new Uint8View(buffer);var Uint16View=global.Uint16Array;var HEAPU16=new Uint16View(buffer);var Uint32View=global.Uint32Array;var HEAPU32=new Uint32View(buffer);var Float32View=global.Float32Array;var HEAPF32=new Float32View(buffer);var Float64View=global.Float64Array;var HEAPF64=new Float64View(buffer);var byteLength=global.byteLength;var DYNAMICTOP_PTR=env.DYNAMICTOP_PTR|0;var tempDoublePtr=env.tempDoublePtr|0;var ABORT=env.ABORT|0;var STACKTOP=env.STACKTOP|0;var STACK_MAX=env.STACK_MAX|0;var __THREW__=0;var threwValue=0;var setjmpId=0;var undef=0;var nan=global.NaN,inf=global.Infinity;var tempInt=0,tempBigInt=0,tempBigIntS=0,tempValue=0,tempDouble=0;var tempRet0=0;var Math_floor=global.Math.floor;var Math_abs=global.Math.abs;var Math_sqrt=global.Math.sqrt;var Math_pow=global.Math.pow;var Math_cos=global.Math.cos;var Math_sin=global.Math.sin;var Math_tan=global.Math.tan;var Math_acos=global.Math.acos;var Math_asin=global.Math.asin;var Math_atan=global.Math.atan;var Math_atan2=global.Math.atan2;var Math_exp=global.Math.exp;var Math_log=global.Math.log;var Math_ceil=global.Math.ceil;var Math_imul=global.Math.imul;var Math_min=global.Math.min;var Math_max=global.Math.max;var Math_clz32=global.Math.clz32;var abort=env.abort;var assert=env.assert;var enlargeMemory=env.enlargeMemory;var getTotalMemory=env.getTotalMemory;var abortOnCannotGrowMemory=env.abortOnCannotGrowMemory;var invoke_iii=env.invoke_iii;var ___assert_fail=env.___assert_fail;var ___setErrNo=env.___setErrNo;var _abort=env._abort;var _emscripten_memcpy_big=env._emscripten_memcpy_big;var _llvm_floor_f64=env._llvm_floor_f64;var tempFloat=0;function _emscripten_replace_memory(newBuffer){if(byteLength(newBuffer)&16777215||byteLength(newBuffer)<=16777215||byteLength(newBuffer)>2147483648)return false;HEAP8=new Int8View(newBuffer);HEAP16=new Int16View(newBuffer);HEAP32=new Int32View(newBuffer);HEAPU8=new Uint8View(newBuffer);HEAPU16=new Uint16View(newBuffer);HEAPU32=new Uint32View(newBuffer);HEAPF32=new Float32View(newBuffer);HEAPF64=new Float64View(newBuffer);buffer=newBuffer;return true}function _start_decoder($0){$0=$0|0;var $$09051277=0,$$09131233=0,$$09311258=0,$$0940$lcssa=0,$$09401127=0,$$09421126=0,$$0943$lcssa=0,$$09431221=0,$$0964=0,$$0967$lcssa=0,$$09671242=0,$$09701232=0,$$097411701468=0,$$0975=0,$$09771238=0,$$0979=0,$$09801239$in=0,$$09821263=0,$$09861184=0,$$09881256=0,$$09911252=0,$$109231212=0,$$119241216=0,$$129251158=0,$$139261165=0,$$149271175=0,$$159281145=0,$$169291142=0,$$179301148=0,$$19061269=0,$$19141243=0,$$19321190=0,$$1968=0,$$197610191022=0,$$19761020=0,$$1983$lcssa=0,$$19831257=0,$$29071228=0,$$29151247=0,$$29331199=0,$$2966=0,$$2972$ph=0,$$2990$ph=0,$$34=0,$$39081222=0,$$39161264=0,$$39341164=0,$$3973=0,$$49091180=0,$$49171253=0,$$493511711467=0,$$493511711469=0,$$59101153=0,$$59181125=0,$$59361139=0,$$69111135=0,$$69191185=0,$$79121131=0,$$79201194=0,$$89211203=0,$$99221207=0,$$lcssa=0,$$lcssa1069=0,$$lcssa1081=0,$$sink=0,$$sink1331=0,$$sink1476=0,$1=0,$100=0,$102=0,$103=0,$109=0,$110=0,$111=0,$121=0,$125=0,$126=0,$127=0,$134=0,$135=0,$137=0,$139=0,$140=0,$141=0,$144=0,$147=0,$149=0,$152=0,$153=0,$156=0,$158=0,$164=0,$166=0,$173=0,$181=0,$186=0,$190=0,$191=0,$195=0,$196=0,$198=0,$2=0,$201=0,$208=0,$210=0,$213=0,$218=0,$22=0,$223=0,$226=0,$227=0,$228=0,$231=0,$236=0,$237=0,$238=0,$242=0,$248=0,$249=0,$256=0,$261=0,$263=0,$264=0,$268=0,$269=0,$271=0,$272=0,$275=0,$276=0,$278=0,$279=0,$282=0,$283=0,$286=0,$289=0,$291=0,$295=0,$3=0,$302=0,$307=0,$308=0,$314=0,$319=0,$321=0,$322=0,$323=0,$327=0,$329=0,$330=0,$332=0,$341=0,$345=0,$353=0,$356=0,$359=0,$367=0,$373=0,$379=0,$386=0,$387=0,$389=0,$390=0,$394=0,$397=0,$4=0,$400=0,$402=0,$405=0,$408=0,$411=0,$414=0,$417=0,$419=0,$422=0,$424=0,$430=0,$431=0,$433=0,$436=0,$439=0,$447=0,$450=0,$451=0,$453=0,$466=0,$476=0,$478=0,$480=0,$481=0,$486=0,$487=0,$492=0,$498=0,$499=0,$501=0,$508=0,$510=0,$519=0,$52=0,$520=0,$521=0,$528=0,$538=0,$54=0,$541=0,$545=0,$546=0,$548=0,$549=0,$555=0,$556=0,$561=0,$562=0,$563=0,$568=0,$57=0,$572=0,$573=0,$574=0,$576=0,$582=0,$59=0,$591=0,$596=0,$597=0,$60=0,$603=0,$607=0,$609=0,$61=0,$615=0,$62=0,$628=0,$629=0,$637=0,$639=0,$64=0,$644=0,$645=0,$646=0,$647=0,$652=0,$66=0,$660=0,$679=0,$680=0,$682=0,$683=0,$689=0,$690=0,$695=0,$696=0,$703=0,$707=0,$716=0,$719=0,$725=0,$726=0,$727=0,$730=0,$739=0,$741=0,$742=0,$747=0,$752=0,$762=0,$763=0,$764=0,$77=0,$778=0,$779=0,$78=0,$785=0,$788=0,$789=0,$791=0,$792=0,$793=0,$808=0,$809=0,$813=0,$814=0,$815=0,$817=0,$835=0,$838=0,$839=0,$841=0,$842=0,$844=0,$847=0,$853=0,$858=0,$866=0,$87=0,$875=0,$877=0,$878=0,$879=0,$880=0,$881=0,$9=0,$93=0,$99=0,$spec$select=0,$spec$select1009=0,label=0,sp=0,$$09771238$looptemp=0,$$493511711469$looptemp=0;sp=STACKTOP;STACKTOP=STACKTOP+1024|0;$1=sp+1008|0;$2=sp;$3=sp+1004|0;$4=sp+1e3|0;L1:do{if(!(_start_page($0)|0))$$34=0;else{$9=HEAPU8[$0+1363>>0]|0;if(!($9&2)){_error($0,34);$$34=0;break}if($9&4|0){_error($0,34);$$34=0;break}if($9&1|0){_error($0,34);$$34=0;break}if((HEAP32[$0+1104>>2]|0)!=1){_error($0,34);$$34=0;break}switch(HEAP8[$0+1108>>0]|0){case 30:{if((_get8($0)|0)<<24>>24!=1){_error($0,34);$$34=0;break L1}if(!(_getn($0,$1,6)|0)){_error($0,10);$$34=0;break L1}if(!(_vorbis_validate($1)|0)){_error($0,34);$$34=0;break L1}if(_get32($0)|0){_error($0,34);$$34=0;break L1}$52=_get8($0)|0;$54=$0+4|0;HEAP32[$54>>2]=$52&255;if(!($52<<24>>24)){_error($0,34);$$34=0;break L1}if(($52&255)>16){_error($0,5);$$34=0;break L1}$57=_get32($0)|0;HEAP32[$0>>2]=$57;if(!$57){_error($0,34);$$34=0;break L1}_get32($0)|0;_get32($0)|0;_get32($0)|0;$59=_get8($0)|0;$60=$59&255;$61=$60&15;$62=$60>>>4;$64=$0+100|0;HEAP32[$64>>2]=1<<$61;$66=$0+104|0;HEAP32[$66>>2]=1<<$62;if(($61+-6|0)>>>0>7){_error($0,20);$$34=0;break L1}if($59+-96<<24>>24<<24>>24<0){_error($0,20);$$34=0;break L1}if($61>>>0>$62>>>0){_error($0,20);$$34=0;break L1}if(!((_get8($0)|0)&1)){_error($0,34);$$34=0;break L1}if(!(_start_page($0)|0)){$$34=0;break L1}if(!(_start_packet($0)|0)){$$34=0;break L1}$77=$0+1364|0;do{$78=_next_segment($0)|0;_skip($0,$78);HEAP8[$77>>0]=0}while(($78|0)!=0);if(!(_start_packet($0)|0)){$$34=0;break L1}do{if(HEAP8[$0+36>>0]|0){if(_is_whole_packet_present($0,1)|0)break;$87=$0+88|0;if((HEAP32[$87>>2]|0)!=21){$$34=0;break L1}HEAP32[$87>>2]=20;$$34=0;break L1}}while(0);_crc32_init();if((_get8_packet($0)|0)!=5){_error($0,20);$$34=0;break L1}$$09051277=0;do{$93=(_get8_packet($0)|0)&255;HEAP8[$1+$$09051277>>0]=$93;$$09051277=$$09051277+1|0}while(($$09051277|0)!=6);if(!(_vorbis_validate($1)|0)){_error($0,20);$$34=0;break L1}$99=(_get_bits($0,8)|0)+1|0;$100=$0+108|0;HEAP32[$100>>2]=$99;$102=_setup_malloc($0,$99*2096|0)|0;$103=$0+112|0;HEAP32[$103>>2]=$102;if(!$102){_error($0,3);$$34=0;break L1}_memset($102|0,0,(HEAP32[$100>>2]|0)*2096|0)|0;L73:do{if((HEAP32[$100>>2]|0)>0){$109=$0+16|0;$$19061269=0;L75:while(1){$110=HEAP32[$103>>2]|0;$111=$110+($$19061269*2096|0)|0;if(((_get_bits($0,8)|0)&255|0)!=66){label=63;break}if(((_get_bits($0,8)|0)&255|0)!=67){label=65;break}if(((_get_bits($0,8)|0)&255|0)!=86){label=67;break}$121=_get_bits($0,8)|0;$125=(_get_bits($0,8)|0)<<8|$121&255;HEAP32[$111>>2]=$125;$126=_get_bits($0,8)|0;$127=_get_bits($0,8)|0;$134=$127<<8&65280|$126&255|(_get_bits($0,8)|0)<<16;$135=$110+($$19061269*2096|0)+4|0;HEAP32[$135>>2]=$134;$137=(_get_bits($0,1)|0)!=0;if($137)$140=0;else $140=_get_bits($0,1)|0;$139=$140&255;$141=$110+($$19061269*2096|0)+23|0;HEAP8[$141>>0]=$139;$144=HEAP32[$135>>2]|0;if(!(HEAP32[$111>>2]|0))if(!$144)$147=0;else{label=72;break}else $147=$144;if(!($139<<24>>24)){$149=_setup_malloc($0,$147)|0;HEAP32[$110+($$19061269*2096|0)+8>>2]=$149;$$0975=$149}else $$0975=_setup_temp_malloc($0,$147)|0;if(!$$0975){label=77;break}do{if($137){$152=_get_bits($0,5)|0;$153=HEAP32[$135>>2]|0;if(($153|0)<=0){$$3973=0;$186=$153;break}$$09771238=0;$$09801239$in=$152;$156=$153;while(1){$$09801239$in=$$09801239$in+1|0;$158=_get_bits($0,_ilog($156-$$09771238|0)|0)|0;$$09771238$looptemp=$$09771238;$$09771238=$158+$$09771238|0;if(($$09771238|0)>(HEAP32[$135>>2]|0)){label=83;break L75}_memset($$0975+$$09771238$looptemp|0,$$09801239$in&255|0,$158|0)|0;$164=HEAP32[$135>>2]|0;if(($164|0)<=($$09771238|0)){$$3973=0;$186=$164;break}else $156=$164}}else{$166=HEAP32[$135>>2]|0;if(($166|0)<=0){$$3973=0;$186=$166;break}$$09131233=0;$$09701232=0;while(1){do{if(!(HEAP8[$141>>0]|0))label=88;else{if(_get_bits($0,1)|0){label=88;break}HEAP8[$$0975+$$09131233>>0]=-1;$$2972$ph=$$09701232}}while(0);if((label|0)==88){label=0;$173=(_get_bits($0,5)|0)+1|0;HEAP8[$$0975+$$09131233>>0]=$173;if(($173&255|0)==32){label=90;break L75}else $$2972$ph=$$09701232+1|0}$$09131233=$$09131233+1|0;$181=HEAP32[$135>>2]|0;if(($$09131233|0)>=($181|0)){$$3973=$$2972$ph;$186=$181;break}else $$09701232=$$2972$ph}}}while(0);do{if(!(HEAP8[$141>>0]|0)){$$19761020=$$0975;$198=$186;label=100}else{if(($$3973|0)>=($186>>2|0)){if(($186|0)>(HEAP32[$109>>2]|0))HEAP32[$109>>2]=$186;$190=_setup_malloc($0,$186)|0;$191=$110+($$19061269*2096|0)+8|0;HEAP32[$191>>2]=$190;if(!$190){label=97;break L75}_memcpy($190|0,$$0975|0,HEAP32[$135>>2]|0)|0;_setup_temp_free($0,$$0975,HEAP32[$135>>2]|0);$195=HEAP32[$191>>2]|0;HEAP8[$141>>0]=0;$$19761020=$195;$198=HEAP32[$135>>2]|0;label=100;break}$196=$110+($$19061269*2096|0)+2092|0;HEAP32[$196>>2]=$$3973;if(!$$3973){$$0964=0;$226=0;$228=$186;$877=0}else{$213=_setup_malloc($0,$$3973)|0;HEAP32[$110+($$19061269*2096|0)+8>>2]=$213;if(!$213){label=107;break L75}$218=_setup_temp_malloc($0,HEAP32[$196>>2]<<2)|0;HEAP32[$110+($$19061269*2096|0)+32>>2]=$218;if(!$218){label=109;break L75}$223=_setup_temp_malloc($0,HEAP32[$196>>2]<<2)|0;if(!$223){label=112;break L75}$$0964=$223;$226=HEAP32[$196>>2]|0;$228=HEAP32[$135>>2]|0;$877=$223}$227=($226<<3)+$228|0;if($227>>>0<=(HEAP32[$109>>2]|0)>>>0){$$197610191022=$$0975;$$2966=$$0964;$231=$228;$236=$877;$238=$196;break}HEAP32[$109>>2]=$227;$$197610191022=$$0975;$$2966=$$0964;$231=$228;$236=$877;$238=$196}}while(0);if((label|0)==100){label=0;if(($198|0)>0){$$09671242=0;$$19141243=0;while(1){$201=HEAP8[$$19761020+$$19141243>>0]|0;$$1968=$$09671242+(($201&255)>10&$201<<24>>24!=-1&1)|0;$$19141243=$$19141243+1|0;if(($$19141243|0)>=($198|0)){$$0967$lcssa=$$1968;break}else $$09671242=$$1968}}else $$0967$lcssa=0;$208=$110+($$19061269*2096|0)+2092|0;HEAP32[$208>>2]=$$0967$lcssa;$210=_setup_malloc($0,$198<<2)|0;HEAP32[$110+($$19061269*2096|0)+32>>2]=$210;if(!$210){label=105;break}$$197610191022=$$19761020;$$2966=0;$231=HEAP32[$135>>2]|0;$236=0;$238=$208}if(!(_compute_codewords($111,$$197610191022,$231,$$2966)|0)){label=116;break}$237=HEAP32[$238>>2]|0;if($237|0){$242=_setup_malloc($0,($237<<2)+4|0)|0;HEAP32[$110+($$19061269*2096|0)+2084>>2]=$242;if(!$242){label=121;break}$248=_setup_malloc($0,(HEAP32[$238>>2]<<2)+4|0)|0;$249=$110+($$19061269*2096|0)+2088|0;HEAP32[$249>>2]=$248;if(!$248){label=123;break}HEAP32[$249>>2]=$248+4;HEAP32[$248>>2]=-1;_compute_sorted_huffman($111,$$197610191022,$$2966)}if(HEAP8[$141>>0]|0){_setup_temp_free($0,$236,HEAP32[$238>>2]<<2);$256=$110+($$19061269*2096|0)+32|0;_setup_temp_free($0,HEAP32[$256>>2]|0,HEAP32[$238>>2]<<2);_setup_temp_free($0,$$197610191022,HEAP32[$135>>2]|0);HEAP32[$256>>2]=0}_compute_accelerated_huffman($111);$261=_get_bits($0,4)|0;$263=$110+($$19061269*2096|0)+21|0;HEAP8[$263>>0]=$261;$264=$261&255;if($264>>>0>2){label=128;break}if($264|0){$268=+_float32_unpack(_get_bits($0,32)|0);$269=$110+($$19061269*2096|0)+12|0;HEAPF32[$269>>2]=$268;$271=+_float32_unpack(_get_bits($0,32)|0);$272=$110+($$19061269*2096|0)+16|0;HEAPF32[$272>>2]=$271;$275=(_get_bits($0,4)|0)+1&255;$276=$110+($$19061269*2096|0)+20|0;HEAP8[$276>>0]=$275;$278=(_get_bits($0,1)|0)&255;$279=$110+($$19061269*2096|0)+22|0;HEAP8[$279>>0]=$278;$282=HEAP32[$135>>2]|0;$283=HEAP32[$111>>2]|0;if((HEAP8[$263>>0]|0)==1)$$sink=_lookup1_values($282,$283)|0;else $$sink=Math_imul($283,$282)|0;$286=$110+($$19061269*2096|0)+24|0;HEAP32[$286>>2]=$$sink;if(!$$sink){label=134;break}$289=_setup_temp_malloc($0,$$sink<<1)|0;if(!$289){label=136;break}$291=HEAP32[$286>>2]|0;if(($291|0)>0){$$29151247=0;while(1){$295=_get_bits($0,HEAPU8[$276>>0]|0)|0;if(($295|0)==-1){label=140;break L75}HEAP16[$289+($$29151247<<1)>>1]=$295;$$29151247=$$29151247+1|0;$302=HEAP32[$286>>2]|0;if(($$29151247|0)>=($302|0)){$$lcssa1081=$302;break}}}else $$lcssa1081=$291;do{if((HEAP8[$263>>0]|0)==1){$307=(HEAP8[$141>>0]|0)!=0;if($307){$308=HEAP32[$238>>2]|0;if(!$308){$373=$$lcssa1081;break}else $$sink1476=$308}else $$sink1476=HEAP32[$135>>2]|0;$314=_setup_malloc($0,Math_imul($$sink1476<<2,HEAP32[$111>>2]|0)|0)|0;HEAP32[$110+($$19061269*2096|0)+28>>2]=$314;if(!$314){label=147;break L75}$319=HEAP32[($307?$238:$135)>>2]|0;if(($319|0)>0){$321=$110+($$19061269*2096|0)+2088|0;$322=HEAP32[$111>>2]|0;$323=($322|0)>0;$$09821263=0;$$39161264=0;while(1){if($307)$332=HEAP32[(HEAP32[$321>>2]|0)+($$39161264<<2)>>2]|0;else $332=$$39161264;if($323){$327=HEAP32[$286>>2]|0;$329=(HEAP8[$279>>0]|0)==0;$330=Math_imul($322,$$39161264)|0;$$09311258=0;$$09881256=1;$$19831257=$$09821263;while(1){$341=$$19831257+(+HEAPF32[$272>>2]*+(HEAPU16[$289+((((($332>>>0)/($$09881256>>>0)|0)>>>0)%($327>>>0)|0)<<1)>>1]|0)+ +HEAPF32[$269>>2]);HEAPF32[$314+($330+$$09311258<<2)>>2]=$341;$spec$select=$329?$$19831257:$341;$$09311258=$$09311258+1|0;$345=($$09311258|0)<($322|0);if($345){if($$09881256>>>0>(4294967295/($327>>>0)|0)>>>0){label=158;break L75}$$2990$ph=Math_imul($327,$$09881256)|0}else $$2990$ph=$$09881256;if(!$345){$$1983$lcssa=$spec$select;break}else{$$09881256=$$2990$ph;$$19831257=$spec$select}}}else $$1983$lcssa=$$09821263;$$39161264=$$39161264+1|0;if(($$39161264|0)>=($319|0))break;else $$09821263=$$1983$lcssa}}HEAP8[$263>>0]=2;$373=HEAP32[$286>>2]|0}else{$353=_setup_malloc($0,$$lcssa1081<<2)|0;HEAP32[$110+($$19061269*2096|0)+28>>2]=$353;$356=HEAP32[$286>>2]|0;if(!$353){label=165;break L75}if(($356|0)<=0){$373=$356;break}$359=(HEAP8[$279>>0]|0)==0;$$09911252=0;$$49171253=0;while(1){$367=$$09911252+(+HEAPF32[$272>>2]*+(HEAPU16[$289+($$49171253<<1)>>1]|0)+ +HEAPF32[$269>>2]);HEAPF32[$353+($$49171253<<2)>>2]=$367;$$49171253=$$49171253+1|0;if(($$49171253|0)>=($356|0)){$373=$356;break}else $$09911252=$359?$$09911252:$367}}}while(0);_setup_temp_free($0,$289,$373<<1)}$$19061269=$$19061269+1|0;if(($$19061269|0)>=(HEAP32[$100>>2]|0))break L73}switch(label|0){case 63:{_error($0,20);$$34=0;break L1;break}case 65:{_error($0,20);$$34=0;break L1;break}case 67:{_error($0,20);$$34=0;break L1;break}case 72:{_error($0,20);$$34=0;break L1;break}case 77:{_error($0,3);$$34=0;break L1;break}case 83:{_error($0,20);$$34=0;break L1;break}case 90:{_error($0,20);$$34=0;break L1;break}case 97:{_error($0,3);$$34=0;break L1;break}case 105:{_error($0,3);$$34=0;break L1;break}case 107:{_error($0,3);$$34=0;break L1;break}case 109:{_error($0,3);$$34=0;break L1;break}case 112:{_error($0,3);$$34=0;break L1;break}case 116:{if(HEAP8[$141>>0]|0)_setup_temp_free($0,$236,0);_error($0,20);$$34=0;break L1;break}case 121:{_error($0,3);$$34=0;break L1;break}case 123:{_error($0,3);$$34=0;break L1;break}case 128:{_error($0,20);$$34=0;break L1;break}case 134:{_error($0,20);$$34=0;break L1;break}case 136:{_error($0,3);$$34=0;break L1;break}case 140:{_setup_temp_free($0,$289,HEAP32[$286>>2]<<1);_error($0,20);$$34=0;break L1;break}case 147:{_setup_temp_free($0,$289,HEAP32[$286>>2]<<1);_error($0,3);$$34=0;break L1;break}case 158:{_setup_temp_free($0,$289,$327<<1);_error($0,20);$$34=0;break L1;break}case 165:{_setup_temp_free($0,$289,$356<<1);_error($0,3);$$34=0;break L1;break}}}}while(0);$379=(_get_bits($0,6)|0)+1&255;L215:do{if($379|0){$$29071228=0;while(1){$$29071228=$$29071228+1|0;if(_get_bits($0,16)|0)break;if($$29071228>>>0>=$379>>>0)break L215}_error($0,20);$$34=0;break L1}}while(0);$386=(_get_bits($0,6)|0)+1|0;$387=$0+116|0;HEAP32[$387>>2]=$386;$389=_setup_malloc($0,$386*1596|0)|0;$390=$0+248|0;HEAP32[$390>>2]=$389;if(!$389){_error($0,3);$$34=0;break L1}do{if((HEAP32[$387>>2]|0)>0){$$09431221=0;$$39081222=0;L227:while(1){$394=_get_bits($0,16)|0;HEAP16[$0+120+($$39081222<<1)>>1]=$394;$397=$394&65535;if($397>>>0>1){label=178;break}if(!$397){label=180;break}$430=HEAP32[$390>>2]|0;$431=_get_bits($0,5)|0;$433=$430+($$39081222*1596|0)|0;HEAP8[$433>>0]=$431;if($431&255|0){$$09861184=-1;$$69191185=0;do{$436=_get_bits($0,4)|0;HEAP8[$430+($$39081222*1596|0)+1+$$69191185>>0]=$436;$439=$436&255;$$09861184=($439|0)>($$09861184|0)?$439:$$09861184;$$69191185=$$69191185+1|0}while($$69191185>>>0<(HEAPU8[$433>>0]|0)>>>0);$$79201194=0;while(1){$447=(_get_bits($0,3)|0)+1&255;HEAP8[$430+($$39081222*1596|0)+33+$$79201194>>0]=$447;$450=(_get_bits($0,2)|0)&255;$451=$430+($$39081222*1596|0)+49+$$79201194|0;HEAP8[$451>>0]=$450;if(!($450<<24>>24))label=192;else{$453=_get_bits($0,8)|0;HEAP8[$430+($$39081222*1596|0)+65+$$79201194>>0]=$453;if(($453&255|0)>=(HEAP32[$100>>2]|0)){label=190;break L227}if((HEAP8[$451>>0]|0)!=31)label=192}if((label|0)==192){label=0;$$19321190=0;do{$466=(_get_bits($0,8)|0)+65535|0;HEAP16[$430+($$39081222*1596|0)+82+($$79201194<<4)+($$19321190<<1)>>1]=$466;$$19321190=$$19321190+1|0;if(($466<<16>>16|0)>=(HEAP32[$100>>2]|0)){label=195;break L227}}while(($$19321190|0)<(1<<HEAPU8[$451>>0]|0))}if(($$79201194|0)<($$09861184|0))$$79201194=$$79201194+1|0;else break}}$476=(_get_bits($0,2)|0)+1&255;HEAP8[$430+($$39081222*1596|0)+1588>>0]=$476;$478=_get_bits($0,4)|0;$480=$430+($$39081222*1596|0)+1589|0;HEAP8[$480>>0]=$478;$481=$430+($$39081222*1596|0)+338|0;HEAP16[$481>>1]=0;HEAP16[$430+($$39081222*1596|0)+340>>1]=1<<($478&255);$486=$430+($$39081222*1596|0)+1592|0;HEAP32[$486>>2]=2;$487=HEAP8[$433>>0]|0;if(!($487<<24>>24)){$519=2;label=205}else{$$89211203=0;$878=2;$879=$487;while(1){$492=(HEAPU8[$430+($$39081222*1596|0)+1+$$89211203>>0]|0)+($430+($$39081222*1596|0)+33)|0;if(!(HEAP8[$492>>0]|0)){$508=$879;$510=$878}else{$$29331199=0;do{$498=(_get_bits($0,HEAPU8[$480>>0]|0)|0)&65535;$499=HEAP32[$486>>2]|0;HEAP16[$430+($$39081222*1596|0)+338+($499<<1)>>1]=$498;$501=$499+1|0;HEAP32[$486>>2]=$501;$$29331199=$$29331199+1|0}while($$29331199>>>0<(HEAPU8[$492>>0]|0)>>>0);$508=HEAP8[$433>>0]|0;$510=$501}$$89211203=$$89211203+1|0;if($$89211203>>>0>=($508&255)>>>0)break;else{$878=$510;$879=$508}}if(($510|0)>0){$519=$510;label=205}else $520=$510}if((label|0)==205){label=0;$$99221207=0;do{HEAP16[$2+($$99221207<<2)>>1]=HEAP16[$430+($$39081222*1596|0)+338+($$99221207<<1)>>1]|0;HEAP16[$2+($$99221207<<2)+2>>1]=$$99221207;$$99221207=$$99221207+1|0}while(($$99221207|0)<($519|0));$520=$519}_qsort($2,$520,4,1);$521=HEAP32[$486>>2]|0;do{if(($521|0)>0){$$109231212=0;do{HEAP8[$430+($$39081222*1596|0)+838+$$109231212>>0]=HEAP16[$2+($$109231212<<2)+2>>1];$$109231212=$$109231212+1|0;$528=HEAP32[$486>>2]|0}while(($$109231212|0)<($528|0));if(($528|0)<=2){$$lcssa1069=$528;break}$$119241216=2;do{_neighbors($481,$$119241216,$3,$4);HEAP8[$430+($$39081222*1596|0)+1088+($$119241216<<1)>>0]=HEAP32[$3>>2];HEAP8[$430+($$39081222*1596|0)+1088+($$119241216<<1)+1>>0]=HEAP32[$4>>2];$$119241216=$$119241216+1|0;$538=HEAP32[$486>>2]|0}while(($$119241216|0)<($538|0));$$lcssa1069=$538}else $$lcssa1069=$521}while(0);$$09431221=($$lcssa1069|0)>($$09431221|0)?$$lcssa1069:$$09431221;$541=$$39081222+1|0;if(($541|0)>=(HEAP32[$387>>2]|0)){label=215;break}else $$39081222=$541}if((label|0)==178){_error($0,20);$$34=0;break L1}else if((label|0)==180){$400=HEAP32[$390>>2]|0;$402=(_get_bits($0,8)|0)&255;HEAP8[$400+($$39081222*1596|0)>>0]=$402;$405=(_get_bits($0,16)|0)&65535;HEAP16[$400+($$39081222*1596|0)+2>>1]=$405;$408=(_get_bits($0,16)|0)&65535;HEAP16[$400+($$39081222*1596|0)+4>>1]=$408;$411=(_get_bits($0,6)|0)&255;HEAP8[$400+($$39081222*1596|0)+6>>0]=$411;$414=(_get_bits($0,8)|0)&255;HEAP8[$400+($$39081222*1596|0)+7>>0]=$414;$417=(_get_bits($0,4)|0)+1|0;$419=$400+($$39081222*1596|0)+8|0;HEAP8[$419>>0]=$417;if($417&255|0){$422=$400+($$39081222*1596|0)+9|0;$$59181125=0;do{$424=(_get_bits($0,8)|0)&255;HEAP8[$422+$$59181125>>0]=$424;$$59181125=$$59181125+1|0}while($$59181125>>>0<(HEAPU8[$419>>0]|0)>>>0)}_error($0,4);$$34=0;break L1}else if((label|0)==190)_error($0,20);else if((label|0)==195)_error($0,20);else if((label|0)==215){$$0943$lcssa=$$09431221<<1;break}$$34=0;break L1}else $$0943$lcssa=0}while(0);$545=(_get_bits($0,6)|0)+1|0;$546=$0+252|0;HEAP32[$546>>2]=$545;$548=_setup_malloc($0,$545*24|0)|0;$549=$0+384|0;HEAP32[$549>>2]=$548;if(!$548){_error($0,3);$$34=0;break L1}_memset($548|0,0,(HEAP32[$546>>2]|0)*24|0)|0;L289:do{if((HEAP32[$546>>2]|0)>0){$$49091180=0;L291:while(1){$555=HEAP32[$549>>2]|0;$556=_get_bits($0,16)|0;HEAP16[$0+256+($$49091180<<1)>>1]=$556;if(($556&65535)>>>0>2){label=221;break}$561=_get_bits($0,24)|0;$562=$555+($$49091180*24|0)|0;HEAP32[$562>>2]=$561;$563=_get_bits($0,24)|0;HEAP32[$555+($$49091180*24|0)+4>>2]=$563;if($563>>>0<(HEAP32[$562>>2]|0)>>>0){label=223;break}$568=(_get_bits($0,24)|0)+1|0;HEAP32[$555+($$49091180*24|0)+8>>2]=$568;$572=(_get_bits($0,6)|0)+1&255;$573=$555+($$49091180*24|0)+12|0;HEAP8[$573>>0]=$572;$574=_get_bits($0,8)|0;$576=$555+($$49091180*24|0)+13|0;HEAP8[$576>>0]=$574;if(($574&255|0)>=(HEAP32[$100>>2]|0)){label=225;break}if(!(HEAP8[$573>>0]|0))$$lcssa=0;else{$$129251158=0;do{$582=_get_bits($0,3)|0;if(!(_get_bits($0,1)|0))$$0979=0;else $$0979=_get_bits($0,5)|0;HEAP8[$2+$$129251158>>0]=($$0979<<3)+$582;$$129251158=$$129251158+1|0;$591=HEAP8[$573>>0]|0}while($$129251158>>>0<($591&255)>>>0);$$lcssa=$591&255}$596=_setup_malloc($0,$$lcssa<<4)|0;$597=$555+($$49091180*24|0)+20|0;HEAP32[$597>>2]=$596;if(!$596){label=233;break}if(HEAP8[$573>>0]|0){$$139261165=0;$880=$596;while(1){$603=HEAPU8[$2+$$139261165>>0]|0;$$39341164=0;$615=$880;while(1){if(!(1<<$$39341164&$603)){HEAP16[$615+($$139261165<<4)+($$39341164<<1)>>1]=-1;$881=$615}else{$607=_get_bits($0,8)|0;$609=HEAP32[$597>>2]|0;HEAP16[$609+($$139261165<<4)+($$39341164<<1)>>1]=$607;if((HEAP32[$100>>2]|0)>($607<<16>>16|0))$881=$609;else{label=239;break L291}}$$39341164=$$39341164+1|0;if($$39341164>>>0>=8)break;else $615=$881}$$139261165=$$139261165+1|0;if($$139261165>>>0>=(HEAPU8[$573>>0]|0)>>>0)break;else $880=$881}}$628=_setup_malloc($0,HEAP32[(HEAP32[$103>>2]|0)+((HEAPU8[$576>>0]|0)*2096|0)+4>>2]<<2)|0;$629=$555+($$49091180*24|0)+16|0;HEAP32[$629>>2]=$628;if(!$628){label=244;break}_memset($628|0,0,HEAP32[(HEAP32[$103>>2]|0)+((HEAPU8[$576>>0]|0)*2096|0)+4>>2]<<2|0)|0;$637=HEAP32[$103>>2]|0;$639=HEAPU8[$576>>0]|0;if((HEAP32[$637+($639*2096|0)+4>>2]|0)>0){$$149271175=0;$644=$637;$645=$639;do{$646=HEAP32[$644+($645*2096|0)>>2]|0;$647=_setup_malloc($0,$646)|0;HEAP32[(HEAP32[$629>>2]|0)+($$149271175<<2)>>2]=$647;$652=HEAP32[(HEAP32[$629>>2]|0)+($$149271175<<2)>>2]|0;if(!$652){label=252;break L291}do{if(($646|0)>0){$$493511711467=$646+-1|0;HEAP8[$652+$$493511711467>>0]=($$149271175>>>0)%((HEAPU8[$573>>0]|0)>>>0)|0;if(($646|0)==1)break;$$097411701468=$$149271175;$$493511711469=$$493511711467;do{$660=HEAP8[$573>>0]|0;$$097411701468=($$097411701468|0)/($660&255|0)|0;$$493511711469$looptemp=$$493511711469;$$493511711469=$$493511711469+-1|0;HEAP8[(HEAP32[(HEAP32[$629>>2]|0)+($$149271175<<2)>>2]|0)+$$493511711469>>0]=($$097411701468|0)%($660&255|0)|0}while(($$493511711469$looptemp|0)>1)}}while(0);$$149271175=$$149271175+1|0;$644=HEAP32[$103>>2]|0;$645=HEAPU8[$576>>0]|0}while(($$149271175|0)<(HEAP32[$644+($645*2096|0)+4>>2]|0))}$$49091180=$$49091180+1|0;if(($$49091180|0)>=(HEAP32[$546>>2]|0))break L289}if((label|0)==221)_error($0,20);else if((label|0)==223)_error($0,20);else if((label|0)==225)_error($0,20);else if((label|0)==233)_error($0,3);else if((label|0)==239)_error($0,20);else if((label|0)==244)_error($0,3);else if((label|0)==252)_error($0,3);$$34=0;break L1}}while(0);$679=(_get_bits($0,6)|0)+1|0;$680=$0+388|0;HEAP32[$680>>2]=$679;$682=_setup_malloc($0,$679*40|0)|0;$683=$0+392|0;HEAP32[$683>>2]=$682;if(!$682){_error($0,3);$$34=0;break L1}_memset($682|0,0,(HEAP32[$680>>2]|0)*40|0)|0;L344:do{if((HEAP32[$680>>2]|0)>0){$$59101153=0;L346:while(1){$689=HEAP32[$683>>2]|0;$690=$689+($$59101153*40|0)|0;if(_get_bits($0,16)|0){label=261;break}$695=_setup_malloc($0,(HEAP32[$54>>2]|0)*3|0)|0;$696=$689+($$59101153*40|0)+4|0;HEAP32[$696>>2]=$695;if(!$695){label=263;break}if(!(_get_bits($0,1)|0))$$sink1331=1;else $$sink1331=(_get_bits($0,4)|0)+1&255;$703=$689+($$59101153*40|0)+8|0;HEAP8[$703>>0]=$$sink1331;do{if(!(_get_bits($0,1)|0))HEAP16[$690>>1]=0;else{$707=(_get_bits($0,8)|0)+1|0;HEAP16[$690>>1]=$707;if(!($707&65535))break;$$59361139=0;$716=HEAP32[$54>>2]|0;do{$719=(_get_bits($0,_ilog($716+-1|0)|0)|0)&255;HEAP8[(HEAP32[$696>>2]|0)+($$59361139*3|0)>>0]=$719;$725=_get_bits($0,_ilog((HEAP32[$54>>2]|0)+-1|0)|0)|0;$726=$725&255;$727=HEAP32[$696>>2]|0;HEAP8[$727+($$59361139*3|0)+1>>0]=$726;$730=HEAP8[$727+($$59361139*3|0)>>0]|0;$716=HEAP32[$54>>2]|0;if(($716|0)<=($730&255|0)){label=271;break L346}if(($716|0)<=($725&255|0)){label=273;break L346}$$59361139=$$59361139+1|0;if($730<<24>>24==$726<<24>>24){label=275;break L346}}while($$59361139>>>0<(HEAPU16[$690>>1]|0)>>>0)}}while(0);if(_get_bits($0,2)|0){label=278;break}$739=HEAP8[$703>>0]|0;$741=HEAP32[$54>>2]|0;$742=($741|0)>0;do{if(($739&255)>1){if(!$742){label=289;break}$$159281145=0;while(1){$747=(_get_bits($0,4)|0)&255;HEAP8[(HEAP32[$696>>2]|0)+($$159281145*3|0)+2>>0]=$747;$$159281145=$$159281145+1|0;if((HEAPU8[$703>>0]|0)<=($747&255)){label=284;break L346}if(($$159281145|0)>=(HEAP32[$54>>2]|0)){label=289;break}}}else{if($742){$752=HEAP32[$696>>2]|0;$$169291142=0;do{HEAP8[$752+($$169291142*3|0)+2>>0]=0;$$169291142=$$169291142+1|0}while(($$169291142|0)<($741|0))}if($739<<24>>24)label=289}}while(0);if((label|0)==289){label=0;$$179301148=0;do{_get_bits($0,8)|0;$762=(_get_bits($0,8)|0)&255;$763=$689+($$59101153*40|0)+9+$$179301148|0;HEAP8[$763>>0]=$762;$764=_get_bits($0,8)|0;HEAP8[$689+($$59101153*40|0)+24+$$179301148>>0]=$764;if((HEAP32[$387>>2]|0)<=(HEAPU8[$763>>0]|0)){label=292;break L346}$$179301148=$$179301148+1|0;if(($764&255|0)>=(HEAP32[$546>>2]|0)){label=294;break L346}}while($$179301148>>>0<(HEAPU8[$703>>0]|0)>>>0)}$$59101153=$$59101153+1|0;if(($$59101153|0)>=(HEAP32[$680>>2]|0))break L344}if((label|0)==261){_error($0,20);$$34=0;break L1}else if((label|0)==263){_error($0,3);$$34=0;break L1}else if((label|0)==271){_error($0,20);$$34=0;break L1}else if((label|0)==273){_error($0,20);$$34=0;break L1}else if((label|0)==275){_error($0,20);$$34=0;break L1}else if((label|0)==278){_error($0,20);$$34=0;break L1}else if((label|0)==284){_error($0,20);$$34=0;break L1}else if((label|0)==292){_error($0,20);$$34=0;break L1}else if((label|0)==294){_error($0,20);$$34=0;break L1}}}while(0);$778=(_get_bits($0,6)|0)+1|0;$779=$0+396|0;HEAP32[$779>>2]=$778;L394:do{if(($778|0)>0){$$69111135=0;while(1){$785=(_get_bits($0,1)|0)&255;HEAP8[$0+400+($$69111135*6|0)>>0]=$785;$788=(_get_bits($0,16)|0)&65535;$789=$0+400+($$69111135*6|0)+2|0;HEAP16[$789>>1]=$788;$791=(_get_bits($0,16)|0)&65535;$792=$0+400+($$69111135*6|0)+4|0;HEAP16[$792>>1]=$791;$793=_get_bits($0,8)|0;HEAP8[$0+400+($$69111135*6|0)+1>>0]=$793;if(HEAP16[$789>>1]|0){label=300;break}if(HEAP16[$792>>1]|0){label=302;break}$$69111135=$$69111135+1|0;if(($793&255|0)>=(HEAP32[$680>>2]|0)){label=304;break}if(($$69111135|0)>=(HEAP32[$779>>2]|0))break L394}if((label|0)==300){_error($0,20);$$34=0;break L1}else if((label|0)==302){_error($0,20);$$34=0;break L1}else if((label|0)==304){_error($0,20);$$34=0;break L1}}}while(0);_flush_packet($0);HEAP32[$0+980>>2]=0;L406:do{if((HEAP32[$54>>2]|0)>0){$$79121131=0;while(1){$808=_setup_malloc($0,HEAP32[$66>>2]<<2)|0;$809=$0+788+($$79121131<<2)|0;HEAP32[$809>>2]=$808;$813=_setup_malloc($0,HEAP32[$66>>2]<<1&2147483646)|0;$814=$0+916+($$79121131<<2)|0;HEAP32[$814>>2]=$813;$815=_setup_malloc($0,$$0943$lcssa)|0;HEAP32[$0+984+($$79121131<<2)>>2]=$815;$817=HEAP32[$809>>2]|0;if(!$817)break;if(($815|0)==0|(HEAP32[$814>>2]|0)==0)break;_memset($817|0,0,HEAP32[$66>>2]<<2|0)|0;$$79121131=$$79121131+1|0;if(($$79121131|0)>=(HEAP32[$54>>2]|0))break L406}_error($0,3);$$34=0;break L1}}while(0);if(!(_init_blocksize($0,0,HEAP32[$64>>2]|0)|0)){$$34=0;break L1}if(!(_init_blocksize($0,1,HEAP32[$66>>2]|0)|0)){$$34=0;break L1}HEAP32[$0+92>>2]=HEAP32[$64>>2];$835=HEAP32[$66>>2]|0;HEAP32[$0+96>>2]=$835;$838=$835<<1&2147483646;$839=HEAP32[$546>>2]|0;if(($839|0)>0){$841=HEAP32[$549>>2]|0;$842=($835|0)/2|0;$$09401127=0;$$09421126=0;do{$844=HEAP32[$841+($$09421126*24|0)>>2]|0;$847=HEAP32[$841+($$09421126*24|0)+4>>2]|0;$853=((($847>>>0<$842>>>0?$847:$842)-($844>>>0<$842>>>0?$844:$842)|0)>>>0)/((HEAP32[$841+($$09421126*24|0)+8>>2]|0)>>>0)|0;$$09401127=($853|0)>($$09401127|0)?$853:$$09401127;$$09421126=$$09421126+1|0}while(($$09421126|0)<($839|0));$$0940$lcssa=($$09401127<<2)+4|0}else $$0940$lcssa=4;$858=Math_imul(HEAP32[$54>>2]|0,$$0940$lcssa)|0;$spec$select1009=$838>>>0>$858>>>0?$838:$858;HEAP32[$0+12>>2]=$spec$select1009;HEAP8[$0+1365>>0]=1;do{if(HEAP32[$0+68>>2]|0){$866=HEAP32[$0+80>>2]|0;if(($866|0)!=(HEAP32[$0+72>>2]|0))___assert_fail(1468,1076,4128,1524);if(($spec$select1009+1500+(HEAP32[$0+76>>2]|0)|0)>>>0<=$866>>>0)break;_error($0,3);$$34=0;break L1}}while(0);$875=_stb_vorbis_get_file_offset($0)|0;HEAP32[$0+40>>2]=$875;$$34=1;break L1;break}case 64:{$22=(_getn($0,$1,6)|0)!=0;if($22&(HEAP8[$1>>0]|0)==102)if((HEAP8[$1+1>>0]|0)==105)if((HEAP8[$1+2>>0]|0)==115)if((HEAP8[$1+3>>0]|0)==104)if((HEAP8[$1+4>>0]|0)==101)if((HEAP8[$1+5>>0]|0)==97)if((_get8($0)|0)<<24>>24==100)if(!((_get8($0)|0)<<24>>24)){_error($0,38);$$34=0;break L1}break}default:{}}_error($0,34);$$34=0}}while(0);STACKTOP=sp;return $$34|0}function _malloc($0){$0=$0|0;var $$0=0,$$0$i$i=0,$$0$i$i$i=0,$$0$i16$i=0,$$0187$i=0,$$0189$i=0,$$0190$i=0,$$0191$i=0,$$0197=0,$$0199=0,$$02065$i$i=0,$$0207$lcssa$i$i=0,$$02074$i$i=0,$$0211$i$i=0,$$0212$i$i=0,$$024372$i=0,$$0286$i$i=0,$$028711$i$i=0,$$0288$lcssa$i$i=0,$$028810$i$i=0,$$0294$i$i=0,$$0295$i$i=0,$$0340$i=0,$$034217$i=0,$$0343$lcssa$i=0,$$034316$i=0,$$0345$i=0,$$0351$i=0,$$0357$i=0,$$0358$i=0,$$0360$i=0,$$0361$i=0,$$0367$i=0,$$1194$i=0,$$1194$i$be=0,$$1194$i$ph=0,$$1196$i=0,$$1196$i$be=0,$$1196$i$ph=0,$$124471$i=0,$$1290$i$i=0,$$1290$i$i$be=0,$$1290$i$i$ph=0,$$1292$i$i=0,$$1292$i$i$be=0,$$1292$i$i$ph=0,$$1341$i=0,$$1346$i=0,$$1362$i=0,$$1369$i=0,$$1369$i$be=0,$$1369$i$ph=0,$$1373$i=0,$$1373$i$be=0,$$1373$i$ph=0,$$2234243136$i=0,$$2247$ph$i=0,$$2253$ph$i=0,$$2353$i=0,$$3$i=0,$$3$i$i=0,$$3$i203=0,$$3$i203218=0,$$3348$i=0,$$3371$i=0,$$4$lcssa$i=0,$$420$i=0,$$420$i$ph=0,$$4236$i=0,$$4349$lcssa$i=0,$$434919$i=0,$$434919$i$ph=0,$$4355$i=0,$$535618$i=0,$$535618$i$ph=0,$$723947$i=0,$$748$i=0,$$pre$phi$i$iZ2D=0,$$pre$phi$i18$iZ2D=0,$$pre$phi$i209Z2D=0,$$pre$phi$iZ2D=0,$$pre$phi17$i$iZ2D=0,$$pre$phiZ2D=0,$1=0,$1000=0,$1003=0,$1008=0,$101=0,$1014=0,$1017=0,$1018=0,$102=0,$1025=0,$1037=0,$1042=0,$1049=0,$1050=0,$1051=0,$1060=0,$1062=0,$1063=0,$1064=0,$1070=0,$108=0,$112=0,$114=0,$115=0,$117=0,$119=0,$121=0,$123=0,$125=0,$127=0,$129=0,$134=0,$14=0,$140=0,$143=0,$146=0,$149=0,$150=0,$151=0,$153=0,$156=0,$158=0,$16=0,$161=0,$163=0,$166=0,$169=0,$17=0,$170=0,$172=0,$173=0,$175=0,$176=0,$178=0,$179=0,$18=0,$184=0,$185=0,$19=0,$193=0,$198=0,$20=0,$202=0,$208=0,$215=0,$219=0,$228=0,$229=0,$231=0,$232=0,$236=0,$237=0,$245=0,$246=0,$247=0,$249=0,$250=0,$255=0,$256=0,$259=0,$261=0,$264=0,$269=0,$27=0,$276=0,$286=0,$290=0,$299=0,$30=0,$302=0,$306=0,$308=0,$309=0,$311=0,$313=0,$315=0,$317=0,$319=0,$321=0,$323=0,$333=0,$334=0,$336=0,$34=0,$340=0,$346=0,$348=0,$351=0,$353=0,$356=0,$358=0,$361=0,$364=0,$365=0,$367=0,$368=0,$37=0,$370=0,$371=0,$373=0,$374=0,$379=0,$380=0,$385=0,$388=0,$393=0,$397=0,$403=0,$41=0,$410=0,$414=0,$422=0,$425=0,$426=0,$427=0,$431=0,$432=0,$438=0,$44=0,$443=0,$444=0,$447=0,$449=0,$452=0,$457=0,$463=0,$465=0,$467=0,$469=0,$47=0,$475=0,$487=0,$49=0,$492=0,$499=0,$50=0,$500=0,$501=0,$510=0,$512=0,$513=0,$515=0,$52=0,$524=0,$528=0,$530=0,$531=0,$532=0,$54=0,$543=0,$544=0,$545=0,$546=0,$547=0,$548=0,$550=0,$552=0,$553=0,$559=0,$56=0,$561=0,$568=0,$570=0,$572=0,$573=0,$574=0,$58=0,$582=0,$583=0,$586=0,$590=0,$593=0,$596=0,$6=0,$60=0,$602=0,$606=0,$610=0,$619=0,$62=0,$620=0,$626=0,$628=0,$632=0,$635=0,$637=0,$64=0,$641=0,$643=0,$648=0,$649=0,$650=0,$656=0,$658=0,$662=0,$664=0,$67=0,$673=0,$675=0,$680=0,$681=0,$682=0,$688=0,$69=0,$690=0,$694=0,$7=0,$70=0,$700=0,$704=0,$71=0,$710=0,$712=0,$718=0,$72=0,$722=0,$723=0,$728=0,$73=0,$734=0,$739=0,$742=0,$743=0,$746=0,$748=0,$750=0,$752=0,$764=0,$769=0,$77=0,$771=0,$774=0,$776=0,$779=0,$782=0,$783=0,$784=0,$786=0,$788=0,$789=0,$791=0,$792=0,$797=0,$798=0,$8=0,$80=0,$807=0,$812=0,$815=0,$816=0,$822=0,$83=0,$830=0,$836=0,$839=0,$84=0,$840=0,$841=0,$845=0,$846=0,$852=0,$857=0,$858=0,$861=0,$863=0,$866=0,$87=0,$871=0,$877=0,$879=0,$881=0,$882=0,$889=0,$9=0,$901=0,$906=0,$913=0,$914=0,$915=0,$92=0,$923=0,$927=0,$93=0,$931=0,$933=0,$939=0,$940=0,$942=0,$943=0,$945=0,$947=0,$95=0,$952=0,$953=0,$954=0,$96=0,$960=0,$962=0,$968=0,$973=0,$976=0,$977=0,$978=0,$98=0,$982=0,$983=0,$989=0,$994=0,$995=0,$998=0,$spec$select$i205=0,$spec$select3$i=0,$spec$select49$i=0,label=0,sp=0,$962$looptemp=0;sp=STACKTOP;STACKTOP=STACKTOP+16|0;$1=sp;do{if($0>>>0<245){$6=$0>>>0<11?16:$0+11&-8;$7=$6>>>3;$8=HEAP32[720]|0;$9=$8>>>$7;if($9&3|0){$14=($9&1^1)+$7|0;$16=2920+($14<<1<<2)|0;$17=$16+8|0;$18=HEAP32[$17>>2]|0;$19=$18+8|0;$20=HEAP32[$19>>2]|0;do{if(($20|0)==($16|0))HEAP32[720]=$8&~(1<<$14);else{if((HEAP32[724]|0)>>>0>$20>>>0)_abort();$27=$20+12|0;if((HEAP32[$27>>2]|0)==($18|0)){HEAP32[$27>>2]=$16;HEAP32[$17>>2]=$20;break}else _abort()}}while(0);$30=$14<<3;HEAP32[$18+4>>2]=$30|3;$34=$18+$30+4|0;HEAP32[$34>>2]=HEAP32[$34>>2]|1;$$0=$19;STACKTOP=sp;return $$0|0}$37=HEAP32[722]|0;if($6>>>0>$37>>>0){if($9|0){$41=2<<$7;$44=$9<<$7&($41|0-$41);$47=($44&0-$44)+-1|0;$49=$47>>>12&16;$50=$47>>>$49;$52=$50>>>5&8;$54=$50>>>$52;$56=$54>>>2&4;$58=$54>>>$56;$60=$58>>>1&2;$62=$58>>>$60;$64=$62>>>1&1;$67=($52|$49|$56|$60|$64)+($62>>>$64)|0;$69=2920+($67<<1<<2)|0;$70=$69+8|0;$71=HEAP32[$70>>2]|0;$72=$71+8|0;$73=HEAP32[$72>>2]|0;do{if(($73|0)==($69|0)){$77=$8&~(1<<$67);HEAP32[720]=$77;$98=$77}else{if((HEAP32[724]|0)>>>0>$73>>>0)_abort();$80=$73+12|0;if((HEAP32[$80>>2]|0)==($71|0)){HEAP32[$80>>2]=$69;HEAP32[$70>>2]=$73;$98=$8;break}else _abort()}}while(0);$83=$67<<3;$84=$83-$6|0;HEAP32[$71+4>>2]=$6|3;$87=$71+$6|0;HEAP32[$87+4>>2]=$84|1;HEAP32[$71+$83>>2]=$84;if($37|0){$92=HEAP32[725]|0;$93=$37>>>3;$95=2920+($93<<1<<2)|0;$96=1<<$93;if(!($98&$96)){HEAP32[720]=$98|$96;$$0199=$95;$$pre$phiZ2D=$95+8|0}else{$101=$95+8|0;$102=HEAP32[$101>>2]|0;if((HEAP32[724]|0)>>>0>$102>>>0)_abort();else{$$0199=$102;$$pre$phiZ2D=$101}}HEAP32[$$pre$phiZ2D>>2]=$92;HEAP32[$$0199+12>>2]=$92;HEAP32[$92+8>>2]=$$0199;HEAP32[$92+12>>2]=$95}HEAP32[722]=$84;HEAP32[725]=$87;$$0=$72;STACKTOP=sp;return $$0|0}$108=HEAP32[721]|0;if(!$108)$$0197=$6;else{$112=($108&0-$108)+-1|0;$114=$112>>>12&16;$115=$112>>>$114;$117=$115>>>5&8;$119=$115>>>$117;$121=$119>>>2&4;$123=$119>>>$121;$125=$123>>>1&2;$127=$123>>>$125;$129=$127>>>1&1;$134=HEAP32[3184+(($117|$114|$121|$125|$129)+($127>>>$129)<<2)>>2]|0;$$0189$i=$134;$$0190$i=$134;$$0191$i=(HEAP32[$134+4>>2]&-8)-$6|0;while(1){$140=HEAP32[$$0189$i+16>>2]|0;if(!$140){$143=HEAP32[$$0189$i+20>>2]|0;if(!$143)break;else $146=$143}else $146=$140;$149=(HEAP32[$146+4>>2]&-8)-$6|0;$150=$149>>>0<$$0191$i>>>0;$$0189$i=$146;$$0190$i=$150?$146:$$0190$i;$$0191$i=$150?$149:$$0191$i}$151=HEAP32[724]|0;if($151>>>0>$$0190$i>>>0)_abort();$153=$$0190$i+$6|0;if($153>>>0<=$$0190$i>>>0)_abort();$156=HEAP32[$$0190$i+24>>2]|0;$158=HEAP32[$$0190$i+12>>2]|0;do{if(($158|0)==($$0190$i|0)){$169=$$0190$i+20|0;$170=HEAP32[$169>>2]|0;if(!$170){$172=$$0190$i+16|0;$173=HEAP32[$172>>2]|0;if(!$173){$$3$i=0;break}else{$$1194$i$ph=$173;$$1196$i$ph=$172}}else{$$1194$i$ph=$170;$$1196$i$ph=$169}$$1194$i=$$1194$i$ph;$$1196$i=$$1196$i$ph;while(1){$175=$$1194$i+20|0;$176=HEAP32[$175>>2]|0;if(!$176){$178=$$1194$i+16|0;$179=HEAP32[$178>>2]|0;if(!$179)break;else{$$1194$i$be=$179;$$1196$i$be=$178}}else{$$1194$i$be=$176;$$1196$i$be=$175}$$1194$i=$$1194$i$be;$$1196$i=$$1196$i$be}if($151>>>0>$$1196$i>>>0)_abort();else{HEAP32[$$1196$i>>2]=0;$$3$i=$$1194$i;break}}else{$161=HEAP32[$$0190$i+8>>2]|0;if($151>>>0>$161>>>0)_abort();$163=$161+12|0;if((HEAP32[$163>>2]|0)!=($$0190$i|0))_abort();$166=$158+8|0;if((HEAP32[$166>>2]|0)==($$0190$i|0)){HEAP32[$163>>2]=$158;HEAP32[$166>>2]=$161;$$3$i=$158;break}else _abort()}}while(0);L78:do{if($156|0){$184=HEAP32[$$0190$i+28>>2]|0;$185=3184+($184<<2)|0;do{if(($$0190$i|0)==(HEAP32[$185>>2]|0)){HEAP32[$185>>2]=$$3$i;if(!$$3$i){HEAP32[721]=$108&~(1<<$184);break L78}}else if((HEAP32[724]|0)>>>0>$156>>>0)_abort();else{$193=$156+16|0;HEAP32[((HEAP32[$193>>2]|0)==($$0190$i|0)?$193:$156+20|0)>>2]=$$3$i;if(!$$3$i)break L78;else break}}while(0);$198=HEAP32[724]|0;if($198>>>0>$$3$i>>>0)_abort();HEAP32[$$3$i+24>>2]=$156;$202=HEAP32[$$0190$i+16>>2]|0;do{if($202|0)if($198>>>0>$202>>>0)_abort();else{HEAP32[$$3$i+16>>2]=$202;HEAP32[$202+24>>2]=$$3$i;break}}while(0);$208=HEAP32[$$0190$i+20>>2]|0;if($208|0)if((HEAP32[724]|0)>>>0>$208>>>0)_abort();else{HEAP32[$$3$i+20>>2]=$208;HEAP32[$208+24>>2]=$$3$i;break}}}while(0);if($$0191$i>>>0<16){$215=$$0191$i+$6|0;HEAP32[$$0190$i+4>>2]=$215|3;$219=$$0190$i+$215+4|0;HEAP32[$219>>2]=HEAP32[$219>>2]|1}else{HEAP32[$$0190$i+4>>2]=$6|3;HEAP32[$153+4>>2]=$$0191$i|1;HEAP32[$153+$$0191$i>>2]=$$0191$i;if($37|0){$228=HEAP32[725]|0;$229=$37>>>3;$231=2920+($229<<1<<2)|0;$232=1<<$229;if(!($232&$8)){HEAP32[720]=$232|$8;$$0187$i=$231;$$pre$phi$iZ2D=$231+8|0}else{$236=$231+8|0;$237=HEAP32[$236>>2]|0;if((HEAP32[724]|0)>>>0>$237>>>0)_abort();else{$$0187$i=$237;$$pre$phi$iZ2D=$236}}HEAP32[$$pre$phi$iZ2D>>2]=$228;HEAP32[$$0187$i+12>>2]=$228;HEAP32[$228+8>>2]=$$0187$i;HEAP32[$228+12>>2]=$231}HEAP32[722]=$$0191$i;HEAP32[725]=$153}$$0=$$0190$i+8|0;STACKTOP=sp;return $$0|0}}else $$0197=$6}else if($0>>>0>4294967231)$$0197=-1;else{$245=$0+11|0;$246=$245&-8;$247=HEAP32[721]|0;if(!$247)$$0197=$246;else{$249=0-$246|0;$250=$245>>>8;if(!$250)$$0357$i=0;else if($246>>>0>16777215)$$0357$i=31;else{$255=($250+1048320|0)>>>16&8;$256=$250<<$255;$259=($256+520192|0)>>>16&4;$261=$256<<$259;$264=($261+245760|0)>>>16&2;$269=14-($259|$255|$264)+($261<<$264>>>15)|0;$$0357$i=$246>>>($269+7|0)&1|$269<<1}$276=HEAP32[3184+($$0357$i<<2)>>2]|0;L122:do{if(!$276){$$2353$i=0;$$3$i203=0;$$3348$i=$249;label=85}else{$$0340$i=0;$$0345$i=$249;$$0351$i=$276;$$0358$i=$246<<(($$0357$i|0)==31?0:25-($$0357$i>>>1)|0);$$0361$i=0;while(1){$286=(HEAP32[$$0351$i+4>>2]&-8)-$246|0;if($286>>>0<$$0345$i>>>0)if(!$286){$$420$i$ph=$$0351$i;$$434919$i$ph=0;$$535618$i$ph=$$0351$i;label=89;break L122}else{$$1341$i=$$0351$i;$$1346$i=$286}else{$$1341$i=$$0340$i;$$1346$i=$$0345$i}$290=HEAP32[$$0351$i+20>>2]|0;$$0351$i=HEAP32[$$0351$i+16+($$0358$i>>>31<<2)>>2]|0;$$1362$i=($290|0)==0|($290|0)==($$0351$i|0)?$$0361$i:$290;if(!$$0351$i){$$2353$i=$$1362$i;$$3$i203=$$1341$i;$$3348$i=$$1346$i;label=85;break}else{$$0340$i=$$1341$i;$$0345$i=$$1346$i;$$0358$i=$$0358$i<<1;$$0361$i=$$1362$i}}}}while(0);if((label|0)==85){if(($$2353$i|0)==0&($$3$i203|0)==0){$299=2<<$$0357$i;$302=($299|0-$299)&$247;if(!$302){$$0197=$246;break}$306=($302&0-$302)+-1|0;$308=$306>>>12&16;$309=$306>>>$308;$311=$309>>>5&8;$313=$309>>>$311;$315=$313>>>2&4;$317=$313>>>$315;$319=$317>>>1&2;$321=$317>>>$319;$323=$321>>>1&1;$$3$i203218=0;$$4355$i=HEAP32[3184+(($311|$308|$315|$319|$323)+($321>>>$323)<<2)>>2]|0}else{$$3$i203218=$$3$i203;$$4355$i=$$2353$i}if(!$$4355$i){$$4$lcssa$i=$$3$i203218;$$4349$lcssa$i=$$3348$i}else{$$420$i$ph=$$3$i203218;$$434919$i$ph=$$3348$i;$$535618$i$ph=$$4355$i;label=89}}if((label|0)==89){$$420$i=$$420$i$ph;$$434919$i=$$434919$i$ph;$$535618$i=$$535618$i$ph;while(1){$333=(HEAP32[$$535618$i+4>>2]&-8)-$246|0;$334=$333>>>0<$$434919$i>>>0;$spec$select$i205=$334?$333:$$434919$i;$spec$select3$i=$334?$$535618$i:$$420$i;$336=HEAP32[$$535618$i+16>>2]|0;if(!$336)$340=HEAP32[$$535618$i+20>>2]|0;else $340=$336;if(!$340){$$4$lcssa$i=$spec$select3$i;$$4349$lcssa$i=$spec$select$i205;break}else{$$420$i=$spec$select3$i;$$434919$i=$spec$select$i205;$$535618$i=$340}}}if(!$$4$lcssa$i)$$0197=$246;else if($$4349$lcssa$i>>>0<((HEAP32[722]|0)-$246|0)>>>0){$346=HEAP32[724]|0;if($346>>>0>$$4$lcssa$i>>>0)_abort();$348=$$4$lcssa$i+$246|0;if($348>>>0<=$$4$lcssa$i>>>0)_abort();$351=HEAP32[$$4$lcssa$i+24>>2]|0;$353=HEAP32[$$4$lcssa$i+12>>2]|0;do{if(($353|0)==($$4$lcssa$i|0)){$364=$$4$lcssa$i+20|0;$365=HEAP32[$364>>2]|0;if(!$365){$367=$$4$lcssa$i+16|0;$368=HEAP32[$367>>2]|0;if(!$368){$$3371$i=0;break}else{$$1369$i$ph=$368;$$1373$i$ph=$367}}else{$$1369$i$ph=$365;$$1373$i$ph=$364}$$1369$i=$$1369$i$ph;$$1373$i=$$1373$i$ph;while(1){$370=$$1369$i+20|0;$371=HEAP32[$370>>2]|0;if(!$371){$373=$$1369$i+16|0;$374=HEAP32[$373>>2]|0;if(!$374)break;else{$$1369$i$be=$374;$$1373$i$be=$373}}else{$$1369$i$be=$371;$$1373$i$be=$370}$$1369$i=$$1369$i$be;$$1373$i=$$1373$i$be}if($346>>>0>$$1373$i>>>0)_abort();else{HEAP32[$$1373$i>>2]=0;$$3371$i=$$1369$i;break}}else{$356=HEAP32[$$4$lcssa$i+8>>2]|0;if($346>>>0>$356>>>0)_abort();$358=$356+12|0;if((HEAP32[$358>>2]|0)!=($$4$lcssa$i|0))_abort();$361=$353+8|0;if((HEAP32[$361>>2]|0)==($$4$lcssa$i|0)){HEAP32[$358>>2]=$353;HEAP32[$361>>2]=$356;$$3371$i=$353;break}else _abort()}}while(0);L176:do{if(!$351)$469=$247;else{$379=HEAP32[$$4$lcssa$i+28>>2]|0;$380=3184+($379<<2)|0;do{if(($$4$lcssa$i|0)==(HEAP32[$380>>2]|0)){HEAP32[$380>>2]=$$3371$i;if(!$$3371$i){$385=$247&~(1<<$379);HEAP32[721]=$385;$469=$385;break L176}}else if((HEAP32[724]|0)>>>0>$351>>>0)_abort();else{$388=$351+16|0;HEAP32[((HEAP32[$388>>2]|0)==($$4$lcssa$i|0)?$388:$351+20|0)>>2]=$$3371$i;if(!$$3371$i){$469=$247;break L176}else break}}while(0);$393=HEAP32[724]|0;if($393>>>0>$$3371$i>>>0)_abort();HEAP32[$$3371$i+24>>2]=$351;$397=HEAP32[$$4$lcssa$i+16>>2]|0;do{if($397|0)if($393>>>0>$397>>>0)_abort();else{HEAP32[$$3371$i+16>>2]=$397;HEAP32[$397+24>>2]=$$3371$i;break}}while(0);$403=HEAP32[$$4$lcssa$i+20>>2]|0;if(!$403)$469=$247;else if((HEAP32[724]|0)>>>0>$403>>>0)_abort();else{HEAP32[$$3371$i+20>>2]=$403;HEAP32[$403+24>>2]=$$3371$i;$469=$247;break}}}while(0);L200:do{if($$4349$lcssa$i>>>0<16){$410=$$4349$lcssa$i+$246|0;HEAP32[$$4$lcssa$i+4>>2]=$410|3;$414=$$4$lcssa$i+$410+4|0;HEAP32[$414>>2]=HEAP32[$414>>2]|1}else{HEAP32[$$4$lcssa$i+4>>2]=$246|3;HEAP32[$348+4>>2]=$$4349$lcssa$i|1;HEAP32[$348+$$4349$lcssa$i>>2]=$$4349$lcssa$i;$422=$$4349$lcssa$i>>>3;if($$4349$lcssa$i>>>0<256){$425=2920+($422<<1<<2)|0;$426=HEAP32[720]|0;$427=1<<$422;if(!($426&$427)){HEAP32[720]=$426|$427;$$0367$i=$425;$$pre$phi$i209Z2D=$425+8|0}else{$431=$425+8|0;$432=HEAP32[$431>>2]|0;if((HEAP32[724]|0)>>>0>$432>>>0)_abort();else{$$0367$i=$432;$$pre$phi$i209Z2D=$431}}HEAP32[$$pre$phi$i209Z2D>>2]=$348;HEAP32[$$0367$i+12>>2]=$348;HEAP32[$348+8>>2]=$$0367$i;HEAP32[$348+12>>2]=$425;break}$438=$$4349$lcssa$i>>>8;if(!$438)$$0360$i=0;else if($$4349$lcssa$i>>>0>16777215)$$0360$i=31;else{$443=($438+1048320|0)>>>16&8;$444=$438<<$443;$447=($444+520192|0)>>>16&4;$449=$444<<$447;$452=($449+245760|0)>>>16&2;$457=14-($447|$443|$452)+($449<<$452>>>15)|0;$$0360$i=$$4349$lcssa$i>>>($457+7|0)&1|$457<<1}$463=3184+($$0360$i<<2)|0;HEAP32[$348+28>>2]=$$0360$i;$465=$348+16|0;HEAP32[$465+4>>2]=0;HEAP32[$465>>2]=0;$467=1<<$$0360$i;if(!($469&$467)){HEAP32[721]=$469|$467;HEAP32[$463>>2]=$348;HEAP32[$348+24>>2]=$463;HEAP32[$348+12>>2]=$348;HEAP32[$348+8>>2]=$348;break}$475=HEAP32[$463>>2]|0;L218:do{if((HEAP32[$475+4>>2]&-8|0)==($$4349$lcssa$i|0))$$0343$lcssa$i=$475;else{$$034217$i=$$4349$lcssa$i<<(($$0360$i|0)==31?0:25-($$0360$i>>>1)|0);$$034316$i=$475;while(1){$492=$$034316$i+16+($$034217$i>>>31<<2)|0;$487=HEAP32[$492>>2]|0;if(!$487)break;if((HEAP32[$487+4>>2]&-8|0)==($$4349$lcssa$i|0)){$$0343$lcssa$i=$487;break L218}else{$$034217$i=$$034217$i<<1;$$034316$i=$487}}if((HEAP32[724]|0)>>>0>$492>>>0)_abort();else{HEAP32[$492>>2]=$348;HEAP32[$348+24>>2]=$$034316$i;HEAP32[$348+12>>2]=$348;HEAP32[$348+8>>2]=$348;break L200}}}while(0);$499=$$0343$lcssa$i+8|0;$500=HEAP32[$499>>2]|0;$501=HEAP32[724]|0;if($501>>>0<=$500>>>0&$501>>>0<=$$0343$lcssa$i>>>0){HEAP32[$500+12>>2]=$348;HEAP32[$499>>2]=$348;HEAP32[$348+8>>2]=$500;HEAP32[$348+12>>2]=$$0343$lcssa$i;HEAP32[$348+24>>2]=0;break}else _abort()}}while(0);$$0=$$4$lcssa$i+8|0;STACKTOP=sp;return $$0|0}else $$0197=$246}}}while(0);$510=HEAP32[722]|0;if($510>>>0>=$$0197>>>0){$512=$510-$$0197|0;$513=HEAP32[725]|0;if($512>>>0>15){$515=$513+$$0197|0;HEAP32[725]=$515;HEAP32[722]=$512;HEAP32[$515+4>>2]=$512|1;HEAP32[$513+$510>>2]=$512;HEAP32[$513+4>>2]=$$0197|3}else{HEAP32[722]=0;HEAP32[725]=0;HEAP32[$513+4>>2]=$510|3;$524=$513+$510+4|0;HEAP32[$524>>2]=HEAP32[$524>>2]|1}$$0=$513+8|0;STACKTOP=sp;return $$0|0}$528=HEAP32[723]|0;if($528>>>0>$$0197>>>0){$530=$528-$$0197|0;HEAP32[723]=$530;$531=HEAP32[726]|0;$532=$531+$$0197|0;HEAP32[726]=$532;HEAP32[$532+4>>2]=$530|1;HEAP32[$531+4>>2]=$$0197|3;$$0=$531+8|0;STACKTOP=sp;return $$0|0}if(!(HEAP32[838]|0)){HEAP32[840]=4096;HEAP32[839]=4096;HEAP32[841]=-1;HEAP32[842]=-1;HEAP32[843]=0;HEAP32[831]=0;HEAP32[838]=$1&-16^1431655768;$546=4096}else $546=HEAP32[840]|0;$543=$$0197+48|0;$544=$$0197+47|0;$545=$546+$544|0;$547=0-$546|0;$548=$545&$547;if($548>>>0<=$$0197>>>0){$$0=0;STACKTOP=sp;return $$0|0}$550=HEAP32[830]|0;if($550|0){$552=HEAP32[828]|0;$553=$552+$548|0;if($553>>>0<=$552>>>0|$553>>>0>$550>>>0){$$0=0;STACKTOP=sp;return $$0|0}}L257:do{if(!(HEAP32[831]&4)){$559=HEAP32[726]|0;L259:do{if(!$559)label=173;else{$$0$i$i=3328;while(1){$561=HEAP32[$$0$i$i>>2]|0;if($561>>>0<=$559>>>0)if(($561+(HEAP32[$$0$i$i+4>>2]|0)|0)>>>0>$559>>>0)break;$568=HEAP32[$$0$i$i+8>>2]|0;if(!$568){label=173;break L259}else $$0$i$i=$568}$593=$545-$528&$547;if($593>>>0<2147483647){$596=_sbrk($593|0)|0;if(($596|0)==((HEAP32[$$0$i$i>>2]|0)+(HEAP32[$$0$i$i+4>>2]|0)|0))if(($596|0)==(-1|0))$$2234243136$i=$593;else{$$723947$i=$593;$$748$i=$596;label=190;break L257}else{$$2247$ph$i=$596;$$2253$ph$i=$593;label=181}}else $$2234243136$i=0}}while(0);do{if((label|0)==173){$570=_sbrk(0)|0;if(($570|0)==(-1|0))$$2234243136$i=0;else{$572=$570;$573=HEAP32[839]|0;$574=$573+-1|0;$spec$select49$i=(($574&$572|0)==0?0:($574+$572&0-$573)-$572|0)+$548|0;$582=HEAP32[828]|0;$583=$spec$select49$i+$582|0;if($spec$select49$i>>>0>$$0197>>>0&$spec$select49$i>>>0<2147483647){$586=HEAP32[830]|0;if($586|0)if($583>>>0<=$582>>>0|$583>>>0>$586>>>0){$$2234243136$i=0;break}$590=_sbrk($spec$select49$i|0)|0;if(($590|0)==($570|0)){$$723947$i=$spec$select49$i;$$748$i=$570;label=190;break L257}else{$$2247$ph$i=$590;$$2253$ph$i=$spec$select49$i;label=181}}else $$2234243136$i=0}}}while(0);do{if((label|0)==181){$602=0-$$2253$ph$i|0;if(!($543>>>0>$$2253$ph$i>>>0&($$2253$ph$i>>>0<2147483647&($$2247$ph$i|0)!=(-1|0))))if(($$2247$ph$i|0)==(-1|0)){$$2234243136$i=0;break}else{$$723947$i=$$2253$ph$i;$$748$i=$$2247$ph$i;label=190;break L257}$606=HEAP32[840]|0;$610=$544-$$2253$ph$i+$606&0-$606;if($610>>>0>=2147483647){$$723947$i=$$2253$ph$i;$$748$i=$$2247$ph$i;label=190;break L257}if((_sbrk($610|0)|0)==(-1|0)){_sbrk($602|0)|0;$$2234243136$i=0;break}else{$$723947$i=$610+$$2253$ph$i|0;$$748$i=$$2247$ph$i;label=190;break L257}}}while(0);HEAP32[831]=HEAP32[831]|4;$$4236$i=$$2234243136$i;label=188}else{$$4236$i=0;label=188}}while(0);if((label|0)==188)if($548>>>0<2147483647){$619=_sbrk($548|0)|0;$620=_sbrk(0)|0;$626=$620-$619|0;$628=$626>>>0>($$0197+40|0)>>>0;if(!(($619|0)==(-1|0)|$628^1|$619>>>0<$620>>>0&(($619|0)!=(-1|0)&($620|0)!=(-1|0))^1)){$$723947$i=$628?$626:$$4236$i;$$748$i=$619;label=190}}if((label|0)==190){$632=(HEAP32[828]|0)+$$723947$i|0;HEAP32[828]=$632;if($632>>>0>(HEAP32[829]|0)>>>0)HEAP32[829]=$632;$635=HEAP32[726]|0;L294:do{if(!$635){$637=HEAP32[724]|0;if(($637|0)==0|$$748$i>>>0<$637>>>0)HEAP32[724]=$$748$i;HEAP32[832]=$$748$i;HEAP32[833]=$$723947$i;HEAP32[835]=0;HEAP32[729]=HEAP32[838];HEAP32[728]=-1;HEAP32[733]=2920;HEAP32[732]=2920;HEAP32[735]=2928;HEAP32[734]=2928;HEAP32[737]=2936;HEAP32[736]=2936;HEAP32[739]=2944;HEAP32[738]=2944;HEAP32[741]=2952;HEAP32[740]=2952;HEAP32[743]=2960;HEAP32[742]=2960;HEAP32[745]=2968;HEAP32[744]=2968;HEAP32[747]=2976;HEAP32[746]=2976;HEAP32[749]=2984;HEAP32[748]=2984;HEAP32[751]=2992;HEAP32[750]=2992;HEAP32[753]=3e3;HEAP32[752]=3e3;HEAP32[755]=3008;HEAP32[754]=3008;HEAP32[757]=3016;HEAP32[756]=3016;HEAP32[759]=3024;HEAP32[758]=3024;HEAP32[761]=3032;HEAP32[760]=3032;HEAP32[763]=3040;HEAP32[762]=3040;HEAP32[765]=3048;HEAP32[764]=3048;HEAP32[767]=3056;HEAP32[766]=3056;HEAP32[769]=3064;HEAP32[768]=3064;HEAP32[771]=3072;HEAP32[770]=3072;HEAP32[773]=3080;HEAP32[772]=3080;HEAP32[775]=3088;HEAP32[774]=3088;HEAP32[777]=3096;HEAP32[776]=3096;HEAP32[779]=3104;HEAP32[778]=3104;HEAP32[781]=3112;HEAP32[780]=3112;HEAP32[783]=3120;HEAP32[782]=3120;HEAP32[785]=3128;HEAP32[784]=3128;HEAP32[787]=3136;HEAP32[786]=3136;HEAP32[789]=3144;HEAP32[788]=3144;HEAP32[791]=3152;HEAP32[790]=3152;HEAP32[793]=3160;HEAP32[792]=3160;HEAP32[795]=3168;HEAP32[794]=3168;$641=$$723947$i+-40|0;$643=$$748$i+8|0;$648=($643&7|0)==0?0:0-$643&7;$649=$$748$i+$648|0;$650=$641-$648|0;HEAP32[726]=$649;HEAP32[723]=$650;HEAP32[$649+4>>2]=$650|1;HEAP32[$$748$i+$641+4>>2]=40;HEAP32[727]=HEAP32[842]}else{$$024372$i=3328;while(1){$656=HEAP32[$$024372$i>>2]|0;$658=HEAP32[$$024372$i+4>>2]|0;if(($$748$i|0)==($656+$658|0)){label=199;break}$662=HEAP32[$$024372$i+8>>2]|0;if(!$662)break;else $$024372$i=$662}if((label|0)==199){$664=$$024372$i+4|0;if(!(HEAP32[$$024372$i+12>>2]&8))if($$748$i>>>0>$635>>>0&$656>>>0<=$635>>>0){HEAP32[$664>>2]=$658+$$723947$i;$673=(HEAP32[723]|0)+$$723947$i|0;$675=$635+8|0;$680=($675&7|0)==0?0:0-$675&7;$681=$635+$680|0;$682=$673-$680|0;HEAP32[726]=$681;HEAP32[723]=$682;HEAP32[$681+4>>2]=$682|1;HEAP32[$635+$673+4>>2]=40;HEAP32[727]=HEAP32[842];break}}$688=HEAP32[724]|0;if($$748$i>>>0<$688>>>0){HEAP32[724]=$$748$i;$752=$$748$i}else $752=$688;$690=$$748$i+$$723947$i|0;$$124471$i=3328;while(1){if((HEAP32[$$124471$i>>2]|0)==($690|0)){label=207;break}$694=HEAP32[$$124471$i+8>>2]|0;if(!$694)break;else $$124471$i=$694}if((label|0)==207)if(!(HEAP32[$$124471$i+12>>2]&8)){HEAP32[$$124471$i>>2]=$$748$i;$700=$$124471$i+4|0;HEAP32[$700>>2]=(HEAP32[$700>>2]|0)+$$723947$i;$704=$$748$i+8|0;$710=$$748$i+(($704&7|0)==0?0:0-$704&7)|0;$712=$690+8|0;$718=$690+(($712&7|0)==0?0:0-$712&7)|0;$722=$710+$$0197|0;$723=$718-$710-$$0197|0;HEAP32[$710+4>>2]=$$0197|3;L317:do{if(($635|0)==($718|0)){$728=(HEAP32[723]|0)+$723|0;HEAP32[723]=$728;HEAP32[726]=$722;HEAP32[$722+4>>2]=$728|1}else{if((HEAP32[725]|0)==($718|0)){$734=(HEAP32[722]|0)+$723|0;HEAP32[722]=$734;HEAP32[725]=$722;HEAP32[$722+4>>2]=$734|1;HEAP32[$722+$734>>2]=$734;break}$739=HEAP32[$718+4>>2]|0;if(($739&3|0)==1){$742=$739&-8;$743=$739>>>3;L325:do{if($739>>>0<256){$746=HEAP32[$718+8>>2]|0;$748=HEAP32[$718+12>>2]|0;$750=2920+($743<<1<<2)|0;do{if(($746|0)!=($750|0)){if($752>>>0>$746>>>0)_abort();if((HEAP32[$746+12>>2]|0)==($718|0))break;_abort()}}while(0);if(($748|0)==($746|0)){HEAP32[720]=HEAP32[720]&~(1<<$743);break}do{if(($748|0)==($750|0))$$pre$phi17$i$iZ2D=$748+8|0;else{if($752>>>0>$748>>>0)_abort();$764=$748+8|0;if((HEAP32[$764>>2]|0)==($718|0)){$$pre$phi17$i$iZ2D=$764;break}_abort()}}while(0);HEAP32[$746+12>>2]=$748;HEAP32[$$pre$phi17$i$iZ2D>>2]=$746}else{$769=HEAP32[$718+24>>2]|0;$771=HEAP32[$718+12>>2]|0;do{if(($771|0)==($718|0)){$782=$718+16|0;$783=$782+4|0;$784=HEAP32[$783>>2]|0;if(!$784){$786=HEAP32[$782>>2]|0;if(!$786){$$3$i$i=0;break}else{$$1290$i$i$ph=$786;$$1292$i$i$ph=$782}}else{$$1290$i$i$ph=$784;$$1292$i$i$ph=$783}$$1290$i$i=$$1290$i$i$ph;$$1292$i$i=$$1292$i$i$ph;while(1){$788=$$1290$i$i+20|0;$789=HEAP32[$788>>2]|0;if(!$789){$791=$$1290$i$i+16|0;$792=HEAP32[$791>>2]|0;if(!$792)break;else{$$1290$i$i$be=$792;$$1292$i$i$be=$791}}else{$$1290$i$i$be=$789;$$1292$i$i$be=$788}$$1290$i$i=$$1290$i$i$be;$$1292$i$i=$$1292$i$i$be}if($752>>>0>$$1292$i$i>>>0)_abort();else{HEAP32[$$1292$i$i>>2]=0;$$3$i$i=$$1290$i$i;break}}else{$774=HEAP32[$718+8>>2]|0;if($752>>>0>$774>>>0)_abort();$776=$774+12|0;if((HEAP32[$776>>2]|0)!=($718|0))_abort();$779=$771+8|0;if((HEAP32[$779>>2]|0)==($718|0)){HEAP32[$776>>2]=$771;HEAP32[$779>>2]=$774;$$3$i$i=$771;break}else _abort()}}while(0);if(!$769)break;$797=HEAP32[$718+28>>2]|0;$798=3184+($797<<2)|0;do{if((HEAP32[$798>>2]|0)==($718|0)){HEAP32[$798>>2]=$$3$i$i;if($$3$i$i|0)break;HEAP32[721]=HEAP32[721]&~(1<<$797);break L325}else if((HEAP32[724]|0)>>>0>$769>>>0)_abort();else{$807=$769+16|0;HEAP32[((HEAP32[$807>>2]|0)==($718|0)?$807:$769+20|0)>>2]=$$3$i$i;if(!$$3$i$i)break L325;else break}}while(0);$812=HEAP32[724]|0;if($812>>>0>$$3$i$i>>>0)_abort();HEAP32[$$3$i$i+24>>2]=$769;$815=$718+16|0;$816=HEAP32[$815>>2]|0;do{if($816|0)if($812>>>0>$816>>>0)_abort();else{HEAP32[$$3$i$i+16>>2]=$816;HEAP32[$816+24>>2]=$$3$i$i;break}}while(0);$822=HEAP32[$815+4>>2]|0;if(!$822)break;if((HEAP32[724]|0)>>>0>$822>>>0)_abort();else{HEAP32[$$3$i$i+20>>2]=$822;HEAP32[$822+24>>2]=$$3$i$i;break}}}while(0);$$0$i16$i=$718+$742|0;$$0286$i$i=$742+$723|0}else{$$0$i16$i=$718;$$0286$i$i=$723}$830=$$0$i16$i+4|0;HEAP32[$830>>2]=HEAP32[$830>>2]&-2;HEAP32[$722+4>>2]=$$0286$i$i|1;HEAP32[$722+$$0286$i$i>>2]=$$0286$i$i;$836=$$0286$i$i>>>3;if($$0286$i$i>>>0<256){$839=2920+($836<<1<<2)|0;$840=HEAP32[720]|0;$841=1<<$836;do{if(!($840&$841)){HEAP32[720]=$840|$841;$$0294$i$i=$839;$$pre$phi$i18$iZ2D=$839+8|0}else{$845=$839+8|0;$846=HEAP32[$845>>2]|0;if((HEAP32[724]|0)>>>0<=$846>>>0){$$0294$i$i=$846;$$pre$phi$i18$iZ2D=$845;break}_abort()}}while(0);HEAP32[$$pre$phi$i18$iZ2D>>2]=$722;HEAP32[$$0294$i$i+12>>2]=$722;HEAP32[$722+8>>2]=$$0294$i$i;HEAP32[$722+12>>2]=$839;break}$852=$$0286$i$i>>>8;do{if(!$852)$$0295$i$i=0;else{if($$0286$i$i>>>0>16777215){$$0295$i$i=31;break}$857=($852+1048320|0)>>>16&8;$858=$852<<$857;$861=($858+520192|0)>>>16&4;$863=$858<<$861;$866=($863+245760|0)>>>16&2;$871=14-($861|$857|$866)+($863<<$866>>>15)|0;$$0295$i$i=$$0286$i$i>>>($871+7|0)&1|$871<<1}}while(0);$877=3184+($$0295$i$i<<2)|0;HEAP32[$722+28>>2]=$$0295$i$i;$879=$722+16|0;HEAP32[$879+4>>2]=0;HEAP32[$879>>2]=0;$881=HEAP32[721]|0;$882=1<<$$0295$i$i;if(!($881&$882)){HEAP32[721]=$881|$882;HEAP32[$877>>2]=$722;HEAP32[$722+24>>2]=$877;HEAP32[$722+12>>2]=$722;HEAP32[$722+8>>2]=$722;break}$889=HEAP32[$877>>2]|0;L410:do{if((HEAP32[$889+4>>2]&-8|0)==($$0286$i$i|0))$$0288$lcssa$i$i=$889;else{$$028711$i$i=$$0286$i$i<<(($$0295$i$i|0)==31?0:25-($$0295$i$i>>>1)|0);$$028810$i$i=$889;while(1){$906=$$028810$i$i+16+($$028711$i$i>>>31<<2)|0;$901=HEAP32[$906>>2]|0;if(!$901)break;if((HEAP32[$901+4>>2]&-8|0)==($$0286$i$i|0)){$$0288$lcssa$i$i=$901;break L410}else{$$028711$i$i=$$028711$i$i<<1;$$028810$i$i=$901}}if((HEAP32[724]|0)>>>0>$906>>>0)_abort();else{HEAP32[$906>>2]=$722;HEAP32[$722+24>>2]=$$028810$i$i;HEAP32[$722+12>>2]=$722;HEAP32[$722+8>>2]=$722;break L317}}}while(0);$913=$$0288$lcssa$i$i+8|0;$914=HEAP32[$913>>2]|0;$915=HEAP32[724]|0;if($915>>>0<=$914>>>0&$915>>>0<=$$0288$lcssa$i$i>>>0){HEAP32[$914+12>>2]=$722;HEAP32[$913>>2]=$722;HEAP32[$722+8>>2]=$914;HEAP32[$722+12>>2]=$$0288$lcssa$i$i;HEAP32[$722+24>>2]=0;break}else _abort()}}while(0);$$0=$710+8|0;STACKTOP=sp;return $$0|0}$$0$i$i$i=3328;while(1){$923=HEAP32[$$0$i$i$i>>2]|0;if($923>>>0<=$635>>>0){$927=$923+(HEAP32[$$0$i$i$i+4>>2]|0)|0;if($927>>>0>$635>>>0)break}$$0$i$i$i=HEAP32[$$0$i$i$i+8>>2]|0}$931=$927+-47|0;$933=$931+8|0;$939=$931+(($933&7|0)==0?0:0-$933&7)|0;$940=$635+16|0;$942=$939>>>0<$940>>>0?$635:$939;$943=$942+8|0;$945=$$723947$i+-40|0;$947=$$748$i+8|0;$952=($947&7|0)==0?0:0-$947&7;$953=$$748$i+$952|0;$954=$945-$952|0;HEAP32[726]=$953;HEAP32[723]=$954;HEAP32[$953+4>>2]=$954|1;HEAP32[$$748$i+$945+4>>2]=40;HEAP32[727]=HEAP32[842];$960=$942+4|0;HEAP32[$960>>2]=27;HEAP32[$943>>2]=HEAP32[832];HEAP32[$943+4>>2]=HEAP32[833];HEAP32[$943+8>>2]=HEAP32[834];HEAP32[$943+12>>2]=HEAP32[835];HEAP32[832]=$$748$i;HEAP32[833]=$$723947$i;HEAP32[835]=0;HEAP32[834]=$943;$962=$942+24|0;do{$962$looptemp=$962;$962=$962+4|0;HEAP32[$962>>2]=7}while(($962$looptemp+8|0)>>>0<$927>>>0);if(($942|0)!=($635|0)){$968=$942-$635|0;HEAP32[$960>>2]=HEAP32[$960>>2]&-2;HEAP32[$635+4>>2]=$968|1;HEAP32[$942>>2]=$968;$973=$968>>>3;if($968>>>0<256){$976=2920+($973<<1<<2)|0;$977=HEAP32[720]|0;$978=1<<$973;if(!($977&$978)){HEAP32[720]=$977|$978;$$0211$i$i=$976;$$pre$phi$i$iZ2D=$976+8|0}else{$982=$976+8|0;$983=HEAP32[$982>>2]|0;if((HEAP32[724]|0)>>>0>$983>>>0)_abort();else{$$0211$i$i=$983;$$pre$phi$i$iZ2D=$982}}HEAP32[$$pre$phi$i$iZ2D>>2]=$635;HEAP32[$$0211$i$i+12>>2]=$635;HEAP32[$635+8>>2]=$$0211$i$i;HEAP32[$635+12>>2]=$976;break}$989=$968>>>8;if(!$989)$$0212$i$i=0;else if($968>>>0>16777215)$$0212$i$i=31;else{$994=($989+1048320|0)>>>16&8;$995=$989<<$994;$998=($995+520192|0)>>>16&4;$1000=$995<<$998;$1003=($1000+245760|0)>>>16&2;$1008=14-($998|$994|$1003)+($1000<<$1003>>>15)|0;$$0212$i$i=$968>>>($1008+7|0)&1|$1008<<1}$1014=3184+($$0212$i$i<<2)|0;HEAP32[$635+28>>2]=$$0212$i$i;HEAP32[$635+20>>2]=0;HEAP32[$940>>2]=0;$1017=HEAP32[721]|0;$1018=1<<$$0212$i$i;if(!($1017&$1018)){HEAP32[721]=$1017|$1018;HEAP32[$1014>>2]=$635;HEAP32[$635+24>>2]=$1014;HEAP32[$635+12>>2]=$635;HEAP32[$635+8>>2]=$635;break}$1025=HEAP32[$1014>>2]|0;L451:do{if((HEAP32[$1025+4>>2]&-8|0)==($968|0))$$0207$lcssa$i$i=$1025;else{$$02065$i$i=$968<<(($$0212$i$i|0)==31?0:25-($$0212$i$i>>>1)|0);$$02074$i$i=$1025;while(1){$1042=$$02074$i$i+16+($$02065$i$i>>>31<<2)|0;$1037=HEAP32[$1042>>2]|0;if(!$1037)break;if((HEAP32[$1037+4>>2]&-8|0)==($968|0)){$$0207$lcssa$i$i=$1037;break L451}else{$$02065$i$i=$$02065$i$i<<1;$$02074$i$i=$1037}}if((HEAP32[724]|0)>>>0>$1042>>>0)_abort();else{HEAP32[$1042>>2]=$635;HEAP32[$635+24>>2]=$$02074$i$i;HEAP32[$635+12>>2]=$635;HEAP32[$635+8>>2]=$635;break L294}}}while(0);$1049=$$0207$lcssa$i$i+8|0;$1050=HEAP32[$1049>>2]|0;$1051=HEAP32[724]|0;if($1051>>>0<=$1050>>>0&$1051>>>0<=$$0207$lcssa$i$i>>>0){HEAP32[$1050+12>>2]=$635;HEAP32[$1049>>2]=$635;HEAP32[$635+8>>2]=$1050;HEAP32[$635+12>>2]=$$0207$lcssa$i$i;HEAP32[$635+24>>2]=0;break}else _abort()}}}while(0);$1060=HEAP32[723]|0;if($1060>>>0>$$0197>>>0){$1062=$1060-$$0197|0;HEAP32[723]=$1062;$1063=HEAP32[726]|0;$1064=$1063+$$0197|0;HEAP32[726]=$1064;HEAP32[$1064+4>>2]=$1062|1;HEAP32[$1063+4>>2]=$$0197|3;$$0=$1063+8|0;STACKTOP=sp;return $$0|0}}$1070=___errno_location()|0;HEAP32[$1070>>2]=12;$$0=0;STACKTOP=sp;return $$0|0}function _decode_residue($0,$1,$2,$3,$4,$5){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;$5=$5|0;var $$0450$lcssa=0,$$0450597=0,$$0453593=0,$$0455578=0,$$0460576=0,$$0481620=0,$$0482619=0,$$0626=0,$$1451604=0,$$1454624=0,$$1456$lcssa=0,$$1456570=0,$$1467=0,$$1479=0,$$1483$lcssa=0,$$1483613=0,$$1485=0,$$1488=0,$$1571=0,$$2452608=0,$$2462564=0,$$2468=0,$$2480=0,$$2486=0,$$2489=0,$$2563=0,$$3458566=0,$$3583=0,$$4459$lcssa=0,$$4459562=0,$$4464588=0,$$4615=0,$$6590=0,$$7$lcssa=0,$$7582=0,$11=0,$113=0,$12=0,$122=0,$13=0,$132=0,$136=0,$141=0,$145=0,$146=0,$148=0,$152=0,$155=0,$156=0,$16=0,$162=0,$165=0,$166=0,$182=0,$19=0,$191=0,$20=0,$201=0,$203=0,$208=0,$212=0,$213=0,$215=0,$216=0,$218=0,$22=0,$222=0,$225=0,$226=0,$23=0,$232=0,$235=0,$236=0,$24=0,$252=0,$261=0,$27=0,$271=0,$272=0,$274=0,$276=0,$283=0,$284=0,$285=0,$286=0,$287=0,$288=0,$289=0,$294=0,$296=0,$300=0,$303=0,$304=0,$31=0,$310=0,$313=0,$314=0,$33=0,$34=0,$345=0,$35=0,$351=0,$353=0,$361=0,$39=0,$40=0,$41=0,$43=0,$44=0,$45=0,$46=0,$47=0,$49=0,$50=0,$6=0,$61=0,$64=0,$65=0,$66=0,$67=0,$68=0,$69=0,$7=0,$70=0,$74=0,$77=0,$79=0,$83=0,$86=0,$87=0,$9=0,$93=0,$96=0,$97=0,$brmerge=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+16|0;$6=sp+4|0;$7=sp;$9=HEAP32[$0+384>>2]|0;$11=HEAP16[$0+256+($4<<1)>>1]|0;$12=$11&65535;$13=$9+($4*24|0)+13|0;$16=$0+112|0;$19=HEAP32[(HEAP32[$16>>2]|0)+((HEAPU8[$13>>0]|0)*2096|0)>>2]|0;$20=$11<<16>>16==2;$22=$3<<($20&1);$23=$9+($4*24|0)|0;$24=HEAP32[$23>>2]|0;$27=HEAP32[$9+($4*24|0)+4>>2]|0;$31=$9+($4*24|0)+8|0;$33=((($27>>>0<$22>>>0?$27:$22)-($24>>>0<$22>>>0?$24:$22)|0)>>>0)/((HEAP32[$31>>2]|0)>>>0)|0;$34=$0+80|0;$35=HEAP32[$34>>2]|0;$39=$0+4|0;$40=HEAP32[$39>>2]|0;$41=$33<<2;$43=Math_imul($40,$41+4|0)|0;if(!(HEAP32[$0+68>>2]|0)){$45=STACKTOP;STACKTOP=STACKTOP+((1*$43|0)+15&-16)|0;$46=$45;$47=$40}else{$44=_setup_temp_malloc($0,$43)|0;$46=$44;$47=HEAP32[$39>>2]|0}_make_block_array($46,$47,$41)|0;$49=($2|0)>0;if($49){$50=$3<<2;$$0626=0;do{if(!(HEAP8[$5+$$0626>>0]|0))_memset(HEAP32[$1+($$0626<<2)>>2]|0,0,$50|0)|0;$$0626=$$0626+1|0}while(($$0626|0)!=($2|0))}L13:do{if(($2|0)!=1&$20){L15:do{if($49){$$0450597=0;while(1){if(!(HEAP8[$5+$$0450597>>0]|0)){$$0450$lcssa=$$0450597;break L15}$61=$$0450597+1|0;if(($61|0)<($2|0))$$0450597=$61;else{$$0450$lcssa=$61;break}}}else $$0450$lcssa=0}while(0);if(($$0450$lcssa|0)!=($2|0)){$64=($33|0)>0;$65=$0+1384|0;$66=($19|0)>0;$67=$0+1380|0;$68=$9+($4*24|0)+20|0;$69=$9+($4*24|0)+16|0;$$0453593=0;L22:while(1){switch($2|0){case 2:{if($64){$70=($$0453593|0)==0;$$0455578=0;$$0460576=0;while(1){$74=(Math_imul(HEAP32[$31>>2]|0,$$0455578)|0)+(HEAP32[$23>>2]|0)|0;HEAP32[$6>>2]=$74&1;HEAP32[$7>>2]=$74>>1;if($70){$77=HEAP32[$16>>2]|0;$79=HEAPU8[$13>>0]|0;if((HEAP32[$65>>2]|0)<10)_prep_huffman($0);$83=HEAP32[$67>>2]|0;$86=HEAP16[$77+($79*2096|0)+36+(($83&1023)<<1)>>1]|0;$87=$86<<16>>16;if($86<<16>>16>-1){$93=HEAPU8[(HEAP32[$77+($79*2096|0)+8>>2]|0)+$87>>0]|0;HEAP32[$67>>2]=$83>>>$93;$96=(HEAP32[$65>>2]|0)-$93|0;$97=($96|0)<0;HEAP32[$65>>2]=$97?0:$96;$$1467=$97?-1:$87}else $$1467=_codebook_decode_scalar_raw($0,$77+($79*2096|0)|0)|0;if(!(HEAP8[$77+($79*2096|0)+23>>0]|0))$$2468=$$1467;else $$2468=HEAP32[(HEAP32[$77+($79*2096|0)+2088>>2]|0)+($$1467<<2)>>2]|0;if(($$2468|0)==-1){label=35;break L22}HEAP32[(HEAP32[$46>>2]|0)+($$0460576<<2)>>2]=HEAP32[(HEAP32[$69>>2]|0)+($$2468<<2)>>2]}if(($$0455578|0)<($33|0)&$66){$$1456570=$$0455578;$$1571=0;while(1){$113=HEAP32[$31>>2]|0;$122=HEAP16[(HEAP32[$68>>2]|0)+(HEAPU8[(HEAP32[(HEAP32[$46>>2]|0)+($$0460576<<2)>>2]|0)+$$1571>>0]<<4)+($$0453593<<1)>>1]|0;if($122<<16>>16>-1){if(!(_codebook_decode_deinterleave_repeat($0,(HEAP32[$16>>2]|0)+(($122<<16>>16)*2096|0)|0,$1,2,$6,$7,$3,$113)|0)){label=35;break L22}}else{$132=(Math_imul($113,$$1456570)|0)+$113+(HEAP32[$23>>2]|0)|0;HEAP32[$6>>2]=$132&1;HEAP32[$7>>2]=$132>>1}$$1571=$$1571+1|0;$136=$$1456570+1|0;if(!(($136|0)<($33|0)&($$1571|0)<($19|0))){$$1456$lcssa=$136;break}else $$1456570=$136}}else $$1456$lcssa=$$0455578;if(($$1456$lcssa|0)<($33|0)){$$0455578=$$1456$lcssa;$$0460576=$$0460576+1|0}else break}}break}case 1:{if($64){$141=($$0453593|0)==0;$$2462564=0;$$3458566=0;while(1){$145=(Math_imul(HEAP32[$31>>2]|0,$$3458566)|0)+(HEAP32[$23>>2]|0)|0;HEAP32[$6>>2]=0;HEAP32[$7>>2]=$145;if($141){$146=HEAP32[$16>>2]|0;$148=HEAPU8[$13>>0]|0;if((HEAP32[$65>>2]|0)<10)_prep_huffman($0);$152=HEAP32[$67>>2]|0;$155=HEAP16[$146+($148*2096|0)+36+(($152&1023)<<1)>>1]|0;$156=$155<<16>>16;if($155<<16>>16>-1){$162=HEAPU8[(HEAP32[$146+($148*2096|0)+8>>2]|0)+$156>>0]|0;HEAP32[$67>>2]=$152>>>$162;$165=(HEAP32[$65>>2]|0)-$162|0;$166=($165|0)<0;HEAP32[$65>>2]=$166?0:$165;$$1485=$166?-1:$156}else $$1485=_codebook_decode_scalar_raw($0,$146+($148*2096|0)|0)|0;if(!(HEAP8[$146+($148*2096|0)+23>>0]|0))$$2486=$$1485;else $$2486=HEAP32[(HEAP32[$146+($148*2096|0)+2088>>2]|0)+($$1485<<2)>>2]|0;if(($$2486|0)==-1){label=55;break L22}HEAP32[(HEAP32[$46>>2]|0)+($$2462564<<2)>>2]=HEAP32[(HEAP32[$69>>2]|0)+($$2486<<2)>>2]}if(($$3458566|0)<($33|0)&$66){$$2563=0;$$4459562=$$3458566;while(1){$182=HEAP32[$31>>2]|0;$191=HEAP16[(HEAP32[$68>>2]|0)+(HEAPU8[(HEAP32[(HEAP32[$46>>2]|0)+($$2462564<<2)>>2]|0)+$$2563>>0]<<4)+($$0453593<<1)>>1]|0;if($191<<16>>16>-1){if(!(_codebook_decode_deinterleave_repeat($0,(HEAP32[$16>>2]|0)+(($191<<16>>16)*2096|0)|0,$1,1,$6,$7,$3,$182)|0)){label=55;break L22}}else{$201=(Math_imul($182,$$4459562)|0)+$182+(HEAP32[$23>>2]|0)|0;HEAP32[$6>>2]=0;HEAP32[$7>>2]=$201}$$2563=$$2563+1|0;$203=$$4459562+1|0;if(!(($203|0)<($33|0)&($$2563|0)<($19|0))){$$4459$lcssa=$203;break}else $$4459562=$203}}else $$4459$lcssa=$$3458566;if(($$4459$lcssa|0)<($33|0)){$$2462564=$$2462564+1|0;$$3458566=$$4459$lcssa}else break}}break}default:if($64){$208=($$0453593|0)==0;$$4464588=0;$$6590=0;while(1){$212=(Math_imul(HEAP32[$31>>2]|0,$$6590)|0)+(HEAP32[$23>>2]|0)|0;$213=($212|0)/($2|0)|0;$215=$212-(Math_imul($213,$2)|0)|0;HEAP32[$6>>2]=$215;HEAP32[$7>>2]=$213;if($208){$216=HEAP32[$16>>2]|0;$218=HEAPU8[$13>>0]|0;if((HEAP32[$65>>2]|0)<10)_prep_huffman($0);$222=HEAP32[$67>>2]|0;$225=HEAP16[$216+($218*2096|0)+36+(($222&1023)<<1)>>1]|0;$226=$225<<16>>16;if($225<<16>>16>-1){$232=HEAPU8[(HEAP32[$216+($218*2096|0)+8>>2]|0)+$226>>0]|0;HEAP32[$67>>2]=$222>>>$232;$235=(HEAP32[$65>>2]|0)-$232|0;$236=($235|0)<0;HEAP32[$65>>2]=$236?0:$235;$$1488=$236?-1:$226}else $$1488=_codebook_decode_scalar_raw($0,$216+($218*2096|0)|0)|0;if(!(HEAP8[$216+($218*2096|0)+23>>0]|0))$$2489=$$1488;else $$2489=HEAP32[(HEAP32[$216+($218*2096|0)+2088>>2]|0)+($$1488<<2)>>2]|0;if(($$2489|0)==-1){label=75;break L22}HEAP32[(HEAP32[$46>>2]|0)+($$4464588<<2)>>2]=HEAP32[(HEAP32[$69>>2]|0)+($$2489<<2)>>2]}if(($$6590|0)<($33|0)&$66){$$3583=0;$$7582=$$6590;while(1){$252=HEAP32[$31>>2]|0;$261=HEAP16[(HEAP32[$68>>2]|0)+(HEAPU8[(HEAP32[(HEAP32[$46>>2]|0)+($$4464588<<2)>>2]|0)+$$3583>>0]<<4)+($$0453593<<1)>>1]|0;if($261<<16>>16>-1){if(!(_codebook_decode_deinterleave_repeat($0,(HEAP32[$16>>2]|0)+(($261<<16>>16)*2096|0)|0,$1,$2,$6,$7,$3,$252)|0)){label=75;break L22}}else{$271=(Math_imul($252,$$7582)|0)+$252+(HEAP32[$23>>2]|0)|0;$272=($271|0)/($2|0)|0;$274=$271-(Math_imul($272,$2)|0)|0;HEAP32[$6>>2]=$274;HEAP32[$7>>2]=$272}$$3583=$$3583+1|0;$276=$$7582+1|0;if(!(($276|0)<($33|0)&($$3583|0)<($19|0))){$$7$lcssa=$276;break}else $$7582=$276}}else $$7$lcssa=$$6590;if(($$7$lcssa|0)<($33|0)){$$4464588=$$4464588+1|0;$$6590=$$7$lcssa}else break}}}$$0453593=$$0453593+1|0;if($$0453593>>>0>=8)break L13}if((label|0)==35)break;else if((label|0)==55)break;else if((label|0)==75)break}}else{$283=($33|0)>0;$284=($2|0)<1;$285=($19|0)>0;$286=$0+1384|0;$287=$0+1380|0;$288=$9+($4*24|0)+16|0;$289=$9+($4*24|0)+20|0;$$1454624=0;do{if($283){$brmerge=($$1454624|0)!=0|$284;$$0481620=0;$$0482619=0;while(1){if(!$brmerge){$$1451604=0;do{if(!(HEAP8[$5+$$1451604>>0]|0)){$294=HEAP32[$16>>2]|0;$296=HEAPU8[$13>>0]|0;if((HEAP32[$286>>2]|0)<10)_prep_huffman($0);$300=HEAP32[$287>>2]|0;$303=HEAP16[$294+($296*2096|0)+36+(($300&1023)<<1)>>1]|0;$304=$303<<16>>16;if($303<<16>>16>-1){$310=HEAPU8[(HEAP32[$294+($296*2096|0)+8>>2]|0)+$304>>0]|0;HEAP32[$287>>2]=$300>>>$310;$313=(HEAP32[$286>>2]|0)-$310|0;$314=($313|0)<0;HEAP32[$286>>2]=$314?0:$313;$$1479=$314?-1:$304}else $$1479=_codebook_decode_scalar_raw($0,$294+($296*2096|0)|0)|0;if(!(HEAP8[$294+($296*2096|0)+23>>0]|0))$$2480=$$1479;else $$2480=HEAP32[(HEAP32[$294+($296*2096|0)+2088>>2]|0)+($$1479<<2)>>2]|0;if(($$2480|0)==-1)break L13;HEAP32[(HEAP32[$46+($$1451604<<2)>>2]|0)+($$0481620<<2)>>2]=HEAP32[(HEAP32[$288>>2]|0)+($$2480<<2)>>2]}$$1451604=$$1451604+1|0}while(($$1451604|0)<($2|0))}if(($$0482619|0)<($33|0)&$285){$$1483613=$$0482619;$$4615=0;while(1){if($49){$$2452608=0;do{if(!(HEAP8[$5+$$2452608>>0]|0)){$345=HEAP16[(HEAP32[$289>>2]|0)+(HEAPU8[(HEAP32[(HEAP32[$46+($$2452608<<2)>>2]|0)+($$0481620<<2)>>2]|0)+$$4615>>0]<<4)+($$1454624<<1)>>1]|0;if($345<<16>>16>-1){$351=HEAP32[$31>>2]|0;$353=(Math_imul($351,$$1483613)|0)+(HEAP32[$23>>2]|0)|0;if(!(_residue_decode($0,(HEAP32[$16>>2]|0)+(($345<<16>>16)*2096|0)|0,HEAP32[$1+($$2452608<<2)>>2]|0,$353,$351,$12)|0))break L13}}$$2452608=$$2452608+1|0}while(($$2452608|0)<($2|0))}$$4615=$$4615+1|0;$361=$$1483613+1|0;if(!(($361|0)<($33|0)&($$4615|0)<($19|0))){$$1483$lcssa=$361;break}else $$1483613=$361}}else $$1483$lcssa=$$0482619;if(($$1483$lcssa|0)<($33|0)){$$0481620=$$0481620+1|0;$$0482619=$$1483$lcssa}else break}}$$1454624=$$1454624+1|0}while($$1454624>>>0<8)}}while(0);HEAP32[$34>>2]=$35;STACKTOP=sp;return}function _vorbis_decode_packet_rest($0,$1,$2,$3,$4,$5,$6){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;$5=$5|0;$6=$6|0;var $$0401=0,$$0402=0,$$0403=0,$$040465=0,$$040852=0,$$0413$lcssa=0,$$041328=0,$$041546=0,$$042051=0,$$140538=0,$$140956=0,$$1414=0,$$1421$lcssa=0,$$142145=0,$$1424=0,$$1429=0,$$240633=0,$$241061=0,$$2430=0,$$3=0,$$340724$in=0,$$341129=0,$$3426=0,$$415=0,$$441219=0,$$442744=0,$$514=0,$$lcssa10=0,$$pre$phi8087Z2D=0,$$pre84=0,$$sink=0,$$sink92=0,$10=0,$109=0,$112=0,$113=0,$117=0,$120=0,$121=0,$127=0,$130=0,$131=0,$14=0,$151=0,$153=0,$156=0,$159=0,$16=0,$175=0,$176=0,$177=0,$178=0,$179=0,$19=0,$20=0,$206=0,$208=0,$209=0,$21=0,$217=0,$22=0,$220=0,$221=0,$225=0,$23=0,$232=0,$235=0,$236=0,$238=0,$24=0,$246=0,$257=0,$26=0,$261=0,$268=0,$27=0,$272=0,$273=0,$278=0,$28=0,$283=0,$284=0,$285=0,$287=0,$288=0,$289=0,$29=0,$299=0,$30=0,$303=0,$309=0,$31=0,$319=0,$326=0,$327=0,$329=0,$332=0,$338=0,$339=0,$346=0,$347=0,$348=0,$35=0,$354=0,$36=0,$362=0,$39=0,$43=0,$51=0,$53=0,$55=0,$57=0,$59=0,$61=0,$66=0,$68=0,$69=0,$7=0,$71=0,$72=0,$74=0,$76=0,$79=0,$8=0,$83=0,$86=0,$87=0,$9=0,$93=0,$96=0,$97=0,$spec$select8=0,label=0,sp=0,$$340724$in$looptemp=0;sp=STACKTOP;STACKTOP=STACKTOP+2560|0;$7=sp+1536|0;$8=sp+512|0;$9=sp+256|0;$10=sp;$14=HEAP32[$0+92+(HEAPU8[$2>>0]<<2)>>2]|0;$16=HEAP32[$0+392>>2]|0;$19=HEAPU8[$2+1>>0]|0;$20=$16+($19*40|0)|0;$21=$14>>1;$22=0-$21|0;$23=$0+4|0;$24=HEAP32[$23>>2]|0;L1:do{if(($24|0)>0){$26=$16+($19*40|0)+4|0;$27=$0+248|0;$28=$0+112|0;$29=$0+1384|0;$30=$0+1380|0;$31=$9+1|0;$$040465=0;while(1){$35=HEAPU8[(HEAP32[$26>>2]|0)+($$040465*3|0)+2>>0]|0;$36=$7+($$040465<<2)|0;HEAP32[$36>>2]=0;$39=HEAPU8[$16+($19*40|0)+9+$35>>0]|0;if(!(HEAP16[$0+120+($39<<1)>>1]|0))break;$43=HEAP32[$27>>2]|0;do{if(!(_get_bits($0,1)|0))label=50;else{$51=HEAP32[32+((HEAPU8[$43+($39*1596|0)+1588>>0]|0)+-1<<2)>>2]|0;$53=HEAP32[$0+984+($$040465<<2)>>2]|0;$55=(_ilog($51)|0)+-1|0;$57=(_get_bits($0,$55)|0)&65535;HEAP16[$53>>1]=$57;$59=(_get_bits($0,$55)|0)&65535;HEAP16[$53+2>>1]=$59;$61=$43+($39*1596|0)|0;if(HEAP8[$61>>0]|0){$$040852=0;$$042051=2;while(1){$66=HEAPU8[$43+($39*1596|0)+1+$$040852>>0]|0;$68=HEAP8[$43+($39*1596|0)+33+$66>>0]|0;$69=$68&255;$71=HEAP8[$43+($39*1596|0)+49+$66>>0]|0;$72=$71&255;$74=(1<<$72)+-1|0;if(!($71<<24>>24))$$3426=0;else{$76=HEAP32[$28>>2]|0;$79=HEAPU8[$43+($39*1596|0)+65+$66>>0]|0;if((HEAP32[$29>>2]|0)<10)_prep_huffman($0);$83=HEAP32[$30>>2]|0;$86=HEAP16[$76+($79*2096|0)+36+(($83&1023)<<1)>>1]|0;$87=$86<<16>>16;if($86<<16>>16>-1){$93=HEAPU8[(HEAP32[$76+($79*2096|0)+8>>2]|0)+$87>>0]|0;HEAP32[$30>>2]=$83>>>$93;$96=(HEAP32[$29>>2]|0)-$93|0;$97=($96|0)<0;HEAP32[$29>>2]=$97?0:$96;$$1424=$97?-1:$87}else $$1424=_codebook_decode_scalar_raw($0,$76+($79*2096|0)|0)|0;if(!(HEAP8[$76+($79*2096|0)+23>>0]|0))$$3426=$$1424;else $$3426=HEAP32[(HEAP32[$76+($79*2096|0)+2088>>2]|0)+($$1424<<2)>>2]|0}if(!($68<<24>>24))$$1421$lcssa=$$042051;else{$$041546=0;$$142145=$$042051;$$442744=$$3426;while(1){$109=HEAP16[$43+($39*1596|0)+82+($66<<4)+(($$442744&$74)<<1)>>1]|0;$$442744=$$442744>>$72;if($109<<16>>16>-1){$112=$109<<16>>16;$113=HEAP32[$28>>2]|0;if((HEAP32[$29>>2]|0)<10)_prep_huffman($0);$117=HEAP32[$30>>2]|0;$120=HEAP16[$113+($112*2096|0)+36+(($117&1023)<<1)>>1]|0;$121=$120<<16>>16;if($120<<16>>16>-1){$127=HEAPU8[(HEAP32[$113+($112*2096|0)+8>>2]|0)+$121>>0]|0;HEAP32[$30>>2]=$117>>>$127;$130=(HEAP32[$29>>2]|0)-$127|0;$131=($130|0)<0;HEAP32[$29>>2]=$131?0:$130;$$1429=$131?-1:$121}else $$1429=_codebook_decode_scalar_raw($0,$113+($112*2096|0)|0)|0;if(!(HEAP8[$113+($112*2096|0)+23>>0]|0))$$2430=$$1429;else $$2430=HEAP32[(HEAP32[$113+($112*2096|0)+2088>>2]|0)+($$1429<<2)>>2]|0;$$sink=$$2430&65535}else $$sink=0;HEAP16[$53+($$142145<<1)>>1]=$$sink;$$041546=$$041546+1|0;if(($$041546|0)==($69|0))break;else $$142145=$$142145+1|0}$$1421$lcssa=$$042051+$69|0}$$040852=$$040852+1|0;if($$040852>>>0>=(HEAPU8[$61>>0]|0)>>>0)break;else $$042051=$$1421$lcssa}}if((HEAP32[$29>>2]|0)==-1){label=50;break}HEAP8[$31>>0]=1;HEAP8[$9>>0]=1;$151=HEAP32[$43+($39*1596|0)+1592>>2]|0;if(($151|0)>2){$153=$51+65535|0;$$140956=2;do{$156=HEAPU8[$43+($39*1596|0)+1088+($$140956<<1)>>0]|0;$159=HEAPU8[$43+($39*1596|0)+1088+($$140956<<1)+1>>0]|0;$175=_predict_point(HEAPU16[$43+($39*1596|0)+338+($$140956<<1)>>1]|0,HEAPU16[$43+($39*1596|0)+338+($156<<1)>>1]|0,HEAPU16[$43+($39*1596|0)+338+($159<<1)>>1]|0,HEAP16[$53+($156<<1)>>1]|0,HEAP16[$53+($159<<1)>>1]|0)|0;$176=$53+($$140956<<1)|0;$177=HEAP16[$176>>1]|0;$178=$177<<16>>16;$179=$51-$175|0;do{if(!($177<<16>>16)){HEAP8[$9+$$140956>>0]=0;$$sink92=$175;label=41}else{HEAP8[$9+$159>>0]=1;HEAP8[$9+$156>>0]=1;HEAP8[$9+$$140956>>0]=1;if(((($179|0)<($175|0)?$179:$175)<<1|0)<=($178|0)){if(($179|0)>($175|0))break;$$sink92=$153-$178|0;label=41;break}if(!($178&1)){$$sink92=($178>>1)+$175|0;label=41;break}else{$$sink92=$175-(($178+1|0)>>>1)|0;label=41;break}}}while(0);if((label|0)==41){label=0;HEAP16[$176>>1]=$$sink92}$$140956=$$140956+1|0}while(($$140956|0)<($151|0))}if(($151|0)>0){$$241061=0;do{if(!(HEAP8[$9+$$241061>>0]|0))HEAP16[$53+($$241061<<1)>>1]=-1;$$241061=$$241061+1|0}while(($$241061|0)!=($151|0))}}}while(0);if((label|0)==50){label=0;HEAP32[$36>>2]=1}$$040465=$$040465+1|0;$206=HEAP32[$23>>2]|0;if(($$040465|0)>=($206|0)){$$lcssa10=$206;label=52;break L1}}_error($0,21);$$3=0}else{$$lcssa10=$24;label=52}}while(0);do{if((label|0)==52){$208=$0+68|0;$209=HEAP32[$208>>2]|0;if($209|0)if((HEAP32[$0+72>>2]|0)!=(HEAP32[$0+80>>2]|0))___assert_fail(1091,1076,3279,1239);_memcpy($8|0,$7|0,$$lcssa10<<2|0)|0;$217=HEAP16[$20>>1]|0;if($217<<16>>16){$220=HEAP32[$16+($19*40|0)+4>>2]|0;$221=$217&65535;$$140538=0;do{$225=$7+(HEAPU8[$220+($$140538*3|0)>>0]<<2)|0;$$pre84=$7+(HEAPU8[$220+($$140538*3|0)+1>>0]<<2)|0;if(!(HEAP32[$225>>2]|0))label=59;else if(!(HEAP32[$$pre84>>2]|0))label=59;if((label|0)==59){label=0;HEAP32[$$pre84>>2]=0;HEAP32[$225>>2]=0}$$140538=$$140538+1|0}while($$140538>>>0<$221>>>0)}$232=$16+($19*40|0)+8|0;if(!(HEAP8[$232>>0]|0))$261=$209;else{$235=$16+($19*40|0)+4|0;$$240633=0;$236=$$lcssa10;while(1){if(($236|0)>0){$238=HEAP32[$235>>2]|0;$$041328=0;$$341129=0;while(1){if(($$240633|0)==(HEAPU8[$238+($$341129*3|0)+2>>0]|0)){$246=$10+$$041328|0;if(!(HEAP32[$7+($$341129<<2)>>2]|0)){HEAP8[$246>>0]=0;HEAP32[$9+($$041328<<2)>>2]=HEAP32[$0+788+($$341129<<2)>>2]}else{HEAP8[$246>>0]=1;HEAP32[$9+($$041328<<2)>>2]=0}$$1414=$$041328+1|0}else $$1414=$$041328;$$341129=$$341129+1|0;if(($$341129|0)>=($236|0)){$$0413$lcssa=$$1414;break}else $$041328=$$1414}}else $$0413$lcssa=0;_decode_residue($0,$9,$$0413$lcssa,$21,HEAPU8[$16+($19*40|0)+24+$$240633>>0]|0,$10);$257=$$240633+1|0;if($257>>>0>=(HEAPU8[$232>>0]|0)>>>0)break;$$240633=$257;$236=HEAP32[$23>>2]|0}$261=HEAP32[$208>>2]|0}if($261|0)if((HEAP32[$0+72>>2]|0)!=(HEAP32[$0+80>>2]|0))___assert_fail(1091,1076,3312,1239);$268=HEAP16[$20>>1]|0;if($268<<16>>16){$272=HEAP32[$16+($19*40|0)+4>>2]|0;$273=($14|0)>1;$$340724$in=$268&65535;do{$$340724$in$looptemp=$$340724$in;$$340724$in=$$340724$in+-1|0;$278=HEAP32[$0+788+(HEAPU8[$272+($$340724$in*3|0)>>0]<<2)>>2]|0;$283=HEAP32[$0+788+(HEAPU8[$272+($$340724$in*3|0)+1>>0]<<2)>>2]|0;if($273){$$441219=0;do{$284=$278+($$441219<<2)|0;$285=+HEAPF32[$284>>2];$287=$283+($$441219<<2)|0;$288=+HEAPF32[$287>>2];$289=$288>0;do{if($285>0)if($289){$$0401=$285;$$0402=$285-$288;break}else{$$0401=$285+$288;$$0402=$285;break}else if($289){$$0401=$285;$$0402=$285+$288;break}else{$$0401=$285-$288;$$0402=$285;break}}while(0);HEAPF32[$284>>2]=$$0401;HEAPF32[$287>>2]=$$0402;$$441219=$$441219+1|0}while(($$441219|0)<($21|0))}}while(($$340724$in$looptemp|0)>1)}if((HEAP32[$23>>2]|0)>0){$299=$21<<2;$$415=0;do{$303=$0+788+($$415<<2)|0;if(!(HEAP32[$8+($$415<<2)>>2]|0))_do_floor($0,$20,$$415,$14,HEAP32[$303>>2]|0,HEAP32[$0+984+($$415<<2)>>2]|0);else _memset(HEAP32[$303>>2]|0,0,$299|0)|0;$$415=$$415+1|0;$309=HEAP32[$23>>2]|0}while(($$415|0)<($309|0));if(($309|0)>0){$$514=0;do{_inverse_mdct(HEAP32[$0+788+($$514<<2)>>2]|0,$14,$0,HEAPU8[$2>>0]|0);$$514=$$514+1|0}while(($$514|0)<(HEAP32[$23>>2]|0))}}_flush_packet($0);$319=$0+1365|0;do{if(!(HEAP8[$319>>0]|0)){$326=$0+1400|0;$327=HEAP32[$326>>2]|0;if(!$327)$$0403=$3;else{$329=$4-$3|0;if(($327|0)<($329|0)){$332=$327+$3|0;HEAP32[$6>>2]=$332;HEAP32[$326>>2]=0;$$0403=$332;break}else{HEAP32[$326>>2]=$327-$329;HEAP32[$6>>2]=$4;$$0403=$4;break}}}else{HEAP32[$0+1048>>2]=$22;HEAP32[$0+1400>>2]=$14-$5;HEAP32[$0+1052>>2]=1;HEAP8[$319>>0]=0;$$0403=$3}}while(0);$338=$0+1052|0;$339=HEAP32[$338>>2]|0;if((HEAP32[$0+1376>>2]|0)==(HEAP32[$0+1392>>2]|0)){if($339|0)if(HEAP8[$0+1363>>0]&4){$346=HEAP32[$0+1396>>2]|0;$347=$0+1048|0;$348=HEAP32[$347>>2]|0;$354=($346>>>0<$348>>>0?0:$346-$348|0)+$$0403|0;$spec$select8=($354|0)>($5|0)?$5:$354;if($346>>>0<($5-$$0403+$348|0)>>>0){HEAP32[$1>>2]=$spec$select8;HEAP32[$347>>2]=(HEAP32[$347>>2]|0)+$spec$select8;$$3=1;break}}$362=$0+1048|0;HEAP32[$362>>2]=$$0403-$21+(HEAP32[$0+1396>>2]|0);HEAP32[$338>>2]=1;$$pre$phi8087Z2D=$362;label=112}else if($339|0){$$pre$phi8087Z2D=$0+1048|0;label=112}if((label|0)==112)HEAP32[$$pre$phi8087Z2D>>2]=$4-$$0403+(HEAP32[$$pre$phi8087Z2D>>2]|0);if(HEAP32[$208>>2]|0)if((HEAP32[$0+72>>2]|0)!=(HEAP32[$0+80>>2]|0))___assert_fail(1091,1076,3428,1239);HEAP32[$1>>2]=$5;$$3=1}}while(0);STACKTOP=sp;return $$3|0}function _free($0){$0=$0|0;var $$0211$i=0,$$0211$in$i=0,$$0381438=0,$$0382$lcssa=0,$$0382437=0,$$0394=0,$$0401=0,$$1=0,$$1380=0,$$1385=0,$$1385$be=0,$$1385$ph=0,$$1388=0,$$1388$be=0,$$1388$ph=0,$$1396=0,$$1396$be=0,$$1396$ph=0,$$1400=0,$$1400$be=0,$$1400$ph=0,$$2=0,$$3=0,$$3398=0,$$pre$phi444Z2D=0,$$pre$phi446Z2D=0,$$pre$phiZ2D=0,$10=0,$105=0,$106=0,$113=0,$115=0,$116=0,$124=0,$13=0,$132=0,$137=0,$138=0,$141=0,$143=0,$145=0,$16=0,$160=0,$165=0,$167=0,$17=0,$170=0,$173=0,$176=0,$179=0,$180=0,$181=0,$183=0,$185=0,$186=0,$188=0,$189=0,$195=0,$196=0,$2=0,$205=0,$21=0,$210=0,$213=0,$214=0,$220=0,$235=0,$238=0,$239=0,$24=0,$240=0,$244=0,$245=0,$251=0,$256=0,$257=0,$26=0,$260=0,$262=0,$265=0,$270=0,$276=0,$28=0,$280=0,$281=0,$288=0,$3=0,$300=0,$305=0,$312=0,$313=0,$314=0,$323=0,$41=0,$46=0,$48=0,$51=0,$53=0,$56=0,$59=0,$6=0,$60=0,$61=0,$63=0,$65=0,$66=0,$68=0,$69=0,$7=0,$74=0,$75=0,$84=0,$89=0,$9=0,$92=0,$93=0,$99=0;if(!$0)return;$2=$0+-8|0;$3=HEAP32[724]|0;if($2>>>0<$3>>>0)_abort();$6=HEAP32[$0+-4>>2]|0;$7=$6&3;if(($7|0)==1)_abort();$9=$6&-8;$10=$2+$9|0;L10:do{if(!($6&1)){$13=HEAP32[$2>>2]|0;if(!$7)return;$16=$2+(0-$13)|0;$17=$13+$9|0;if($16>>>0<$3>>>0)_abort();if((HEAP32[725]|0)==($16|0)){$105=$10+4|0;$106=HEAP32[$105>>2]|0;if(($106&3|0)!=3){$$1=$16;$$1380=$17;$113=$16;break}HEAP32[722]=$17;HEAP32[$105>>2]=$106&-2;HEAP32[$16+4>>2]=$17|1;HEAP32[$16+$17>>2]=$17;return}$21=$13>>>3;if($13>>>0<256){$24=HEAP32[$16+8>>2]|0;$26=HEAP32[$16+12>>2]|0;$28=2920+($21<<1<<2)|0;if(($24|0)!=($28|0)){if($3>>>0>$24>>>0)_abort();if((HEAP32[$24+12>>2]|0)!=($16|0))_abort()}if(($26|0)==($24|0)){HEAP32[720]=HEAP32[720]&~(1<<$21);$$1=$16;$$1380=$17;$113=$16;break}if(($26|0)==($28|0))$$pre$phi446Z2D=$26+8|0;else{if($3>>>0>$26>>>0)_abort();$41=$26+8|0;if((HEAP32[$41>>2]|0)==($16|0))$$pre$phi446Z2D=$41;else _abort()}HEAP32[$24+12>>2]=$26;HEAP32[$$pre$phi446Z2D>>2]=$24;$$1=$16;$$1380=$17;$113=$16;break}$46=HEAP32[$16+24>>2]|0;$48=HEAP32[$16+12>>2]|0;do{if(($48|0)==($16|0)){$59=$16+16|0;$60=$59+4|0;$61=HEAP32[$60>>2]|0;if(!$61){$63=HEAP32[$59>>2]|0;if(!$63){$$3=0;break}else{$$1385$ph=$63;$$1388$ph=$59}}else{$$1385$ph=$61;$$1388$ph=$60}$$1385=$$1385$ph;$$1388=$$1388$ph;while(1){$65=$$1385+20|0;$66=HEAP32[$65>>2]|0;if(!$66){$68=$$1385+16|0;$69=HEAP32[$68>>2]|0;if(!$69)break;else{$$1385$be=$69;$$1388$be=$68}}else{$$1385$be=$66;$$1388$be=$65}$$1385=$$1385$be;$$1388=$$1388$be}if($3>>>0>$$1388>>>0)_abort();else{HEAP32[$$1388>>2]=0;$$3=$$1385;break}}else{$51=HEAP32[$16+8>>2]|0;if($3>>>0>$51>>>0)_abort();$53=$51+12|0;if((HEAP32[$53>>2]|0)!=($16|0))_abort();$56=$48+8|0;if((HEAP32[$56>>2]|0)==($16|0)){HEAP32[$53>>2]=$48;HEAP32[$56>>2]=$51;$$3=$48;break}else _abort()}}while(0);if(!$46){$$1=$16;$$1380=$17;$113=$16}else{$74=HEAP32[$16+28>>2]|0;$75=3184+($74<<2)|0;do{if((HEAP32[$75>>2]|0)==($16|0)){HEAP32[$75>>2]=$$3;if(!$$3){HEAP32[721]=HEAP32[721]&~(1<<$74);$$1=$16;$$1380=$17;$113=$16;break L10}}else if((HEAP32[724]|0)>>>0>$46>>>0)_abort();else{$84=$46+16|0;HEAP32[((HEAP32[$84>>2]|0)==($16|0)?$84:$46+20|0)>>2]=$$3;if(!$$3){$$1=$16;$$1380=$17;$113=$16;break L10}else break}}while(0);$89=HEAP32[724]|0;if($89>>>0>$$3>>>0)_abort();HEAP32[$$3+24>>2]=$46;$92=$16+16|0;$93=HEAP32[$92>>2]|0;do{if($93|0)if($89>>>0>$93>>>0)_abort();else{HEAP32[$$3+16>>2]=$93;HEAP32[$93+24>>2]=$$3;break}}while(0);$99=HEAP32[$92+4>>2]|0;if(!$99){$$1=$16;$$1380=$17;$113=$16}else if((HEAP32[724]|0)>>>0>$99>>>0)_abort();else{HEAP32[$$3+20>>2]=$99;HEAP32[$99+24>>2]=$$3;$$1=$16;$$1380=$17;$113=$16;break}}}else{$$1=$2;$$1380=$9;$113=$2}}while(0);if($113>>>0>=$10>>>0)_abort();$115=$10+4|0;$116=HEAP32[$115>>2]|0;if(!($116&1))_abort();if(!($116&2)){if((HEAP32[726]|0)==($10|0)){$124=(HEAP32[723]|0)+$$1380|0;HEAP32[723]=$124;HEAP32[726]=$$1;HEAP32[$$1+4>>2]=$124|1;if(($$1|0)!=(HEAP32[725]|0))return;HEAP32[725]=0;HEAP32[722]=0;return}if((HEAP32[725]|0)==($10|0)){$132=(HEAP32[722]|0)+$$1380|0;HEAP32[722]=$132;HEAP32[725]=$113;HEAP32[$$1+4>>2]=$132|1;HEAP32[$113+$132>>2]=$132;return}$137=($116&-8)+$$1380|0;$138=$116>>>3;L111:do{if($116>>>0<256){$141=HEAP32[$10+8>>2]|0;$143=HEAP32[$10+12>>2]|0;$145=2920+($138<<1<<2)|0;if(($141|0)!=($145|0)){if((HEAP32[724]|0)>>>0>$141>>>0)_abort();if((HEAP32[$141+12>>2]|0)!=($10|0))_abort()}if(($143|0)==($141|0)){HEAP32[720]=HEAP32[720]&~(1<<$138);break}if(($143|0)==($145|0))$$pre$phi444Z2D=$143+8|0;else{if((HEAP32[724]|0)>>>0>$143>>>0)_abort();$160=$143+8|0;if((HEAP32[$160>>2]|0)==($10|0))$$pre$phi444Z2D=$160;else _abort()}HEAP32[$141+12>>2]=$143;HEAP32[$$pre$phi444Z2D>>2]=$141}else{$165=HEAP32[$10+24>>2]|0;$167=HEAP32[$10+12>>2]|0;do{if(($167|0)==($10|0)){$179=$10+16|0;$180=$179+4|0;$181=HEAP32[$180>>2]|0;if(!$181){$183=HEAP32[$179>>2]|0;if(!$183){$$3398=0;break}else{$$1396$ph=$183;$$1400$ph=$179}}else{$$1396$ph=$181;$$1400$ph=$180}$$1396=$$1396$ph;$$1400=$$1400$ph;while(1){$185=$$1396+20|0;$186=HEAP32[$185>>2]|0;if(!$186){$188=$$1396+16|0;$189=HEAP32[$188>>2]|0;if(!$189)break;else{$$1396$be=$189;$$1400$be=$188}}else{$$1396$be=$186;$$1400$be=$185}$$1396=$$1396$be;$$1400=$$1400$be}if((HEAP32[724]|0)>>>0>$$1400>>>0)_abort();else{HEAP32[$$1400>>2]=0;$$3398=$$1396;break}}else{$170=HEAP32[$10+8>>2]|0;if((HEAP32[724]|0)>>>0>$170>>>0)_abort();$173=$170+12|0;if((HEAP32[$173>>2]|0)!=($10|0))_abort();$176=$167+8|0;if((HEAP32[$176>>2]|0)==($10|0)){HEAP32[$173>>2]=$167;HEAP32[$176>>2]=$170;$$3398=$167;break}else _abort()}}while(0);if($165|0){$195=HEAP32[$10+28>>2]|0;$196=3184+($195<<2)|0;do{if((HEAP32[$196>>2]|0)==($10|0)){HEAP32[$196>>2]=$$3398;if(!$$3398){HEAP32[721]=HEAP32[721]&~(1<<$195);break L111}}else if((HEAP32[724]|0)>>>0>$165>>>0)_abort();else{$205=$165+16|0;HEAP32[((HEAP32[$205>>2]|0)==($10|0)?$205:$165+20|0)>>2]=$$3398;if(!$$3398)break L111;else break}}while(0);$210=HEAP32[724]|0;if($210>>>0>$$3398>>>0)_abort();HEAP32[$$3398+24>>2]=$165;$213=$10+16|0;$214=HEAP32[$213>>2]|0;do{if($214|0)if($210>>>0>$214>>>0)_abort();else{HEAP32[$$3398+16>>2]=$214;HEAP32[$214+24>>2]=$$3398;break}}while(0);$220=HEAP32[$213+4>>2]|0;if($220|0)if((HEAP32[724]|0)>>>0>$220>>>0)_abort();else{HEAP32[$$3398+20>>2]=$220;HEAP32[$220+24>>2]=$$3398;break}}}}while(0);HEAP32[$$1+4>>2]=$137|1;HEAP32[$113+$137>>2]=$137;if(($$1|0)==(HEAP32[725]|0)){HEAP32[722]=$137;return}else $$2=$137}else{HEAP32[$115>>2]=$116&-2;HEAP32[$$1+4>>2]=$$1380|1;HEAP32[$113+$$1380>>2]=$$1380;$$2=$$1380}$235=$$2>>>3;if($$2>>>0<256){$238=2920+($235<<1<<2)|0;$239=HEAP32[720]|0;$240=1<<$235;if(!($239&$240)){HEAP32[720]=$239|$240;$$0401=$238;$$pre$phiZ2D=$238+8|0}else{$244=$238+8|0;$245=HEAP32[$244>>2]|0;if((HEAP32[724]|0)>>>0>$245>>>0)_abort();else{$$0401=$245;$$pre$phiZ2D=$244}}HEAP32[$$pre$phiZ2D>>2]=$$1;HEAP32[$$0401+12>>2]=$$1;HEAP32[$$1+8>>2]=$$0401;HEAP32[$$1+12>>2]=$238;return}$251=$$2>>>8;if(!$251)$$0394=0;else if($$2>>>0>16777215)$$0394=31;else{$256=($251+1048320|0)>>>16&8;$257=$251<<$256;$260=($257+520192|0)>>>16&4;$262=$257<<$260;$265=($262+245760|0)>>>16&2;$270=14-($260|$256|$265)+($262<<$265>>>15)|0;$$0394=$$2>>>($270+7|0)&1|$270<<1}$276=3184+($$0394<<2)|0;HEAP32[$$1+28>>2]=$$0394;HEAP32[$$1+20>>2]=0;HEAP32[$$1+16>>2]=0;$280=HEAP32[721]|0;$281=1<<$$0394;L197:do{if(!($280&$281)){HEAP32[721]=$280|$281;HEAP32[$276>>2]=$$1;HEAP32[$$1+24>>2]=$276;HEAP32[$$1+12>>2]=$$1;HEAP32[$$1+8>>2]=$$1}else{$288=HEAP32[$276>>2]|0;L200:do{if((HEAP32[$288+4>>2]&-8|0)==($$2|0))$$0382$lcssa=$288;else{$$0381438=$$2<<(($$0394|0)==31?0:25-($$0394>>>1)|0);$$0382437=$288;while(1){$305=$$0382437+16+($$0381438>>>31<<2)|0;$300=HEAP32[$305>>2]|0;if(!$300)break;if((HEAP32[$300+4>>2]&-8|0)==($$2|0)){$$0382$lcssa=$300;break L200}else{$$0381438=$$0381438<<1;$$0382437=$300}}if((HEAP32[724]|0)>>>0>$305>>>0)_abort();else{HEAP32[$305>>2]=$$1;HEAP32[$$1+24>>2]=$$0382437;HEAP32[$$1+12>>2]=$$1;HEAP32[$$1+8>>2]=$$1;break L197}}}while(0);$312=$$0382$lcssa+8|0;$313=HEAP32[$312>>2]|0;$314=HEAP32[724]|0;if($314>>>0<=$313>>>0&$314>>>0<=$$0382$lcssa>>>0){HEAP32[$313+12>>2]=$$1;HEAP32[$312>>2]=$$1;HEAP32[$$1+8>>2]=$313;HEAP32[$$1+12>>2]=$$0382$lcssa;HEAP32[$$1+24>>2]=0;break}else _abort()}}while(0);$323=(HEAP32[728]|0)+-1|0;HEAP32[728]=$323;if($323|0)return;$$0211$in$i=3336;while(1){$$0211$i=HEAP32[$$0211$in$i>>2]|0;if(!$$0211$i)break;else $$0211$in$i=$$0211$i+8|0}HEAP32[728]=-1;return}function _inverse_mdct($0,$1,$2,$3){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;var $$0$lcssa=0,$$0492$lcssa=0,$$0492579=0,$$0494=0,$$0494521=0,$$0494529=0,$$0496526=0,$$0497525=0,$$0498524=0,$$0499523=0,$$0500578=0,$$0502$lcssa=0,$$0502577=0,$$0504567=0,$$0505566=0,$$0506565=0,$$0507564=0,$$0508=0,$$0508531=0,$$0508535=0,$$0509533=0,$$0510532=0,$$0511563=0,$$0512541=0,$$0513540=0,$$0514539=0,$$0515547=0,$$0516546=0,$$0517555=0,$$0518545=0,$$0559=0,$$1493573=0,$$1501572=0,$$1503571=0,$$1551=0,$$pn=0,$$pn520528=0,$$pn520528$phi=0,$$pn534=0,$$pn534$phi=0,$106=0,$108=0,$109=0,$110=0,$112=0,$114=0,$12=0,$123=0,$14=0,$140=0,$141=0,$142=0,$143=0,$145=0,$146=0,$153=0,$156=0,$157=0,$158=0,$16=0,$162=0,$163=0,$164=0,$169=0,$172=0,$173=0,$175=0,$177=0,$18=0,$180=0,$181=0,$187=0,$188=0,$19=0,$194=0,$20=0,$212=0,$22=0,$23=0,$230=0,$234=0,$235=0,$236=0,$237=0,$238=0,$239=0,$240=0,$241=0,$242=0,$244=0,$246=0,$248=0,$251=0,$252=0,$253=0,$258=0,$259=0,$260=0,$261=0,$262=0,$263=0,$264=0,$265=0,$266=0,$268=0,$27=0,$271=0,$273=0,$276=0,$277=0,$278=0,$294=0,$296=0,$299=0,$301=0,$303=0,$307=0,$31=0,$312=0,$314=0,$317=0,$319=0,$321=0,$325=0,$33=0,$332=0,$334=0,$337=0,$339=0,$341=0,$345=0,$351=0,$353=0,$356=0,$357=0,$359=0,$363=0,$4=0,$5=0,$52=0,$57=0,$6=0,$7=0,$8=0,$80=0,$82=0,$83=0,$86=0,$92=0,$95=0,$scevgep=0,sp=0;sp=STACKTOP;$4=$1>>1;$5=$1>>2;$6=$1>>3;$7=$2+80|0;$8=HEAP32[$7>>2]|0;$12=$4<<2;if(!(HEAP32[$2+68>>2]|0)){$14=STACKTOP;STACKTOP=STACKTOP+((1*$12|0)+15&-16)|0;$19=$14}else $19=_setup_temp_malloc($2,$12)|0;$16=HEAP32[$2+1056+($3<<2)>>2]|0;$18=$19+($4+-2<<2)|0;$20=$0+($4<<2)|0;if(!$4){$$0492$lcssa=$18;$$0502$lcssa=$16}else{$22=$12+-16|0;$23=$22>>>4;$scevgep=$19+($22-($23<<3))|0;$27=($23<<1)+2|0;$$0492579=$18;$$0500578=$0;$$0502577=$16;while(1){$31=$$0500578+8|0;$33=$$0502577+4|0;HEAPF32[$$0492579+4>>2]=+HEAPF32[$$0500578>>2]*+HEAPF32[$$0502577>>2]-+HEAPF32[$31>>2]*+HEAPF32[$33>>2];HEAPF32[$$0492579>>2]=+HEAPF32[$$0500578>>2]*+HEAPF32[$33>>2]+ +HEAPF32[$31>>2]*+HEAPF32[$$0502577>>2];$$0500578=$$0500578+16|0;if(($$0500578|0)==($20|0))break;else{$$0492579=$$0492579+-8|0;$$0502577=$$0502577+8|0}}$$0492$lcssa=$scevgep;$$0502$lcssa=$16+($27<<2)|0}if($$0492$lcssa>>>0>=$19>>>0){$$1493573=$$0492$lcssa;$$1501572=$0+($4+-3<<2)|0;$$1503571=$$0502$lcssa;while(1){$52=$$1501572+8|0;$57=$$1503571+4|0;HEAPF32[$$1493573+4>>2]=+HEAPF32[$$1501572>>2]*+HEAPF32[$57>>2]-+HEAPF32[$52>>2]*+HEAPF32[$$1503571>>2];HEAPF32[$$1493573>>2]=-(+HEAPF32[$$1501572>>2]*+HEAPF32[$$1503571>>2])-+HEAPF32[$52>>2]*+HEAPF32[$57>>2];$$1493573=$$1493573+-8|0;if($$1493573>>>0<$19>>>0)break;else{$$1501572=$$1501572+-16|0;$$1503571=$$1503571+8|0}}}if(($1|0)>=16){$$0504567=$16+($4+-8<<2)|0;$$0505566=$0+($5<<2)|0;$$0506565=$0;$$0507564=$19+($5<<2)|0;$$0511563=$19;while(1){$80=+HEAPF32[$$0507564+4>>2];$82=+HEAPF32[$$0511563+4>>2];$83=$80-$82;$86=+HEAPF32[$$0507564>>2]-+HEAPF32[$$0511563>>2];HEAPF32[$$0505566+4>>2]=$80+$82;HEAPF32[$$0505566>>2]=+HEAPF32[$$0507564>>2]+ +HEAPF32[$$0511563>>2];$92=$$0504567+16|0;$95=$$0504567+20|0;HEAPF32[$$0506565+4>>2]=$83*+HEAPF32[$92>>2]-$86*+HEAPF32[$95>>2];HEAPF32[$$0506565>>2]=$86*+HEAPF32[$92>>2]+$83*+HEAPF32[$95>>2];$106=+HEAPF32[$$0507564+12>>2];$108=+HEAPF32[$$0511563+12>>2];$109=$106-$108;$110=$$0507564+8|0;$112=$$0511563+8|0;$114=+HEAPF32[$110>>2]-+HEAPF32[$112>>2];HEAPF32[$$0505566+12>>2]=$106+$108;HEAPF32[$$0505566+8>>2]=+HEAPF32[$110>>2]+ +HEAPF32[$112>>2];$123=$$0504567+4|0;HEAPF32[$$0506565+12>>2]=$109*+HEAPF32[$$0504567>>2]-$114*+HEAPF32[$123>>2];HEAPF32[$$0506565+8>>2]=$114*+HEAPF32[$$0504567>>2]+$109*+HEAPF32[$123>>2];$$0504567=$$0504567+-32|0;if($$0504567>>>0<$16>>>0)break;else{$$0505566=$$0505566+16|0;$$0506565=$$0506565+16|0;$$0507564=$$0507564+16|0;$$0511563=$$0511563+16|0}}}$140=_ilog($1)|0;$141=$1>>4;$142=$4+-1|0;$143=0-$6|0;_imdct_step3_iter0_loop($141,$0,$142,$143,$16);_imdct_step3_iter0_loop($141,$0,$142-$5|0,$143,$16);$145=$1>>5;$146=0-$141|0;_imdct_step3_inner_r_loop($145,$0,$142,$146,$16,16);_imdct_step3_inner_r_loop($145,$0,$142-$6|0,$146,$16,16);_imdct_step3_inner_r_loop($145,$0,$142-($6<<1)|0,$146,$16,16);_imdct_step3_inner_r_loop($145,$0,$142+(Math_imul($6,-3)|0)|0,$146,$16,16);$153=$140+-4>>1;if(($140|0)>9){$$0559=2;while(1){$156=$1>>$$0559+2;$157=$$0559+1|0;$158=2<<$$0559;if(($158|0)>0){$162=$1>>$$0559+4;$163=0-($156>>1)|0;$164=8<<$$0559;$$0517555=0;do{_imdct_step3_inner_r_loop($162,$0,$142-(Math_imul($$0517555,$156)|0)|0,$163,$16,$164);$$0517555=$$0517555+1|0}while(($$0517555|0)!=($158|0))}if(($157|0)<($153|0))$$0559=$157;else{$$0$lcssa=$157;break}}}else $$0$lcssa=2;$169=$140+-7|0;if(($$0$lcssa|0)<($169|0)){$$1551=$$0$lcssa;do{$172=$1>>$$1551+2;$173=8<<$$1551;$175=$1>>$$1551+6;$177=2<<$$1551;$$1551=$$1551+1|0;if(($175|0)>0){$180=0-($172>>1)|0;$181=$173<<2;$$0515547=$16;$$0516546=$142;$$0518545=$175;while(1){_imdct_step3_inner_s_loop($177,$0,$$0516546,$180,$$0515547,$173,$172);if(($$0518545|0)>1){$$0515547=$$0515547+($181<<2)|0;$$0516546=$$0516546+-8|0;$$0518545=$$0518545+-1|0}else break}}}while(($$1551|0)!=($169|0))}_imdct_step3_inner_s_loop_ld654($145,$0,$142,$16,$1);$187=$19+($5+-4<<2)|0;$188=$4+-4|0;if($187>>>0>=$19>>>0){$$0512541=$19+($188<<2)|0;$$0513540=$187;$$0514539=HEAP32[$2+1088+($3<<2)>>2]|0;while(1){$194=HEAPU16[$$0514539>>1]|0;HEAP32[$$0512541+12>>2]=HEAP32[$0+($194<<2)>>2];HEAP32[$$0512541+8>>2]=HEAP32[$0+($194+1<<2)>>2];HEAP32[$$0513540+12>>2]=HEAP32[$0+($194+2<<2)>>2];HEAP32[$$0513540+8>>2]=HEAP32[$0+($194+3<<2)>>2];$212=HEAPU16[$$0514539+2>>1]|0;HEAP32[$$0512541+4>>2]=HEAP32[$0+($212<<2)>>2];HEAP32[$$0512541>>2]=HEAP32[$0+($212+1<<2)>>2];HEAP32[$$0513540+4>>2]=HEAP32[$0+($212+2<<2)>>2];HEAP32[$$0513540>>2]=HEAP32[$0+($212+3<<2)>>2];$$0513540=$$0513540+-16|0;if($$0513540>>>0<$19>>>0)break;else{$$0512541=$$0512541+-16|0;$$0514539=$$0514539+4|0}}}$230=$19+($4<<2)|0;$$0508531=$230+-16|0;if($$0508531>>>0>$19>>>0){$$0508535=$$0508531;$$0509533=$19;$$0510532=HEAP32[$2+1072+($3<<2)>>2]|0;$$pn534=$230;while(1){$234=+HEAPF32[$$0509533>>2];$235=$$pn534+-8|0;$236=+HEAPF32[$235>>2];$237=$234-$236;$238=$$0509533+4|0;$239=+HEAPF32[$238>>2];$240=$$pn534+-4|0;$241=+HEAPF32[$240>>2];$242=$239+$241;$244=+HEAPF32[$$0510532+4>>2];$246=+HEAPF32[$$0510532>>2];$248=$237*$244+$242*$246;$251=$244*$242-$237*$246;$252=$234+$236;$253=$239-$241;HEAPF32[$$0509533>>2]=$252+$248;HEAPF32[$238>>2]=$253+$251;HEAPF32[$235>>2]=$252-$248;HEAPF32[$240>>2]=$251-$253;$258=$$0509533+8|0;$259=+HEAPF32[$258>>2];$260=+HEAPF32[$$0508535>>2];$261=$259-$260;$262=$$0509533+12|0;$263=+HEAPF32[$262>>2];$264=$$pn534+-12|0;$265=+HEAPF32[$264>>2];$266=$263+$265;$268=+HEAPF32[$$0510532+12>>2];$271=+HEAPF32[$$0510532+8>>2];$273=$261*$268+$266*$271;$276=$268*$266-$261*$271;$277=$259+$260;$278=$263-$265;HEAPF32[$258>>2]=$277+$273;HEAPF32[$262>>2]=$278+$276;HEAPF32[$$0508535>>2]=$277-$273;HEAPF32[$264>>2]=$276-$278;$$0509533=$$0509533+16|0;$$0508=$$0508535+-16|0;if($$0509533>>>0>=$$0508>>>0)break;else{$$pn534$phi=$$0508535;$$0508535=$$0508;$$0510532=$$0510532+16|0;$$pn534=$$pn534$phi}}}$$0494521=$230+-32|0;if($$0494521>>>0>=$19>>>0){$$0494529=$$0494521;$$0496526=$0+($1+-4<<2)|0;$$0497525=$20;$$0498524=$0+($188<<2)|0;$$0499523=$0;$$pn=(HEAP32[$2+1064+($3<<2)>>2]|0)+($4<<2)|0;$$pn520528=$230;while(1){$294=+HEAPF32[$$pn520528+-8>>2];$296=+HEAPF32[$$pn+-4>>2];$299=+HEAPF32[$$pn520528+-4>>2];$301=+HEAPF32[$$pn+-8>>2];$303=$294*$296-$299*$301;$307=-($294*$301)-$296*$299;HEAPF32[$$0499523>>2]=$303;HEAPF32[$$0498524+12>>2]=-$303;HEAPF32[$$0497525>>2]=$307;HEAPF32[$$0496526+12>>2]=$307;$312=+HEAPF32[$$pn520528+-16>>2];$314=+HEAPF32[$$pn+-12>>2];$317=+HEAPF32[$$pn520528+-12>>2];$319=+HEAPF32[$$pn+-16>>2];$321=$312*$314-$317*$319;$325=-($312*$319)-$314*$317;HEAPF32[$$0499523+4>>2]=$321;HEAPF32[$$0498524+8>>2]=-$321;HEAPF32[$$0497525+4>>2]=$325;HEAPF32[$$0496526+8>>2]=$325;$332=+HEAPF32[$$pn520528+-24>>2];$334=+HEAPF32[$$pn+-20>>2];$337=+HEAPF32[$$pn520528+-20>>2];$339=+HEAPF32[$$pn+-24>>2];$341=$332*$334-$337*$339;$345=-($332*$339)-$334*$337;HEAPF32[$$0499523+8>>2]=$341;HEAPF32[$$0498524+4>>2]=-$341;HEAPF32[$$0497525+8>>2]=$345;HEAPF32[$$0496526+4>>2]=$345;$351=+HEAPF32[$$0494529>>2];$353=+HEAPF32[$$pn+-28>>2];$$pn=$$pn+-32|0;$356=+HEAPF32[$$pn520528+-28>>2];$357=+HEAPF32[$$pn>>2];$359=$351*$353-$356*$357;$363=-($351*$357)-$353*$356;HEAPF32[$$0499523+12>>2]=$359;HEAPF32[$$0498524>>2]=-$359;HEAPF32[$$0497525+12>>2]=$363;HEAPF32[$$0496526>>2]=$363;$$0494=$$0494529+-32|0;if($$0494>>>0<$19>>>0)break;else{$$pn520528$phi=$$0494529;$$0494529=$$0494;$$0496526=$$0496526+-16|0;$$0497525=$$0497525+16|0;$$0498524=$$0498524+-16|0;$$0499523=$$0499523+16|0;$$pn520528=$$pn520528$phi}}}HEAP32[$7>>2]=$8;STACKTOP=sp;return}function _dispose_chunk($0,$1){$0=$0|0;$1=$1|0;var $$041722=0,$$0418$lcssa=0,$$041821=0,$$0429=0,$$0436=0,$$1=0,$$1416=0,$$1424=0,$$1424$be=0,$$1424$ph=0,$$1427=0,$$1427$be=0,$$1427$ph=0,$$1431=0,$$1431$be=0,$$1431$ph=0,$$1435=0,$$1435$be=0,$$1435$ph=0,$$2=0,$$3=0,$$3433=0,$$pre$phi28Z2D=0,$$pre$phi30Z2D=0,$$pre$phiZ2D=0,$101=0,$102=0,$108=0,$11=0,$110=0,$111=0,$117=0,$12=0,$125=0,$13=0,$130=0,$131=0,$134=0,$136=0,$138=0,$151=0,$156=0,$158=0,$161=0,$163=0,$166=0,$169=0,$17=0,$170=0,$171=0,$173=0,$175=0,$176=0,$178=0,$179=0,$184=0,$185=0,$194=0,$199=0,$2=0,$20=0,$202=0,$203=0,$209=0,$22=0,$224=0,$227=0,$228=0,$229=0,$233=0,$234=0,$24=0,$240=0,$245=0,$246=0,$249=0,$251=0,$254=0,$259=0,$265=0,$269=0,$270=0,$277=0,$289=0,$294=0,$301=0,$302=0,$303=0,$37=0,$4=0,$42=0,$44=0,$47=0,$49=0,$52=0,$55=0,$56=0,$57=0,$59=0,$61=0,$62=0,$64=0,$65=0,$7=0,$70=0,$71=0,$80=0,$85=0,$88=0,$89=0,$95=0;$2=$0+$1|0;$4=HEAP32[$0+4>>2]|0;L1:do{if(!($4&1)){$7=HEAP32[$0>>2]|0;if(!($4&3))return;$11=$0+(0-$7)|0;$12=$7+$1|0;$13=HEAP32[724]|0;if($11>>>0<$13>>>0)_abort();if((HEAP32[725]|0)==($11|0)){$101=$2+4|0;$102=HEAP32[$101>>2]|0;if(($102&3|0)!=3){$$1=$11;$$1416=$12;break}HEAP32[722]=$12;HEAP32[$101>>2]=$102&-2;HEAP32[$11+4>>2]=$12|1;HEAP32[$2>>2]=$12;return}$17=$7>>>3;if($7>>>0<256){$20=HEAP32[$11+8>>2]|0;$22=HEAP32[$11+12>>2]|0;$24=2920+($17<<1<<2)|0;if(($20|0)!=($24|0)){if($13>>>0>$20>>>0)_abort();if((HEAP32[$20+12>>2]|0)!=($11|0))_abort()}if(($22|0)==($20|0)){HEAP32[720]=HEAP32[720]&~(1<<$17);$$1=$11;$$1416=$12;break}if(($22|0)==($24|0))$$pre$phi30Z2D=$22+8|0;else{if($13>>>0>$22>>>0)_abort();$37=$22+8|0;if((HEAP32[$37>>2]|0)==($11|0))$$pre$phi30Z2D=$37;else _abort()}HEAP32[$20+12>>2]=$22;HEAP32[$$pre$phi30Z2D>>2]=$20;$$1=$11;$$1416=$12;break}$42=HEAP32[$11+24>>2]|0;$44=HEAP32[$11+12>>2]|0;do{if(($44|0)==($11|0)){$55=$11+16|0;$56=$55+4|0;$57=HEAP32[$56>>2]|0;if(!$57){$59=HEAP32[$55>>2]|0;if(!$59){$$3=0;break}else{$$1424$ph=$59;$$1427$ph=$55}}else{$$1424$ph=$57;$$1427$ph=$56}$$1424=$$1424$ph;$$1427=$$1427$ph;while(1){$61=$$1424+20|0;$62=HEAP32[$61>>2]|0;if(!$62){$64=$$1424+16|0;$65=HEAP32[$64>>2]|0;if(!$65)break;else{$$1424$be=$65;$$1427$be=$64}}else{$$1424$be=$62;$$1427$be=$61}$$1424=$$1424$be;$$1427=$$1427$be}if($13>>>0>$$1427>>>0)_abort();else{HEAP32[$$1427>>2]=0;$$3=$$1424;break}}else{$47=HEAP32[$11+8>>2]|0;if($13>>>0>$47>>>0)_abort();$49=$47+12|0;if((HEAP32[$49>>2]|0)!=($11|0))_abort();$52=$44+8|0;if((HEAP32[$52>>2]|0)==($11|0)){HEAP32[$49>>2]=$44;HEAP32[$52>>2]=$47;$$3=$44;break}else _abort()}}while(0);if(!$42){$$1=$11;$$1416=$12}else{$70=HEAP32[$11+28>>2]|0;$71=3184+($70<<2)|0;do{if((HEAP32[$71>>2]|0)==($11|0)){HEAP32[$71>>2]=$$3;if(!$$3){HEAP32[721]=HEAP32[721]&~(1<<$70);$$1=$11;$$1416=$12;break L1}}else if((HEAP32[724]|0)>>>0>$42>>>0)_abort();else{$80=$42+16|0;HEAP32[((HEAP32[$80>>2]|0)==($11|0)?$80:$42+20|0)>>2]=$$3;if(!$$3){$$1=$11;$$1416=$12;break L1}else break}}while(0);$85=HEAP32[724]|0;if($85>>>0>$$3>>>0)_abort();HEAP32[$$3+24>>2]=$42;$88=$11+16|0;$89=HEAP32[$88>>2]|0;do{if($89|0)if($85>>>0>$89>>>0)_abort();else{HEAP32[$$3+16>>2]=$89;HEAP32[$89+24>>2]=$$3;break}}while(0);$95=HEAP32[$88+4>>2]|0;if(!$95){$$1=$11;$$1416=$12}else if((HEAP32[724]|0)>>>0>$95>>>0)_abort();else{HEAP32[$$3+20>>2]=$95;HEAP32[$95+24>>2]=$$3;$$1=$11;$$1416=$12;break}}}else{$$1=$0;$$1416=$1}}while(0);$108=HEAP32[724]|0;if($2>>>0<$108>>>0)_abort();$110=$2+4|0;$111=HEAP32[$110>>2]|0;if(!($111&2)){if((HEAP32[726]|0)==($2|0)){$117=(HEAP32[723]|0)+$$1416|0;HEAP32[723]=$117;HEAP32[726]=$$1;HEAP32[$$1+4>>2]=$117|1;if(($$1|0)!=(HEAP32[725]|0))return;HEAP32[725]=0;HEAP32[722]=0;return}if((HEAP32[725]|0)==($2|0)){$125=(HEAP32[722]|0)+$$1416|0;HEAP32[722]=$125;HEAP32[725]=$$1;HEAP32[$$1+4>>2]=$125|1;HEAP32[$$1+$125>>2]=$125;return}$130=($111&-8)+$$1416|0;$131=$111>>>3;L99:do{if($111>>>0<256){$134=HEAP32[$2+8>>2]|0;$136=HEAP32[$2+12>>2]|0;$138=2920+($131<<1<<2)|0;if(($134|0)!=($138|0)){if($108>>>0>$134>>>0)_abort();if((HEAP32[$134+12>>2]|0)!=($2|0))_abort()}if(($136|0)==($134|0)){HEAP32[720]=HEAP32[720]&~(1<<$131);break}if(($136|0)==($138|0))$$pre$phi28Z2D=$136+8|0;else{if($108>>>0>$136>>>0)_abort();$151=$136+8|0;if((HEAP32[$151>>2]|0)==($2|0))$$pre$phi28Z2D=$151;else _abort()}HEAP32[$134+12>>2]=$136;HEAP32[$$pre$phi28Z2D>>2]=$134}else{$156=HEAP32[$2+24>>2]|0;$158=HEAP32[$2+12>>2]|0;do{if(($158|0)==($2|0)){$169=$2+16|0;$170=$169+4|0;$171=HEAP32[$170>>2]|0;if(!$171){$173=HEAP32[$169>>2]|0;if(!$173){$$3433=0;break}else{$$1431$ph=$173;$$1435$ph=$169}}else{$$1431$ph=$171;$$1435$ph=$170}$$1431=$$1431$ph;$$1435=$$1435$ph;while(1){$175=$$1431+20|0;$176=HEAP32[$175>>2]|0;if(!$176){$178=$$1431+16|0;$179=HEAP32[$178>>2]|0;if(!$179)break;else{$$1431$be=$179;$$1435$be=$178}}else{$$1431$be=$176;$$1435$be=$175}$$1431=$$1431$be;$$1435=$$1435$be}if($108>>>0>$$1435>>>0)_abort();else{HEAP32[$$1435>>2]=0;$$3433=$$1431;break}}else{$161=HEAP32[$2+8>>2]|0;if($108>>>0>$161>>>0)_abort();$163=$161+12|0;if((HEAP32[$163>>2]|0)!=($2|0))_abort();$166=$158+8|0;if((HEAP32[$166>>2]|0)==($2|0)){HEAP32[$163>>2]=$158;HEAP32[$166>>2]=$161;$$3433=$158;break}else _abort()}}while(0);if($156|0){$184=HEAP32[$2+28>>2]|0;$185=3184+($184<<2)|0;do{if((HEAP32[$185>>2]|0)==($2|0)){HEAP32[$185>>2]=$$3433;if(!$$3433){HEAP32[721]=HEAP32[721]&~(1<<$184);break L99}}else if((HEAP32[724]|0)>>>0>$156>>>0)_abort();else{$194=$156+16|0;HEAP32[((HEAP32[$194>>2]|0)==($2|0)?$194:$156+20|0)>>2]=$$3433;if(!$$3433)break L99;else break}}while(0);$199=HEAP32[724]|0;if($199>>>0>$$3433>>>0)_abort();HEAP32[$$3433+24>>2]=$156;$202=$2+16|0;$203=HEAP32[$202>>2]|0;do{if($203|0)if($199>>>0>$203>>>0)_abort();else{HEAP32[$$3433+16>>2]=$203;HEAP32[$203+24>>2]=$$3433;break}}while(0);$209=HEAP32[$202+4>>2]|0;if($209|0)if((HEAP32[724]|0)>>>0>$209>>>0)_abort();else{HEAP32[$$3433+20>>2]=$209;HEAP32[$209+24>>2]=$$3433;break}}}}while(0);HEAP32[$$1+4>>2]=$130|1;HEAP32[$$1+$130>>2]=$130;if(($$1|0)==(HEAP32[725]|0)){HEAP32[722]=$130;return}else $$2=$130}else{HEAP32[$110>>2]=$111&-2;HEAP32[$$1+4>>2]=$$1416|1;HEAP32[$$1+$$1416>>2]=$$1416;$$2=$$1416}$224=$$2>>>3;if($$2>>>0<256){$227=2920+($224<<1<<2)|0;$228=HEAP32[720]|0;$229=1<<$224;if(!($228&$229)){HEAP32[720]=$228|$229;$$0436=$227;$$pre$phiZ2D=$227+8|0}else{$233=$227+8|0;$234=HEAP32[$233>>2]|0;if((HEAP32[724]|0)>>>0>$234>>>0)_abort();else{$$0436=$234;$$pre$phiZ2D=$233}}HEAP32[$$pre$phiZ2D>>2]=$$1;HEAP32[$$0436+12>>2]=$$1;HEAP32[$$1+8>>2]=$$0436;HEAP32[$$1+12>>2]=$227;return}$240=$$2>>>8;if(!$240)$$0429=0;else if($$2>>>0>16777215)$$0429=31;else{$245=($240+1048320|0)>>>16&8;$246=$240<<$245;$249=($246+520192|0)>>>16&4;$251=$246<<$249;$254=($251+245760|0)>>>16&2;$259=14-($249|$245|$254)+($251<<$254>>>15)|0;$$0429=$$2>>>($259+7|0)&1|$259<<1}$265=3184+($$0429<<2)|0;HEAP32[$$1+28>>2]=$$0429;HEAP32[$$1+20>>2]=0;HEAP32[$$1+16>>2]=0;$269=HEAP32[721]|0;$270=1<<$$0429;if(!($269&$270)){HEAP32[721]=$269|$270;HEAP32[$265>>2]=$$1;HEAP32[$$1+24>>2]=$265;HEAP32[$$1+12>>2]=$$1;HEAP32[$$1+8>>2]=$$1;return}$277=HEAP32[$265>>2]|0;L189:do{if((HEAP32[$277+4>>2]&-8|0)==($$2|0))$$0418$lcssa=$277;else{$$041722=$$2<<(($$0429|0)==31?0:25-($$0429>>>1)|0);$$041821=$277;while(1){$294=$$041821+16+($$041722>>>31<<2)|0;$289=HEAP32[$294>>2]|0;if(!$289)break;if((HEAP32[$289+4>>2]&-8|0)==($$2|0)){$$0418$lcssa=$289;break L189}else{$$041722=$$041722<<1;$$041821=$289}}if((HEAP32[724]|0)>>>0>$294>>>0)_abort();HEAP32[$294>>2]=$$1;HEAP32[$$1+24>>2]=$$041821;HEAP32[$$1+12>>2]=$$1;HEAP32[$$1+8>>2]=$$1;return}}while(0);$301=$$0418$lcssa+8|0;$302=HEAP32[$301>>2]|0;$303=HEAP32[724]|0;if(!($303>>>0<=$302>>>0&$303>>>0<=$$0418$lcssa>>>0))_abort();HEAP32[$302+12>>2]=$$1;HEAP32[$301>>2]=$$1;HEAP32[$$1+8>>2]=$302;HEAP32[$$1+12>>2]=$$0418$lcssa;HEAP32[$$1+24>>2]=0;return}function _try_realloc_chunk($0,$1){$0=$0|0;$1=$1|0;var $$1271=0,$$1271$be=0,$$1271$ph=0,$$1274=0,$$1274$be=0,$$1274$ph=0,$$2=0,$$3=0,$$pre$phiZ2D=0,$101=0,$103=0,$106=0,$108=0,$11=0,$111=0,$114=0,$115=0,$116=0,$118=0,$12=0,$120=0,$121=0,$123=0,$124=0,$129=0,$130=0,$139=0,$144=0,$147=0,$148=0,$154=0,$165=0,$168=0,$175=0,$2=0,$24=0,$26=0,$3=0,$37=0,$39=0,$4=0,$40=0,$49=0,$5=0,$51=0,$53=0,$54=0,$6=0,$60=0,$67=0,$73=0,$75=0,$76=0,$79=0,$8=0,$81=0,$83=0,$96=0,$storemerge=0,$storemerge3=0;$2=$0+4|0;$3=HEAP32[$2>>2]|0;$4=$3&-8;$5=$0+$4|0;$6=HEAP32[724]|0;$8=$3&3;if(!(($8|0)!=1&$6>>>0<=$0>>>0&$5>>>0>$0>>>0))_abort();$11=$5+4|0;$12=HEAP32[$11>>2]|0;if(!($12&1))_abort();if(!$8){if($1>>>0<256){$$2=0;return $$2|0}if($4>>>0>=($1+4|0)>>>0)if(($4-$1|0)>>>0<=HEAP32[840]<<1>>>0){$$2=$0;return $$2|0}$$2=0;return $$2|0}if($4>>>0>=$1>>>0){$24=$4-$1|0;if($24>>>0<=15){$$2=$0;return $$2|0}$26=$0+$1|0;HEAP32[$2>>2]=$3&1|$1|2;HEAP32[$26+4>>2]=$24|3;HEAP32[$11>>2]=HEAP32[$11>>2]|1;_dispose_chunk($26,$24);$$2=$0;return $$2|0}if((HEAP32[726]|0)==($5|0)){$37=(HEAP32[723]|0)+$4|0;$39=$37-$1|0;$40=$0+$1|0;if($37>>>0<=$1>>>0){$$2=0;return $$2|0}HEAP32[$2>>2]=$3&1|$1|2;HEAP32[$40+4>>2]=$39|1;HEAP32[726]=$40;HEAP32[723]=$39;$$2=$0;return $$2|0}if((HEAP32[725]|0)==($5|0)){$49=(HEAP32[722]|0)+$4|0;if($49>>>0<$1>>>0){$$2=0;return $$2|0}$51=$49-$1|0;if($51>>>0>15){$53=$0+$1|0;$54=$0+$49|0;HEAP32[$2>>2]=$3&1|$1|2;HEAP32[$53+4>>2]=$51|1;HEAP32[$54>>2]=$51;$60=$54+4|0;HEAP32[$60>>2]=HEAP32[$60>>2]&-2;$storemerge=$53;$storemerge3=$51}else{HEAP32[$2>>2]=$3&1|$49|2;$67=$0+$49+4|0;HEAP32[$67>>2]=HEAP32[$67>>2]|1;$storemerge=0;$storemerge3=0}HEAP32[722]=$storemerge3;HEAP32[725]=$storemerge;$$2=$0;return $$2|0}if($12&2|0){$$2=0;return $$2|0}$73=($12&-8)+$4|0;if($73>>>0<$1>>>0){$$2=0;return $$2|0}$75=$73-$1|0;$76=$12>>>3;L49:do{if($12>>>0<256){$79=HEAP32[$5+8>>2]|0;$81=HEAP32[$5+12>>2]|0;$83=2920+($76<<1<<2)|0;if(($79|0)!=($83|0)){if($6>>>0>$79>>>0)_abort();if((HEAP32[$79+12>>2]|0)!=($5|0))_abort()}if(($81|0)==($79|0)){HEAP32[720]=HEAP32[720]&~(1<<$76);break}if(($81|0)==($83|0))$$pre$phiZ2D=$81+8|0;else{if($6>>>0>$81>>>0)_abort();$96=$81+8|0;if((HEAP32[$96>>2]|0)==($5|0))$$pre$phiZ2D=$96;else _abort()}HEAP32[$79+12>>2]=$81;HEAP32[$$pre$phiZ2D>>2]=$79}else{$101=HEAP32[$5+24>>2]|0;$103=HEAP32[$5+12>>2]|0;do{if(($103|0)==($5|0)){$114=$5+16|0;$115=$114+4|0;$116=HEAP32[$115>>2]|0;if(!$116){$118=HEAP32[$114>>2]|0;if(!$118){$$3=0;break}else{$$1271$ph=$118;$$1274$ph=$114}}else{$$1271$ph=$116;$$1274$ph=$115}$$1271=$$1271$ph;$$1274=$$1274$ph;while(1){$120=$$1271+20|0;$121=HEAP32[$120>>2]|0;if(!$121){$123=$$1271+16|0;$124=HEAP32[$123>>2]|0;if(!$124)break;else{$$1271$be=$124;$$1274$be=$123}}else{$$1271$be=$121;$$1274$be=$120}$$1271=$$1271$be;$$1274=$$1274$be}if($6>>>0>$$1274>>>0)_abort();else{HEAP32[$$1274>>2]=0;$$3=$$1271;break}}else{$106=HEAP32[$5+8>>2]|0;if($6>>>0>$106>>>0)_abort();$108=$106+12|0;if((HEAP32[$108>>2]|0)!=($5|0))_abort();$111=$103+8|0;if((HEAP32[$111>>2]|0)==($5|0)){HEAP32[$108>>2]=$103;HEAP32[$111>>2]=$106;$$3=$103;break}else _abort()}}while(0);if($101|0){$129=HEAP32[$5+28>>2]|0;$130=3184+($129<<2)|0;do{if((HEAP32[$130>>2]|0)==($5|0)){HEAP32[$130>>2]=$$3;if(!$$3){HEAP32[721]=HEAP32[721]&~(1<<$129);break L49}}else if((HEAP32[724]|0)>>>0>$101>>>0)_abort();else{$139=$101+16|0;HEAP32[((HEAP32[$139>>2]|0)==($5|0)?$139:$101+20|0)>>2]=$$3;if(!$$3)break L49;else break}}while(0);$144=HEAP32[724]|0;if($144>>>0>$$3>>>0)_abort();HEAP32[$$3+24>>2]=$101;$147=$5+16|0;$148=HEAP32[$147>>2]|0;do{if($148|0)if($144>>>0>$148>>>0)_abort();else{HEAP32[$$3+16>>2]=$148;HEAP32[$148+24>>2]=$$3;break}}while(0);$154=HEAP32[$147+4>>2]|0;if($154|0)if((HEAP32[724]|0)>>>0>$154>>>0)_abort();else{HEAP32[$$3+20>>2]=$154;HEAP32[$154+24>>2]=$$3;break}}}}while(0);if($75>>>0<16){HEAP32[$2>>2]=$3&1|$73|2;$165=$0+$73+4|0;HEAP32[$165>>2]=HEAP32[$165>>2]|1;$$2=$0;return $$2|0}else{$168=$0+$1|0;HEAP32[$2>>2]=$3&1|$1|2;HEAP32[$168+4>>2]=$75|3;$175=$0+$73+4|0;HEAP32[$175>>2]=HEAP32[$175>>2]|1;_dispose_chunk($168,$75);$$2=$0;return $$2|0}return 0}function _stb_vorbis_js_decode($0,$1,$2,$3,$4){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;var $$0=0,$$0103143=0,$$0105=0,$$0109=0,$$0112161=0,$$0118=0,$$0121160=0,$$095148=0,$$096152=0,$$097163=0,$$098145=0,$$099162=0,$$1=0,$$1100=0,$$1106=0,$$1113=0,$$2107=0,$$2107171=0,$$2123=0,$$3=0,$$3102=0,$$3115=0,$$4=0,$$4116=0,$$lcssa=0,$$pre=0,$13=0,$15=0,$20=0,$21=0,$24=0,$26=0,$30=0,$31=0,$36=0,$41=0,$42=0,$43=0,$44=0,$48=0,$5=0,$52=0,$53=0,$55=0,$58=0,$6=0,$60=0,$62=0,$64=0,$65=0,$67=0,$69=0,$7=0,$73=0,$79=0,$80=0,$9=0,$spec$select=0,$spec$select124142=0,$spec$select124144=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+16|0;$5=sp+4|0;$6=sp;HEAP32[$4>>2]=0;$7=HEAP32[$0>>2]|0;L1:do{if(!$7){$$0112161=$2;$$0121160=32;$$097163=0;$$099162=$1;L3:while(1){HEAP32[$5>>2]=0;HEAP32[$6>>2]=0;$spec$select=($$0121160|0)>($$0112161|0)?$$0112161:$$0121160;$9=_stb_vorbis_open_pushdata($$099162,$spec$select,$5,$6,0)|0;HEAP32[$0>>2]=$9;switch(HEAP32[$6>>2]|0){case 1:{$13=($$0112161|0)<=($$0121160|0);$$0118=$13?1:2;$$1=$13?0:$$097163;$$1100=$$099162;$$1113=$$0112161;$$2123=$spec$select<<(($13^1)&1);break}case 0:{$15=HEAP32[$5>>2]|0;HEAP32[$4>>2]=(HEAP32[$4>>2]|0)+$15;$$0118=0;$$1=$$097163;$$1100=$$099162+$15|0;$$1113=$$0112161-$15|0;$$2123=$spec$select;break}default:{$$0118=1;$$1=-1;$$1100=$$099162;$$1113=$$0112161;$$2123=$spec$select}}switch($$0118&3){case 2:case 0:break;default:break L3}if(!$9){$$0112161=$$1113;$$0121160=$$2123;$$097163=$$1;$$099162=$$1100}else{$$3102=$$1100;$$3115=$$1113;$21=$9;label=9;break L1}}if(!$$0118){$$3102=$$1100;$$3115=$$1113;$21=$9;label=9}else $$3=$$1}else{$$3102=$1;$$3115=$2;$21=$7;label=9}}while(0);do{if((label|0)==9){$20=$21+4|0;$24=_malloc(HEAP32[$20>>2]<<2)|0;if(!$24)_abort();$26=HEAP32[$20>>2]|0;if(($26|0)>0)_memset($24|0,0,$26<<2|0)|0;$$0105=0;$$0109=0;$$4=$$3102;$$4116=$$3115;$30=$21;L19:while(1){HEAP32[$5>>2]=0;HEAP32[$6>>2]=0;$spec$select124142=($$4116|0)<32?$$4116:32;$31=_stb_vorbis_decode_frame_pushdata($30,$$4,$spec$select124142,0,$5,$6)|0;if(!$31){$$0103143=32;$spec$select124144=$spec$select124142;while(1){if(($$4116|0)<=($$0103143|0)){label=35;break L19}$$0103143=$spec$select124144<<1;$spec$select124144=($$0103143|0)>($$4116|0)?$$4116:$$0103143;$36=_stb_vorbis_decode_frame_pushdata(HEAP32[$0>>2]|0,$$4,$spec$select124144,0,$5,$6)|0;if($36|0){$$lcssa=$36;break}}}else $$lcssa=$31;HEAP32[$4>>2]=(HEAP32[$4>>2]|0)+$$lcssa;$41=$$4+$$lcssa|0;$42=$$4116-$$lcssa|0;$43=HEAP32[$6>>2]|0;$44=$43+$$0109|0;if(($$0105|0)<($44|0)){$$1106=($$0105|0)==0?4096:$$0105<<1;$48=HEAP32[$0>>2]|0;if((HEAP32[$48+4>>2]|0)>0){$52=$$1106<<2;$$098145=0;while(1){$53=$24+($$098145<<2)|0;$55=_realloc(HEAP32[$53>>2]|0,$52)|0;if(!$55){label=23;break L19}HEAP32[$53>>2]=$55;$$098145=$$098145+1|0;$58=HEAP32[$0>>2]|0;$60=HEAP32[$58+4>>2]|0;if(($$098145|0)>=($60|0)){$$2107=$$1106;$62=$60;$79=$58;label=25;break}}}else{$$2107171=$$1106;$80=$48}}else{$$pre=HEAP32[$0>>2]|0;$$2107=$$0105;$62=HEAP32[$$pre+4>>2]|0;$79=$$pre;label=25}if((label|0)==25){label=0;if(($62|0)>0){$64=($43|0)>0;$65=HEAP32[$5>>2]|0;$$096152=0;do{if($64){$67=HEAP32[$65+($$096152<<2)>>2]|0;$69=HEAP32[$24+($$096152<<2)>>2]|0;$$095148=0;do{$73=+HEAPF32[$67+($$095148<<2)>>2];if($73>1)$$0=1;else if($73<-1)$$0=-1;else $$0=$73;HEAPF32[$69+($$095148+$$0109<<2)>>2]=$$0;$$095148=$$095148+1|0}while(($$095148|0)!=($43|0))}$$096152=$$096152+1|0}while(($$096152|0)<($62|0));$$2107171=$$2107;$80=$79}else{$$2107171=$$2107;$80=$79}}$$0105=$$2107171;$$0109=$44;$$4=$41;$$4116=$42;$30=$80}if((label|0)==23)_abort();else if((label|0)==35){HEAP32[$3>>2]=$24;$$3=$$0109;break}}}while(0);STACKTOP=sp;return $$3|0}function _vorbis_search_for_page_pushdata($0,$1,$2){$0=$0|0;$1=$1|0;$2=$2|0;var $$0148175=0,$$0149$lcssa=0,$$0149174=0,$$0150185=0,$$0152$lcssa=0,$$0152179=0,$$0153178=0,$$0161204=0,$$1151187=0,$$1154184=0,$$1162193=0,$$2=0,$$2155186=0,$$2163176=0,$$3$ph=0,$$3222=0,$$4165$ph=0,$$pre=0,$$sink=0,$102=0,$104=0,$105=0,$106=0,$107=0,$109=0,$11=0,$110=0,$115=0,$118=0,$12=0,$122=0,$123=0,$124=0,$130=0,$136=0,$137=0,$17=0,$19=0,$20=0,$21=0,$22=0,$25=0,$3=0,$31=0,$4=0,$40=0,$41=0,$spec$select=0,label=0;$3=$0+1408|0;$4=HEAP32[$3>>2]|0;if(($4|0)>0){$$0161204=0;do{HEAP32[$0+1412+($$0161204*20|0)+12>>2]=0;$$0161204=$$0161204+1|0}while(($$0161204|0)<($4|0));if(($4|0)<4)label=5;else{$$3222=$2;$137=$4;label=23}}else label=5;if((label|0)==5)if(($2|0)<4)$$2=0;else{$11=$2+-3|0;$$1162193=0;while(1){$12=$1+$$1162193|0;if((HEAP8[$12>>0]|0)==79)if(!(_memcmp($12,1072,4)|0)){$17=$$1162193+26|0;if(($17|0)>=($11|0)){$$3$ph=$$1162193;break}$19=$$1162193+27|0;$20=$1+$17|0;$21=HEAP8[$20>>0]|0;$22=$21&255;if(($19+$22|0)>=($11|0)){$$3$ph=$$1162193;break}$25=$22+27|0;if(!($21<<24>>24))$$0152$lcssa=$25;else{$$0152179=$25;$$0153178=0;while(1){$31=$$0152179+(HEAPU8[$1+($$0153178+$19)>>0]|0)|0;$$0153178=$$0153178+1|0;if(($$0153178|0)==($22|0)){$$0152$lcssa=$31;break}else $$0152179=$31}}$$0150185=0;$$1154184=0;do{$$0150185=_crc32_update($$0150185,HEAP8[$1+($$1154184+$$1162193)>>0]|0)|0;$$1154184=$$1154184+1|0}while(($$1154184|0)!=22);$$1151187=$$0150185;$$2155186=22;do{$$1151187=_crc32_update($$1151187,0)|0;$$2155186=$$2155186+1|0}while(($$2155186|0)!=26);$40=HEAP32[$3>>2]|0;$41=$40+1|0;HEAP32[$3>>2]=$41;HEAP32[$0+1412+($40*20|0)+4>>2]=$$0152$lcssa+-26;HEAP32[$0+1412+($40*20|0)+8>>2]=$$1151187;HEAP32[$0+1412+($40*20|0)>>2]=HEAPU8[$1+($$1162193+23)>>0]<<8|HEAPU8[$1+($$1162193+22)>>0]|HEAPU8[$1+($$1162193+24)>>0]<<16|HEAPU8[$1+($$1162193+25)>>0]<<24;if((HEAP8[$1+($17+(HEAPU8[$20>>0]|0))>>0]|0)==-1)$$sink=-1;else $$sink=HEAPU8[$1+($$1162193+7)>>0]<<8|HEAPU8[$1+($$1162193+6)>>0]|HEAPU8[$1+($$1162193+8)>>0]<<16|HEAPU8[$1+($$1162193+9)>>0]<<24;HEAP32[$0+1412+($40*20|0)+16>>2]=$$sink;HEAP32[$0+1412+($40*20|0)+12>>2]=$17;if(($41|0)==4){$$3$ph=$11;break}}$$1162193=$$1162193+1|0;if(($$1162193|0)>=($11|0)){$$3$ph=$11;break}}$$pre=HEAP32[$3>>2]|0;if(($$pre|0)>0){$$3222=$$3$ph;$137=$$pre;label=23}else $$2=$$3$ph}L32:do{if((label|0)==23){$$2163176=0;$123=$137;while(1){$102=$0+1412+($$2163176*20|0)|0;$104=HEAP32[$0+1412+($$2163176*20|0)+12>>2]|0;$105=$0+1412+($$2163176*20|0)+4|0;$106=HEAP32[$105>>2]|0;$107=$$3222-$104|0;$spec$select=($106|0)>($107|0)?$107:$106;$109=$0+1412+($$2163176*20|0)+8|0;$110=HEAP32[$109>>2]|0;if(($spec$select|0)>0){$$0148175=0;$$0149174=$110;while(1){$115=_crc32_update($$0149174,HEAP8[$1+($$0148175+$104)>>0]|0)|0;$$0148175=$$0148175+1|0;if(($$0148175|0)>=($spec$select|0)){$$0149$lcssa=$115;break}else $$0149174=$115}}else $$0149$lcssa=$110;$118=$106-$spec$select|0;HEAP32[$105>>2]=$118;HEAP32[$109>>2]=$$0149$lcssa;if(!$118){if(($$0149$lcssa|0)==(HEAP32[$102>>2]|0))break;$122=$123+-1|0;HEAP32[$3>>2]=$122;$124=$0+1412+($122*20|0)|0;HEAP32[$102>>2]=HEAP32[$124>>2];HEAP32[$102+4>>2]=HEAP32[$124+4>>2];HEAP32[$102+8>>2]=HEAP32[$124+8>>2];HEAP32[$102+12>>2]=HEAP32[$124+12>>2];HEAP32[$102+16>>2]=HEAP32[$124+16>>2];$$4165$ph=$$2163176;$136=HEAP32[$3>>2]|0}else{$$4165$ph=$$2163176+1|0;$136=$123}if(($$4165$ph|0)<($136|0)){$$2163176=$$4165$ph;$123=$136}else{$$2=$$3222;break L32}}HEAP32[$3>>2]=-1;HEAP32[$0+980>>2]=0;HEAP32[$0+1368>>2]=-1;$130=HEAP32[$0+1412+($$2163176*20|0)+16>>2]|0;HEAP32[$0+1048>>2]=$130;HEAP32[$0+1052>>2]=($130|0)!=-1&1;$$2=$spec$select+$104|0}}while(0);return $$2|0}function _codebook_decode_deinterleave_repeat($0,$1,$2,$3,$4,$5,$6,$7){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;$5=$5|0;$6=$6|0;$7=$7|0;var $$0100145=0,$$0102$lcssa=0,$$0102144=0,$$0105133=0,$$0107143=0,$$0112132=0,$$0114$lcssa=0,$$0114142=0,$$1103134=0,$$1111=0,$$1113137=0,$$1115131=0,$$2=0,$$3117136=0,$$3138=0,$$5=0,$$5119=0,$11=0,$12=0,$15=0,$16=0,$17=0,$18=0,$19=0,$20=0,$21=0,$22=0,$25=0,$28=0,$29=0,$34=0,$37=0,$38=0,$51=0,$58=0,$61=0,$62=0,$68=0,$70=0,$73=0,$74=0,$78=0,$85=0,$88=0,$89=0,$spec$select122=0,$spec$select123=0,$spec$select124=0,$spec$select125=0,label=0;L1:do{if(!(HEAP8[$1+21>>0]|0)){_error($0,21);$$2=0}else{$11=HEAP32[$5>>2]|0;$12=HEAP32[$4>>2]|0;L4:do{if(($7|0)>0){$15=$0+1384|0;$16=$0+1380|0;$17=$1+8|0;$18=$1+23|0;$19=$1+2092|0;$20=Math_imul($6,$3)|0;$21=$1+22|0;$22=$1+28|0;$$0100145=$7;$$0102144=$12;$$0107143=HEAP32[$1>>2]|0;$$0114142=$11;while(1){if((HEAP32[$15>>2]|0)<10)_prep_huffman($0);$25=HEAP32[$16>>2]|0;$28=HEAP16[$1+36+(($25&1023)<<1)>>1]|0;$29=$28<<16>>16;if($28<<16>>16>-1){$34=HEAPU8[(HEAP32[$17>>2]|0)+$29>>0]|0;HEAP32[$16>>2]=$25>>>$34;$37=(HEAP32[$15>>2]|0)-$34|0;$38=($37|0)<0;HEAP32[$15>>2]=$38?0:$37;$$1111=$38?-1:$29}else $$1111=_codebook_decode_scalar_raw($0,$1)|0;if(HEAP8[$18>>0]|0)if(($$1111|0)>=(HEAP32[$19>>2]|0)){label=12;break}if(($$1111|0)<0)break;$51=Math_imul($$0114142,$3)|0;$$0107143=($$0107143+$51+$$0102144|0)>($20|0)?$20-$51+$$0102144|0:$$0107143;$58=Math_imul(HEAP32[$1>>2]|0,$$1111)|0;$61=($$0107143|0)>0;if(!(HEAP8[$21>>0]|0))if($61){$$1113137=0;$$3117136=$$0114142;$$3138=$$0102144;while(1){$78=HEAP32[$2+($$3138<<2)>>2]|0;if($78|0){$85=$78+($$3117136<<2)|0;HEAPF32[$85>>2]=+HEAPF32[$85>>2]+(+HEAPF32[(HEAP32[$22>>2]|0)+($$1113137+$58<<2)>>2]+0)}$88=$$3138+1|0;$89=($88|0)==($3|0);$spec$select124=$$3117136+($89&1)|0;$spec$select125=$89?0:$88;$$1113137=$$1113137+1|0;if(($$1113137|0)==($$0107143|0)){$$5=$spec$select125;$$5119=$spec$select124;break}else{$$3117136=$spec$select124;$$3138=$spec$select125}}}else{$$5=$$0102144;$$5119=$$0114142}else if($61){$62=HEAP32[$22>>2]|0;$$0105133=0;$$0112132=0;$$1103134=$$0102144;$$1115131=$$0114142;while(1){$$0105133=$$0105133+ +HEAPF32[$62+($$0112132+$58<<2)>>2];$68=HEAP32[$2+($$1103134<<2)>>2]|0;$70=$68+($$1115131<<2)|0;if($68|0)HEAPF32[$70>>2]=$$0105133+ +HEAPF32[$70>>2];$73=$$1103134+1|0;$74=($73|0)==($3|0);$spec$select122=$$1115131+($74&1)|0;$spec$select123=$74?0:$73;$$0112132=$$0112132+1|0;if(($$0112132|0)==($$0107143|0)){$$5=$spec$select123;$$5119=$spec$select122;break}else{$$1103134=$spec$select123;$$1115131=$spec$select122}}}else{$$5=$$0102144;$$5119=$$0114142}$$0100145=$$0100145-$$0107143|0;if(($$0100145|0)<=0){$$0102$lcssa=$$5;$$0114$lcssa=$$5119;break L4}else{$$0102144=$$5;$$0114142=$$5119}}if((label|0)==12)___assert_fail(1303,1076,1824,1339);if(!(HEAP8[$0+1364>>0]|0))if(HEAP32[$0+1372>>2]|0){$$2=0;break L1}_error($0,21);$$2=0;break L1}else{$$0102$lcssa=$12;$$0114$lcssa=$11}}while(0);HEAP32[$4>>2]=$$0102$lcssa;HEAP32[$5>>2]=$$0114$lcssa;$$2=1}}while(0);return $$2|0}function _is_whole_packet_present($0,$1){$0=$0|0;$1=$1|0;var $$068$lcssa=0,$$06897=0,$$07296=0,$$079111=0,$$173=0,$$18092=0,$$2=0,$$274112=0,$$37593=0,$$4$lcssa=0,$$47686=0,$$487=0,$$577=0,$11=0,$13=0,$15=0,$27=0,$28=0,$29=0,$3=0,$30=0,$48=0,$49=0,$5=0,$50=0,$51=0,$55=0,$57=0,$59=0,$8=0,label=0;$3=HEAP32[$0+1368>>2]|0;$5=HEAP32[$0+20>>2]|0;do{if(($3|0)==-1){$$079111=1;$$274112=$5;label=11}else{$8=HEAP32[$0+1104>>2]|0;L3:do{if(($3|0)<($8|0)){$$06897=$3;$$07296=$5;while(1){$11=HEAP8[$0+1108+$$06897>>0]|0;$13=$$07296+($11&255)|0;if($11<<24>>24!=-1){$$068$lcssa=$$06897;$$173=$13;break L3}$15=$$06897+1|0;if(($15|0)<($8|0)){$$06897=$15;$$07296=$13}else{$$068$lcssa=$15;$$173=$13;break}}}else{$$068$lcssa=$3;$$173=$5}}while(0);if(($1|0)!=0&($$068$lcssa|0)<($8+-1|0)){_error($0,21);$$2=0;break}if($$173>>>0>(HEAP32[$0+28>>2]|0)>>>0){_error($0,1);$$2=0;break}else if(($$068$lcssa|0)==($8|0)|($$068$lcssa|0)==-1){$$079111=0;$$274112=$$173;label=11;break}else{$$2=1;break}}}while(0);L15:do{if((label|0)==11){$27=HEAP32[$0+28>>2]|0;$28=$0+980|0;$29=($1|0)!=0;$$18092=$$079111;$$37593=$$274112;while(1){$30=$$37593+26|0;if($30>>>0>=$27>>>0){label=13;break}if(_memcmp($$37593,1072,4)|0){label=15;break}if(HEAP8[$$37593+4>>0]|0){label=17;break}if(!$$18092){if(!(HEAP8[$$37593+5>>0]&1)){label=23;break}}else if(HEAP32[$28>>2]|0)if(HEAP8[$$37593+5>>0]&1){label=21;break}$48=HEAP8[$30>>0]|0;$49=$48&255;$50=$$37593+27|0;$51=$50+$49|0;if($51>>>0>$27>>>0){label=25;break}L28:do{if(!($48<<24>>24)){$$4$lcssa=0;$$577=$51}else{$$47686=$51;$$487=0;while(1){$55=HEAP8[$50+$$487>>0]|0;$57=$$47686+($55&255)|0;if($55<<24>>24!=-1){$$4$lcssa=$$487;$$577=$57;break L28}$59=$$487+1|0;if($59>>>0<$49>>>0){$$47686=$57;$$487=$59}else{$$4$lcssa=$59;$$577=$57;break}}}}while(0);if($29&($$4$lcssa|0)<($49+-1|0)){label=31;break}if($$577>>>0>$27>>>0){label=33;break}if(($$4$lcssa|0)==($49|0)){$$18092=0;$$37593=$$577}else{$$2=1;break L15}}if((label|0)==13){_error($0,1);$$2=0;break}else if((label|0)==15){_error($0,21);$$2=0;break}else if((label|0)==17){_error($0,21);$$2=0;break}else if((label|0)==21){_error($0,21);$$2=0;break}else if((label|0)==23){_error($0,21);$$2=0;break}else if((label|0)==25){_error($0,1);$$2=0;break}else if((label|0)==31){_error($0,21);$$2=0;break}else if((label|0)==33){_error($0,1);$$2=0;break}}}while(0);return $$2|0}function _compute_sorted_huffman($0,$1,$2){$0=$0|0;$1=$1|0;$2=$2|0;var $$07784=0,$$079$lcssa=0,$$07983=0,$$081$lcssa=0,$$08190=0,$$091=0,$$180=0,$$182=0,$$196=0,$$285=0,$$285$sink=0,$$pre$phiZ2D=0,$10=0,$18=0,$25=0,$28=0,$29=0,$3=0,$32=0,$34=0,$37=0,$40=0,$42=0,$44=0,$48=0,$51=0,$53=0,$54=0,$55=0,$56=0,$6=0,$61=0,$67=0,$68=0,$70=0,$71=0,$72=0,$75=0,$9=0,$91=0;$3=$0+23|0;if(!(HEAP8[$3>>0]|0)){$6=$0+4|0;if((HEAP32[$6>>2]|0)>0){$9=$0+32|0;$10=$0+2084|0;$$08190=0;$$091=0;while(1){if(!(_include_in_sort($0,HEAP8[$1+$$091>>0]|0)|0))$$182=$$08190;else{$18=_bit_reverse(HEAP32[(HEAP32[$9>>2]|0)+($$091<<2)>>2]|0)|0;HEAP32[(HEAP32[$10>>2]|0)+($$08190<<2)>>2]=$18;$$182=$$08190+1|0}$$091=$$091+1|0;if(($$091|0)>=(HEAP32[$6>>2]|0)){$$081$lcssa=$$182;break}else $$08190=$$182}}else $$081$lcssa=0;$25=$0+2092|0;if(($$081$lcssa|0)==(HEAP32[$25>>2]|0)){$$pre$phiZ2D=$25;$44=$$081$lcssa}else ___assert_fail(1647,1076,1150,1670)}else{$28=$0+2092|0;$29=HEAP32[$28>>2]|0;if(($29|0)>0){$32=HEAP32[$0+32>>2]|0;$34=HEAP32[$0+2084>>2]|0;$$196=0;do{$37=_bit_reverse(HEAP32[$32+($$196<<2)>>2]|0)|0;HEAP32[$34+($$196<<2)>>2]=$37;$$196=$$196+1|0;$40=HEAP32[$28>>2]|0}while(($$196|0)<($40|0));$$pre$phiZ2D=$28;$44=$40}else{$$pre$phiZ2D=$28;$44=$29}}$42=$0+2084|0;_qsort(HEAP32[$42>>2]|0,$44,4,2);HEAP32[(HEAP32[$42>>2]|0)+(HEAP32[$$pre$phiZ2D>>2]<<2)>>2]=-1;$48=HEAP8[$3>>0]|0;$51=HEAP32[($48<<24>>24==0?$0+4|0:$$pre$phiZ2D)>>2]|0;L17:do{if(($51|0)>0){$53=$0+32|0;$54=$0+2088|0;$55=$0+8|0;$$285=0;$56=$48;L19:while(1){if(!($56<<24>>24))$$285$sink=$$285;else $$285$sink=HEAP32[$2+($$285<<2)>>2]|0;$61=HEAP8[$1+$$285$sink>>0]|0;do{if(_include_in_sort($0,$61)|0){$67=_bit_reverse(HEAP32[(HEAP32[$53>>2]|0)+($$285<<2)>>2]|0)|0;$68=HEAP32[$$pre$phiZ2D>>2]|0;$70=HEAP32[$42>>2]|0;if(($68|0)>1){$$07784=$68;$$07983=0;while(1){$71=$$07784>>>1;$72=$71+$$07983|0;$75=(HEAP32[$70+($72<<2)>>2]|0)>>>0>$67>>>0;$$180=$75?$$07983:$72;$$07784=$75?$71:$$07784-$71|0;if(($$07784|0)<=1){$$079$lcssa=$$180;break}else $$07983=$$180}}else $$079$lcssa=0;if((HEAP32[$70+($$079$lcssa<<2)>>2]|0)!=($67|0))break L19;if(!(HEAP8[$3>>0]|0)){HEAP32[(HEAP32[$54>>2]|0)+($$079$lcssa<<2)>>2]=$$285;break}else{HEAP32[(HEAP32[$54>>2]|0)+($$079$lcssa<<2)>>2]=HEAP32[$2+($$285<<2)>>2];HEAP8[(HEAP32[$55>>2]|0)+$$079$lcssa>>0]=$61;break}}}while(0);$91=$$285+1|0;if(($91|0)>=($51|0))break L17;$$285=$91;$56=HEAP8[$3>>0]|0}___assert_fail(1693,1076,1180,1670)}}while(0);return}function _vorbis_deinit($0){$0=$0|0;var $$08294=0,$$099=0,$$190=0,$$286=0,$$385=0,$$484=0,$$lcssa=0,$$lcssa83=0,$1=0,$10=0,$13=0,$2=0,$20=0,$29=0,$32=0,$35=0,$36=0,$38=0,$4=0,$42=0,$51=0,$55=0,$58=0,$62=0,$63=0,$65=0,$69=0,$7=0,$74=0,$75=0,$8=0,$9=0;$1=$0+384|0;$2=HEAP32[$1>>2]|0;L1:do{if($2|0){$4=$0+252|0;if((HEAP32[$4>>2]|0)>0){$7=$0+112|0;$$099=0;$9=$2;while(1){$8=$9+($$099*24|0)+16|0;$10=HEAP32[$8>>2]|0;if($10|0){$13=$9+($$099*24|0)+13|0;if((HEAP32[(HEAP32[$7>>2]|0)+((HEAPU8[$13>>0]|0)*2096|0)+4>>2]|0)>0){$$08294=0;$20=$10;while(1){_setup_free($0,HEAP32[$20+($$08294<<2)>>2]|0);$$08294=$$08294+1|0;$29=HEAP32[$8>>2]|0;if(($$08294|0)>=(HEAP32[(HEAP32[$7>>2]|0)+((HEAPU8[$13>>0]|0)*2096|0)+4>>2]|0)){$$lcssa83=$29;break}else $20=$29}}else $$lcssa83=$10;_setup_free($0,$$lcssa83)}_setup_free($0,HEAP32[$9+($$099*24|0)+20>>2]|0);$32=$$099+1|0;if(($32|0)>=(HEAP32[$4>>2]|0))break L1;$$099=$32;$9=HEAP32[$1>>2]|0}}}}while(0);$35=$0+112|0;$36=HEAP32[$35>>2]|0;if($36|0){$38=$0+108|0;if((HEAP32[$38>>2]|0)>0){$$190=0;$42=$36;while(1){_setup_free($0,HEAP32[$42+($$190*2096|0)+8>>2]|0);_setup_free($0,HEAP32[$42+($$190*2096|0)+28>>2]|0);_setup_free($0,HEAP32[$42+($$190*2096|0)+32>>2]|0);_setup_free($0,HEAP32[$42+($$190*2096|0)+2084>>2]|0);$51=HEAP32[$42+($$190*2096|0)+2088>>2]|0;_setup_free($0,($51|0)==0?0:$51+-4|0);$55=$$190+1|0;if(($55|0)>=(HEAP32[$38>>2]|0))break;$$190=$55;$42=HEAP32[$35>>2]|0}$58=HEAP32[$35>>2]|0}else $58=$36;_setup_free($0,$58)}_setup_free($0,HEAP32[$0+248>>2]|0);_setup_free($0,HEAP32[$1>>2]|0);$62=$0+392|0;$63=HEAP32[$62>>2]|0;if($63|0){$65=$0+388|0;if((HEAP32[$65>>2]|0)>0){$$286=0;$69=$63;while(1){_setup_free($0,HEAP32[$69+($$286*40|0)+4>>2]|0);$$286=$$286+1|0;$74=HEAP32[$62>>2]|0;if(($$286|0)>=(HEAP32[$65>>2]|0)){$$lcssa=$74;break}else $69=$74}}else $$lcssa=$63;_setup_free($0,$$lcssa)}$75=$0+4|0;if((HEAP32[$75>>2]|0)>0){$$385=0;do{_setup_free($0,HEAP32[$0+788+($$385<<2)>>2]|0);_setup_free($0,HEAP32[$0+916+($$385<<2)>>2]|0);_setup_free($0,HEAP32[$0+984+($$385<<2)>>2]|0);$$385=$$385+1|0}while($$385>>>0<16?($$385|0)<(HEAP32[$75>>2]|0):0)}$$484=0;do{_setup_free($0,HEAP32[$0+1056+($$484<<2)>>2]|0);_setup_free($0,HEAP32[$0+1064+($$484<<2)>>2]|0);_setup_free($0,HEAP32[$0+1072+($$484<<2)>>2]|0);_setup_free($0,HEAP32[$0+1080+($$484<<2)>>2]|0);_setup_free($0,HEAP32[$0+1088+($$484<<2)>>2]|0);$$484=$$484+1|0}while(($$484|0)!=2);return}function _compute_codewords($0,$1,$2,$3){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;var $$06981=0,$$07286=0,$$074$lcssa=0,$$07491=0,$$07589=0,$$083=0,$$173$ph=0,$$17685=0,$$17687=0,$$2=0,$15=0,$18=0,$20=0,$27=0,$28=0,$30=0,$32=0,$33=0,$39=0,$4=0,$40=0,$41=0,$45=0,$9=0,dest=0,label=0,sp=0,stop=0;sp=STACKTOP;STACKTOP=STACKTOP+128|0;$4=sp;dest=$4;stop=dest+128|0;do{HEAP32[dest>>2]=0;dest=dest+4|0}while((dest|0)<(stop|0));L1:do{if(($2|0)>0){$$07491=0;while(1){if((HEAP8[$1+$$07491>>0]|0)!=-1){$$074$lcssa=$$07491;break L1}$9=$$07491+1|0;if(($9|0)<($2|0))$$07491=$9;else{$$074$lcssa=$9;break}}}else $$074$lcssa=0}while(0);L7:do{if(($$074$lcssa|0)==($2|0))if(!(HEAP32[$0+2092>>2]|0))$$2=1;else ___assert_fail(1544,1076,1053,1567);else{$15=$1+$$074$lcssa|0;_add_entry($0,0,$$074$lcssa,0,HEAPU8[$15>>0]|0,$3);$18=HEAP8[$15>>0]|0;if($18<<24>>24){$20=$18&255;$$07589=1;while(1){HEAP32[$4+($$07589<<2)>>2]=1<<32-$$07589;if($$07589>>>0<$20>>>0)$$07589=$$07589+1|0;else break}}$$17685=$$074$lcssa+1|0;if(($$17685|0)<($2|0)){$$07286=1;$$17687=$$17685;L17:while(1){$27=$1+$$17687|0;$28=HEAP8[$27>>0]|0;if($28<<24>>24==-1)$$173$ph=$$07286;else{$30=$28&255;if(!($28<<24>>24)){$$2=0;break L7}$$06981=$30;while(1){$32=$4+($$06981<<2)|0;$33=HEAP32[$32>>2]|0;if($33|0)break;if(($$06981|0)>1)$$06981=$$06981+-1|0;else{$$2=0;break L7}}if($$06981>>>0>=32){label=19;break}HEAP32[$32>>2]=0;$39=$$07286+1|0;_add_entry($0,_bit_reverse($33)|0,$$17687,$$07286,$30,$3);$40=HEAP8[$27>>0]|0;$41=$40&255;if(($$06981|0)==($41|0))$$173$ph=$39;else{if(($40&255)>=32){label=22;break}if(($$06981|0)<($41|0)){$$083=$41;while(1){$45=$4+($$083<<2)|0;if(HEAP32[$45>>2]|0){label=26;break L17}HEAP32[$45>>2]=(1<<32-$$083)+$33;$$083=$$083+-1|0;if(($$083|0)<=($$06981|0)){$$173$ph=$39;break}}}else $$173$ph=$39}}$$17687=$$17687+1|0;if(($$17687|0)>=($2|0)){$$2=1;break L7}else $$07286=$$173$ph}if((label|0)==19)___assert_fail(1585,1076,1076,1567);else if((label|0)==22)___assert_fail(1602,1076,1081,1567);else if((label|0)==26)___assert_fail(1629,1076,1083,1567)}else $$2=1}}while(0);STACKTOP=sp;return $$2|0}function _imdct_step3_iter0_loop($0,$1,$2,$3,$4){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;var $$0100=0,$$09499=0,$$09598=0,$$09697=0,$11=0,$12=0,$13=0,$14=0,$15=0,$16=0,$18=0,$24=0,$33=0,$34=0,$35=0,$36=0,$37=0,$38=0,$39=0,$40=0,$41=0,$43=0,$49=0,$5=0,$58=0,$59=0,$60=0,$61=0,$62=0,$63=0,$64=0,$65=0,$66=0,$68=0,$74=0,$83=0,$84=0,$85=0,$86=0,$87=0,$88=0,$89=0,$90=0,$91=0,$93=0,$99=0;$5=$1+($2<<2)|0;if($0&3|0)___assert_fail(1419,1076,2400,1432);if(($0|0)>3){$$0100=$4;$$09499=$5;$$09598=$0>>>2;$$09697=$5+($3<<2)|0;while(1){$11=+HEAPF32[$$09499>>2];$12=+HEAPF32[$$09697>>2];$13=$11-$12;$14=$$09499+-4|0;$15=+HEAPF32[$14>>2];$16=$$09697+-4|0;$18=$15-+HEAPF32[$16>>2];HEAPF32[$$09499>>2]=$11+$12;HEAPF32[$14>>2]=$15+ +HEAPF32[$16>>2];$24=$$0100+4|0;HEAPF32[$$09697>>2]=$13*+HEAPF32[$$0100>>2]-$18*+HEAPF32[$24>>2];HEAPF32[$16>>2]=$18*+HEAPF32[$$0100>>2]+$13*+HEAPF32[$24>>2];$33=$$0100+32|0;$34=$$09499+-8|0;$35=+HEAPF32[$34>>2];$36=$$09697+-8|0;$37=+HEAPF32[$36>>2];$38=$35-$37;$39=$$09499+-12|0;$40=+HEAPF32[$39>>2];$41=$$09697+-12|0;$43=$40-+HEAPF32[$41>>2];HEAPF32[$34>>2]=$35+$37;HEAPF32[$39>>2]=$40+ +HEAPF32[$41>>2];$49=$$0100+36|0;HEAPF32[$36>>2]=$38*+HEAPF32[$33>>2]-$43*+HEAPF32[$49>>2];HEAPF32[$41>>2]=$43*+HEAPF32[$33>>2]+$38*+HEAPF32[$49>>2];$58=$$0100+64|0;$59=$$09499+-16|0;$60=+HEAPF32[$59>>2];$61=$$09697+-16|0;$62=+HEAPF32[$61>>2];$63=$60-$62;$64=$$09499+-20|0;$65=+HEAPF32[$64>>2];$66=$$09697+-20|0;$68=$65-+HEAPF32[$66>>2];HEAPF32[$59>>2]=$60+$62;HEAPF32[$64>>2]=$65+ +HEAPF32[$66>>2];$74=$$0100+68|0;HEAPF32[$61>>2]=$63*+HEAPF32[$58>>2]-$68*+HEAPF32[$74>>2];HEAPF32[$66>>2]=$68*+HEAPF32[$58>>2]+$63*+HEAPF32[$74>>2];$83=$$0100+96|0;$84=$$09499+-24|0;$85=+HEAPF32[$84>>2];$86=$$09697+-24|0;$87=+HEAPF32[$86>>2];$88=$85-$87;$89=$$09499+-28|0;$90=+HEAPF32[$89>>2];$91=$$09697+-28|0;$93=$90-+HEAPF32[$91>>2];HEAPF32[$84>>2]=$85+$87;HEAPF32[$89>>2]=$90+ +HEAPF32[$91>>2];$99=$$0100+100|0;HEAPF32[$86>>2]=$88*+HEAPF32[$83>>2]-$93*+HEAPF32[$99>>2];HEAPF32[$91>>2]=$93*+HEAPF32[$83>>2]+$88*+HEAPF32[$99>>2];if(($$09598|0)>1){$$0100=$$0100+128|0;$$09499=$$09499+-32|0;$$09598=$$09598+-1|0;$$09697=$$09697+-32|0}else break}}return}function _imdct_step3_inner_r_loop($0,$1,$2,$3,$4,$5){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;$5=$5|0;var $$0103=0,$$097102=0,$$098101=0,$$099100=0,$10=0,$11=0,$12=0,$13=0,$14=0,$15=0,$17=0,$23=0,$32=0,$33=0,$34=0,$35=0,$36=0,$37=0,$38=0,$39=0,$40=0,$42=0,$48=0,$57=0,$58=0,$59=0,$6=0,$60=0,$61=0,$62=0,$63=0,$64=0,$65=0,$67=0,$73=0,$82=0,$83=0,$84=0,$85=0,$86=0,$87=0,$88=0,$89=0,$90=0,$92=0,$98=0;$6=$1+($2<<2)|0;if(($0|0)>3){$$0103=$6+($3<<2)|0;$$097102=$6;$$098101=$4;$$099100=$0>>>2;while(1){$10=+HEAPF32[$$097102>>2];$11=+HEAPF32[$$0103>>2];$12=$10-$11;$13=$$097102+-4|0;$14=+HEAPF32[$13>>2];$15=$$0103+-4|0;$17=$14-+HEAPF32[$15>>2];HEAPF32[$$097102>>2]=$10+$11;HEAPF32[$13>>2]=$14+ +HEAPF32[$15>>2];$23=$$098101+4|0;HEAPF32[$$0103>>2]=$12*+HEAPF32[$$098101>>2]-$17*+HEAPF32[$23>>2];HEAPF32[$15>>2]=$17*+HEAPF32[$$098101>>2]+$12*+HEAPF32[$23>>2];$32=$$098101+($5<<2)|0;$33=$$097102+-8|0;$34=+HEAPF32[$33>>2];$35=$$0103+-8|0;$36=+HEAPF32[$35>>2];$37=$34-$36;$38=$$097102+-12|0;$39=+HEAPF32[$38>>2];$40=$$0103+-12|0;$42=$39-+HEAPF32[$40>>2];HEAPF32[$33>>2]=$34+$36;HEAPF32[$38>>2]=$39+ +HEAPF32[$40>>2];$48=$32+4|0;HEAPF32[$35>>2]=$37*+HEAPF32[$32>>2]-$42*+HEAPF32[$48>>2];HEAPF32[$40>>2]=$42*+HEAPF32[$32>>2]+$37*+HEAPF32[$48>>2];$57=$32+($5<<2)|0;$58=$$097102+-16|0;$59=+HEAPF32[$58>>2];$60=$$0103+-16|0;$61=+HEAPF32[$60>>2];$62=$59-$61;$63=$$097102+-20|0;$64=+HEAPF32[$63>>2];$65=$$0103+-20|0;$67=$64-+HEAPF32[$65>>2];HEAPF32[$58>>2]=$59+$61;HEAPF32[$63>>2]=$64+ +HEAPF32[$65>>2];$73=$57+4|0;HEAPF32[$60>>2]=$62*+HEAPF32[$57>>2]-$67*+HEAPF32[$73>>2];HEAPF32[$65>>2]=$67*+HEAPF32[$57>>2]+$62*+HEAPF32[$73>>2];$82=$57+($5<<2)|0;$83=$$097102+-24|0;$84=+HEAPF32[$83>>2];$85=$$0103+-24|0;$86=+HEAPF32[$85>>2];$87=$84-$86;$88=$$097102+-28|0;$89=+HEAPF32[$88>>2];$90=$$0103+-28|0;$92=$89-+HEAPF32[$90>>2];HEAPF32[$83>>2]=$84+$86;HEAPF32[$88>>2]=$89+ +HEAPF32[$90>>2];$98=$82+4|0;HEAPF32[$85>>2]=$87*+HEAPF32[$82>>2]-$92*+HEAPF32[$98>>2];HEAPF32[$90>>2]=$92*+HEAPF32[$82>>2]+$87*+HEAPF32[$98>>2];if(($$099100|0)>1){$$0103=$$0103+-32|0;$$097102=$$097102+-32|0;$$098101=$82+($5<<2)|0;$$099100=$$099100+-1|0}else break}}return}function _imdct_step3_inner_s_loop($0,$1,$2,$3,$4,$5,$6){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;$5=$5|0;$6=$6|0;var $$0129132=0,$$0130131=0,$$0133=0,$11=0,$14=0,$15=0,$17=0,$20=0,$21=0,$23=0,$26=0,$27=0,$30=0,$31=0,$32=0,$33=0,$34=0,$35=0,$36=0,$38=0,$48=0,$49=0,$50=0,$51=0,$52=0,$53=0,$54=0,$55=0,$57=0,$67=0,$68=0,$69=0,$7=0,$70=0,$71=0,$72=0,$73=0,$74=0,$76=0,$86=0,$87=0,$88=0,$89=0,$9=0,$90=0,$91=0,$92=0,$93=0,$95=0;$7=+HEAPF32[$4>>2];$9=+HEAPF32[$4+4>>2];$11=+HEAPF32[$4+($5<<2)>>2];$14=+HEAPF32[$4+($5+1<<2)>>2];$15=$5<<1;$17=+HEAPF32[$4+($15<<2)>>2];$20=+HEAPF32[$4+(($15|1)<<2)>>2];$21=$5*3|0;$23=+HEAPF32[$4+($21<<2)>>2];$26=+HEAPF32[$4+($21+1<<2)>>2];$27=$1+($2<<2)|0;if(($0|0)>0){$30=0-$6|0;$$0129132=$27;$$0130131=$0;$$0133=$27+($3<<2)|0;while(1){$31=+HEAPF32[$$0129132>>2];$32=+HEAPF32[$$0133>>2];$33=$31-$32;$34=$$0129132+-4|0;$35=+HEAPF32[$34>>2];$36=$$0133+-4|0;$38=$35-+HEAPF32[$36>>2];HEAPF32[$$0129132>>2]=$31+$32;HEAPF32[$34>>2]=$35+ +HEAPF32[$36>>2];HEAPF32[$$0133>>2]=$7*$33-$9*$38;HEAPF32[$36>>2]=$9*$33+$7*$38;$48=$$0129132+-8|0;$49=+HEAPF32[$48>>2];$50=$$0133+-8|0;$51=+HEAPF32[$50>>2];$52=$49-$51;$53=$$0129132+-12|0;$54=+HEAPF32[$53>>2];$55=$$0133+-12|0;$57=$54-+HEAPF32[$55>>2];HEAPF32[$48>>2]=$49+$51;HEAPF32[$53>>2]=$54+ +HEAPF32[$55>>2];HEAPF32[$50>>2]=$11*$52-$14*$57;HEAPF32[$55>>2]=$14*$52+$11*$57;$67=$$0129132+-16|0;$68=+HEAPF32[$67>>2];$69=$$0133+-16|0;$70=+HEAPF32[$69>>2];$71=$68-$70;$72=$$0129132+-20|0;$73=+HEAPF32[$72>>2];$74=$$0133+-20|0;$76=$73-+HEAPF32[$74>>2];HEAPF32[$67>>2]=$68+$70;HEAPF32[$72>>2]=$73+ +HEAPF32[$74>>2];HEAPF32[$69>>2]=$17*$71-$20*$76;HEAPF32[$74>>2]=$20*$71+$17*$76;$86=$$0129132+-24|0;$87=+HEAPF32[$86>>2];$88=$$0133+-24|0;$89=+HEAPF32[$88>>2];$90=$87-$89;$91=$$0129132+-28|0;$92=+HEAPF32[$91>>2];$93=$$0133+-28|0;$95=$92-+HEAPF32[$93>>2];HEAPF32[$86>>2]=$87+$89;HEAPF32[$91>>2]=$92+ +HEAPF32[$93>>2];HEAPF32[$88>>2]=$23*$90-$26*$95;HEAPF32[$93>>2]=$26*$90+$23*$95;if(($$0130131|0)>1){$$0129132=$$0129132+($30<<2)|0;$$0130131=$$0130131+-1|0;$$0133=$$0133+($30<<2)|0}else break}}return}function _qsort($0,$1,$2,$3){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;var $$0=0,$$067$lcssa=0,$$06772=0,$$068$lcssa=0,$$06871=0,$$1=0,$$169=0,$$169$be=0,$$2=0,$$2$be=0,$$be=0,$12=0,$15=0,$15$phi=0,$16=0,$17=0,$22=0,$24=0,$26=0,$29=0,$37=0,$38=0,$4=0,$40=0,$42=0,$47=0,$49=0,$5=0,$59=0,$6=0,$60=0,$61=0,$7=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+208|0;$4=sp;$5=sp+192|0;$6=Math_imul($2,$1)|0;$7=$5;HEAP32[$7>>2]=1;HEAP32[$7+4>>2]=0;L1:do{if($6|0){$12=0-$2|0;HEAP32[$4+4>>2]=$2;HEAP32[$4>>2]=$2;$$0=2;$15=$2;$17=$2;while(1){$16=$15+$2+$17|0;HEAP32[$4+($$0<<2)>>2]=$16;if($16>>>0<$6>>>0){$15$phi=$17;$$0=$$0+1|0;$17=$16;$15=$15$phi}else break}$22=$0+$6+$12|0;if($22>>>0>$0>>>0){$24=$22;$$06772=1;$$06871=$0;$26=1;while(1){do{if(($26&3|0)==3){_sift($$06871,$2,$3,$$06772,$4);_shr($5,2);$$1=$$06772+2|0}else{$29=$$06772+-1|0;if((HEAP32[$4+($29<<2)>>2]|0)>>>0<($24-$$06871|0)>>>0)_sift($$06871,$2,$3,$$06772,$4);else _trinkle($$06871,$2,$3,$5,$$06772,0,$4);if(($$06772|0)==1){_shl($5,1);$$1=0;break}else{_shl($5,$29);$$1=1;break}}}while(0);$37=HEAP32[$5>>2]|1;HEAP32[$5>>2]=$37;$38=$$06871+$2|0;if($38>>>0<$22>>>0){$$06772=$$1;$$06871=$38;$26=$37}else{$$067$lcssa=$$1;$$068$lcssa=$38;$61=$37;break}}}else{$$067$lcssa=1;$$068$lcssa=$0;$61=1}_trinkle($$068$lcssa,$2,$3,$5,$$067$lcssa,0,$4);$40=$5+4|0;$$169=$$068$lcssa;$$2=$$067$lcssa;$42=$61;while(1){if(($$2|0)==1&($42|0)==1)if(!(HEAP32[$40>>2]|0))break L1;else label=19;else if(($$2|0)<2)label=19;else{_shl($5,2);$49=$$2+-2|0;HEAP32[$5>>2]=HEAP32[$5>>2]^7;_shr($5,1);_trinkle($$169+(0-(HEAP32[$4+($49<<2)>>2]|0))+$12|0,$2,$3,$5,$$2+-1|0,1,$4);_shl($5,1);$59=HEAP32[$5>>2]|1;HEAP32[$5>>2]=$59;$60=$$169+$12|0;_trinkle($60,$2,$3,$5,$49,1,$4);$$169$be=$60;$$2$be=$49;$$be=$59}if((label|0)==19){label=0;$47=_pntz($5)|0;_shr($5,$47);$$169$be=$$169+$12|0;$$2$be=$47+$$2|0;$$be=HEAP32[$5>>2]|0}$$169=$$169$be;$$2=$$2$be;$42=$$be}}}while(0);STACKTOP=sp;return}function _trinkle($0,$1,$2,$3,$4,$5,$6){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;$5=$5|0;$6=$6|0;var $$0$lcssa=0,$$045$lcssa=0,$$04551=0,$$0455780=0,$$046$lcssa=0,$$04653=0,$$0465681=0,$$047$lcssa=0,$$0475582=0,$$049=0,$$05879=0,$$05879$phi=0,$11=0,$12=0,$16=0,$20=0,$24=0,$27=0,$28=0,$35=0,$37=0,$38=0,$47=0,$7=0,$8=0,$9=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+240|0;$7=sp+232|0;$8=sp;$9=HEAP32[$3>>2]|0;HEAP32[$7>>2]=$9;$11=HEAP32[$3+4>>2]|0;$12=$7+4|0;HEAP32[$12>>2]=$11;HEAP32[$8>>2]=$0;L1:do{if(($9|0)!=1|($11|0)!=0){$16=0-$1|0;$20=$0+(0-(HEAP32[$6+($4<<2)>>2]|0))|0;if((FUNCTION_TABLE_iii[$2&3]($20,$0)|0)<1){$$0$lcssa=$0;$$045$lcssa=1;$$046$lcssa=$4;$$047$lcssa=$5;label=9}else{$$0455780=1;$$0465681=$4;$$0475582=($5|0)==0;$$05879=$0;$28=$20;while(1){if($$0475582&($$0465681|0)>1){$24=$$05879+$16|0;$27=HEAP32[$6+($$0465681+-2<<2)>>2]|0;if((FUNCTION_TABLE_iii[$2&3]($24,$28)|0)>-1){$$04551=$$0455780;$$04653=$$0465681;$$049=$$05879;label=10;break L1}if((FUNCTION_TABLE_iii[$2&3]($24+(0-$27)|0,$28)|0)>-1){$$04551=$$0455780;$$04653=$$0465681;$$049=$$05879;label=10;break L1}}$35=$$0455780+1|0;HEAP32[$8+($$0455780<<2)>>2]=$28;$37=_pntz($7)|0;_shr($7,$37);$38=$37+$$0465681|0;if(!((HEAP32[$7>>2]|0)!=1|(HEAP32[$12>>2]|0)!=0)){$$04551=$35;$$04653=$38;$$049=$28;label=10;break L1}$47=$28+(0-(HEAP32[$6+($38<<2)>>2]|0))|0;if((FUNCTION_TABLE_iii[$2&3]($47,HEAP32[$8>>2]|0)|0)<1){$$0$lcssa=$28;$$045$lcssa=$35;$$046$lcssa=$38;$$047$lcssa=0;label=9;break}else{$$05879$phi=$28;$$0455780=$35;$$0465681=$38;$$0475582=1;$28=$47;$$05879=$$05879$phi}}}}else{$$0$lcssa=$0;$$045$lcssa=1;$$046$lcssa=$4;$$047$lcssa=$5;label=9}}while(0);if((label|0)==9)if(!$$047$lcssa){$$04551=$$045$lcssa;$$04653=$$046$lcssa;$$049=$$0$lcssa;label=10}if((label|0)==10){_cycle($1,$8,$$04551);_sift($$049,$1,$2,$$04653,$6)}STACKTOP=sp;return}function _codebook_decode_scalar_raw($0,$1){$0=$0|0;$1=$1|0;var $$0=0,$$06574=0,$$06677=0,$$068$lcssa=0,$$06876=0,$$1=0,$$169=0,$$2=0,$14=0,$15=0,$16=0,$18=0,$21=0,$22=0,$23=0,$26=0,$3=0,$4=0,$40=0,$41=0,$42=0,$51=0,$52=0,$54=0,$55=0,$59=0,$64=0,$65=0,$72=0,$9=0,$storemerge=0,label=0;_prep_huffman($0);$3=HEAP32[$1+32>>2]|0;$4=($3|0)==0;if($4)if(!(HEAP32[$1+2084>>2]|0))$$1=-1;else label=3;else label=3;L3:do{if((label|0)==3){$9=HEAP32[$1+4>>2]|0;if(($9|0)>8){if(HEAP32[$1+2084>>2]|0)label=6}else if($4)label=6;if((label|0)==6){$14=$0+1380|0;$15=HEAP32[$14>>2]|0;$16=_bit_reverse($15)|0;$18=HEAP32[$1+2092>>2]|0;if(($18|0)>1){$21=HEAP32[$1+2084>>2]|0;$$06677=$18;$$06876=0;while(1){$22=$$06677>>>1;$23=$22+$$06876|0;$26=(HEAP32[$21+($23<<2)>>2]|0)>>>0>$16>>>0;$$169=$26?$$06876:$23;$$06677=$26?$22:$$06677-$22|0;if(($$06677|0)<=1){$$068$lcssa=$$169;break}else $$06876=$$169}}else $$068$lcssa=0;if(!(HEAP8[$1+23>>0]|0))$$2=HEAP32[(HEAP32[$1+2088>>2]|0)+($$068$lcssa<<2)>>2]|0;else $$2=$$068$lcssa;$40=HEAPU8[(HEAP32[$1+8>>2]|0)+$$2>>0]|0;$41=$0+1384|0;$42=HEAP32[$41>>2]|0;if(($42|0)<($40|0)){$$0=-1;$storemerge=0}else{HEAP32[$14>>2]=$15>>>$40;$$0=$$2;$storemerge=$42-$40|0}HEAP32[$41>>2]=$storemerge;$$1=$$0;break}if(HEAP8[$1+23>>0]|0)___assert_fail(1265,1076,1642,1276);L25:do{if(($9|0)>0){$51=HEAP32[$1+8>>2]|0;$52=$0+1380|0;$$06574=0;while(1){$54=HEAP8[$51+$$06574>>0]|0;$55=$54&255;if($54<<24>>24!=-1){$59=HEAP32[$52>>2]|0;if((HEAP32[$3+($$06574<<2)>>2]|0)==($59&(1<<$55)+-1|0))break}$72=$$06574+1|0;if(($72|0)<($9|0))$$06574=$72;else break L25}$64=$0+1384|0;$65=HEAP32[$64>>2]|0;if(($65|0)<($55|0)){HEAP32[$64>>2]=0;$$1=-1;break L3}else{HEAP32[$52>>2]=$59>>>$55;HEAP32[$64>>2]=$65-(HEAPU8[$51+$$06574>>0]|0);$$1=$$06574;break L3}}}while(0);_error($0,21);HEAP32[$0+1384>>2]=0;$$1=-1}}while(0);return $$1|0}function _vorbis_decode_initial($0,$1,$2,$3,$4,$5){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;$5=$5|0;var $$0=0,$$06271=0,$$06272=0,$$06469=0,$$06470=0,$11=0,$30=0,$34=0,$38=0,$42=0,$45=0,$46=0,$47=0,$48=0,$49=0,$57=0,$58=0,$59=0,$66=0,$67=0,$68=0,$8=0,$phitmp67=0,$storemerge=0,$storemerge65=0,label=0;HEAP32[$0+1496>>2]=0;HEAP32[$0+1492>>2]=0;$8=$0+84|0;L1:do{if(!(HEAP32[$8>>2]|0)){$11=$0+36|0;while(1){if(!(_maybe_start_packet($0)|0)){$$0=0;break L1}if(!(_get_bits($0,1)|0))break;if(HEAP8[$11>>0]|0){label=7;break}do{}while((_get8_packet($0)|0)!=-1);if(HEAP32[$8>>2]|0){$$0=0;break L1}}if((label|0)==7){_error($0,35);$$0=0;break}if(HEAP32[$0+68>>2]|0)if((HEAP32[$0+72>>2]|0)!=(HEAP32[$0+80>>2]|0))___assert_fail(1091,1076,3130,1147);$30=$0+396|0;$34=_get_bits($0,_ilog((HEAP32[$30>>2]|0)+-1|0)|0)|0;if(($34|0)==-1)$$0=0;else if(($34|0)<(HEAP32[$30>>2]|0)){HEAP32[$5>>2]=$34;$38=$0+400+($34*6|0)|0;if(!(HEAP8[$38>>0]|0)){$42=HEAP32[$0+100>>2]|0;$$06272=0;$$06470=$42;$67=$42>>1;$68=1;label=19}else{$45=HEAP32[$0+104>>2]|0;$46=_get_bits($0,1)|0;$47=_get_bits($0,1)|0;$phitmp67=(HEAP8[$38>>0]|0)==0;$48=$45>>1;if(($46|0)!=0|$phitmp67){$$06272=$47;$$06470=$45;$67=$48;$68=$phitmp67;label=19}else{$49=$0+100|0;HEAP32[$1>>2]=$45-(HEAP32[$49>>2]|0)>>2;$$06271=$47;$$06469=$45;$57=$phitmp67;$66=$48;$storemerge=(HEAP32[$49>>2]|0)+$45>>2}}if((label|0)==19){HEAP32[$1>>2]=0;$$06271=$$06272;$$06469=$$06470;$57=$68;$66=$67;$storemerge=$67}HEAP32[$2>>2]=$storemerge;if(($$06271|0)!=0|$57){HEAP32[$3>>2]=$66;$storemerge65=$$06469}else{$58=$$06469*3|0;$59=$0+100|0;HEAP32[$3>>2]=$58-(HEAP32[$59>>2]|0)>>2;$storemerge65=(HEAP32[$59>>2]|0)+$58>>2}HEAP32[$4>>2]=$storemerge65;$$0=1}else $$0=0}else $$0=0}while(0);return $$0|0}function _imdct_step3_inner_s_loop_ld654($0,$1,$2,$3,$4){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;var $$086=0,$10=0,$11=0,$13=0,$14=0,$15=0,$17=0,$18=0,$19=0,$20=0,$24=0,$25=0,$26=0,$27=0,$28=0,$29=0,$30=0,$31=0,$32=0,$33=0,$40=0,$41=0,$42=0,$43=0,$45=0,$46=0,$47=0,$48=0,$52=0,$53=0,$54=0,$55=0,$56=0,$57=0,$58=0,$59=0,$60=0,$61=0,$7=0,$8=0;$7=+HEAPF32[$3+($4>>3<<2)>>2];$8=$1+($2<<2)|0;$10=0-($0<<4)|0;$11=$8+($10<<2)|0;if(($10|0)<0){$$086=$8;do{$13=+HEAPF32[$$086>>2];$14=$$086+-32|0;$15=+HEAPF32[$14>>2];$17=$$086+-4|0;$18=+HEAPF32[$17>>2];$19=$$086+-36|0;$20=+HEAPF32[$19>>2];HEAPF32[$$086>>2]=$13+$15;HEAPF32[$17>>2]=$18+$20;HEAPF32[$14>>2]=$13-$15;HEAPF32[$19>>2]=$18-$20;$24=$$086+-8|0;$25=+HEAPF32[$24>>2];$26=$$086+-40|0;$27=+HEAPF32[$26>>2];$28=$25-$27;$29=$$086+-12|0;$30=+HEAPF32[$29>>2];$31=$$086+-44|0;$32=+HEAPF32[$31>>2];$33=$30-$32;HEAPF32[$24>>2]=$25+$27;HEAPF32[$29>>2]=$30+$32;HEAPF32[$26>>2]=$7*($28+$33);HEAPF32[$31>>2]=$7*($33-$28);$40=$$086+-48|0;$41=+HEAPF32[$40>>2];$42=$$086+-16|0;$43=+HEAPF32[$42>>2];$45=$$086+-20|0;$46=+HEAPF32[$45>>2];$47=$$086+-52|0;$48=+HEAPF32[$47>>2];HEAPF32[$42>>2]=$41+$43;HEAPF32[$45>>2]=$46+$48;HEAPF32[$40>>2]=$46-$48;HEAPF32[$47>>2]=$41-$43;$52=$$086+-56|0;$53=+HEAPF32[$52>>2];$54=$$086+-24|0;$55=+HEAPF32[$54>>2];$56=$53-$55;$57=$$086+-28|0;$58=+HEAPF32[$57>>2];$59=$$086+-60|0;$60=+HEAPF32[$59>>2];$61=$58-$60;HEAPF32[$54>>2]=$53+$55;HEAPF32[$57>>2]=$58+$60;HEAPF32[$52>>2]=$7*($56+$61);HEAPF32[$59>>2]=$7*($56-$61);_iter_54($$086);_iter_54($14);$$086=$$086+-64|0}while($$086>>>0>$11>>>0)}return}function _stb_vorbis_decode_frame_pushdata($0,$1,$2,$3,$4,$5){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;$5=$5|0;var $$05460=0,$$1=0,$16=0,$19=0,$24=0,$25=0,$38=0,$49=0,$51=0,$53=0,$6=0,$7=0,$8=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+16|0;$6=sp+8|0;$7=sp+4|0;$8=sp;L1:do{if(!(HEAP8[$0+36>>0]|0)){_error($0,2);$$1=0}else{if((HEAP32[$0+1408>>2]|0)>-1){HEAP32[$5>>2]=0;$$1=_vorbis_search_for_page_pushdata($0,$1,$2)|0;break}$16=$0+20|0;HEAP32[$16>>2]=$1;HEAP32[$0+28>>2]=$1+$2;$19=$0+88|0;HEAP32[$19>>2]=0;if(!(_is_whole_packet_present($0,0)|0)){HEAP32[$5>>2]=0;$$1=0;break}if(_vorbis_decode_packet($0,$6,$8,$7)|0){$49=HEAP32[$8>>2]|0;$51=_vorbis_finish_frame($0,HEAP32[$6>>2]|0,$49,HEAP32[$7>>2]|0)|0;HEAP32[$6>>2]=$51;$53=HEAP32[$0+4>>2]|0;if(($53|0)>0){$$05460=0;do{HEAP32[$0+852+($$05460<<2)>>2]=(HEAP32[$0+788+($$05460<<2)>>2]|0)+($49<<2);$$05460=$$05460+1|0}while(($$05460|0)<($53|0))}if($3|0)HEAP32[$3>>2]=$53;HEAP32[$5>>2]=$51;HEAP32[$4>>2]=$0+852;$$1=(HEAP32[$16>>2]|0)-$1|0;break}$24=HEAP32[$19>>2]|0;switch($24|0){case 35:{HEAP32[$19>>2]=0;$25=$0+84|0;L23:do{if((_get8_packet($0)|0)!=-1)do{if(HEAP32[$25>>2]|0)break L23}while((_get8_packet($0)|0)!=-1)}while(0);HEAP32[$5>>2]=0;$$1=(HEAP32[$16>>2]|0)-$1|0;break L1;break}case 32:{label=14;break}default:{}}if((label|0)==14)if(!(HEAP32[$0+980>>2]|0)){HEAP32[$19>>2]=0;$38=$0+84|0;L32:do{if((_get8_packet($0)|0)!=-1)do{if(HEAP32[$38>>2]|0)break L32}while((_get8_packet($0)|0)!=-1)}while(0);HEAP32[$5>>2]=0;$$1=(HEAP32[$16>>2]|0)-$1|0;break}_stb_vorbis_flush_pushdata($0);HEAP32[$19>>2]=$24;HEAP32[$5>>2]=0;$$1=1}}while(0);STACKTOP=sp;return $$1|0}function _memcpy(dest,src,num){dest=dest|0;src=src|0;num=num|0;var ret=0,aligned_dest_end=0,block_aligned_dest_end=0,dest_end=0;if((num|0)>=8192)return _emscripten_memcpy_big(dest|0,src|0,num|0)|0;ret=dest|0;dest_end=dest+num|0;if((dest&3)==(src&3)){while(dest&3){if(!num)return ret|0;HEAP8[dest>>0]=HEAP8[src>>0]|0;dest=dest+1|0;src=src+1|0;num=num-1|0}aligned_dest_end=dest_end&-4|0;block_aligned_dest_end=aligned_dest_end-64|0;while((dest|0)<=(block_aligned_dest_end|0)){HEAP32[dest>>2]=HEAP32[src>>2];HEAP32[dest+4>>2]=HEAP32[src+4>>2];HEAP32[dest+8>>2]=HEAP32[src+8>>2];HEAP32[dest+12>>2]=HEAP32[src+12>>2];HEAP32[dest+16>>2]=HEAP32[src+16>>2];HEAP32[dest+20>>2]=HEAP32[src+20>>2];HEAP32[dest+24>>2]=HEAP32[src+24>>2];HEAP32[dest+28>>2]=HEAP32[src+28>>2];HEAP32[dest+32>>2]=HEAP32[src+32>>2];HEAP32[dest+36>>2]=HEAP32[src+36>>2];HEAP32[dest+40>>2]=HEAP32[src+40>>2];HEAP32[dest+44>>2]=HEAP32[src+44>>2];HEAP32[dest+48>>2]=HEAP32[src+48>>2];HEAP32[dest+52>>2]=HEAP32[src+52>>2];HEAP32[dest+56>>2]=HEAP32[src+56>>2];HEAP32[dest+60>>2]=HEAP32[src+60>>2];dest=dest+64|0;src=src+64|0}while((dest|0)<(aligned_dest_end|0)){HEAP32[dest>>2]=HEAP32[src>>2];dest=dest+4|0;src=src+4|0}}else{aligned_dest_end=dest_end-4|0;while((dest|0)<(aligned_dest_end|0)){HEAP8[dest>>0]=HEAP8[src>>0]|0;HEAP8[dest+1>>0]=HEAP8[src+1>>0]|0;HEAP8[dest+2>>0]=HEAP8[src+2>>0]|0;HEAP8[dest+3>>0]=HEAP8[src+3>>0]|0;dest=dest+4|0;src=src+4|0}}while((dest|0)<(dest_end|0)){HEAP8[dest>>0]=HEAP8[src>>0]|0;dest=dest+1|0;src=src+1|0}return ret|0}function _do_floor($0,$1,$2,$3,$4,$5){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;$5=$5|0;var $$062$lcssa=0,$$0624=0,$$063$lcssa=0,$$0633=0,$$0652=0,$$0661=0,$$1=0,$$164=0,$14=0,$19=0,$22=0,$25=0,$26=0,$27=0,$31=0,$33=0,$38=0,$41=0,$45=0,$48=0,$49=0,$53=0,$6=0;$6=$3>>1;$14=HEAPU8[(HEAPU8[(HEAP32[$1+4>>2]|0)+($2*3|0)+2>>0]|0)+($1+9)>>0]|0;if(!(HEAP16[$0+120+($14<<1)>>1]|0))_error($0,21);else{$19=HEAP32[$0+248>>2]|0;$22=$19+($14*1596|0)+1588|0;$25=Math_imul(HEAPU8[$22>>0]|0,HEAP16[$5>>1]|0)|0;$26=$19+($14*1596|0)+1592|0;$27=HEAP32[$26>>2]|0;if(($27|0)>1){$$0624=$25;$$0633=0;$$0652=1;$53=$27;while(1){$31=HEAPU8[$19+($14*1596|0)+838+$$0652>>0]|0;$33=HEAP16[$5+($31<<1)>>1]|0;if($33<<16>>16>-1){$38=Math_imul(HEAPU8[$22>>0]|0,$33<<16>>16)|0;$41=HEAPU16[$19+($14*1596|0)+338+($31<<1)>>1]|0;if(($$0633|0)==($41|0)){$$1=$38;$$164=$$0633;$45=$53}else{_draw_line($4,$$0633,$$0624,$41,$38,$6);$$1=$38;$$164=$41;$45=HEAP32[$26>>2]|0}}else{$$1=$$0624;$$164=$$0633;$45=$53}$$0652=$$0652+1|0;if(($$0652|0)>=($45|0)){$$062$lcssa=$$1;$$063$lcssa=$$164;break}else{$$0624=$$1;$$0633=$$164;$53=$45}}}else{$$062$lcssa=$25;$$063$lcssa=0}if(($$063$lcssa|0)<($6|0)){$48=+HEAPF32[48+($$062$lcssa<<2)>>2];$$0661=$$063$lcssa;do{$49=$4+($$0661<<2)|0;HEAPF32[$49>>2]=$48*+HEAPF32[$49>>2];$$0661=$$0661+1|0}while(($$0661|0)!=($6|0))}}return}function _vorbis_finish_frame($0,$1,$2,$3){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;var $$0=0,$$06776=0,$$06880=0,$$06971=0,$$07072=0,$11=0,$12=0,$14=0,$16=0,$18=0,$33=0,$34=0,$36=0,$38=0,$4=0,$40=0,$42=0,$45=0,$49=0,$5=0,$52=0,$53=0,$7=0,$9=0;$4=$0+980|0;$5=HEAP32[$4>>2]|0;if(!$5){$34=HEAP32[$0+4>>2]|0;$49=0}else{$7=_get_window($0,$5)|0;$9=HEAP32[$0+4>>2]|0;if(($9|0)>0){$11=($5|0)>0;$12=$5+-1|0;$$06880=0;do{if($11){$14=HEAP32[$0+788+($$06880<<2)>>2]|0;$16=HEAP32[$0+916+($$06880<<2)>>2]|0;$$06776=0;do{$18=$14+($$06776+$2<<2)|0;HEAPF32[$18>>2]=+HEAPF32[$18>>2]*+HEAPF32[$7+($$06776<<2)>>2]+ +HEAPF32[$16+($$06776<<2)>>2]*+HEAPF32[$7+($12-$$06776<<2)>>2];$$06776=$$06776+1|0}while(($$06776|0)!=($5|0))}$$06880=$$06880+1|0}while(($$06880|0)<($9|0))}$34=$9;$49=HEAP32[$4>>2]|0}$33=$1-$3|0;HEAP32[$4>>2]=$33;if(($34|0)>0){$36=($1|0)>($3|0);$$07072=0;do{if($36){$38=HEAP32[$0+788+($$07072<<2)>>2]|0;$40=HEAP32[$0+916+($$07072<<2)>>2]|0;$$06971=0;$42=$3;while(1){HEAP32[$40+($$06971<<2)>>2]=HEAP32[$38+($42<<2)>>2];$45=$$06971+1|0;if(($45|0)==($33|0))break;else{$$06971=$45;$42=$45+$3|0}}}$$07072=$$07072+1|0}while(($$07072|0)<($34|0))}$52=(($1|0)<($3|0)?$1:$3)-$2|0;$53=$0+1404|0;if(!$49)$$0=0;else{HEAP32[$53>>2]=(HEAP32[$53>>2]|0)+$52;$$0=$52}return $$0|0}function _start_page_no_capturepattern($0){$0=$0|0;var $$0=0,$$05866$in=0,$$059$lcssa=0,$$05963=0,$$06062=0,$10=0,$11=0,$15=0,$18=0,$28=0,$3=0,$37=0,$5=0,$6=0,$7=0,$$05866$in$looptemp=0;do{if(!((_get8($0)|0)<<24>>24)){$3=_get8($0)|0;HEAP8[$0+1363>>0]=$3;$5=_get32($0)|0;$6=_get32($0)|0;_get32($0)|0;$7=_get32($0)|0;HEAP32[$0+1100>>2]=$7;_get32($0)|0;$10=(_get8($0)|0)&255;$11=$0+1104|0;HEAP32[$11>>2]=$10;if(!(_getn($0,$0+1108|0,$10)|0)){_error($0,10);$$0=0;break}$15=$0+1392|0;HEAP32[$15>>2]=-2;L6:do{if(($6&$5|0)!=-1){$18=HEAP32[$11>>2]|0;if(($18|0)>0){$$05866$in=$18;while(1){$$05866$in$looptemp=$$05866$in;$$05866$in=$$05866$in+-1|0;if((HEAP8[$0+1108+$$05866$in>>0]|0)!=-1)break;if(($$05866$in$looptemp|0)<=1)break L6}HEAP32[$15>>2]=$$05866$in;HEAP32[$0+1396>>2]=$5}}}while(0);if(HEAP8[$0+1365>>0]|0){$28=HEAP32[$11>>2]|0;if(($28|0)>0){$$05963=0;$$06062=0;do{$$05963=$$05963+(HEAPU8[$0+1108+$$06062>>0]|0)|0;$$06062=$$06062+1|0}while(($$06062|0)<($28|0));$$059$lcssa=$$05963+27|0}else $$059$lcssa=27;$37=HEAP32[$0+40>>2]|0;HEAP32[$0+44>>2]=$37;HEAP32[$0+48>>2]=$$059$lcssa+$28+$37;HEAP32[$0+52>>2]=$5}HEAP32[$0+1368>>2]=0;$$0=1}else{_error($0,31);$$0=0}}while(0);return $$0|0}function _compute_twiddle_factors($0,$1,$2,$3){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;var $$04044=0,$$045=0,$$14142=0,$$143=0,$11=0,$13=0,$17=0,$18=0,$23=0,$26=0,$30=0,$36=0,$37=0,$4=0,$41=0,$43=0,$47=0,$5=0,$7=0;$4=$0>>2;$5=$0>>3;if(($0|0)>3){$7=+($0|0);$$04044=0;$$045=0;while(1){$11=+($$04044<<2|0)*3.141592653589793/$7;$13=+Math_cos(+$11);HEAPF32[$1+($$045<<2)>>2]=$13;$17=-+Math_sin(+$11);$18=$$045|1;HEAPF32[$1+($18<<2)>>2]=$17;$23=+($18|0)*3.141592653589793/$7*.5;$26=+Math_cos(+$23)*.5;HEAPF32[$2+($$045<<2)>>2]=$26;$30=+Math_sin(+$23)*.5;HEAPF32[$2+($18<<2)>>2]=$30;$$04044=$$04044+1|0;if(($$04044|0)>=($4|0))break;else $$045=$$045+2|0}if(($0|0)>7){$36=+($0|0);$$14142=0;$$143=0;while(1){$37=$$143|1;$41=+($37<<1|0)*3.141592653589793/$36;$43=+Math_cos(+$41);HEAPF32[$3+($$143<<2)>>2]=$43;$47=-+Math_sin(+$41);HEAPF32[$3+($37<<2)>>2]=$47;$$14142=$$14142+1|0;if(($$14142|0)>=($5|0))break;else $$143=$$143+2|0}}}return}function _codebook_decode($0,$1,$2,$3){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;var $$0=0,$$04045=0,$$04144=0,$$143=0,$12=0,$14=0,$15=0,$19=0,$20=0,$28=0,$33=0,$4=0,$6=0,$8=0,$spec$select=0;$4=_codebook_decode_start($0,$1)|0;do{if(($4|0)<0)$$0=0;else{$6=HEAP32[$1>>2]|0;$spec$select=($6|0)<($3|0)?$6:$3;$8=Math_imul($6,$4)|0;$12=($spec$select|0)>0;if(!(HEAP8[$1+22>>0]|0)){if(!$12){$$0=1;break}$28=HEAP32[$1+28>>2]|0;$$143=0;do{$33=$2+($$143<<2)|0;HEAPF32[$33>>2]=+HEAPF32[$33>>2]+(+HEAPF32[$28+($$143+$8<<2)>>2]+0);$$143=$$143+1|0}while(($$143|0)<($spec$select|0));$$0=1}else{if(!$12){$$0=1;break}$14=HEAP32[$1+28>>2]|0;$15=$1+12|0;$$04045=0;$$04144=0;while(1){$19=$$04045+ +HEAPF32[$14+($$04144+$8<<2)>>2];$20=$2+($$04144<<2)|0;HEAPF32[$20>>2]=+HEAPF32[$20>>2]+$19;$$04144=$$04144+1|0;if(($$04144|0)>=($spec$select|0)){$$0=1;break}else $$04045=$19+ +HEAPF32[$15>>2]}}}}while(0);return $$0|0}function _memset(ptr,value,num){ptr=ptr|0;value=value|0;num=num|0;var end=0,aligned_end=0,block_aligned_end=0,value4=0;end=ptr+num|0;value=value&255;if((num|0)>=67){while(ptr&3){HEAP8[ptr>>0]=value;ptr=ptr+1|0}aligned_end=end&-4|0;block_aligned_end=aligned_end-64|0;value4=value|value<<8|value<<16|value<<24;while((ptr|0)<=(block_aligned_end|0)){HEAP32[ptr>>2]=value4;HEAP32[ptr+4>>2]=value4;HEAP32[ptr+8>>2]=value4;HEAP32[ptr+12>>2]=value4;HEAP32[ptr+16>>2]=value4;HEAP32[ptr+20>>2]=value4;HEAP32[ptr+24>>2]=value4;HEAP32[ptr+28>>2]=value4;HEAP32[ptr+32>>2]=value4;HEAP32[ptr+36>>2]=value4;HEAP32[ptr+40>>2]=value4;HEAP32[ptr+44>>2]=value4;HEAP32[ptr+48>>2]=value4;HEAP32[ptr+52>>2]=value4;HEAP32[ptr+56>>2]=value4;HEAP32[ptr+60>>2]=value4;ptr=ptr+64|0}while((ptr|0)<(aligned_end|0)){HEAP32[ptr>>2]=value4;ptr=ptr+4|0}}while((ptr|0)<(end|0)){HEAP8[ptr>>0]=value;ptr=ptr+1|0}return end-num|0}function _sift($0,$1,$2,$3,$4){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;var $$0$lcssa=0,$$02934=0,$$03133=0,$$035=0,$$1=0,$$130=0,$$132=0,$13=0,$14=0,$21=0,$5=0,$7=0,$8=0,$9=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+240|0;$5=sp;HEAP32[$5>>2]=$0;L1:do{if(($3|0)>1){$7=0-$1|0;$$02934=$0;$$03133=$3;$$035=1;$14=$0;while(1){$8=$$02934+$7|0;$9=$$03133+-2|0;$13=$8+(0-(HEAP32[$4+($9<<2)>>2]|0))|0;if((FUNCTION_TABLE_iii[$2&3]($14,$13)|0)>-1)if((FUNCTION_TABLE_iii[$2&3]($14,$8)|0)>-1){$$0$lcssa=$$035;break L1}$21=$5+($$035<<2)|0;if((FUNCTION_TABLE_iii[$2&3]($13,$8)|0)>-1){HEAP32[$21>>2]=$13;$$130=$13;$$132=$$03133+-1|0}else{HEAP32[$21>>2]=$8;$$130=$8;$$132=$9}$$1=$$035+1|0;if(($$132|0)<=1){$$0$lcssa=$$1;break L1}$$02934=$$130;$$03133=$$132;$$035=$$1;$14=HEAP32[$5>>2]|0}}else $$0$lcssa=1}while(0);_cycle($1,$5,$$0$lcssa);STACKTOP=sp;return}function _get_bits($0,$1){$0=$0|0;$1=$1|0;var $$2=0,$14=0,$15=0,$17=0,$2=0,$21=0,$24=0,$25=0,$3=0,$31=0,$7=0,label=0;$2=$0+1384|0;$3=HEAP32[$2>>2]|0;L1:do{if(($3|0)<0)$$2=0;else{do{if(($3|0)<($1|0)){if(($1|0)>24){$7=_get_bits($0,24)|0;return((_get_bits($0,$1+-24|0)|0)<<24)+$7|0}if(!$3)HEAP32[$0+1380>>2]=0;$14=$0+1380|0;while(1){$15=_get8_packet_raw($0)|0;if(($15|0)==-1){label=10;break}$17=HEAP32[$2>>2]|0;HEAP32[$14>>2]=(HEAP32[$14>>2]|0)+($15<<$17);$21=$17+8|0;HEAP32[$2>>2]=$21;if(($21|0)>=($1|0)){label=11;break}}if((label|0)==10){HEAP32[$2>>2]=-1;$$2=0;break L1}else if((label|0)==11)if(($17|0)<-8){$$2=0;break L1}else{$31=$21;break}}else $31=$3}while(0);$24=$0+1380|0;$25=HEAP32[$24>>2]|0;HEAP32[$24>>2]=$25>>>$1;HEAP32[$2>>2]=$31-$1;$$2=$25&(1<<$1)+-1}}while(0);return $$2|0}function _init_blocksize($0,$1,$2){$0=$0|0;$1=$1|0;$2=$2|0;var $$0=0,$10=0,$11=0,$13=0,$15=0,$18=0,$22=0,$5=0,$6=0,$7=0,$8=0,$9=0,label=0;$5=$2>>3;$6=$2>>>1<<2;$7=_setup_malloc($0,$6)|0;$8=$0+1056+($1<<2)|0;HEAP32[$8>>2]=$7;$9=_setup_malloc($0,$6)|0;$10=$0+1064+($1<<2)|0;HEAP32[$10>>2]=$9;$11=_setup_malloc($0,$2&-4)|0;HEAP32[$0+1072+($1<<2)>>2]=$11;$13=HEAP32[$8>>2]|0;do{if(!$13)label=3;else{$15=HEAP32[$10>>2]|0;if(($11|0)==0|($15|0)==0)label=3;else{_compute_twiddle_factors($2,$13,$15,$11);$18=_setup_malloc($0,$6)|0;HEAP32[$0+1080+($1<<2)>>2]=$18;if(!$18){_error($0,3);$$0=0;break}_compute_window($2,$18);$22=_setup_malloc($0,$5<<1)|0;HEAP32[$0+1088+($1<<2)>>2]=$22;if(!$22){_error($0,3);$$0=0;break}else{_compute_bitreverse($2,$22);$$0=1;break}}}}while(0);if((label|0)==3){_error($0,3);$$0=0}return $$0|0}function _draw_line($0,$1,$2,$3,$4,$5){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;$5=$5|0;var $$05362=0,$$05461=0,$$05660=0,$$05663=0,$11=0,$14=0,$19=0,$23=0,$24=0,$28=0,$6=0,$7=0,$9=0,$spec$select=0;$6=$4-$2|0;$7=$3-$1|0;$9=($6|0)/($7|0)|0;$11=$6>>31|1;$14=(($6|0)>-1?$6:0-$6|0)-(Math_imul(($9|0)>-1?$9:0-$9|0,$7)|0)|0;$spec$select=($3|0)>($5|0)?$5:$3;if(($spec$select|0)>($1|0)){$19=$0+($1<<2)|0;HEAPF32[$19>>2]=+HEAPF32[48+($2<<2)>>2]*+HEAPF32[$19>>2];$$05660=$1+1|0;if(($$05660|0)<($spec$select|0)){$$05362=0;$$05461=$2;$$05663=$$05660;while(1){$23=$$05362+$14|0;$24=($23|0)<($7|0);$$05461=$$05461+$9+($24?0:$11)|0;$28=$0+($$05663<<2)|0;HEAPF32[$28>>2]=+HEAPF32[48+($$05461<<2)>>2]*+HEAPF32[$28>>2];$$05663=$$05663+1|0;if(($$05663|0)>=($spec$select|0))break;else $$05362=$23-($24?0:$7)|0}}}return}function _codebook_decode_start($0,$1){$0=$0|0;$1=$1|0;var $$0=0,$$1=0,$12=0,$13=0,$19=0,$22=0,$23=0,$5=0,$8=0,$9=0;do{if(!(HEAP8[$1+21>>0]|0)){_error($0,21);$$0=-1}else{$5=$0+1384|0;if((HEAP32[$5>>2]|0)<10)_prep_huffman($0);$8=$0+1380|0;$9=HEAP32[$8>>2]|0;$12=HEAP16[$1+36+(($9&1023)<<1)>>1]|0;$13=$12<<16>>16;if($12<<16>>16>-1){$19=HEAPU8[(HEAP32[$1+8>>2]|0)+$13>>0]|0;HEAP32[$8>>2]=$9>>>$19;$22=(HEAP32[$5>>2]|0)-$19|0;$23=($22|0)<0;HEAP32[$5>>2]=$23?0:$22;$$1=$23?-1:$13}else $$1=_codebook_decode_scalar_raw($0,$1)|0;if(HEAP8[$1+23>>0]|0)if(($$1|0)>=(HEAP32[$1+2092>>2]|0))___assert_fail(1375,1076,1730,1397);if(($$1|0)<0){if(!(HEAP8[$0+1364>>0]|0))if(HEAP32[$0+1372>>2]|0){$$0=$$1;break}_error($0,21);$$0=$$1}else $$0=$$1}}while(0);return $$0|0}function _residue_decode($0,$1,$2,$3,$4,$5){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;$5=$5|0;var $$03237=0,$$03440=0,$$1=0,$$13341=0,$11=0,$23=0,$8=0,$9=0;L1:do{if(!$5){$8=($4|0)/(HEAP32[$1>>2]|0)|0;$9=$2+($3<<2)|0;if(($8|0)>0){$11=$4-$3|0;$$03237=0;while(1){if(!(_codebook_decode_step($0,$1,$9+($$03237<<2)|0,$11-$$03237|0,$8)|0)){$$1=0;break L1}$$03237=$$03237+1|0;if(($$03237|0)>=($8|0)){$$1=1;break}}}else $$1=1}else if(($4|0)>0){$$03440=$3;$$13341=0;while(1){if(!(_codebook_decode($0,$1,$2+($$03440<<2)|0,$4-$$13341|0)|0)){$$1=0;break L1}$23=HEAP32[$1>>2]|0;$$13341=$23+$$13341|0;if(($$13341|0)>=($4|0)){$$1=1;break}else $$03440=$23+$$03440|0}}else $$1=1}while(0);return $$1|0}function _next_segment($0){$0=$0|0;var $$0=0,$1=0,$17=0,$18=0,$20=0,$27=0,$4=0,$5=0;$1=$0+1372|0;L1:do{if(!(HEAP32[$1>>2]|0)){$4=$0+1368|0;$5=HEAP32[$4>>2]|0;do{if(($5|0)==-1){HEAP32[$0+1376>>2]=(HEAP32[$0+1104>>2]|0)+-1;if(!(_start_page($0)|0)){HEAP32[$1>>2]=1;$$0=0;break L1}if(!(HEAP8[$0+1363>>0]&1)){_error($0,32);$$0=0;break L1}else{$18=HEAP32[$4>>2]|0;break}}else $18=$5}while(0);$17=$18+1|0;HEAP32[$4>>2]=$17;$20=HEAP8[$0+1108+$18>>0]|0;if($20<<24>>24!=-1){HEAP32[$1>>2]=1;HEAP32[$0+1376>>2]=$18}if(($17|0)>=(HEAP32[$0+1104>>2]|0))HEAP32[$4>>2]=-1;$27=$0+1364|0;if(!(HEAP8[$27>>0]|0)){HEAP8[$27>>0]=$20;$$0=$20&255;break}else ___assert_fail(1205,1076,1512,1226)}else $$0=0}while(0);return $$0|0}function _compute_accelerated_huffman($0){$0=$0|0;var $$027=0,$$128=0,$$pre=0,$10=0,$11=0,$12=0,$22=0,$24=0,$3=0,$6=0,$spec$store$select=0;_memset($0+36|0,-1,2048)|0;$3=(HEAP8[$0+23>>0]|0)==0;$6=HEAP32[($3?$0+4|0:$0+2092|0)>>2]|0;$spec$store$select=($6|0)<32767?$6:32767;if(($6|0)>0){$10=$0+32|0;$11=$0+2084|0;$$pre=HEAP32[$0+8>>2]|0;$$128=0;do{$12=$$pre+$$128|0;if((HEAPU8[$12>>0]|0)<11){if($3)$22=HEAP32[(HEAP32[$10>>2]|0)+($$128<<2)>>2]|0;else $22=_bit_reverse(HEAP32[(HEAP32[$11>>2]|0)+($$128<<2)>>2]|0)|0;if($22>>>0<1024){$24=$$128&65535;$$027=$22;do{HEAP16[$0+36+($$027<<1)>>1]=$24;$$027=(1<<HEAPU8[$12>>0])+$$027|0}while($$027>>>0<1024)}}$$128=$$128+1|0}while(($$128|0)<($spec$store$select|0))}return}function _iter_54($0){$0=$0|0;var $1=0,$10=0,$11=0,$14=0,$15=0,$16=0,$17=0,$18=0,$2=0,$21=0,$22=0,$23=0,$24=0,$25=0,$26=0,$27=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0;$1=+HEAPF32[$0>>2];$2=$0+-16|0;$3=+HEAPF32[$2>>2];$4=$1-$3;$5=$1+$3;$6=$0+-8|0;$7=+HEAPF32[$6>>2];$8=$0+-24|0;$9=+HEAPF32[$8>>2];$10=$7+$9;$11=$7-$9;HEAPF32[$0>>2]=$5+$10;HEAPF32[$6>>2]=$5-$10;$14=$0+-12|0;$15=+HEAPF32[$14>>2];$16=$0+-28|0;$17=+HEAPF32[$16>>2];$18=$15-$17;HEAPF32[$2>>2]=$4+$18;HEAPF32[$8>>2]=$4-$18;$21=$0+-4|0;$22=+HEAPF32[$21>>2];$23=$0+-20|0;$24=+HEAPF32[$23>>2];$25=$22-$24;$26=$22+$24;$27=$15+$17;HEAPF32[$21>>2]=$27+$26;HEAPF32[$14>>2]=$26-$27;HEAPF32[$23>>2]=$25-$11;HEAPF32[$16>>2]=$11+$25;return}function _codebook_decode_step($0,$1,$2,$3,$4){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;var $$0=0,$$02833=0,$$02932=0,$12=0,$15=0,$19=0,$21=0,$5=0,$7=0,$9=0,$spec$select=0;$5=_codebook_decode_start($0,$1)|0;if(($5|0)<0)$$0=0;else{$7=HEAP32[$1>>2]|0;$spec$select=($7|0)<($3|0)?$7:$3;$9=Math_imul($7,$5)|0;if(($spec$select|0)>0){$12=HEAP32[$1+28>>2]|0;$15=(HEAP8[$1+22>>0]|0)==0;$$02833=0;$$02932=0;while(1){$19=$$02833+ +HEAPF32[$12+($$02932+$9<<2)>>2];$21=$2+((Math_imul($$02932,$4)|0)<<2)|0;HEAPF32[$21>>2]=+HEAPF32[$21>>2]+$19;$$02932=$$02932+1|0;if(($$02932|0)>=($spec$select|0)){$$0=1;break}else $$02833=$15?$$02833:$19}}else $$0=1}return $$0|0}function _maybe_start_packet($0){$0=$0|0;var $$1=0,$4=0,label=0;do{if((HEAP32[$0+1368>>2]|0)==-1){$4=_get8($0)|0;if(!(HEAP32[$0+84>>2]|0)){if($4<<24>>24!=79){_error($0,30);$$1=0;break}if((_get8($0)|0)<<24>>24!=103){_error($0,30);$$1=0;break}if((_get8($0)|0)<<24>>24!=103){_error($0,30);$$1=0;break}if((_get8($0)|0)<<24>>24!=83){_error($0,30);$$1=0;break}if(!(_start_page_no_capturepattern($0)|0))$$1=0;else if(!(HEAP8[$0+1363>>0]&1))label=14;else{HEAP32[$0+1372>>2]=0;HEAP8[$0+1364>>0]=0;_error($0,32);$$1=0}}else $$1=0}else label=14}while(0);if((label|0)==14)$$1=_start_packet($0)|0;return $$1|0}function _cycle($0,$1,$2){$0=$0|0;$1=$1|0;$2=$2|0;var $$02527=0,$$026=0,$10=0,$11=0,$18=0,$3=0,$5=0,$8=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+256|0;$3=sp;L1:do{if(($2|0)>=2){$5=$1+($2<<2)|0;HEAP32[$5>>2]=$3;if($0|0){$$02527=$0;$10=$3;while(1){$8=$$02527>>>0<256?$$02527:256;_memcpy($10|0,HEAP32[$1>>2]|0,$8|0)|0;$$026=0;do{$11=$1+($$026<<2)|0;$$026=$$026+1|0;_memcpy(HEAP32[$11>>2]|0,HEAP32[$1+($$026<<2)>>2]|0,$8|0)|0;HEAP32[$11>>2]=(HEAP32[$11>>2]|0)+$8}while(($$026|0)!=($2|0));$18=$$02527-$8|0;if(!$18)break L1;$$02527=$18;$10=HEAP32[$5>>2]|0}}}}while(0);STACKTOP=sp;return}function _scalbn($0,$1){$0=+$0;$1=$1|0;var $$0=0,$$020=0,$10=0,$12=0,$14=0,$17=0,$18=0,$3=0,$5=0,$7=0;if(($1|0)>1023){$3=$0*898846567431158e293;$5=($1|0)>2046;$7=$1+-2046|0;$$0=$5?$3*898846567431158e293:$3;$$020=$5?($7|0)<1023?$7:1023:$1+-1023|0}else if(($1|0)<-1022){$10=$0*22250738585072014e-324;$12=($1|0)<-2044;$14=$1+2044|0;$$0=$12?$10*22250738585072014e-324:$10;$$020=$12?($14|0)>-1022?$14:-1022:$1+1022|0}else{$$0=$0;$$020=$1}$17=_bitshift64Shl($$020+1023|0,0,52)|0;$18=tempRet0;HEAP32[tempDoublePtr>>2]=$17;HEAP32[tempDoublePtr+4>>2]=$18;return+($$0*+HEAPF64[tempDoublePtr>>3])}function _neighbors($0,$1,$2,$3){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;var $$02933=0,$$03032=0,$$034=0,$$1=0,$$131=0,$5=0,$7=0,$8=0;if(($1|0)>0){$5=$0+($1<<1)|0;$$02933=65536;$$03032=-1;$$034=0;while(1){$7=HEAP16[$0+($$034<<1)>>1]|0;$8=$7&65535;if(($$03032|0)<($8|0))if(($7&65535)<(HEAPU16[$5>>1]|0)){HEAP32[$2>>2]=$$034;$$131=$8}else $$131=$$03032;else $$131=$$03032;if(($$02933|0)>($8|0))if(($7&65535)>(HEAPU16[$5>>1]|0)){HEAP32[$3>>2]=$$034;$$1=$8}else $$1=$$02933;else $$1=$$02933;$$034=$$034+1|0;if(($$034|0)==($1|0))break;else{$$02933=$$1;$$03032=$$131}}}return}function _stb_vorbis_open_pushdata($0,$1,$2,$3,$4){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;var $$0=0,$17=0,$5=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+1504|0;$5=sp;_vorbis_init($5,$4);HEAP32[$5+20>>2]=$0;HEAP32[$5+28>>2]=$0+$1;HEAP8[$5+36>>0]=1;do{if(!(_start_decoder($5)|0)){HEAP32[$3>>2]=(HEAP32[$5+84>>2]|0)==0?HEAP32[$5+88>>2]|0:1;$$0=0}else{$17=_vorbis_alloc($5)|0;if(!$17){_vorbis_deinit($5);$$0=0;break}else{_memcpy($17|0,$5|0,1500)|0;HEAP32[$2>>2]=(HEAP32[$17+20>>2]|0)-$0;HEAP32[$3>>2]=0;$$0=$17;break}}}while(0);STACKTOP=sp;return $$0|0}function _ilog($0){$0=$0|0;var $$0=0;do{if(($0|0)<0)$$0=0;else{if(($0|0)<16384){if(($0|0)<16){$$0=HEAP8[16+$0>>0]|0;break}if(($0|0)<512){$$0=(HEAP8[16+($0>>>5)>>0]|0)+5|0;break}else{$$0=(HEAP8[16+($0>>>10)>>0]|0)+10|0;break}}if(($0|0)<16777216)if(($0|0)<524288){$$0=(HEAP8[16+($0>>>15)>>0]|0)+15|0;break}else{$$0=(HEAP8[16+($0>>>20)>>0]|0)+20|0;break}else if(($0|0)<536870912){$$0=(HEAP8[16+($0>>>25)>>0]|0)+25|0;break}else{$$0=(HEAP8[16+($0>>>30)>>0]|0)+30|0;break}}}while(0);return $$0|0}function _realloc($0,$1){$0=$0|0;$1=$1|0;var $$1=0,$11=0,$14=0,$17=0,$22=0,$5=0;if(!$0){$$1=_malloc($1)|0;return $$1|0}if($1>>>0>4294967231){$5=___errno_location()|0;HEAP32[$5>>2]=12;$$1=0;return $$1|0}$11=_try_realloc_chunk($0+-8|0,$1>>>0<11?16:$1+11&-8)|0;if($11|0){$$1=$11+8|0;return $$1|0}$14=_malloc($1)|0;if(!$14){$$1=0;return $$1|0}$17=HEAP32[$0+-4>>2]|0;$22=($17&-8)-(($17&3|0)==0?8:4)|0;_memcpy($14|0,$0|0,($22>>>0<$1>>>0?$22:$1)|0)|0;_free($0);$$1=$14;return $$1|0}function _get8_packet_raw($0){$0=$0|0;var $$0=0,$$pr=0,$1=0,$11=0,$12=0,$2=0,label=0;$1=$0+1364|0;$2=HEAP8[$1>>0]|0;if(!($2<<24>>24))if(!(HEAP32[$0+1372>>2]|0))if(!(_next_segment($0)|0))$$0=-1;else{$$pr=HEAP8[$1>>0]|0;if(!($$pr<<24>>24))___assert_fail(1169,1076,1526,1189);else{$11=$$pr;label=6}}else $$0=-1;else{$11=$2;label=6}if((label|0)==6){HEAP8[$1>>0]=$11+-1<<24>>24;$12=$0+1388|0;HEAP32[$12>>2]=(HEAP32[$12>>2]|0)+1;$$0=(_get8($0)|0)&255}return $$0|0}function _sbrk(increment){increment=increment|0;var oldDynamicTop=0,newDynamicTop=0;oldDynamicTop=HEAP32[DYNAMICTOP_PTR>>2]|0;newDynamicTop=oldDynamicTop+increment|0;if((increment|0)>0&(newDynamicTop|0)<(oldDynamicTop|0)|(newDynamicTop|0)<0){abortOnCannotGrowMemory()|0;___setErrNo(12);return-1}HEAP32[DYNAMICTOP_PTR>>2]=newDynamicTop;if((newDynamicTop|0)>(getTotalMemory()|0))if(!(enlargeMemory()|0)){HEAP32[DYNAMICTOP_PTR>>2]=oldDynamicTop;___setErrNo(12);return-1}return oldDynamicTop|0}function _start_packet($0){$0=$0|0;var $$0=0,$1=0,$4=0,label=0;$1=$0+1368|0;L1:do{if((HEAP32[$1>>2]|0)==-1){$4=$0+1363|0;while(1){if(!(_start_page($0)|0)){$$0=0;break L1}if(HEAP8[$4>>0]&1)break;if((HEAP32[$1>>2]|0)!=-1){label=7;break L1}}_error($0,32);$$0=0}else label=7}while(0);if((label|0)==7){HEAP32[$0+1372>>2]=0;HEAP32[$0+1384>>2]=0;HEAP32[$0+1388>>2]=0;HEAP8[$0+1364>>0]=0;$$0=1}return $$0|0}function _prep_huffman($0){$0=$0|0;var $1=0,$12=0,$14=0,$2=0,$5=0,$6=0,$7=0;$1=$0+1384|0;$2=HEAP32[$1>>2]|0;L1:do{if(($2|0)<25){$5=$0+1380|0;if(!$2)HEAP32[$5>>2]=0;$6=$0+1364|0;$7=$0+1372|0;do{if(HEAP32[$7>>2]|0)if(!(HEAP8[$6>>0]|0))break L1;$12=_get8_packet_raw($0)|0;if(($12|0)==-1)break L1;$14=HEAP32[$1>>2]|0;HEAP32[$5>>2]=(HEAP32[$5>>2]|0)+($12<<$14);HEAP32[$1>>2]=$14+8}while(($14|0)<17)}}while(0);return}function _lookup1_values($0,$1){$0=$0|0;$1=$1|0;var $11=0,$15=0,$21=0,$spec$select=0;$11=~~+Math_floor(+ +Math_exp(+(+Math_log(+ +($0|0))/+($1|0))));$15=+($1|0);$spec$select=((~~+Math_floor(+ +Math_pow(+(+($11|0)+1),+$15))|0)<=($0|0)&1)+$11|0;$21=+($spec$select|0);if(!(+Math_pow(+($21+1),+$15)>+($0|0)))___assert_fail(1755,1076,1205,1787);if((~~+Math_floor(+ +Math_pow(+$21,+$15))|0)>($0|0))___assert_fail(1802,1076,1206,1787);else return $spec$select|0;return 0}function _memcmp($0,$1,$2){$0=$0|0;$1=$1|0;$2=$2|0;var $$01318=0,$$01417=0,$$019=0,$14=0,$4=0,$5=0;L1:do{if(!$2)$14=0;else{$$01318=$0;$$01417=$2;$$019=$1;while(1){$4=HEAP8[$$01318>>0]|0;$5=HEAP8[$$019>>0]|0;if($4<<24>>24!=$5<<24>>24)break;$$01417=$$01417+-1|0;if(!$$01417){$14=0;break L1}else{$$01318=$$01318+1|0;$$019=$$019+1|0}}$14=($4&255)-($5&255)|0}}while(0);return $14|0}function _setup_malloc($0,$1){$0=$0|0;$1=$1|0;var $$1=0,$10=0,$11=0,$12=0,$3=0,$4=0,$8=0;$3=$1+3&-4;$4=$0+8|0;HEAP32[$4>>2]=(HEAP32[$4>>2]|0)+$3;$8=HEAP32[$0+68>>2]|0;if(!$8)if(!$3)$$1=0;else $$1=_malloc($3)|0;else{$10=$0+76|0;$11=HEAP32[$10>>2]|0;$12=$11+$3|0;if(($12|0)>(HEAP32[$0+80>>2]|0))$$1=0;else{HEAP32[$10>>2]=$12;$$1=$8+$11|0}}return $$1|0}function _vorbis_init($0,$1){$0=$0|0;$1=$1|0;var $10=0,$16=0,$4=0,$9=0;_memset($0|0,0,1500)|0;if($1|0){$4=$1;$9=HEAP32[$4+4>>2]|0;$10=$0+68|0;HEAP32[$10>>2]=HEAP32[$4>>2];HEAP32[$10+4>>2]=$9;$16=$9+3&-4;HEAP32[$0+72>>2]=$16;HEAP32[$0+80>>2]=$16}HEAP32[$0+84>>2]=0;HEAP32[$0+88>>2]=0;HEAP32[$0+20>>2]=0;HEAP32[$0+112>>2]=0;HEAP32[$0+1408>>2]=-1;return}function _vorbis_decode_packet($0,$1,$2,$3){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;var $$0=0,$4=0,$6=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+16|0;$4=sp+8|0;$6=sp;if(!(_vorbis_decode_initial($0,$2,sp+4|0,$3,$6,$4)|0))$$0=0;else $$0=_vorbis_decode_packet_rest($0,$1,$0+400+((HEAP32[$4>>2]|0)*6|0)|0,HEAP32[$2>>2]|0,HEAP32[$3>>2]|0,HEAP32[$6>>2]|0,$2)|0;STACKTOP=sp;return $$0|0}function _add_entry($0,$1,$2,$3,$4,$5){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;$5=$5|0;var $$sink=0,$$sink10=0,$10=0;$10=HEAP32[$0+32>>2]|0;if(!(HEAP8[$0+23>>0]|0)){$$sink=$1;$$sink10=$10+($2<<2)|0}else{HEAP32[$10+($3<<2)>>2]=$1;HEAP8[(HEAP32[$0+8>>2]|0)+$3>>0]=$4;$$sink=$2;$$sink10=$5+($3<<2)|0}HEAP32[$$sink10>>2]=$$sink;return}function _shl($0,$1){$0=$0|0;$1=$1|0;var $$0=0,$10=0,$3=0,$5=0,$7=0;$3=$0+4|0;if($1>>>0>31){$5=HEAP32[$0>>2]|0;HEAP32[$3>>2]=$5;HEAP32[$0>>2]=0;$$0=$1+-32|0;$10=0;$7=$5}else{$$0=$1;$10=HEAP32[$0>>2]|0;$7=HEAP32[$3>>2]|0}HEAP32[$3>>2]=$10>>>(32-$$0|0)|$7<<$$0;HEAP32[$0>>2]=$10<<$$0;return}function _shr($0,$1){$0=$0|0;$1=$1|0;var $$0=0,$10=0,$3=0,$5=0,$7=0;$3=$0+4|0;if($1>>>0>31){$5=HEAP32[$3>>2]|0;HEAP32[$0>>2]=$5;HEAP32[$3>>2]=0;$$0=$1+-32|0;$10=0;$7=$5}else{$$0=$1;$10=HEAP32[$3>>2]|0;$7=HEAP32[$0>>2]|0}HEAP32[$0>>2]=$10<<32-$$0|$7>>>$$0;HEAP32[$3>>2]=$10>>>$$0;return}function _compute_window($0,$1){$0=$0|0;$1=$1|0;var $$010=0,$16=0,$2=0,$4=0;$2=$0>>1;if(($0|0)>1){$4=+($2|0);$$010=0;do{$16=+Math_sin(+(+_square(+Math_sin(+((+($$010|0)+.5)/$4*.5*3.141592653589793)))*1.5707963267948966));HEAPF32[$1+($$010<<2)>>2]=$16;$$010=$$010+1|0}while(($$010|0)<($2|0))}return}function _setup_temp_malloc($0,$1){$0=$0|0;$1=$1|0;var $$0=0,$3=0,$5=0,$7=0,$9=0;$3=$1+3&-4;$5=HEAP32[$0+68>>2]|0;if(!$5)$$0=_malloc($3)|0;else{$7=$0+80|0;$9=(HEAP32[$7>>2]|0)-$3|0;if(($9|0)<(HEAP32[$0+76>>2]|0))$$0=0;else{HEAP32[$7>>2]=$9;$$0=$5+$9|0}}return $$0|0}function _getn($0,$1,$2){$0=$0|0;$1=$1|0;$2=$2|0;var $$0=0,$3=0,$4=0;$3=$0+20|0;$4=HEAP32[$3>>2]|0;if(($4+$2|0)>>>0>(HEAP32[$0+28>>2]|0)>>>0){HEAP32[$0+84>>2]=1;$$0=0}else{_memcpy($1|0,$4|0,$2|0)|0;HEAP32[$3>>2]=(HEAP32[$3>>2]|0)+$2;$$0=1}return $$0|0}function _compute_bitreverse($0,$1){$0=$0|0;$1=$1|0;var $$013=0,$2=0,$5=0,$9=0;$2=$0>>3;if(($0|0)>7){$5=36-(_ilog($0)|0)|0;$$013=0;do{$9=(_bit_reverse($$013)|0)>>>$5<<2&65535;HEAP16[$1+($$013<<1)>>1]=$9;$$013=$$013+1|0}while(($$013|0)<($2|0))}return}function _crc32_init(){var $$01315=0,$$01417=0,$$016=0;$$01417=0;do{$$01315=0;$$016=$$01417<<24;do{$$016=$$016>>31&79764919^$$016<<1;$$01315=$$01315+1|0}while(($$01315|0)!=8);HEAP32[1856+($$01417<<2)>>2]=$$016;$$01417=$$01417+1|0}while(($$01417|0)!=256);return}function _make_block_array($0,$1,$2){$0=$0|0;$1=$1|0;$2=$2|0;var $$01617=0,$$018=0;if(($1|0)>0){$$01617=0;$$018=$0+($1<<2)|0;while(1){HEAP32[$0+($$01617<<2)>>2]=$$018;$$01617=$$01617+1|0;if(($$01617|0)==($1|0))break;else $$018=$$018+$2|0}}return $0|0}function _get_window($0,$1){$0=$0|0;$1=$1|0;var $$0$in=0,$2=0;$2=$1<<1;do{if(($2|0)==(HEAP32[$0+100>>2]|0))$$0$in=$0+1080|0;else if(($2|0)==(HEAP32[$0+104>>2]|0)){$$0$in=$0+1084|0;break}else ___assert_fail(1455,1076,3051,1457)}while(0);return HEAP32[$$0$in>>2]|0}function _a_ctz_l($0){$0=$0|0;var $$068=0,$$07=0,$$09=0,$4=0;if(!$0)$$07=32;else if(!($0&1)){$$068=$0;$$09=0;while(1){$4=$$09+1|0;if(!($$068&2)){$$068=$$068>>>1;$$09=$4}else{$$07=$4;break}}}else $$07=0;return $$07|0}function _bit_reverse($0){$0=$0|0;var $10=0,$15=0,$20=0,$5=0;$5=$0>>>1&1431655765|$0<<1&-1431655766;$10=$5>>>2&858993459|$5<<2&-858993460;$15=$10>>>4&252645135|$10<<4&-252645136;$20=$15>>>8&16711935|$15<<8&-16711936;return $20>>>16|$20<<16|0}function _predict_point($0,$1,$2,$3,$4){$0=$0|0;$1=$1|0;$2=$2|0;$3=$3|0;$4=$4|0;var $10=0,$5=0;$5=$4-$3|0;$10=(Math_imul(($5|0)>-1?$5:0-$5|0,$0-$1|0)|0)/($2-$1|0)|0;return(($5|0)<0?0-$10|0:$10)+$3|0}function _stb_vorbis_flush_pushdata($0){$0=$0|0;HEAP32[$0+980>>2]=0;HEAP32[$0+1408>>2]=0;HEAP32[$0+1400>>2]=0;HEAP32[$0+1052>>2]=0;HEAP8[$0+1365>>0]=0;HEAP32[$0+1404>>2]=0;HEAP32[$0+1492>>2]=0;HEAP32[$0+1496>>2]=0;return}function runPostSets(){}function _bitshift64Shl(low,high,bits){low=low|0;high=high|0;bits=bits|0;if((bits|0)<32){tempRet0=high<<bits|(low&(1<<bits)-1<<32-bits)>>>32-bits;return low<<bits}tempRet0=low<<bits-32;return 0}function _get8($0){$0=$0|0;var $$0=0,$1=0,$2=0;$1=$0+20|0;$2=HEAP32[$1>>2]|0;if($2>>>0<(HEAP32[$0+28>>2]|0)>>>0){HEAP32[$1>>2]=$2+1;$$0=HEAP8[$2>>0]|0}else{HEAP32[$0+84>>2]=1;$$0=0}return $$0|0}function _capture_pattern($0){$0=$0|0;var $$0=0;if((_get8($0)|0)<<24>>24==79)if((_get8($0)|0)<<24>>24==103)if((_get8($0)|0)<<24>>24==103)$$0=(_get8($0)|0)<<24>>24==83&1;else $$0=0;else $$0=0;else $$0=0;return $$0|0}function _include_in_sort($0,$1){$0=$0|0;$1=$1|0;var $5=0;$5=$1<<24>>24==-1;if(!(HEAP8[$0+23>>0]|0))return($5^($1&255)>10)&1|0;if($5)___assert_fail(1724,1076,1130,1739);else return 1;return 0}function _pntz($0){$0=$0|0;var $3=0,$7=0;$3=_a_ctz_l((HEAP32[$0>>2]|0)+-1|0)|0;if(!$3){$7=_a_ctz_l(HEAP32[$0+4>>2]|0)|0;return(($7|0)==0?0:$7+32|0)|0}else return $3|0;return 0}function _skip($0,$1){$0=$0|0;$1=$1|0;var $2=0,$4=0;$2=$0+20|0;$4=(HEAP32[$2>>2]|0)+$1|0;HEAP32[$2>>2]=$4;if($4>>>0>=(HEAP32[$0+28>>2]|0)>>>0)HEAP32[$0+84>>2]=1;return}function _setup_temp_free($0,$1,$2){$0=$0|0;$1=$1|0;$2=$2|0;var $8=0;if(!(HEAP32[$0+68>>2]|0))_free($1);else{$8=$0+80|0;HEAP32[$8>>2]=(HEAP32[$8>>2]|0)+($2+3&-4)}return}function _get32($0){$0=$0|0;var $10=0,$2=0,$6=0;$2=(_get8($0)|0)&255;$6=((_get8($0)|0)&255)<<8|$2;$10=$6|((_get8($0)|0)&255)<<16;return $10|((_get8($0)|0)&255)<<24|0}function _point_compare($0,$1){$0=$0|0;$1=$1|0;var $2=0,$3=0;$2=HEAP16[$0>>1]|0;$3=HEAP16[$1>>1]|0;return(($2&65535)<($3&65535)?-1:($2&65535)>($3&65535)&1)|0}function _uint32_compare($0,$1){$0=$0|0;$1=$1|0;var $2=0,$3=0;$2=HEAP32[$0>>2]|0;$3=HEAP32[$1>>2]|0;return($2>>>0<$3>>>0?-1:$2>>>0>$3>>>0&1)|0}function _stb_vorbis_get_file_offset($0){$0=$0|0;var $$0=0;if(!(HEAP8[$0+36>>0]|0))$$0=(HEAP32[$0+20>>2]|0)-(HEAP32[$0+24>>2]|0)|0;else $$0=0;return $$0|0}function _start_page($0){$0=$0|0;var $$0=0;if(!(_capture_pattern($0)|0)){_error($0,30);$$0=0}else $$0=_start_page_no_capturepattern($0)|0;return $$0|0}function _stb_vorbis_js_channels($0){$0=$0|0;var $$0=0,$1=0;$1=HEAP32[$0>>2]|0;if(!$1)$$0=0;else $$0=HEAP32[$1+4>>2]|0;return $$0|0}function _stb_vorbis_js_sample_rate($0){$0=$0|0;var $$0=0,$1=0;$1=HEAP32[$0>>2]|0;if(!$1)$$0=0;else $$0=HEAP32[$1>>2]|0;return $$0|0}function _float32_unpack($0){$0=$0|0;var $5=0;$5=+(($0&2097151)>>>0);return+ +_ldexp(($0|0)<0?-$5:$5,($0>>>21&1023)+-788|0)}function stackAlloc(size){size=size|0;var ret=0;ret=STACKTOP;STACKTOP=STACKTOP+size|0;STACKTOP=STACKTOP+15&-16;return ret|0}function establishStackSpace(stackBase,stackMax){stackBase=stackBase|0;stackMax=stackMax|0;STACKTOP=stackBase;STACK_MAX=stackMax}function dynCall_iii(index,a1,a2){index=index|0;a1=a1|0;a2=a2|0;return FUNCTION_TABLE_iii[index&3](a1|0,a2|0)|0}function setThrew(threw,value){threw=threw|0;value=value|0;if(!__THREW__){__THREW__=threw;threwValue=value}}function _crc32_update($0,$1){$0=$0|0;$1=$1|0;return HEAP32[1856+(($0>>>24^$1&255)<<2)>>2]^$0<<8|0}function _get8_packet($0){$0=$0|0;var $1=0;$1=_get8_packet_raw($0)|0;HEAP32[$0+1384>>2]=0;return $1|0}function _stb_vorbis_close($0){$0=$0|0;if($0|0){_vorbis_deinit($0);_setup_free($0,$0)}return}function _setup_free($0,$1){$0=$0|0;$1=$1|0;if(!(HEAP32[$0+68>>2]|0))_free($1);return}function _stb_vorbis_js_close($0){$0=$0|0;_stb_vorbis_close(HEAP32[$0>>2]|0);_free($0);return}function _stb_vorbis_js_open(){var $0=0;$0=_malloc(4)|0;HEAP32[$0>>2]=0;return $0|0}function _flush_packet($0){$0=$0|0;do{}while((_get8_packet_raw($0)|0)!=-1);return}function _vorbis_validate($0){$0=$0|0;return(_memcmp($0,1538,6)|0)==0|0}function _error($0,$1){$0=$0|0;$1=$1|0;HEAP32[$0+88>>2]=$1;return}function _vorbis_alloc($0){$0=$0|0;return _setup_malloc($0,1500)|0}function _ldexp($0,$1){$0=+$0;$1=$1|0;return+ +_scalbn($0,$1)}function b0(p0,p1){p0=p0|0;p1=p1|0;abort(0);return 0}function setTempRet0(value){value=value|0;tempRet0=value}function stackRestore(top){top=top|0;STACKTOP=top}function _square($0){$0=+$0;return+($0*$0)}function getTempRet0(){return tempRet0|0}function stackSave(){return STACKTOP|0}function ___errno_location(){return 3376}var FUNCTION_TABLE_iii=[b0,_point_compare,_uint32_compare,b0];return{___errno_location:___errno_location,_bitshift64Shl:_bitshift64Shl,_emscripten_replace_memory:_emscripten_replace_memory,_free:_free,_malloc:_malloc,_memcpy:_memcpy,_memset:_memset,_sbrk:_sbrk,_stb_vorbis_js_channels:_stb_vorbis_js_channels,_stb_vorbis_js_close:_stb_vorbis_js_close,_stb_vorbis_js_decode:_stb_vorbis_js_decode,_stb_vorbis_js_open:_stb_vorbis_js_open,_stb_vorbis_js_sample_rate:_stb_vorbis_js_sample_rate,dynCall_iii:dynCall_iii,establishStackSpace:establishStackSpace,getTempRet0:getTempRet0,runPostSets:runPostSets,setTempRet0:setTempRet0,setThrew:setThrew,stackAlloc:stackAlloc,stackRestore:stackRestore,stackSave:stackSave}}(Module.asmGlobalArg,Module.asmLibraryArg,buffer);var ___errno_location=Module["___errno_location"]=asm["___errno_location"];var _bitshift64Shl=Module["_bitshift64Shl"]=asm["_bitshift64Shl"];var _emscripten_replace_memory=Module["_emscripten_replace_memory"]=asm["_emscripten_replace_memory"];var _free=Module["_free"]=asm["_free"];var _malloc=Module["_malloc"]=asm["_malloc"];var _memcpy=Module["_memcpy"]=asm["_memcpy"];var _memset=Module["_memset"]=asm["_memset"];var _sbrk=Module["_sbrk"]=asm["_sbrk"];var _stb_vorbis_js_channels=Module["_stb_vorbis_js_channels"]=asm["_stb_vorbis_js_channels"];var _stb_vorbis_js_close=Module["_stb_vorbis_js_close"]=asm["_stb_vorbis_js_close"];var _stb_vorbis_js_decode=Module["_stb_vorbis_js_decode"]=asm["_stb_vorbis_js_decode"];var _stb_vorbis_js_open=Module["_stb_vorbis_js_open"]=asm["_stb_vorbis_js_open"];var _stb_vorbis_js_sample_rate=Module["_stb_vorbis_js_sample_rate"]=asm["_stb_vorbis_js_sample_rate"];var establishStackSpace=Module["establishStackSpace"]=asm["establishStackSpace"];var getTempRet0=Module["getTempRet0"]=asm["getTempRet0"];var runPostSets=Module["runPostSets"]=asm["runPostSets"];var setTempRet0=Module["setTempRet0"]=asm["setTempRet0"];var setThrew=Module["setThrew"]=asm["setThrew"];var stackAlloc=Module["stackAlloc"]=asm["stackAlloc"];var stackRestore=Module["stackRestore"]=asm["stackRestore"];var stackSave=Module["stackSave"]=asm["stackSave"];var dynCall_iii=Module["dynCall_iii"]=asm["dynCall_iii"];Module["asm"]=asm;if(memoryInitializer){if(!isDataURI(memoryInitializer)){memoryInitializer=locateFile(memoryInitializer)}if(ENVIRONMENT_IS_NODE||ENVIRONMENT_IS_SHELL){var data=Module["readBinary"](memoryInitializer);HEAPU8.set(data,GLOBAL_BASE)}else{addRunDependency("memory initializer");var applyMemoryInitializer=function(data){if(data.byteLength)data=new Uint8Array(data);HEAPU8.set(data,GLOBAL_BASE);if(Module["memoryInitializerRequest"])delete Module["memoryInitializerRequest"].response;removeRunDependency("memory initializer")};function doBrowserLoad(){Module["readAsync"](memoryInitializer,applyMemoryInitializer,function(){throw"could not load memory initializer "+memoryInitializer})}var memoryInitializerBytes=tryParseAsDataURI(memoryInitializer);if(memoryInitializerBytes){applyMemoryInitializer(memoryInitializerBytes.buffer)}else if(Module["memoryInitializerRequest"]){function useRequest(){var request=Module["memoryInitializerRequest"];var response=request.response;if(request.status!==200&&request.status!==0){var data=tryParseAsDataURI(Module["memoryInitializerRequestURL"]);if(data){response=data.buffer}else{console.warn("a problem seems to have happened with Module.memoryInitializerRequest, status: "+request.status+", retrying "+memoryInitializer);doBrowserLoad();return}}applyMemoryInitializer(response)}if(Module["memoryInitializerRequest"].response){setTimeout(useRequest,0)}else{Module["memoryInitializerRequest"].addEventListener("load",useRequest)}}else{doBrowserLoad()}}}function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var initialStackTop;var calledMain=false;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};function run(args){args=args||Module["arguments"];if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(function(){setTimeout(function(){Module["setStatus"]("")},1);doRun()},1)}else{doRun()}}Module["run"]=run;function exit(status,implicit){if(implicit&&Module["noExitRuntime"]&&status===0){return}if(Module["noExitRuntime"]){}else{ABORT=true;EXITSTATUS=status;STACKTOP=initialStackTop;exitRuntime();if(Module["onExit"])Module["onExit"](status)}Module["quit"](status,new ExitStatus(status))}var abortDecorators=[];function abort(what){if(Module["onAbort"]){Module["onAbort"](what)}if(what!==undefined){out(what);err(what);what=JSON.stringify(what)}else{what=""}ABORT=true;EXITSTATUS=1;throw"abort("+what+"). Build with -s ASSERTIONS=1 for more info."}Module["abort"]=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}Module["noExitRuntime"]=true;run();(function(Module){var initializeP=new Promise(function(resolve){if(typeof useWasm!=="undefined"){Module.onRuntimeInitialized=function(){var fs={};fs.open=Module.cwrap("stb_vorbis_js_open","number",[]);fs.close=Module.cwrap("stb_vorbis_js_close","void",["number"]);fs.channels=Module.cwrap("stb_vorbis_js_channels","number",["number"]);fs.sampleRate=Module.cwrap("stb_vorbis_js_sample_rate","number",["number"]);fs.decode=Module.cwrap("stb_vorbis_js_decode","number",["number","number","number","number","number"]);resolve(fs)};return}var fs={};fs.open=Module["_stb_vorbis_js_open"];fs.close=Module["_stb_vorbis_js_close"];fs.channels=Module["_stb_vorbis_js_channels"];fs.sampleRate=Module["_stb_vorbis_js_sample_rate"];fs.decode=Module["_stb_vorbis_js_decode"];resolve(fs)});function arrayBufferToHeap(buffer,byteOffset,byteLength){var ptr=Module._malloc(byteLength);var heapBytes=new Uint8Array(Module.HEAPU8.buffer,ptr,byteLength);heapBytes.set(new Uint8Array(buffer,byteOffset,byteLength));return heapBytes}function ptrToInt32(ptr){var a=new Int32Array(Module.HEAPU8.buffer,ptr,1);return a[0]}function ptrToFloat32(ptr){var a=new Float32Array(Module.HEAPU8.buffer,ptr,1);return a[0]}function ptrToInt32s(ptr,length){var buf=new ArrayBuffer(length*Int32Array.BYTES_PER_ELEMENT);var copied=new Int32Array(buf);copied.set(new Int32Array(Module.HEAPU8.buffer,ptr,length));return copied}function ptrToFloat32s(ptr,length){var buf=new ArrayBuffer(length*Float32Array.BYTES_PER_ELEMENT);var copied=new Float32Array(buf);copied.set(new Float32Array(Module.HEAPU8.buffer,ptr,length));return copied}function concatArrays(arr1,arr2){if(!arr1){arr1=new ArrayBuffer}if(!arr2){arr2=new ArrayBuffer}var newArr=new Uint8Array(arr1.byteLength+arr2.byteLength);if(arr1 instanceof ArrayBuffer){newArr.set(new Uint8Array(arr1),0)}else if(arr1 instanceof Uint8Array){newArr.set(arr1,0)}else{throw"not reached"}if(arr2 instanceof ArrayBuffer){newArr.set(new Uint8Array(arr2),arr1.byteLength)}else if(arr2 instanceof Uint8Array){newArr.set(arr2,arr1.byteLength)}else{throw"not reached"}return newArr}var sessions={};self.addEventListener("message",function(event){initializeP.then(function(funcs){var statePtr=null;if(event.data.id in sessions){statePtr=sessions[event.data.id].state}else{statePtr=funcs.open();sessions[event.data.id]={state:statePtr,input:null}}sessions[event.data.id].input=concatArrays(sessions[event.data.id].input,event.data.buf);while(sessions[event.data.id].input.byteLength>0){var input=sessions[event.data.id].input;var copiedInput=null;var chunkLength=Math.min(65536,input.byteLength);if(input instanceof ArrayBuffer){copiedInput=arrayBufferToHeap(input,0,chunkLength)}else if(input instanceof Uint8Array){copiedInput=arrayBufferToHeap(input.buffer,input.byteOffset,chunkLength)}var outputPtr=Module._malloc(4);var readPtr=Module._malloc(4);var length=funcs.decode(statePtr,copiedInput.byteOffset,copiedInput.byteLength,outputPtr,readPtr);Module._free(copiedInput.byteOffset);var read=ptrToInt32(readPtr);Module._free(readPtr);sessions[event.data.id].input=input.slice(read);var result={id:event.data.id,data:null,sampleRate:0,eof:false,error:null};if(length<0){result.error="stbvorbis decode failed: "+length;postMessage(result);funcs.close(statePtr);delete sessions[event.data.id];Module._free(outputPtr);return}var channels=funcs.channels(statePtr);if(channels>0){var dataPtrs=ptrToInt32s(ptrToInt32(outputPtr),channels);result.data=new Array(dataPtrs.length);for(var i=0;i<dataPtrs.length;i++){result.data[i]=ptrToFloat32s(dataPtrs[i],length);Module._free(dataPtrs[i])}}Module._free(ptrToInt32(outputPtr));Module._free(outputPtr);if(read===0){break}if(result.sampleRate===0){result.sampleRate=funcs.sampleRate(statePtr)}postMessage(result,result.data.map(function(array){return array.buffer}))}if(event.data.eof){var len=sessions[event.data.id].input.length;if(len){console.warn("not all the input data was decoded. remaining: "+len+"[bytes]")}var result={id:event.data.id,data:null,sampleRate:0,eof:true,error:null};postMessage(result);funcs.close(statePtr);delete sessions[event.data.id]}})})})(Module);


/* === stbvorbis_stream.js === */
var stbvorbis=typeof stbvorbis!=="undefined"?stbvorbis:{};(function(){function decodeWorker(){var Module=typeof Module!=="undefined"?Module:{};var useWasm=true;Module["wasmBinary"]=Uint8Array.from(atob("AGFzbQEAAAABpQEYYAJ/fwF/YAF/AGAAAX9gBH9/f38AYAAAYAN/f38Bf2ABfwF/YAJ/fwBgBn9/f39/fwF/YAR/f39/AX9gBX9/f39/AX9gB39/f39/f38Bf2AGf39/f39/AGAIf39/f39/f38Bf2AFf39/f38AYAd/f39/f39/AGADf39/AGABfwF9YAF9AX1gAnx/AXxgAnx/AX9gA3x8fwF8YAJ8fAF8YAF8AXwCngIPA2VudgZtZW1vcnkCAIACA2VudgV0YWJsZQFwAQQEA2Vudgl0YWJsZUJhc2UDfwADZW52DkRZTkFNSUNUT1BfUFRSA38AA2VudghTVEFDS1RPUAN/AANlbnYJU1RBQ0tfTUFYA38ABmdsb2JhbAhJbmZpbml0eQN8AANlbnYFYWJvcnQAAQNlbnYNZW5sYXJnZU1lbW9yeQACA2Vudg5nZXRUb3RhbE1lbW9yeQACA2VudhdhYm9ydE9uQ2Fubm90R3Jvd01lbW9yeQACA2Vudg5fX19hc3NlcnRfZmFpbAADA2VudgtfX19zZXRFcnJObwABA2VudgZfYWJvcnQABANlbnYWX2Vtc2NyaXB0ZW5fbWVtY3B5X2JpZwAFA3d2BgYCAQcHAQIBAQcBCAcFAAkGCQoHBgYGBgEFBgIBBgYKAAgLAAYGBgYGBgYBAAoMDAMGBQANCAoJAAwODA8OAQAGBgcEABAJEAERAAADBQwAAAMHBxIGAQAABwIFEwMOBw8HBgYQFAoVExYXFxcXFgQFBQYFAAYkB38BIwELfwEjAgt/ASMDC38BQQALfwFBAAt8ASMEC38BQQALB9MCFRBfX2dyb3dXYXNtTWVtb3J5AAgRX19fZXJybm9fbG9jYXRpb24AYwVfZnJlZQBfB19tYWxsb2MAXgdfbWVtY3B5AHkHX21lbXNldAB6BV9zYnJrAHsXX3N0Yl92b3JiaXNfanNfY2hhbm5lbHMAJhRfc3RiX3ZvcmJpc19qc19jbG9zZQAlFV9zdGJfdm9yYmlzX2pzX2RlY29kZQAoE19zdGJfdm9yYmlzX2pzX29wZW4AJBpfc3RiX3ZvcmJpc19qc19zYW1wbGVfcmF0ZQAnC2R5bkNhbGxfaWlpAHwTZXN0YWJsaXNoU3RhY2tTcGFjZQAMC2dldFRlbXBSZXQwAA8LcnVuUG9zdFNldHMAeAtzZXRUZW1wUmV0MAAOCHNldFRocmV3AA0Kc3RhY2tBbGxvYwAJDHN0YWNrUmVzdG9yZQALCXN0YWNrU2F2ZQAKCQoBACMACwR9VFl9Csb2A3YGACAAQAALGwEBfyMGIQEjBiAAaiQGIwZBD2pBcHEkBiABCwQAIwYLBgAgACQGCwoAIAAkBiABJAcLEAAjCEUEQCAAJAggASQJCwsGACAAJAsLBAAjCwsRACAABEAgABARIAAgABASCwvvBwEKfyAAQYADaiEHIAcoAgAhBQJAIAUEQCAAQfwBaiEEIAQoAgAhASABQQBKBEAgAEHwAGohCANAIAUgAkEYbGpBEGohCSAJKAIAIQEgAQRAIAgoAgAhAyAFIAJBGGxqQQ1qIQogCi0AACEGIAZB/wFxIQYgAyAGQbAQbGpBBGohAyADKAIAIQMgA0EASgRAQQAhAwNAIAEgA0ECdGohASABKAIAIQEgACABEBIgA0EBaiEDIAgoAgAhASAKLQAAIQYgBkH/AXEhBiABIAZBsBBsakEEaiEBIAEoAgAhBiAJKAIAIQEgAyAGSA0ACwsgACABEBILIAUgAkEYbGpBFGohASABKAIAIQEgACABEBIgAkEBaiECIAQoAgAhASACIAFODQMgBygCACEFDAAACwALCwsgAEHwAGohAyADKAIAIQEgAQRAIABB7ABqIQUgBSgCACECIAJBAEoEQEEAIQIDQAJAIAEgAkGwEGxqQQhqIQQgBCgCACEEIAAgBBASIAEgAkGwEGxqQRxqIQQgBCgCACEEIAAgBBASIAEgAkGwEGxqQSBqIQQgBCgCACEEIAAgBBASIAEgAkGwEGxqQaQQaiEEIAQoAgAhBCAAIAQQEiABIAJBsBBsakGoEGohASABKAIAIQEgAUUhBCABQXxqIQFBACABIAQbIQEgACABEBIgAkEBaiECIAUoAgAhASACIAFODQAgAygCACEBDAELCyADKAIAIQELIAAgARASCyAAQfgBaiEBIAEoAgAhASAAIAEQEiAHKAIAIQEgACABEBIgAEGIA2ohAyADKAIAIQEgAQRAIABBhANqIQUgBSgCACECIAJBAEoEQEEAIQIDQCABIAJBKGxqQQRqIQEgASgCACEBIAAgARASIAJBAWohAiAFKAIAIQcgAygCACEBIAIgB0gNAAsLIAAgARASCyAAQQRqIQIgAigCACEBIAFBAEoEQEEAIQEDQCAAQZQGaiABQQJ0aiEDIAMoAgAhAyAAIAMQEiAAQZQHaiABQQJ0aiEDIAMoAgAhAyAAIAMQEiAAQdgHaiABQQJ0aiEDIAMoAgAhAyAAIAMQEiABQQFqIQEgAigCACEDIAEgA0ghAyABQRBJIQUgBSADcQ0ACwtBACEBA0AgAEGgCGogAUECdGohAiACKAIAIQIgACACEBIgAEGoCGogAUECdGohAiACKAIAIQIgACACEBIgAEGwCGogAUECdGohAiACKAIAIQIgACACEBIgAEG4CGogAUECdGohAiACKAIAIQIgACACEBIgAEHACGogAUECdGohAiACKAIAIQIgACACEBIgAUEBaiEBIAFBAkcNAAsLGwAgAEHEAGohACAAKAIAIQAgAEUEQCABEF8LC3wBAX8gAEHUB2ohASABQQA2AgAgAEGAC2ohASABQQA2AgAgAEH4CmohASABQQA2AgAgAEGcCGohASABQQA2AgAgAEHVCmohASABQQA6AAAgAEH8CmohASABQQA2AgAgAEHUC2ohASABQQA2AgAgAEHYC2ohACAAQQA2AgAL8AQBB38jBiELIwZBEGokBiALQQhqIQcgC0EEaiEKIAshCCAAQSRqIQYgBiwAACEGAn8gBgR/IABBgAtqIQYgBigCACEGIAZBf0oEQCAFQQA2AgAgACABIAIQFgwCCyAAQRRqIQYgBiABNgIAIAEgAmohAiAAQRxqIQkgCSACNgIAIABB2ABqIQIgAkEANgIAIABBABAXIQkgCUUEQCAFQQA2AgBBAAwCCyAAIAcgCCAKEBghCSAJBEAgBygCACECIAgoAgAhCSAKKAIAIQggACACIAkgCBAaIQogByAKNgIAIABBBGohAiACKAIAIQggCEEASgRAQQAhAgNAIABBlAZqIAJBAnRqIQcgBygCACEHIAcgCUECdGohByAAQdQGaiACQQJ0aiEMIAwgBzYCACACQQFqIQIgAiAISA0ACwsgAwRAIAMgCDYCAAsgBSAKNgIAIABB1AZqIQAgBCAANgIAIAYoAgAhACAAIAFrDAILAkACQAJAAkACQCACKAIAIgNBIGsOBAECAgACCyACQQA2AgAgAEHUAGohAiAAEBkhAwJAIANBf0cEQANAIAIoAgAhAyADDQIgABAZIQMgA0F/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ACECIABBmAhqIQYgBigCACEHIAUgA2shCSAJIAdqIQkgAiAJSSEJIAIgB0khDSACIAdrIQJBACACIA0bIQIgAiADaiECIAIgBUohByAFIAIgBxshAiAJBEAgASACNgIAIAYoAgAhACAAIAJqIQAgBiAANgIAQQEMBgsLCyAAQfQKaiECIAIoAgAhAiADIB9rIQYgBiACaiEGIABBmAhqIQIgAiAGNgIAIAhBATYCAAwBBSAAQZgIaiECIAYNAQsMAQsgBCADayEDIAIoAgAhBCADIARqIQMgAiADNgIACyATKAIAIQIgAgRAIABByABqIQIgAigCACECIABB0ABqIQAgACgCACEAIAIgAEcEQEHTE0HEE0HkGkHnFBAECwsgASAFNgIAQQELIQAgHCQGIAALqAIBBX8gAEHoCmohBSAFKAIAIQICQCACQQBIBEBBACEABSACIAFIBEAgAUEYSgRAIABBGBAsIQIgAUFoaiEBIAAgARAsIQAgAEEYdCEAIAAgAmohACAADwsgAkUEQCAAQeQKaiECIAJBADYCAAsgAEHkCmohAwJAAkACQANAIAAQLiECIAJBf0YNASAFKAIAIQQgAiAEdCECIAMoAgAhBiAGIAJqIQIgAyACNgIAIAUgBEEIaiICNgIAIAIgAUgNAAwCAAsACyAFQX82AgBBACEADAQLIARBeEgEQEEAIQAMBAsLCyAAQeQKaiEEIAQoAgAhA0EBIAF0IQAgAEF/aiEAIAMgAHEhACADIAF2IQMgBCADNgIAIAIgAWshASAFIAE2AgALCyAAC40CAAJAIABBAEgEf0EABSAAQYCAAUgEQCAAQRBIBEAgAEGACGohACAALAAAIQAMAwsgAEGABEgEQCAAQQV2IQAgAEGACGohACAALAAAIQAgAEEFaiEABSAAQQp2IQAgAEGACGohACAALAAAIQAgAEEKaiEACwwCCyAAQYCAgAhIBH8gAEGAgCBIBH8gAEEPdiEAIABBgAhqIQAgACwAACEAIABBD2oFIABBFHYhACAAQYAIaiEAIAAsAAAhACAAQRRqCwUgAEGAgICAAkgEfyAAQRl2IQAgAEGACGohACAALAAAIQAgAEEZagUgAEEediEAIABBgAhqIQAgACwAACEAIABBHmoLCwshAAsgAAuiAQEDfyAAQdQKaiECIAIsAAAhAQJAAkAgAQ0AIABB3ApqIQEgASgCACEBIAEEQEF/IQMFIAAQLyEBIAEEQCACLAAAIQEgAQ0CQaEUQcQTQfYLQbUUEAQFQX8hAwsLDAELIAFBf2pBGHRBGHUhASACIAE6AAAgAEHsCmohASABKAIAIQIgAkEBaiECIAEgAjYCACAAEDAhACAAQf8BcSEDCyADC6wCAQd/IABB3ApqIQIgAigCACEBAkAgAUUEQCAAQdgKaiEEIAQoAgAhASABQX9GBEAgAEHQCGohASABKAIAIQEgAUF/aiEBIABB4ApqIQMgAyABNgIAIAAQMSEBIAFFBEAgAkEBNgIADAMLIABB0wpqIQEgASwAACEBIAFBAXEhASABBH8gBCgCAAUgAEEgEBUMAwshAQsgAUEBaiEHIAQgBzYCACAAQdQIaiABaiEDIAMsAAAhBiAGQf8BcSEDIAZBf0cEQCACQQE2AgAgAEHgCmohAiACIAE2AgALIABB0AhqIQEgASgCACEBIAcgAU4EQCAEQX82AgALIABB1ApqIQAgACwAACEBIAEEQEHFFEHEE0HoC0HaFBAEBSAAIAY6AAAgAyEFCwsLIAULUQEDfyAAQRRqIQMgAygCACEBIABBHGohAiACKAIAIQIgASACSQR/IAFBAWohACADIAA2AgAgASwAAAUgAEHUAGohACAAQQE2AgBBAAshACAACyABAX8gABAyIQEgAQR/IAAQMwUgAEEeEBVBAAshACAAC2ABAX8gABAwIQEgAUH/AXFBzwBGBEAgABAwIQEgAUH/AXFB5wBGBEAgABAwIQEgAUH/AXFB5wBGBEAgABAwIQAgAEH/AXFB0wBGIQAFQQAhAAsFQQAhAAsFQQAhAAsgAAvZAwEGfyAAEDAhAQJ/IAFB/wFxBH8gAEEfEBVBAAUgABAwIQEgAEHTCmohAiACIAE6AAAgABAjIQUgABAjIQIgABAjGiAAECMhASAAQcwIaiEDIAMgATYCACAAECMaIAAQMCEBIAFB/wFxIQEgAEHQCGohAyADIAE2AgAgAEHUCGohBCAAIAQgARAiIQEgAUUEQCAAQQoQFUEADAILIABB8ApqIQQgBEF+NgIAIAIgBXEhAQJAIAFBf0cEQCADKAIAIQEgAUEASgRAA0ACQCABQX9qIQIgAEHUCGogAmohBiAGLAAAIQYgBkF/Rw0AIAFBAUwNBCACIQEMAQsLIAQgAjYCACAAQfQKaiEBIAEgBTYCAAsLCyAAQdUKaiEBIAEsAAAhASABBEAgAygCACEDIANBAEoEf0EAIQJBACEBA0AgAEHUCGogAWohBCAELQAAIQQgBEH/AXEhBCACIARqIQIgAUEBaiEBIAEgA0gNAAsgAkEbagVBGwshASAAQShqIQIgAigCACECIAEgA2ohASABIAJqIQEgAEEsaiEDIAMgAjYCACAAQTBqIQIgAiABNgIAIABBNGohASABIAU2AgALIABB2ApqIQAgAEEANgIAQQELCyEAIAALowEBB38gAEHoCmohAyADKAIAIQECQCABQRlIBEAgAEHkCmohBCABRQRAIARBADYCAAsgAEHUCmohBSAAQdwKaiEGA0AgBigCACEBIAEEQCAFLAAAIQEgAUUNAwsgABAuIQIgAkF/Rg0CIAMoAgAhASACIAF0IQIgBCgCACEHIAcgAmohAiAEIAI2AgAgAUEIaiECIAMgAjYCACABQRFIDQALCwsLrQUBCX8gABA0IAFBIGohAiACKAIAIQUCQAJAIAVFIgNFDQAgAUGkEGohAiACKAIAIQIgAg0AQX8hAQwBCyABQQRqIQIgAigCACECAkACQCACQQhKBEAgAUGkEGohAyADKAIAIQMgAw0BBSADDQELDAELIABB5ApqIQggCCgCACEJIAkQOiEHIAFBrBBqIQIgAigCACECIAJBAUoEQCABQaQQaigCACEKQQAhAwNAIAJBAXYhBSAFIANqIQQgCiAEQQJ0aiEGIAYoAgAhBiAGIAdLIQYgAiAFayECIAMgBCAGGyEDIAUgAiAGGyECIAJBAUoNAAsFQQAhAwsgAUEXaiECIAIsAAAhAiACRQRAIAFBqBBqIQIgAigCACECIAIgA0ECdGohAiACKAIAIQMLIAFBCGohASABKAIAIQEgASADaiEBIAEtAAAhASABQf8BcSEBIABB6ApqIQIgAigCACEAIAAgAUgEf0EAIQBBfwUgACABayEAIAkgAXYhASAIIAE2AgAgAwshASACIAA2AgAMAQsgAUEXaiEDIAMsAAAhAyADBEBBgRVBxBNB6gxBjBUQBAsCQCACQQBKBEAgASgCCCEIIABB5ApqIQlBACEBA0ACQCAIIAFqIQMgAywAACEEIARB/wFxIQMgBEF/RwRAIAUgAUECdGoh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IwZBEGokBiACIQECfCAAvUIgiKdB/////wdxIgNB/MOk/wNJBHwgA0GewZryA0kEfEQAAAAAAADwPwUgAEQAAAAAAAAAABByCwUgACAAoSADQf//v/8HSw0BGgJAAkACQAJAIAAgARBuQQNxDgMAAQIDCyABKwMAIAErAwgQcgwECyABKwMAIAErAwhBARBwmgwDCyABKwMAIAErAwgQcpoMAgsgASsDACABKwMIQQEQcAsLIQAgAiQGIAALywEBA38jBiECIwZBEGokBiACIQECQCAAvUIgiKdB/////wdxIgNB/MOk/wNJBEAgA0GAgMDyA08EQCAARAAAAAAAAAAAQQAQcCEACwUgA0H//7//B0sEQCAAIAChIQAMAgsCQAJAAkACQAJAIAAgARBuQQNxDgMAAQIDCyABKwMAIAErAwhBARBwIQAMBQsgASsDACABKwMIEHIhAAwECyABKwMAIAErAwhBARBwmiEADAMLIAErAwAgASsDCBBymiEACwsLIAIkBiAAC5sDAwJ/AX4CfCAAvSIDQj+IpyEBAnwCfwJAIANCIIinQf////8HcSICQarGmIQESwR8IANC////////////AINCgICAgICAgPj/AFYEQCAADwsgAETvOfr+Qi6GQGQEQCAARAAAAAAAAOB/og8FIABE0rx63SsjhsBjIABEUTAt1RBJh8BjcUUNAkQAAAAAAAAAACIADwsABSACQcLc2P4DSwRAIAJBscXC/wNLDQIgAUEBcyABawwDCyACQYCAwPEDSwR8QQAhASAABSAARAAAAAAAAPA/oA8LCwwCCyAARP6CK2VHFfc/oiABQQN0QYATaisDAKCqCyEBIAAgAbciBEQAAOD+Qi7mP6KhIgAgBER2PHk17znqPaIiBaELIQQgACAEIAQgBCAEoiIAIAAgACAAIABE0KS+cmk3Zj6iRPFr0sVBvbu+oKJELN4lr2pWET+gokSTvb4WbMFmv6CiRD5VVVVVVcU/oKKhIgCiRAAAAAAAAABAIAChoyAFoaBEAAAAAAAA8D+gIQAgAUUEQCAADwsgACABEGULnwMDAn8BfgV8IAC9IgNCIIinIQECfyADQgBTIgIgAUGAgMAASXIEfyADQv///////////wCDQgBRBEBEAAAAAAAA8L8gACAAoqMPCyACRQRAIABEAAAAAAAAUEOi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mgDjqR0AXmGRAAgb5gCFmWUAoBRfAI1AaACA2P8AJ3NNAAYGMQDKVhUAyahzAHviYABrjMAAQcMSC11A+yH5PwAAAAAtRHQ+AAAAgJhG+DwAAABgUcx4OwAAAICDG/A5AAAAQCAlejgAAACAIoLjNgAAAAAd82k1AAAAAAAA4D8AAAAAAADgvwAAAAAAAPA/AAAAAAAA+D8AQagTCwgG0M9D6/1MPgBBuxMLigZAA7jiP09nZ1MuL3N0Yl92b3JiaXMuYwBmLT5hbGxvYy5hbGxvY19idWZmZXJfbGVuZ3RoX2luX2J5dGVzID09IGYtPnRlbXBfb2Zmc2V0AHZvcmJpc19kZWNvZGVfaW5pdGlhbABmLT5ieXRlc19pbl9zZWcgPiAwAGdldDhfcGFja2V0X3JhdwBmLT5ieXRlc19pbl9zZWcgPT0gMABuZXh0X3NlZ21lbnQAdm9yYmlzX2RlY29kZV9wYWNrZXRfcmVzdAAhYy0+c3BhcnNlAGNvZGVib29rX2RlY29kZV9zY2FsYXJfcmF3ACFjLT5zcGFyc2UgfHwgeiA8IGMtPnNvcnRlZF9lbnRyaWVzAGNvZGVib29rX2RlY29kZV9kZWludGVybGVhdmVfcmVwZWF0AHogPCBjLT5zb3J0ZWRfZW50cmllcwBjb2RlYm9va19kZWNvZGVfc3RhcnQAKG4gJiAzKSA9PSAwAGltZGN0X3N0ZXAzX2l0ZXIwX2xvb3AAMABnZXRfd2luZG93AGYtPnRlbXBfb2Zmc2V0ID09IGYtPmFsbG9jLmFsbG9jX2J1ZmZlcl9sZW5ndGhfaW5fYnl0ZXMAc3RhcnRfZGVjb2RlcgB2b3JiaXNjLT5zb3J0ZWRfZW50cmllcyA9PSAwAGNvbXB1dGVfY29kZXdvcmRzAHogPj0gMCAmJiB6IDwgMzIAbGVuW2ldID49IDAgJiYgbGVuW2ldIDwgMzIAYXZhaWxhYmxlW3ldID09IDAAayA9PSBjLT5zb3J0ZWRfZW50cmllcwBjb21wdXRlX3NvcnRlZF9odWZmbWFuAGMtPnNvcnRlZF9jb2Rld29yZHNbeF0gPT0gY29kZQBsZW4gIT0gTk9fQ09ERQBpbmNsdWRlX2luX3NvcnQAcG93KChmbG9hdCkgcisxLCBkaW0pID4gZW50cmllcwBsb29rdXAxX3ZhbHVlcwAoaW50KSBmbG9vcihwb3coKGZsb2F0KSByLCBkaW0pKSA8PSBlbnRyaWVzAOoPBG5hbWUB4g9+AAVhYm9ydAENZW5sYXJnZU1lbW9yeQIOZ2V0VG90YWxNZW1vcnkDF2Fib3J0T25DYW5ub3RHcm93TWVtb3J5BA5fX19hc3NlcnRfZmFpbAULX19fc2V0RXJyTm8GBl9hYm9ydAcWX2Vtc2NyaXB0ZW5fbWVtY3B5X2JpZwgQX19ncm93V2FzbU1lbW9yeQkKc3RhY2tBbGxvYwoJc3RhY2tTYXZlCwxzdGFja1Jlc3RvcmUME2VzdGFibGlzaFN0YWNrU3BhY2UNCHNldFRocmV3DgtzZXRUZW1wUmV0MA8LZ2V0VGVtcFJldDAQEV9zdGJfdm9yYmlzX2Nsb3NlEQ5fdm9yYmlzX2RlaW5pdBILX3NldHVwX2ZyZWUTGl9zdGJfdm9yYmlzX2ZsdXNoX3B1c2hkYXRhFCFfc3RiX3ZvcmJpc19kZWNvZGVfZnJhbWVfcHVzaGRhdGEVBl9lcnJvchYgX3ZvcmJpc19zZWFyY2hfZm9yX3BhZ2VfcHVzaGRhdGEXGF9pc193aG9sZV9wYWNrZXRfcHJlc2VudBgVX3ZvcmJpc19kZWNvZGVfcGFja2V0GQxfZ2V0OF9wYWNrZXQaFF92b3JiaXNfZmluaXNoX2ZyYW1lGxlfc3RiX3ZvcmJpc19vcGVuX3B1c2hkYXRhHAxfdm9yYmlzX2luaXQdDl9zdGFydF9kZWNvZGVyHg1fdm9yYmlzX2FsbG9jHxtfc3RiX3ZvcmJpc19nZXRfZmlsZV9vZmZzZXQgE19tYXliZV9zdGFydF9wYWNrZXQhDV9mbHVzaF9wYWNrZXQiBV9nZXRuIwZfZ2V0MzIkE19zdGJfdm9yYmlzX2pzX29wZW4lFF9zdGJfdm9yYmlzX2pzX2Nsb3NlJhdfc3RiX3ZvcmJpc19qc19jaGFubmVscycaX3N0Yl92b3JiaXNfanNfc2FtcGxlX3JhdGUoFV9zdGJfdm9yYmlzX2pzX2RlY29kZSkNX2NyYzMyX3VwZGF0ZSoWX3ZvcmJpc19kZWNvZGVfaW5pdGlhbCsaX3ZvcmJpc19kZWNvZGVfcGFja2V0X3Jlc3QsCV9nZXRfYml0cy0FX2lsb2cuEF9nZXQ4X3BhY2tldF9yYXcvDV9uZXh0X3NlZ21lbnQwBV9nZXQ4MQtfc3RhcnRfcGFnZTIQX2NhcHR1cmVfcGF0dGVybjMdX3N0YXJ0X3BhZ2Vfbm9fY2FwdHVyZXBhdHRlcm40DV9wcmVwX2h1ZmZtYW41G19jb2RlYm9va19kZWNvZGVfc2NhbGFyX3JhdzYOX3ByZWRpY3RfcG9pbnQ3D19kZWNvZGVfcmVzaWR1ZTgJX2RvX2Zsb29yOQ1faW52ZXJzZV9tZGN0OgxfYml0X3JldmVyc2U7EV9tYWtlX2Jsb2NrX2FycmF5PBJfc2V0dXBfdGVtcF9tYWxsb2M9JF9jb2RlYm9va19kZWNvZGVfZGVpbnRlcmxlYXZlX3JlcGVhdD4PX3Jlc2lkdWVfZGVjb2RlPxVfY29kZWJvb2tfZGVjb2RlX3N0ZXBAEF9jb2RlYm9va19kZWNvZGVBFl9jb2RlYm9va19kZWNvZGVfc3RhcnRCCl9kcmF3X2xpbmVDF19pbWRjdF9zdGVwM19pdGVyMF9sb29wRBlfaW1kY3Rfc3RlcDNfaW5uZXJfcl9sb29wRRlfaW1kY3Rfc3RlcDNfaW5uZXJfc19sb29wRh9faW1kY3Rfc3RlcDNfaW5uZXJfc19sb29wX2xkNjU0RwhfaXRlcl81NEgLX2dldF93aW5kb3dJEF92b3JiaXNfdmFsaWRhdGVKDV9zdGFydF9wYWNrZXRLBV9za2lwTAtfY3JjMzJfaW5pdE0NX3NldHVwX21hbGxvY04QX3NldHVwX3RlbXBfZnJlZU8SX2NvbXB1dGVfY29kZXdvcmRzUBdfY29tcHV0ZV9zb3J0ZWRfaHVmZm1hblEcX2NvbXB1dGVfYWNjZWxlcmF0ZWRfaHVmZm1hblIPX2Zsb2F0MzJfdW5wYWNrUw9fbG9va3VwMV92YWx1ZXNUDl9wb2ludF9jb21wYXJlVQpfbmVpZ2hib3JzVg9faW5pdF9ibG9ja3NpemVXCl9hZGRfZW50cnlYEF9pbmNsdWRlX2luX3NvcnRZD191aW50MzJfY29tcGFyZVoYX2NvbXB1dGVfdHdpZGRsZV9mYWN0b3JzWw9fY29tcHV0ZV93aW5kb3dcE19jb21wdXRlX2JpdHJldmVyc2VdB19zcXVhcmVeB19tYWxsb2NfBV9mcmVlYAhfcmVhbGxvY2ESX3RyeV9yZWFsbG9jX2NodW5rYg5fZGlzcG9zZV9jaHVua2MRX19fZXJybm9fbG9jYXRpb25kB19tZW1jbXBlB19zY2FsYm5mBl9xc29ydGcFX3NpZnRoBF9zaHJpCF90cmlua2xlagRfc2hsawVfcG50emwIX2FfY3R6X2xtBl9jeWNsZW4LX19fcmVtX3BpbzJvEV9fX3JlbV9waW8yX2xhcmdlcAZfX19zaW5xBl9sZGV4cHIGX19fY29zcwRfY29zdARfc2ludQRfZXhwdgRfbG9ndwRfcG93eAtydW5Qb3N0U2V0c3kHX21lbWNweXoHX21lbXNldHsFX3Nicmt8C2R5bkNhbGxfaWlpfQJiMA=="),function(c){return c.charCodeAt(0)});var Module=typeof Module!=="undefined"?Module:{};var moduleOverrides={};var key;for(key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}Module["arguments"]=[];Module["thisProgram"]="./this.program";Module["quit"]=function(status,toThrow){throw toThrow};Module["preRun"]=[];Module["postRun"]=[];var ENVIRONMENT_IS_WEB=false;var ENVIRONMENT_IS_WORKER=false;var ENVIRONMENT_IS_NODE=false;var ENVIRONMENT_IS_SHELL=false;ENVIRONMENT_IS_WEB=typeof window==="object";ENVIRONMENT_IS_WORKER=typeof importScripts==="function";ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof require==="function"&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}else{return scriptDirectory+path}}if(ENVIRONMENT_IS_NODE){scriptDirectory=__dirname+"/";var nodeFS;var nodePath;Module["read"]=function shell_read(filename,binary){var ret;if(!nodeFS)nodeFS=require("fs");if(!nodePath)nodePath=require("path");filename=nodePath["normalize"](filename);ret=nodeFS["readFileSync"](filename);return binary?ret:ret.toString()};Module["readBinary"]=function readBinary(filename){var ret=Module["read"](filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/")}Module["arguments"]=process["argv"].slice(2);if(typeof module!=="undefined"){module["exports"]=Module}process["on"]("uncaughtException",function(ex){if(!(ex instanceof ExitStatus)){throw ex}});process["on"]("unhandledRejection",function(reason,p){process["exit"](1)});Module["quit"]=function(status){process["exit"](status)};Module["inspect"]=function(){return"[Emscripten Module object]"}}else if(ENVIRONMENT_IS_SHELL){if(typeof read!="undefined"){Module["read"]=function shell_read(f){return read(f)}}Module["readBinary"]=function readBinary(f){var data;if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof quit==="function"){Module["quit"]=function(status){quit(status)}}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WEB){if(document.currentScript){scriptDirectory=document.currentScript.src}}else{scriptDirectory=self.location.href}if(scriptDirectory.indexOf("blob:")!==0){scriptDirectory=scriptDirectory.split("/").slice(0,-1).join("/")+"/"}else{scriptDirectory=""}Module["read"]=function shell_read(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(ENVIRONMENT_IS_WORKER){Module["readBinary"]=function readBinary(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}}Module["readAsync"]=function readAsync(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}onerror()};xhr.onerror=onerror;xhr.send(null)};Module["setWindowTitle"]=function(title){document.title=title}}else{}var out=Module["print"]||(typeof console!=="undefined"?console.log.bind(console):typeof print!=="undefined"?print:null);var err=Module["printErr"]||(typeof printErr!=="undefined"?printErr:typeof console!=="undefined"&&console.warn.bind(console)||out);for(key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}moduleOverrides=undefined;var STACK_ALIGN=16;function staticAlloc(size){var ret=STATICTOP;STATICTOP=STATICTOP+size+15&-16;return ret}function dynamicAlloc(size){var ret=HEAP32[DYNAMICTOP_PTR>>2];var end=ret+size+15&-16;HEAP32[DYNAMICTOP_PTR>>2]=end;if(end>=TOTAL_MEMORY){var success=enlargeMemory();if(!success){HEAP32[DYNAMICTOP_PTR>>2]=ret;return 0}}return ret}function alignMemory(size,factor){if(!factor)factor=STACK_ALIGN;var ret=size=Math.ceil(size/factor)*factor;return ret}function getNativeTypeSize(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return 4}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0);return bits/8}else{return 0}}}}function warnOnce(text){if(!warnOnce.shown)warnOnce.shown={};if(!warnOnce.shown[text]){warnOnce.shown[text]=1;err(text)}}var asm2wasmImports={"f64-rem":function(x,y){return x%y},debugger:function(){debugger}};var jsCallStartIndex=1;var functionPointers=new Array(0);function addFunction(func,sig){var base=0;for(var i=base;i<base+0;i++){if(!functionPointers[i]){functionPointers[i]=func;return jsCallStartIndex+i}}throw"Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS."}function removeFunction(index){functionPointers[index-jsCallStartIndex]=null}var funcWrappers={};function getFuncWrapper(func,sig){if(!func)return;assert(sig);if(!funcWrappers[sig]){funcWrappers[sig]={}}var sigCache=funcWrappers[sig];if(!sigCache[func]){if(sig.length===1){sigCache[func]=function dynCall_wrapper(){return dynCall(sig,func)}}else if(sig.length===2){sigCache[func]=function dynCall_wrapper(arg){return dynCall(sig,func,[arg])}}else{sigCache[func]=function dynCall_wrapper(){return dynCall(sig,func,Array.prototype.slice.call(arguments))}}}return sigCache[func]}function makeBigInt(low,high,unsigned){return unsigned?+(low>>>0)+ +(high>>>0)*4294967296:+(low>>>0)+ +(high|0)*4294967296}function dynCall(sig,ptr,args){if(args&&args.length){return Module["dynCall_"+sig].apply(null,[ptr].concat(args))}else{return Module["dynCall_"+sig].call(null,ptr)}}var Runtime={dynCall:dynCall};var GLOBAL_BASE=1024;var ABORT=0;var EXITSTATUS=0;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}var globalScope=this;function getCFunc(ident){var func=Module["_"+ident];assert(func,"Cannot call unknown function "+ident+", make sure it is exported");return func}var JSfuncs={stackSave:function(){stackSave()},stackRestore:function(){stackRestore()},arrayToC:function(arr){var ret=stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret},stringToC:function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){var len=(str.length<<2)+1;ret=stackAlloc(len);stringToUTF8(str,ret,len)}return ret}};var toC={string:JSfuncs["stringToC"],array:JSfuncs["arrayToC"]};function ccall(ident,returnType,argTypes,args,opts){function convertReturnValue(ret){if(returnType==="string")return Pointer_stringify(ret);if(returnType==="boolean")return Boolean(ret);return ret}var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func.apply(null,cArgs);ret=convertReturnValue(ret);if(stack!==0)stackRestore(stack);return ret}function cwrap(ident,returnType,argTypes,opts){argTypes=argTypes||[];var numericArgs=argTypes.every(function(type){return type==="number"});var numericRet=returnType!=="string";if(numericRet&&numericArgs&&!opts){return getCFunc(ident)}return function(){return ccall(ident,returnType,argTypes,arguments,opts)}}function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=1?tempDouble>0?(Math_min(+Math_floor(tempDouble/4294967296),4294967295)|0)>>>0:~~+Math_ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type)}}function getValue(ptr,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":return HEAP8[ptr>>0];case"i8":return HEAP8[ptr>>0];case"i16":return HEAP16[ptr>>1];case"i32":return HEAP32[ptr>>2];case"i64":return HEAP32[ptr>>2];case"float":return HEAPF32[ptr>>2];case"double":return HEAPF64[ptr>>3];default:abort("invalid type for getValue: "+type)}return null}var ALLOC_NORMAL=0;var ALLOC_STACK=1;var ALLOC_STATIC=2;var ALLOC_DYNAMIC=3;var ALLOC_NONE=4;function allocate(slab,types,allocator,ptr){var zeroinit,size;if(typeof slab==="number"){zeroinit=true;size=slab}else{zeroinit=false;size=slab.length}var singleType=typeof types==="string"?types:null;var ret;if(allocator==ALLOC_NONE){ret=ptr}else{ret=[typeof _malloc==="function"?_malloc:staticAlloc,stackAlloc,staticAlloc,dynamicAlloc][allocator===undefined?ALLOC_STATIC:allocator](Math.max(size,singleType?1:types.length))}if(zeroinit){var stop;ptr=ret;assert((ret&3)==0);stop=ret+(size&~3);for(;ptr<stop;ptr+=4){HEAP32[ptr>>2]=0}stop=ret+size;while(ptr<stop){HEAP8[ptr++>>0]=0}return ret}if(singleType==="i8"){if(slab.subarray||slab.slice){HEAPU8.set(slab,ret)}else{HEAPU8.set(new Uint8Array(slab),ret)}return ret}var i=0,type,typeSize,previousType;while(i<size){var curr=slab[i];type=singleType||types[i];if(type===0){i++;continue}if(type=="i64")type="i32";setValue(ret+i,curr,type);if(previousType!==type){typeSize=getNativeTypeSize(type);previousType=type}i+=typeSize}return ret}function getMemory(size){if(!staticSealed)return staticAlloc(size);if(!runtimeInitialized)return dynamicAlloc(size);return _malloc(size)}function Pointer_stringify(ptr,length){if(length===0||!ptr)return"";var hasUtf=0;var t;var i=0;while(1){t=HEAPU8[ptr+i>>0];hasUtf|=t;if(t==0&&!length)break;i++;if(length&&i==length)break}if(!length)length=i;var ret="";if(hasUtf<128){var MAX_CHUNK=1024;var curr;while(length>0){curr=String.fromCharCode.apply(String,HEAPU8.subarray(ptr,ptr+Math.min(length,MAX_CHUNK)));ret=ret?ret+curr:curr;ptr+=MAX_CHUNK;length-=MAX_CHUNK}return ret}return UTF8ToString(ptr)}function AsciiToString(ptr){var str="";while(1){var ch=HEAP8[ptr++>>0];if(!ch)return str;str+=String.fromCharCode(ch)}}function stringToAscii(str,outPtr){return writeAsciiToMemory(str,outPtr,false)}var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;function UTF8ArrayToString(u8Array,idx){var endPtr=idx;while(u8Array[endPtr])++endPtr;if(endPtr-idx>16&&u8Array.subarray&&UTF8Decoder){return UTF8Decoder.decode(u8Array.subarray(idx,endPtr))}else{var u0,u1,u2,u3,u4,u5;var str="";while(1){u0=u8Array[idx++];if(!u0)return str;if(!(u0&128)){str+=String.fromCharCode(u0);continue}u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u3=u8Array[idx++]&63;if((u0&248)==240){u0=(u0&7)<<18|u1<<12|u2<<6|u3}else{u4=u8Array[idx++]&63;if((u0&252)==248){u0=(u0&3)<<24|u1<<18|u2<<12|u3<<6|u4}else{u5=u8Array[idx++]&63;u0=(u0&1)<<30|u1<<24|u2<<18|u3<<12|u4<<6|u5}}}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}}function UTF8ToString(ptr){return UTF8ArrayToString(HEAPU8,ptr)}function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023}if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=2097151){if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=67108863){if(outIdx+4>=endIdx)break;outU8Array[outIdx++]=248|u>>24;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else{if(outIdx+5>=endIdx)break;outU8Array[outIdx++]=252|u>>30;outU8Array[outIdx++]=128|u>>24&63;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}}outU8Array[outIdx]=0;return outIdx-startIdx}function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){++len}else if(u<=2047){len+=2}else if(u<=65535){len+=3}else if(u<=2097151){len+=4}else if(u<=67108863){len+=5}else{len+=6}}return len}var UTF16Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf-16le"):undefined;function UTF16ToString(ptr){var endPtr=ptr;var idx=endPtr>>1;while(HEAP16[idx])++idx;endPtr=idx<<1;if(endPtr-ptr>32&&UTF16Decoder){return UTF16Decoder.decode(HEAPU8.subarray(ptr,endPtr))}else{var i=0;var str="";while(1){var codeUnit=HEAP16[ptr+i*2>>1];if(codeUnit==0)return str;++i;str+=String.fromCharCode(codeUnit)}}}function stringToUTF16(str,outPtr,maxBytesToWrite){if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647}if(maxBytesToWrite<2)return 0;maxBytesToWrite-=2;var startPtr=outPtr;var numCharsToWrite=maxBytesToWrite<str.length*2?maxBytesToWrite/2:str.length;for(var i=0;i<numCharsToWrite;++i){var codeUnit=str.charCodeAt(i);HEAP16[outPtr>>1]=codeUnit;outPtr+=2}HEAP16[outPtr>>1]=0;return outPtr-startPtr}function lengthBytesUTF16(str){return str.length*2}function UTF32ToString(ptr){var i=0;var str="";while(1){var utf32=HEAP32[ptr+i*4>>2];if(utf32==0)return str;++i;if(utf32>=65536){var ch=utf32-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}else{str+=String.fromCharCode(utf32)}}}function stringToUTF32(str,outPtr,maxBytesToWrite){if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647}if(maxBytesToWrite<4)return 0;var startPtr=outPtr;var endPtr=startPtr+maxBytesToWrite-4;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343){var trailSurrogate=str.charCodeAt(++i);codeUnit=65536+((codeUnit&1023)<<10)|trailSurrogate&1023}HEAP32[outPtr>>2]=codeUnit;outPtr+=4;if(outPtr+4>endPtr)break}HEAP32[outPtr>>2]=0;return outPtr-startPtr}function lengthBytesUTF32(str){var len=0;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343)++i;len+=4}return len}function allocateUTF8(str){var size=lengthBytesUTF8(str)+1;var ret=_malloc(size);if(ret)stringToUTF8Array(str,HEAP8,ret,size);return ret}function allocateUTF8OnStack(str){var size=lengthBytesUTF8(str)+1;var ret=stackAlloc(size);stringToUTF8Array(str,HEAP8,ret,size);return ret}function demangle(func){return func}function demangleAll(text){var regex=/__Z[\w\d_]+/g;return text.replace(regex,function(x){var y=demangle(x);return x===y?x:x+" ["+y+"]"})}function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e}if(!err.stack){return"(no stack trace available)"}}return err.stack.toString()}function stackTrace(){var js=jsStackTrace();if(Module["extraStackTrace"])js+="\n"+Module["extraStackTrace"]();return demangleAll(js)}var PAGE_SIZE=16384;var WASM_PAGE_SIZE=65536;var ASMJS_PAGE_SIZE=16777216;var MIN_TOTAL_MEMORY=16777216;function alignUp(x,multiple){if(x%multiple>0){x+=multiple-x%multiple}return x}var HEAP,buffer,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBuffer(buf){Module["buffer"]=buffer=buf}function updateGlobalBufferViews(){Module["HEAP8"]=HEAP8=new Int8Array(buffer);Module["HEAP16"]=HEAP16=new Int16Array(buffer);Module["HEAP32"]=HEAP32=new Int32Array(buffer);Module["HEAPU8"]=HEAPU8=new Uint8Array(buffer);Module["HEAPU16"]=HEAPU16=new Uint16Array(buffer);Module["HEAPU32"]=HEAPU32=new Uint32Array(buffer);Module["HEAPF32"]=HEAPF32=new Float32Array(buffer);Module["HEAPF64"]=HEAPF64=new Float64Array(buffer)}var STATIC_BASE,STATICTOP,staticSealed;var STACK_BASE,STACKTOP,STACK_MAX;var DYNAMIC_BASE,DYNAMICTOP_PTR;STATIC_BASE=STATICTOP=STACK_BASE=STACKTOP=STACK_MAX=DYNAMIC_BASE=DYNAMICTOP_PTR=0;staticSealed=false;function abortOnCannotGrowMemory(){abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value "+TOTAL_MEMORY+", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")}if(!Module["reallocBuffer"])Module["reallocBuffer"]=function(size){var ret;try{if(ArrayBuffer.transfer){ret=ArrayBuffer.transfer(buffer,size)}else{var oldHEAP8=HEAP8;ret=new ArrayBuffer(size);var temp=new Int8Array(ret);temp.set(oldHEAP8)}}catch(e){return false}var success=_emscripten_replace_memory(ret);if(!success)return false;return ret};function enlargeMemory(){var PAGE_MULTIPLE=Module["usingWasm"]?WASM_PAGE_SIZE:ASMJS_PAGE_SIZE;var LIMIT=2147483648-PAGE_MULTIPLE;if(HEAP32[DYNAMICTOP_PTR>>2]>LIMIT){return false}var OLD_TOTAL_MEMORY=TOTAL_MEMORY;TOTAL_MEMORY=Math.max(TOTAL_MEMORY,MIN_TOTAL_MEMORY);while(TOTAL_MEMORY<HEAP32[DYNAMICTOP_PTR>>2]){if(TOTAL_MEMORY<=536870912){TOTAL_MEMORY=alignUp(2*TOTAL_MEMORY,PAGE_MULTIPLE)}else{TOTAL_MEMORY=Math.min(alignUp((3*TOTAL_MEMORY+2147483648)/4,PAGE_MULTIPLE),LIMIT)}}var replacement=Module["reallocBuffer"](TOTAL_MEMORY);if(!replacement||replacement.byteLength!=TOTAL_MEMORY){TOTAL_MEMORY=OLD_TOTAL_MEMORY;return false}updateGlobalBuffer(replacement);updateGlobalBufferViews();return true}var byteLength;try{byteLength=Function.prototype.call.bind(Object.getOwnPropertyDescriptor(ArrayBuffer.prototype,"byteLength").get);byteLength(new ArrayBuffer(4))}catch(e){byteLength=function(buffer){return buffer.byteLength}}var TOTAL_STACK=Module["TOTAL_STACK"]||5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;if(TOTAL_MEMORY<TOTAL_STACK)err("TOTAL_MEMORY should be larger than TOTAL_STACK, was "+TOTAL_MEMORY+"! (TOTAL_STACK="+TOTAL_STACK+")");if(Module["buffer"]){buffer=Module["buffer"]}else{if(typeof WebAssembly==="object"&&typeof WebAssembly.Memory==="function"){Module["wasmMemory"]=new WebAssembly.Memory({initial:TOTAL_MEMORY/WASM_PAGE_SIZE});buffer=Module["wasmMemory"].buffer}else{buffer=new ArrayBuffer(TOTAL_MEMORY)}Module["buffer"]=buffer}updateGlobalBufferViews();function getTotalMemory(){return TOTAL_MEMORY}function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Module["dynCall_v"](func)}else{Module["dynCall_vi"](func,callback.arg)}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATEXIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){callRuntimeCallbacks(__ATEXIT__);runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}function addOnInit(cb){__ATINIT__.unshift(cb)}function addOnPreMain(cb){__ATMAIN__.unshift(cb)}function addOnExit(cb){__ATEXIT__.unshift(cb)}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}function writeStringToMemory(string,buffer,dontAddNull){warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!");var lastChar,end;if(dontAddNull){end=buffer+lengthBytesUTF8(string);lastChar=HEAP8[end]}stringToUTF8(string,buffer,Infinity);if(dontAddNull)HEAP8[end]=lastChar}function writeArrayToMemory(array,buffer){HEAP8.set(array,buffer)}function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i)}if(!dontAddNull)HEAP8[buffer>>0]=0}function unSign(value,bits,ignore){if(value>=0){return value}return bits<=32?2*Math.abs(1<<bits-1)+value:Math.pow(2,bits)+value}function reSign(value,bits,ignore){if(value<=0){return value}var half=bits<=32?Math.abs(1<<bits-1):Math.pow(2,bits-1);if(value>=half&&(bits<=32||value>half)){value=-2*half+value}return value}var Math_abs=Math.abs;var Math_cos=Math.cos;var Math_sin=Math.sin;var Math_tan=Math.tan;var Math_acos=Math.acos;var Math_asin=Math.asin;var Math_atan=Math.atan;var Math_atan2=Math.atan2;var Math_exp=Math.exp;var Math_log=Math.log;var Math_sqrt=Math.sqrt;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_pow=Math.pow;var Math_imul=Math.imul;var Math_fround=Math.fround;var Math_round=Math.round;var Math_min=Math.min;var Math_max=Math.max;var Math_clz32=Math.clz32;var Math_trunc=Math.trunc;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function getUniqueRunDependency(id){return id}function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["preloadedImages"]={};Module["preloadedAudios"]={};var memoryInitializer=null;var dataURIPrefix="data:application/octet-stream;base64,";function isDataURI(filename){return String.prototype.startsWith?filename.startsWith(dataURIPrefix):filename.indexOf(dataURIPrefix)===0}function integrateWasmJS(){var method="native-wasm";var wasmTextFile="main.wast";var wasmBinaryFile="main.wasm";var asmjsCodeFile="main.temp.asm.js";if(!isDataURI(wasmTextFile)){wasmTextFile=locateFile(wasmTextFile)}if(!isDataURI(wasmBinaryFile)){wasmBinaryFile=locateFile(wasmBinaryFile)}if(!isDataURI(asmjsCodeFile)){asmjsCodeFile=locateFile(asmjsCodeFile)}var wasmPageSize=64*1024;var info={global:null,env:null,asm2wasm:asm2wasmImports,parent:Module};var exports=null;function mergeMemory(newBuffer){var oldBuffer=Module["buffer"];if(newBuffer.byteLength<oldBuffer.byteLength){err("the new buffer in mergeMemory is smaller than the previous one. in native wasm, we should grow memory here")}var oldView=new Int8Array(oldBuffer);var newView=new Int8Array(newBuffer);newView.set(oldView);updateGlobalBuffer(newBuffer);updateGlobalBufferViews()}function fixImports(imports){return imports}function getBinary(){try{if(Module["wasmBinary"]){return new Uint8Array(Module["wasmBinary"])}if(Module["readBinary"]){return Module["readBinary"](wasmBinaryFile)}else{throw"both async and sync fetching of the wasm failed"}}catch(err){abort(err)}}function getBinaryPromise(){if(!Module["wasmBinary"]&&(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER)&&typeof fetch==="function"){return fetch(wasmBinaryFile,{credentials:"same-origin"}).then(function(response){if(!response["ok"]){throw"failed to load wasm binary file at '"+wasmBinaryFile+"'"}return response["arrayBuffer"]()}).catch(function(){return getBinary()})}return new Promise(function(resolve,reject){resolve(getBinary())})}function doNativeWasm(global,env,providedBuffer){if(typeof WebAssembly!=="object"){err("no native wasm support detected");return false}if(!(Module["wasmMemory"]instanceof WebAssembly.Memory)){err("no native wasm Memory in use");return false}env["memory"]=Module["wasmMemory"];info["global"]={NaN:NaN,Infinity:Infinity};info["global.Math"]=Math;info["env"]=env;function receiveInstance(instance,module){exports=instance.exports;if(exports.memory)mergeMemory(exports.memory);Module["asm"]=exports;Module["usingWasm"]=true;removeRunDependency("wasm-instantiate")}addRunDependency("wasm-instantiate");if(Module["instantiateWasm"]){try{return Module["instantiateWasm"](info,receiveInstance)}catch(e){err("Module.instantiateWasm callback failed with error: "+e);return false}}function receiveInstantiatedSource(output){receiveInstance(output["instance"],output["module"])}function instantiateArrayBuffer(receiver){getBinaryPromise().then(function(binary){return WebAssembly.instantiate(binary,info)}).then(receiver).catch(function(reason){err("failed to asynchronously prepare wasm: "+reason);abort(reason)})}if(!Module["wasmBinary"]&&typeof WebAssembly.instantiateStreaming==="function"&&!isDataURI(wasmBinaryFile)&&typeof fetch==="function"){WebAssembly.instantiateStreaming(fetch(wasmBinaryFile,{credentials:"same-origin"}),info).then(receiveInstantiatedSource).catch(function(reason){err("wasm streaming compile failed: "+reason);err("falling back to ArrayBuffer instantiation");instantiateArrayBuffer(receiveInstantiatedSource)})}else{instantiateArrayBuffer(receiveInstantiatedSource)}return{}}Module["asmPreload"]=Module["asm"];var asmjsReallocBuffer=Module["reallocBuffer"];var wasmReallocBuffer=function(size){var PAGE_MULTIPLE=Module["usingWasm"]?WASM_PAGE_SIZE:ASMJS_PAGE_SIZE;size=alignUp(size,PAGE_MULTIPLE);var old=Module["buffer"];var oldSize=old.byteLength;if(Module["usingWasm"]){try{var result=Module["wasmMemory"].grow((size-oldSize)/wasmPageSize);if(result!==(-1|0)){return Module["buffer"]=Module["wasmMemory"].buffer}else{return null}}catch(e){return null}}};Module["reallocBuffer"]=function(size){if(finalMethod==="asmjs"){return asmjsReallocBuffer(size)}else{return wasmReallocBuffer(size)}};var finalMethod="";Module["asm"]=function(global,env,providedBuffer){env=fixImports(env);if(!env["table"]){var TABLE_SIZE=Module["wasmTableSize"];if(TABLE_SIZE===undefined)TABLE_SIZE=1024;var MAX_TABLE_SIZE=Module["wasmMaxTableSize"];if(typeof WebAssembly==="object"&&typeof WebAssembly.Table==="function"){if(MAX_TABLE_SIZE!==undefined){env["table"]=new WebAssembly.Table({initial:TABLE_SIZE,maximum:MAX_TABLE_SIZE,element:"anyfunc"})}else{env["table"]=new WebAssembly.Table({initial:TABLE_SIZE,element:"anyfunc"})}}else{env["table"]=new Array(TABLE_SIZE)}Module["wasmTable"]=env["table"]}if(!env["memoryBase"]){env["memoryBase"]=Module["STATIC_BASE"]}if(!env["tableBase"]){env["tableBase"]=0}var exports;exports=doNativeWasm(global,env,providedBuffer);assert(exports,"no binaryen method succeeded.");return exports};var methodHandler=Module["asm"]}integrateWasmJS();var ASM_CONSTS=[];STATIC_BASE=GLOBAL_BASE;STATICTOP=STATIC_BASE+4816;__ATINIT__.push();var STATIC_BUMP=4816;Module["STATIC_BASE"]=STATIC_BASE;Module["STATIC_BUMP"]=STATIC_BUMP;var tempDoublePtr=STATICTOP;STATICTOP+=16;function copyTempFloat(ptr){HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1]=HEAP8[ptr+1];HEAP8[tempDoublePtr+2]=HEAP8[ptr+2];HEAP8[tempDoublePtr+3]=HEAP8[ptr+3]}function copyTempDouble(ptr){HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1]=HEAP8[ptr+1];HEAP8[tempDoublePtr+2]=HEAP8[ptr+2];HEAP8[tempDoublePtr+3]=HEAP8[ptr+3];HEAP8[tempDoublePtr+4]=HEAP8[ptr+4];HEAP8[tempDoublePtr+5]=HEAP8[ptr+5];HEAP8[tempDoublePtr+6]=HEAP8[ptr+6];HEAP8[tempDoublePtr+7]=HEAP8[ptr+7]}function ___assert_fail(condition,filename,line,func){abort("Assertion failed: "+Pointer_stringify(condition)+", at: "+[filename?Pointer_stringify(filename):"unknown filename",line,func?Pointer_stringify(func):"unknown function"])}function _abort(){Module["abort"]()}var _llvm_floor_f64=Math_floor;function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest);return dest}function ___setErrNo(value){if(Module["___errno_location"])HEAP32[Module["___errno_location"]()>>2]=value;return value}DYNAMICTOP_PTR=staticAlloc(4);STACK_BASE=STACKTOP=alignMemory(STATICTOP);STACK_MAX=STACK_BASE+TOTAL_STACK;DYNAMIC_BASE=alignMemory(STACK_MAX);HEAP32[DYNAMICTOP_PTR>>2]=DYNAMIC_BASE;staticSealed=true;var ASSERTIONS=false;function intArrayFromString(stringy,dontAddNull,length){var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array}function intArrayToString(array){var ret=[];for(var i=0;i<array.length;i++){var chr=array[i];if(chr>255){if(ASSERTIONS){assert(false,"Character code "+chr+" ("+String.fromCharCode(chr)+")  at offset "+i+" not in 0x00-0xFF.")}chr&=255}ret.push(String.fromCharCode(chr))}return ret.join("")}Module["wasmTableSize"]=4;Module["wasmMaxTableSize"]=4;function invoke_iii(index,a1,a2){var sp=stackSave();try{return Module["dynCall_iii"](index,a1,a2)}catch(e){stackRestore(sp);if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}Module.asmGlobalArg={};Module.asmLibraryArg={abort:abort,assert:assert,enlargeMemory:enlargeMemory,getTotalMemory:getTotalMemory,abortOnCannotGrowMemory:abortOnCannotGrowMemory,invoke_iii:invoke_iii,___assert_fail:___assert_fail,___setErrNo:___setErrNo,_abort:_abort,_emscripten_memcpy_big:_emscripten_memcpy_big,_llvm_floor_f64:_llvm_floor_f64,DYNAMICTOP_PTR:DYNAMICTOP_PTR,tempDoublePtr:tempDoublePtr,ABORT:ABORT,STACKTOP:STACKTOP,STACK_MAX:STACK_MAX};var asm=Module["asm"](Module.asmGlobalArg,Module.asmLibraryArg,buffer);Module["asm"]=asm;var ___errno_location=Module["___errno_location"]=function(){return Module["asm"]["___errno_location"].apply(null,arguments)};var _emscripten_replace_memory=Module["_emscripten_replace_memory"]=function(){return Module["asm"]["_emscripten_replace_memory"].apply(null,arguments)};var _free=Module["_free"]=function(){return Module["asm"]["_free"].apply(null,arguments)};var _malloc=Module["_malloc"]=function(){return Module["asm"]["_malloc"].apply(null,arguments)};var _memcpy=Module["_memcpy"]=function(){return Module["asm"]["_memcpy"].apply(null,arguments)};var _memset=Module["_memset"]=function(){return Module["asm"]["_memset"].apply(null,arguments)};var _sbrk=Module["_sbrk"]=function(){return Module["asm"]["_sbrk"].apply(null,arguments)};var _stb_vorbis_js_channels=Module["_stb_vorbis_js_channels"]=function(){return Module["asm"]["_stb_vorbis_js_channels"].apply(null,arguments)};var _stb_vorbis_js_close=Module["_stb_vorbis_js_close"]=function(){return Module["asm"]["_stb_vorbis_js_close"].apply(null,arguments)};var _stb_vorbis_js_decode=Module["_stb_vorbis_js_decode"]=function(){return Module["asm"]["_stb_vorbis_js_decode"].apply(null,arguments)};var _stb_vorbis_js_open=Module["_stb_vorbis_js_open"]=function(){return Module["asm"]["_stb_vorbis_js_open"].apply(null,arguments)};var _stb_vorbis_js_sample_rate=Module["_stb_vorbis_js_sample_rate"]=function(){return Module["asm"]["_stb_vorbis_js_sample_rate"].apply(null,arguments)};var establishStackSpace=Module["establishStackSpace"]=function(){return Module["asm"]["establishStackSpace"].apply(null,arguments)};var getTempRet0=Module["getTempRet0"]=function(){return Module["asm"]["getTempRet0"].apply(null,arguments)};var runPostSets=Module["runPostSets"]=function(){return Module["asm"]["runPostSets"].apply(null,arguments)};var setTempRet0=Module["setTempRet0"]=function(){return Module["asm"]["setTempRet0"].apply(null,arguments)};var setThrew=Module["setThrew"]=function(){return Module["asm"]["setThrew"].apply(null,arguments)};var stackAlloc=Module["stackAlloc"]=function(){return Module["asm"]["stackAlloc"].apply(null,arguments)};var stackRestore=Module["stackRestore"]=function(){return Module["asm"]["stackRestore"].apply(null,arguments)};var stackSave=Module["stackSave"]=function(){return Module["asm"]["stackSave"].apply(null,arguments)};var dynCall_iii=Module["dynCall_iii"]=function(){return Module["asm"]["dynCall_iii"].apply(null,arguments)};Module["asm"]=asm;Module["ccall"]=ccall;Module["cwrap"]=cwrap;function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var initialStackTop;var calledMain=false;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};function run(args){args=args||Module["arguments"];if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(function(){setTimeout(function(){Module["setStatus"]("")},1);doRun()},1)}else{doRun()}}Module["run"]=run;function exit(status,implicit){if(implicit&&Module["noExitRuntime"]&&status===0){return}if(Module["noExitRuntime"]){}else{ABORT=true;EXITSTATUS=status;STACKTOP=initialStackTop;exitRuntime();if(Module["onExit"])Module["onExit"](status)}Module["quit"](status,new ExitStatus(status))}var abortDecorators=[];function abort(what){if(Module["onAbort"]){Module["onAbort"](what)}if(what!==undefined){out(what);err(what);what=JSON.stringify(what)}else{what=""}ABORT=true;EXITSTATUS=1;throw"abort("+what+"). Build with -s ASSERTIONS=1 for more info."}Module["abort"]=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}Module["noExitRuntime"]=true;run();(function(Module){var initializeP=new Promise(function(resolve){if(typeof useWasm!=="undefined"){Module.onRuntimeInitialized=function(){var fs={};fs.open=Module.cwrap("stb_vorbis_js_open","number",[]);fs.close=Module.cwrap("stb_vorbis_js_close","void",["number"]);fs.channels=Module.cwrap("stb_vorbis_js_channels","number",["number"]);fs.sampleRate=Module.cwrap("stb_vorbis_js_sample_rate","number",["number"]);fs.decode=Module.cwrap("stb_vorbis_js_decode","number",["number","number","number","number","number"]);resolve(fs)};return}var fs={};fs.open=Module["_stb_vorbis_js_open"];fs.close=Module["_stb_vorbis_js_close"];fs.channels=Module["_stb_vorbis_js_channels"];fs.sampleRate=Module["_stb_vorbis_js_sample_rate"];fs.decode=Module["_stb_vorbis_js_decode"];resolve(fs)});function arrayBufferToHeap(buffer,byteOffset,byteLength){var ptr=Module._malloc(byteLength);var heapBytes=new Uint8Array(Module.HEAPU8.buffer,ptr,byteLength);heapBytes.set(new Uint8Array(buffer,byteOffset,byteLength));return heapBytes}function ptrToInt32(ptr){var a=new Int32Array(Module.HEAPU8.buffer,ptr,1);return a[0]}function ptrToFloat32(ptr){var a=new Float32Array(Module.HEAPU8.buffer,ptr,1);return a[0]}function ptrToInt32s(ptr,length){var buf=new ArrayBuffer(length*Int32Array.BYTES_PER_ELEMENT);var copied=new Int32Array(buf);copied.set(new Int32Array(Module.HEAPU8.buffer,ptr,length));return copied}function ptrToFloat32s(ptr,length){var buf=new ArrayBuffer(length*Float32Array.BYTES_PER_ELEMENT);var copied=new Float32Array(buf);copied.set(new Float32Array(Module.HEAPU8.buffer,ptr,length));return copied}function concatArrays(arr1,arr2){if(!arr1){arr1=new ArrayBuffer}if(!arr2){arr2=new ArrayBuffer}var newArr=new Uint8Array(arr1.byteLength+arr2.byteLength);if(arr1 instanceof ArrayBuffer){newArr.set(new Uint8Array(arr1),0)}else if(arr1 instanceof Uint8Array){newArr.set(arr1,0)}else{throw"not reached"}if(arr2 instanceof ArrayBuffer){newArr.set(new Uint8Array(arr2),arr1.byteLength)}else if(arr2 instanceof Uint8Array){newArr.set(arr2,arr1.byteLength)}else{throw"not reached"}return newArr}var sessions={};self.addEventListener("message",function(event){initializeP.then(function(funcs){var statePtr=null;if(event.data.id in sessions){statePtr=sessions[event.data.id].state}else{statePtr=funcs.open();sessions[event.data.id]={state:statePtr,input:null}}sessions[event.data.id].input=concatArrays(sessions[event.data.id].input,event.data.buf);while(sessions[event.data.id].input.byteLength>0){var input=sessions[event.data.id].input;var copiedInput=null;var chunkLength=Math.min(65536,input.byteLength);if(input instanceof ArrayBuffer){copiedInput=arrayBufferToHeap(input,0,chunkLength)}else if(input instanceof Uint8Array){copiedInput=arrayBufferToHeap(input.buffer,input.byteOffset,chunkLength)}var outputPtr=Module._malloc(4);var readPtr=Module._malloc(4);var length=funcs.decode(statePtr,copiedInput.byteOffset,copiedInput.byteLength,outputPtr,readPtr);Module._free(copiedInput.byteOffset);var read=ptrToInt32(readPtr);Module._free(readPtr);sessions[event.data.id].input=input.slice(read);var result={id:event.data.id,data:null,sampleRate:0,eof:false,error:null};if(length<0){result.error="stbvorbis decode failed: "+length;postMessage(result);funcs.close(statePtr);delete sessions[event.data.id];Module._free(outputPtr);return}var channels=funcs.channels(statePtr);if(channels>0){var dataPtrs=ptrToInt32s(ptrToInt32(outputPtr),channels);result.data=new Array(dataPtrs.length);for(var i=0;i<dataPtrs.length;i++){result.data[i]=ptrToFloat32s(dataPtrs[i],length);Module._free(dataPtrs[i])}}Module._free(ptrToInt32(outputPtr));Module._free(outputPtr);if(read===0){break}if(result.sampleRate===0){result.sampleRate=funcs.sampleRate(statePtr)}postMessage(result,result.data.map(function(array){return array.buffer}))}if(event.data.eof){var len=sessions[event.data.id].input.length;if(len){console.warn("not all the input data was decoded. remaining: "+len+"[bytes]")}var result={id:event.data.id,data:null,sampleRate:0,eof:true,error:null};postMessage(result);funcs.close(statePtr);delete sessions[event.data.id]}})})})(Module)}function httpGet(url){return new Promise(function(resolve,reject){var xhr=new XMLHttpRequest;xhr.open("GET",url);xhr.addEventListener("load",function(){var status=xhr.status;if(status<200||status>=300){reject({status:status});return}resolve(xhr.response)});xhr.addEventListener("error",function(){reject({status:xhr.status})});xhr.send()})}var initializeWorkerP=new Promise(function(resolve,reject){if(typeof WebAssembly==="object"&&!(navigator.userAgent.match(/iPhone|iPad|iPod/) && navigator.userAgent.match(/AppleWebKit/))){var workerURL=URL.createObjectURL(new Blob(["("+decodeWorker.toString()+")();"],{type:"text/javascript"}));resolve(new Worker(workerURL));return}var scriptPath=document.currentScript.src;var directoryPath=scriptPath.slice(0,scriptPath.lastIndexOf("/")+1);httpGet(directoryPath+"stbvorbis_stream_asm.js").then(function(script){workerURL=URL.createObjectURL(new Blob([script],{type:"text/javascript"}));resolve(new Worker(workerURL))}).catch(function(err){reject(new Error("asmjs version is not available (HTTP status: "+err.status+" on stbvorbis_stream_asm.js). Deploy stbvorbis_stream_asm.js at the same place as stbvorbis.js."))})});initializeWorkerP.catch(function(e){});stbvorbis.decode=function(buf,outCallback){var inCallback=stbvorbis.decodeStream(outCallback);inCallback({data:buf,eof:false});inCallback({data:null,eof:true})};var sessionId=0;var outCallbacks={};stbvorbis.decodeStream=function(outCallback){var inCallbackImpl=null;var inputQueue=[];var inCallback=function(input){if(!inCallbackImpl){inputQueue.push(input);return}inCallbackImpl(input)};initializeWorkerP.then(function(worker){var currentId=sessionId;sessionId++;var sampleRate=0;var data=[];var onmessage=function(event){var result=event.data;if(result.id!==currentId){return}if(result.error){outCallback({data:null,sampleRate:0,eof:false,error:result.error});worker.removeEventListener("message",onmessage);return}if(result.eof){outCallback({data:null,sampleRate:0,eof:true,error:null});worker.removeEventListener("message",onmessage);return}outCallback({data:result.data,sampleRate:result.sampleRate,eof:false,error:null})};worker.addEventListener("message",onmessage);inCallbackImpl=function(input){if(input.eof){worker.postMessage({id:currentId,buf:null,eof:true});return}var buf=input.data;worker.postMessage({id:currentId,buf:buf,eof:false},[buf instanceof Uint8Array?buf.buffer:buf])};for(var i=0;i<inputQueue.length;i++){inCallbackImpl(inputQueue[i])}inputQueue=null});return inCallback}})();


/* === worklet_stbvorbis.js === */
/*
* v1.0.1
* @license MIT License | Copyright (c) 2014-2020 Hajime Hoshi, krmbn0576, Nathan Bolton, MaxArt2501
*/
class AudioCopyProcessor extends AudioWorkletProcessor {

    constructor() {
        super();
        const self = this;
        this.createStbvorbis();
        this.sessions = {};
        this.port.onmessage = this.handleMessage.bind(this);
        this.initializeP = new Promise(function (resolve) {
            if (typeof self.useWasm !== "undefined") {
                self.stbvorbis.onRuntimeInitialized = function () {
                    var fs = {};
                    fs.open = self.stbvorbis.cwrap("stb_vorbis_js_open", "number", []);
                    fs.close = self.stbvorbis.cwrap("stb_vorbis_js_close", "void", ["number"]);
                    fs.channels = self.stbvorbis.cwrap("stb_vorbis_js_channels", "number", ["number"]);
                    fs.sampleRate = self.stbvorbis.cwrap("stb_vorbis_js_sample_rate", "number", ["number"]);
                    fs.decode = self.stbvorbis.cwrap("stb_vorbis_js_decode", "number", ["number", "number", "number", "number", "number"]);
                    resolve(fs)
                };
                return
            }
            var fs = {};
            fs.open = self.stbvorbis["_stb_vorbis_js_open"];
            fs.close = self.stbvorbis["_stb_vorbis_js_close"];
            fs.channels = self.stbvorbis["_stb_vorbis_js_channels"];
            fs.sampleRate = self.stbvorbis["_stb_vorbis_js_sample_rate"];
            fs.decode = self.stbvorbis["_stb_vorbis_js_decode"];
            resolve(fs)
        });
    };

    process() {
        return true;
    };

    handleMessage(event) {
        const self = this;
        this.initializeP.then(function (funcs) {
            var statePtr = null;
            if (event.data.id in self.sessions) {
                statePtr = self.sessions[event.data.id].state
            } else {
                statePtr = funcs.open();
                self.sessions[event.data.id] = {
                    state: statePtr,
                    input: null
                }
            }
            self.sessions[event.data.id].input = self.concatArrays(self.sessions[event.data.id].input, event.data.buf);
            while (self.sessions[event.data.id].input.byteLength > 0) {
                var input = self.sessions[event.data.id].input;
                var copiedInput = null;
                var chunkLength = Math.min(65536, input.byteLength);
                if (input instanceof ArrayBuffer) {
                    copiedInput = self.arrayBufferToHeap(input, 0, chunkLength)
                } else if (input instanceof Uint8Array) {
                    copiedInput = self.arrayBufferToHeap(input.buffer, input.byteOffset, chunkLength)
                }
                var outputPtr = self.stbvorbis._malloc(4);
                var readPtr = self.stbvorbis._malloc(4);
                var length = funcs.decode(
                    statePtr,
                    copiedInput.byteOffset,
                    copiedInput.byteLength,
                    outputPtr,
                    readPtr
                );

                self.stbvorbis._free(copiedInput.byteOffset);
                var read = self.ptrToInt32(readPtr);
                self.stbvorbis._free(readPtr);

                self.sessions[event.data.id].input = input.slice(read);
                var result = {
                    id: event.data.id,
                    data: null,
                    sampleRate: 0,
                    eof: false,
                    error: null
                };
                if (length < 0) {
                    result.error = "stbvorbis decode failed: " + length;
                    self.port.postMessage(result);
                    funcs.close(statePtr);
                    delete self.sessions[event.data.id];
                    self.stbvorbis._free(outputPtr);
                    return
                }
                var channels = funcs.channels(statePtr);
                if (channels > 0) {
                    var dataPtrs = self.ptrToInt32s(self.ptrToInt32(outputPtr), channels);
                    result.data = new Array(dataPtrs.length);
                    for (var i = 0; i < dataPtrs.length; i++) {
                        result.data[i] = self.ptrToFloat32s(dataPtrs[i], length);
                        self.stbvorbis._free(dataPtrs[i])
                    }
                }
                self.stbvorbis._free(self.ptrToInt32(outputPtr));
                self.stbvorbis._free(outputPtr);

                if (read === 0) {
                    break
                }

                if (result.sampleRate === 0) {
                    result.sampleRate = funcs.sampleRate(statePtr)
                }
                self.port.postMessage(result, result.data.map(function (array) {
                    return array.buffer
                }))
            }
            if (event.data.eof) {
                var len = self.sessions[event.data.id].input.length;
                if (len) {
                    console.warn("not all the input data was decoded. remaining: " + len + "[bytes]")
                }
                var result = {
                    id: event.data.id,
                    data: null,
                    sampleRate: 0,
                    eof: true,
                    error: null
                };
                self.port.postMessage(result);
                funcs.close(statePtr);
                delete self.sessions[event.data.id]
            }
        })
    };

arrayBufferToHeap(buffer,byteOffset,byteLength){var ptr=this.stbvorbis._malloc(byteLength);var heapBytes=new Uint8Array(this.stbvorbis.HEAPU8.buffer,ptr,byteLength);heapBytes.set(new Uint8Array(buffer,byteOffset,byteLength));return heapBytes}
ptrToInt32(ptr){var a=new Int32Array(this.stbvorbis.HEAPU8.buffer,ptr,1);return a[0]}
ptrToFloat32(ptr){var a=new Float32Array(this.stbvorbis.HEAPU8.buffer,ptr,1);return a[0]}
ptrToInt32s(ptr,length){var buf=new ArrayBuffer(length*Int32Array.BYTES_PER_ELEMENT);var copied=new Int32Array(buf);copied.set(new Int32Array(this.stbvorbis.HEAPU8.buffer,ptr,length));return copied}
ptrToFloat32s(ptr,length){var buf=new ArrayBuffer(length*Float32Array.BYTES_PER_ELEMENT);var copied=new Float32Array(buf);copied.set(new Float32Array(this.stbvorbis.HEAPU8.buffer,ptr,length));return copied}
concatArrays(arr1,arr2){if(!arr1){arr1=new ArrayBuffer}
if(!arr2){arr2=new ArrayBuffer}
var newArr=new Uint8Array(arr1.byteLength+arr2.byteLength);if(arr1 instanceof ArrayBuffer){newArr.set(new Uint8Array(arr1),0)}else if(arr1 instanceof Uint8Array){newArr.set(arr1,0)}else{throw"not reached"}
if(arr2 instanceof ArrayBuffer){newArr.set(new Uint8Array(arr2),arr1.byteLength)}else if(arr2 instanceof Uint8Array){newArr.set(arr2,arr1.byteLength)}else{throw"not reached"}
return newArr}
atob(string){var b64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",b64re=/^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;string=String(string).replace(/[\t\n\f\r ]+/g,"");if(!b64re.test(string))
throw new TypeError("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");string+="==".slice(2-(string.length&3));var bitmap,result="",r1,r2,i=0;for(;i<string.length;){bitmap=b64.indexOf(string.charAt(i++))<<18|b64.indexOf(string.charAt(i++))<<12|(r1=b64.indexOf(string.charAt(i++)))<<6|(r2=b64.indexOf(string.charAt(i++)));result+=r1===64?String.fromCharCode(bitmap>>16&255):r2===64?String.fromCharCode(bitmap>>16&255,bitmap>>8&255):String.fromCharCode(bitmap>>16&255,bitmap>>8&255,bitmap&255);}
return result;};createStbvorbis(){var Module=typeof Module!=="undefined"?Module:{};this.useWasm=true;Module["wasmBinary"]=Uint8Array.from(this.atob("AGFzbQEAAAABpQEYYAJ/fwF/YAF/AGAAAX9gBH9/f38AYAAAYAN/f38Bf2ABfwF/YAJ/fwBgBn9/f39/fwF/YAR/f39/AX9gBX9/f39/AX9gB39/f39/f38Bf2AGf39/f39/AGAIf39/f39/f38Bf2AFf39/f38AYAd/f39/f39/AGADf39/AGABfwF9YAF9AX1gAnx/AXxgAnx/AX9gA3x8fwF8YAJ8fAF8YAF8AXwCngIPA2VudgZtZW1vcnkCAIACA2VudgV0YWJsZQFwAQQEA2Vudgl0YWJsZUJhc2UDfwADZW52DkRZTkFNSUNUT1BfUFRSA38AA2VudghTVEFDS1RPUAN/AANlbnYJU1RBQ0tfTUFYA38ABmdsb2JhbAhJbmZpbml0eQN8AANlbnYFYWJvcnQAAQNlbnYNZW5sYXJnZU1lbW9yeQACA2Vudg5nZXRUb3RhbE1lbW9yeQACA2VudhdhYm9ydE9uQ2Fubm90R3Jvd01lbW9yeQACA2Vudg5fX19hc3NlcnRfZmFpbAADA2VudgtfX19zZXRFcnJObwABA2VudgZfYWJvcnQABANlbnYWX2Vtc2NyaXB0ZW5fbWVtY3B5X2JpZwAFA3d2BgYCAQcHAQIBAQcBCAcFAAkGCQoHBgYGBgEFBgIBBgYKAAgLAAYGBgYGBgYBAAoMDAMGBQANCAoJAAwODA8OAQAGBgcEABAJEAERAAADBQwAAAMHBxIGAQAABwIFEwMOBw8HBgYQFAoVExYXFxcXFgQFBQYFAAYkB38BIwELfwEjAgt/ASMDC38BQQALfwFBAAt8ASMEC38BQQALB9MCFRBfX2dyb3dXYXNtTWVtb3J5AAgRX19fZXJybm9fbG9jYXRpb24AYwVfZnJlZQBfB19tYWxsb2MAXgdfbWVtY3B5AHkHX21lbXNldAB6BV9zYnJrAHsXX3N0Yl92b3JiaXNfanNfY2hhbm5lbHMAJhRfc3RiX3ZvcmJpc19qc19jbG9zZQAlFV9zdGJfdm9yYmlzX2pzX2RlY29kZQAoE19zdGJfdm9yYmlzX2pzX29wZW4AJBpfc3RiX3ZvcmJpc19qc19zYW1wbGVfcmF0ZQAnC2R5bkNhbGxfaWlpAHwTZXN0YWJsaXNoU3RhY2tTcGFjZQAMC2dldFRlbXBSZXQwAA8LcnVuUG9zdFNldHMAeAtzZXRUZW1wUmV0MAAOCHNldFRocmV3AA0Kc3RhY2tBbGxvYwAJDHN0YWNrUmVzdG9yZQALCXN0YWNrU2F2ZQAKCQoBACMACwR9VFl9Csb2A3YGACAAQAALGwEBfyMGIQEjBiAAaiQGIwZBD2pBcHEkBiABCwQAIwYLBgAgACQGCwoAIAAkBiABJAcLEAAjCEUEQCAAJAggASQJCwsGACAAJAsLBAAjCwsRACAABEAgABARIAAgABASCwvvBwEKfyAAQYADaiEHIAcoAgAhBQJAIAUEQCAAQfwBaiEEIAQoAgAhASABQQBKBEAgAEHwAGohCANAIAUgAkEYbGpBEGohCSAJKAIAIQEgAQRAIAgoAgAhAyAFIAJBGGxqQQ1qIQogCi0AACEGIAZB/wFxIQYgAyAGQbAQbGpBBGohAyADKAIAIQMgA0EASgRAQQAhAwNAIAEgA0ECdGohASABKAIAIQEgACABEBIgA0EBaiEDIAgoAgAhASAKLQAAIQYgBkH/AXEhBiABIAZBsBBsakEEaiEBIAEoAgAhBiAJKAIAIQEgAyAGSA0ACwsgACABEBILIAUgAkEYbGpBFGohASABKAIAIQEgACABEBIgAkEBaiECIAQoAgAhASACIAFODQMgBygCACEFDAAACwALCwsgAEHwAGohAyADKAIAIQEgAQRAIABB7ABqIQUgBSgCACECIAJBAEoEQEEAIQIDQAJAIAEgAkGwEGxqQQhqIQQgBCgCACEEIAAgBBASIAEgAkGwEGxqQRxqIQQgBCgCACEEIAAgBBASIAEgAkGwEGxqQSBqIQQgBCgCACEEIAAgBBASIAEgAkGwEGxqQaQQaiEEIAQoAgAhBCAAIAQQEiABIAJBsBBsakGoEGohASABKAIAIQEgAUUhBCABQXxqIQFBACABIAQbIQEgACABEBIgAkEBaiECIAUoAgAhASACIAFODQAgAygCACEBDAELCyADKAIAIQELIAAgARASCyAAQfgBaiEBIAEoAgAhASAAIAEQEiAHKAIAIQEgACABEBIgAEGIA2ohAyADKAIAIQEgAQRAIABBhANqIQUgBSgCACECIAJBAEoEQEEAIQIDQCABIAJBKGxqQQRqIQEgASgCACEBIAAgARASIAJBAWohAiAFKAIAIQcgAygCACEBIAIgB0gNAAsLIAAgARASCyAAQQRqIQIgAigCACEBIAFBAEoEQEEAIQEDQCAAQZQGaiABQQJ0aiEDIAMoAgAhAyAAIAMQEiAAQZQHaiABQQJ0aiEDIAMoAgAhAyAAIAMQEiAAQdgHaiABQQJ0aiEDIAMoAgAhAyAAIAMQEiABQQFqIQEgAigCACEDIAEgA0ghAyABQRBJIQUgBSADcQ0ACwtBACEBA0AgAEGgCGogAUECdGohAiACKAIAIQIgACACEBIgAEGoCGogAUECdGohAiACKAIAIQIgACACEBIgAEGwCGogAUECdGohAiACKAIAIQIgACACEBIgAEG4CGogAUECdGohAiACKAIAIQIgACACEBIgAEHACGogAUECdGohAiACKAIAIQIgACACEBIgAUEBaiEBIAFBAkcNAAsLGwAgAEHEAGohACAAKAIAIQAgAEUEQCABEF8LC3wBAX8gAEHUB2ohASABQQA2AgAgAEGAC2ohASABQQA2AgAgAEH4CmohASABQQA2AgAgAEGcCGohASABQQA2AgAgAEHVCmohASABQQA6AAAgAEH8CmohASABQQA2AgAgAEHUC2ohASABQQA2AgAgAEHYC2ohACAAQQA2AgAL8AQBB38jBiELIwZBEGokBiALQQhqIQcgC0EEaiEKIAshCCAAQSRqIQYgBiwAACEGAn8gBgR/IABBgAtqIQYgBigCACEGIAZBf0oEQCAFQQA2AgAgACABIAIQFgwCCyAAQRRqIQYgBiABNgIAIAEgAmohAiAAQRxqIQkgCSACNgIAIABB2ABqIQIgAkEANgIAIABBABAXIQkgCUUEQCAFQQA2AgBBAAwCCyAAIAcgCCAKEBghCSAJBEAgBygCACECIAgoAgAhCSAKKAIAIQggACACIAkgCBAaIQogByAKNgIAIABBBGohAiACKAIAIQggCEEASgRAQQAhAgNAIABBlAZqIAJBAnRqIQcgBygCACEHIAcgCUECdGohByAAQdQGaiACQQJ0aiEMIAwgBzYCACACQQFqIQIgAiAISA0ACwsgAwRAIAMgCDYCAAsgBSAKNgIAIABB1AZqIQAgBCAANgIAIAYoAgAhACAAIAFrDAILAkACQAJAAkACQCACKAIAIgNBIGsOBAECAgACCyACQQA2AgAgAEHUAGohAiAAEBkhAwJAIANBf0cEQANAIAIoAgAhAyADDQIgABAZIQMgA0F/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ACECIABBmAhqIQYgBigCACEHIAUgA2shCSAJIAdqIQkgAiAJSSEJIAIgB0khDSACIAdrIQJBACACIA0bIQIgAiADaiECIAIgBUohByAFIAIgBxshAiAJBEAgASACNgIAIAYoAgAhACAAIAJqIQAgBiAANgIAQQEMBgsLCyAAQfQKaiECIAIoAgAhAiADIB9rIQYgBiACaiEGIABBmAhqIQIgAiAGNgIAIAhBATYCAAwBBSAAQZgIaiECIAYNAQsMAQsgBCADayEDIAIoAgAhBCADIARqIQMgAiADNgIACyATKAIAIQIgAgRAIABByABqIQIgAigCACECIABB0ABqIQAgACgCACEAIAIgAEcEQEHTE0HEE0HkGkHnFBAECwsgASAFNgIAQQELIQAgHCQGIAALqAIBBX8gAEHoCmohBSAFKAIAIQICQCACQQBIBEBBACEABSACIAFIBEAgAUEYSgRAIABBGBAsIQIgAUFoaiEBIAAgARAsIQAgAEEYdCEAIAAgAmohACAADwsgAkUEQCAAQeQKaiECIAJBADYCAAsgAEHkCmohAwJAAkACQANAIAAQLiECIAJBf0YNASAFKAIAIQQgAiAEdCECIAMoAgAhBiAGIAJqIQIgAyACNgIAIAUgBEEIaiICNgIAIAIgAUgNAAwCAAsACyAFQX82AgBBACEADAQLIARBeEgEQEEAIQAMBAsLCyAAQeQKaiEEIAQoAgAhA0EBIAF0IQAgAEF/aiEAIAMgAHEhACADIAF2IQMgBCADNgIAIAIgAWshASAFIAE2AgALCyAAC40CAAJAIABBAEgEf0EABSAAQYCAAUgEQCAAQRBIBEAgAEGACGohACAALAAAIQAMAwsgAEGABEgEQCAAQQV2IQAgAEGACGohACAALAAAIQAgAEEFaiEABSAAQQp2IQAgAEGACGohACAALAAAIQAgAEEKaiEACwwCCyAAQYCAgAhIBH8gAEGAgCBIBH8gAEEPdiEAIABBgAhqIQAgACwAACEAIABBD2oFIABBFHYhACAAQYAIaiEAIAAsAAAhACAAQRRqCwUgAEGAgICAAkgEfyAAQRl2IQAgAEGACGohACAALAAAIQAgAEEZagUgAEEediEAIABBgAhqIQAgACwAACEAIABBHmoLCwshAAsgAAuiAQEDfyAAQdQKaiECIAIsAAAhAQJAAkAgAQ0AIABB3ApqIQEgASgCACEBIAEEQEF/IQMFIAAQLyEBIAEEQCACLAAAIQEgAQ0CQaEUQcQTQfYLQbUUEAQFQX8hAwsLDAELIAFBf2pBGHRBGHUhASACIAE6AAAgAEHsCmohASABKAIAIQIgAkEBaiECIAEgAjYCACAAEDAhACAAQf8BcSEDCyADC6wCAQd/IABB3ApqIQIgAigCACEBAkAgAUUEQCAAQdgKaiEEIAQoAgAhASABQX9GBEAgAEHQCGohASABKAIAIQEgAUF/aiEBIABB4ApqIQMgAyABNgIAIAAQMSEBIAFFBEAgAkEBNgIADAMLIABB0wpqIQEgASwAACEBIAFBAXEhASABBH8gBCgCAAUgAEEgEBUMAwshAQsgAUEBaiEHIAQgBzYCACAAQdQIaiABaiEDIAMsAAAhBiAGQf8BcSEDIAZBf0cEQCACQQE2AgAgAEHgCmohAiACIAE2AgALIABB0AhqIQEgASgCACEBIAcgAU4EQCAEQX82AgALIABB1ApqIQAgACwAACEBIAEEQEHFFEHEE0HoC0HaFBAEBSAAIAY6AAAgAyEFCwsLIAULUQEDfyAAQRRqIQMgAygCACEBIABBHGohAiACKAIAIQIgASACSQR/IAFBAWohACADIAA2AgAgASwAAAUgAEHUAGohACAAQQE2AgBBAAshACAACyABAX8gABAyIQEgAQR/IAAQMwUgAEEeEBVBAAshACAAC2ABAX8gABAwIQEgAUH/AXFBzwBGBEAgABAwIQEgAUH/AXFB5wBGBEAgABAwIQEgAUH/AXFB5wBGBEAgABAwIQAgAEH/AXFB0wBGIQAFQQAhAAsFQQAhAAsFQQAhAAsgAAvZAwEGfyAAEDAhAQJ/IAFB/wFxBH8gAEEfEBVBAAUgABAwIQEgAEHTCmohAiACIAE6AAAgABAjIQUgABAjIQIgABAjGiAAECMhASAAQcwIaiEDIAMgATYCACAAECMaIAAQMCEBIAFB/wFxIQEgAEHQCGohAyADIAE2AgAgAEHUCGohBCAAIAQgARAiIQEgAUUEQCAAQQoQFUEADAILIABB8ApqIQQgBEF+NgIAIAIgBXEhAQJAIAFBf0cEQCADKAIAIQEgAUEASgRAA0ACQCABQX9qIQIgAEHUCGogAmohBiAGLAAAIQYgBkF/Rw0AIAFBAUwNBCACIQEMAQsLIAQgAjYCACAAQfQKaiEBIAEgBTYCAAsLCyAAQdUKaiEBIAEsAAAhASABBEAgAygCACEDIANBAEoEf0EAIQJBACEBA0AgAEHUCGogAWohBCAELQAAIQQgBEH/AXEhBCACIARqIQIgAUEBaiEBIAEgA0gNAAsgAkEbagVBGwshASAAQShqIQIgAigCACECIAEgA2ohASABIAJqIQEgAEEsaiEDIAMgAjYCACAAQTBqIQIgAiABNgIAIABBNGohASABIAU2AgALIABB2ApqIQAgAEEANgIAQQELCyEAIAALowEBB38gAEHoCmohAyADKAIAIQECQCABQRlIBEAgAEHkCmohBCABRQRAIARBADYCAAsgAEHUCmohBSAAQdwKaiEGA0AgBigCACEBIAEEQCAFLAAAIQEgAUUNAwsgABAuIQIgAkF/Rg0CIAMoAgAhASACIAF0IQIgBCgCACEHIAcgAmohAiAEIAI2AgAgAUEIaiECIAMgAjYCACABQRFIDQALCwsLrQUBCX8gABA0IAFBIGohAiACKAIAIQUCQAJAIAVFIgNFDQAgAUGkEGohAiACKAIAIQIgAg0AQX8hAQwBCyABQQRqIQIgAigCACECAkACQCACQQhKBEAgAUGkEGohAyADKAIAIQMgAw0BBSADDQELDAELIABB5ApqIQggCCgCACEJIAkQOiEHIAFBrBBqIQIgAigCACECIAJBAUoEQCABQaQQaigCACEKQQAhAwNAIAJBAXYhBSAFIANqIQQgCiAEQQJ0aiEGIAYoAgAhBiAGIAdLIQYgAiAFayECIAMgBCAGGyEDIAUgAiAGGyECIAJBAUoNAAsFQQAhAwsgAUEXaiECIAIsAAAhAiACRQRAIAFBqBBqIQIgAigCACECIAIgA0ECdGohAiACKAIAIQMLIAFBCGohASABKAIAIQEgASADaiEBIAEtAAAhASABQf8BcSEBIABB6ApqIQIgAigCACEAIAAgAUgEf0EAIQBBfwUgACABayEAIAkgAXYhASAIIAE2AgAgAwshASACIAA2AgAMAQsgAUEXaiEDIAMsAAAhAyADBEBBgRVBxBNB6gxBjBUQBAsCQCACQQBKBEAgASgCCCEIIABB5ApqIQlBACEBA0ACQCAIIAFqIQMgAywAACEEIARB/wFxIQMgBEF/RwRAIAUgAUECdGoh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IwZBEGokBiACIQECfCAAvUIgiKdB/////wdxIgNB/MOk/wNJBHwgA0GewZryA0kEfEQAAAAAAADwPwUgAEQAAAAAAAAAABByCwUgACAAoSADQf//v/8HSw0BGgJAAkACQAJAIAAgARBuQQNxDgMAAQIDCyABKwMAIAErAwgQcgwECyABKwMAIAErAwhBARBwmgwDCyABKwMAIAErAwgQcpoMAgsgASsDACABKwMIQQEQcAsLIQAgAiQGIAALywEBA38jBiECIwZBEGokBiACIQECQCAAvUIgiKdB/////wdxIgNB/MOk/wNJBEAgA0GAgMDyA08EQCAARAAAAAAAAAAAQQAQcCEACwUgA0H//7//B0sEQCAAIAChIQAMAgsCQAJAAkACQAJAIAAgARBuQQNxDgMAAQIDCyABKwMAIAErAwhBARBwIQAMBQsgASsDACABKwMIEHIhAAwECyABKwMAIAErAwhBARBwmiEADAMLIAErAwAgASsDCBBymiEACwsLIAIkBiAAC5sDAwJ/AX4CfCAAvSIDQj+IpyEBAnwCfwJAIANCIIinQf////8HcSICQarGmIQESwR8IANC////////////AINCgICAgICAgPj/AFYEQCAADwsgAETvOfr+Qi6GQGQEQCAARAAAAAAAAOB/og8FIABE0rx63SsjhsBjIABEUTAt1RBJh8BjcUUNAkQAAAAAAAAAACIADwsABSACQcLc2P4DSwRAIAJBscXC/wNLDQIgAUEBcyABawwDCyACQYCAwPEDSwR8QQAhASAABSAARAAAAAAAAPA/oA8LCwwCCyAARP6CK2VHFfc/oiABQQN0QYATaisDAKCqCyEBIAAgAbciBEQAAOD+Qi7mP6KhIgAgBER2PHk17znqPaIiBaELIQQgACAEIAQgBCAEoiIAIAAgACAAIABE0KS+cmk3Zj6iRPFr0sVBvbu+oKJELN4lr2pWET+gokSTvb4WbMFmv6CiRD5VVVVVVcU/oKKhIgCiRAAAAAAAAABAIAChoyAFoaBEAAAAAAAA8D+gIQAgAUUEQCAADwsgACABEGULnwMDAn8BfgV8IAC9IgNCIIinIQECfyADQgBTIgIgAUGAgMAASXIEfyADQv///////////wCDQgBRBEBEAAAAAAAA8L8gACAAoqMPCyACRQRAIABEAAAAAAAAUEOi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mgDjqR0AXmGRAAgb5gCFmWUAoBRfAI1AaACA2P8AJ3NNAAYGMQDKVhUAyahzAHviYABrjMAAQcMSC11A+yH5PwAAAAAtRHQ+AAAAgJhG+DwAAABgUcx4OwAAAICDG/A5AAAAQCAlejgAAACAIoLjNgAAAAAd82k1AAAAAAAA4D8AAAAAAADgvwAAAAAAAPA/AAAAAAAA+D8AQagTCwgG0M9D6/1MPgBBuxMLigZAA7jiP09nZ1MuL3N0Yl92b3JiaXMuYwBmLT5hbGxvYy5hbGxvY19idWZmZXJfbGVuZ3RoX2luX2J5dGVzID09IGYtPnRlbXBfb2Zmc2V0AHZvcmJpc19kZWNvZGVfaW5pdGlhbABmLT5ieXRlc19pbl9zZWcgPiAwAGdldDhfcGFja2V0X3JhdwBmLT5ieXRlc19pbl9zZWcgPT0gMABuZXh0X3NlZ21lbnQAdm9yYmlzX2RlY29kZV9wYWNrZXRfcmVzdAAhYy0+c3BhcnNlAGNvZGVib29rX2RlY29kZV9zY2FsYXJfcmF3ACFjLT5zcGFyc2UgfHwgeiA8IGMtPnNvcnRlZF9lbnRyaWVzAGNvZGVib29rX2RlY29kZV9kZWludGVybGVhdmVfcmVwZWF0AHogPCBjLT5zb3J0ZWRfZW50cmllcwBjb2RlYm9va19kZWNvZGVfc3RhcnQAKG4gJiAzKSA9PSAwAGltZGN0X3N0ZXAzX2l0ZXIwX2xvb3AAMABnZXRfd2luZG93AGYtPnRlbXBfb2Zmc2V0ID09IGYtPmFsbG9jLmFsbG9jX2J1ZmZlcl9sZW5ndGhfaW5fYnl0ZXMAc3RhcnRfZGVjb2RlcgB2b3JiaXNjLT5zb3J0ZWRfZW50cmllcyA9PSAwAGNvbXB1dGVfY29kZXdvcmRzAHogPj0gMCAmJiB6IDwgMzIAbGVuW2ldID49IDAgJiYgbGVuW2ldIDwgMzIAYXZhaWxhYmxlW3ldID09IDAAayA9PSBjLT5zb3J0ZWRfZW50cmllcwBjb21wdXRlX3NvcnRlZF9odWZmbWFuAGMtPnNvcnRlZF9jb2Rld29yZHNbeF0gPT0gY29kZQBsZW4gIT0gTk9fQ09ERQBpbmNsdWRlX2luX3NvcnQAcG93KChmbG9hdCkgcisxLCBkaW0pID4gZW50cmllcwBsb29rdXAxX3ZhbHVlcwAoaW50KSBmbG9vcihwb3coKGZsb2F0KSByLCBkaW0pKSA8PSBlbnRyaWVzAOoPBG5hbWUB4g9+AAVhYm9ydAENZW5sYXJnZU1lbW9yeQIOZ2V0VG90YWxNZW1vcnkDF2Fib3J0T25DYW5ub3RHcm93TWVtb3J5BA5fX19hc3NlcnRfZmFpbAULX19fc2V0RXJyTm8GBl9hYm9ydAcWX2Vtc2NyaXB0ZW5fbWVtY3B5X2JpZwgQX19ncm93V2FzbU1lbW9yeQkKc3RhY2tBbGxvYwoJc3RhY2tTYXZlCwxzdGFja1Jlc3RvcmUME2VzdGFibGlzaFN0YWNrU3BhY2UNCHNldFRocmV3DgtzZXRUZW1wUmV0MA8LZ2V0VGVtcFJldDAQEV9zdGJfdm9yYmlzX2Nsb3NlEQ5fdm9yYmlzX2RlaW5pdBILX3NldHVwX2ZyZWUTGl9zdGJfdm9yYmlzX2ZsdXNoX3B1c2hkYXRhFCFfc3RiX3ZvcmJpc19kZWNvZGVfZnJhbWVfcHVzaGRhdGEVBl9lcnJvchYgX3ZvcmJpc19zZWFyY2hfZm9yX3BhZ2VfcHVzaGRhdGEXGF9pc193aG9sZV9wYWNrZXRfcHJlc2VudBgVX3ZvcmJpc19kZWNvZGVfcGFja2V0GQxfZ2V0OF9wYWNrZXQaFF92b3JiaXNfZmluaXNoX2ZyYW1lGxlfc3RiX3ZvcmJpc19vcGVuX3B1c2hkYXRhHAxfdm9yYmlzX2luaXQdDl9zdGFydF9kZWNvZGVyHg1fdm9yYmlzX2FsbG9jHxtfc3RiX3ZvcmJpc19nZXRfZmlsZV9vZmZzZXQgE19tYXliZV9zdGFydF9wYWNrZXQhDV9mbHVzaF9wYWNrZXQiBV9nZXRuIwZfZ2V0MzIkE19zdGJfdm9yYmlzX2pzX29wZW4lFF9zdGJfdm9yYmlzX2pzX2Nsb3NlJhdfc3RiX3ZvcmJpc19qc19jaGFubmVscycaX3N0Yl92b3JiaXNfanNfc2FtcGxlX3JhdGUoFV9zdGJfdm9yYmlzX2pzX2RlY29kZSkNX2NyYzMyX3VwZGF0ZSoWX3ZvcmJpc19kZWNvZGVfaW5pdGlhbCsaX3ZvcmJpc19kZWNvZGVfcGFja2V0X3Jlc3QsCV9nZXRfYml0cy0FX2lsb2cuEF9nZXQ4X3BhY2tldF9yYXcvDV9uZXh0X3NlZ21lbnQwBV9nZXQ4MQtfc3RhcnRfcGFnZTIQX2NhcHR1cmVfcGF0dGVybjMdX3N0YXJ0X3BhZ2Vfbm9fY2FwdHVyZXBhdHRlcm40DV9wcmVwX2h1ZmZtYW41G19jb2RlYm9va19kZWNvZGVfc2NhbGFyX3JhdzYOX3ByZWRpY3RfcG9pbnQ3D19kZWNvZGVfcmVzaWR1ZTgJX2RvX2Zsb29yOQ1faW52ZXJzZV9tZGN0OgxfYml0X3JldmVyc2U7EV9tYWtlX2Jsb2NrX2FycmF5PBJfc2V0dXBfdGVtcF9tYWxsb2M9JF9jb2RlYm9va19kZWNvZGVfZGVpbnRlcmxlYXZlX3JlcGVhdD4PX3Jlc2lkdWVfZGVjb2RlPxVfY29kZWJvb2tfZGVjb2RlX3N0ZXBAEF9jb2RlYm9va19kZWNvZGVBFl9jb2RlYm9va19kZWNvZGVfc3RhcnRCCl9kcmF3X2xpbmVDF19pbWRjdF9zdGVwM19pdGVyMF9sb29wRBlfaW1kY3Rfc3RlcDNfaW5uZXJfcl9sb29wRRlfaW1kY3Rfc3RlcDNfaW5uZXJfc19sb29wRh9faW1kY3Rfc3RlcDNfaW5uZXJfc19sb29wX2xkNjU0RwhfaXRlcl81NEgLX2dldF93aW5kb3dJEF92b3JiaXNfdmFsaWRhdGVKDV9zdGFydF9wYWNrZXRLBV9za2lwTAtfY3JjMzJfaW5pdE0NX3NldHVwX21hbGxvY04QX3NldHVwX3RlbXBfZnJlZU8SX2NvbXB1dGVfY29kZXdvcmRzUBdfY29tcHV0ZV9zb3J0ZWRfaHVmZm1hblEcX2NvbXB1dGVfYWNjZWxlcmF0ZWRfaHVmZm1hblIPX2Zsb2F0MzJfdW5wYWNrUw9fbG9va3VwMV92YWx1ZXNUDl9wb2ludF9jb21wYXJlVQpfbmVpZ2hib3JzVg9faW5pdF9ibG9ja3NpemVXCl9hZGRfZW50cnlYEF9pbmNsdWRlX2luX3NvcnRZD191aW50MzJfY29tcGFyZVoYX2NvbXB1dGVfdHdpZGRsZV9mYWN0b3JzWw9fY29tcHV0ZV93aW5kb3dcE19jb21wdXRlX2JpdHJldmVyc2VdB19zcXVhcmVeB19tYWxsb2NfBV9mcmVlYAhfcmVhbGxvY2ESX3RyeV9yZWFsbG9jX2NodW5rYg5fZGlzcG9zZV9jaHVua2MRX19fZXJybm9fbG9jYXRpb25kB19tZW1jbXBlB19zY2FsYm5mBl9xc29ydGcFX3NpZnRoBF9zaHJpCF90cmlua2xlagRfc2hsawVfcG50emwIX2FfY3R6X2xtBl9jeWNsZW4LX19fcmVtX3BpbzJvEV9fX3JlbV9waW8yX2xhcmdlcAZfX19zaW5xBl9sZGV4cHIGX19fY29zcwRfY29zdARfc2ludQRfZXhwdgRfbG9ndwRfcG93eAtydW5Qb3N0U2V0c3kHX21lbWNweXoHX21lbXNldHsFX3Nicmt8C2R5bkNhbGxfaWlpfQJiMA=="),function(c){return c.charCodeAt(0)});var Module=typeof Module!=="undefined"?Module:{};var moduleOverrides={};var key;for(key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}
Module["arguments"]=[];Module["thisProgram"]="./this.program";Module["quit"]=function(status,toThrow){throw toThrow};Module["preRun"]=[];Module["postRun"]=[];var ENVIRONMENT_IS_WEB=false;var ENVIRONMENT_IS_WORKER=false;var ENVIRONMENT_IS_NODE=false;var ENVIRONMENT_IS_SHELL=false;ENVIRONMENT_IS_WEB=typeof window==="object";ENVIRONMENT_IS_WORKER=typeof importScripts==="function";ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof require==="function"&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}else{return scriptDirectory+path}}
if(ENVIRONMENT_IS_NODE){scriptDirectory=__dirname+"/";var nodeFS;var nodePath;Module["read"]=function shell_read(filename,binary){var ret;if(!nodeFS)nodeFS=require("fs");if(!nodePath)nodePath=require("path");filename=nodePath["normalize"](filename);ret=nodeFS["readFileSync"](filename);return binary?ret:ret.toString()};Module["readBinary"]=function readBinary(filename){var ret=Module["read"](filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}
assert(ret.buffer);return ret};if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/")}
Module["arguments"]=process["argv"].slice(2);if(typeof module!=="undefined"){module["exports"]=Module}
process["on"]("uncaughtException",function(ex){if(!(ex instanceof ExitStatus)){throw ex}});process["on"]("unhandledRejection",function(reason,p){process["exit"](1)});Module["quit"]=function(status){process["exit"](status)};Module["inspect"]=function(){return"[Emscripten Module object]"}}else if(ENVIRONMENT_IS_SHELL){if(typeof read!="undefined"){Module["read"]=function shell_read(f){return read(f)}}
Module["readBinary"]=function readBinary(f){var data;if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}
data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}
if(typeof quit==="function"){Module["quit"]=function(status){quit(status)}}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WEB){if(document.currentScript){scriptDirectory=document.currentScript.src}}else{scriptDirectory=window.location.href}
if(scriptDirectory.indexOf("blob:")!==0){scriptDirectory=scriptDirectory.split("/").slice(0,-1).join("/")+"/"}else{scriptDirectory=""}
Module["read"]=function shell_read(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(ENVIRONMENT_IS_WORKER){Module["readBinary"]=function readBinary(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}}
Module["readAsync"]=function readAsync(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}
onerror()};xhr.onerror=onerror;xhr.send(null)};Module["setWindowTitle"]=function(title){document.title=title}}else{}
var out=Module["print"]||(typeof console!=="undefined"?console.log.bind(console):typeof print!=="undefined"?print:null);var err=Module["printErr"]||(typeof printErr!=="undefined"?printErr:typeof console!=="undefined"&&console.warn.bind(console)||out);for(key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}
moduleOverrides=undefined;var STACK_ALIGN=16;function staticAlloc(size){var ret=STATICTOP;STATICTOP=STATICTOP+size+15&-16;return ret}
function dynamicAlloc(size){var ret=HEAP32[DYNAMICTOP_PTR>>2];var end=ret+size+15&-16;HEAP32[DYNAMICTOP_PTR>>2]=end;if(end>=TOTAL_MEMORY){var success=enlargeMemory();if(!success){HEAP32[DYNAMICTOP_PTR>>2]=ret;return 0}}
return ret}
function alignMemory(size,factor){if(!factor)factor=STACK_ALIGN;var ret=size=Math.ceil(size/factor)*factor;return ret}
function getNativeTypeSize(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return 4}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0);return bits/8}else{return 0}}}}
function warnOnce(text){if(!warnOnce.shown)warnOnce.shown={};if(!warnOnce.shown[text]){warnOnce.shown[text]=1;err(text)}}
var asm2wasmImports={"f64-rem":function(x,y){return x%y},debugger:function(){debugger}};var jsCallStartIndex=1;var functionPointers=new Array(0);function addFunction(func,sig){var base=0;for(var i=base;i<base+0;i++){if(!functionPointers[i]){functionPointers[i]=func;return jsCallStartIndex+i}}
throw"Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS."}
function removeFunction(index){functionPointers[index-jsCallStartIndex]=null}
var funcWrappers={};function getFuncWrapper(func,sig){if(!func)return;assert(sig);if(!funcWrappers[sig]){funcWrappers[sig]={}}
var sigCache=funcWrappers[sig];if(!sigCache[func]){if(sig.length===1){sigCache[func]=function dynCall_wrapper(){return dynCall(sig,func)}}else if(sig.length===2){sigCache[func]=function dynCall_wrapper(arg){return dynCall(sig,func,[arg])}}else{sigCache[func]=function dynCall_wrapper(){return dynCall(sig,func,Array.prototype.slice.call(arguments))}}}
return sigCache[func]}
function makeBigInt(low,high,unsigned){return unsigned?+(low>>>0)+ +(high>>>0)*4294967296:+(low>>>0)+ +(high|0)*4294967296}
function dynCall(sig,ptr,args){if(args&&args.length){return Module["dynCall_"+sig].apply(null,[ptr].concat(args))}else{return Module["dynCall_"+sig].call(null,ptr)}}
var Runtime={dynCall:dynCall};var GLOBAL_BASE=1024;var ABORT=0;var EXITSTATUS=0;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}
var globalScope=this;function getCFunc(ident){var func=Module["_"+ident];assert(func,"Cannot call unknown function "+ident+", make sure it is exported");return func}
var JSfuncs={stackSave:function(){stackSave()},stackRestore:function(){stackRestore()},arrayToC:function(arr){var ret=stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret},stringToC:function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){var len=(str.length<<2)+1;ret=stackAlloc(len);stringToUTF8(str,ret,len)}
return ret}};var toC={string:JSfuncs["stringToC"],array:JSfuncs["arrayToC"]};function ccall(ident,returnType,argTypes,args,opts){function convertReturnValue(ret){if(returnType==="string")return Pointer_stringify(ret);if(returnType==="boolean")return Boolean(ret);return ret}
var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}
var ret=func.apply(null,cArgs);ret=convertReturnValue(ret);if(stack!==0)stackRestore(stack);return ret}
function cwrap(ident,returnType,argTypes,opts){argTypes=argTypes||[];var numericArgs=argTypes.every(function(type){return type==="number"});var numericRet=returnType!=="string";if(numericRet&&numericArgs&&!opts){return getCFunc(ident)}
return function(){return ccall(ident,returnType,argTypes,arguments,opts)}}
function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=1?tempDouble>0?(Math_min(+Math_floor(tempDouble/4294967296),4294967295)|0)>>>0:~~+Math_ceil((tempDouble- +(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type)}}
function getValue(ptr,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":return HEAP8[ptr>>0];case"i8":return HEAP8[ptr>>0];case"i16":return HEAP16[ptr>>1];case"i32":return HEAP32[ptr>>2];case"i64":return HEAP32[ptr>>2];case"float":return HEAPF32[ptr>>2];case"double":return HEAPF64[ptr>>3];default:abort("invalid type for getValue: "+type)}
return null}
var ALLOC_NORMAL=0;var ALLOC_STACK=1;var ALLOC_STATIC=2;var ALLOC_DYNAMIC=3;var ALLOC_NONE=4;function allocate(slab,types,allocator,ptr){var zeroinit,size;if(typeof slab==="number"){zeroinit=true;size=slab}else{zeroinit=false;size=slab.length}
var singleType=typeof types==="string"?types:null;var ret;if(allocator==ALLOC_NONE){ret=ptr}else{ret=[typeof _malloc==="function"?_malloc:staticAlloc,stackAlloc,staticAlloc,dynamicAlloc][allocator===undefined?ALLOC_STATIC:allocator](Math.max(size,singleType?1:types.length))}
if(zeroinit){var stop;ptr=ret;assert((ret&3)==0);stop=ret+(size&~3);for(;ptr<stop;ptr+=4){HEAP32[ptr>>2]=0}
stop=ret+size;while(ptr<stop){HEAP8[ptr++>>0]=0}
return ret}
if(singleType==="i8"){if(slab.subarray||slab.slice){HEAPU8.set(slab,ret)}else{HEAPU8.set(new Uint8Array(slab),ret)}
return ret}
var i=0,type,typeSize,previousType;while(i<size){var curr=slab[i];type=singleType||types[i];if(type===0){i++;continue}
if(type=="i64")type="i32";setValue(ret+i,curr,type);if(previousType!==type){typeSize=getNativeTypeSize(type);previousType=type}
i+=typeSize}
return ret}
function getMemory(size){if(!staticSealed)return staticAlloc(size);if(!runtimeInitialized)return dynamicAlloc(size);return _malloc(size)}
function Pointer_stringify(ptr,length){if(length===0||!ptr)return"";var hasUtf=0;var t;var i=0;while(1){t=HEAPU8[ptr+i>>0];hasUtf|=t;if(t==0&&!length)break;i++;if(length&&i==length)break}
if(!length)length=i;var ret="";if(hasUtf<128){var MAX_CHUNK=1024;var curr;while(length>0){curr=String.fromCharCode.apply(String,HEAPU8.subarray(ptr,ptr+Math.min(length,MAX_CHUNK)));ret=ret?ret+curr:curr;ptr+=MAX_CHUNK;length-=MAX_CHUNK}
return ret}
return UTF8ToString(ptr)}
function AsciiToString(ptr){var str="";while(1){var ch=HEAP8[ptr++>>0];if(!ch)return str;str+=String.fromCharCode(ch)}}
function stringToAscii(str,outPtr){return writeAsciiToMemory(str,outPtr,false)}
var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;function UTF8ArrayToString(u8Array,idx){var endPtr=idx;while(u8Array[endPtr])++endPtr;if(endPtr-idx>16&&u8Array.subarray&&UTF8Decoder){return UTF8Decoder.decode(u8Array.subarray(idx,endPtr))}else{var u0,u1,u2,u3,u4,u5;var str="";while(1){u0=u8Array[idx++];if(!u0)return str;if(!(u0&128)){str+=String.fromCharCode(u0);continue}
u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}
u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u3=u8Array[idx++]&63;if((u0&248)==240){u0=(u0&7)<<18|u1<<12|u2<<6|u3}else{u4=u8Array[idx++]&63;if((u0&252)==248){u0=(u0&3)<<24|u1<<18|u2<<12|u3<<6|u4}else{u5=u8Array[idx++]&63;u0=(u0&1)<<30|u1<<24|u2<<18|u3<<12|u4<<6|u5}}}
if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}}
function UTF8ToString(ptr){return UTF8ArrayToString(HEAPU8,ptr)}
function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023}
if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=2097151){if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=67108863){if(outIdx+4>=endIdx)break;outU8Array[outIdx++]=248|u>>24;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else{if(outIdx+5>=endIdx)break;outU8Array[outIdx++]=252|u>>30;outU8Array[outIdx++]=128|u>>24&63;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}}
outU8Array[outIdx]=0;return outIdx-startIdx}
function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}
function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){++len}else if(u<=2047){len+=2}else if(u<=65535){len+=3}else if(u<=2097151){len+=4}else if(u<=67108863){len+=5}else{len+=6}}
return len}
var UTF16Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf-16le"):undefined;function UTF16ToString(ptr){var endPtr=ptr;var idx=endPtr>>1;while(HEAP16[idx])++idx;endPtr=idx<<1;if(endPtr-ptr>32&&UTF16Decoder){return UTF16Decoder.decode(HEAPU8.subarray(ptr,endPtr))}else{var i=0;var str="";while(1){var codeUnit=HEAP16[ptr+i*2>>1];if(codeUnit==0)return str;++i;str+=String.fromCharCode(codeUnit)}}}
function stringToUTF16(str,outPtr,maxBytesToWrite){if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647}
if(maxBytesToWrite<2)return 0;maxBytesToWrite-=2;var startPtr=outPtr;var numCharsToWrite=maxBytesToWrite<str.length*2?maxBytesToWrite/2:str.length;for(var i=0;i<numCharsToWrite;++i){var codeUnit=str.charCodeAt(i);HEAP16[outPtr>>1]=codeUnit;outPtr+=2}
HEAP16[outPtr>>1]=0;return outPtr-startPtr}
function lengthBytesUTF16(str){return str.length*2}
function UTF32ToString(ptr){var i=0;var str="";while(1){var utf32=HEAP32[ptr+i*4>>2];if(utf32==0)return str;++i;if(utf32>=65536){var ch=utf32-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}else{str+=String.fromCharCode(utf32)}}}
function stringToUTF32(str,outPtr,maxBytesToWrite){if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647}
if(maxBytesToWrite<4)return 0;var startPtr=outPtr;var endPtr=startPtr+maxBytesToWrite-4;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343){var trailSurrogate=str.charCodeAt(++i);codeUnit=65536+((codeUnit&1023)<<10)|trailSurrogate&1023}
HEAP32[outPtr>>2]=codeUnit;outPtr+=4;if(outPtr+4>endPtr)break}
HEAP32[outPtr>>2]=0;return outPtr-startPtr}
function lengthBytesUTF32(str){var len=0;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343)++i;len+=4}
return len}
function allocateUTF8(str){var size=lengthBytesUTF8(str)+1;var ret=_malloc(size);if(ret)stringToUTF8Array(str,HEAP8,ret,size);return ret}
function allocateUTF8OnStack(str){var size=lengthBytesUTF8(str)+1;var ret=stackAlloc(size);stringToUTF8Array(str,HEAP8,ret,size);return ret}
function demangle(func){return func}
function demangleAll(text){var regex=/__Z[\w\d_]+/g;return text.replace(regex,function(x){var y=demangle(x);return x===y?x:x+" ["+y+"]"})}
function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e}
if(!err.stack){return"(no stack trace available)"}}
return err.stack.toString()}
function stackTrace(){var js=jsStackTrace();if(Module["extraStackTrace"])js+="\n"+Module["extraStackTrace"]();return demangleAll(js)}
var PAGE_SIZE=16384;var WASM_PAGE_SIZE=65536;var ASMJS_PAGE_SIZE=16777216;var MIN_TOTAL_MEMORY=16777216;function alignUp(x,multiple){if(x%multiple>0){x+=multiple-x%multiple}
return x}
var HEAP,buffer,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBuffer(buf){Module["buffer"]=buffer=buf}
function updateGlobalBufferViews(){Module["HEAP8"]=HEAP8=new Int8Array(buffer);Module["HEAP16"]=HEAP16=new Int16Array(buffer);Module["HEAP32"]=HEAP32=new Int32Array(buffer);Module["HEAPU8"]=HEAPU8=new Uint8Array(buffer);Module["HEAPU16"]=HEAPU16=new Uint16Array(buffer);Module["HEAPU32"]=HEAPU32=new Uint32Array(buffer);Module["HEAPF32"]=HEAPF32=new Float32Array(buffer);Module["HEAPF64"]=HEAPF64=new Float64Array(buffer)}
var STATIC_BASE,STATICTOP,staticSealed;var STACK_BASE,STACKTOP,STACK_MAX;var DYNAMIC_BASE,DYNAMICTOP_PTR;STATIC_BASE=STATICTOP=STACK_BASE=STACKTOP=STACK_MAX=DYNAMIC_BASE=DYNAMICTOP_PTR=0;staticSealed=false;function abortOnCannotGrowMemory(){abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value "+TOTAL_MEMORY+", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")}
if(!Module["reallocBuffer"])Module["reallocBuffer"]=function(size){var ret;try{if(ArrayBuffer.transfer){ret=ArrayBuffer.transfer(buffer,size)}else{var oldHEAP8=HEAP8;ret=new ArrayBuffer(size);var temp=new Int8Array(ret);temp.set(oldHEAP8)}}catch(e){return false}
var success=_emscripten_replace_memory(ret);if(!success)return false;return ret};function enlargeMemory(){var PAGE_MULTIPLE=Module["usingWasm"]?WASM_PAGE_SIZE:ASMJS_PAGE_SIZE;var LIMIT=2147483648-PAGE_MULTIPLE;if(HEAP32[DYNAMICTOP_PTR>>2]>LIMIT){return false}
var OLD_TOTAL_MEMORY=TOTAL_MEMORY;TOTAL_MEMORY=Math.max(TOTAL_MEMORY,MIN_TOTAL_MEMORY);while(TOTAL_MEMORY<HEAP32[DYNAMICTOP_PTR>>2]){if(TOTAL_MEMORY<=536870912){TOTAL_MEMORY=alignUp(2*TOTAL_MEMORY,PAGE_MULTIPLE)}else{TOTAL_MEMORY=Math.min(alignUp((3*TOTAL_MEMORY+2147483648)/4,PAGE_MULTIPLE),LIMIT)}}
var replacement=Module["reallocBuffer"](TOTAL_MEMORY);if(!replacement||replacement.byteLength!=TOTAL_MEMORY){TOTAL_MEMORY=OLD_TOTAL_MEMORY;return false}
updateGlobalBuffer(replacement);updateGlobalBufferViews();return true}
var byteLength;try{byteLength=Function.prototype.call.bind(Object.getOwnPropertyDescriptor(ArrayBuffer.prototype,"byteLength").get);byteLength(new ArrayBuffer(4))}catch(e){byteLength=function(buffer){return buffer.byteLength}}
var TOTAL_STACK=Module["TOTAL_STACK"]||5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;if(TOTAL_MEMORY<TOTAL_STACK)err("TOTAL_MEMORY should be larger than TOTAL_STACK, was "+TOTAL_MEMORY+"! (TOTAL_STACK="+TOTAL_STACK+")");if(Module["buffer"]){buffer=Module["buffer"]}else{if(typeof WebAssembly==="object"&&typeof WebAssembly.Memory==="function"){Module["wasmMemory"]=new WebAssembly.Memory({initial:TOTAL_MEMORY/WASM_PAGE_SIZE});buffer=Module["wasmMemory"].buffer}else{buffer=new ArrayBuffer(TOTAL_MEMORY)}
Module["buffer"]=buffer}
updateGlobalBufferViews();function getTotalMemory(){return TOTAL_MEMORY}
function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}
var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Module["dynCall_v"](func)}else{Module["dynCall_vi"](func,callback.arg)}}else{func(callback.arg===undefined?null:callback.arg)}}}
var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATEXIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}
callRuntimeCallbacks(__ATPRERUN__)}
function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}
function preMain(){callRuntimeCallbacks(__ATMAIN__)}
function exitRuntime(){callRuntimeCallbacks(__ATEXIT__);runtimeExited=true}
function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}
callRuntimeCallbacks(__ATPOSTRUN__)}
function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}
function addOnInit(cb){__ATINIT__.unshift(cb)}
function addOnPreMain(cb){__ATMAIN__.unshift(cb)}
function addOnExit(cb){__ATEXIT__.unshift(cb)}
function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}
function writeStringToMemory(string,buffer,dontAddNull){warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!");var lastChar,end;if(dontAddNull){end=buffer+lengthBytesUTF8(string);lastChar=HEAP8[end]}
stringToUTF8(string,buffer,Infinity);if(dontAddNull)HEAP8[end]=lastChar}
function writeArrayToMemory(array,buffer){HEAP8.set(array,buffer)}
function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i)}
if(!dontAddNull)HEAP8[buffer>>0]=0}
function unSign(value,bits,ignore){if(value>=0){return value}
return bits<=32?2*Math.abs(1<<bits-1)+value:Math.pow(2,bits)+value}
function reSign(value,bits,ignore){if(value<=0){return value}
var half=bits<=32?Math.abs(1<<bits-1):Math.pow(2,bits-1);if(value>=half&&(bits<=32||value>half)){value=-2*half+value}
return value}
var Math_abs=Math.abs;var Math_cos=Math.cos;var Math_sin=Math.sin;var Math_tan=Math.tan;var Math_acos=Math.acos;var Math_asin=Math.asin;var Math_atan=Math.atan;var Math_atan2=Math.atan2;var Math_exp=Math.exp;var Math_log=Math.log;var Math_sqrt=Math.sqrt;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_pow=Math.pow;var Math_imul=Math.imul;var Math_fround=Math.fround;var Math_round=Math.round;var Math_min=Math.min;var Math_max=Math.max;var Math_clz32=Math.clz32;var Math_trunc=Math.trunc;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function getUniqueRunDependency(id){return id}
function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}
function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}
if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}
if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}
Module["preloadedImages"]={};Module["preloadedAudios"]={};var memoryInitializer=null;var dataURIPrefix="data:application/octet-stream;base64,";function isDataURI(filename){return String.prototype.startsWith?filename.startsWith(dataURIPrefix):filename.indexOf(dataURIPrefix)===0}
function integrateWasmJS(){var method="native-wasm";var wasmTextFile="main.wast";var wasmBinaryFile="main.wasm";var asmjsCodeFile="main.temp.asm.js";if(!isDataURI(wasmTextFile)){wasmTextFile=locateFile(wasmTextFile)}
if(!isDataURI(wasmBinaryFile)){wasmBinaryFile=locateFile(wasmBinaryFile)}
if(!isDataURI(asmjsCodeFile)){asmjsCodeFile=locateFile(asmjsCodeFile)}
var wasmPageSize=64*1024;var info={global:null,env:null,asm2wasm:asm2wasmImports,parent:Module};var exports=null;function mergeMemory(newBuffer){var oldBuffer=Module["buffer"];if(newBuffer.byteLength<oldBuffer.byteLength){err("the new buffer in mergeMemory is smaller than the previous one. in native wasm, we should grow memory here")}
var oldView=new Int8Array(oldBuffer);var newView=new Int8Array(newBuffer);newView.set(oldView);updateGlobalBuffer(newBuffer);updateGlobalBufferViews()}
function fixImports(imports){return imports}
function getBinary(){try{if(Module["wasmBinary"]){return new Uint8Array(Module["wasmBinary"])}
if(Module["readBinary"]){return Module["readBinary"](wasmBinaryFile)}else{throw"both async and sync fetching of the wasm failed"}}catch(err){abort(err)}}
function getBinaryPromise(){if(!Module["wasmBinary"]&&(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER)&&typeof fetch==="function"){return fetch(wasmBinaryFile,{credentials:"same-origin"}).then(function(response){if(!response["ok"]){throw"failed to load wasm binary file at '"+wasmBinaryFile+"'"}
return response["arrayBuffer"]()}).catch(function(){return getBinary()})}
return new Promise(function(resolve,reject){resolve(getBinary())})}
function doNativeWasm(global,env,providedBuffer){if(typeof WebAssembly!=="object"){err("no native wasm support detected");return false}
if(!(Module["wasmMemory"]instanceof WebAssembly.Memory)){err("no native wasm Memory in use");return false}
env["memory"]=Module["wasmMemory"];info["global"]={NaN:NaN,Infinity:Infinity};info["global.Math"]=Math;info["env"]=env;function receiveInstance(instance,module){exports=instance.exports;if(exports.memory)mergeMemory(exports.memory);Module["asm"]=exports;Module["usingWasm"]=true;removeRunDependency("wasm-instantiate")}
addRunDependency("wasm-instantiate");if(Module["instantiateWasm"]){try{return Module["instantiateWasm"](info,receiveInstance)}catch(e){err("Module.instantiateWasm callback failed with error: "+e);return false}}
function receiveInstantiatedSource(output){receiveInstance(output["instance"],output["module"])}
function instantiateArrayBuffer(receiver){getBinaryPromise().then(function(binary){return WebAssembly.instantiate(binary,info)}).then(receiver).catch(function(reason){err("failed to asynchronously prepare wasm: "+reason);abort(reason)})}
if(!Module["wasmBinary"]&&typeof WebAssembly.instantiateStreaming==="function"&&!isDataURI(wasmBinaryFile)&&typeof fetch==="function"){WebAssembly.instantiateStreaming(fetch(wasmBinaryFile,{credentials:"same-origin"}),info).then(receiveInstantiatedSource).catch(function(reason){err("wasm streaming compile failed: "+reason);err("falling back to ArrayBuffer instantiation");instantiateArrayBuffer(receiveInstantiatedSource)})}else{instantiateArrayBuffer(receiveInstantiatedSource)}
return{}}
Module["asmPreload"]=Module["asm"];var asmjsReallocBuffer=Module["reallocBuffer"];var wasmReallocBuffer=function(size){var PAGE_MULTIPLE=Module["usingWasm"]?WASM_PAGE_SIZE:ASMJS_PAGE_SIZE;size=alignUp(size,PAGE_MULTIPLE);var old=Module["buffer"];var oldSize=old.byteLength;if(Module["usingWasm"]){try{var result=Module["wasmMemory"].grow((size-oldSize)/wasmPageSize);if(result!==(-1|0)){return Module["buffer"]=Module["wasmMemory"].buffer}else{return null}}catch(e){return null}}};Module["reallocBuffer"]=function(size){if(finalMethod==="asmjs"){return asmjsReallocBuffer(size)}else{return wasmReallocBuffer(size)}};var finalMethod="";Module["asm"]=function(global,env,providedBuffer){env=fixImports(env);if(!env["table"]){var TABLE_SIZE=Module["wasmTableSize"];if(TABLE_SIZE===undefined)TABLE_SIZE=1024;var MAX_TABLE_SIZE=Module["wasmMaxTableSize"];if(typeof WebAssembly==="object"&&typeof WebAssembly.Table==="function"){if(MAX_TABLE_SIZE!==undefined){env["table"]=new WebAssembly.Table({initial:TABLE_SIZE,maximum:MAX_TABLE_SIZE,element:"anyfunc"})}else{env["table"]=new WebAssembly.Table({initial:TABLE_SIZE,element:"anyfunc"})}}else{env["table"]=new Array(TABLE_SIZE)}
Module["wasmTable"]=env["table"]}
if(!env["memoryBase"]){env["memoryBase"]=Module["STATIC_BASE"]}
if(!env["tableBase"]){env["tableBase"]=0}
var exports;exports=doNativeWasm(global,env,providedBuffer);assert(exports,"no binaryen method succeeded.");return exports};var methodHandler=Module["asm"]}
integrateWasmJS();var ASM_CONSTS=[];STATIC_BASE=GLOBAL_BASE;STATICTOP=STATIC_BASE+4816;__ATINIT__.push();var STATIC_BUMP=4816;Module["STATIC_BASE"]=STATIC_BASE;Module["STATIC_BUMP"]=STATIC_BUMP;var tempDoublePtr=STATICTOP;STATICTOP+=16;function copyTempFloat(ptr){HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1]=HEAP8[ptr+1];HEAP8[tempDoublePtr+2]=HEAP8[ptr+2];HEAP8[tempDoublePtr+3]=HEAP8[ptr+3]}
function copyTempDouble(ptr){HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1]=HEAP8[ptr+1];HEAP8[tempDoublePtr+2]=HEAP8[ptr+2];HEAP8[tempDoublePtr+3]=HEAP8[ptr+3];HEAP8[tempDoublePtr+4]=HEAP8[ptr+4];HEAP8[tempDoublePtr+5]=HEAP8[ptr+5];HEAP8[tempDoublePtr+6]=HEAP8[ptr+6];HEAP8[tempDoublePtr+7]=HEAP8[ptr+7]}
function ___assert_fail(condition,filename,line,func){abort("Assertion failed: "+Pointer_stringify(condition)+", at: "+[filename?Pointer_stringify(filename):"unknown filename",line,func?Pointer_stringify(func):"unknown function"])}
function _abort(){Module["abort"]()}
var _llvm_floor_f64=Math_floor;function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest);return dest}
function ___setErrNo(value){if(Module["___errno_location"])HEAP32[Module["___errno_location"]()>>2]=value;return value}
DYNAMICTOP_PTR=staticAlloc(4);STACK_BASE=STACKTOP=alignMemory(STATICTOP);STACK_MAX=STACK_BASE+TOTAL_STACK;DYNAMIC_BASE=alignMemory(STACK_MAX);HEAP32[DYNAMICTOP_PTR>>2]=DYNAMIC_BASE;staticSealed=true;var ASSERTIONS=false;function intArrayFromString(stringy,dontAddNull,length){var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array}
function intArrayToString(array){var ret=[];for(var i=0;i<array.length;i++){var chr=array[i];if(chr>255){if(ASSERTIONS){assert(false,"Character code "+chr+" ("+String.fromCharCode(chr)+")  at offset "+i+" not in 0x00-0xFF.")}
chr&=255}
ret.push(String.fromCharCode(chr))}
return ret.join("")}
Module["wasmTableSize"]=4;Module["wasmMaxTableSize"]=4;function invoke_iii(index,a1,a2){var sp=stackSave();try{return Module["dynCall_iii"](index,a1,a2)}catch(e){stackRestore(sp);if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}
Module.asmGlobalArg={};Module.asmLibraryArg={abort:abort,assert:assert,enlargeMemory:enlargeMemory,getTotalMemory:getTotalMemory,abortOnCannotGrowMemory:abortOnCannotGrowMemory,invoke_iii:invoke_iii,___assert_fail:___assert_fail,___setErrNo:___setErrNo,_abort:_abort,_emscripten_memcpy_big:_emscripten_memcpy_big,_llvm_floor_f64:_llvm_floor_f64,DYNAMICTOP_PTR:DYNAMICTOP_PTR,tempDoublePtr:tempDoublePtr,ABORT:ABORT,STACKTOP:STACKTOP,STACK_MAX:STACK_MAX};var asm=Module["asm"](Module.asmGlobalArg,Module.asmLibraryArg,buffer);Module["asm"]=asm;var ___errno_location=Module["___errno_location"]=function(){return Module["asm"]["___errno_location"].apply(null,arguments)};var _emscripten_replace_memory=Module["_emscripten_replace_memory"]=function(){return Module["asm"]["_emscripten_replace_memory"].apply(null,arguments)};var _free=Module["_free"]=function(){return Module["asm"]["_free"].apply(null,arguments)};var _malloc=Module["_malloc"]=function(){return Module["asm"]["_malloc"].apply(null,arguments)};var _memcpy=Module["_memcpy"]=function(){return Module["asm"]["_memcpy"].apply(null,arguments)};var _memset=Module["_memset"]=function(){return Module["asm"]["_memset"].apply(null,arguments)};var _sbrk=Module["_sbrk"]=function(){return Module["asm"]["_sbrk"].apply(null,arguments)};var _stb_vorbis_js_channels=Module["_stb_vorbis_js_channels"]=function(){return Module["asm"]["_stb_vorbis_js_channels"].apply(null,arguments)};var _stb_vorbis_js_close=Module["_stb_vorbis_js_close"]=function(){return Module["asm"]["_stb_vorbis_js_close"].apply(null,arguments)};var _stb_vorbis_js_decode=Module["_stb_vorbis_js_decode"]=function(){return Module["asm"]["_stb_vorbis_js_decode"].apply(null,arguments)};var _stb_vorbis_js_open=Module["_stb_vorbis_js_open"]=function(){return Module["asm"]["_stb_vorbis_js_open"].apply(null,arguments)};var _stb_vorbis_js_sample_rate=Module["_stb_vorbis_js_sample_rate"]=function(){return Module["asm"]["_stb_vorbis_js_sample_rate"].apply(null,arguments)};var establishStackSpace=Module["establishStackSpace"]=function(){return Module["asm"]["establishStackSpace"].apply(null,arguments)};var getTempRet0=Module["getTempRet0"]=function(){return Module["asm"]["getTempRet0"].apply(null,arguments)};var runPostSets=Module["runPostSets"]=function(){return Module["asm"]["runPostSets"].apply(null,arguments)};var setTempRet0=Module["setTempRet0"]=function(){return Module["asm"]["setTempRet0"].apply(null,arguments)};var setThrew=Module["setThrew"]=function(){return Module["asm"]["setThrew"].apply(null,arguments)};var stackAlloc=Module["stackAlloc"]=function(){return Module["asm"]["stackAlloc"].apply(null,arguments)};var stackRestore=Module["stackRestore"]=function(){return Module["asm"]["stackRestore"].apply(null,arguments)};var stackSave=Module["stackSave"]=function(){return Module["asm"]["stackSave"].apply(null,arguments)};var dynCall_iii=Module["dynCall_iii"]=function(){return Module["asm"]["dynCall_iii"].apply(null,arguments)};Module["asm"]=asm;Module["ccall"]=ccall;Module["cwrap"]=cwrap;function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}
ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var initialStackTop;var calledMain=false;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};function run(args){args=args||Module["arguments"];if(runDependencies>0){return}
preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();postRun()}
if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(function(){setTimeout(function(){Module["setStatus"]("")},1);doRun()},1)}else{doRun()}}
Module["run"]=run;function exit(status,implicit){if(implicit&&Module["noExitRuntime"]&&status===0){return}
if(Module["noExitRuntime"]){}else{ABORT=true;EXITSTATUS=status;STACKTOP=initialStackTop;exitRuntime();if(Module["onExit"])Module["onExit"](status)}
Module["quit"](status,new ExitStatus(status))}
var abortDecorators=[];function abort(what){if(Module["onAbort"]){Module["onAbort"](what)}
if(what!==undefined){out(what);err(what);what=JSON.stringify(what)}else{what=""}
ABORT=true;EXITSTATUS=1;throw"abort("+what+"). Build with -s ASSERTIONS=1 for more info."}
Module["abort"]=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}
Module["noExitRuntime"]=true;run();this.stbvorbis=Module;}

};

registerProcessor("worklet-audio-processor", AudioCopyProcessor);


/* === audio_streaming.js === */
//=============================================================================
// AudioStreaming.js
// MIT License (C) 2019 くらむぼん
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// 2019/06/02 ループタグの指定範囲が全長を超えた場合のループ処理を修正
// 2019/06/02 デコード結果がない場合にエラーになるのを修正
// 2019/06/15 Windows7のFirefoxでストリーミングが無効なバグの場合、フォールバック
// 2019/06/16 暗号化音声ファイル対応
// 2019/06/22 Safariでサンプルレート8000～22050に対応
// 2019/06/27 Safariで一部音声が二重に流れることがある不具合を修正
// 2019/06/29 Cordovaで動作するように修正
// 2019/10/20 ループタグがない場合に二周目以降の先頭が途切れることがある不具合を修正
//=============================================================================

/*:
 * @plugindesc Load audio faster and use only ogg files.
 * @author krmbn0576
 *
 * @param mode
 * @type select
 * @option Enable
 * @value 10
 * @option Enable, and measure performance
 * @value 11
 * @option Disable
 * @value 00
 * @option Disable, and measure performance
 * @value 01
 * @desc Sets whether audio streaming is enabled, and whether measure performance.
 * @default 10
 *
 * @param deleteM4a
 * @type boolean
 * @text Delete all m4a files
 * @desc Delete all m4a files the next time you playtest. Backup your files before execute.
 * @default false
 *
 * @help
 * Load audio faster by audio streaming whether on browsers or on standalones.
 * Use only ogg files to play the audio such as BGM and SE.
 * You need no longer to prepare m4a files.
 *
 * Usage:
 * Locate stbvorbis_stream.js, stbvorbis_stream_asm.js, and this plugin in plugins directory.
 * Turn ON Only this plugin, but DO NOT register the others to plugin manager.
 *
 *
 * License:
 * MIT License
 *
 * Library:
 * ogg decoder - stbvorbis.js (C) Hajime Hoshi, krmbn0576
 * https://github.com/hajimehoshi/stbvorbis.js
 */

/*:ja
 * @plugindesc 音声読み込みを高速化し、oggファイルのみを使用します。
 * @author くらむぼん
 *
 * @param mode
 * @type select
 * @option 有効
 * @value 10
 * @option 有効（読み込み速度を計測する）
 * @value 11
 * @option 無効
 * @value 00
 * @option 無効（読み込み速度を計測する）
 * @value 01
 * @text モード
 * @desc このプラグインを有効にするかどうか、読み込み速度を計測するかどうかを設定します。
 * @default 10
 *
 * @param deleteM4a
 * @type boolean
 * @text m4aファイルを消去
 * @desc 次にテストプレイを開始した時、すべてのm4aファイルを削除します。念の為バックアップを取った上でご活用ください。
 * @default false
 *
 * @help
 * 音声ストリーミングにより、音声読み込みを高速化します。
 * BGMや効果音などの音声ファイルにoggファイルのみを使用します。
 * 本プラグインを入れている場合、m4aファイルを用意しなくても音声を再生できます。
 *
 * 使い方：
 * pluginsフォルダに本プラグインとstbvorbis_stream.jsとstbvorbis_stream_asm.jsを配置してください。
 * ３つのうち本プラグイン「だけ」をプラグイン管理でONに設定してください。
 * 他の２つはOFFでも構いませんし、プラグイン管理に登録しなくても構いません。
 *
 *
 * ライセンス：
 * このプラグインを利用する時は、作者名をプラグインから削除しないでください。
 * それ以外の制限はありません。お好きなようにどうぞ。
 *
 * 使用ライブラリ：
 * oggデコーダー - stbvorbis.js (C) Hajime Hoshi, くらむぼん
 * https://github.com/hajimehoshi/stbvorbis.js
 */

if (function() {
    'use strict';
    const parameters = PluginManager.parameters('AudioStreaming');
    const enabled = parameters['mode'][0] === '1';
    const measured = parameters['mode'][1] === '1';
    const deleteM4a = parameters['deleteM4a'] === 'true';

    const isTest =
        location.search
            .slice(1)
            .split('&')
            .contains('test') ||
        (typeof window.nw !== 'undefined' &&
            nw.App.argv.length > 0 &&
            nw.App.argv[0].split('&').contains('test'));

    if (deleteM4a && isTest && Utils.isNwjs()) {
        const exec = require('child_process').exec;
        let messages, success, failure;
        if (navigator.language.contains('ja')) {
            messages = [
                'すべてのm4aファイルを削除しますか？',
                '本当に削除しますか？念のため、先にプロジェクトフォルダのバックアップをとっておくことをおすすめします。',
                'こうかいしませんね？'
            ];
            success = 'すべてのm4aファイルを削除しました。';
            failure = 'm4aファイルの削除中にエラーが発生しました。 ';
        } else {
            messages = [
                'Delete all m4a files?',
                'Are you sure?',
                'This cannot be undone. Are you really, REALLY sure?'
            ];
            success = 'All m4a files have been deleted.';
            failure = 'Error occured while deleting m4a files.';
        }
        if (messages.every(message => confirm(message))) {
            const command =
                process.platform === 'win32'
                    ? 'del /s *.m4a'
                    : 'find . -name "*.m4a" -delete';
            exec(command, error => alert(error ? failure : success));
        }
    }

    if (measured) {
        const div = document.createElement('div');
        div.style.backgroundColor = 'AliceBlue';
        div.style.position = 'fixed';
        div.style.left = 0;
        div.style.bottom = 0;
        document.body.appendChild(div);

        const updateInfo = info => {
            const decodeEndTime = Date.now();
            const content = `
                name: ${info.url.split('/').pop()}<br>
                mode: ${enabled ? 'streaming' : 'legacy'}<br>
                load time: ${info.loadEndTime - info.loadStartTime}ms<br>
                decode time: ${decodeEndTime - info.loadEndTime}ms<br>`;

            if (div.innerHTML !== content) div.innerHTML = content;
            div.style.zIndex = 11;
        };

        const _SceneManager_updateManagers = SceneManager.updateManagers;
        SceneManager.updateManagers = function() {
            const _WebAudio__load = WebAudio.prototype._load;
            WebAudio.prototype._load = function(url) {
                _WebAudio__load.apply(this, arguments);
                this._info = { url, loadStartTime: Date.now() };
                this.addLoadListener(() => updateInfo(this._info));
            };

            const _WebAudio__readLoopComments =
                WebAudio.prototype._readLoopComments;
            WebAudio.prototype._readLoopComments = function() {
                this._info.loadEndTime = this._info.loadEndTime || Date.now();
                _WebAudio__readLoopComments.apply(this, arguments);
            };

            SceneManager.updateManagers = _SceneManager_updateManagers;
            SceneManager.updateManagers.apply(this, arguments);
        };
    }

    return enabled;
}()) {

PluginManager.loadScript('stbvorbis_stream.js');

AudioManager.audioFileExt = function() {
    return '.ogg';
};

fetch('').catch(_ => window.cordova = window.cordova || true);

if (window.ResourceHandler) {
    ResourceHandler.fetchWithRetry = async function(
        method,
        url,
        _retryCount = 0
    ) {
        let retry;
        try {
            const response = await (!window.cordova ?
                fetch(url, { credentials: 'same-origin' }) :
                new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';
                    xhr.onload = () => resolve(new Response(xhr.response, { status: xhr.status }));
                    xhr.onerror = reject;
                    xhr.open('GET', url);
                    xhr.send();
                })
            );
            if (response.ok) {
                switch (method) {
                    case 'stream':
                        if (response.body) {
                            return response.body.getReader();
                        }
                        const value = new Uint8Array(await response.arrayBuffer());
                        return {
                            _done: false,
                            read() {
                                if (!this._done) {
                                    this._done = true;
                                    return Promise.resolve({ done: false, value });
                                } else {
                                    return Promise.resolve({ done: true });
                                }
                            }
                        };
                    case 'arrayBuffer':
                    case 'blob':
                    case 'formData':
                    case 'json':
                    case 'text':
                        return await response[method]();
                    default:
                        return Promise.reject(new Error('method not allowed'));
                }
            } else if (response.status < 500) {
                // client error
                retry = false;
            } else {
                // server error
                retry = true;
            }
        } catch (error) {
            if (Utils.isNwjs() || window.cordova) {
                // local file error
                retry = false;
            } else {
                // network error
                retry = true;
            }
        }
        if (!retry) {
            const error = new Error('Failed to load: ' + url);
            SceneManager.catchException(error);
            throw error;
        } else if (_retryCount < this._defaultRetryInterval.length) {
            await new Promise(resolve =>
                setTimeout(resolve, this._defaultRetryInterval[_retryCount])
            );
            return this.fetchWithRetry(method, url, _retryCount + 1);
        } else {
            if (this._reloaders.length === 0) {
                Graphics.printLoadingError(url);
                SceneManager.stop();
            }
            return new Promise(resolve =>
                this._reloaders.push(() =>
                    resolve(this.fetchWithRetry(method, url, 0))
                )
            );
        }
    };
}

WebAudio.prototype.clear = function() {
    this.stop();
    this._chunks = [];
    this._gainNode = null;
    this._pannerNode = null;
    this._totalTime = 0;
    this._sampleRate = 0;
    this._loopStart = 0;
    this._loopLength = 0;
    this._startTime = 0;
    this._volume = 1;
    this._pitch = 1;
    this._pan = 0;
    this._loadedTime = 0;
    this._offset = 0;
    this._loadListeners = [];
    this._stopListeners = [];
    this._hasError = false;
    this._autoPlay = false;
    this._isReady = false;
    this._buffersDisposed = false;
    this._isPlaying = false;
    this._loop = false;
    // 使仍挂起中的旧 _loading 流式循环立即停泵（令牌失配，见 _load 注释）。
    // 注意不重置 _nativeFallbackUsed：catch 分支 initialize→重载→再错若重置
    // 该标志会无限兜底循环。
    this._loadToken = (this._loadToken || 0) + 1;
};

WebAudio.prototype._load = async function(url) {
    if (WebAudio._context) {
        // Skip extension conversion for retry URLs carrying a query:
        // Decrypter.extToEncryptExt mangles everything after the last '.'
        // (e.g. 'foo.ogg?arkNative=1' -> 'foo.ogg?arkNative=1_').
        if (Decrypter.hasEncryptedAudio && url.indexOf('?') < 0) {
            url = Decrypter.extToEncryptExt(url);
        }
        this._loadUrl = url;
        // 每次加载递增令牌：被新加载取代（含 arkNative 重取）或 clear() 弃用的
        // 旧 _loading 流式循环苏醒后发现令牌不符即退出，不再给旧解码会话喂数。
        // （布尔标志方案不可行：_handleDecodeError 同步调 _load，其同步前缀
        // 会先把标志重置回 false，旧循环永远观察不到停泵信号。）
        this._loadToken = (this._loadToken || 0) + 1;
        const token = this._loadToken;
        const reader = await ResourceHandler.fetchWithRetry('stream', url);
        this._loading(reader, token);
    }
};

WebAudio.prototype._loading = async function(reader, token) {
    try {
        // Read first chunk to detect audio format before processing
        const first = await reader.read();
        if (first.done) return;
        let firstChunk = first.value;
        if (Decrypter.hasEncryptedAudio) {
            firstChunk = Decrypter.decryptUint8Array(firstChunk);
        }

        // Detect native audio formats decoded via decodeAudioData:
        // M4A/AAC: MP4 container has 'ftyp' at bytes 4-7 (iOS transcode)
        // WAV/PCM: RIFF header at bytes 0-3 + WAVE at bytes 8-11 (Mac transcode)
        // MP3: ID3v2 header or MPEG frame sync — 有游戏把 MP3 数据改名为 .ogg
        // 伪装（桌面 Chromium 按内容嗅探照常播，vorbis 专用链会两条解码器全挂，
        // SAO β4 的 噪声.ogg/水壶烧开.ogg）；iOS decodeAudioData 原生解 MP3。
        const isM4A = firstChunk.length >= 8 &&
            firstChunk[4] === 0x66 && firstChunk[5] === 0x74 &&
            firstChunk[6] === 0x79 && firstChunk[7] === 0x70; // 'ftyp'
        const isWAV = firstChunk.length >= 12 &&
            firstChunk[0] === 0x52 && firstChunk[1] === 0x49 &&
            firstChunk[2] === 0x46 && firstChunk[3] === 0x46 && // 'RIFF'
            firstChunk[8] === 0x57 && firstChunk[9] === 0x41 &&
            firstChunk[10] === 0x56 && firstChunk[11] === 0x45;  // 'WAVE'
        const isMP3 = firstChunk.length >= 4 &&
            ((firstChunk[0] === 0x49 && firstChunk[1] === 0x44 &&
              firstChunk[2] === 0x33) ||                          // 'ID3'
             (firstChunk[0] === 0xFF && (firstChunk[1] & 0xE0) === 0xE0)); // 帧同步

        if (isM4A || isWAV || isMP3) {
            const chunks = [firstChunk];
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                let chunk = value;
                if (Decrypter.hasEncryptedAudio) {
                    chunk = Decrypter.decryptUint8Array(chunk);
                }
                chunks.push(chunk);
            }
            const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
            const combined = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.length; }
            if (isWAV) this._readWavLoopChunk(combined);
            // decodeAudioData requires running AudioContext on some platforms (e.g. Mac DfI).
            // Resume before decoding if suspended.
            var ctx = WebAudio._context;
            var self = this;
            var doDecode = function() {
                try {
                    var p = ctx.decodeAudioData(combined.buffer, audioBuffer => {
                        const data = [];
                        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
                            data.push(new Float32Array(audioBuffer.getChannelData(i)));
                        }
                        self._onDecode({ data, sampleRate: audioBuffer.sampleRate, eof: false });
                        self._onDecode({ eof: true });
                    }, e => {
                        console.error('[Audio] M4A decodeAudioData failed:', e);
                        self._onDecode({ eof: true });
                        self._isReady = true;
                        self._loadListeners.forEach(fn => fn());
                        self._loadListeners.length = 0;
                    });
                    if (p && typeof p.catch === 'function') p.catch(function() {});
                } catch (e) {
                    console.error('[Audio] M4A decodeAudioData sync error:', e);
                    self._onDecode({ eof: true });
                    self._isReady = true;
                    self._loadListeners.forEach(fn => fn());
                    self._loadListeners.length = 0;
                }
            };
            if (ctx.state === 'suspended') {
                ctx.resume().then(doDecode).catch(doDecode);
            } else {
                doDecode();
            }
            return;
        }

        // Normal OGG/Vorbis path via stbvorbis
        const decode = stbvorbis.decodeStream(result => this._onDecode(result));
        this._readLoopComments(firstChunk);
        decode({ data: firstChunk, eof: false });
        while (true) {
            // 本轮加载已被新加载（arkNative 重取）或 clear() 取代：停泵退出，
            // 不再给已死/弃用的解码会话喂数
            if (this._loadToken !== token) return;
            const { done, value } = await reader.read();
            if (done) {
                decode({ eof: true });
                return;
            }
            let array = value;
            if (Decrypter.hasEncryptedAudio) {
                array = Decrypter.decryptUint8Array(array);
            }
            this._readLoopComments(array);
            decode({ data: array, eof: false });
        }
    } catch (error) {
        console.error(error);
        const autoPlay = this._autoPlay;
        const loop = this._loop;
        const pos = this.seek();
        this.initialize(this._url);
        if (autoPlay) {
            this.play(loop, pos);
        }
    }
};

WebAudio.prototype._onDecode = function(result) {
    if (result.error) {
        console.error(result.error);
        this._handleDecodeError();
        return;
    }
    if (result.eof) {
        this._totalTime = this._loadedTime;
        if (this._loopLength === 0) {
            this._loopStart = 0;
            this._loopLength = this._totalTime;
            if (this._loop) {
                this._createSourceNodes();
            }
        } else if (this._totalTime < this._loopStart + this._loopLength) {
            this._loopLength = this._totalTime - this._loopStart;
            if (this._loop) {
                this._createSourceNodes();
            }
        }
        if (this._totalTime <= this.seek()) {
            this.stop();
        }
        return;
    }
    if (result.data[0].length === 0) {
        return;
    }
    let buffer;
    try {
        buffer = WebAudio._context.createBuffer(
            result.data.length,
            result.data[0].length,
            result.sampleRate
        );
    } catch (error) {
        if (8000 <= result.sampleRate && result.sampleRate < 22050) {
            result.sampleRate *= 3;
            for (let i = 0; i < result.data.length; i++) {
                const old = result.data[i];
                result.data[i] = new Float32Array(result.data[i].length * 3);
                for (let j = 0; j < old.length; j++) {
                    result.data[i][j * 3] = old[j];
                    result.data[i][j * 3 + 1] = old[j];
                    result.data[i][j * 3 + 2] = old[j];
                }
            }
            buffer = WebAudio._context.createBuffer(
                result.data.length,
                result.data[0].length,
                result.sampleRate
            );
        } else {
            throw error;
        }
    }
    for (let i = 0; i < result.data.length; i++) {
        if (buffer.copyToChannel) {
            buffer.copyToChannel(result.data[i], i);
        } else {
            buffer.getChannelData(i).set(result.data[i]);
        }
    }
    const chunk = { buffer, sourceNode: null, when: this._loadedTime };
    this._chunks.push(chunk);
    this._loadedTime += buffer.duration;
    this._createSourceNode(chunk);
    if (!this._isReady && this._loadedTime >= this._offset) {
        this._isReady = true;
        // Inline auto-play logic directly (DKTools overrides _onLoad,
        // removing the autoPlay check, so we cannot rely on _onLoad)
        if (this._autoPlay) {
            this.play(this._loop, this._offset);
        }
        if (typeof this._onLoad === 'function') {
            this._onLoad();
        }
    }
};

WebAudio.prototype._handleDecodeError = function() {
    if (!this._nativeFallbackUsed) {
        this._nativeFallbackUsed = true;
        // _load 会递增 _loadToken，正在运行的旧 _loading 循环随即停泵（见 _load 注释）
        console.warn('[AudioStreaming] stbvorbis failed, retrying with native decode: ' + this._url);
        const base = this._loadUrl || this._url;
        const sep = base.indexOf('?') >= 0 ? '&' : '?';
        this._load(base + sep + 'arkNative=1');
        return;
    }
    // Final give-up: Aetherflow and similar plugins gate Scene_Base.isReady()
    // on AudioManager.isReady(); a buffer stuck loading forever freezes the
    // whole game. Match MV semantics (error = silent but ready) — prefer
    // silence over a hang.
    console.error('[AudioStreaming] native fallback failed too, giving up (silent): ' + this._url);
    this._hasError = true;
    this._totalTime = this._loadedTime;
    this._isReady = true;
    this._loadListeners.forEach(fn => fn());
    this._loadListeners.length = 0;
};

Object.defineProperty(WebAudio.prototype, 'pitch', {
    get: function() {
        return this._pitch;
    },
    set: function(value) {
        if (this._pitch !== value) {
            this._pitch = value;
            if (this.isPlaying()) {
                this.play(this._loop, 0);
            }
        }
    },
    configurable: true
});

WebAudio.prototype.isReady = function() {
    return this._isReady;
};

WebAudio.prototype.isPlaying = function() {
    return this._isPlaying;
};

WebAudio.prototype.play = function(loop, offset) {
    this._autoPlay = true;
    this._loop = loop;
    this._offset = offset || 0;
    // Aetherflow keeps finished WebAudio objects in its cache and includes them
    // in every later scene's global readiness check. Reload an object whose
    // decoded buffers were reclaimed by the scoped Aetherflow workaround.
    if (this._buffersDisposed) {
        this._buffersDisposed = false;
        this._isReady = false;
        this._load(this._url);
        return;
    }
    if (this._loop && this._loopLength > 0) {
        while (this._offset >= this._loopStart + this._loopLength) {
            this._offset -= this._loopLength;
        }
    }
    if (this.isReady()) {
        this._startPlaying();
    }
};

WebAudio.prototype.stop = function() {
    const wasPlaying = this.isPlaying();
    const pos = wasPlaying ? this.seek() : 0;
    const finished = !this._loop &&
                     this._totalTime > 0 &&
                     pos >= this._totalTime;
    this._isPlaying = false;
    this._autoPlay = false;
    this._removeNodes();
    if (finished) {
        this._disposeBuffers();
    }
    if (this._stopListeners && wasPlaying) {
        this._stopListeners.forEach(listener => listener());
        this._stopListeners.length = 0;
    }
};

WebAudio.prototype.seek = function() {
    if (WebAudio._context && this.isPlaying()) {
        let pos =
            (WebAudio._context.currentTime - this._startTime) * this._pitch;
        if (this._loop && this._loopLength > 0) {
            while (pos >= this._loopStart + this._loopLength) {
                pos -= this._loopLength;
            }
        }
        return pos;
    } else {
        return 0;
    }
};

WebAudio.prototype._startPlaying = function() {
    this._isPlaying = true;
    this._startTime =
        WebAudio._context.currentTime - this._offset / this._pitch;
    this._removeNodes();
    this._createNodes();
    this._connectNodes();
    this._createSourceNodes();
};

WebAudio.prototype._calcSourceNodeParams = function(chunk) {
    const currentTime = WebAudio._context.currentTime;
    const chunkEnd = chunk.when + chunk.buffer.duration;
    const pos = this.seek();
    let when, offset, duration;
    if (this._loop && this._loopLength) {
        const loopEnd = this._loopStart + this._loopLength;
        if (pos <= chunk.when) {
            when = currentTime + (chunk.when - pos) / this._pitch;
        } else if (pos <= (window.AudioContext ? chunkEnd : chunkEnd - 0.0001)) {
            when = currentTime;
            offset = pos - chunk.when;
        } else if (this._loopStart <= pos) {
            when =
                currentTime +
                (chunk.when - pos + this._loopLength) / this._pitch;
        } else {
            return;
        }
        if (this._loopStart <= pos && chunk.when < this._loopStart) {
            if (!offset) {
                when += (this._loopStart - chunk.when) / this._pitch;
                offset = this._loopStart - chunk.when;
            }
            if (chunk.buffer.duration <= offset) {
                return;
            }
        }
        if (loopEnd < chunkEnd) {
            if (!offset) {
                offset = 0;
            }
            duration = loopEnd - chunk.when - offset;
            if (duration <= 0) {
                return;
            }
        }
    } else {
        if (pos <= chunk.when) {
            when = currentTime + (chunk.when - pos) / this._pitch;
        } else if (pos <= (window.AudioContext ? chunkEnd : chunkEnd - 0.0001)) {
            when = currentTime;
            offset = pos - chunk.when;
        } else {
            return;
        }
    }
    return { when, offset, duration };
};

WebAudio.prototype._createSourceNode = function(chunk) {
    if (!this.isPlaying() || !chunk) {
        return;
    }
    if (chunk.sourceNode) {
        chunk.sourceNode.onended = null;
        chunk.sourceNode.stop();
        chunk.sourceNode = null;
    }
    const params = this._calcSourceNodeParams(chunk);
    if (!params) {
        if (!this._reservedSeName && this._loopLength) {
            this._chunks[this._chunks.indexOf(chunk)] = null;
        }
        return;
    }
    const { when, offset, duration } = params;
    const context = WebAudio._context;
    const sourceNode = context.createBufferSource();
    sourceNode.onended = _ => {
        this._createSourceNode(chunk);
        if (this._totalTime && this._totalTime <= this.seek()) {
            this.stop();
        }
    };
    sourceNode.buffer = chunk.buffer;
    sourceNode.playbackRate.setValueAtTime(this._pitch, context.currentTime);
    sourceNode.connect(this._gainNode);
    sourceNode.start(when, offset, duration);
    chunk.sourceNode = sourceNode;
};

WebAudio.prototype._createSourceNodes = function() {
    this._chunks.forEach(chunk => this._createSourceNode(chunk));
};

WebAudio.prototype._createNodes = function() {
    const context = WebAudio._context;
    this._gainNode = context.createGain();
    this._gainNode.gain.setValueAtTime(this._volume, context.currentTime);
    this._pannerNode = context.createPanner();
    this._pannerNode.panningModel = 'equalpower';
    this._updatePanner();
};

WebAudio.prototype._connectNodes = function() {
    this._gainNode.connect(this._pannerNode);
    this._pannerNode.connect(WebAudio._masterGainNode);
};

WebAudio.prototype._removeNodes = function() {
    if (this._chunks) {
        this._chunks
            .filter(chunk => chunk && chunk.sourceNode)
            .forEach(chunk => {
                chunk.sourceNode.onended = null;
                chunk.sourceNode.stop();
                chunk.sourceNode = null;
            });
    }
    this._gainNode = null;
    this._pannerNode = null;
};

WebAudio.prototype._disposeBuffers = function() {
    if (!this._chunks || this._chunks.length === 0) return;

    let chunkCount = 0;
    let totalBytes = 0;

    this._chunks.forEach(chunk => {
        if (!chunk) return;
        if (chunk.sourceNode) {
            chunk.sourceNode.onended = null;
            try { chunk.sourceNode.stop(); } catch (e) {}
            try { chunk.sourceNode.disconnect(); } catch (e) {}
            chunk.sourceNode = null;
        }
        if (chunk.buffer) {
            chunkCount++;
            totalBytes +=
                chunk.buffer.length *
                chunk.buffer.numberOfChannels * 4;
        }
    });

    this._chunks.length = 0;
    this._loadedTime = 0;
    this._totalTime = 0;
    this._loopStart = 0;
    this._loopLength = 0;
    // Aetherflow_PreloadEverything retains this object in AudioManager._cache
    // and blocks Scene_Base.isReady() while any retained object reports false.
    // Preserve the original AudioStreaming behavior for every other game.
    const usesAetherflowCache =
        typeof Aetherflow !== 'undefined' &&
        Aetherflow.Preload &&
        typeof AudioManager !== 'undefined' &&
        AudioManager._cache &&
        typeof AudioManager._cache.isReady === 'function';
    this._isReady = !!usesAetherflowCache;
    this._buffersDisposed = !!usesAetherflowCache;

    if (chunkCount > 0) {
        const name = this._url ? this._url.split('/').pop() : '(unknown)';
        const mb = (totalBytes / 1024 / 1024).toFixed(2);
        console.log(
            '[AudioStreaming] Released ' + chunkCount +
            ' chunks, ' + mb + ' MB — ' + name
        );
    }
};

WebAudio.prototype._onLoad = function() {
    this._loadListeners.forEach(listener => listener());
    this._loadListeners.length = 0;
};

WebAudio.prototype._readLoopComments = function(array) {
    if (this._sampleRate === 0) {
        this._readOgg(array);
        if (this._loopLength > 0 && this._sampleRate > 0) {
            this._loopStart /= this._sampleRate;
            this._loopLength /= this._sampleRate;
        }
    }
};

// Parse the 'LOOP' chunk emitted by the native vorbis decoder (loopStart /
// loopLength in samples, converted to seconds like _readLoopComments).
// Only acts when the ogg comments did not provide a loop: FFmpeg WAVs from
// the Mac path have no LOOP chunk and this is a harmless no-op there.
WebAudio.prototype._readWavLoopChunk = function(bytes) {
    if (this._loopLength > 0 || bytes.length < 12) return;
    let pos = 12, sampleRate = 0;
    while (pos + 8 <= bytes.length) {
        const id = String.fromCharCode(bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]);
        const size = bytes[pos+4] | (bytes[pos+5]<<8) | (bytes[pos+6]<<16) | (bytes[pos+7]<<24);
        const body = pos + 8;
        if (id === 'fmt ' && size >= 16) {
            sampleRate = bytes[body+4] | (bytes[body+5]<<8) | (bytes[body+6]<<16) | (bytes[body+7]<<24);
        } else if (id === 'LOOP' && size >= 8 && sampleRate > 0) {
            const ls = bytes[body] | (bytes[body+1]<<8) | (bytes[body+2]<<16) | (bytes[body+3]<<24);
            const ll = bytes[body+4] | (bytes[body+5]<<8) | (bytes[body+6]<<16) | (bytes[body+7]<<24);
            if (ll > 0) {
                this._loopStart = ls / sampleRate;
                this._loopLength = ll / sampleRate;
            }
            return;
        }
        if (size < 0 || body + size > bytes.length) return;
        pos = body + size + (size & 1);   // RIFF chunks are word-aligned
    }
};

Decrypter.decryptUint8Array = function(uint8Array) {
    const ref = this.SIGNATURE + this.VER + this.REMAIN;
    for (let i = 0; i < this._headerlength; i++) {
        if (uint8Array[i] !== parseInt('0x' + ref.substr(i * 2, 2), 16)) {
            return uint8Array;
        }
    }
    uint8Array = new Uint8Array(uint8Array.buffer, this._headerlength);
    this.readEncryptionkey();
    for (var i = 0; i < this._headerlength; i++) {
        uint8Array[i] = uint8Array[i] ^ parseInt(this._encryptionKey[i], 16);
    }
    return uint8Array;
};

}


/* === compat_audio_streaming.js === */
// AudioStreaming plugin compat
// 1. ResourceHandler polyfill (AudioStreaming._load calls ResourceHandler.fetchWithRetry)
// 2. WebAudio._load re-wrap at Scene_Boot.start (auto-resume suspended AudioContext)
// 3. WebAudio._buffer compatibility for games/events that inspect MV's legacy buffer
// 4. WebAudio._startPlaying fix: restore streaming path if overridden by later plugin
//    (e.g. WebAudioOffsetFix.js replaces _startPlaying with the XHR _buffer path)
// Trigger: game plugins.js contains AudioStreaming

(function() {
    // --- Runtime Plugin Patches ---
    function applyRuntimePatches() {
        var checkInterval = setInterval(function() {
            if (typeof Scene_Boot !== 'undefined') {
                clearInterval(checkInterval);

                var _Scene_Boot_start = Scene_Boot.prototype.start;
                Scene_Boot.prototype.start = function() {
                    // Re-wrap WebAudio._load to auto-resume suspended AudioContext.
                    // AudioStreaming's async _load may fire before first user touch.
                    if (WebAudio && WebAudio.prototype._load && !WebAudio.prototype._load.__arkLoadPatched2) {
                        var _finalLoad = WebAudio.prototype._load;
                        WebAudio.prototype._load = function(url) {
                            if (WebAudio._context && WebAudio._context.state === 'suspended') {
                                WebAudio._context.resume().catch(function(){});
                            }
                            var ret = _finalLoad.apply(this, arguments);
                            if (ret && typeof ret.then === 'function') {
                                ret.catch(function(e) {
                                    console.error('[Audio Fix] _load async FAILED: url=' + url + ' err=' + e);
                                });
                            }
                            return ret;
                        };
                        WebAudio.prototype._load.__arkLoadPatched2 = true;
                    }

                    // ResourceHandler polyfill: AudioStreaming._load calls
                    // ResourceHandler.fetchWithRetry() unconditionally. If the game
                    // doesn't define ResourceHandler, every audio load throws
                    // "ReferenceError: Can't find variable: ResourceHandler".
                    if (!window.ResourceHandler) {
                        window.ResourceHandler = {
                            _defaultRetryInterval: [500, 1000, 3000],
                            _reloaders: [],
                            fetchWithRetry: async function(method, url, _retryCount) {
                                _retryCount = _retryCount || 0;
                                var response;
                                try {
                                    response = await fetch(url, { credentials: 'same-origin' });
                                } catch(e) {
                                    if (_retryCount < this._defaultRetryInterval.length) {
                                        await new Promise(function(r){ setTimeout(r, this._defaultRetryInterval[_retryCount]); }.bind(this));
                                        return this.fetchWithRetry(method, url, _retryCount + 1);
                                    }
                                    throw new Error('Failed to load: ' + url);
                                }
                                if (!response.ok) {
                                    throw new Error('Failed to load: ' + url + ' (HTTP ' + response.status + ')');
                                }
                                if (method === 'stream') {
                                    if (response.body) {
                                        return response.body.getReader();
                                    }
                                    // Fallback: no streaming support — read all at once
                                    var value = new Uint8Array(await response.arrayBuffer());
                                    return {
                                        _done: false,
                                        read: function() {
                                            if (!this._done) {
                                                this._done = true;
                                                return Promise.resolve({ done: false, value: value });
                                            }
                                            return Promise.resolve({ done: true });
                                        }
                                    };
                                }
                                return await response[method]();
                            }
                        };
                        console.log('[Audio Fix] ResourceHandler polyfill installed');
                    }

                    // AudioStreaming stores decoded audio in _chunks instead of MV's
                    // legacy _buffer field. Some games/events poll _buffer directly
                    // as a readiness signal, for example:
                    //   !!AudioManager._bgmBuffer._buffer
                    // Expose the first streamed AudioBuffer through _buffer so those
                    // checks can continue without modifying game data.
                    if (WebAudio && !WebAudio.prototype.__arkStreamingBufferCompat) {
                        Object.defineProperty(WebAudio.prototype, '_buffer', {
                            get: function() {
                                if (this._chunks && this._chunks.length > 0) {
                                    for (var i = 0; i < this._chunks.length; i++) {
                                        if (this._chunks[i] && this._chunks[i].buffer) {
                                            return this._chunks[i].buffer;
                                        }
                                    }
                                }
                                return this.__arkLegacyBuffer || null;
                            },
                            set: function(value) {
                                this.__arkLegacyBuffer = value;
                            },
                            configurable: true
                        });
                        WebAudio.prototype.__arkStreamingBufferCompat = true;
                        console.log('[Audio Fix] _buffer compatibility installed for AudioStreaming');
                    }

                    // Fix: WebAudio._startPlaying streaming path restore.
                    // Some game plugins (e.g. WebAudioOffsetFix.js by kido) override
                    // WebAudio.prototype._startPlaying after AudioStreaming loads,
                    // reverting to the original XHR _buffer path. In streaming mode
                    // _buffer is always null → _isPlaying never set → silence.
                    //
                    // Detection: AudioStreaming's _startPlaying calls _createSourceNodes().
                    // Original MV's calls _refreshSourceNode(). If '_createSourceNodes'
                    // is absent from the function body, the method has been replaced.
                    //
                    // The negative-offset clamp from WebAudioOffsetFix.js is preserved:
                    //   if (this._offset < 0) this._offset = 0;
                    if (WebAudio && WebAudio.prototype._startPlaying && !WebAudio.prototype._startPlaying.__arkStartPlayingPatched) {
                        var _origStartPlaying = WebAudio.prototype._startPlaying;
                        if (_origStartPlaying.toString().indexOf('_createSourceNodes') < 0) {
                            console.log('[Audio Fix] _startPlaying overridden by plugin (no _createSourceNodes). Restoring streaming path.');
                            WebAudio.prototype._startPlaying = function() {
                                if (this._chunks && this._chunks.length > 0) {
                                    // AudioStreaming streaming path
                                    if (this._offset < 0) this._offset = 0;
                                    this._isPlaying = true;
                                    this._startTime = WebAudio._context.currentTime - (this._offset || 0) / (this._pitch || 1);
                                    this._removeNodes();
                                    this._createNodes();
                                    this._connectNodes();
                                    this._createSourceNodes();
                                    return;
                                }
                                // Fallback to original (XHR-loaded _buffer path)
                                return _origStartPlaying.apply(this, arguments);
                            };
                            WebAudio.prototype._startPlaying.__arkStartPlayingPatched = true;
                        }
                    }

                    _Scene_Boot_start.call(this);
                };
            }
        }, 100);
    }
    applyRuntimePatches();
})();


/* === n_x_audio_streaming.js === */
/*:
 * @plugindesc v1.01 (Requires AudioStreaming) Ogg audio decoding via audio worklet.
 * @author Think_Nathan
 *
 * @help No plugin commands. Requires AudioStreaming.js by krmbn0576 (くらむぼん)
 * https://forums.rpgmakerweb.com/index.php?threads/audiostreaming-js-plugin-to-improve-rpg-maker-mv-audio-performance.110063/
 */

(function () {
    var stbvorbis = typeof stbvorbis !== "undefined" ? stbvorbis : {};

    function httpGet(url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest;
            xhr.open("GET", url);
            xhr.addEventListener("load", function () {
                var status = xhr.status;
                if (status < 200 || status >= 300) {
                    reject({
                        status: status
                    });
                    return
                }
                resolve(xhr.response)
            });
            xhr.addEventListener("error", function () {
                reject({
                    status: xhr.status
                })
            });
            xhr.send()
        })
    }
    var initializeWorkerP = new Promise(function (resolve, reject) {
        if (typeof AudioWorkletNode == 'function' && "audioWorklet" in AudioContext.prototype && typeof WebAssembly === "object" && !(navigator.userAgent.match(/iPhone|iPad|iPod/) && navigator.userAgent.match(/AppleWebKit/))) {

            let context = WebAudio._context || new AudioContext();
            resolve(
                context.audioWorklet.addModule('./js/plugins/worklet-stbvorbis.js').then(function () {
                    const worker = new AudioWorkletNode(context, 'worklet-audio-processor');
                    worker.connect(context.destination);
                    window.worker = worker;
                    return worker.port;
                })
            );
            return
        }

        console.log('AudioStreaming is falling back to Web Workers and ASM due to browser incompatibility.');
        var scriptPath = document.currentScript.src;
        var directoryPath = scriptPath.slice(0, scriptPath.lastIndexOf("/") + 1);
        httpGet(directoryPath + "stbvorbis_stream_asm.js").then(function (script) {
            workerURL = URL.createObjectURL(new Blob([script], {
                type: "text/javascript"
            }));
            resolve(new Worker(workerURL))
        }).catch(function (err) {
            reject(new Error("asmjs version is not available (HTTP status: " + err.status + " on stbvorbis_stream_asm.js). Deploy stbvorbis_stream_asm.js at the same place as stbvorbis.js."))
        })

    });
    initializeWorkerP.catch(function (e) {
        console.warn(e);
    });
    stbvorbis.decode = function (buf, outCallback) {
        var inCallback = stbvorbis.decodeStream(outCallback);
        inCallback({
            data: buf,
            eof: false
        });
        inCallback({
            data: null,
            eof: true
        })
    };
    var sessionId = 0;
    var outCallbacks = {};
    stbvorbis.decodeStream = function (outCallback) {
        var inCallbackImpl = null;
        var inputQueue = [];
        var inCallback = function (input) {
            if (!inCallbackImpl) {
                inputQueue.push(input);
                return
            }
            inCallbackImpl(input)
        };
        initializeWorkerP.then(function (worker) {
            var currentId = sessionId;
            sessionId++;
            var sampleRate = 0;
            var data = [];
            var onmessage = function (event) {
                var result = event.data;
                if (result.id !== currentId) {
                    return
                }
                if (result.error) {
                    outCallback({
                        data: null,
                        sampleRate: 0,
                        eof: false,
                        error: result.error
                    });
                    worker.onmessage = null;
                    return
                }
                if (result.eof) {
                    outCallback({
                        data: null,
                        sampleRate: 0,
                        eof: true,
                        error: null
                    });
                    worker.onmessage = null;
                    return
                }
                outCallback({
                    data: result.data,
                    sampleRate: result.sampleRate,
                    eof: false,
                    error: null
                })
            };
            worker.onmessage = onmessage;
            inCallbackImpl = function (input) {
                if (input.eof) {
                    worker.postMessage({
                        id: currentId,
                        buf: null,
                        eof: true
                    });
                    return
                }
                var buf = input.data;
                worker.postMessage({
                    id: currentId,
                    buf: buf,
                    eof: false
                }, [buf instanceof Uint8Array ? buf.buffer : buf])
            };
            for (var i = 0; i < inputQueue.length; i++) {
                inCallbackImpl(inputQueue[i])
            }
            inputQueue = null
        });
        return inCallback
    }
    window.stbvorbis = stbvorbis;
})();


/* === ark_image_downsample.js === */
(function () {
    'use strict';

    var DEBUG = true;
    function log() {
        if (DEBUG) console.log.apply(console, ['[ark]'].concat(Array.prototype.slice.call(arguments)));
    }

    var diagCounts = {};
    function diag(tag, limit) {
        if (!DEBUG) return;
        var count = diagCounts[tag] || 0;
        if (count >= limit) return;
        diagCounts[tag] = count + 1;
        console.log.apply(console, ['[ark]', '[DIAG]', tag + '#' + diagCounts[tag]].concat(Array.prototype.slice.call(arguments, 2)));
    }

    function shortStack() {
        try {
            throw new Error();
        } catch (e) {
            return String(e.stack || '').split('\n').slice(2, 7).join(' <- ');
        }
    }

    function decodedUrl(url) {
        if (!url) return '';
        var s = String(url);
        try { s = decodeURIComponent(s); } catch (e) {}
        return s;
    }

    function isDiagUrl(url) {
        var s = decodedUrl(url);
        return s.indexOf('img/pictures/') >= 0 ||
            s.indexOf('img/karryn/map/') >= 0 ||
            s.indexOf('img/battlebacks1/') >= 0 ||
            s.indexOf('img/battlebacks2/') >= 0 ||
            s.indexOf('img/system/') >= 0 ||
            s.indexOf('img/titles') >= 0 ||
            s.indexOf('Menu__layer') >= 0 ||
            s.indexOf('Bar_waitress_sex') >= 0;
    }

    function isWatchUrl(url) {
        if (!url) return false;
        var s = String(url);
        return s.indexOf('titles1') >= 0 &&
            (s.indexOf('%E6%A0%87%E9%A2%98') >= 0 || s.indexOf('标题') >= 0);
    }

    function isMenuGifUrl(url) {
        if (!url) return false;
        return String(url).indexOf('Menu__layer_gif') >= 0;
    }

    function isStandWatchUrl(url) {
        if (!url) return false;
        var s = String(url);
        return s.indexOf('actor01_pose01_body_0003') >= 0 ||
            s.indexOf('hair/01_1') >= 0 ||
            s.indexOf('hairDress/01_1') >= 0;
    }

    function isMenuPictureWatchUrl(url) {
        if (!url) return false;
        var s = String(url);
        try { s = decodeURIComponent(s); } catch (e) {}
        return s.indexOf('img/pictures/メニュー') >= 0 ||
            s.indexOf('img/pictures/背景') >= 0 ||
            s.indexOf('img/pictures/冒険者') >= 0;
    }

    function isKnownFullImageSpriteUrl(url) {
        return isSpecialActionSeqUrl(url) || isMenuPictureWatchUrl(url) || isKarrynMapLayerUrl(url);
    }

    function isFullImageSpriteUrl(url) {
        return isKnownFullImageSpriteUrl(url);
    }

    function isSpecialActionSeqUrl(url) {
        if (!url) return false;
        var s = String(url);
        try { s = decodeURIComponent(s); } catch (e) {}
        return s.indexOf('img/Special__actionSeq/') >= 0;
    }

    function isKarrynMapLayerUrl(url) {
        if (!url) return false;
        var s = decodedUrl(url);
        return s.indexOf('img/karryn/map/') >= 0 ||
            s.indexOf('img/pictures/map_move') >= 0;
    }

    function isPictureUrl(url) {
        return decodedUrl(url).indexOf('img/pictures/') >= 0;
    }

    function shouldCheckFullImageSprite(sprite, bitmap) {
        if (!sprite || !bitmap) return false;
        if (isKnownFullImageSpriteUrl(bitmap._url)) return true;
        return typeof Sprite_Picture !== 'undefined' &&
            sprite instanceof Sprite_Picture &&
            isPictureUrl(bitmap._url);
    }

    function isLargePictureBitmap(bitmap) {
        if (!bitmap || !bitmap._arkOrigW || !bitmap._arkOrigH) return false;
        var gw = 0;
        var gh = 0;
        if (typeof Graphics !== 'undefined') {
            gw = Graphics.width || Graphics.boxWidth || Graphics._width || 0;
            gh = Graphics.height || Graphics.boxHeight || Graphics._height || 0;
        }
        if (gw > 0 && gh > 0) {
            return bitmap._arkOrigW >= gw * 0.65 && bitmap._arkOrigH >= gh * 0.65;
        }
        return bitmap._arkOrigW >= 700 && bitmap._arkOrigH >= 500;
    }

    function isExcludedTilingUrl(url) {
        if (!url) return false;
        var s = String(url);
        try { s = decodeURIComponent(s); } catch (e) {}
        s = s.replace(/^[a-z]+:\/\/[^/]+\//, '').replace(/^\/+/, '').toLowerCase();
        return s.indexOf('img/titles1/') === 0 || s.indexOf('img/titles2/') === 0;
    }

    function imageSizeOf(bitmap) {
        var img = bitmap && bitmap._image;
        if (!img) return 'no-image';
        return (img.naturalWidth || img.width || 0) + 'x' + (img.naturalHeight || img.height || 0);
    }

    function baseTextureState(bt) {
        if (!bt) return 'no-bt';
        var src = bt.source;
        var srcW = src && (src.naturalWidth || src.width || 0);
        var srcH = src && (src.naturalHeight || src.height || 0);
        return 'bt(width=' + bt.width + ',height=' + bt.height +
            ',_width=' + bt._width + ',_height=' + bt._height +
            ',real=' + bt.realWidth + 'x' + bt.realHeight +
            ',src=' + srcW + 'x' + srcH +
            ',arkDimSet=' + !!bt._arkDimSet + ')';
    }

    function actualBitmapSize(bitmap) {
        if (!bitmap) return null;
        var img = bitmap._image;
        if (img) {
            var iw = img.naturalWidth || img.width || 0;
            var ih = img.naturalHeight || img.height || 0;
            if (iw > 0 && ih > 0) return [iw, ih];
        }
        var canvas = bitmap.__canvas;
        if (canvas && canvas.width > 0 && canvas.height > 0) return [canvas.width, canvas.height];
        var bt = bitmap.__baseTexture;
        var src = bt && bt.source;
        if (src) {
            var sw = src.naturalWidth || src.width || 0;
            var sh = src.naturalHeight || src.height || 0;
            if (sw > 0 && sh > 0) return [sw, sh];
        }
        return null;
    }

    function isOnePixelMissingStub(bitmap) {
        if (!bitmap || bitmap._arkOrigW || bitmap._arkOrigH) return false;
        var actual = actualBitmapSize(bitmap);
        return !!actual && actual[0] <= 1 && actual[1] <= 1;
    }

    function setTextureFrameUnchecked(texture, rect) {
        if (!texture || !rect) return false;
        try { texture._frame = rect; } catch (e) {}
        try { texture.noFrame = false; } catch (e) {}
        try { texture.valid = !!(rect.width && rect.height && texture.baseTexture && texture.baseTexture.hasLoaded); } catch (e) {}
        try {
            if (!texture.trim && !texture.rotate) texture.orig = rect;
        } catch (e) {}
        if (texture.valid && typeof texture._updateUvs === 'function') {
            try { texture._updateUvs(); } catch (e) {}
        }
        return true;
    }

    function ensureArkDim(bitmap) {
        if (!bitmap || bitmap._arkOrigW || !bitmap._url) return;
        var dim = lookupDim(bitmap._url);
        if (dim) {
            bitmap._arkOrigW = dim[0];
            bitmap._arkOrigH = dim[1];
        }
    }

    var dimMap = window._arkDims || {};
    var dimKeys = Object.keys(dimMap);
    log('dimMap entries:', dimKeys.length);
    var faceKeys = dimKeys.filter(function(k) { return k.indexOf('faces') >= 0; });
    if (faceKeys.length > 0) {
        log('face entries:', faceKeys.slice(0, 3).join(', '), '...');
    } else {
        log('WARN: no face entries in dimMap');
    }

    var dimMapCI = {};
    for (var ki = 0; ki < dimKeys.length; ki++) {
        var key = dimKeys[ki];
        dimMapCI[key.toLowerCase()] = dimMap[key];
        var variants = unicodePathVariants(key);
        for (var vi = 0; vi < variants.length; vi++) {
            dimMapCI[variants[vi].toLowerCase()] = dimMap[key];
        }
    }

    function unicodePathVariants(path) {
        var variants = [path];
        if (path && typeof path.normalize === 'function') {
            try { variants.push(path.normalize('NFC')); } catch (e) {}
            try { variants.push(path.normalize('NFD')); } catch (e) {}
        }
        var out = [];
        var seen = {};
        for (var i = 0; i < variants.length; i++) {
            var v = variants[i];
            if (v && !seen[v]) {
                seen[v] = true;
                out.push(v);
            }
        }
        return out;
    }

    function dimForPath(path) {
        var variants = unicodePathVariants(path);
        for (var i = 0; i < variants.length; i++) {
            var key = variants[i];
            var dim = dimMap[key] || dimMapCI[key.toLowerCase()];
            if (dim) return dim;
        }
        return null;
    }

    function cacheDim(path, dim, aliases) {
        if (!path || !dim) return;
        var keys = [path];
        if (aliases && aliases.length) keys = keys.concat(aliases);
        for (var i = 0; i < keys.length; i++) {
            var variants = unicodePathVariants(keys[i]);
            for (var j = 0; j < variants.length; j++) {
                var key = variants[j];
                dimMap[key] = dim;
                dimMapCI[key.toLowerCase()] = dim;
            }
        }
    }

    var nativeDimMisses = {};
    function fetchNativeDim(path, rawUrl) {
        if (!window._arkLazyDimLookup || !path || (nativeDimMisses[path] || 0) > 3) return null;
        try {
            var xhr = new XMLHttpRequest();
            var endpoint = (location.protocol || 'rpgmv:') + '//game/__ark_downsample_dim__?path=' + encodeURIComponent(path);
            xhr.open('GET', endpoint, false);
            xhr.send(null);
            if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
                var payload = JSON.parse(xhr.responseText);
                if (payload && payload.width > 0 && payload.height > 0) {
                    var dim = [payload.width, payload.height];
                    cacheDim(path, dim, payload.aliases || []);
                    if (isWatchUrl(rawUrl) || isMenuPictureWatchUrl(rawUrl)) {
                        log('[DIM] hit native raw=', rawUrl, 'decoded=', path, 'dim=', dim[0] + 'x' + dim[1]);
                    }
                    return dim;
                }
            }
        } catch (e) {
            if (isWatchUrl(rawUrl) || isMenuPictureWatchUrl(rawUrl)) {
                log('[DIM] native lookup failed raw=', rawUrl, 'decoded=', path, 'err=', e && e.message);
            }
        }
        nativeDimMisses[path] = (nativeDimMisses[path] || 0) + 1;
        return null;
    }

    function lookupDim(url) {
        if (!url) return null;
        var rawUrl = String(url);
        var path = url.replace(/^[a-z]+:\/\/[^/]+\//, '');
        try { path = decodeURIComponent(path); } catch(e) {}
        var dim = dimForPath(path);
        if (dim) {
            if (isWatchUrl(rawUrl) || isMenuPictureWatchUrl(rawUrl)) log('[DIM] hit exact raw=', rawUrl, 'decoded=', path, 'dim=', dim[0] + 'x' + dim[1]);
            return dim;
        }
        if (path.endsWith('.rpgmvp')) {
            var png = path.replace(/\.rpgmvp$/, '.png');
            dim = dimForPath(png);
            if (dim) {
                if (isWatchUrl(rawUrl) || isMenuPictureWatchUrl(rawUrl)) log('[DIM] hit png-alias raw=', rawUrl, 'decoded=', path, 'alias=', png, 'dim=', dim[0] + 'x' + dim[1]);
                return dim;
            }
        }
        if (path.endsWith('.png')) {
            var rpgmvp = path.replace(/\.png$/, '.rpgmvp');
            dim = dimForPath(rpgmvp);
            if (dim) {
                if (isWatchUrl(rawUrl) || isMenuPictureWatchUrl(rawUrl)) log('[DIM] hit rpgmvp-alias raw=', rawUrl, 'decoded=', path, 'alias=', rpgmvp, 'dim=', dim[0] + 'x' + dim[1]);
                return dim;
            }
        }
        dim = fetchNativeDim(path, rawUrl);
        if (dim) return dim;
        if (isWatchUrl(rawUrl) || isMenuPictureWatchUrl(rawUrl)) {
            log('[DIM] MISS raw=', rawUrl, 'decoded=', path,
                'exact=', !!dimMap[path],
                'ci=', !!dimMapCI[path.toLowerCase()]);
        }
        return null;
    }

    function arkScale(bitmap) {
        if (!bitmap._arkOrigW) return 1;
        var c = bitmap.__canvas;
        if (c && c.width > 0) return c.width / bitmap._arkOrigW;
        var img = bitmap._image;
        if (img && img.naturalWidth) return img.naturalWidth / bitmap._arkOrigW;
        return 1;
    }

    function fixBaseTexture(bt, origW, origH) {
        if (!bt) return;
        if (bt._arkDimSet) return;
        bt._arkDimSet = true;

        try { bt._width = origW; } catch (e) {}
        try { bt._height = origH; } catch (e) {}
        try { if (bt.realWidth !== undefined) bt.realWidth = origW; } catch (e) {}
        try { if (bt.realHeight !== undefined) bt.realHeight = origH; } catch (e) {}

        try {
            Object.defineProperty(bt, 'width', {
                get: function () { return origW; },
                set: function () {},
                configurable: true,
                enumerable: true
            });
        } catch (e) {}
        try {
            Object.defineProperty(bt, 'height', {
                get: function () { return origH; },
                set: function () {},
                configurable: true,
                enumerable: true
            });
        } catch (e) {}

        var origUpdate = bt.update;
        bt.update = function () {
            origUpdate.call(this);
            try { this._width = origW; } catch (e) {}
            try { this._height = origH; } catch (e) {}
        };
    }

    function patch() {
        if (typeof Bitmap === 'undefined') return false;
        if (Bitmap.__arkDownsamplePatched) return true;

        // ── PIXI.Texture.frame setter safety net ──────────────────────
        // 最终防线：当 frame 超出 baseTexture 物理维度时，推算原始维度并修复。
        // 非降采样图片的 frame 永远在物理维度内，安全网不会误触发。
        if (typeof PIXI !== 'undefined' && PIXI.Texture && PIXI.Texture.prototype) {
            var _frameDesc = Object.getOwnPropertyDescriptor(PIXI.Texture.prototype, 'frame');
            if (_frameDesc && _frameDesc.set && !_frameDesc._arkPatched) {
                var _origFrameSetter = _frameDesc.set;
                var _safetyLogCount = 0;
                Object.defineProperty(PIXI.Texture.prototype, 'frame', {
                    get: _frameDesc.get,
                    set: function (rect) {
                        var bt = this.baseTexture;
                        if (bt && rect) {
                            var src = bt.source;
                            var physW = src && (src.naturalWidth || src.width) || 0;
                            var physH = src && (src.naturalHeight || src.height) || 0;
                            var btW = bt.width || bt._width || 0;
                            var btH = bt.height || bt._height || 0;
                            var frameOverflow = physW > 0 && physH > 0 &&
                                (rect.x + rect.width > physW || rect.y + rect.height > physH);
                            var baseOverflow = btW > 0 && btH > 0 &&
                                (rect.x + rect.width > btW || rect.y + rect.height > btH);
                            if ((frameOverflow || baseOverflow) &&
                                ((physW > 0 && physW <= 1 && physH > 0 && physH <= 1) ||
                                 (btW > 0 && btW <= 1 && btH > 0 && btH <= 1)) &&
                                typeof PIXI !== 'undefined' && PIXI.Rectangle) {
                                if (_safetyLogCount < 30) {
                                    _safetyLogCount++;
                                    log('[FrameSafetyStub] #' + _safetyLogCount,
                                        'phys=' + physW + 'x' + physH,
                                        'bt=' + btW + 'x' + btH,
                                        'frame=' + rect.x + ',' + rect.y + '+' + rect.width + 'x' + rect.height);
                                }
                                return setTextureFrameUnchecked(this, new PIXI.Rectangle(0, 0, 1, 1));
                            }
                            if (!bt._arkDimSet && physW > 1 && physH > 1 && (frameOverflow || baseOverflow) && window._arkDownsampleScale && window._arkDownsampleScale < 1) {
                                var scale = window._arkDownsampleScale;
                                var origW = Math.ceil(physW / scale);
                                var origH = Math.ceil(physH / scale);
                                fixBaseTexture(bt, origW, origH);
                                // Backfill associated Bitmap so blt/getPixel also work
                                if (bt._arkBitmap && !bt._arkBitmap._arkOrigW) {
                                    bt._arkBitmap._arkOrigW = origW;
                                    bt._arkBitmap._arkOrigH = origH;
                                }
                                if (_safetyLogCount < 30) {
                                    _safetyLogCount++;
                                    log('[FrameSafety] #' + _safetyLogCount,
                                        'phys=' + physW + 'x' + physH,
                                        'inferred=' + origW + 'x' + origH,
                                        'frame=' + rect.x + ',' + rect.y + '+' + rect.width + 'x' + rect.height);
                                }
                            }
                        }
                        try {
                            return _origFrameSetter.call(this, rect);
                        } catch (e) {
                            var bt2 = this.baseTexture;
                            var src2 = bt2 && bt2.source;
                            var physW2 = src2 && (src2.naturalWidth || src2.width) || 0;
                            var physH2 = src2 && (src2.naturalHeight || src2.height) || 0;
                            var btW2 = bt2 && (bt2.width || bt2._width) || 0;
                            var btH2 = bt2 && (bt2.height || bt2._height) || 0;
                            if (rect &&
                                ((physW2 <= 1 && physH2 <= 1) || (btW2 <= 1 && btH2 <= 1)) &&
                                typeof PIXI !== 'undefined' && PIXI.Rectangle) {
                                if (_safetyLogCount < 30) {
                                    _safetyLogCount++;
                                    log('[FrameSafetyStubCatch] #' + _safetyLogCount,
                                        'phys=' + physW2 + 'x' + physH2,
                                        'bt=' + btW2 + 'x' + btH2,
                                        'frame=' + rect.x + ',' + rect.y + '+' + rect.width + 'x' + rect.height,
                                        'err=' + (e && e.message));
                                }
                                return setTextureFrameUnchecked(this, new PIXI.Rectangle(0, 0, 1, 1));
                            }
                            throw e;
                        }
                    },
                    configurable: true
                });
                _frameDesc._arkPatched = true;
                log('PIXI.Texture.frame setter safety net installed');
            }
        }

        var widthDesc = Object.getOwnPropertyDescriptor(Bitmap.prototype, 'width');
        var heightDesc = Object.getOwnPropertyDescriptor(Bitmap.prototype, 'height');
        if (widthDesc && widthDesc.get) {
            Object.defineProperty(Bitmap.prototype, 'width', {
                get: function () {
                    if (!this._arkOrigW && this._url) {
                        var dim = lookupDim(this._url);
                        if (dim) {
                            this._arkOrigW = dim[0];
                            this._arkOrigH = dim[1];
                        }
                    }
                    if (this._arkOrigW) return this._arkOrigW;
                    return widthDesc.get.call(this);
                },
                configurable: true
            });
        }
        if (heightDesc && heightDesc.get) {
            Object.defineProperty(Bitmap.prototype, 'height', {
                get: function () {
                    if (!this._arkOrigH && this._url) {
                        var dim = lookupDim(this._url);
                        if (dim) {
                            this._arkOrigW = dim[0];
                            this._arkOrigH = dim[1];
                        }
                    }
                    if (this._arkOrigH) return this._arkOrigH;
                    return heightDesc.get.call(this);
                },
                configurable: true
            });
        }

        if (Bitmap.prototype._requestImage) {
            var origRequestImage = Bitmap.prototype._requestImage;
            var _reqLogCount = 0;
            Bitmap.prototype._requestImage = function (url) {
                var dim = lookupDim(url);
                if (dim) {
                    this._arkOrigW = dim[0];
                    this._arkOrigH = dim[1];
                    this._arkApplied = true;
                } else {
                    if (url && (url.indexOf('/faces/') >= 0 || url.indexOf('/titles') >= 0 || url.indexOf('/pictures/') >= 0)) {
                        log('NO-DIM:', url);
                    }
                }
                if (_reqLogCount < 20 && dim) {
                    _reqLogCount++;
                    log('REQ#' + _reqLogCount, url, '→', dim[0] + 'x' + dim[1]);
                }
                return origRequestImage.call(this, url);
            };
            log('_requestImage patched');
        } else {
            log('WARN: Bitmap.prototype._requestImage not found');
        }

        if (Bitmap.prototype._createBaseTexture) {
            var origCreateBaseTexture = Bitmap.prototype._createBaseTexture;
            Bitmap.prototype._createBaseTexture = function (source) {
                if (this.__baseTexture) {
                    return;
                }
                origCreateBaseTexture.call(this, source);
                // Backlink so frame setter safety net can find this Bitmap
                if (this.__baseTexture) {
                    this.__baseTexture._arkBitmap = this;
                }
                if (!this._arkOrigW && this._url) {
                    var dim = lookupDim(this._url);
                    if (dim) {
                        this._arkOrigW = dim[0];
                        this._arkOrigH = dim[1];
                    }
                }
                if (this._arkOrigW && this._arkOrigH) {
                    fixBaseTexture(this.__baseTexture, this._arkOrigW, this._arkOrigH);
                }
            };
        }

        var btPubDesc = Object.getOwnPropertyDescriptor(Bitmap.prototype, 'baseTexture');
        if (btPubDesc && btPubDesc.get && btPubDesc.configurable) {
            Object.defineProperty(Bitmap.prototype, 'baseTexture', {
                get: function () {
                    if (!this._arkOrigW && this._url) {
                        var dim = lookupDim(this._url);
                        if (dim) {
                            this._arkOrigW = dim[0];
                            this._arkOrigH = dim[1];
                        }
                    }
                    var bt = btPubDesc.get.call(this);
                    if (bt && !bt._arkBitmap) bt._arkBitmap = this;
                    if (bt && !bt._arkDimSet && this._arkOrigW && this._arkOrigH) {
                        fixBaseTexture(bt, this._arkOrigW, this._arkOrigH);
                    }
                    return bt;
                },
                configurable: true
            });
        }

        if (Bitmap.prototype.getPixel) {
            var origGetPixel = Bitmap.prototype.getPixel;
            Bitmap.prototype.getPixel = function (x, y) {
                var s = arkScale(this);
                if (s < 1) {
                    x = Math.round(x * s);
                    y = Math.round(y * s);
                }
                return origGetPixel.call(this, x, y);
            };
        }

        if (Bitmap.prototype.getAlphaPixel) {
            var origGetAlphaPixel = Bitmap.prototype.getAlphaPixel;
            Bitmap.prototype.getAlphaPixel = function (x, y) {
                var s = arkScale(this);
                if (s < 1) {
                    x = Math.round(x * s);
                    y = Math.round(y * s);
                }
                return origGetAlphaPixel.call(this, x, y);
            };
        }

        if (Bitmap.prototype.blt) {
            var origBlt = Bitmap.prototype.blt;
            var _bltLogCount = 0;
            var _faceLogCount = 0;
            Bitmap.prototype.blt = function (source, sx, sy, sw, sh, dx, dy, dw, dh) {
                // Fallback: if _arkOrigW not set yet, try looking up from dimMap
                if (!source._arkOrigW && source._url) {
                    var dim = lookupDim(source._url);
                    if (dim) {
                        source._arkOrigW = dim[0];
                        source._arkOrigH = dim[1];
                    }
                }
                var s = arkScale(source);
                var isFace = source._url && source._url.indexOf('faces') >= 0;
                if (isFace && _faceLogCount < 10) {
                    _faceLogCount++;
                    var cw = source.__canvas ? source.__canvas.width : 'null';
                    var iw = source._image ? source._image.naturalWidth : 'noImg';
                    var ready = source.isReady ? source.isReady() : '?';
                    log('FACE-BLT#' + _faceLogCount, 'scale=' + s.toFixed(4),
                        'ready=' + ready, '__cw=' + cw, 'imgNW=' + iw,
                        'origW=' + source._arkOrigW, 'url=' + source._url,
                        'src(' + sx + ',' + sy + ',' + sw + ',' + sh + ')',
                        'dst(' + dx + ',' + dy + ',' + dw + ',' + dh + ')');
                } else if (_bltLogCount < 5 && source._arkOrigW) {
                    _bltLogCount++;
                    log('blt#' + _bltLogCount, 'scale=' + s.toFixed(4),
                        'origW=' + source._arkOrigW,
                        'src(' + sx + ',' + sy + ',' + sw + ',' + sh + ')',
                        'dst(' + dx + ',' + dy + ',' + dw + ',' + dh + ')');
                }
                if (s < 1) {
                    if (typeof dw !== 'number' || isNaN(dw)) dw = sw;
                    if (typeof dh !== 'number' || isNaN(dh)) dh = sh;
                    sx = Math.round(sx * s);
                    sy = Math.round(sy * s);
                    sw = Math.round(sw * s);
                    sh = Math.round(sh * s);
                }
                return origBlt.call(this, source, sx, sy, sw, sh, dx, dy, dw, dh);
            };
        }

        if (Bitmap.prototype.bltImage) {
            var origBltImage = Bitmap.prototype.bltImage;
            Bitmap.prototype.bltImage = function (source, sx, sy, sw, sh, dx, dy, dw, dh) {
                if (!source._arkOrigW && source._url) {
                    var dim = lookupDim(source._url);
                    if (dim) {
                        source._arkOrigW = dim[0];
                        source._arkOrigH = dim[1];
                    }
                }
                var s = arkScale(source);
                if (s < 1) {
                    if (typeof dw !== 'number' || isNaN(dw)) dw = sw;
                    if (typeof dh !== 'number' || isNaN(dh)) dh = sh;
                    sx = Math.round(sx * s);
                    sy = Math.round(sy * s);
                    sw = Math.round(sw * s);
                    sh = Math.round(sh * s);
                }
                return origBltImage.call(this, source, sx, sy, sw, sh, dx, dy, dw, dh);
            };
        }

        Bitmap.__arkDownsamplePatched = true;
        return true;
    }

    // Patch Bitmap._onLoad as a fallback to ensure _arkOrigW is set
    // before load listeners fire (covers cached bitmaps, purge+decode path, etc.)
    function patchBitmapOnLoad() {
        if (typeof Bitmap === 'undefined' || !Bitmap.prototype._onLoad) return false;
        if (Bitmap.__arkOnLoadPatched) return true;

        var origOnLoad = Bitmap.prototype._onLoad;
        Bitmap.prototype._onLoad = function() {
            if (!this._arkOrigW && this._url) {
                var dim = lookupDim(this._url);
                if (dim) {
                    this._arkOrigW = dim[0];
                    this._arkOrigH = dim[1];
                }
            }
            return origOnLoad.apply(this, arguments);
        };

        Bitmap.__arkOnLoadPatched = true;
        return true;
    }

    // Patch pixi-tilemap: two changes for downsampled textures:
    //
    // 1. Scale atlas upload positions:
    //    Original: images uploaded at quadrant offsets (0, 1024, 0, 1024)
    //    Downsampled: upload at (0, 1024*scale, 0, 1024*scale)
    //    This ensures the vertex data's shiftU (always 0 or 1024) maps correctly
    //    when combined with scaled uSamplerSize.
    //
    // 2. Scale uSamplerSize:
    //    Original: 1/2048 (pixel coords → UV for 2048-wide atlas)
    //    Downsampled: scale/2048 (accounts for smaller images in atlas)
    //
    // pixi v4.5.4 uses property setters on shader.uniforms that immediately
    // call gl.uniformXfv when a value is assigned, so we must assign a NEW
    // array (not modify in-place) to trigger the setter.
    function patchTilemap() {
        if (typeof PIXI === 'undefined' || !PIXI.tilemap || !PIXI.tilemap.TileRenderer) return false;
        if (PIXI.tilemap.TileRenderer.__arkPatched) return true;

        var _lastScale = 1;
        var origBindTextures = PIXI.tilemap.TileRenderer.prototype.bindTextures;
        if (origBindTextures) {
            PIXI.tilemap.TileRenderer.prototype.bindTextures = function (renderer, shader, textures) {
                var scale = 1;
                for (var i = 0; i < textures.length; i++) {
                    var t = textures[i];
                    if (t && t.baseTexture && t.baseTexture.source) {
                        var src = t.baseTexture.source;
                        var srcW = src.naturalWidth || src.width;
                        var logW = t.baseTexture.width;
                        if (srcW > 0 && logW > srcW) {
                            scale = srcW / logW;
                            break;
                        }
                    }
                }

                // Scale atlas quadrant positions so downsampled images are placed
                // at (0, 1024*scale, 0, 1024*scale) instead of (0, 1024, 0, 1024).
                // This makes vertex shiftU (hardcoded 0/1024) combined with scaled
                // uSamplerSize map to the correct atlas pixels.
                if (scale !== _lastScale) {
                    _lastScale = scale;
                    var bounds = this.boundSprites;
                    if (bounds) {
                        for (var bi = 0; bi < bounds.length; bi++) {
                            for (var bj = 0; bj < bounds[bi].length; bj++) {
                                bounds[bi][bj].position.x = 1024 * scale * (bj & 1);
                                bounds[bi][bj].position.y = 1024 * scale * (bj >> 1);
                            }
                        }
                        log('atlas positions scaled by', scale);
                    }
                }

                origBindTextures.call(this, renderer, shader, textures);

                if (scale < 1) {
                    var uss = shader.uniforms.uSamplerSize;
                    if (uss) {
                        var sv = scale / 2048;
                        var newArr = [];
                        for (var j = 0; j < uss.length; j++) {
                            newArr.push(sv);
                        }
                        shader.uniforms.uSamplerSize = newArr;
                    }
                }
            };
        }

        PIXI.tilemap.TileRenderer.__arkPatched = true;
        log('tilemap patched');
        return true;
    }

    // Patch Sprite._refresh to ensure baseTexture is fixed before PIXI frame validation.
    function patchSprite() {
        if (typeof Sprite === 'undefined') return false;
        if (Sprite.__arkPatched) return true;

        var _spriteSetterLogCount = 0;
        var _stubRefreshLogCount = 0;
        var bitmapDesc = Object.getOwnPropertyDescriptor(Sprite.prototype, 'bitmap');
        if (bitmapDesc && bitmapDesc.set && bitmapDesc.configurable) {
            var origSpriteBitmapSetter = bitmapDesc.set;
            Object.defineProperty(Sprite.prototype, 'bitmap', {
                get: bitmapDesc.get,
                set: function(value) {
                    var prev = this._bitmap;
                    if (value && isDiagUrl(value._url)) {
                        diag('SpriteBitmapSet', 80,
                            'url=', value._url,
                            'fullImageTarget=', isFullImageSpriteUrl(value._url),
                            'same=', prev === value,
                            'ready=', value.isReady && value.isReady(),
                            'ark=', value._arkOrigW + 'x' + value._arkOrigH,
                            'img=', imageSizeOf(value),
                            'frame=', this._frame && JSON.stringify(this._frame),
                            'scale=', this.scale && (this.scale.x + 'x' + this.scale.y),
                            'ctor=', this.constructor && this.constructor.name,
                            'stack=', shortStack());
                    }
                    if (value && isKnownFullImageSpriteUrl(value._url)) {
                        this._arkFullImageDownsampleSprite = true;
                        this._arkSpecialActionSeqSprite = isSpecialActionSeqUrl(value._url);
                        ensureArkDim(value);
                        if ((isSpecialActionSeqUrl(value._url) || isMenuPictureWatchUrl(value._url)) && _spriteSetterLogCount < 60) {
                            _spriteSetterLogCount++;
                            log('[SpriteFull] bitmap set #' + _spriteSetterLogCount,
                                'same=', prev === value,
                                'ready=', value.isReady && value.isReady(),
                                'noRefresh=', !!this._Drill_COAS_noRefreshFrame,
                                'url=', value._url,
                                'frame=', this._frame && JSON.stringify(this._frame),
                                'ark=', value._arkOrigW + 'x' + value._arkOrigH,
                                'img=', imageSizeOf(value),
                                baseTextureState(value.__baseTexture));
                        }
                    } else {
                        this._arkFullImageDownsampleSprite = false;
                        this._arkSpecialActionSeqSprite = false;
                    }
                    origSpriteBitmapSetter.call(this, value);
                    if (value && value.isReady && value.isReady()) {
                        applyFullImageDownsampleSprite(this, 'setter-ready');
                    }
                },
                configurable: true
            });
        }

        var _origUpdate = Sprite.prototype.update;
        if (_origUpdate) {
            Sprite.prototype.update = function() {
                _origUpdate.apply(this, arguments);
                if (this._arkFullImageDownsampleSprite ||
                    this._arkSpecialActionSeqSprite ||
                    shouldCheckFullImageSprite(this, this._bitmap)) {
                    applyFullImageDownsampleSprite(this, 'update');
                }
            };
        }

        if (typeof Sprite_Picture !== 'undefined' && Sprite_Picture.prototype.update && !Sprite_Picture.__arkCoasPatched) {
            var _origPictureUpdate = Sprite_Picture.prototype.update;
            Sprite_Picture.prototype.update = function() {
                _origPictureUpdate.apply(this, arguments);
                if (this._arkFullImageDownsampleSprite ||
                    this._arkSpecialActionSeqSprite ||
                    shouldCheckFullImageSprite(this, this._bitmap)) {
                    applyFullImageDownsampleSprite(this, 'picture-update');
                }
            };
            Sprite_Picture.__arkCoasPatched = true;
            log('Sprite_Picture full-image patched');
        }

        var _origRefresh = Sprite.prototype._refresh;
            Sprite.prototype._refresh = function() {
                var bitmap = this._bitmap;
                if (bitmap) {
                    ensureArkDim(bitmap);
                    if (isOnePixelMissingStub(bitmap)) {
                        if (this._frame) {
                            try { this._frame.x = 0; } catch (e) {}
                            try { this._frame.y = 0; } catch (e) {}
                            try { this._frame.width = 1; } catch (e) {}
                            try { this._frame.height = 1; } catch (e) {}
                        }
                        if (this._realFrame) {
                            try { this._realFrame.x = 0; } catch (e) {}
                            try { this._realFrame.y = 0; } catch (e) {}
                            try { this._realFrame.width = 1; } catch (e) {}
                            try { this._realFrame.height = 1; } catch (e) {}
                        }
                        if (this.texture && typeof PIXI !== 'undefined' && PIXI.Rectangle) {
                            try { this.texture.frame = new PIXI.Rectangle(0, 0, 1, 1); } catch (e) {}
                        }
                        if (_stubRefreshLogCount < 80) {
                            _stubRefreshLogCount++;
                            log('[StubFrameClamp] #' + _stubRefreshLogCount,
                                'url=', bitmap._url,
                                'frame=', this._frame && JSON.stringify(this._frame),
                                'realFrame=', this._realFrame && JSON.stringify(this._realFrame),
                                'texFrame=', this.texture && JSON.stringify(this.texture.frame),
                                'ctor=', this.constructor && this.constructor.name,
                                baseTextureState(bitmap.__baseTexture));
                        }
                    }
                    if (bitmap._arkOrigW && bitmap._arkOrigH) {
                        var actualForDiag = isDiagUrl(bitmap._url) ? actualBitmapSize(bitmap) : null;
                        var bt = bitmap.baseTexture;
                        if (bt && !bt._arkDimSet) {
                            fixBaseTexture(bt, bitmap._arkOrigW, bitmap._arkOrigH);
                        }
                        if (bt && this.texture) {
                            this.texture.baseTexture = bt;
                        }
                        if (actualForDiag && actualForDiag[0] < bitmap._arkOrigW && actualForDiag[1] < bitmap._arkOrigH) {
                            diag('SpriteRefreshBT', 100,
                                'url=', bitmap._url,
                                'orig=', bitmap._arkOrigW + 'x' + bitmap._arkOrigH,
                                'actual=', actualForDiag[0] + 'x' + actualForDiag[1],
                                'fullImageTarget=', isFullImageSpriteUrl(bitmap._url),
                                'frame=', this._frame && JSON.stringify(this._frame),
                                'realFrame=', this._realFrame && JSON.stringify(this._realFrame),
                                'texFrame=', this.texture && JSON.stringify(this.texture.frame),
                                'scale=', this.scale && (this.scale.x + 'x' + this.scale.y),
                                'ctor=', this.constructor && this.constructor.name,
                                baseTextureState(bt),
                                'stack=', shortStack());
                        }
                    }
                }
            _origRefresh.call(this);
            if (this._arkFullImageDownsampleSprite ||
                this._arkSpecialActionSeqSprite ||
                shouldCheckFullImageSprite(this, bitmap)) {
                applyFullImageDownsampleSprite(this, 'refresh');
            }
        };

        Sprite.__arkPatched = true;
        return true;
    }

    var _coasApplyLogCount = 0;
    function applySpecialActionSeqSprite(sprite, phase) {
        applyFullImageDownsampleSprite(sprite, phase);
    }

    function shouldApplyFullImageDownsampleSprite(sprite, bitmap, actualW, actualH) {
        if (!sprite || !bitmap || !bitmap._arkOrigW || !bitmap._arkOrigH) return false;
        var knownFullImage = isKnownFullImageSpriteUrl(bitmap._url);
        var genericPicture = !knownFullImage &&
            typeof Sprite_Picture !== 'undefined' &&
            sprite instanceof Sprite_Picture &&
            isPictureUrl(bitmap._url);
        var largeGenericPicture = genericPicture && isLargePictureBitmap(bitmap);
        if (!knownFullImage && !genericPicture) return false;
        if (actualW <= 0 || actualH <= 0) return false;
        if (actualW >= bitmap._arkOrigW && actualH >= bitmap._arkOrigH) return false;
        if (typeof TilingSprite !== 'undefined' && sprite instanceof TilingSprite) return false;

        var frame = sprite._frame;
        if (!frame) return knownFullImage;
        if (frame.x && Math.abs(frame.x) > 0.0001) return false;
        if (frame.y && Math.abs(frame.y) > 0.0001) return false;

        var fw = frame.width || 0;
        var fh = frame.height || 0;
        if ((knownFullImage || largeGenericPicture) && Math.abs(fw - bitmap._arkOrigW) < 1 && Math.abs(fh - bitmap._arkOrigH) < 1) return true;
        if (Math.abs(fw - actualW) < 1 && Math.abs(fh - actualH) < 1) return true;

        var texFrame = sprite.texture && sprite.texture.frame;
        if (texFrame) {
            var tw = texFrame.width || 0;
            var th = texFrame.height || 0;
            if ((knownFullImage || largeGenericPicture) && Math.abs(tw - bitmap._arkOrigW) < 1 && Math.abs(th - bitmap._arkOrigH) < 1) return true;
            if (Math.abs(tw - actualW) < 1 && Math.abs(th - actualH) < 1) return true;
        }
        var realFrame = sprite._realFrame;
        if (realFrame) {
            var rw = realFrame.width || 0;
            var rh = realFrame.height || 0;
            if (genericPicture && Math.abs(rw - actualW) < 1 && Math.abs(rh - actualH) < 1) return true;
            if (largeGenericPicture && Math.abs(rw - bitmap._arkOrigW) < 1 && Math.abs(rh - bitmap._arkOrigH) < 1) return true;
        }
        return false;
    }

    function applyFullImageDownsampleSprite(sprite, phase) {
        var bitmap = sprite && sprite._bitmap;
        if (!bitmap) return;

        ensureArkDim(bitmap);
        if (!bitmap._arkOrigW || !bitmap._arkOrigH) return;

        var actual = actualBitmapSize(bitmap);
        if (!actual) return;
        var actualW = actual[0];
        var actualH = actual[1];
        if (actualW <= 0 || actualH <= 0) return;
        if (actualW >= bitmap._arkOrigW && actualH >= bitmap._arkOrigH) return;
        if (!shouldApplyFullImageDownsampleSprite(sprite, bitmap, actualW, actualH)) return;

        if (sprite._Drill_COAS_noRefreshFrame && sprite._frame) {
            if (!sprite._frame.width || sprite._frame.width > actualW) {
                try { sprite._frame.width = actualW; } catch (e) {}
            }
            if (!sprite._frame.height || sprite._frame.height > actualH) {
                try { sprite._frame.height = actualH; } catch (e) {}
            }
        }

        var src = (bitmap.__baseTexture && bitmap.__baseTexture.source) || bitmap._image || bitmap.__canvas;
        if (!src || typeof PIXI === 'undefined' || !PIXI.BaseTexture || !PIXI.Rectangle) return;

        var key = bitmap._url + '|' + actualW + 'x' + actualH;
        if (!bitmap._arkFullImageBaseTexture || bitmap._arkFullImageBaseTextureKey !== key) {
            bitmap._arkFullImageBaseTexture = new PIXI.BaseTexture(src);
            if (bitmap.__baseTexture) {
                try { bitmap._arkFullImageBaseTexture.scaleMode = bitmap.__baseTexture.scaleMode; } catch (e) {}
            }
            try { bitmap._arkFullImageBaseTexture.mipmap = false; } catch (e) {}
            try { bitmap._arkFullImageBaseTexture.width = actualW; } catch (e) {}
            try { bitmap._arkFullImageBaseTexture.height = actualH; } catch (e) {}
            try { bitmap._arkFullImageBaseTexture.realWidth = actualW; } catch (e) {}
            try { bitmap._arkFullImageBaseTexture.realHeight = actualH; } catch (e) {}
            if (typeof bitmap._arkFullImageBaseTexture.update === 'function') {
                try { bitmap._arkFullImageBaseTexture.update(); } catch (e) {}
            }
            if (bitmap._arkFullImageBaseTexture.hasLoaded !== undefined) {
                try { bitmap._arkFullImageBaseTexture.hasLoaded = true; } catch (e) {}
            }
            bitmap._arkFullImageBaseTextureKey = key;
        }

        var bt = bitmap._arkFullImageBaseTexture;
        try { sprite.texture.baseTexture = bt; } catch (e) {}
        if (sprite._realFrame) {
            try { sprite._realFrame.x = 0; } catch (e) {}
            try { sprite._realFrame.y = 0; } catch (e) {}
            try { sprite._realFrame.width = actualW; } catch (e) {}
            try { sprite._realFrame.height = actualH; } catch (e) {}
            try { sprite.texture.frame = sprite._realFrame; } catch (e) {}
        } else if (typeof PIXI !== 'undefined' && PIXI.Rectangle) {
            try { sprite.texture.frame = new PIXI.Rectangle(0, 0, actualW, actualH); } catch (e) {}
        }
        try { sprite.texture._updateID++; } catch (e) {}

        var sx = bitmap._arkOrigW / actualW;
        var sy = bitmap._arkOrigH / actualH;
        var last = sprite._arkFullImageScaleFix;
        var lastApplied = sprite._arkFullImageAppliedScale;
        var curX = sprite.scale ? sprite.scale.x : 1;
        var curY = sprite.scale ? sprite.scale.y : 1;
        var baseX = curX;
        var baseY = curY;
        if (last && lastApplied &&
            Math.abs(curX - lastApplied.x) < 0.0001 &&
            Math.abs(curY - lastApplied.y) < 0.0001) {
            baseX = curX / last.x;
            baseY = curY / last.y;
        }
        try { sprite.scale.x = baseX * sx; } catch (e) {}
        try { sprite.scale.y = baseY * sy; } catch (e) {}
        sprite._arkFullImageScaleFix = { x: sx, y: sy };
        sprite._arkFullImageAppliedScale = {
            x: sprite.scale ? sprite.scale.x : baseX * sx,
            y: sprite.scale ? sprite.scale.y : baseY * sy
        };

        if ((isSpecialActionSeqUrl(bitmap._url) || isMenuPictureWatchUrl(bitmap._url)) && _coasApplyLogCount < 120) {
            _coasApplyLogCount++;
            log('[SpriteFull] apply #' + _coasApplyLogCount,
                phase,
                'url=', bitmap._url,
                'noRefresh=', !!sprite._Drill_COAS_noRefreshFrame,
                'orig=', bitmap._arkOrigW + 'x' + bitmap._arkOrigH,
                'actual=', actualW + 'x' + actualH,
                'frame=', sprite._frame && JSON.stringify(sprite._frame),
                'realFrame=', sprite._realFrame && JSON.stringify(sprite._realFrame),
                'texFrame=', sprite.texture && JSON.stringify(sprite.texture.frame),
                'scaleFix=', sx + 'x' + sy,
                'baseScale=', baseX + 'x' + baseY,
                'scale=', sprite.scale && (sprite.scale.x + 'x' + sprite.scale.y),
                baseTextureState(bt));
        }
        if (isDiagUrl(bitmap._url)) {
            diag('SpriteFullApply', 80,
                phase,
                'url=', bitmap._url,
                'orig=', bitmap._arkOrigW + 'x' + bitmap._arkOrigH,
                'actual=', actualW + 'x' + actualH,
                'frame=', sprite._frame && JSON.stringify(sprite._frame),
                'realFrame=', sprite._realFrame && JSON.stringify(sprite._realFrame),
                'texFrame=', sprite.texture && JSON.stringify(sprite.texture.frame),
                'scaleFix=', sx + 'x' + sy,
                'baseScale=', baseX + 'x' + baseY,
                'scale=', sprite.scale && (sprite.scale.x + 'x' + sprite.scale.y),
                'ctor=', sprite.constructor && sprite.constructor.name,
                'stack=', shortStack());
        }
    }

    function patchSpriteTint() {
        if (typeof Sprite === 'undefined' || !Sprite.prototype._executeTint) return false;
        if (Sprite.__arkTintPatched) return true;

        var origExecuteTint = Sprite.prototype._executeTint;
        Sprite.prototype._executeTint = function(x, y, w, h) {
            var bitmap = this._bitmap;
            if (!bitmap || !bitmap._arkOrigW || !bitmap._arkOrigH) {
                return origExecuteTint.call(this, x, y, w, h);
            }

            var actual = actualBitmapSize(bitmap);
            if (!actual || actual[0] >= bitmap._arkOrigW || actual[1] >= bitmap._arkOrigH) {
                return origExecuteTint.call(this, x, y, w, h);
            }

            var source = bitmap.canvas;
            if (!source || source.width <= 1 || source.height <= 1) {
                return origExecuteTint.call(this, x, y, w, h);
            }

            var sxScale = source.width / bitmap._arkOrigW;
            var syScale = source.height / bitmap._arkOrigH;
            var sx = Math.max(0, x * sxScale);
            var sy = Math.max(0, y * syScale);
            var sw = Math.max(1, Math.min(source.width - sx, w * sxScale));
            var sh = Math.max(1, Math.min(source.height - sy, h * syScale));

            var context = this._context;
            var tone = this._colorTone;
            var color = this._blendColor;

            context.globalCompositeOperation = 'copy';
            context.drawImage(source, sx, sy, sw, sh, 0, 0, w, h);

            if (Graphics.canUseSaturationBlend()) {
                var gray = Math.max(0, tone[3]);
                context.globalCompositeOperation = 'saturation';
                context.fillStyle = 'rgba(255,255,255,' + gray / 255 + ')';
                context.fillRect(0, 0, w, h);
            }

            var r1 = Math.max(0, tone[0]);
            var g1 = Math.max(0, tone[1]);
            var b1 = Math.max(0, tone[2]);
            if (tone[4] == 1) context.globalCompositeOperation = 'color';
            else context.globalCompositeOperation = 'lighter';
            context.fillStyle = Utils.rgbToCssColor(r1, g1, b1);
            context.fillRect(0, 0, w, h);

            if (Graphics.canUseDifferenceBlend()) {
                context.globalCompositeOperation = 'difference';
                context.fillStyle = 'white';
                context.fillRect(0, 0, w, h);

                var r2 = Math.max(0, -tone[0]);
                var g2 = Math.max(0, -tone[1]);
                var b2 = Math.max(0, -tone[2]);
                if (tone[4] == 1) context.globalCompositeOperation = 'color';
                else context.globalCompositeOperation = 'lighter';
                context.fillStyle = Utils.rgbToCssColor(r2, g2, b2);
                context.fillRect(0, 0, w, h);

                context.globalCompositeOperation = 'difference';
                context.fillStyle = 'white';
                context.fillRect(0, 0, w, h);
            }

            var r3 = Math.max(0, color[0]);
            var g3 = Math.max(0, color[1]);
            var b3 = Math.max(0, color[2]);
            var a3 = Math.max(0, color[3]);
            context.globalCompositeOperation = 'source-atop';
            context.fillStyle = Utils.rgbToCssColor(r3, g3, b3);
            context.globalAlpha = a3 / 255;
            context.fillRect(0, 0, w, h);

            context.globalCompositeOperation = 'destination-in';
            context.globalAlpha = 1;
            context.drawImage(source, sx, sy, sw, sh, 0, 0, w, h);

            if (isStandWatchUrl(bitmap._url)) {
                log('[Tint] scaled',
                    'url=', bitmap._url,
                    'orig=', bitmap._arkOrigW + 'x' + bitmap._arkOrigH,
                    'source=', source.width + 'x' + source.height,
                    'srcRect=', [sx, sy, sw, sh].join(','),
                    'dst=', w + 'x' + h);
            }
        };

        Sprite.__arkTintPatched = true;
        log('Sprite tint patched');
        return true;
    }

    function patchDrillAnimationSurround() {
        if (typeof Drill_ASu_Sprite === 'undefined') return false;
        if (!Drill_ASu_Sprite.prototype.drill_sprite_updateAuto) return false;
        if (Drill_ASu_Sprite.__arkPatched) return true;

        var origUpdateAuto = Drill_ASu_Sprite.prototype.drill_sprite_updateAuto;
        Drill_ASu_Sprite.prototype.drill_sprite_updateAuto = function() {
            origUpdateAuto.apply(this, arguments);
            applyDrillActionSeqSprite(this._drill_ballSprite, 'ball');
            applyDrillActionSeqSprite(this._drill_ballShadowSprite, 'shadow');
        };

        Drill_ASu_Sprite.__arkPatched = true;
        log('Drill_AnimationSurround patched');
        return true;
    }

    var _drillActionSeqLogCount = 0;
    function applyDrillActionSeqSprite(sprite, phase) {
        var bitmap = sprite && sprite._bitmap;
        if (!bitmap || !isSpecialActionSeqUrl(bitmap._url)) return;

        ensureArkDim(bitmap);
        if (!bitmap._arkOrigW || !bitmap._arkOrigH) return;

        var actual = actualBitmapSize(bitmap);
        if (!actual) return;
        var actualW = actual[0];
        var actualH = actual[1];
        if (actualW <= 0 || actualH <= 0) return;
        if (actualW >= bitmap._arkOrigW && actualH >= bitmap._arkOrigH) return;

        var src = (bitmap.__baseTexture && bitmap.__baseTexture.source) || bitmap._image || bitmap.__canvas;
        if (!src || typeof PIXI === 'undefined' || !PIXI.BaseTexture || !PIXI.Rectangle) return;

        var key = bitmap._url + '|' + actualW + 'x' + actualH;
        if (!bitmap._arkSpriteBaseTexture || bitmap._arkSpriteBaseTextureKey !== key) {
            bitmap._arkSpriteBaseTexture = new PIXI.BaseTexture(src);
            if (bitmap.__baseTexture) {
                try { bitmap._arkSpriteBaseTexture.scaleMode = bitmap.__baseTexture.scaleMode; } catch (e) {}
            }
            try { bitmap._arkSpriteBaseTexture.mipmap = false; } catch (e) {}
            try { bitmap._arkSpriteBaseTexture.width = actualW; } catch (e) {}
            try { bitmap._arkSpriteBaseTexture.height = actualH; } catch (e) {}
            try { bitmap._arkSpriteBaseTexture.realWidth = actualW; } catch (e) {}
            try { bitmap._arkSpriteBaseTexture.realHeight = actualH; } catch (e) {}
            if (typeof bitmap._arkSpriteBaseTexture.update === 'function') {
                try { bitmap._arkSpriteBaseTexture.update(); } catch (e) {}
            }
            if (bitmap._arkSpriteBaseTexture.hasLoaded !== undefined) {
                try { bitmap._arkSpriteBaseTexture.hasLoaded = true; } catch (e) {}
            }
            bitmap._arkSpriteBaseTextureKey = key;
        }

        var sx = bitmap._arkOrigW / actualW;
        var sy = bitmap._arkOrigH / actualH;

        try { sprite.texture.baseTexture = bitmap._arkSpriteBaseTexture; } catch (e) {}
        try { sprite.texture.frame = new PIXI.Rectangle(0, 0, actualW, actualH); } catch (e) {}
        try { sprite.texture._updateID++; } catch (e) {}

        try { sprite.scale.x *= sx; } catch (e) {}
        try { sprite.scale.y *= sy; } catch (e) {}

        if (_drillActionSeqLogCount < 20) {
            _drillActionSeqLogCount++;
            log('[DrillASu] apply',
                phase,
                'url=', bitmap._url,
                'orig=', bitmap._arkOrigW + 'x' + bitmap._arkOrigH,
                'actual=', actualW + 'x' + actualH,
                'scaleFix=', sx + 'x' + sy,
                'spriteScale=', sprite.scale && (sprite.scale.x + 'x' + sprite.scale.y),
                'texFrame=', sprite.texture && JSON.stringify(sprite.texture.frame),
                'actualBT=', baseTextureState(bitmap._arkSpriteBaseTexture),
                'sharedBT=', baseTextureState(bitmap.__baseTexture));
        }
    }

    // Patch TilingSprite to handle downsampled textures.
    //
    // Problem: PIXI TilingSpriteRenderer checks isSimple:
    //   isSimple = tex.frame.width === baseTex.width && tex.frame.height === baseTex.height
    // When true, it uses REPEAT wrap mode on the WebGL texture. But the actual texture
    // is downsampled (e.g., 360x252 instead of 1440x1008), so REPEAT causes 4x tiling.
    //
    // fixBaseTexture makes baseTex.width return 1440 (original), and _refresh sets
    // texture.frame to _frame (also 1440 from move()). So isSimple=true → wrong tiling.
    //
    // Fix: For TilingSprite, do NOT use fixBaseTexture. Instead:
    // 1. Let baseTexture keep its actual size (360x252)
    // 2. Scale the TilingSprite itself to fill the original area
    // 3. Scale tileTransform inversely so tile scrolling speed stays correct
    function patchTilingSprite() {
        if (typeof TilingSprite === 'undefined') { log('WARN: TilingSprite not defined'); return false; }
        if (!TilingSprite.prototype._onBitmapLoad) { log('WARN: TilingSprite._onBitmapLoad not found'); return false; }
        if (TilingSprite.__arkPatched) return true;

        var _tsLogCount = 0;

        var _origTsOnBitmapLoad = TilingSprite.prototype._onBitmapLoad;
        TilingSprite.prototype._onBitmapLoad = function() {
            var bitmap = this._bitmap;
            if (bitmap) {
                if (!bitmap._arkOrigW && bitmap._url) {
                    var dim = lookupDim(bitmap._url);
                    if (dim) {
                        bitmap._arkOrigW = dim[0];
                        bitmap._arkOrigH = dim[1];
                    }
                }
                if (isWatchUrl(bitmap._url)) {
                    log('[TS] onBitmapLoad before original',
                        'url=', bitmap._url,
                        'ark=', bitmap._arkOrigW + 'x' + bitmap._arkOrigH,
                        'img=', imageSizeOf(bitmap),
                        baseTextureState(bitmap.__baseTexture));
                }
            }
            _origTsOnBitmapLoad.call(this);
            safeApplyTilingDownsample(this, 'onBitmapLoad');
            if (bitmap && isWatchUrl(bitmap._url)) {
                log('[TS] onBitmapLoad after original',
                    'url=', bitmap._url,
                    'textureFrame=', this.texture && JSON.stringify(this.texture.frame),
                    baseTextureState(bitmap.__baseTexture));
            }
        };

        var _origTsRenderWebGL = TilingSprite.prototype._renderWebGL;
        var _renderLogCount = 0;
        TilingSprite.prototype._renderWebGL = function(renderer) {
            if (_renderLogCount < 10) {
                _renderLogCount++;
                var bm = this._bitmap;
                log('[TS] RENDER #' + _renderLogCount,
                    '_w=', this._width, '_h=', this._height,
                    'bm=', !!bm, 'arkW=', bm && bm._arkOrigW,
                    'bmUrl=', bm && bm._url,
                    'texValid=', this.texture && this.texture.valid);
            }
            if (this._bitmap && isWatchUrl(this._bitmap._url)) {
                log('[TS] WATCH render',
                    'url=', this._bitmap._url,
                    '_width=', this._width, '_height=', this._height,
                    'texValid=', this.texture && this.texture.valid,
                    'texFrame=', this.texture && JSON.stringify(this.texture.frame),
                    'texBT=', baseTextureState(this.texture && this.texture.baseTexture),
                    'sharedBT=', baseTextureState(this._bitmap.__baseTexture));
            }
            _origTsRenderWebGL.call(this, renderer);
        };

        var _origTsRefresh = TilingSprite.prototype._refresh;
        var _refreshLogCount = 0;
        TilingSprite.prototype._refresh = function() {
            var bitmap = this._bitmap;
            if (bitmap) {
                if (!bitmap._arkOrigW && bitmap._url) {
                    var dim = lookupDim(bitmap._url);
                    if (dim) {
                        bitmap._arkOrigW = dim[0];
                        bitmap._arkOrigH = dim[1];
                    }
                }
                if (bitmap._arkOrigW && bitmap._arkOrigH) {
                    if (this._frame.width === 0 && this._frame.height === 0) {
                        try { this._frame.width = bitmap._arkOrigW; } catch (e) {}
                        try { this._frame.height = bitmap._arkOrigH; } catch (e) {}
                    }
                }
            }
            if (_refreshLogCount < 10) {
                _refreshLogCount++;
                log('[TS] _refresh #' + _refreshLogCount,
                    '_width=', this._width, '_height=', this._height,
                    '_frame=', JSON.stringify(this._frame),
                    'texFrame=', this.texture && JSON.stringify(this.texture.frame));
            }
            if (bitmap && isWatchUrl(bitmap._url)) {
                log('[TS] WATCH refresh before original',
                    'url=', bitmap._url,
                    '_width=', this._width, '_height=', this._height,
                    '_frame=', JSON.stringify(this._frame),
                    'texFrame=', this.texture && JSON.stringify(this.texture.frame),
                    'img=', imageSizeOf(bitmap),
                    baseTextureState(bitmap.__baseTexture));
            }
            _origTsRefresh.call(this);
            safeApplyTilingDownsample(this, 'refresh');
            if (bitmap && isWatchUrl(bitmap._url)) {
                log('[TS] WATCH refresh after original',
                    'url=', bitmap._url,
                    'texFrame=', this.texture && JSON.stringify(this.texture.frame),
                    baseTextureState(bitmap.__baseTexture));
            }
        };

        // Override bitmap setter to handle already-loaded bitmaps (MV v1.6.1).
        var bitmapDesc = Object.getOwnPropertyDescriptor(TilingSprite.prototype, 'bitmap');
        log('[TS] bitmap descriptor: set=', !!(bitmapDesc && bitmapDesc.set));
        if (bitmapDesc && bitmapDesc.set) {
            var origTsBitmapSetter = bitmapDesc.set;
            Object.defineProperty(TilingSprite.prototype, 'bitmap', {
                get: bitmapDesc.get,
                set: function(value) {
                    var prev = this._bitmap;
                    log('[TS] bitmap setter: prev=', !!prev, 'new=', !!value,
                        'ready=', value && value.isReady && value.isReady(),
                        'url=', value && value._url);
                    if (value && isWatchUrl(value._url)) {
                        log('[TS] WATCH setter before original',
                            'url=', value._url,
                            'ready=', value.isReady && value.isReady(),
                            'ark=', value._arkOrigW + 'x' + value._arkOrigH,
                            'img=', imageSizeOf(value),
                            baseTextureState(value.__baseTexture));
                    }
                    origTsBitmapSetter.call(this, value);
                    if (value && isWatchUrl(value._url)) {
                        log('[TS] WATCH setter after original',
                            'url=', value._url,
                            'texFrame=', this.texture && JSON.stringify(this.texture.frame),
                            baseTextureState(value.__baseTexture));
                    }
                    if (value && value !== prev && value.isReady && value.isReady()) {
                        log('[TS] bitmap setter: calling _onBitmapLoad for ready bitmap');
                        this._onBitmapLoad();
                    }
                },
                configurable: true
            });
        }

        TilingSprite.__arkPatched = true;
        log('TilingSprite patched');
        return true;
    }

    function safeApplyTilingDownsample(sprite, phase) {
        try {
            applyTilingDownsample(sprite, phase);
        } catch (e) {
            log('[TS] apply skipped:', e && e.message ? e.message : e);
        }
    }

    function applyTilingDownsample(sprite, phase) {
        var bitmap = sprite && sprite._bitmap;
        if (!bitmap || isExcludedTilingUrl(bitmap._url)) return;

        if (!bitmap._arkOrigW && bitmap._url) {
            var dim = lookupDim(bitmap._url);
            if (dim) {
                bitmap._arkOrigW = dim[0];
                bitmap._arkOrigH = dim[1];
            }
        }
        if (!bitmap._arkOrigW || !bitmap._arkOrigH) return;

        var actual = actualBitmapSize(bitmap);
        if (!actual) return;
        var actualW = actual[0];
        var actualH = actual[1];
        if (actualW <= 0 || actualH <= 0) return;
        if (actualW >= bitmap._arkOrigW && actualH >= bitmap._arkOrigH) return;

        var src = (bitmap.__baseTexture && bitmap.__baseTexture.source) || bitmap._image || bitmap.__canvas;
        if (!src || typeof PIXI === 'undefined' || !PIXI.BaseTexture || !PIXI.Rectangle) return;

        var key = bitmap._url + '|' + actualW + 'x' + actualH;
        if (!bitmap._arkTilingBaseTexture || bitmap._arkTilingBaseTextureKey !== key) {
            bitmap._arkTilingBaseTexture = new PIXI.BaseTexture(src);
            try { bitmap._arkTilingBaseTexture.mipmap = false; } catch (e) {}
            if (bitmap.__baseTexture) {
                try { bitmap._arkTilingBaseTexture.scaleMode = bitmap.__baseTexture.scaleMode; } catch (e) {}
            }
            try { bitmap._arkTilingBaseTexture.width = actualW; } catch (e) {}
            try { bitmap._arkTilingBaseTexture.height = actualH; } catch (e) {}
            try { bitmap._arkTilingBaseTexture.realWidth = actualW; } catch (e) {}
            try { bitmap._arkTilingBaseTexture.realHeight = actualH; } catch (e) {}
            if (typeof bitmap._arkTilingBaseTexture.update === 'function') {
                try { bitmap._arkTilingBaseTexture.update(); } catch (e) {}
            }
            if (bitmap._arkTilingBaseTexture.hasLoaded !== undefined) {
                try { bitmap._arkTilingBaseTexture.hasLoaded = true; } catch (e) {}
            }
            bitmap._arkTilingBaseTextureKey = key;
        }

        try { sprite.texture.baseTexture = bitmap._arkTilingBaseTexture; } catch (e) {}
        try { sprite.texture.frame = new PIXI.Rectangle(0, 0, actualW, actualH); } catch (e) {}
        try { sprite.texture._updateID++; } catch (e) {}
        try { sprite.tilingTexture = null; } catch (e) {}

        if (!sprite._arkTileScaleBase) {
            sprite._arkTileScaleBase = {
                x: sprite.tileScale ? sprite.tileScale.x : 1,
                y: sprite.tileScale ? sprite.tileScale.y : 1
            };
        }
        if (sprite.tileScale) {
            try { sprite.tileScale.x = sprite._arkTileScaleBase.x * (bitmap._arkOrigW / actualW); } catch (e) {}
            try { sprite.tileScale.y = sprite._arkTileScaleBase.y * (bitmap._arkOrigH / actualH); } catch (e) {}
        }

        if (sprite._width === 0 && sprite._height === 0) {
            try { sprite._width = bitmap._arkOrigW; } catch (e) {}
            try { sprite._height = bitmap._arkOrigH; } catch (e) {}
        }

        if (isWatchUrl(bitmap._url) || isMenuGifUrl(bitmap._url)) {
            log('[TS] APPLY', phase,
                'url=', bitmap._url,
                'orig=', bitmap._arkOrigW + 'x' + bitmap._arkOrigH,
                'actual=', actualW + 'x' + actualH,
                'baseScale=', sprite._arkTileScaleBase.x + 'x' + sprite._arkTileScaleBase.y,
                'tileScale=', sprite.tileScale && (sprite.tileScale.x + 'x' + sprite.tileScale.y),
                'texFrame=', sprite.texture && JSON.stringify(sprite.texture.frame),
                'tilingBT=', baseTextureState(bitmap._arkTilingBaseTexture),
                'sharedBT=', baseTextureState(bitmap.__baseTexture));
        }
        if (isDiagUrl(bitmap._url)) {
            diag('TilingApply', 100,
                phase,
                'url=', bitmap._url,
                'orig=', bitmap._arkOrigW + 'x' + bitmap._arkOrigH,
                'actual=', actualW + 'x' + actualH,
                '_width=', sprite._width,
                '_height=', sprite._height,
                '_frame=', sprite._frame && JSON.stringify(sprite._frame),
                'texFrame=', sprite.texture && JSON.stringify(sprite.texture.frame),
                'baseScale=', sprite._arkTileScaleBase && (sprite._arkTileScaleBase.x + 'x' + sprite._arkTileScaleBase.y),
                'tileScale=', sprite.tileScale && (sprite.tileScale.x + 'x' + sprite.tileScale.y),
                'ctor=', sprite.constructor && sprite.constructor.name,
                'stack=', shortStack());
        }
    }

    // As a plugin, we execute after all game plugins.
    // Bitmap/Sprite/TilingSprite/PIXI are all available at this point.
    patch();
    patchBitmapOnLoad();
    patchTilemap();
    patchSprite();
    patchSpriteTint();
    patchDrillAnimationSurround();
    patchTilingSprite();
    log('all patches applied');
}());


/* === ark_image_downsample_mz.js === */
(function () {
    'use strict';

    var DEBUG = true;
    function log() {
        if (DEBUG) console.log.apply(console, ['[ark-mz]'].concat(Array.prototype.slice.call(arguments)));
    }

    function decodedUrl(url) {
        if (!url) return '';
        var s = String(url);
        try { s = decodeURIComponent(s); } catch (e) {}
        return s;
    }

    function imageSizeOf(bitmap) {
        var img = bitmap && bitmap._image;
        if (img) return (img.naturalWidth || img.width || 0) + 'x' + (img.naturalHeight || img.height || 0);
        var canvas = bitmap && bitmap._canvas;
        if (canvas) return (canvas.width || 0) + 'x' + (canvas.height || 0);
        var bt = bitmap && bitmap._baseTexture;
        var res = bt && bt.resource;
        var src = res && (res.source || res.src);
        if (src) return (src.naturalWidth || src.width || 0) + 'x' + (src.naturalHeight || src.height || 0);
        return '0x0';
    }

    function actualBitmapSize(bitmap) {
        if (!bitmap) return null;
        var img = bitmap._image;
        if (img) {
            var iw = img.naturalWidth || img.width || 0;
            var ih = img.naturalHeight || img.height || 0;
            if (iw > 0 && ih > 0) return [iw, ih];
        }
        var canvas = bitmap._canvas;
        if (canvas && canvas.width > 0 && canvas.height > 0) return [canvas.width, canvas.height];
        var bt = bitmap._baseTexture;
        var res = bt && bt.resource;
        var src = res && (res.source || res.src);
        if (src) {
            var sw = src.naturalWidth || src.width || 0;
            var sh = src.naturalHeight || src.height || 0;
            if (sw > 0 && sh > 0) return [sw, sh];
        }
        return null;
    }

    function unicodePathVariants(path) {
        var variants = [path];
        if (path && typeof path.normalize === 'function') {
            try { variants.push(path.normalize('NFC')); } catch (e) {}
            try { variants.push(path.normalize('NFD')); } catch (e) {}
        }
        var out = [];
        var seen = {};
        for (var i = 0; i < variants.length; i++) {
            var v = variants[i];
            if (v && !seen[v]) {
                seen[v] = true;
                out.push(v);
            }
        }
        return out;
    }

    var dimMap = window._arkDims || {};
    var dimMapCI = {};
    Object.keys(dimMap).forEach(function (key) {
        dimMapCI[key.toLowerCase()] = dimMap[key];
        unicodePathVariants(key).forEach(function (variant) {
            dimMapCI[variant.toLowerCase()] = dimMap[key];
        });
    });

    function cacheDim(path, dim, aliases) {
        if (!path || !dim) return;
        var keys = [path];
        if (aliases && aliases.length) keys = keys.concat(aliases);
        keys.forEach(function (key) {
            unicodePathVariants(key).forEach(function (variant) {
                dimMap[variant] = dim;
                dimMapCI[variant.toLowerCase()] = dim;
            });
        });
    }

    function dimForPath(path) {
        var variants = unicodePathVariants(path);
        for (var i = 0; i < variants.length; i++) {
            var key = variants[i];
            var dim = dimMap[key] || dimMapCI[key.toLowerCase()];
            if (dim) return dim;
        }
        return null;
    }

    var nativeDimMisses = {};
    function fetchNativeDim(path, rawUrl) {
        if (!window._arkLazyDimLookup || !path || (nativeDimMisses[path] || 0) > 3) return null;
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', (location.protocol || 'rpgmz:') + '//game/__ark_downsample_dim__?path=' + encodeURIComponent(path), false);
            xhr.send(null);
            if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
                var payload = JSON.parse(xhr.responseText);
                if (payload && payload.width > 0 && payload.height > 0) {
                    var dim = [payload.width, payload.height];
                    cacheDim(path, dim, payload.aliases || []);
                    return dim;
                }
            }
        } catch (e) {
            log('[DIM] native lookup failed raw=', rawUrl, 'decoded=', path, 'err=', e && e.message);
        }
        nativeDimMisses[path] = (nativeDimMisses[path] || 0) + 1;
        return null;
    }

    function normalizeUrl(url) {
        var path = decodedUrl(url);
        path = path.replace(/^[a-z]+:\/\/[^/]+\//, '');
        path = path.replace(/^\/+/, '');
        return path;
    }

    function lookupDim(url) {
        if (!url) return null;
        var path = normalizeUrl(url);
        var dim = dimForPath(path);
        if (dim) return dim;
        if (path.indexOf('www/') === 0) {
            dim = dimForPath(path.slice(4));
            if (dim) return dim;
        } else {
            dim = dimForPath('www/' + path);
            if (dim) return dim;
        }
        if (path.endsWith('.png')) {
            dim = dimForPath(path.replace(/\.png$/, '.rpgmvp'));
            if (dim) return dim;
        } else if (path.endsWith('.rpgmvp')) {
            dim = dimForPath(path.replace(/\.rpgmvp$/, '.png'));
            if (dim) return dim;
        }
        return fetchNativeDim(path, url);
    }

    function arkScale(bitmap) {
        if (!bitmap || !bitmap._arkOrigW) return 1;
        var actual = actualBitmapSize(bitmap);
        if (!actual || actual[0] <= 0) return 1;
        return actual[0] / bitmap._arkOrigW;
    }

    function fixBaseTexture(bt, origW, origH) {
        if (!bt || !origW || !origH || bt._arkDimSet) return;
        bt._arkDimSet = true;
        bt._arkOrigW = origW;
        bt._arkOrigH = origH;
        try { bt.width = origW; } catch (e) {}
        try { bt.height = origH; } catch (e) {}
        try { bt.realWidth = origW; } catch (e) {}
        try { bt.realHeight = origH; } catch (e) {}
    }

    function ensureArkDim(bitmap) {
        if (!bitmap || bitmap._arkOrigW || !bitmap.url) return;
        var dim = lookupDim(bitmap.url);
        if (dim) {
            bitmap._arkOrigW = dim[0];
            bitmap._arkOrigH = dim[1];
        }
    }

    function patchBitmap() {
        if (typeof Bitmap === 'undefined' || Bitmap.__arkMZDownsamplePatched) return;

        var widthDesc = Object.getOwnPropertyDescriptor(Bitmap.prototype, 'width');
        var heightDesc = Object.getOwnPropertyDescriptor(Bitmap.prototype, 'height');
        if (widthDesc && widthDesc.get && widthDesc.configurable) {
            Object.defineProperty(Bitmap.prototype, 'width', {
                get: function () {
                    ensureArkDim(this);
                    return this._arkOrigW || widthDesc.get.call(this);
                },
                configurable: true
            });
        }
        if (heightDesc && heightDesc.get && heightDesc.configurable) {
            Object.defineProperty(Bitmap.prototype, 'height', {
                get: function () {
                    ensureArkDim(this);
                    return this._arkOrigH || heightDesc.get.call(this);
                },
                configurable: true
            });
        }

        var baseDesc = Object.getOwnPropertyDescriptor(Bitmap.prototype, 'baseTexture');
        if (baseDesc && baseDesc.get && baseDesc.configurable) {
            Object.defineProperty(Bitmap.prototype, 'baseTexture', {
                get: function () {
                    ensureArkDim(this);
                    var bt = baseDesc.get.call(this);
                    if (bt && this._arkOrigW && this._arkOrigH) {
                        fixBaseTexture(bt, this._arkOrigW, this._arkOrigH);
                    }
                    return bt;
                },
                configurable: true
            });
        }

        if (Bitmap.prototype._createBaseTexture) {
            var origCreateBaseTexture = Bitmap.prototype._createBaseTexture;
            Bitmap.prototype._createBaseTexture = function (source) {
                origCreateBaseTexture.call(this, source);
                ensureArkDim(this);
                if (this._baseTexture && this._arkOrigW && this._arkOrigH) {
                    fixBaseTexture(this._baseTexture, this._arkOrigW, this._arkOrigH);
                }
            };
        }

        if (Bitmap.prototype._onLoad) {
            var origOnLoad = Bitmap.prototype._onLoad;
            Bitmap.prototype._onLoad = function () {
                ensureArkDim(this);
                var ret = origOnLoad.apply(this, arguments);
                if (this._baseTexture && this._arkOrigW && this._arkOrigH) {
                    fixBaseTexture(this._baseTexture, this._arkOrigW, this._arkOrigH);
                }
                return ret;
            };
        }

        if (Bitmap.prototype.blt) {
            var origBlt = Bitmap.prototype.blt;
            Bitmap.prototype.blt = function (source, sx, sy, sw, sh, dx, dy, dw, dh) {
                ensureArkDim(source);
                var s = arkScale(source);
                if (s < 1) {
                    if (typeof dw !== 'number' || isNaN(dw)) dw = sw;
                    if (typeof dh !== 'number' || isNaN(dh)) dh = sh;
                    sx = Math.round(sx * s);
                    sy = Math.round(sy * s);
                    sw = Math.round(sw * s);
                    sh = Math.round(sh * s);
                }
                return origBlt.call(this, source, sx, sy, sw, sh, dx, dy, dw, dh);
            };
        }

        if (Bitmap.prototype.getPixel) {
            var origGetPixel = Bitmap.prototype.getPixel;
            Bitmap.prototype.getPixel = function (x, y) {
                var s = arkScale(this);
                if (s < 1) {
                    x = Math.round(x * s);
                    y = Math.round(y * s);
                }
                return origGetPixel.call(this, x, y);
            };
        }

        if (Bitmap.prototype.getAlphaPixel) {
            var origGetAlphaPixel = Bitmap.prototype.getAlphaPixel;
            Bitmap.prototype.getAlphaPixel = function (x, y) {
                var s = arkScale(this);
                if (s < 1) {
                    x = Math.round(x * s);
                    y = Math.round(y * s);
                }
                return origGetAlphaPixel.call(this, x, y);
            };
        }

        Bitmap.__arkMZDownsamplePatched = true;
        log('Bitmap patched');
    }

    function patchSprite() {
        if (typeof Sprite === 'undefined' || Sprite.__arkMZDownsamplePatched) return;

        if (Sprite.prototype._refresh) {
            var origRefresh = Sprite.prototype._refresh;
            Sprite.prototype._refresh = function () {
                var bitmap = this._bitmap;
                if (bitmap) {
                    ensureArkDim(bitmap);
                    if (bitmap._baseTexture && bitmap._arkOrigW && bitmap._arkOrigH) {
                        fixBaseTexture(bitmap._baseTexture, bitmap._arkOrigW, bitmap._arkOrigH);
                    }
                }
                return origRefresh.apply(this, arguments);
            };
        }

        Sprite.__arkMZDownsamplePatched = true;
        log('Sprite patched');
    }

    function patchTextureFrameSafety() {
        if (typeof PIXI === 'undefined' || !PIXI.Texture || !PIXI.Texture.prototype) return;
        if (PIXI.Texture.__arkMZFrameSafetyPatched) return;
        var desc = Object.getOwnPropertyDescriptor(PIXI.Texture.prototype, 'frame');
        if (!desc || !desc.set || !desc.configurable) return;
        var origSet = desc.set;
        var logCount = 0;
        Object.defineProperty(PIXI.Texture.prototype, 'frame', {
            get: desc.get,
            set: function (rect) {
                try {
                    return origSet.call(this, rect);
                } catch (e) {
                    var bt = this.baseTexture;
                    if (bt && rect && bt._arkOrigW && bt._arkOrigH) {
                        fixBaseTexture(bt, bt._arkOrigW, bt._arkOrigH);
                        if (logCount < 20) {
                            logCount++;
                            log('[FrameSafety] retry #' + logCount,
                                'frame=' + rect.x + ',' + rect.y + '+' + rect.width + 'x' + rect.height,
                                'bt=' + bt.width + 'x' + bt.height,
                                'err=' + (e && e.message));
                        }
                        return origSet.call(this, rect);
                    }
                    throw e;
                }
            },
            configurable: true
        });
        PIXI.Texture.__arkMZFrameSafetyPatched = true;
        log('Texture frame safety patched');
    }

    function autoLookNpcImageSuffix() {
        try {
            var raw = localStorage.getItem('GameLanguage');
            if (!raw) return '';
            var data = JSON.parse(raw);
            return data && data.dataName ? data.dataName : '';
        } catch (e) {
            return '';
        }
    }

    function ensureFlyCatAutoLookNpcHud(scene) {
        if (!scene || typeof Scene_Map === 'undefined' || !(scene instanceof Scene_Map)) return;
        if (typeof scene.openLookNpc !== 'function') return;
        if (typeof scene.createLookNpcWindow !== 'function') return;
        if (typeof scene.createTimeWindow !== 'function') return;
        if (typeof ImageManager === 'undefined' || typeof Sprite === 'undefined') return;

        var created = false;
        var img = autoLookNpcImageSuffix();
        if (!scene._timeSprite && typeof scene.addChild === 'function') {
            scene._timeSprite = new Sprite();
            scene._timeSprite.bitmap = ImageManager.loadPicture('time' + img);
            scene.addChild(scene._timeSprite);
            created = true;
        }
        if (!scene._timeSprite_1 && typeof Sprite_AutoLookButton !== 'undefined' && typeof scene.addChild === 'function') {
            scene._timeSprite_1 = new Sprite_AutoLookButton();
            if (scene._timeSprite_1.setClickHandler) {
                scene._timeSprite_1.setClickHandler(scene.openLookNpc.bind(scene));
            }
            scene._timeSprite_1.bitmap = ImageManager.loadPicture('xunlu' + img);
            scene._timeSprite_1.x = 10;
            scene._timeSprite_1.y = 106;
            scene.addChild(scene._timeSprite_1);
            created = true;
        }
        if (!scene._timeSprite_2 && typeof scene.addChild === 'function') {
            scene._timeSprite_2 = new Sprite();
            scene._timeSprite_2.bitmap = ImageManager.loadPicture('autolook' + img);
            scene._timeSprite_2.x = 350;
            scene._timeSprite_2.y = 0;
            scene._timeSprite_2.visible = false;
            scene.addChild(scene._timeSprite_2);
            created = true;
        }
        if (!scene._lookNpcWindow) {
            try {
                scene.createLookNpcWindow();
                created = true;
            } catch (e1) {
                log('[Compat] AutoLookNpc createLookNpcWindow failed', e1 && e1.message);
            }
        }
        if (!scene._timeWindow) {
            try {
                scene.createTimeWindow();
                created = true;
            } catch (e2) {
                log('[Compat] AutoLookNpc createTimeWindow failed', e2 && e2.message);
            }
        }
        if (created && !scene._arkMZAutoLookNpcHudLogged) {
            scene._arkMZAutoLookNpcHudLogged = true;
            log('[Compat] AutoLookNpc HUD repaired before Scene_Map.update');
        }
    }

    function patchFlyCatAutoLookNpcCompat() {
        if (typeof Scene_Map === 'undefined' || !Scene_Map.prototype || Scene_Map.__arkMZAutoLookNpcCompatPatched) return;
        if (typeof Scene_Map.prototype.update !== 'function') return;
        var origUpdate = Scene_Map.prototype.update;
        Scene_Map.prototype.update = function () {
            ensureFlyCatAutoLookNpcHud(this);
            return origUpdate.apply(this, arguments);
        };
        Scene_Map.__arkMZAutoLookNpcCompatPatched = true;
        log('AutoLookNpc compat patched');
    }

    function patch() {
        patchTextureFrameSafety();
        patchBitmap();
        patchSprite();
        patchFlyCatAutoLookNpcCompat();
    }

    var tries = 0;
    var timer = setInterval(function () {
        tries++;
        try { patch(); } catch (e) { log('patch failed', e && e.message); }
        if ((typeof Bitmap !== 'undefined' && Bitmap.__arkMZDownsamplePatched) || tries > 200) {
            clearInterval(timer);
        }
    }, 50);
})();


/* === rpg_text_translation.js === */
/*:
 * @target MZ
 * @plugindesc [v1.0.0] Load JSON dictionary and translate message text for MV/MZ.
 * @author ArkRPG
 *
 * @param Enabled
 * @text Enabled
 * @type boolean
 * @default true
 *
 * @param DictionaryPath
 * @text Dictionary Path
 * @type string
 * @default ./translations/translation.json
 *
 * @param NormalizeNewline
 * @text Normalize Newline
 * @type boolean
 * @default true
 *
 * @param Debug
 * @text Debug Log
 * @type boolean
 * @default false
 *
 * @param TranslateDatabaseNames
 * @text Translate Database Names
 * @desc Translate name fields in database (items, skills, etc). Disable if names are used as resource file identifiers.
 * @type boolean
 * @default true
 *
 * @param TranslateSystemTerms
 * @text Translate System Terms
 * @desc Translate $dataSystem.terms.commands/elements/etc. Disable if plugins (e.g. MOG_BattleCommands) use term names as image file identifiers.
 * @type boolean
 * @default false
 *
 * @help
 * JSON format:
 * {
 *   "原文": "译文"
 * }
 *
 * Notes:
 * - This plugin avoids asynchronous translation in Window_Message flow.
 * - It waits dictionary loading during boot, then translates synchronously.
 */

(function() {
    'use strict';

    // --- 追踪名字框最终显示内容 ---
    function patchNameBoxLog() {
        if (typeof Window_NameBox !== 'undefined' && Window_NameBox.prototype && !Window_NameBox.prototype._rpgTextTranslationPatched) {
            var _Window_NameBox_refresh = Window_NameBox.prototype.refresh;
            Window_NameBox.prototype.refresh = function() {
                var before = this._name;
                if (!isAlreadyTranslated(before) && typeof translateText === 'function') {
                    this._name = translateText(before);
                }
                if (config && config.debug && typeof log === 'function') {
                    log('[NameBox.refresh] name:', JSON.stringify(before), '=>', JSON.stringify(this._name));
                }
                _Window_NameBox_refresh.call(this);
            };
            Window_NameBox.prototype._rpgTextTranslationPatched = true;
        }
    }

    var pluginName = 'RPGTextTranslation';
    var parameters = (typeof PluginManager !== 'undefined' && PluginManager.parameters)
        ? PluginManager.parameters(pluginName)
        : {};

    function readBool(value, defaultValue) {
        if (value === undefined || value === null || value === '') return defaultValue;
        return String(value).toLowerCase() === 'true';
    }

    var config = {
        enabled: readBool(parameters.Enabled, true),
        dictionaryPath: String(parameters.DictionaryPath || './translations/translation.json'),
        normalizeNewline: readBool(parameters.NormalizeNewline, true),
        debug: readBool(parameters.Debug, false),
        translateDatabaseNames: readBool(parameters.TranslateDatabaseNames, true),
        translateSystemTerms: readBool(parameters.TranslateSystemTerms, false)
    };

    var state = {
        loaded: false,
        failed: false,
        dict: Object.create(null),
        sourceIndex: null,
        translatedValues: Object.create(null),
        translatedCjkGlyphs: Object.create(null),
        hitCount: 0,
        missCount: 0
    };

    function log() {
        if (!config.debug) return;
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[RPGTextTranslation]');
        console.log.apply(console, args);
        // 同时打印到 native 日志，方便在 Xcode 控制台查看
        window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.logging &&
            window.webkit.messageHandlers.logging.postMessage({
            level: 'debug',
            message: args.join(' ')
        });
    }

    function normalizeText(text) {
        if (!config.normalizeNewline) return text;
        return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    function hasOwn(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }

    function isKnownTranslation(text) {
        if (!text || typeof text !== 'string') return false;
        if (hasOwn(state.translatedValues, text)) return true;
        if (config.normalizeNewline) {
            var normalized = normalizeText(text);
            return normalized !== text && hasOwn(state.translatedValues, normalized);
        }
        return false;
    }

    // 查字典：先精确匹配，再尝试 normalizeNewline，未命中返回 null
    function lookupDict(key) {
        if (hasOwn(state.dict, key)) {
            state.hitCount += 1;
            return state.dict[key];
        }
        if (config.normalizeNewline) {
            var norm = normalizeText(key);
            if (norm !== key && hasOwn(state.dict, norm)) {
                state.hitCount += 1;
                return state.dict[norm];
            }
        }
        return null;
    }

    // 外部消息插件常把正文包在括号或引号中，而翻译字典只保存内部正文。
    // 精确匹配失败后先尝试剥离成对的最外层符号，命中时再原样补回。
    // 该检查必须早于按标点拆分，否则含句中逗号的完整字典键会被拆散。
    var OUTER_SYMBOL_PAIRS = {
        '(': ')', '（': '）',
        '[': ']', '［': '］',
        '{': '}', '｛': '｝',
        '「': '」', '『': '』',
        '【': '】', '《': '》', '〈': '〉',
        '“': '”', '‘': '’',
        '"': '"', "'": "'"
    };

    function lookupDictPreservingOuterSymbols(key) {
        var direct = lookupDict(key);
        if (direct !== null || !key || key.length < 2) return direct;

        var prefix = '';
        var suffix = '';
        var inner = key;
        while (inner.length >= 2) {
            var opening = inner.charAt(0);
            var closing = OUTER_SYMBOL_PAIRS[opening];
            if (!closing || inner.charAt(inner.length - 1) !== closing) break;
            prefix += opening;
            suffix = closing + suffix;
            inner = inner.slice(1, -1);

            var translated = lookupDict(inner);
            if (translated !== null) {
                return prefix + translated + suffix;
            }
        }
        return null;
    }

    // 精确匹配失败时，用字典索引从左到右做最长键匹配。字典键内部的
    // 标点和全角空格属于正文，不能预先拆开；未命中的标点/空白则原样保留。
    // 只有整段未命中内容全是分隔符时才接受结果，避免出现半句中文半句日文。
    // 控制符由 translateText 的 specialPattern 先行拆出，不会进入这里。
    var TRANSPARENT_SEPARATOR_PATTERN = /^[ \t\r\n\u3000!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~、。，．！？：；…‥—―〜～・（）［］【】「」『』〈〉《》〔〕〖〗〘〙〚〛〝〞〟〰]$/;

    function addSourceIndexKey(index, key) {
        if (!key) return;
        var buckets = key.length === 1 ? index.single : index.prefix;
        var prefix = key.length === 1 ? key : key.slice(0, 2);
        if (!hasOwn(buckets, prefix)) {
            buckets[prefix] = [];
        }
        buckets[prefix].push(key);
    }

    function buildSourceIndex(dict) {
        // 大型 MTool 字典可能接近十万项。逐字符 JS Trie 会产生数百万个
        // 对象，因此这里只保存原 key 引用，并按前两个 UTF-16 单元分桶。
        var index = {
            single: Object.create(null),
            prefix: Object.create(null),
            aliases: Object.create(null)
        };
        var keys = Object.keys(dict);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (!key) continue;

            var hasSemanticText = false;
            for (var semanticIndex = 0;
                 semanticIndex < key.length;
                 semanticIndex++) {
                if (!TRANSPARENT_SEPARATOR_PATTERN.test(
                    key.charAt(semanticIndex)
                )) {
                    hasSemanticText = true;
                    break;
                }
            }
            // 纯标点键不能抢占正文前后的装饰符。
            if (!hasSemanticText) continue;

            addSourceIndexKey(index, key);
        }

        // MTool 从 plugins.js 的嵌套 JSON 提取文本时，控制符前的片段常带有
        // 多层转义产生的尾反斜杠；插件运行时这些反斜杠属于后续控制符。
        // 仅当源文和译文都以反斜杠结尾时建立无反斜杠别名，原键仍优先。
        for (var aliasIndex = 0;
             aliasIndex < keys.length;
             aliasIndex++) {
            var aliasKey = keys[aliasIndex];
            var aliasValue = dict[aliasKey];
            if (!/\\+$/.test(aliasKey) ||
                typeof aliasValue !== 'string' ||
                !/\\+$/.test(aliasValue)) {
                continue;
            }
            var strippedKey = aliasKey.replace(/\\+$/, '');
            if (!strippedKey ||
                hasOwn(dict, strippedKey) ||
                hasOwn(index.aliases, strippedKey)) {
                continue;
            }
            index.aliases[strippedKey] =
                aliasValue.replace(/\\+$/, '');
            addSourceIndexKey(index, strippedKey);
        }
        return index;
    }

    function dictionaryMatchesAt(text, start) {
        var matches = [];
        if (!state.sourceIndex) return matches;

        function appendMatches(keys) {
            if (!keys) return;
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (text.substr(start, key.length) !== key) continue;
                matches.push({
                    end: start + key.length,
                    value: hasOwn(state.dict, key)
                        ? state.dict[key]
                        : state.sourceIndex.aliases[key]
                });
            }
        }

        var first = text.charAt(start);
        appendMatches(state.sourceIndex.single[first]);
        if (start + 1 < text.length) {
            appendMatches(
                state.sourceIndex.prefix[text.slice(start, start + 2)]
            );
        }
        return matches;
    }

    function betterSegmentPlan(current, candidate) {
        if (!candidate) return current;
        if (!current ||
            candidate.covered > current.covered ||
            (candidate.covered === current.covered &&
             candidate.hits < current.hits)) {
            return candidate;
        }
        return current;
    }

    function repeatedKanaPrefixEnd(text, index) {
        var rest = text.slice(index);
        var match = rest.match(/^([ぁ-んァ-ン])(?:[.．…‥]{2,})/);
        if (!match) return -1;

        var end = index + match[0].length;
        return text.charAt(end) === match[1] ? end : -1;
    }

    function displayAsciiTagEnd(text, index) {
        // 自定义菜单常把分类标签直接拼在正文前，例如
        // “[DLC]ばけーしょん！から”。翻译字典通常只收录后面的正文。
        // 这里只接受短小、成对方括号包裹的 ASCII 标识；普通英文仍然必须
        // 命中字典，避免放宽成任意中英混排。
        var rest = text.slice(index);
        var match = rest.match(
            /^(?:\[[A-Za-z0-9][A-Za-z0-9 _+.\-]{0,30}\]|［[A-Za-z0-9][A-Za-z0-9 _+.\-]{0,30}］)/
        );
        return match ? index + match[0].length : -1;
    }

    function lookupBySymbolSegments(text) {
        if (!text || !state.sourceIndex) return null;

        // 从后向前求解，确保不是简单贪心：若较短键能与后续键共同覆盖
        // 完整文本，它会优于一个导致后续正文未命中的较长键。
        var plans = new Array(text.length + 1);
        plans[text.length] = {
            result: '',
            covered: 0,
            hits: 0
        };

        for (var index = text.length - 1; index >= 0; index--) {
            var best = null;
            var character = text.charAt(index);
            if (TRANSPARENT_SEPARATOR_PATTERN.test(character) &&
                plans[index + 1]) {
                best = {
                    result: character + plans[index + 1].result,
                    covered: plans[index + 1].covered,
                    hits: plans[index + 1].hits
                };
            }

            // 保留插件界面附加的短 ASCII 标签，但只有标签后的正文已经能被
            // 原有规则完整覆盖时才建立计划。精确字典键仍在 translateText
            // 更早的位置优先命中。
            var displayTagEnd = displayAsciiTagEnd(text, index);
            if (displayTagEnd >= 0 && plans[displayTagEnd]) {
                best = betterSegmentPlan(best, {
                    result: text.slice(index, displayTagEnd) +
                        plans[displayTagEnd].result,
                    covered: plans[displayTagEnd].covered,
                    hits: plans[displayTagEnd].hits
                });
            }

            var matches = dictionaryMatchesAt(text, index);
            for (var matchIndex = 0;
                 matchIndex < matches.length;
                 matchIndex++) {
                var matched = matches[matchIndex];
                var tail = plans[matched.end];
                if (!tail) continue;
                best = betterSegmentPlan(best, {
                    result: matched.value + tail.result,
                    covered: matched.end - index + tail.covered,
                    hits: tail.hits + 1
                });
            }

            // 口吃/迟疑常写成 “え...えぇ”“あ……あなた”，而 MTool
            // 只为后半完整句生成字典键。仅在省略号后重复同一假名且后半能
            // 完整覆盖时丢弃前缀；这是精确及普通索引匹配失败后的兜底。
            var repeatedKanaEnd = repeatedKanaPrefixEnd(text, index);
            if (repeatedKanaEnd >= 0 && plans[repeatedKanaEnd]) {
                best = betterSegmentPlan(best, {
                    result: plans[repeatedKanaEnd].result,
                    covered: plans[repeatedKanaEnd].covered,
                    hits: plans[repeatedKanaEnd].hits
                });
            }
            plans[index] = best;
        }

        var plan = plans[0];
        if (!plan || plan.hits === 0) return null;
        state.hitCount += plan.hits;
        return plan.result;
    }

    // 多行整段未命中时逐行独立翻译，并原样保留换行。
    //
    // 不能要求所有行都命中：人物事典、任务说明等插件文本通常同时包含
    // 可翻译正文、空行、变量标签和字典中不存在的动态标题。任何一行未命中
    // 都不应导致其他已命中的行回退为原文。
    //
    // 符号拆分必须放在单行内部进行，避免把 "。\n\n" 合并为一个符号块，
    // 从而漏掉字典中以句号结尾的完整键。
    function lookupByLineSegments(text) {
        if (!text || !/[\r\n]/.test(text)) return null;

        var parts = text.split(/(\r\n|\r|\n)/);
        var result = '';
        var translatedAny = false;

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];

            if (part === '\r\n' || part === '\r' || part === '\n') {
                result += part;
                continue;
            }

            if (!part || isKnownTranslation(part)) {
                result += part;
                continue;
            }

            var translated = lookupDictPreservingOuterSymbols(part);
            if (translated === null) {
                translated = lookupBySymbolSegments(part);
            }

            if (translated !== null) {
                result += translated;
                translatedAny = true;
            } else {
                result += part;
            }
        }

        return translatedAny ? result : null;
    }

    // 检测是否为资源路径或文件名（不应翻译）
    function isResourcePath(text) {
        if (!text || typeof text !== 'string') return false;
        
        // 检测文件扩展名
        var resourceExtensions = [
            '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp',  // 图片
            '.rpgmvp', '.rpgmvo', '.rpgmvm', '.rpgmvw',        // RPG Maker MV 加密资源
            '.ogg', '.m4a', '.mp3', '.wav',                    // 音频
            '.mp4', '.webm',                                    // 视频
            '.json', '.txt'                                     // 数据文件
        ];
        
        var lowerText = text.toLowerCase();
        for (var i = 0; i < resourceExtensions.length; i++) {
            if (lowerText.indexOf(resourceExtensions[i]) !== -1) {
                return true;
            }
        }
        
        // 检测路径特征（包含斜杠或反斜杠）
        if (text.indexOf('/') !== -1 || text.indexOf('\\') !== -1) {
            return true;
        }
        
        // 检测常见资源路径前缀
        var pathPrefixes = ['img/', 'audio/', 'movies/', 'data/', 'fonts/', 'icon/'];
        for (var j = 0; j < pathPrefixes.length; j++) {
            if (lowerText.indexOf(pathPrefixes[j]) !== -1) {
                return true;
            }
        }
        
        return false;
    }

    function translateText(text) {
        if (!config.enabled) return text;
        if (!state.loaded || !text || typeof text !== 'string') return text;
        if (isKnownTranslation(text)) return text;

        // 匹配所有特殊符号（如 \SE[5]、\C[2]、\n[1]、\{、\} 等）、%1/%2 占位符，以及 <WordWrap>/<br> 等 HTML-like 标签
        var specialPattern = /\\+(?:[A-Za-z]+(?:\[[^\]]*\])?|[^A-Za-z\s])|%\d+|<[^>]*>/g;
        var segments = [];
        var lastIndex = 0;
        var match;
        while ((match = specialPattern.exec(text)) !== null) {
            if (match.index > lastIndex) {
                segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
            }
            segments.push({ type: 'special', value: match[0] });
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
            segments.push({ type: 'text', value: text.slice(lastIndex) });
        }

        // 针对每个纯文本段做翻译，特殊符号原样保留
        var result = '';
        for (var i = 0; i < segments.length; i++) {
            var seg = segments[i];
            if (seg.type === 'special') {
                result += seg.value;
            } else if (seg.type === 'text' && seg.value) {
                var mainText = seg.value;
                // 跳过资源路径和文件名
                if (isResourcePath(mainText)) {
                    result += mainText;
                    continue;
                }
                // 剥离前后空格，匹配后补回
                var leadingSpaces = mainText.match(/^\s*/)[0];
                var trailingSpaces = mainText.match(/\s*$/)[0];
                var trimmedText = mainText.slice(leadingSpaces.length, mainText.length - trailingSpaces.length);

                if (isKnownTranslation(trimmedText)) {
                    result += mainText;
                    continue;
                }

                var translated = lookupDictPreservingOuterSymbols(trimmedText);
                if (config.debug && translated !== null) {
                    log('[translateText] HIT:', trimmedText.slice(0, 80), '=>', JSON.stringify(translated));
                }
                // 整段未命中且含换行：逐行独立翻译，未命中的行原样保留。
                // 每行内部再按符号回退，避免句号和换行被合并后破坏字典键。
                if (translated === null && /[\r\n]/.test(trimmedText)) {
                    translated = lookupByLineSegments(trimmedText);
                    if (translated !== null && config.debug) {
                        log('[translateText] HIT (split-by-line):', trimmedText.slice(0, 80), '=>', JSON.stringify(translated));
                    }
                }
                // 整段和完整多行均未命中时，按普通符号拆分文字部分查找。
                // 所有符号均原样保留，只有实际命中的文字片段会被替换。
                if (translated === null) {
                    translated = lookupBySymbolSegments(trimmedText);
                    if (translated !== null && config.debug) {
                        log('[translateText] HIT (split-by-symbol):', trimmedText.slice(0, 80), '=>', JSON.stringify(translated));
                    }
                }
                if (translated !== null) {
                    result += leadingSpaces + translated + trailingSpaces;
                } else {
                    state.missCount += 1;
                    if (config.debug) {
                        log('Miss #' + state.missCount + ':', mainText);
                    }
                    result += mainText;
                }
            }
        }
        return result;
    }

    function translateArray(arr) {
        if (!Array.isArray(arr)) return arr;
        for (var i = 0; i < arr.length; i++) {
            if (typeof arr[i] === 'string') {
                arr[i] = translateText(arr[i]);
            }
        }
        return arr;
    }

    function parseDictionaryObject(raw) {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
            return Object.create(null);
        }

        var result = Object.create(null);
        var keys = Object.keys(raw);
        for (var i = 0; i < keys.length; i++) {
            var key = String(keys[i]);
            var value = raw[keys[i]];
            if (typeof value !== 'string') continue;

            var source = normalizeText(key);
            result[source] = value;
        }
        return result;
    }

    function collectTranslatedValues(dict) {
        var values = Object.create(null);
        var keys = Object.keys(dict);
        for (var i = 0; i < keys.length; i++) {
            var value = dict[keys[i]];
            if (typeof value !== 'string' || value === '') continue;
            // 只有译文本身也是另一个原文键时才可能发生 A -> B -> C。
            // 仅记录这些冲突值，避免为大型 MTool 字典再复制一整份值索引。
            if (hasOwn(dict, value)) values[value] = true;
            if (!config.normalizeNewline) continue;
            var normalized = normalizeText(value);
            if (hasOwn(dict, normalized)) values[normalized] = true;
        }
        return values;
    }

    // 自定义消息插件可能绕过 Window_Message，并把译文逐字交给 Canvas。
    // 记录字典译文中实际出现的 CJK 字符，使逐字绘制也能识别为译文。
    // 字符集合的规模远小于复制整份大型翻译字典。
    function collectTranslatedCjkGlyphs(dict) {
        var glyphs = Object.create(null);
        var keys = Object.keys(dict);
        for (var i = 0; i < keys.length; i++) {
            var value = dict[keys[i]];
            if (typeof value !== 'string') continue;
            for (var j = 0; j < value.length; j++) {
                var glyph = value.charAt(j);
                var code = value.charCodeAt(j);
                if (code >= 0xD800 && code <= 0xDBFF && j + 1 < value.length) {
                    var low = value.charCodeAt(j + 1);
                    if (low >= 0xDC00 && low <= 0xDFFF) {
                        glyph += value.charAt(++j);
                    }
                }
                if (hasCJK(glyph)) glyphs[glyph] = true;
            }
        }
        return glyphs;
    }

    function textUsesTranslatedCjkGlyph(text) {
        if (!state.loaded || !text || typeof text !== 'string') return false;
        for (var i = 0; i < text.length; i++) {
            var glyph = text.charAt(i);
            var code = text.charCodeAt(i);
            if (code >= 0xD800 && code <= 0xDBFF && i + 1 < text.length) {
                var low = text.charCodeAt(i + 1);
                if (low >= 0xDC00 && low <= 0xDFFF) {
                    glyph += text.charAt(++i);
                }
            }
            if (hasOwn(state.translatedCjkGlyphs, glyph)) return true;
        }
        return false;
    }

    function loadDictionary() {
        if (!config.enabled) {
            state.loaded = true;
            log('Dictionary load skipped because plugin is disabled');
            return;
        }

        log('Loading dictionary from path:', config.dictionaryPath);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', config.dictionaryPath);
        xhr.overrideMimeType('application/json');
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 400) {
                try {
                    var json = JSON.parse(xhr.responseText || '{}');
                    state.dict = parseDictionaryObject(json);
                    state.sourceIndex = buildSourceIndex(state.dict);
                    state.translatedValues = collectTranslatedValues(state.dict);
                    state.translatedCjkGlyphs =
                        collectTranslatedCjkGlyphs(state.dict);
                    state.loaded = true;
                    log('Dictionary loaded:', config.dictionaryPath, 'entries=', Object.keys(state.dict).length, 'responseBytes=', (xhr.responseText || '').length);
                } catch (e) {
                    state.failed = true;
                    state.loaded = true;
                    console.error('[RPGTextTranslation] Failed to parse dictionary:', e);
                }
            } else {
                state.failed = true;
                state.loaded = true;
                console.error('[RPGTextTranslation] Failed to load dictionary:', config.dictionaryPath, 'status=', xhr.status);
            }
        };
        xhr.onerror = function() {
            state.failed = true;
            state.loaded = true;
            console.error('[RPGTextTranslation] Network error while loading dictionary:', config.dictionaryPath);
        };
        xhr.send();
    }

    function patchBootReady() {
        if (typeof Scene_Boot === 'undefined') return;

        var _Scene_Boot_isReady = Scene_Boot.prototype.isReady;
        Scene_Boot.prototype.isReady = function() {
            if (!_Scene_Boot_isReady.call(this)) return false;
            return state.loaded;
        };
    }

    // 为 iOS WKWebView 注入可靠的译文字体。
    // 所有被识别为字典译文的 CJK 绘制统一使用系统字体，不再逐字探测游戏字体。
    var IOS_CJK_FONTS = 'PingFang SC, Hiragino Sans GB, STHeiti';

    // CJK Unicode ranges (CJK Unified, Extension A/B, Compatibility, Radicals, etc.)
    var CJK_REGEX = /[\u2E80-\u2FFF\u3000-\u303F\u3040-\u31FF\u3200-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/;

    function hasCJK(text) {
        return typeof text === 'string' && CJK_REGEX.test(text);
    }

    // 提取 CSS font 字符串中 size 之前的部分（含 weight/style），例如 "bold 28px/32px ..." => "bold 28px"
    function extractFontPrefix(fontStr) {
        var m = fontStr && fontStr.match(/^(.*?\b)(\d+(?:\.\d+)?(?:px|pt|em|rem)(?:\/\S+)?)/);
        return m ? m[1] + m[2] : '28px';
    }

    function systemFontFor(fontStr) {
        return extractFontPrefix(fontStr) + ' ' + IOS_CJK_FONTS;
    }

    function patchCanvasCJK() {
        var _fillText = CanvasRenderingContext2D.prototype.fillText;
        var _strokeText = CanvasRenderingContext2D.prototype.strokeText;
        var _measureText = CanvasRenderingContext2D.prototype.measureText;

        CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
            if (textUsesTranslatedCjkGlyph(String(text))) {
                var originalFont = this.font;
                this.font = systemFontFor(originalFont);
                try {
                    return maxWidth !== undefined
                        ? _fillText.call(this, text, x, y, maxWidth)
                        : _fillText.call(this, text, x, y);
                } finally {
                    this.font = originalFont;
                }
            }
            return maxWidth !== undefined
                ? _fillText.call(this, text, x, y, maxWidth)
                : _fillText.call(this, text, x, y);
        };

        CanvasRenderingContext2D.prototype.strokeText = function(text, x, y, maxWidth) {
            if (textUsesTranslatedCjkGlyph(String(text))) {
                var originalFont = this.font;
                this.font = systemFontFor(originalFont);
                try {
                    return maxWidth !== undefined
                        ? _strokeText.call(this, text, x, y, maxWidth)
                        : _strokeText.call(this, text, x, y);
                } finally {
                    this.font = originalFont;
                }
            }
            return maxWidth !== undefined
                ? _strokeText.call(this, text, x, y, maxWidth)
                : _strokeText.call(this, text, x, y);
        };

        CanvasRenderingContext2D.prototype.measureText = function(text) {
            if (textUsesTranslatedCjkGlyph(String(text))) {
                var originalFont = this.font;
                this.font = systemFontFor(originalFont);
                try {
                    return _measureText.call(this, text);
                } finally {
                    this.font = originalFont;
                }
            }
            return _measureText.call(this, text);
        };

        log('[patchCanvasCJK] Canvas translated CJK font policy installed');
    }

    // 已被 command101 多行翻译写回的文本，用 Set 标记，避免 Game_Message.add 再次翻译
    var _translatedTexts = typeof Set !== 'undefined' ? new Set() : null;
    var SKIP_TRANSLATED_MESSAGE_LINE = '\u001dRPGTEXTTRANSLATION_SKIP_LINE\u001d';

    function markTranslated(text) {
        if (_translatedTexts) _translatedTexts.add(text);
    }

    function isAlreadyTranslated(text) {
        return _translatedTexts ? _translatedTexts.has(text) : false;
    }

    function unmarkTranslated(text) {
        if (_translatedTexts) _translatedTexts.delete(text);
    }

    function translatedSlot(prefix, translatedLines, index, suffix) {
        if (index < translatedLines.length) {
            return prefix + translatedLines[index] + suffix;
        }
        // 字典译文比原始事件行少时，这些是原文排版产生的占位行，不应显示为空行。
        return prefix || suffix
            ? prefix + suffix
            : SKIP_TRANSLATED_MESSAGE_LINE;
    }

    // 拦截 command101（显示文本），预读所有连续 401 行，尝试多行合并匹配
    function patchInterpreterCommand101() {
        if (typeof Game_Interpreter === 'undefined') return;

        // 将行拆分为三部分：行首特殊 token 前缀、用于查字典的主文本、行内第一个 special 之后的后缀
        // 例如 "\N[1]いや…\N[1]は命の恩人" => { prefix:"\N[1]", mainText:"いや…", suffix:"\N[1]は命の恩人" }
        var leadingSpecialPattern = /^((?:\\+(?:[A-Za-z]+(?:\[[^\]]*\])?|[^A-Za-z\s])|<[^>]*>)+)/;
        var internalSpecialPattern = /\\+(?:[A-Za-z]+(?:\[[^\]]*\])?|[^A-Za-z\s])|%\d+|<[^>]*>/g;
        function splitLineForKey(line) {
            // 先剥离行首连续 special tokens
            var prefixMatch = line.match(leadingSpecialPattern);
            var prefix = prefixMatch ? prefixMatch[1] : '';
            var rest = line.slice(prefix.length);
            // 在 rest 中找第一个 special token，把之前的作为 mainText，之后（含该 token）作为 suffix
            internalSpecialPattern.lastIndex = 0;
            var m = internalSpecialPattern.exec(rest);
            if (m) {
                return { prefix: prefix, mainText: rest.slice(0, m.index), suffix: rest.slice(m.index) };
            }
            return { prefix: prefix, mainText: rest, suffix: '' };
        }

        // 名前インライン pattern 的备用拆分：
        // 例如 "……そういえばさ、\N[1]ってなんだか品があるよな～"
        //   => { namePrefix: "……そういえばさ、\N[1]", keyText: "ってなんだか品があるよな～" }
        // 仅当行中存在非行首的 \N[x] 或 \V[x] 时有效，否则返回 null
        var midNameTokenPattern = /\\+[NV]\[\d+\]/g;
        function splitLineForKeyAlt(line) {
            var prefixMatch = line.match(leadingSpecialPattern);
            var leadPrefix = prefixMatch ? prefixMatch[1] : '';
            var rest = line.slice(leadPrefix.length);
            // 找最后一个位于 rest 中非行首（index > 0）的 \N[x]/\V[x]
            midNameTokenPattern.lastIndex = 0;
            var lastM = null, m;
            while ((m = midNameTokenPattern.exec(rest)) !== null) {
                if (m.index > 0) lastM = m;
            }
            if (!lastM) return null;
            var afterToken = lastM.index + lastM[0].length;
            return {
                namePrefix: leadPrefix + rest.slice(0, afterToken),
                keyText: rest.slice(afterToken)
            };
        }

        var _command101 = Game_Interpreter.prototype.command101;
        Game_Interpreter.prototype.command101 = function() {
            var list = this._list;
            if (list) {
                var idx = this._index + 1;
                var lines = [];
                var indices = [];
                while (idx < list.length && list[idx].code === 401) {
                    lines.push(list[idx].parameters[0]);
                    indices.push(idx);
                    idx++;
                }
                if (lines.length > 1) {
                    var splitLines = lines.map(splitLineForKey);
                    var done = false;
                    var subHit = {};

                    // --- 主路径：全块 mainText 合并 key ---
                    var combined = splitLines.map(function(s) { return s.mainText; }).join('\n');
                    if (config.debug) log('[command101] trying multiline (' + lines.length + ' lines):', JSON.stringify(combined.slice(0, 120)));
                    var translated = lookupDictPreservingOuterSymbols(combined);
                    if (translated !== null) {
                        if (config.debug) log('[command101] HIT multiline:', combined.slice(0, 80));
                        var trLines = translated.split('\n');
                        for (var i = 0; i < indices.length; i++) {
                            var line = translatedSlot(
                                splitLines[i].prefix, trLines, i, splitLines[i].suffix
                            );
                            list[indices[i]].parameters[0] = line;
                            if (!splitLines[i].suffix &&
                                line !== SKIP_TRANSLATED_MESSAGE_LINE) {
                                markTranslated(line);
                            }
                        }
                        if (config.debug) log('[command101] multiline translated =>', translated.slice(0, 80));
                        done = true;
                    }

                    // --- 备用路径：名字内联（\N[1] 之后的文本作 key）---
                    if (!done) {
                        var altSplits = lines.map(splitLineForKeyAlt);
                        if (altSplits.some(function(s) { return s !== null; })) {
                            var altKey = lines.map(function(ln, i) {
                                return altSplits[i] ? altSplits[i].keyText : splitLines[i].mainText;
                            }).join('\n');
                            if (config.debug) log('[command101] trying alt (name-inline):', JSON.stringify(altKey.slice(0, 120)));
                            var altTr = lookupDictPreservingOuterSymbols(altKey);
                            if (altTr !== null) {
                                if (config.debug) log('[command101] HIT alt name-inline:', altKey.slice(0, 80));
                                var altTrLines = altTr.split('\n');
                                for (var j = 0; j < indices.length; j++) {
                                    var altLine;
                                    if (altSplits[j]) {
                                        // namePrefix 前可能含日文，不 mark，让 translateText 继续翻译
                                        altLine = altSplits[j].namePrefix +
                                            (j < altTrLines.length ? altTrLines[j] : '');
                                    } else {
                                        altLine = translatedSlot(
                                            splitLines[j].prefix, altTrLines, j,
                                            splitLines[j].suffix
                                        );
                                        if (altLine !== SKIP_TRANSLATED_MESSAGE_LINE) {
                                            markTranslated(altLine);
                                        }
                                    }
                                    list[indices[j]].parameters[0] = altLine;
                                }
                                if (config.debug) log('[command101] alt translated =>', altTr.slice(0, 80));
                                done = true;
                            }
                        }
                    }

                    // --- 子区间滑窗：同一消息框内部分行构成多行 key ---
                    if (!done && lines.length >= 3) {
                        for (var winSize = lines.length - 1; winSize >= 2; winSize--) {
                            for (var start = 0; start + winSize <= lines.length; start++) {
                                var skip = false;
                                for (var si = start; si < start + winSize; si++) {
                                    if (subHit[si]) { skip = true; break; }
                                }
                                if (skip) continue;
                                var subSplits = splitLines.slice(start, start + winSize);
                                var subKey = subSplits.map(function(s) { return s.mainText; }).join('\n');
                                var subTr = lookupDictPreservingOuterSymbols(subKey);

                                // 子区间也尝试 alt name-inline
                                var subAltSplits = null;
                                if (subTr === null) {
                                    subAltSplits = lines.slice(start, start + winSize).map(splitLineForKeyAlt);
                                    if (subAltSplits.some(function(s) { return s !== null; })) {
                                        var subAltKey = lines.slice(start, start + winSize).map(function(ln, ki) {
                                            return subAltSplits[ki] ? subAltSplits[ki].keyText : subSplits[ki].mainText;
                                        }).join('\n');
                                        subTr = lookupDictPreservingOuterSymbols(subAltKey);
                                        if (subTr !== null && config.debug) {
                                            log('[command101] sub-window alt HIT [' + start + '..' + (start+winSize-1) + ']:', subAltKey.slice(0, 80));
                                        }
                                    }
                                }
                                if (subTr !== null) {
                                    if (config.debug && !subAltSplits) {
                                        log('[command101] sub-window HIT [' + start + '..' + (start+winSize-1) + ']:', subKey.slice(0, 80));
                                    }
                                    var subTrLines = subTr.split('\n');
                                    for (var k = 0; k < winSize; k++) {
                                        var kk = start + k;
                                        var kLine = (subAltSplits && subAltSplits[k])
                                            ? subAltSplits[k].namePrefix +
                                                (k < subTrLines.length ? subTrLines[k] : '')
                                            : translatedSlot(
                                                subSplits[k].prefix, subTrLines, k,
                                                subSplits[k].suffix
                                            );
                                        list[indices[kk]].parameters[0] = kLine;
                                        if (!(subAltSplits && subAltSplits[k]) &&
                                            kLine !== SKIP_TRANSLATED_MESSAGE_LINE) {
                                            markTranslated(kLine);
                                        }
                                        subHit[kk] = true;
                                    }
                                }
                            }
                        }
                    }

                    // --- suffix 接龙：行内颜色 token 后的文本 + 后续行组成 key ---
                    if (!done) {
                        for (var sfi = 0; sfi < lines.length - 1; sfi++) {
                            if (subHit[sfi] || !splitLines[sfi].suffix) continue;
                            var sufSplit = splitLineForKey(splitLines[sfi].suffix);
                            if (!sufSplit.mainText) continue;
                            for (var sfw = 1; sfi + sfw < lines.length; sfw++) {
                                if (subHit[sfi + sfw]) break;
                                var sufKeyParts = [sufSplit.mainText];
                                for (var sfk = 1; sfk <= sfw; sfk++) {
                                    sufKeyParts.push(splitLines[sfi + sfk].mainText);
                                }
                                var sufKey = sufKeyParts.join('\n');
                                var sufTr = lookupDictPreservingOuterSymbols(sufKey);
                                if (sufTr !== null) {
                                    if (config.debug) log('[command101] suffix-continue HIT line ' + sfi + '+' + sfw + ':', sufKey.slice(0, 80));
                                    var sufTrLines = sufTr.split('\n');
                                    // sfi 行：保留 prefix+mainText，suffix 的 special token 保留，文本换成译文首行
                                    // 不 mark：mainText 仍需 translateText 翻译
                                    list[indices[sfi]].parameters[0] =
                                        splitLines[sfi].prefix + splitLines[sfi].mainText +
                                        sufSplit.prefix + (sufTrLines[0] || '');
                                    for (var sfw2 = 1; sfw2 <= sfw; sfw2++) {
                                        var sfwLine = translatedSlot(
                                            splitLines[sfi + sfw2].prefix,
                                            sufTrLines, sfw2,
                                            splitLines[sfi + sfw2].suffix
                                        );
                                        list[indices[sfi + sfw2]].parameters[0] = sfwLine;
                                        if (!splitLines[sfi + sfw2].suffix &&
                                            sfwLine !== SKIP_TRANSLATED_MESSAGE_LINE) {
                                            markTranslated(sfwLine);
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            return _command101.apply(this, arguments);
        };
    }

    function patchMessageTranslation() {
        if (typeof Game_Message === 'undefined') return;

        var _Game_Message_clear = Game_Message.prototype.clear;
        Game_Message.prototype.clear = function() {
            _Game_Message_clear.apply(this, arguments);
            this._rpgTextTranslationHasTranslatedText = false;
            this._rpgTextTranslationLastLineTranslated = false;
            this._rpgTextTranslationJoinAfterSkippedLine = false;
        };

        function shouldJoinTranslatedLines(previous, current) {
            var left = String(previous || '').replace(/\s+$/, '');
            var right = String(current || '').replace(/^\s+/, '');
            if (!left || !right || /[\n\f]$/.test(left) || /^[\n\f]/.test(right)) {
                return false;
            }
            // 新的引号/段落应保留换行；句号、问号和闭引号表示上一句已经结束。
            if (/^[「『“‘（【《〈｢]/.test(right) ||
                /[。！？!?…‥」』”’）】》〉]$/.test(left)) {
                return false;
            }
            // 避免把短说话人名称和正文连在一起；闭引号等短尾句仍可接回长句。
            return left.length >= 12 || /^[，。！？、；：」』）】》〉]/.test(right);
        }

        var _Game_Message_add = Game_Message.prototype.add;
        Game_Message.prototype.add = function(text) {
            if (text === SKIP_TRANSLATED_MESSAGE_LINE) {
                // 下一条译文原本紧跟在被合并字典项占用的原文续行之后。只在这个
                // 明确场景允许重新接回上一条，避免改变普通多行对话的人工排版。
                this._rpgTextTranslationJoinAfterSkippedLine =
                    this._rpgTextTranslationLastLineTranslated;
                return;
            }

            var output;
            var wasTranslated = false;
            if (isAlreadyTranslated(text)) {
                unmarkTranslated(text);
                output = text;
                wasTranslated = true;
            } else {
                output = translateText(text);
                wasTranslated = output !== text || isKnownTranslation(output);
            }

            var previous = this._texts && this._texts.length > 0
                ? this._texts[this._texts.length - 1]
                : null;
            if (wasTranslated &&
                this._rpgTextTranslationJoinAfterSkippedLine &&
                previous !== null &&
                shouldJoinTranslatedLines(previous, output)) {
                this._texts[this._texts.length - 1] = previous + output;
            } else {
                _Game_Message_add.call(this, output);
            }
            this._rpgTextTranslationJoinAfterSkippedLine = false;
            this._rpgTextTranslationHasTranslatedText =
                this._rpgTextTranslationHasTranslatedText || wasTranslated;
            this._rpgTextTranslationLastLineTranslated = wasTranslated;
        };

        var _Game_Message_setChoices = Game_Message.prototype.setChoices;
        Game_Message.prototype.setChoices = function(choices, defaultType, cancelType) {
            var translatedChoices = Array.isArray(choices) ? choices.slice(0) : choices;
            translateArray(translatedChoices);
            _Game_Message_setChoices.call(this, translatedChoices, defaultType, cancelType);
        };

        // 不 hook setSpeakerName：TRP_SkitMZ 等立绘插件用原名做角色识别，
        // 提前翻译会让 nameToInputList 匹配失败、立绘消失。显示层由 patchNameBoxLog 兜底。
    }

    function patchTranslatedMessageAutoWrap() {
        if (typeof Window_Message === 'undefined' || !Window_Message.prototype) return;
        if (Window_Message.prototype._rpgTextTranslationAutoWrapPatched) return;

        var wrapLogCount = 0;
        var wrapLogLimit = 12;
        var _Window_Message_processNormalCharacter =
            Window_Message.prototype.processNormalCharacter;

        Window_Message.prototype.processNormalCharacter = function(textState) {
            if (window.$gameMessage &&
                $gameMessage._rpgTextTranslationHasTranslatedText &&
                textState &&
                textState.text &&
                textState.index < textState.text.length) {
                var character = textState.text.charAt(textState.index);
                var characterWidth = this.textWidth(character);
                var right = this.contents && this.contents.width
                    ? this.contents.width - (this.textPadding ? this.textPadding() : 0)
                    : 0;
                if (right > 0 &&
                    textState.x > textState.left &&
                    textState.x + characterWidth > right) {
                    if (config.debug && wrapLogCount < wrapLogLimit) {
                        log(
                            '[TranslationWrap] x=' + textState.x.toFixed(2) +
                            ' charWidth=' + characterWidth.toFixed(2) +
                            ' right=' + right.toFixed(2) +
                            ' font=' + JSON.stringify(this.contents.fontFace) +
                            ' fontSize=' + this.contents.fontSize
                        );
                        wrapLogCount += 1;
                    }
                    // 将真实换行插入当前字符之前，让游戏及 MPP_MessageEX 自己处理
                    // 行高、动画、停顿和翻页；当前字符留到下一轮正常绘制。
                    textState.text =
                        textState.text.slice(0, textState.index) + '\n' +
                        textState.text.slice(textState.index);
                    this.processNewLine(textState);
                    return;
                }
            }
            return _Window_Message_processNormalCharacter.apply(this, arguments);
        };

        Window_Message.prototype._rpgTextTranslationAutoWrapPatched = true;
    }

    function patchDatabaseTerms() {
        if (typeof DataManager === 'undefined') return;

        function translateFields(array, fields) {
            if (!Array.isArray(array)) return;
            for (var i = 1; i < array.length; i++) {
                var item = array[i];
                if (!item) continue;
                for (var f = 0; f < fields.length; f++) {
                    var field = fields[f];
                    if (typeof item[field] === 'string') {
                        // 根据配置决定是否翻译名称字段
                        var isNameField = (field === 'name' || field === 'nickname');
                        if (isNameField && !config.translateDatabaseNames) {
                            // 跳过名称字段的翻译（可能被用作资源文件标识符）
                            continue;
                        } else if (isNameField) {
                            // 名称字段允许翻译；资源文件回退由 native scheme handler 处理
                            var before = item[field];
                            var after = translateText(item[field]);
                            if (config.debug) {
                                log('[patchDatabaseTerms] translate name:', before, '=>', after);
                            }
                            item[field] = after;
                        } else {
                            // 描述等其他字段正常翻译
                            item[field] = translateText(item[field]);
                        }
                    }
                }
            }
        }

        var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
        DataManager.isDatabaseLoaded = function() {
            if (!_DataManager_isDatabaseLoaded.call(this)) return false;

            if (this._rpgTextTranslationPatched) {
                return true;
            }
            if (!state.loaded) {
                return false;
            }

            translateFields(window.$dataItems, ['name', 'description']);
            translateFields(window.$dataWeapons, ['name', 'description']);
            translateFields(window.$dataArmors, ['name', 'description']);
            translateFields(window.$dataSkills, ['name', 'description', 'message1', 'message2']);
            translateFields(window.$dataStates, ['name', 'message1', 'message2', 'message3', 'message4']);
            translateFields(window.$dataActors, ['name', 'nickname', 'profile']);
            translateFields(window.$dataClasses, ['name']);
            translateFields(window.$dataEnemies, ['name']);
            translateFields(window.$dataTroops, ['name']);
            translateFields(window.$dataMapInfos, ['name']);

            if (window.$dataSystem && config.translateSystemTerms) {
                translateArray(window.$dataSystem.elements);
                translateArray(window.$dataSystem.skillTypes);
                translateArray(window.$dataSystem.weaponTypes);
                translateArray(window.$dataSystem.armorTypes);
                translateArray(window.$dataSystem.equipTypes);
                translateArray(window.$dataSystem.terms && window.$dataSystem.terms.basic);
                translateArray(window.$dataSystem.terms && window.$dataSystem.terms.params);
                // terms.commands is intentionally excluded even when translateSystemTerms=true:
                // plugins like MOG_BattleCommands use command names as image file identifiers
                // (e.g. "アイテム" -> "Com_アイテム.rpgmvp"). Translating them breaks those paths.
            }

            this._rpgTextTranslationPatched = true;
            log('Database terms translated');
            return true;
        };
    }

    // 通用显示层 hook：覆盖普通窗口、自定义 Window_Selectable 和 drawTextEx。
    // 仅替换传给原绘制方法的局部参数，不回写插件数据，避免名称参与资源路径、
    // 状态判断或存档时受到影响。
    //
    // displayTranslationDepth 在原方法执行的整个期间保持 > 0。这样 drawTextEx
    // 内部若再次经过 drawText/textWidth，不会把已经翻译的结果重复翻译。
    function patchWindowTextDrawing() {
        if (typeof Window_Base === 'undefined' || !Window_Base.prototype) return;
        if (Window_Base.prototype._rpgTextTranslationDrawingPatched) return;

        var displayTranslationDepth = 0;

        function translateForDisplay(text) {
            if (displayTranslationDepth > 0 ||
                !state.loaded ||
                typeof text !== 'string' ||
                text === '') {
                return text;
            }
            return translateText(text);
        }

        function wrapTextMethod(methodName) {
            var original = Window_Base.prototype[methodName];
            if (typeof original !== 'function') return;

            Window_Base.prototype[methodName] = function(text) {
                var args = Array.prototype.slice.call(arguments);
                args[0] = translateForDisplay(text);
                displayTranslationDepth += 1;
                try {
                    return original.apply(this, args);
                } finally {
                    displayTranslationDepth -= 1;
                }
            };
        }

        wrapTextMethod('drawText');
        wrapTextMethod('drawTextEx');
        wrapTextMethod('textWidth');

        Window_Base.prototype._rpgTextTranslationDrawingPatched = true;
        log('[patchWindowTextDrawing] Window_Base drawText/drawTextEx/textWidth patched');
    }

    log('Plugin init config:', JSON.stringify(config));

    // Early exit if translation is disabled
    if (!config.enabled) {
        log('Translation disabled, skipping hooks');
        return;
    }

    patchBootReady();
    patchCanvasCJK();
    patchInterpreterCommand101();
    patchMessageTranslation();
    patchTranslatedMessageAutoWrap();
    patchDatabaseTerms();
    patchWindowTextDrawing();
    patchNameBoxLog();
    loadDictionary();

    if (config.debug) {
        setInterval(function() {
            if (!state.loaded) return;
            log('Stats: hits=' + state.hitCount + ', misses=' + state.missCount + ', failed=' + state.failed);
        }, 10000);
    }
})();


/* === inline_video.js === */
/**
 * inline_video.js
 * 强制 <video> 内联播放，拦截全屏进入；
 * 拦截 /movies/ 视频加载失败，将 error 事件转为合成的 ended 事件，防止游戏引擎崩溃/卡死。
 *
 * .webm → .mp4 重定向策略（2026-05 修正）：
 *   iOS WebKit/AVFoundation 给 <video> 选 demuxer 时高度依赖 URL 后缀；
 *   .webm URL 会被路由到不支持的 webm demuxer，连响应 Content-Type=video/mp4
 *   都不看，直接 net=3 NO_SOURCE。
 *   因此必须在 JS 层重写 src：.webm → .mp4。
 *
 * 自定义 scheme 视频播放策略（2026-06 修正）：
 *   AVFoundation 无法从自定义 URL scheme（rpgmv:// / rpgmz://）正常解码 <video>，
 *   无论 scheme handler 返回 200 全文件还是 206 Range，均反复重试后静默放弃。
 *   解决方案：在 loadstart 阶段 fetch 视频数据，创建 blob URL 替换 src，
 *   AVFoundation 可正常解码 blob URL。
 *
 * 注入时机：atDocumentStart（Phase 1）
 */
(function(){
    console.log('[ArkRPG] inline_video.js loaded (rev 2026-08-21-webm-taint)');

    // WebKit 对 WebM 内容的视频元素做 WebGL 纹理上传（texImage2D）时一律抛
    // SecurityError（origin-taint），无论来源是 blob 还是自定义 scheme；MP4 内容
    // 同路径上传正常。MoviePicture 等插件用 PIXI.VideoBaseTexture 把 <video> 传进
    // WebGL，一旦 scheme 侧漏出原始 WebM，异常会沿 render loop 冒泡直接冻结游戏。
    // 这里只对“video 元素 + SecurityError”的组合吞掉本次上传（保持纹理为空，
    // 画面呈现黑帧），其余错误原样抛出。scheme 侧修复（伪装扩展名识别 + 按需转码）
    // 生效后此保护应当永远不会触发。
    (function() {
        var protos = [
            window.WebGLRenderingContext && WebGLRenderingContext.prototype,
            window.WebGL2RenderingContext && WebGL2RenderingContext.prototype,
        ].filter(function(p) { return p && !p.__arkRpgTexImageGuarded; });
        var warned = false;
        protos.forEach(function(proto) {
            proto.__arkRpgTexImageGuarded = true;
            var orig = proto.texImage2D;
            proto.texImage2D = function(target, level, internalformat, format, type, source) {
                // 各重载的 source 均在最后一位；仅 video 纹理上传会因 WebM taint 抛错
                var lastArg = arguments[arguments.length - 1];
                if (!(lastArg instanceof HTMLVideoElement)) {
                    return orig.apply(this, arguments);
                }
                try {
                    return orig.apply(this, arguments);
                } catch (e) {
                    if (e && e.name === 'SecurityError') {
                        if (!warned) {
                            warned = true;
                            console.warn('[ArkRPG][Video] texImage2D SecurityError on video '
                                + '(WebKit WebM taint) — skipping texture upload: ' + (lastArg.src || ''));
                        }
                        return;
                    }
                    throw e;
                }
            };
        });
    })();
    // /movies/foo.webm 或 movies/foo.webm → 对应 .mp4（保留 query/hash）
    const isMovieUrl = function(url) {
        return typeof url === 'string' && (/(^|\/)movies\//i.test(url));
    };
    const isEncodedOuterMovieUrl = function(url) {
        if (typeof url !== 'string') return false;
        return /(^|\/)movies\/(?:\.%2f|%2e%2f|save%2f|save\/|\.\/)/i.test(url);
    };
    const rewriteWebmToMp4 = function(url) {
        if (typeof url !== 'string') return url;
        if (!isMovieUrl(url)) return url;
        if (isEncodedOuterMovieUrl(url)) return url;
        // 仅替换 path 部分末尾的 .webm（避免误改 query string）
        return url.replace(/\.webm(\?|#|$)/i, '.mp4$1');
    };

    // 缺失或无法解码的视频必须同时通知 PIXI“已加载”和游戏引擎“已结束”。
    // 返回一段可播放的空白 MP4 并不可靠：部分 MoviePicture 插件不会真正调用 play，
    // 因而永远收不到 ended。按 replacement token 去重，避免 fetch/error/timeout 重复派发。
    const finishUnavailableMovie = function(video, token, reason) {
        if (!video) return;
        if (token && video.__arkRpgBlobReplacementToken !== token) return;
        var finishToken = String(token || video.__arkRpgBlobReplacementToken || 'direct')
            + ':' + (video.src || video.currentSrc || '');
        if (video.__arkRpgSyntheticEndToken === finishToken) return;
        video.__arkRpgSyntheticEndToken = finishToken;
        video.__arkRpgBlobReplacementPending = false;
        console.warn('[ArkRPG][Video] unavailable — forcing loadeddata + ended: '
            + reason + ' src=' + (video.src || video.currentSrc || ''));
        setTimeout(function() {
            try { video.dispatchEvent(new Event('loadeddata')); } catch(_){}
            try { video.dispatchEvent(new Event('ended')); } catch(_){}
        }, 0);
    };

    try {
        const origPlay = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function() {
            var element = this;
            var playPromise = origPlay.apply(element, arguments);
            if (!playPromise || typeof playPromise.catch !== 'function') return playPromise;
            if (!element || element.tagName !== 'VIDEO') return playPromise;
            return playPromise.catch(function(error) {
                var name = error && error.name ? String(error.name) : '';
                var message = error && error.message ? String(error.message) : '';
                var replacementAgeMs = Date.now() - (element.__arkRpgBlobReplacementAt || 0);
                var sourceWasReplaced = (element.__arkRpgBlobReplacementPending || element.__arkRpgBlobReplaced)
                    && replacementAgeMs >= 0
                    && replacementAgeMs < 15000;
                var interruptedByLoad = name === 'AbortError' || /interrupted|aborted|load request/i.test(message);
                if (!sourceWasReplaced || !interruptedByLoad) throw error;

                return new Promise(function(resolve, reject) {
                    var settled = false;
                    var retrying = false;
                    var timer = null;
                    var cleanup = function() {
                        element.removeEventListener('loadeddata', retry, true);
                        element.removeEventListener('canplay', retry, true);
                        element.removeEventListener('error', fail, true);
                        if (timer) clearTimeout(timer);
                    };
                    var finish = function(fn, value) {
                        if (settled) return;
                        settled = true;
                        cleanup();
                        fn(value);
                    };
                    var retry = function() {
                        if (settled || retrying) return;
                        if (element.readyState < 2) return;
                        retrying = true;
                        try {
                            var retryPromise = origPlay.call(element);
                            if (retryPromise && typeof retryPromise.then === 'function') {
                                retryPromise.then(function(value) { finish(resolve, value); }, function(e) { finish(reject, e); });
                            } else {
                                finish(resolve);
                            }
                        } catch (e) {
                            finish(reject, e);
                        }
                    };
                    var fail = function() { finish(reject, element.error || error); };
                    element.addEventListener('loadeddata', retry, true);
                    element.addEventListener('canplay', retry, true);
                    element.addEventListener('error', fail, true);
                    timer = setTimeout(function() {
                        if (element.readyState >= 2) {
                            retry();
                        } else {
                            finish(reject, error);
                        }
                    }, 12000);
                    retry();
                });
            });
        };
    } catch(e) { console.warn('[ArkRPG] play promise patch failed: ' + e); }

    // 查找 src 属性 descriptor（沿原型链向上找）
    const findSrcDescriptor = function(el) {
        var p = Object.getPrototypeOf(el);
        while (p) {
            var d = Object.getOwnPropertyDescriptor(p, 'src');
            if (d && d.set && d.get) return d;
            p = Object.getPrototypeOf(p);
        }
        return null;
    };

    // 在 <video> 实例上安装 src setter，拦截 .webm → .mp4
    const installSrcHook = function(video) {
        try {
            // 已安装过则跳过
            if (video.__arkRpgSrcHooked) return;
            var desc = findSrcDescriptor(video);
            if (!desc) { console.warn('[ArkRPG] no src descriptor on video proto chain'); return; }
            Object.defineProperty(video, 'src', {
                configurable: true,
                enumerable: true,
                get: function() { return desc.get.call(this); },
                set: function(value) {
                    var rewritten = rewriteWebmToMp4(value);
                    if (rewritten !== value) {
                        console.log('[ArkRPG] src rewrite: ' + value + ' -> ' + rewritten);
                    }
                    desc.set.call(this, rewritten);
                }
            });
            video.__arkRpgSrcHooked = true;
        } catch(e) { console.warn('[ArkRPG] install src hook failed: ' + e); }
    };

    // 同时拦截 setAttribute('src'/'crossorigin', ...) 路径
    try {
        const origSetAttr = Element.prototype.setAttribute;
        Element.prototype.setAttribute = function(name, value) {
            if ((this.tagName === 'VIDEO' || this.tagName === 'SOURCE')
                && typeof name === 'string') {
                var nl = name.toLowerCase();
                if (nl === 'src') {
                    var rewritten = rewriteWebmToMp4(value);
                    if (rewritten !== value) {
                        console.log('[ArkRPG] setAttribute(src) rewrite: ' + value + ' -> ' + rewritten);
                    }
                    return origSetAttr.call(this, name, rewritten);
                }
                if (nl === 'crossorigin' && window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
                    return; // suppress crossOrigin on custom scheme
                }
            }
            return origSetAttr.call(this, name, value);
        };
    } catch(e) { console.warn('[ArkRPG] setAttribute hook failed: ' + e); }

    // iOS AVFoundation 不支持对自定义 URL scheme（rpgmv:// / rpgmz://）
    // 的视频执行 CORS 检查。若 crossOrigin='anonymous' 被设置，AVFoundation 可能
    // 静默拒绝加载，不发请求也不触发 error → PIXI hasLoaded 永远不 true → 游戏卡死。
    // 修复：拦截 crossOrigin setter，对自定义 scheme 页面不设置 crossOrigin。
    try {
        var coDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'crossOrigin');
        if (coDesc && coDesc.set) {
            var origCrossOriginSet = coDesc.set;
            Object.defineProperty(HTMLMediaElement.prototype, 'crossOrigin', {
                configurable: true, enumerable: true,
                get: coDesc.get,
                set: function(v) {
                    // 自定义 scheme 页面 origin 为 null，跳过 CORS 设置
                    if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
                        console.log('[ArkRPG] suppressed crossOrigin=' + v + ' on custom scheme');
                        return;
                    }
                    return origCrossOriginSet.call(this, v);
                }
            });
        }
    } catch(e) { /* non-critical */ }

    const markInline = (video) => {
        try {
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.setAttribute('x5-playsinline', '');
            video.disablePictureInPicture = true;
            // 拦截进入全屏
            if (typeof video.webkitEnterFullscreen === 'function') {
                video.webkitEnterFullscreen = function() { return; };
            }
            const exit = () => {
                try {
                    if (video.webkitSupportsFullscreen && video.webkitDisplayingFullscreen) {
                        video.webkitExitFullscreen();
                    }
                } catch(_){ }
            };
            video.addEventListener('webkitbeginfullscreen', function(e){ e.preventDefault(); exit(); }, true);
            video.addEventListener('ended', exit, true);
            // 关键：fetch 预热 WKWebView HTTP cache。
            // 实测如果不做这一步，AVFoundation 在 .webm URL 上有时会静默拒绝
            // （既不发请求给 scheme handler，也不 fire error 事件），导致引擎
            // 等 loadeddata 永远不来 → 卡死。此 fetch 让 scheme handler 的响应
            // 进 cache，AVFoundation 后续读取时拿到正确的 mp4 内容 + Content-Type,
            // 即便 URL 后缀仍是 .webm 也能播放。删除此段会复现间歇性卡死，详见
            // git 历史 / repo memory。
            video.addEventListener('loadstart', function() {
                var s = video.src || video.currentSrc || '';
                if (!isMovieUrl(s)) return;
                if (video.__arkRpgPrewarmed) return;
                video.__arkRpgPrewarmed = true;
                console.log('[ArkRPG][Video] loadstart: ' + s
                    + ' crossOrigin=' + video.crossOrigin
                    + ' protocol=' + window.location.protocol);
                // AVFoundation 无法从自定义 scheme（rpgmv:// / rpgmz://）正常解码视频，
                // 无论 Range/200 返回方式如何都会反复重试直到静默放弃。
                // 解决方案：fetch 视频数据，创建 blob URL 作为 src。
                // blob URL 由 web 进程内部处理，AVFoundation 可以正常解码。
                if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
                    var replacementToken = (video.__arkRpgBlobReplacementToken || 0) + 1;
                    video.__arkRpgBlobReplacementToken = replacementToken;
                    video.__arkRpgBlobReplacementPending = true;
                    video.__arkRpgBlobReplacementAt = Date.now();
                    fetch(s).then(function(r) {
                        if (r && typeof r.ok === 'boolean' && !r.ok) {
                            throw new Error('HTTP ' + r.status);
                        }
                        // scheme 侧可能已按内容改供 MP4（webm→mp4 twin / 伪装扩展名转码），
                        // 但伪装扩展名（.ddi 等）请求的响应 Content-Type 未必可靠，
                        // 仅当它明确是 video/* 时才采用，否则按 MP4 处理（AVFoundation 最稳）。
                        var contentType = '';
                        try { contentType = (r.headers && r.headers.get('Content-Type')) || ''; } catch(_){}
                        if (!/^video\//i.test(contentType)) contentType = 'video/mp4';
                        return r.arrayBuffer().then(function(buffer) {
                            return { buffer: buffer, type: contentType };
                        });
                    }).then(function(payload) {
                        if (video.__arkRpgBlobReplacementToken !== replacementToken) return;
                        var buffer = payload.buffer;
                        var blob = new Blob([buffer], {type: payload.type});
                        var blobUrl = URL.createObjectURL(blob);
                        console.log('[ArkRPG][Video] blob: ' + blobUrl + ' bytes=' + buffer.byteLength);
                        if (video.__arkRpgBlobUrl) {
                            try { URL.revokeObjectURL(video.__arkRpgBlobUrl); } catch(_){}
                        }
                        video.__arkRpgBlobUrl = blobUrl;
                        video.__arkRpgBlobReplaced = true;
                        video.__arkRpgBlobReplacementAt = Date.now();
                        video.src = blobUrl;
                        video.load();
                    }).catch(function(e) {
                        if (video.__arkRpgBlobReplacementToken === replacementToken) {
                            video.__arkRpgBlobReplacementPending = false;
                        }
                        console.warn('[ArkRPG][Video] blob conversion failed: ' + e);
                        finishUnavailableMovie(video, replacementToken, 'fetch failed: ' + e);
                    });
                }
                // 超时保护：10 秒后如果视频仍未 loadeddata，强制派发事件防止 PIXI 死锁
                setTimeout(function() {
                    if (!video.isConnected) return;
                    if (video.__arkRpgBlobReplacementToken !== replacementToken) return;
                    if (video.readyState >= 2) return; // HAVE_CURRENT_DATA or better
                    finishUnavailableMovie(video, replacementToken, 'timeout: ' + s);
                }, 10000);
            }, true);
            video.addEventListener('loadeddata', function() {
                video.__arkRpgBlobReplacementPending = false;
                var s = video.src || video.currentSrc || '';
                console.log('[ArkRPG][Video] loadeddata: ' + s
                    + ' ready=' + video.readyState
                    + ' dur=' + video.duration);
            }, true);
            video.addEventListener('canplay', function() {
                var s = video.src || video.currentSrc || '';
                console.log('[ArkRPG][Video] canplay: ' + s + ' ready=' + video.readyState);
            }, true);
            // 拦截 /movies/ 视频的 error 事件（capture 阶段，先于游戏引擎 bubble 阶段 handler）
            // 防止引擎将视频加载失败 throw 为 LoadError 崩溃/卡死游戏
            video.addEventListener('error', function(e) {
                var src = video.src || video.currentSrc || '';
                // MZ/插件在影片播完后会执行 video.src = "" 清理；WebKit 把空 src 解析为
                // 页面 URL（index.html）并触发 error。这是清理动作而非真正的影片加载失败。
                // 若仍按失败处理并派发合成 loadeddata，会让已销毁/空 source 的 PIXI 视频纹理
                // 崩溃（TypeError: null is not an object 'source._pixiId'，复现游戏：
                // 冒涜の聖女ナタリア MZ）。直接忽略即可——MZ 自身的清理本就不会崩。
                if (!src || src === window.location.href || /(^|\/)index\.html?$/i.test(src)) {
                    return;
                }
                // Match /movies/ scheme URLs or blob URLs that replaced them
                if (isMovieUrl(src) || video.__arkRpgPrewarmed) {
                    e.stopImmediatePropagation();
                    var err = video.error;
                    var code = err ? err.code : 'null';
                    var msg = err ? (err.message || '') : '';
                    // error code: 1=ABORTED 2=NETWORK 3=DECODE 4=SRC_NOT_SUPPORTED
                    console.warn('[ArkRPG] movie load failed: ' + src
                        + ' | errCode=' + code
                        + ' | net=' + video.networkState
                        + ' | ready=' + video.readyState
                        + (msg ? ' | ' + msg : ''));
                    // Fallback：如果 src 还是 .webm（setter/setAttribute hook 都没拦住，
                    // 实测 MZ 引擎走的就是这条路），这里改写到 .mp4 重新 load 一次
                    if (/\.webm(\?|#|$)/i.test(src) && !video.__arkRpgRetried) {
                        var rewritten = rewriteWebmToMp4(src);
                        if (rewritten !== src) {
                            console.log('[ArkRPG] webm->mp4 retry: ' + src + ' -> ' + rewritten);
                            video.__arkRpgRetried = true;
                            try {
                                video.src = rewritten;
                                video.load();
                            } catch(re) { console.warn('[ArkRPG] retry failed: ' + re); }
                            return;
                        }
                    }
                    // 触发合成 loadeddata + ended 事件。
                    // loadeddata 让 PIXI v4 VideoBaseTexture 设置 hasLoaded=true，
                    // 否则 ysp.VideoPlayer.isReady() 等插件会永远返回 false 导致事件死循环。
                    // ended 让 MV/MZ 引擎认为视频正常播完，游戏继续。
                    finishUnavailableMovie(
                        video,
                        video.__arkRpgBlobReplacementToken,
                        'media error code=' + code
                    );
                }
            }, true);
        } catch(_){ }
    };

    // 覆盖 createElement，确保后续创建的视频也被标记为内联 + 装上 src hook
    const origCreate = document.createElement.bind(document);
    document.createElement = function(tagName, options){
        const el = origCreate(tagName, options);
        if (tagName && String(tagName).toLowerCase() === 'video') {
            installSrcHook(el);
            markInline(el);
        }
        return el;
    };

    // 兜底：初始扫描已存在的 video 标签
    document.querySelectorAll('video').forEach(function(v){ installSrcHook(v); markInline(v); });
})();


/* === compat_chimaki_spine.js === */
// ChimakiSpine compatibility layer for WKWebView.
//
// ChimakiSpine is shipped by some RPG Maker MV games as NW.js V8 bytecode and
// loaded through nw.Window.evalNWBin(). JavaScriptCore cannot execute that
// bytecode, so this file provides the command/API surface used by those games.

(function() {
    'use strict';

    var TAG = '[ChimakiSpineCompat]';
    var BIN_PATTERN = /(?:^|\/)ChimakiSpine\.bin(?:[?#].*)?$/i;
    var installed = false;

    function log(message) {
        console.log(TAG + ' ' + message);
    }

    function warn(message) {
        console.warn(TAG + ' ' + message);
    }

    function fail(message, error) {
        console.error(TAG + ' ' + message, error || '');
    }

    function createManager() {
        var entries = Object.create(null);
        var layer = null;

        function entryFor(id) {
            id = String(id || '');
            if (!entries[id]) {
                entries[id] = {
                    id: id,
                    loading: false,
                    error: null,
                    container: null,
                    loader: null,
                    // LOAD/SET/SKIN are also used as a preload/configuration
                    // sequence. Only PLAY reveals a fresh or hidden model.
                    // A fresh model is therefore hidden, defaulting to the
                    // screen center until its transform is configured.
                    x: 960,
                    y: 540,
                    scale: 1,
                    mix: null,
                    skin: null,
                    animation: null,
                    visible: false
                };
            }
            return entries[id];
        }

        function ensureLayer() {
            if (!window.PIXI || !PIXI.Container) return null;
            if (!layer || layer._destroyed) {
                layer = new PIXI.Container();
                layer.name = 'ChimakiSpineLayer';
            }

            var scene = window.SceneManager && SceneManager._scene;
            var parent = scene && (scene._spriteset || scene);
            if (parent && layer.parent !== parent) {
                if (layer.parent) layer.parent.removeChild(layer);
                // Games drive their UI (title menus, H-scene buttons) as
                // pictures over full-screen spine scenes, so the spine layer
                // must render BELOW Spriteset_Base._pictureContainer.
                // addChild would stack it above every picture (menus become
                // invisible while their touch hot-spots keep working).
                var pictures = parent._pictureContainer;
                if (pictures && pictures.parent === parent) {
                    parent.addChildAt(layer, parent.getChildIndex(pictures));
                } else if (parent._windowLayer && parent._windowLayer.parent === parent) {
                    parent.addChildAt(layer, parent.getChildIndex(parent._windowLayer));
                } else {
                    parent.addChild(layer);
                }
            }
            return layer;
        }

        function detachLayer() {
            if (layer && layer.parent) {
                layer.parent.removeChild(layer);
            }
        }

        function applyEntry(entry) {
            var container = entry.container;
            if (!container || !container.spine) return;

            container.position.set(entry.x, entry.y);
            container.scale.set(entry.scale, entry.scale);
            container.visible = entry.visible;

            if (entry.mix !== null && container.spine.stateData) {
                container.spine.stateData.defaultMix = entry.mix;
            }

            if (entry.skin !== null) {
                try {
                    container.spine.skeleton.setSkinByName(entry.skin);
                    container.spine.skeleton.setSlotsToSetupPose();
                } catch (error) {
                    fail('Skin "' + entry.skin + '" is unavailable for model "' + entry.id + '".', error);
                }
            }

            if (entry.animation !== null) {
                try {
                    container.spine.state.setAnimation(0, entry.animation, true);
                } catch (error) {
                    fail('Animation "' + entry.animation + '" is unavailable for model "' + entry.id + '".', error);
                }
            }
        }

        function createContainer(entry, spineData) {
            var hostLayer = ensureLayer();
            if (!hostLayer) {
                throw new Error('PIXI.Container is unavailable.');
            }

            var spine = new PIXI.spine.Spine(spineData);
            var container = new PIXI.Container();
            container.name = 'ChimakiSpine:' + entry.id;
            container.spine = spine;
            container.addChild(spine);
            hostLayer.addChild(container);
            entry.container = container;
            applyEntry(entry);
        }

        function resourceError(resource) {
            if (!resource) return 'loader returned no resource';
            if (resource.error) return String(resource.error.message || resource.error);
            if (!resource.spineData) return 'pixi-spine did not produce spineData';
            return null;
        }

        // This game's patched pixi-spine removes ".png" from atlas page names
        // when Decrypter.hasEncryptedImages is true. ChimakiSpine.bin normally
        // restores the encrypted image path itself. Request the logical .png
        // URL here so MVSchemeHandler can resolve it to and decrypt .rpgmvp.
        function encryptedAtlasImageLoader(loader, namePrefix, baseUrl, imageOptions) {
            if (baseUrl && baseUrl.lastIndexOf('/') !== baseUrl.length - 1) {
                baseUrl += '/';
            }
            return function(line, callback) {
                var imageLine = String(line || '');
                var filename = imageLine.substring(imageLine.lastIndexOf('/') + 1);
                if (filename.indexOf('.') === -1) {
                    imageLine += '.png';
                }

                var name = namePrefix + imageLine;
                var url = baseUrl + imageLine;
                var cachedResource = loader.resources[name];
                if (cachedResource) {
                    var completeCached = function() {
                        callback(cachedResource.texture ? cachedResource.texture.baseTexture : null);
                    };
                    if (cachedResource.texture || cachedResource.error) {
                        completeCached();
                    } else {
                        cachedResource.onAfterMiddleware.add(completeCached);
                    }
                    return;
                }

                loader.add(name, url, imageOptions, function(resource) {
                    if (!resource.error && resource.texture) {
                        callback(resource.texture.baseTexture);
                    } else {
                        fail('Failed to load atlas page for model: ' + url,
                            resource.error || new Error('texture was not created'));
                        callback(null);
                    }
                });
            };
        }

        function load(id, texturePageCount) {
            var entry = entryFor(id);
            if (entry.container) {
                applyEntry(entry);
                ensureLayer();
                return entry;
            }
            if (entry.loading) return entry;

            if (!window.PIXI || !PIXI.loaders || !PIXI.loaders.Loader ||
                !PIXI.spine || !PIXI.spine.Spine) {
                entry.error = new Error('pixi-spine runtime is unavailable.');
                fail('Cannot load model "' + entry.id + '": pixi-spine runtime is unavailable.');
                return entry;
            }

            entry.loading = true;
            entry.error = null;

            var url = 'img/spine/' + encodeURIComponent(entry.id) + '/' +
                encodeURIComponent(entry.id) + '.json';
            var atlasUrl = 'img/spine/' + encodeURIComponent(entry.id) + '/' +
                encodeURIComponent(entry.id) + '.atlas';
            var resourceName = 'ark_chimaki_spine_' + entry.id + '_' + Date.now();
            var loader = new PIXI.loaders.Loader();
            entry.loader = loader;

            if (loader.onError && loader.onError.add) {
                loader.onError.add(function(error, currentLoader, resource) {
                    fail('Resource request failed for model "' + entry.id + '": ' +
                        (resource && resource.url ? resource.url : url), error);
                });
            }

            log('Loading model "' + entry.id + '" from ' + url +
                (texturePageCount ? ' (' + texturePageCount + ' atlas page(s))' : '') + '.');

            loader.add(resourceName, url, {
                metadata: {
                    spineAtlasFile: atlasUrl,
                    imageLoader: encryptedAtlasImageLoader
                }
            }).load(function(activeLoader, resources) {
                entry.loading = false;
                entry.loader = null;
                var resource = resources && resources[resourceName];
                var errorText = resourceError(resource);
                if (errorText) {
                    entry.error = resource && resource.error || new Error(errorText);
                    fail('Failed to load model "' + entry.id + '" from ' + url + ': ' + errorText,
                        entry.error);
                    return;
                }

                try {
                    createContainer(entry, resource.spineData);
                    log('Loaded model "' + entry.id + '".');
                } catch (error) {
                    entry.error = error;
                    fail('Failed to create model "' + entry.id + '".', error);
                }
            });
            return entry;
        }

        function setTransform(id, x, y, scale, mix) {
            var entry = entryFor(id);
            entry.x = isFinite(Number(x)) ? Number(x) : entry.x;
            entry.y = isFinite(Number(y)) ? Number(y) : entry.y;
            entry.scale = isFinite(Number(scale)) ? Number(scale) : entry.scale;
            entry.mix = mix !== undefined && mix !== null && mix !== '' && isFinite(Number(mix))
                ? Number(mix)
                : null;
            applyEntry(entry);
        }

        function changeSkin(id, skin) {
            var entry = entryFor(id);
            entry.skin = String(skin || '');
            applyEntry(entry);
        }

        function play(id, animation) {
            var entry = entryFor(id);
            entry.animation = String(animation || '');
            entry.visible = true;
            applyEntry(entry);
        }

        function hide(id) {
            if (id !== undefined && id !== null && String(id) !== '') {
                var entry = entryFor(id);
                entry.visible = false;
                applyEntry(entry);
                return;
            }
            Object.keys(entries).forEach(function(key) {
                entries[key].visible = false;
                applyEntry(entries[key]);
            });
        }

        function clear(id) {
            if (id === undefined || id === null || String(id) === '') {
                Object.keys(entries).forEach(clear);
                return;
            }

            id = String(id);
            var entry = entries[id];
            if (!entry) return;
            if (entry.loader && entry.loader.reset) entry.loader.reset();
            if (entry.container) {
                if (entry.container.parent) entry.container.parent.removeChild(entry.container);
                entry.container.destroy({ children: true });
            }
            delete entries[id];
        }

        return {
            loadSpine: load,
            loadResource: load,
            addSpine: load,
            setSpine: setTransform,
            changeSkin: changeSkin,
            playSpine: play,
            hideSpine: hide,
            hideAllSpine: function() { hide(); },
            removeSpine: clear,
            clearSpine: clear,
            getSpineContainer: function(id) {
                var entry = entries[String(id || '')];
                return entry ? entry.container : null;
            },
            isLoading: function(id) {
                var entry = entries[String(id || '')];
                return !!(entry && entry.loading);
            },
            hasError: function(id) {
                var entry = entries[String(id || '')];
                return !!(entry && entry.error);
            },
            ensureLayer: ensureLayer,
            detachLayer: detachLayer,
            _entries: entries
        };
    }

    function installInterpreter(manager) {
        if (!window.Game_Interpreter || !Game_Interpreter.prototype) {
            throw new Error('Game_Interpreter is unavailable.');
        }
        if (Game_Interpreter.prototype._arkChimakiSpinePatched) return;

        var originalPluginCommand = Game_Interpreter.prototype.pluginCommand;
        Game_Interpreter.prototype.pluginCommand = function(command, args) {
            originalPluginCommand.apply(this, arguments);
            if (String(command || '').toUpperCase() !== 'C_SPINE') return;

            args = args || [];
            var action = String(args[0] || '').toUpperCase();
            var id = args[1];
            switch (action) {
            case 'LOAD':
                manager.loadSpine(id, Number(args[2]) || 0);
                if (manager.isLoading(id)) {
                    this._arkChimakiSpineWaitId = String(id);
                    this.setWaitMode('arkChimakiSpine');
                }
                break;
            case 'SET':
                manager.setSpine(id, args[2], args[3], args[4], args[5]);
                break;
            case 'SKIN':
                manager.changeSkin(id, args[2]);
                break;
            case 'PLAY':
                manager.playSpine(id, args[2]);
                break;
            case 'CLEAR':
                manager.clearSpine(id);
                break;
            case 'HIDE':
                manager.hideSpine(id);
                break;
            default:
                warn('Unknown C_SPINE command: ' + args.join(' '));
                break;
            }
        };

        var originalUpdateWaitMode = Game_Interpreter.prototype.updateWaitMode;
        Game_Interpreter.prototype.updateWaitMode = function() {
            if (this._waitMode === 'arkChimakiSpine') {
                var waiting = manager.isLoading(this._arkChimakiSpineWaitId);
                if (!waiting) {
                    this._waitMode = '';
                    this._arkChimakiSpineWaitId = null;
                }
                return waiting;
            }
            return originalUpdateWaitMode.apply(this, arguments);
        };

        Game_Interpreter.prototype._arkChimakiSpinePatched = true;
    }

    function installSceneHooks(manager) {
        if (!window.Scene_Base || !Scene_Base.prototype ||
            Scene_Base.prototype._arkChimakiSpinePatched) return;

        var originalStart = Scene_Base.prototype.start;
        Scene_Base.prototype.start = function() {
            var result = originalStart.apply(this, arguments);
            manager.ensureLayer();
            return result;
        };

        var originalTerminate = Scene_Base.prototype.terminate;
        Scene_Base.prototype.terminate = function() {
            manager.detachLayer();
            return originalTerminate.apply(this, arguments);
        };

        Scene_Base.prototype._arkChimakiSpinePatched = true;
    }

    function isUsableExistingManager(manager) {
        if (!manager || typeof manager.getSpineContainer !== 'function') {
            return false;
        }
        return typeof manager.loadSpine === 'function' ||
            typeof manager.loadResource === 'function' ||
            typeof manager.addSpine === 'function';
    }

    function install() {
        if (installed) return window.$spineManager;

        if (isUsableExistingManager(window.$spineManager)) {
            installed = true;
            log('Existing $spineManager is usable; preserving the game-provided implementation.');
            return window.$spineManager;
        }

        var manager = createManager();
        installInterpreter(manager);
        installSceneHooks(manager);
        window.$spineManager = manager;
        installed = true;
        log('Installed JavaScript replacement for ChimakiSpine.bin.');
        return manager;
    }

    function hookEvalNWBin() {
        if (!window.nw || !nw.Window || typeof nw.Window.get !== 'function') {
            fail('NW.js polyfill is unavailable; cannot hook evalNWBin.');
            return;
        }
        if (nw.Window.get._arkChimakiSpineHooked) return;

        var originalGet = nw.Window.get;
        var hookedGet = function() {
            var win = originalGet.apply(this, arguments);
            var originalEvalNWBin = win.evalNWBin;
            win.evalNWBin = function(frame, path) {
                var normalizedPath = String(path || '').replace(/\\/g, '/');
                if (BIN_PATTERN.test(normalizedPath)) {
                    try {
                        return install();
                    } catch (error) {
                        fail('Failed to install replacement for "' + normalizedPath + '".', error);
                        throw error;
                    }
                }
                if (typeof originalEvalNWBin === 'function') {
                    return originalEvalNWBin.apply(this, arguments);
                }
            };
            return win;
        };
        hookedGet._arkChimakiSpineHooked = true;
        nw.Window.get = hookedGet;
        if (window.mockNW && mockNW.Window) mockNW.Window.get = hookedGet;
        log('Hooked nw.Window.evalNWBin.');
    }

    hookEvalNWBin();
})();


/* === compat_dktools_localization.js === */
// DKTools_Localization text-only translation
// 问题：DKTools_Localization 禁用后，游戏文本显示为 {MES00008} 等占位符。
// 原因：该插件负责将 {key} 标签替换为翻译文本（JSON 存于 locales/ 目录），
//       但同时重写资源路径导致黑屏，因此只能禁用其完整功能。
// 修复：独立加载 locale JSON 数据，仅提供文本翻译，不做资源路径重写。
//       同时提供 DKTools.Localization stub，避免其他插件引用 DKTools.Localization.locale 时崩溃。
// Trigger: game plugins.js contains DKTools_Localization

(function() {
    'use strict';

    var TAG = '[DKTools Loc Compat]';
    function L(msg) { try { console.log(TAG + ' ' + msg); } catch(e) {} }
    L('=== compat patch loaded @ ' + new Date().toISOString() + ' ===');
    try { L('navigator.language=' + navigator.language + ' navigator.languages=' + (navigator.languages || []).join(',')); } catch(e) {}
    try { L('window.location=' + (window.location && window.location.href)); } catch(e) {}

    var LOCALE_KEY = 'RPG Locale';
    var DEFAULT_LOCALE = 'en';
    var PARSE_DEPTH = 2;
    var REGEX_TAG = /\{(.*?)\}/g;
    var REGEX_VAR = /\\VAR\[(\d+)\]/g;

    // Locale tag → 游戏 locale 别名候选（CSV 列名 / locale 子目录名）
    // 用于把 navigator.language 推断出的标准 locale tag 匹配到游戏实际使用的短 locale 名
    // 例：zh-CN → cn（HILLS CSV 列名）；zh-TW → tw；ja → jp；ko → kr
    var LOCALE_ALIASES = {
        'zh-CN': ['cn', 'zh', 'zh_CN', 'zh-Hans', 'chs', 'zh-Hans-CN', 'zh-CN', 'tw', 'zh-TW', 'cht'],
        'zh-TW': ['tw', 'cht', 'zh_TW', 'zh-Hant', 'zh-Hant-TW', 'zh-TW'],
        'zh-HK': ['hk', 'zh-HK', 'zh-Hant-HK', 'zh-hk'],
        'en': ['eng'],
        'ja': ['jp', 'jpn', 'ja-JP'],
        'ko': ['kr', 'kor', 'ko-KR'],
        'ru': ['ru-RU', 'rus'],
        'fr': ['fr-FR', 'fra'],
        'es': ['es-ES', 'spa'],
        'de': ['de-DE', 'deu'],
        'it': ['it-IT', 'ita'],
        'pt-BR': ['ptbr', 'pt_br', 'pt-BR'],
        'vi-VN': ['vi', 'vie']
    };

    // 判断两个 locale tag 是否属于同一语言族（用于检测 saved locale 与系统语言是否一致）
    function sameLocaleFamily(a, b) {
        if (!a || !b) return false;
        if (a === b) return true;
        var aSet = [a].concat(LOCALE_ALIASES[a] || []);
        var bSet = [b].concat(LOCALE_ALIASES[b] || []);
        for (var i = 0; i < aSet.length; i++) {
            if (bSet.indexOf(aSet[i]) >= 0) return true;
        }
        return false;
    }

    var __locData = null;
    var __locCache = {};
    var __locale = DEFAULT_LOCALE;
    var __availableLocales = null;
    var __dkParams = null;
    var __localeListeners = [];
    var __pretranslatedMessageLines = [];
    var __standingPictureDiagCount = 0;

    var LOCALE_DISPLAY = {
        'en': 'English',
        'ja': '日本語',
        'jp': '日本語',
        'ko': '한국어',
        'kr': '한국어',
        'ru': 'Русский',
        'zh': '中文',
        'zh-CN': '简体中文',
        'zh-TW': '繁體中文',
        'zh-Hans': '简体中文',
        'zh-Hant': '繁體中文',
        'zh-hk': '繁體中文（香港）',
        'zh-HK': '繁體中文（香港）',
        'vi-VN': 'Tiếng Việt',
        'vi': 'Tiếng Việt',
        'pt-BR': 'Português (Brasil)',
        'pt': 'Português',
        'es': 'Español',
        'fr': 'Français',
        'de': 'Deutsch',
        'it': 'Italiano',
        'cn': '中文',
        'tw': '繁體中文',
        'text': 'Text'
    };

    var LOCALE_PROBE_FILES = [
        'main.json', 'system.json', 'title.json', 'menu.json',
        'options.json', 'CommonEvents.json', 'actors.json', 'index.json'
    ];

    var LOCALE_CANDIDATES = [
        'en', 'ja', 'jp', 'ko', 'kr', 'ru', 'zh', 'zh-CN', 'zh-TW',
        'zh-Hans', 'zh-Hant', 'zh-hk', 'zh-HK', 'vi-VN', 'vi',
        'pt-BR', 'pt', 'es', 'fr', 'de', 'it', 'cn', 'tw', 'text'
    ];

    function getLocaleDisplayName(loc) {
        if (__dkParams && __dkParams._displayNameByLocale) {
            var name = __dkParams._displayNameByLocale[loc];
            if (name) return name;
        }
        return LOCALE_DISPLAY[loc] || loc;
    }

    // Load DKTools_Localization parameters from the game's js/plugins.js.
    // Returns { First Launch: bool, Languages: [{Language, Locale, Primary}, ...], ... } or null.
    function loadDKToolsParams() {
        if (__dkParams !== null) return __dkParams;
        __dkParams = {}; // mark as attempted
        try {
            var text = xhrLoadText('js/plugins.js');
            L('loadDKToolsParams: js/plugins.js XHR result type=' + (typeof text) + ', length=' + (text ? text.length : 0));
            if (!text) return __dkParams;
            var nameIdx = text.indexOf('"name":"DKTools_Localization"');
            L('loadDKToolsParams: DKTools_Localization entry index=' + nameIdx);
            if (nameIdx < 0) return __dkParams;
            // Limit segment to this plugin entry — next "name":"..." or end of array
            var segment = text.substr(nameIdx, 4000);
            var nextName = segment.indexOf('"name":"', 50);
            if (nextName > 0) segment = segment.substr(0, nextName);

            var firstLaunch = false;
            var flMatch = segment.match(/"First Launch"\s*:\s*"([^"]*)"/);
            if (flMatch) firstLaunch = (flMatch[1] === 'true');

            var languages = [];
            // Capture the full JSON string value (with surrounding quotes) so we
            // can use JSON.parse to handle the nested escaping correctly.
            // plugins.js stores Languages as a JSON-stringified array of JSON-stringified objects,
            // so the value contains doubly-escaped quotes like \" and \\\".
            var langMatch = segment.match(/"Languages"\s*:\s*("(?:[^"\\]|\\.)*")/);
            if (langMatch) {
                try {
                    var unescaped = JSON.parse(langMatch[1]); // unwrap outer JSON string
                    var langArr = JSON.parse(unescaped) || [];  // parse inner array
                    // Each element is itself a JSON-stringified object — parse once more
                    for (var li = 0; li < langArr.length; li++) {
                        if (typeof langArr[li] === 'string') {
                            try { langArr[li] = JSON.parse(langArr[li]); } catch(e) {}
                        }
                    }
                    languages = langArr;
                } catch(e) {}
            }

            __dkParams = {
                'First Launch': firstLaunch,
                'Languages': languages,
                _displayNameByLocale: (function() {
                    var m = {};
                    for (var i = 0; i < languages.length; i++) {
                        if (languages[i].Locale) m[languages[i].Locale] = languages[i].Language;
                    }
                    return m;
                })()
            };
            L('loadDKToolsParams: parsed OK → First Launch=' + firstLaunch +
              ', Languages count=' + languages.length +
              ', locales=[' + languages.map(function(x){return x.Locale;}).join(',') + ']');
        } catch(e) {
            L('loadDKToolsParams: EXCEPTION ' + (e && e.message));
        }
        return __dkParams;
    }

    function probeAvailableLocales() {
        if (__availableLocales) return __availableLocales;
        // Prefer the game-declared Languages list (from DKTools_Localization params)
        var params = loadDKToolsParams();
        var found = [];
        var seen = {};
        if (params && params['Languages'] && params['Languages'].length > 0) {
            for (var k = 0; k < params['Languages'].length; k++) {
                var entry = params['Languages'][k];
                if (entry && entry.Locale && !seen[entry.Locale]) {
                    seen[entry.Locale] = true;
                    found.push(entry.Locale);
                }
            }
        }
        // Fallback: probe candidate folder names
        for (var i = 0; i < LOCALE_CANDIDATES.length; i++) {
            var loc = LOCALE_CANDIDATES[i];
            if (seen[loc]) continue;
            seen[loc] = true;
            for (var j = 0; j < LOCALE_PROBE_FILES.length; j++) {
                var url = 'locales/' + loc + '/' + LOCALE_PROBE_FILES[j];
                if (xhrLoadText(url)) {
                    found.push(loc);
                    break;
                }
            }
        }
        if (found.length === 0) found = [__locale];
        __availableLocales = found;
        L('probeAvailableLocales → [' + found.join(',') + ']');
        return found;
    }

    function resolveLocale(lang) {
        var lower = (lang || 'en').toLowerCase();
        var r;
        if (lower.indexOf('zh-hans') === 0) r = 'zh-CN';
        else if (lower.indexOf('zh-hant') === 0) r = 'zh-TW';
        else if (lower === 'zh-cn') r = 'zh-CN';
        else if (lower === 'zh-tw') r = 'zh-TW';
        else if (lower === 'zh-hk') r = 'zh-HK';
        else if (lower.indexOf('zh') === 0) r = 'zh-CN';
        else if (lower.indexOf('ja') === 0) r = 'ja';
        else if (lower.indexOf('ko') === 0) r = 'ko';
        else if (lower.indexOf('ru') === 0) r = 'ru';
        else if (lower.indexOf('fr') === 0) r = 'fr';
        else if (lower.indexOf('es') === 0) r = 'es';
        else if (lower.indexOf('de') === 0) r = 'de';
        else if (lower.indexOf('it') === 0) r = 'it';
        else if (lower.indexOf('pt') === 0) r = 'pt-BR';
        else if (lower.indexOf('vi') === 0) r = 'vi-VN';
        else r = DEFAULT_LOCALE;
        L('resolveLocale("' + lang + '") → "' + r + '"');
        return r;
    }

    try {
        var saved = localStorage.getItem(LOCALE_KEY);
        var userSelected = localStorage.getItem(LOCALE_KEY + '_userSelected') === 'true';
        var navLocale = resolveLocale(navigator.language);
        L('init: localStorage["' + LOCALE_KEY + '"]=' + JSON.stringify(saved) + ', userSelected=' + userSelected + ', navigator→"' + navLocale + '"');
        if (saved && typeof saved === 'string' && saved.length > 0) {
            if (userSelected) {
                __locale = saved;
                L('init: using saved locale "' + __locale + '" (user-selected, honored)');
            } else if (sameLocaleFamily(saved, navLocale)) {
                __locale = saved;
                L('init: using saved locale "' + __locale + '" (matches navigator family)');
            } else {
                L('init: saved locale "' + saved + '" mismatches navigator family "' + navLocale + '" — discarding (likely historical residue)');
                try { localStorage.removeItem(LOCALE_KEY); } catch (e) {}
                __locale = navLocale;
            }
        } else {
            __locale = navLocale;
            L('init: no saved locale, resolved from navigator → "' + __locale + '"');
        }
    } catch (e) {
        L('init: localStorage read threw ' + (e && e.message));
        __locale = resolveLocale(navigator.language);
    }

    function xhrLoadText(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        try {
            xhr.send();
            if (xhr.status === 200 || xhr.status === 0) {
                return xhr.responseText;
            }
        } catch (e) {}
        return null;
    }

    function mergeJsonData(data, text, source) {
        try {
            var json = JSON.parse(text);
            if (Array.isArray(json)) {
                data[source] = json;
            } else if (typeof json === 'object' && json !== null) {
                var keys = Object.keys(json);
                for (var k = 0; k < keys.length; k++) {
                    if (data[keys[k]] === undefined) {
                        data[keys[k]] = json[keys[k]];
                    }
                }
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    var __localeFolderCaseCache = {};
    function findLocaleFolderCase(declaredLocale) {
        if (!declaredLocale) return declaredLocale;

        // Manifest 优先：Native 端已扫描实际目录，locale → dir 映射是 ground truth。
        // 跳过昂贵的 hasAny 探测，避免对 manifest 内已有但文件名不在探测白名单的 locale 误判。
        var manifest = window.__ArkLocaleManifest;
        if (manifest && typeof manifest === 'object') {
            var manifestKeys = Object.keys(manifest).filter(function(k) { return k.charAt(0) !== '_'; });
            for (var mi = 0; mi < manifestKeys.length; mi++) {
                if (manifestKeys[mi] === declaredLocale) return declaredLocale;
            }
            var dl = declaredLocale.toLowerCase();
            for (var mi = 0; mi < manifestKeys.length; mi++) {
                if (manifestKeys[mi].toLowerCase() === dl) return manifestKeys[mi];
            }
        }

        if (Object.prototype.hasOwnProperty.call(__localeFolderCaseCache, declaredLocale)) {
            return __localeFolderCaseCache[declaredLocale];
        }
        // Quick probe with just a few common filenames before falling back.
        function hasAny(loc) {
            return !!(xhrLoadText('locales/' + loc + '/main.json') ||
                      xhrLoadText('locales/' + loc + '/system.json') ||
                      xhrLoadText('locales/' + loc + '/title.json') ||
                      xhrLoadText('locales/' + loc + '/CommonEvents.json'));
        }
        var result = declaredLocale;
        if (!hasAny(declaredLocale)) {
            var variants = [
                declaredLocale.toUpperCase(),
                declaredLocale.toLowerCase()
            ];
            var dashIdx = declaredLocale.indexOf('-');
            if (dashIdx > 0) {
                var head = declaredLocale.substring(0, dashIdx);
                var tail = declaredLocale.substring(dashIdx + 1);
                variants.push(head.toLowerCase() + '-' + tail.toUpperCase());
                variants.push(head.toUpperCase() + '-' + tail.toUpperCase());
                variants.push(head.toUpperCase() + '-' + tail.toLowerCase());
                variants.push(head.charAt(0).toUpperCase() + head.slice(1).toLowerCase() + '-' + tail.toUpperCase());
            } else {
                variants.push(declaredLocale.charAt(0).toUpperCase() + declaredLocale.slice(1).toLowerCase());
            }
            var tried = {};
            tried[declaredLocale] = true;
            for (var i = 0; i < variants.length; i++) {
                if (tried[variants[i]]) continue;
                tried[variants[i]] = true;
                if (hasAny(variants[i])) {
                    result = variants[i];
                    break;
                }
            }
        }
        __localeFolderCaseCache[declaredLocale] = result;
        if (result !== declaredLocale) {
            L('findLocaleFolderCase("' + declaredLocale + '") → "' + result + '" (case-adjusted)');
        }
        return result;
    }

    function loadLocaleData(locale) {
        // Some games (e.g., Succubus! Dark Covenant) declare locale 'en' in
        // plugins.js but ship the folder as 'EN'. On case-sensitive filesystems
        // (iOS), the exact-case probe fails. Resolve the actual folder case first.
        var actualCase = findLocaleFolderCase(locale);
        var data = _loadLocaleDataRaw(actualCase);
        L('loadLocaleData("' + locale + '") folderCase="' + actualCase + '" → ' + Object.keys(data).length + ' keys');
        return data;
    }

    // RFC 4180 CSV 解析器：支持字段内引号转义、字段内换行、UTF-8 BOM。
    // 分号分隔（DKTools_Localization 惯例）；RPG Maker 控制符（\C[n] \n \!）原样保留。
    function parseRFC4180CSV(text, locale) {
        if (!text) return null;
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

        var rows = [];
        var row = [];
        var field = '';
        var inQuotes = false;

        for (var i = 0; i < text.length; i++) {
            var c = text.charAt(i);
            if (inQuotes) {
                if (c === '"') {
                    if (text.charAt(i + 1) === '"') { field += '"'; i++; }
                    else inQuotes = false;
                } else {
                    field += c;
                }
            } else {
                if (c === '"') {
                    inQuotes = true;
                } else if (c === ';') {
                    row.push(field); field = '';
                } else if (c === '\r') {
                    // skip; \n handles EOL
                } else if (c === '\n') {
                    row.push(field); rows.push(row); row = []; field = '';
                } else {
                    field += c;
                }
            }
        }
        if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }

        if (rows.length < 2) return null;

        var header = rows[0];
        var locIdx = -1;
        // Step 1：精确匹配
        for (var h = 0; h < header.length; h++) {
            if (header[h] === locale) { locIdx = h; break; }
        }
        // Step 2：大小写不敏感匹配
        if (locIdx < 0) {
            var lc = locale.toLowerCase();
            for (var h = 0; h < header.length; h++) {
                if (header[h] && header[h].toLowerCase() === lc) { locIdx = h; break; }
            }
        }
        // Step 3：locale 别名匹配（如 zh-CN → cn/tw，解决 CSV 列名是短 locale 的情况）
        if (locIdx < 0) {
            var aliases = LOCALE_ALIASES[locale] || [];
            for (var ai = 0; ai < aliases.length && locIdx < 0; ai++) {
                var alias = aliases[ai];
                var aliasLc = alias.toLowerCase();
                for (var h = 0; h < header.length; h++) {
                    if (header[h] && (header[h] === alias || header[h].toLowerCase() === aliasLc)) {
                        locIdx = h;
                        break;
                    }
                }
            }
        }
        // Step 4：兜底第二列（通常 en）
        if (locIdx < 0) locIdx = 1;
        L('parseRFC4180CSV: locale="' + locale + '" header=[' + header.slice(0, 10).join(',') + '] → col=' + locIdx + ' ("' + (header[locIdx] || '?') + '")');

        var map = {};
        for (var r = 1; r < rows.length; r++) {
            var cols = rows[r];
            if (cols.length > locIdx && cols[0]) {
                var v = cols[locIdx].replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                map[cols[0]] = v;
            }
        }
        return map;
    }

    function _loadLocaleDataRaw(locale) {
        var data = {};
        var loaded = 0;

        var manifest = window.__ArkLocaleManifest;
        var entry = manifest && manifest[locale];

        // Phase 1：manifest 提供的 JSON 文件清单（支持目录扫描、带空格/连字符文件名）
        if (entry && entry.jsons && entry.jsons.length) {
            for (var i = 0; i < entry.jsons.length; i++) {
                var fn = entry.jsons[i];
                var jtext = xhrLoadText('locales/' + locale + '/' + fn);
                if (jtext && mergeJsonData(data, jtext, fn)) loaded++;
            }
            if (loaded > 0) {
                console.log(TAG + ' Loaded ' + loaded + ' locale files for "' + locale + '" via manifest (' + Object.keys(data).length + ' keys)');
                return data;
            }
        }

        // Phase 2：白名单枚举（兼容未扫描 manifest 的旧场景）
        var bases = [
            'System', 'CommonEvents', 'CommonEvents_C', 'CommonEvents_S',
            'Actors', 'Classes', 'Skills', 'Items', 'Weapons', 'Armors',
            'Enemies', 'Troops', 'States', 'MapInfos',
            'Map', 'Map_C', 'Map_S',
            'PlugIn', 'menu', 'CharaName', 'MapnameInMap',
            'RecollectionMode', 'Animations', 'Tilesets',
            'achievements', 'float_texts', 'hints',
            'map_events', 'notes', 'options', 'room_names',
            'scenes', 'tutorials', 'main', 'dialog', 'dialogs',
            'system', 'ui', 'interface', 'common', 'maps',
            'battle', 'quest', 'quests', 'crafting', 'shop'
        ];

        for (var i = 0; i < bases.length; i++) {
            var url1 = 'locales/' + locale + '/' + bases[i] + '_' + locale + '.json';
            var text = xhrLoadText(url1);
            if (text && mergeJsonData(data, text, bases[i])) { loaded++; continue; }

            var url2 = 'locales/' + locale + '/' + bases[i] + '.json';
            text = xhrLoadText(url2);
            if (text && mergeJsonData(data, text, bases[i])) { loaded++; }
        }

        // Phase 3：CSV 加载（manifest 全局 CSV 优先 → 标准 fallback 路径）
        if (loaded === 0) {
            var csvText = null;
            if (manifest && manifest._globalCsv) csvText = xhrLoadText(manifest._globalCsv);
            if (!csvText) csvText = xhrLoadText('locales/' + locale + '/' + locale + '.csv');
            if (!csvText) csvText = xhrLoadText('locales/' + locale + '.csv');
            if (csvText) {
                var parsed = parseRFC4180CSV(csvText, locale);
                if (parsed) {
                    var keys = Object.keys(parsed);
                    for (var k = 0; k < keys.length; k++) {
                        data[keys[k]] = parsed[keys[k]];
                    }
                    loaded = keys.length;
                }
            }
        }

        if (loaded > 0) {
            console.log(TAG + ' Loaded ' + loaded + ' locale files for "' + locale + '" (' + Object.keys(data).length + ' keys)');
        }
        return data;
    }

    function translateText(text) {
        if (text == null) return text;
        text = String(text);
        if (text.length < 3 || !__locData) return text;

        if (__locCache[text]) return __locCache[text].text;

        var initialText = text;
        var needCache = false;
        var variables = [];

        var varReplace = function(t) {
            return t.replace(REGEX_VAR, function(s, m) {
                var id = Number(m);
                variables.push(id);
                needCache = true;
                return $gameVariables ? $gameVariables.value(id) : '';
            });
        };

        var textReplace = function(t) {
            return t.replace(REGEX_TAG, function(s, m) {
                if (__locData.hasOwnProperty(m)) {
                    needCache = true;
                    return __locData[m];
                }
                return m;
            });
        };

        for (var i = 0; i < PARSE_DEPTH; i++) {
            var temp = text;
            text = varReplace(text);
            text = textReplace(text);
            text = varReplace(text);
            if (!needCache && text === temp) break;
        }

        if (needCache && initialText.length >= 20) {
            __locCache[initialText] = { text: text, variables: variables };
        }

        return text;
    }

    function markPretranslatedMessageLine(text) {
        if (text == null) return;
        text = String(text);
        __pretranslatedMessageLines.push(text);
        if (__pretranslatedMessageLines.length > 256) {
            __pretranslatedMessageLines.splice(0, __pretranslatedMessageLines.length - 256);
        }
    }

    function consumePretranslatedMessageLine(text) {
        if (text == null || __pretranslatedMessageLines.length === 0) return false;
        text = String(text);
        var index = __pretranslatedMessageLines.indexOf(text);
        if (index < 0) return false;
        __pretranslatedMessageLines.splice(index, 1);
        return true;
    }

    function shouldLogStandingPictureTranslation(raw, translated) {
        if (__standingPictureDiagCount >= 40) return false;
        raw = raw == null ? '' : String(raw);
        translated = translated == null ? '' : String(translated);
        return raw.indexOf('day1_mainstory_0001') >= 0 ||
            raw.indexOf('{day') >= 0 && /\\(?:F|FF|FFF|FFFF|SK|SSK|SSSK|SSSSK|SA|SSA|SSSA|SSSSA)\[/.test(translated) ||
            /\\(?:F|FF|FFF|FFFF)\[/.test(translated) && /\\(?:SK|SSK|SSSK|SSSSK)\[/.test(translated);
    }

    function logStandingPictureTranslation(source, raw, translated) {
        if (!shouldLogStandingPictureTranslation(raw, translated)) return;
        __standingPictureDiagCount++;
        L('StandingPicture pretranslate #' + __standingPictureDiagCount +
          ' source=' + source +
          ' raw=' + JSON.stringify(String(raw).slice(0, 120)) +
          ' translated=' + JSON.stringify(String(translated).slice(0, 180)));
    }

    function pretranslateMessageLine(raw, source) {
        if (typeof raw !== 'string') return raw;
        var translated = translateText(raw);
        if (translated !== raw) {
            markPretranslatedMessageLine(translated);
            logStandingPictureTranslation(source, raw, translated);
        }
        return translated;
    }

    function installCommand101PreTranslationHook() {
        if (typeof Game_Interpreter === 'undefined' || !Game_Interpreter.prototype.command101) return false;
        if (Game_Interpreter.prototype.command101._arkDKLocCommand101Wrapper) return true;

        var _orig_command101 = Game_Interpreter.prototype.command101;
        var wrapped = function() {
            var list = this._list;
            if (list) {
                var idx = this._index + 1;
                while (idx < list.length && list[idx] && list[idx].code === 401) {
                    var params = list[idx].parameters;
                    if (params && typeof params[0] === 'string') {
                        var raw = params[0];
                        var translated = pretranslateMessageLine(raw, 'command101');
                        if (translated !== raw) {
                            params[0] = translated;
                        }
                    }
                    idx++;
                }
            }
            return _orig_command101.apply(this, arguments);
        };
        wrapped._arkDKLocCommand101Wrapper = true;
        wrapped._arkDKLocCommand101Original = _orig_command101;
        Game_Interpreter.prototype.command101 = wrapped;
        L('Game_Interpreter.command101 pre-translation hook installed');
        return true;
    }

    function installMessageStartPreTranslationHook() {
        if (typeof Window_Message === 'undefined' || !Window_Message.prototype.startMessage) return false;
        if (Window_Message.prototype.startMessage._arkDKLocStartMessageWrapper) return true;

        var _orig_startMessage = Window_Message.prototype.startMessage;
        var wrapped = function() {
            try {
                if (typeof $gameMessage !== 'undefined' && $gameMessage && Array.isArray($gameMessage._texts)) {
                    for (var i = 0; i < $gameMessage._texts.length; i++) {
                        if (typeof $gameMessage._texts[i] === 'string') {
                            $gameMessage._texts[i] = pretranslateMessageLine($gameMessage._texts[i], 'startMessage');
                        }
                    }
                }
            } catch (e) {
                L('Window_Message.startMessage pre-translation failed: ' + (e && e.message));
            }
            return _orig_startMessage.apply(this, arguments);
        };
        wrapped._arkDKLocStartMessageWrapper = true;
        wrapped._arkDKLocStartMessageOriginal = _orig_startMessage;
        Window_Message.prototype.startMessage = wrapped;
        L('Window_Message.startMessage pre-translation hook installed');
        return true;
    }

    // Load locale data first, resolve fallbacks, THEN install stub
    __locData = loadLocaleData(__locale);

    // Strategy C: stale localStorage entry from a prior buggy scene build
    // (e.g., bare "zh" saved when the real folder is "cn"/"zh-CN") will load
    // 0 keys here. If __locale came from saved and produced no data, discard
    // the saved value and re-resolve from the actual system language before
    // entering the fallback chain.
    var __savedLocaleAtLoad = saved;
    if ((!__locData || Object.keys(__locData).length === 0) &&
        saved && __locale === saved) {
        L('init: saved locale "' + saved + '" loaded 0 keys — discarding, re-resolving from navigator');
        try { localStorage.removeItem(LOCALE_KEY); } catch (e) {}
        __locale = resolveLocale(navigator.language);
        __locData = loadLocaleData(__locale);
    }

    if (!__locData || Object.keys(__locData).length === 0) {
        // Fallback chain: first try locale aliases (incl. cross-family like zh-CN → tw),
        // then a broad list of common locales. English is intentionally last so that
        // a Chinese-system user prefers tw (Traditional) over en when the game has no cn.
        var others = ['jp', 'ja', 'kr', 'ko', 'es', 'esp', 'fr', 'ru', 'ptbr', 'pt-BR', 'it', 'de', 'vi-VN', 'vi', 'en'];
        var fallbacks = (LOCALE_ALIASES[__locale] || []).concat(others);
        L('init: __locData empty, trying fallbacks=[' + fallbacks.join(',') + ']');
        for (var fi = 0; fi < fallbacks.length; fi++) {
            if (fallbacks[fi] === __locale) continue;
            var tryData = loadLocaleData(fallbacks[fi]);
            var tryKeys = tryData ? Object.keys(tryData).length : 0;
            if (tryData && tryKeys > 0) {
                __locale = fallbacks[fi];
                __locData = tryData;
                L('init: FALLBACK HIT → __locale="' + __locale + '" (' + tryKeys + ' keys)');
                break;
            }
        }
        if (!__locData || Object.keys(__locData).length === 0) {
            L('init: NO FALLBACK HIT — game will run without translation');
        }
    }

    // Self-heal localStorage: if final locale differs from what was saved and
    // we actually have data, persist the resolved locale so subsequent launches
    // skip the fallback chain entirely.
    if (__locData && Object.keys(__locData).length > 0 &&
        __savedLocaleAtLoad !== undefined && __locale !== __savedLocaleAtLoad) {
        try {
            localStorage.setItem(LOCALE_KEY, __locale);
            L('init: localStorage["' + LOCALE_KEY + '"] updated "' + __savedLocaleAtLoad + '" → "' + __locale + '"');
        } catch (e) {
            L('init: localStorage update failed: ' + (e && e.message));
        }
    }

    // --- LocalizationParam stub ---
    // YEP_OptionsCore eval's `LocalizationParam.get('Show Options Command')` etc.
    // Since DKTools_Localization is disabled, provide a minimal stub.
    window.LocalizationParam = {
        get: function(key) {
            if (key === 'Show Options Command') return false;
            return undefined;
        }
    };

    // --- DKTools.Localization stub ---
    // DKTools.js does `window.DKTools = {};` which overwrites any existing DKtools.
    // Use Object.defineProperty to intercept the assignment and inject Localization.
    (function installLocalizationStub() {
        var _dktoolsVal;
        var _installed = false;

        // Localization stub — uses closure over __locale / __locData so locale
        // fallback updates are automatically reflected without patching the object.
        var locObj = {};
        Object.defineProperty(locObj, 'locale', {
            get: function() { return __locale; },
            configurable: true
        });
        Object.defineProperty(locObj, 'language', {
            get: function() { return __locale; },
            configurable: true
        });
        Object.defineProperty(locObj, 'languages', {
            get: function() { return [__locale]; },
            configurable: true
        });
        Object.defineProperty(locObj, 'locales', {
            get: function() { return probeAvailableLocales(); },
            configurable: true
        });
        locObj._locale = __locale;
        locObj._data = __locData;
        locObj._isReady = true;
        locObj.getLanguageByLocale = function(loc) { return getLocaleDisplayName(loc); };
        locObj.getPrimaryLocale = function() {
            var params = loadDKToolsParams();
            if (params && params.Languages) {
                for (var i = 0; i < params.Languages.length; i++) {
                    var lang = params.Languages[i];
                    if (lang && lang.Primary === 'true') return lang.Locale || null;
                }
            }
            return null;
        };
        locObj.getPrimaryLanguage = function() {
            var params = loadDKToolsParams();
            if (params && params.Languages) {
                for (var i = 0; i < params.Languages.length; i++) {
                    var lang = params.Languages[i];
                    if (lang && lang.Primary === 'true') return lang.Language || null;
                }
            }
            return null;
        };
        locObj.getText = function(text) { return translateText(text); };
        locObj.selectLocale = function(loc) {
            L('selectLocale("' + loc + '") called, prev=__locale="' + __locale + '"');
            if (!loc) return Promise.resolve();
            var prev = __locale;
            __locale = loc;
            this._locale = loc;
            try {
                localStorage.setItem(LOCALE_KEY, loc);
                localStorage.setItem(LOCALE_KEY + '_userSelected', 'true');
            } catch(e) {}
            __availableLocales = null;
            probeAvailableLocales();
            __locData = loadLocaleData(loc);
            this._data = __locData;
            __locCache = {};
            L('selectLocale: __locData now has ' + Object.keys(__locData).length + ' keys');
            if (__localeListeners.length && prev !== loc) {
                for (var i = 0; i < __localeListeners.length; i++) {
                    try { __localeListeners[i](prev, loc); } catch(e) {}
                }
            }
            return Promise.resolve();
        };
        locObj.addChangeLocaleListener = function(fn) {
            if (typeof fn === 'function') __localeListeners.push(fn);
        };

        function ensureLocalization(val) {
            if (!val || val.Localization) return;
            val.Localization = locObj;
            if (!_installed) {
                L('DKTools.Localization stub installed (locale="' + __locale + '", locDataKeys=' + Object.keys(__locData || {}).length + ')');
                _installed = true;
            }
        }

        Object.defineProperty(window, 'DKTools', {
            get: function() { return _dktoolsVal; },
            set: function(val) {
                _dktoolsVal = val;
                ensureLocalization(val);
            },
            configurable: true,
            enumerable: true
        });

        // In case DKTools was already defined (shouldn't happen at atDocumentStart)
        if (window.DKTools && typeof window.DKTools === 'object') {
            _dktoolsVal = window.DKTools;
            ensureLocalization(window.DKTools);
        }
    })();

    // --- Text translation hooks ---

    function installHooks() {
        var _orig_bitmapDrawText = Bitmap.prototype.drawText;
        Bitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align) {
            _orig_bitmapDrawText.call(this, translateText(text), x, y, maxWidth, lineHeight, align);
        };

        installCommand101PreTranslationHook();
        installMessageStartPreTranslationHook();

        if (typeof TextManager !== 'undefined' && TextManager.basic) {
            var _orig_tm_basic = TextManager.basic;
            TextManager.basic = function(id) {
                return translateText(_orig_tm_basic.apply(this, arguments));
            };
        }

        if (typeof TextManager !== 'undefined' && TextManager.param) {
            var _orig_tm_param = TextManager.param;
            TextManager.param = function(id) {
                return translateText(_orig_tm_param.apply(this, arguments));
            };
        }

        if (typeof TextManager !== 'undefined' && TextManager.command) {
            var _orig_tm_command = TextManager.command;
            TextManager.command = function(id) {
                return translateText(_orig_tm_command.apply(this, arguments));
            };
        }

        if (typeof TextManager !== 'undefined' && TextManager.message) {
            var _orig_tm_message = TextManager.message;
            TextManager.message = function(id) {
                return translateText(_orig_tm_message.apply(this, arguments));
            };
        }

        var _inCompatEscapeHook = false;
        var _orig_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
        Window_Base.prototype.convertEscapeCharacters = function(text) {
            if (_inCompatEscapeHook) {
                return _orig_convertEscapeCharacters.call(this, text);
            }
            _inCompatEscapeHook = true;
            try {
                var translated = consumePretranslatedMessageLine(text) ? text : translateText(text);
                return Window_Base.prototype.convertEscapeCharacters.call(this, translated);
            } finally {
                _inCompatEscapeHook = false;
            }
        };

        var _orig_drawTextEx = Window_Base.prototype.drawTextEx;
        Window_Base.prototype.drawTextEx = function(text, x, y) {
            return _orig_drawTextEx.call(this, translateText(text), x, y);
        };

        var _orig_textWidth = Window_Base.prototype.textWidth;
        Window_Base.prototype.textWidth = function(text) {
            return _orig_textWidth.call(this, translateText(text));
        };

        var _orig_actorName = Window_Base.prototype.actorName;
        Window_Base.prototype.actorName = function(n) {
            return translateText(_orig_actorName.call(this, n));
        };

        var _orig_partyMemberName = Window_Base.prototype.partyMemberName;
        Window_Base.prototype.partyMemberName = function(n) {
            return translateText(_orig_partyMemberName.call(this, n));
        };

        if (typeof Window_Command !== 'undefined') {
            var _orig_commandName = Window_Command.prototype.commandName;
            Window_Command.prototype.commandName = function(index) {
                return translateText(_orig_commandName.call(this, index));
            };
        }

        // Window_Base.prototype.wrapText polyfill
        // 原版由 DKTools_Localization.js 提供，被 Lunatlazur_BackLog / ChimakiMsgSkin_MV 等插件调用。
        if (typeof Window_Base !== 'undefined' && typeof Window_Base.prototype.wrapText !== 'function') {
            Window_Base.prototype.wrapText = function(text, maxWidth) {
                if (!text) return "";
                var locale = (typeof DKTools !== 'undefined' && DKTools.Localization && DKTools.Localization.locale) || 'en';
                var isCJK = /^(tw|cn|jp|zh|ja)/i.test(locale);

                var result = "";
                var currentLine = "";
                var currentWidth = 0;
                var lineHasVisibleContent = false;

                var regex = /(\x1b[a-zA-Z]+\[[^\]]*\]|\\+(?:[a-zA-Z]+\[[^\]]*\]|[!.\^]|[{}]))|(\n)|([^\s\\-]+)|(-)|([\s\S])/gi;
                var match;
                while ((match = regex.exec(text)) !== null) {
                    var token = match[0];
                    var isControlCode = !!match[1];
                    var isNewLine = !!match[2];
                    var isWord = !!match[3];

                    if (isNewLine) {
                        result += currentLine + "\n";
                        currentLine = "";
                        currentWidth = 0;
                        lineHasVisibleContent = false;
                        continue;
                    }

                    var tokenWidth = 0;
                    var isVisible = true;
                    if (isControlCode) {
                        if (/^\\I\[/i.test(token)) {
                            tokenWidth = Window_Base._iconWidth || 32;
                        } else {
                            tokenWidth = 0;
                            isVisible = false;
                        }
                    } else {
                        tokenWidth = this.textWidth(token);
                        if (token === " ") isVisible = false;
                    }

                    var spaceWidth = 0;
                    var needsSpace = false;
                    if (!isCJK && isWord && lineHasVisibleContent) {
                        var cleanLine = currentLine.replace(/(?:\x1b[a-zA-Z]+\[[^\]]*\]|\\+(?:[a-zA-Z]+\[[^\]]*\]|[!.\^]|[{}]))+$/gi, "");
                        if (cleanLine.length > 0) {
                            var lastChar = cleanLine.slice(-1);
                            if (lastChar !== " " && lastChar !== "-") {
                                needsSpace = true;
                                spaceWidth = this.textWidth(" ");
                            }
                        }
                    }

                    if (currentWidth + spaceWidth + tokenWidth > maxWidth) {
                        if (currentLine.length > 0) {
                            result += currentLine.replace(/\s+$/, "") + "\n";
                            if (token === " ") {
                                currentLine = "";
                                currentWidth = 0;
                                lineHasVisibleContent = false;
                            } else {
                                currentLine = token;
                                currentWidth = tokenWidth;
                                lineHasVisibleContent = isVisible;
                            }
                        } else {
                            result += token + "\n";
                            currentLine = "";
                            currentWidth = 0;
                            lineHasVisibleContent = false;
                        }
                    } else {
                        if (needsSpace) {
                            currentLine += " ";
                            currentWidth += spaceWidth;
                        }
                        currentLine += token;
                        currentWidth += tokenWidth;
                        if (isVisible) lineHasVisibleContent = true;
                    }
                }
                result += currentLine;
                return result;
            };
            L('Window_Base.prototype.wrapText polyfill installed');
        }

        L('Hooks installed');
    }

    L('BOOT SUMMARY: __locale="' + __locale + '", __locData keys=' + Object.keys(__locData || {}).length);
    try {
        var _bootSaved = localStorage.getItem(LOCALE_KEY);
        var _bootParams = loadDKToolsParams();
        var _bootAvail = probeAvailableLocales();
        L('BOOT SUMMARY: savedLocale=' + JSON.stringify(_bootSaved) +
          ', plugins.FirstLaunch=' + _bootParams['First Launch'] +
          ', plugins.LanguagesCount=' + (_bootParams['Languages'] || []).length +
          ', probedLocales=[' + _bootAvail.join(',') + ']');
    } catch(e) { L('BOOT SUMMARY: error ' + (e && e.message)); }

    if (__locData && Object.keys(__locData).length > 0) {
        if (typeof Window_Base !== 'undefined') {
            installHooks();
        } else {
            var _hookInterval = setInterval(function() {
                if (typeof Window_Base !== 'undefined' && typeof Window_Command !== 'undefined') {
                    clearInterval(_hookInterval);
                    installHooks();
                }
            }, 50);
        }
        var _command101HookAttempts = 0;
        var _command101HookInterval = setInterval(function() {
            _command101HookAttempts++;
            installCommand101PreTranslationHook();
            installMessageStartPreTranslationHook();
            if (_command101HookAttempts > 80) {
                clearInterval(_command101HookInterval);
            }
        }, 250);
    } else {
        L('WARNING: no locale data loaded for "' + __locale + '" — text translation will be a no-op');
    }

    // --- Scene_SelectLanguage ---
    // 在原生 DKTools_Localization 被禁用的情况下，自行实现一个轻量级语言选择场景。
    // 触发条件：localStorage 中无 'RPG Locale' 且可用语言数 > 1（Scene_Title.create 时检查）。
    // 选择完毕后：写入 localStorage、调用 selectLocale 重新加载 locale JSON、清空翻译缓存、pop 回标题。
    function installLanguageScene() {
        if (typeof Scene_Base === 'undefined' || typeof Scene_Title === 'undefined' ||
            typeof Window_Command === 'undefined' || typeof SceneManager === 'undefined' ||
            typeof Window_Help === 'undefined') {
            L('installLanguageScene: waiting for MV classes (Scene_Base=' + (typeof Scene_Base) + ', Scene_Title=' + (typeof Scene_Title) + ', Window_Command=' + (typeof Window_Command) + ', SceneManager=' + (typeof SceneManager) + ', Window_Help=' + (typeof Window_Help) + ')');
            return false;
        }
        if (window.__dkLocLangSceneInstalled) return true;
        window.__dkLocLangSceneInstalled = true;

        function Scene_SelectLanguage() {
            this.initialize.apply(this, arguments);
        }
        Scene_SelectLanguage.prototype = Object.create(Scene_Base.prototype);
        Scene_SelectLanguage.prototype.constructor = Scene_SelectLanguage;

        Scene_SelectLanguage.prototype.initialize = function() {
            Scene_Base.prototype.initialize.call(this);
        };

        Scene_SelectLanguage.prototype.create = function() {
            Scene_Base.prototype.create.call(this);
            this.createWindowLayer();
            this.createHelpWindow();
            this.createLanguageWindow();
        };

        Scene_SelectLanguage.prototype.createHelpWindow = function() {
            this._helpWindow = new Window_Help(2);
            this._helpWindow.setText('Please select a language\n请选择语言 / 言語を選択');
            this.addWindow(this._helpWindow);
        };

        Scene_SelectLanguage.prototype.createLanguageWindow = function() {
            this._languageWindow = new Window_LanguageList(this._helpWindow);
            this._languageWindow.setHandler('ok', this.onLanguageOk.bind(this));
            this._languageWindow.setHandler('cancel', this.onLanguageCancel.bind(this));
            this.addWindow(this._languageWindow);
        };

        Scene_SelectLanguage.prototype.start = function() {
            Scene_Base.prototype.start.call(this);
            var idx = this._languageWindow.findExt(__locale);
            if (idx >= 0) this._languageWindow.select(idx);
        };

        Scene_SelectLanguage.prototype.onLanguageOk = function() {
            var locale = this._languageWindow.currentExt();
            this._languageWindow.close();
            this.fadeOutAll();
            var self = this;
            setTimeout(function() {
                if (locale && window.DKTools && window.DKTools.Localization) {
                    window.DKTools.Localization.selectLocale(locale);
                }
                SceneManager.pop();
            }, self.fadeSpeed() * 4);
        };

        Scene_SelectLanguage.prototype.onLanguageCancel = function() {
            this._languageWindow.close();
            this.fadeOutAll();
            setTimeout(function() { SceneManager.pop(); }, this.fadeSpeed() * 4);
        };

        function Window_LanguageList() {
            this.initialize.apply(this, arguments);
        }
        Window_LanguageList.prototype = Object.create(Window_Command.prototype);
        Window_LanguageList.prototype.constructor = Window_LanguageList;

        Window_LanguageList.prototype.initialize = function(helpWindow) {
            this._helpWindow = helpWindow || null;
            Window_Command.prototype.initialize.call(this, 0, 0);
            this.updatePlacement();
        };

        Window_LanguageList.prototype.updatePlacement = function() {
            this.x = Math.floor((Graphics.boxWidth - this.width) / 2);
            this.y = Math.floor((Graphics.boxHeight - this.height) / 2);
        };

        Window_LanguageList.prototype.windowWidth = function() {
            return 360;
        };

        Window_LanguageList.prototype.windowHeight = function() {
            var rows = Math.min(this.maxItems(), 8);
            return rows * this.lineHeight() + this.standardPadding() * 2;
        };

        Window_LanguageList.prototype.makeCommandList = function() {
            var locales = probeAvailableLocales();
            for (var i = 0; i < locales.length; i++) {
                this.addCommand(getLocaleDisplayName(locales[i]), 'ok', true, locales[i]);
            }
        };

        Window_LanguageList.prototype.itemTextAlign = function() {
            return 'center';
        };

        Window_LanguageList.prototype.updateHelp = function() {
            if (this._helpWindow) {
                var locale = this.currentExt();
                this._helpWindow.setText(getLocaleDisplayName(locale) + '  [' + (locale || '') + ']');
            }
        };

        window.Scene_SelectLanguage = Scene_SelectLanguage;
        window.Window_LanguageList = Window_LanguageList;

        function shouldShowLanguageScene() {
            var saved;
            try { saved = localStorage.getItem(LOCALE_KEY); } catch(e) {}
            if (saved) { L('shouldShowLanguageScene → FALSE (saved locale exists: "' + saved + '")'); return false; }
            var availCount = probeAvailableLocales().length;
            if (availCount <= 1) { L('shouldShowLanguageScene → FALSE (only ' + availCount + ' available locale)'); return false; }
            var params = loadDKToolsParams();
            var fl = !!params['First Launch'];
            L('shouldShowLanguageScene → ' + fl.toString().toUpperCase() + ' (First Launch=' + params['First Launch'] + ', available=' + availCount + ')');
            return fl;
        }

        var _orig_Scene_Title_create = Scene_Title.prototype.create;
        Scene_Title.prototype.create = function() {
            _orig_Scene_Title_create.apply(this, arguments);
            var shown = !!window.__dkLocLangShown;
            var should = shouldShowLanguageScene();
            L('Scene_Title.create hook fired: shouldShow=' + should + ' alreadyShown=' + shown);
            if (should && !shown) {
                window.__dkLocLangShown = true;
                L('Scene_Title.create hook → SceneManager.push(Scene_SelectLanguage)');
                SceneManager.push(Scene_SelectLanguage);
            }
        };

        L('Scene_SelectLanguage installed');
        return true;
    }

    var _langSceneInterval = setInterval(function() {
        if (installLanguageScene()) {
            clearInterval(_langSceneInterval);
        }
    }, 50);

    // Safety: stop trying after 30s
    setTimeout(function() {
        if (_langSceneInterval) clearInterval(_langSceneInterval);
    }, 30000);
})();


/* === compat_drill_layer_tiled_gif.js === */
// Drill_LayerTiledGif: invalidate PIXI's cached CanvasPattern when a GIF frame changes.

(function() {
    'use strict';

    var retries = 0;

    function enabledPlugin(name) {
        return Array.isArray(window.$plugins) && window.$plugins.some(function(plugin) {
            return plugin && plugin.name === name && plugin.status === true;
        });
    }

    function install() {
        if (!enabledPlugin('Drill_LayerTiledGif') ||
            typeof TilingSprite === 'undefined') {
            retries++;
            if (retries <= 400) setTimeout(install, 50);
            return;
        }

        var prototype = TilingSprite.prototype;
        if (prototype.__ark_LTGCanvasPatternFix) return;

        var descriptor = Object.getOwnPropertyDescriptor(prototype, 'bitmap');
        if (!descriptor || typeof descriptor.get !== 'function' ||
            typeof descriptor.set !== 'function' || descriptor.configurable !== true) {
            console.warn('[Compat][Drill_LayerTiledGif] bitmap setter unavailable');
            return;
        }

        Object.defineProperty(prototype, 'bitmap', {
            configurable: descriptor.configurable,
            enumerable: descriptor.enumerable,
            get: descriptor.get,
            set: function(value) {
                var changed = this._bitmap !== value;
                descriptor.set.call(this, value);

                // PIXI v4 Canvas TilingSprite caches a CanvasPattern forever,
                // even after RPG Maker replaces texture.baseTexture for a new
                // Bitmap. Drill's GIF sprites are identified by their private
                // frame array, so ordinary TilingSprites remain untouched.
                if (changed && Array.isArray(this._drill_src_bitmaps)) {
                    this._canvasPattern = null;
                }
            }
        });

        Object.defineProperty(prototype, '__ark_LTGCanvasPatternFix', {
            configurable: true,
            value: true
        });
        console.log('[Compat][Drill_LayerTiledGif] Canvas pattern invalidation installed');
    }

    install();
})();


/* === compat_galv_quest_log.js === */
// Galv.QUEST Safety Stubs
// Fix for: Galv.QUEST.* is not a function errors
// Some games call Galv.QUEST methods in events before the
// Galv_QuestLog plugin has fully initialized. This creates safe stubs for all methods.
// Trigger: game plugins.js contains Galv_QuestLog

(function() {
    var retries = 0;
    var dataManagerRetries = 0;
    var sceneRetries = 0;

    function ensureQuestState() {
        if (typeof $gameSystem === 'undefined' || !$gameSystem) return null;

        var state = $gameSystem._quests;
        if (!state || typeof state !== 'object' || Array.isArray(state)) {
            state = {};
            $gameSystem._quests = state;
        }

        if (!Object.prototype.hasOwnProperty.call(state, 'tracked')) state.tracked = null;
        if (!state.quest || typeof state.quest !== 'object' || Array.isArray(state.quest)) state.quest = {};
        if (!Array.isArray(state.active)) state.active = [];
        if (!Array.isArray(state.completed)) state.completed = [];
        if (!Array.isArray(state.failed)) state.failed = [];

        if (!state.categoryHide || typeof state.categoryHide !== 'object' || Array.isArray(state.categoryHide)) {
            state.categoryHide = {};
        }
        if (!Array.isArray(state.categoryHide.active)) state.categoryHide.active = [];
        if (!Array.isArray(state.categoryHide.completed)) state.categoryHide.completed = [];
        if (!Array.isArray(state.categoryHide.failed)) state.categoryHide.failed = [];
        if (!Array.isArray(state.categoryActive)) state.categoryActive = [];

        var categoryCount = 0;
        if (typeof Galv !== 'undefined' && Galv.QUEST && Array.isArray(Galv.QUEST.categories)) {
            categoryCount = Galv.QUEST.categories.length;
        }
        for (var i = 0; i < categoryCount; i++) {
            if (typeof state.categoryActive[i] === 'undefined') state.categoryActive[i] = true;
        }

        return state;
    }

    function patchDataManager() {
        if (typeof DataManager === 'undefined' || typeof DataManager.extractSaveContents !== 'function') {
            dataManagerRetries++;
            if (dataManagerRetries <= 100) setTimeout(patchDataManager, 100);
            return;
        }
        if (DataManager.extractSaveContents.__arkGalvQuestMigration) return;

        var originalExtractSaveContents = DataManager.extractSaveContents;
        var patchedExtractSaveContents = function(contents) {
            var result = originalExtractSaveContents.apply(this, arguments);
            ensureQuestState();
            return result;
        };
        patchedExtractSaveContents.__arkGalvQuestMigration = true;
        DataManager.extractSaveContents = patchedExtractSaveContents;
        ensureQuestState();
    }

    function patchQuestScene() {
        if (typeof Scene_QuestLog === 'undefined' ||
            !Scene_QuestLog.prototype ||
            typeof Scene_QuestLog.prototype.create !== 'function') {
            sceneRetries++;
            if (sceneRetries <= 100) setTimeout(patchQuestScene, 100);
            return;
        }
        if (Scene_QuestLog.prototype.create.__arkGalvQuestMigration) return;

        var originalCreate = Scene_QuestLog.prototype.create;
        var patchedCreate = function() {
            ensureQuestState();
            return originalCreate.apply(this, arguments);
        };
        patchedCreate.__arkGalvQuestMigration = true;
        Scene_QuestLog.prototype.create = patchedCreate;
    }

    function patchGalvQuest() {
        if (typeof Galv === 'undefined' || typeof Galv.QUEST === 'undefined') {
            retries++;
            if (retries > 100) {
                console.warn('[GalvQuestSafety] Galv.QUEST not found after 10s, giving up');
                return;
            }
            setTimeout(patchGalvQuest, 100);
            return;
        }

        var quests = Galv.QUEST;

        if (typeof quests.viewLog !== 'function') {
            quests.viewLog = function() {
                console.log('[GalvQuestSafety] viewLog called but Scene_QuestLog not available');
            };
        }

        if (typeof quests.catStatus !== 'function') {
            quests.catStatus = function(id, status) {
                var state = ensureQuestState();
                if (state) state.categoryActive[id] = status;
            };
        }

        if (typeof quests.activate !== 'function') {
            quests.activate = function(id, hidePopup) {
                if (typeof $gameSystem !== 'undefined' && $gameSystem._quests && $gameSystem._quests.quest[id]) {
                    $gameSystem._quests.quest[id]._status = 0;
                }
            };
        }

        if (typeof quests.complete !== 'function') {
            quests.complete = function(id, hidePopup) {
                if (typeof $gameSystem !== 'undefined' && $gameSystem._quests && $gameSystem._quests.quest[id]) {
                    $gameSystem._quests.quest[id]._status = 1;
                }
            };
        }

        if (typeof quests.fail !== 'function') {
            quests.fail = function(id, hidePopup) {
                if (typeof $gameSystem !== 'undefined' && $gameSystem._quests && $gameSystem._quests.quest[id]) {
                    $gameSystem._quests.quest[id]._status = 2;
                }
            };
        }

        if (typeof quests.track !== 'function') {
            quests.track = function(id) {
                var state = ensureQuestState();
                if (state) state.tracked = id;
            };
        }

        if (typeof quests.isTracked !== 'function') {
            quests.isTracked = function() {
                if (typeof $gameSystem !== 'undefined' && $gameSystem._quests) {
                    return $gameSystem._quests.tracked || 0;
                }
                return 0;
            };
        }

        if (typeof quests.objective !== 'function') {
            quests.objective = function(id, objId, status) {
                if (typeof $gameSystem !== 'undefined' && $gameSystem._quests && $gameSystem._quests.quest[id]) {
                    $gameSystem._quests.quest[id]._objectives[objId] = status;
                }
            };
        }

        if (typeof quests.status !== 'function') {
            quests.status = function(id) {
                if (typeof $gameSystem !== 'undefined' && $gameSystem._quests && $gameSystem._quests.quest[id]) {
                    return $gameSystem._quests.quest[id]._status;
                }
                return -1;
            };
        }

        if (typeof quests.resolution !== 'function') {
            quests.resolution = function(id, index) {
                if (typeof $gameSystem !== 'undefined' && $gameSystem._quests && $gameSystem._quests.quest[id]) {
                    $gameSystem._quests.quest[id]._resolution = index;
                }
            };
        }

        if (typeof quests.removeQuest !== 'function') {
            quests.removeQuest = function(id) {
                if (typeof $gameSystem !== 'undefined' && $gameSystem._quests && $gameSystem._quests.quest[id]) {
                    $gameSystem._quests.quest[id]._status = -1;
                }
            };
        }

        console.log('[GalvQuestSafety] Galv.QUEST safety stubs applied');
    }

    patchGalvQuest();
    patchDataManager();
    patchQuestScene();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', patchGalvQuest);
        document.addEventListener('DOMContentLoaded', patchDataManager);
        document.addEventListener('DOMContentLoaded', patchQuestScene);
    }
})();


/* === compat_kns_talk_portrait.js === */
// KNS_TalkPortrait compatibility for ArkRPG/WKWebView.
//
// The packaged KNS Vue portrait component probes png/webp/jpg/jpeg candidates
// through fs.existsSync on every render. For encrypted KNS assets, a synchronous
// probe can read and decrypt the complete file. Cache only immutable portrait
// paths, and only while the full KNS Vue dialogue stack is enabled.

(function() {
    'use strict';

    if (location.protocol !== 'rpgmz:' || typeof window.require !== 'function') return;

    var fs;
    try {
        fs = window.require('fs');
    } catch (error) {
        return;
    }
    if (!fs || typeof fs.existsSync !== 'function' || fs.existsSync.__arkKNSTalkPortraitCompat) {
        return;
    }

    var originalExistsSync = fs.existsSync;
    var existsCache = Object.create(null);
    var activation;

    function hasEnabledPlugin(name) {
        if (!Array.isArray(window.$plugins)) return false;
        return window.$plugins.some(function(plugin) {
            return plugin && plugin.name === name && plugin.status === true;
        });
    }

    function isCompatibleStackEnabled() {
        if (!Array.isArray(window.$plugins)) return false;
        if (activation === undefined) {
            activation = hasEnabledPlugin('KNS_VueUI') &&
                hasEnabledPlugin('KNS_HtmlMessage') &&
                hasEnabledPlugin('KNS_TalkPortrait');
        }
        return activation;
    }

    function portraitCacheKey(path) {
        var normalized = String(path == null ? '' : path)
            .replace(/\\/g, '/')
            .replace(/[?#].*$/, '')
            .replace(/^.*www\//i, '')
            .replace(/^\.\//, '')
            .replace(/^\//, '');
        if (normalized.split('/').indexOf('..') !== -1) return null;
        if (!/^img\/pictures\/portraits\//i.test(normalized)) return null;
        return normalized;
    }

    function compatibleExistsSync(path) {
        if (!isCompatibleStackEnabled()) {
            return originalExistsSync.apply(this, arguments);
        }

        var key = portraitCacheKey(path);
        if (key === null) {
            return originalExistsSync.apply(this, arguments);
        }
        if (Object.prototype.hasOwnProperty.call(existsCache, key)) {
            return existsCache[key];
        }

        var exists = originalExistsSync.apply(this, arguments);
        existsCache[key] = exists;
        return exists;
    }

    compatibleExistsSync.__arkKNSTalkPortraitCompat = true;
    fs.existsSync = compatibleExistsSync;
    console.log('[Compat][KNS_TalkPortrait] portrait existsSync cache installed');
})();


/* === compat_pdx_keybindings_remap.js === */
// compat_PDX_KeybindingsRemap.js
// Compatibility fix for the PDX_KeybindingsRemap plugin (used in Didnapper2 etc.)
//
// Problem:
//   PDX_KeybindingsRemap completely rewrites Input state management:
//   - _currentState entries are { state, pressedTime, lastPressed } OBJECTS, not booleans
//   - Input.isTriggered/isPressed read `.state` and `.pressedTime` from these objects
//   - InputBridge.press() from common_input.js writes _currentState[name] = true (boolean)
//   - true.state === undefined → isTriggered/isPressed always return false → ALL input broken
//
// Fix:
//   Patch InputBridge.press / InputBridge.release to call Input._updateCurrentState()
//   (added by PDX_KeybindingsRemap) at call-time, writing the correct object format.
//   Falls back to the standard boolean format if _updateCurrentState is not available
//   (i.e., PDX_KeybindingsRemap hasn't loaded yet, or game runs without it).
//
// Note on _previousState:
//   PDX_KeybindingsRemap's Input.update() copies _currentState → _previousState each frame.
//   We must NOT write _previousState[name] = false here; that would store a boolean and
//   corrupt the `{ ...previousState[name] }` spread logic in update().
//
// Trigger: game plugins.js contains PDX_KeybindingsRemap

(function () {
    if (!window.InputBridge) {
        console.warn('[Compat_KeybindingsRemap] InputBridge not found at document start, skipping patch');
        return;
    }

    // Capture helpers from InputBridge (defined in common_input.js)
    var _getKeyCode = InputBridge._getKeyCode.bind(InputBridge);

    InputBridge.press = function (keyName) {
        var keyCode = _getKeyCode(keyName);
        if (keyCode && typeof Input !== 'undefined' && Input.keyMapper) {
            var name = Input.keyMapper[keyCode];
            if (name) {
                this._held[name] = true;

                if (typeof Input._updateCurrentState === 'function') {
                    // PDX_KeybindingsRemap format: { state, pressedTime, lastPressed }
                    // _updateCurrentState lowercases the name internally.
                    Input._updateCurrentState(name, true);

                    // Reset pressedTime to 0 so isTriggered() fires on the first frame.
                    // _updateCurrentState preserves pressedTime on re-press (only resets on release),
                    // but virtual keyboard presses should always be treated as fresh triggers.
                    var key = name.toLowerCase();
                    if (Input._currentState[key]) {
                        Input._currentState[key].pressedTime = 0;
                    }
                } else {
                    // Standard RPGMaker boolean format (fallback)
                    if (Input._currentState) Input._currentState[name] = true;
                    // Do NOT write _previousState here — PDX_KeybindingsRemap's update()
                    // spreads _currentState into _previousState; a boolean value would corrupt it.
                    // For non-PDX games the standard code already handles this.
                }

                // Signal to PDX_KeyboardNameInput (and similar plugins) that a
                // controller-like device triggered this input, enabling processHandling
                // in Window_NameInput even without a physical gamepad connected.
                Input._lastInputIsController = true;
                return;
            }
        }
        // Unrecognized key: no-op (avoids calling the old boolean-writing implementation)
    };

    InputBridge.release = function (keyName) {
        var keyCode = _getKeyCode(keyName);
        if (keyCode && typeof Input !== 'undefined' && Input.keyMapper) {
            var name = Input.keyMapper[keyCode];
            if (name) {
                delete this._held[name];

                if (typeof Input._updateCurrentState === 'function') {
                    // PDX_KeybindingsRemap: sets state=false, pressedTime=0
                    Input._updateCurrentState(name, false);
                } else {
                    if (Input._currentState) Input._currentState[name] = false;
                }
                return;
            }
        }
        // Unrecognized key: no-op
    };

    // -------------------------------------------------------------------
    // Patch sendInput (used for raw string keys like "Z", "X", "Q", "E")
    //
    // Problem:
    //   sendInput() writes _currentState[name] = true (boolean) BEFORE
    //   dispatching the keydown event. When _onKeyDown fires and calls
    //   _updateCurrentState('Ok', true), it does:
    //     _currentState['ok'] = _currentState['ok'] || { state: true, ... }
    //   Because _currentState['ok'] = true (truthy), the `||` short-circuits
    //   and keeps the boolean. Property writes (.state, .lastPressed) on a
    //   primitive silently fail. Input is still broken.
    //
    // Fix:
    //   Call _origSendInput (which dispatches the event), then check whether
    //   _currentState[name] is still a non-object (i.e., the boolean was not
    //   overwritten). If so, delete the stale boolean and call
    //   _updateCurrentState ourselves to create the correct object format.
    //
    //   Keyup does not need this fix: sendInput writes false (falsy), and
    //   false || {...} correctly creates the {state: false, ...} object.
    // -------------------------------------------------------------------
    var _origSendInput = InputBridge.sendInput.bind(InputBridge);

    InputBridge.sendInput = function (type, key, code, keyCode) {
        // Always call original to get _held management + event dispatch
        _origSendInput(type, key, code, keyCode);

        // Post-fix for keydown only when PDX_KeybindingsRemap is active
        if (type !== 'keydown') return;
        if (typeof Input === 'undefined' || typeof Input._updateCurrentState !== 'function') return;
        if (!Input.keyMapper) return;

        var name = Input.keyMapper[parseInt(keyCode)];
        if (!name) return;

        var lname = name.toLowerCase();
        if (!Input._currentState) return;

        // If _currentState[lname] is NOT a proper object (boolean, undefined, etc.)
        // the _updateCurrentState call inside _onKeyDown was blocked by the boolean write.
        // Delete the stale primitive and re-invoke _updateCurrentState to create the object.
        if (typeof Input._currentState[lname] !== 'object' || Input._currentState[lname] === null) {
            delete Input._currentState[lname];
            Input._updateCurrentState(name, true);
            // Ensure pressedTime=0 so isTriggered fires on this frame
            if (Input._currentState[lname]) Input._currentState[lname].pressedTime = 0;
        }

        Input._lastInputIsController = true;
    };

    console.log('[Compat_KeybindingsRemap] InputBridge.press/release/sendInput patched for PDX_KeybindingsRemap');
})();


/* === compat_san_imp_color_cache.js === */
// CanvasRenderingContext2D.getImageData 安全修复
// 问题：SAN_Imp_ColorCache.js 等插件通过 Bitmap.getPixel()/getAlphaPixel() 调用
//       CanvasRenderingContext2D.getImageData()，当 canvas 因跨域图片（rpgmv:// 自定义
//       scheme 加载的加密素材）而被「污染」（tainted）时，getImageData 抛出
//       SecurityError，导致整个 Window 初始化链崩溃，游戏黑屏。
// 修复：拦截 getImageData，捕获任何异常后返回与请求尺寸匹配的
//       全透明/黑色 ImageData，确保调用方的缓存逻辑仍能正常工作。
// Trigger: game plugins.js contains SAN_Imp_ColorCache / PicturePointColor_EX_v2 / PicturePointColor / MOG_PictureEffects / GraphicalDesignMode

(function patchGetImageData() {
    if (typeof CanvasRenderingContext2D === 'undefined') return;
    if (CanvasRenderingContext2D.prototype.getImageData.__ark_patched) return;
    var _origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function(sx, sy, sw, sh) {
        try {
            return _origGetImageData.call(this, sx, sy, sw, sh);
        } catch (e) {
            try {
                var w = Math.max(Math.ceil(sw) || 1, 1);
                var h = Math.max(Math.ceil(sh) || 1, 1);
                var tmp = document.createElement('canvas');
                tmp.width = w;
                tmp.height = h;
                return _origGetImageData.call(tmp.getContext('2d'), 0, 0, w, h);
            } catch (e2) {
                return { data: new Uint8ClampedArray(4), width: 1, height: 1 };
            }
        }
    };
    CanvasRenderingContext2D.prototype.getImageData.__ark_patched = true;
    console.log('[BitmapSafety] getImageData patched with taint-safe fallback');
})();


/* === compat_srd_game_upgrade.js === */
// SRD_GameUpgrade compat patch
//
// Root cause:
//   SRD_GameUpgrade replaces window.onload with its own function. If the
//   "Game Reconstruction (1.5.X & below)" param is enabled (default: true)
//   AND GameWindowManager.isWindowOriginal() returns true, it calls
//   GameWindowManager.startGameTransition() instead of the normal
//   SceneManager.run(Scene_Boot) startup.
//
//   startGameTransition() calls createNewWindow(gui) which calls
//   gui.Window.open() → our NW.js mock returns undefined (no return value) →
//   setupNewWindow(undefined, win) crashes:
//       TypeError: undefined is not an object
//           (evaluating 'this._intendedWindow[this._winCode] = true')
//   Result: window.onload never calls SceneManager.run → black screen.
//
//   isWindowOriginal() = Utils.isNwjs() && !require('nw.gui').Window.get()[winCode]
//   Utils.isNwjs() is patched to false by common_core.js, BUT if the game
//   environment has both require and process defined (it does), the patch may
//   not cover all execution paths, or the condition becomes true through the
//   mock nw.gui.Window.get() returning an object without the winCode property
//   (undefined → !undefined = true).
//
// Fix:
//   Patch GameWindowManager.isWindowOriginal() → false so that SRD's
//   window.onload always falls through to the else branch, which calls
//   _.window_onload() = SceneManager.run(Scene_Boot) normally.
//   Our addEventListener('load') listener fires before window.onload, so the
//   patch is in place before SRD's condition is evaluated.
//
// Trigger: game plugins.js contains SRD_GameUpgrade

(function() {
    window.addEventListener('load', function patchSRDGameUpgrade() {
        if (window.GameWindowManager &&
            typeof GameWindowManager.isWindowOriginal === 'function') {
            // In WKWebView, NW.js multi-window APIs are unavailable.
            // Returning false prevents startGameTransition() from being called,
            // allowing normal game startup via SceneManager.run(Scene_Boot).
            GameWindowManager.isWindowOriginal = function() { return false; };
            console.log('[Compat][SRD_GameUpgrade] GameWindowManager.isWindowOriginal patched → false');
        } else {
            console.log('[Compat][SRD_GameUpgrade] GameWindowManager.isWindowOriginal not found, skipping');
        }
    });
})();


/* === compat_srd_preloader_core.js === */
// SRD_PreloaderCore compat patch
//
// Root cause fix:
//   SRD_PreloaderCore initializes `_.isNwjs = Utils.isNwjs()` at plugin parse time.
//   Because common_core.js patches Utils.isNwjs() → false (to prevent broken
//   NW.js storage paths), `_.isNwjs` is false. When the preloader tries to build
//   the "all" image list via preloadImageFolder('enemies', 'all'), it falls into
//   the makeAllError() branch instead of setImageAll(), which calls:
//       SceneManager.stop()         ← game loop permanently halted
//       Graphics.printError(...)    ← error div hidden behind PIXI canvas
//       AudioManager.stopAll()
//   Result: black screen with no visible error.
//
// Fix:
//   Patch SRD.PreloaderCore.isNwjs = true on 'load' event (before SceneManager
//   starts). Since _ === SRD.PreloaderCore, preloadImageFolder('enemies','all')
//   will then call setImageAll() which uses fs.readdirSync(), implemented via
//   the __NATIVE_READDIR__ native bridge — correctly enumerating the game's
//   img/enemies/ directory.
//
// Trigger: game plugins.js contains SRD_PreloaderCore

(function() {
    // ── IMMEDIATE: catch errors that happen during window.onload / plugin init
    window.addEventListener('error', function(e) {
        console.error('[Compat][SRD] window.error: ' + e.message +
            ' (' + (e.filename || '?') + ':' + (e.lineno || '?') + ')');
    });
    window.addEventListener('unhandledrejection', function(e) {
        var reason = e.reason;
        var msg = reason ? (reason.message || String(reason)) : 'unknown';
        console.error('[Compat][SRD] unhandledrejection: ' + msg +
            (reason && reason.stack ? '\n' + reason.stack : ''));
    });

    // ── Helper: wrap readdirSync to log results for SRD paths ──────────────
    function installReaddirLogger() {
        try {
            var origRequire = window.__origRequire || window.require;
            var mockFS = origRequire && origRequire('fs');
            if (!mockFS || typeof mockFS.readdirSync !== 'function') return;
            var _orig = mockFS.readdirSync.bind(mockFS);
            mockFS.readdirSync = function(p) {
                var result = _orig(p);
                console.log('[Compat][SRD] readdirSync("' + p + '") → ' + result.length + ' files' +
                    (result.length > 0 ? ' [0]=' + result[0] : ''));
                return result;
            };
        } catch(e) {
            console.warn('[Compat][SRD] readdirSync logger install failed:', e);
        }
    }

    window.addEventListener('load', function patchSRDPreloader() {
        if (!window.SRD || !SRD.PreloaderCore) {
            console.warn('[Compat][SRD_PreloaderCore] SRD.PreloaderCore not found, skipping patch');
            return;
        }

        // ── 1. Intercept makeError to surface hidden errors in console ──────
        var _origMakeError = SRD.PreloaderCore.makeError;
        SRD.PreloaderCore.makeError = function(title, text) {
            console.error('[Compat][SRD_PreloaderCore] makeError intercepted! title="' + title + '" text="' + text + '"');
            // Still call original — if it black-screens, at least we logged it
            if (typeof _origMakeError === 'function') _origMakeError.call(this, title, text);
        };

        // ── 2. Install readdirSync logger before isNwjs patch ───────────────
        installReaddirLogger();

        // ── 3. Wrap setImageAll to catch any thrown exceptions ──────────────
        var _origSetImageAll = SRD.PreloaderCore.setImageAll;
        SRD.PreloaderCore.setImageAll = function(folder) {
            try {
                console.log('[Compat][SRD] setImageAll("' + folder + '") start');
                if (typeof _origSetImageAll === 'function') _origSetImageAll.call(this, folder);
                var count = (this.imagePreloads && this.imagePreloads[folder]) ? this.imagePreloads[folder].length : 0;
                console.log('[Compat][SRD] setImageAll("' + folder + '") done, ' + count + ' images queued');
            } catch(e) {
                console.error('[Compat][SRD] setImageAll("' + folder + '") THREW: ' + e.name + ': ' + e.message);
                // Prevent crash: ensure imagePreloads[folder] exists
                if (!this.imagePreloads) this.imagePreloads = {};
                if (!this.imagePreloads[folder]) this.imagePreloads[folder] = [];
            }
        };

        // ── 4. Wrap setAudioAll similarly ───────────────────────────────────
        var _origSetAudioAll = SRD.PreloaderCore.setAudioAll;
        SRD.PreloaderCore.setAudioAll = function(folder) {
            try {
                console.log('[Compat][SRD] setAudioAll("' + folder + '") start');
                if (typeof _origSetAudioAll === 'function') _origSetAudioAll.call(this, folder);
                var count = (this.audioPreloads && this.audioPreloads[folder]) ? this.audioPreloads[folder].length : 0;
                console.log('[Compat][SRD] setAudioAll("' + folder + '") done, ' + count + ' tracks queued');
            } catch(e) {
                console.error('[Compat][SRD] setAudioAll("' + folder + '") THREW: ' + e.name + ': ' + e.message);
                if (!this.audioPreloads) this.audioPreloads = {};
                if (!this.audioPreloads[folder]) this.audioPreloads[folder] = [];
            }
        };

        // Restore NW.js-style fs path so preloadImageFolder('enemies','all')
        // calls setImageAll() rather than makeAllError().
        SRD.PreloaderCore.isNwjs = true;
        console.log('[Compat][SRD_PreloaderCore] isNwjs patched to true (native readdirSync available)');

        // ── 5. Global SceneManager hooks to catch ANY black-screen cause ────
        if (window.SceneManager) {
            // Hook catchException: logs the actual JS error thrown anywhere in game loop
            var _origCatch = SceneManager.catchException;
            SceneManager.catchException = function(e) {
                if (e instanceof Error) {
                    console.error('[Compat][SRD] SceneManager.catchException: ' + e.name + ': ' + e.message);
                    if (e.stack) console.error('[Compat][SRD] Stack: ' + e.stack);
                } else {
                    console.error('[Compat][SRD] SceneManager.catchException (non-Error): ' + e);
                }
                if (typeof _origCatch === 'function') _origCatch.call(SceneManager, e);
            };

            // Hook stop: logs WHO called SceneManager.stop() via stack trace
            var _origStop = SceneManager.stop;
            SceneManager.stop = function() {
                console.error('[Compat][SRD] SceneManager.stop() called! Stack:\n' + new Error().stack);
                if (typeof _origStop === 'function') _origStop.call(SceneManager);
            };

            // Hook run: confirm the game loop is started at all
            var _origRun = SceneManager.run;
            SceneManager.run = function(sceneClass) {
                console.log('[Compat][SRD] SceneManager.run(' +
                    (sceneClass && sceneClass.name ? sceneClass.name : sceneClass) + ')');
                if (typeof _origRun === 'function') _origRun.call(SceneManager, sceneClass);
            };

            // Heartbeat: log every ~10s to confirm the game loop is ticking
            var _heartbeatFrame = 0;
            var _origUpdateMain = SceneManager.updateMain;
            SceneManager.updateMain = function() {
                _heartbeatFrame++;
                if (_heartbeatFrame % 600 === 1) {
                    console.log('[Compat][SRD] game loop heartbeat frame=' + _heartbeatFrame);
                }
                if (typeof _origUpdateMain === 'function') _origUpdateMain.call(SceneManager);
            };

            console.log('[Compat][SRD_PreloaderCore] SceneManager hooks installed');
        } else {
            console.warn('[Compat][SRD_PreloaderCore] SceneManager not found at load time');
        }

        // ── 6. Scene_Boot.prototype.start hook ─────────────────────────────
        if (window.Scene_Boot && Scene_Boot.prototype) {
            var _origSceneBoot = Scene_Boot.prototype.start;
            Scene_Boot.prototype.start = function() {
                console.log('[Compat][SRD] Scene_Boot.prototype.start() called');
                try {
                    if (typeof _origSceneBoot === 'function') _origSceneBoot.call(this);
                    console.log('[Compat][SRD] Scene_Boot.prototype.start() completed OK');
                } catch(e) {
                    console.error('[Compat][SRD] Scene_Boot.prototype.start() THREW: ' +
                        e.name + ': ' + e.message +
                        (e.stack ? '\n' + e.stack : ''));
                }
            };
            console.log('[Compat][SRD_PreloaderCore] Scene_Boot.start hook installed');
        } else {
            console.warn('[Compat][SRD_PreloaderCore] Scene_Boot not found at load time');
        }
    });
})();


/* === compat_touch_ui.js === */
// TouchUI iOS 键盘方向键修复
//
// 问题：
//   TouchUI.js 把所有标准选择窗口（Window_Command, Window_MenuStatus,
//   Window_SavefileList, Window_ItemList, Window_SkillList, Window_EquipSlot,
//   Window_BattleActor, Window_BattleEnemy, Window_ShopBuy）的 _swipeable 设为
//   true，并重写 Window_Selectable.update：当 _swipeable=true 时只调用
//   processHandling + processTouch + 滚动逻辑，跳过 processCursorMove。
//
//   结果：键盘 / 虚拟摇杆方向键完全失效（OK/Cancel 走 processHandling 不受影响，
//         地图走 Input.dir4 不经过窗口也不受影响）。
//
// 修复：
//   保留 TouchUI 的 swipeable 滚动行为，在 update 末尾追加原版 processCursorMove
//   调用，让键盘方向键重新工作。processCursorMove 内部自带 isCursorMovable 检查，
//   不按键时不会移动光标，与触屏 swipe 互不干扰。
//
// 二次问题（cursor 多跳）：
//   TDDP_FluidTimestep 的 while 累积器循环会让单 tick 内 SceneManager.updateScene
//   跑 N 次，每次都触发 window.update → 追加的 processCursorMove 跑 N 次。
//   compat_TDDP 已把 Input.update 去重为 1 次/tick，所以 _pressedTime 在多次
//   processCursorMove 之间保持 0，isRepeated('down') 每次都返回 true → 一次按键
//   光标跳 N 格。修复：每 tick 全 scene 只让一个窗口响应键盘（单 flag）。
//
// 三次问题（焦点串台）：
//   TouchUI 让多个 swipeable 窗口同时 active=true（如战斗的 actorCommandWindow
//   + cancelWindow，两个都为触屏 swipe 准备）。两个窗口初始 _index 都 >= 0
//   （继承自 Window_Command.initialize 的 select(0)）。一次按方向键会引发
//   "select → deselect 对方 → 对方 cursorDown 在 _index=-1 上仍触发 select(0)
//   → 反向 deselect" 的连锁，视觉上光标从主菜单跳到 cancel。
//   修复：只让 _index >= 0 的窗口响应键盘（"focused"语义），并且每 tick 全 scene
//   只允许一个窗口响应。
//
// 时序注意：
//   compat 在 atDocumentStart 注入，rpg_windows.js 加载完后 Window_Selectable 出现，
//   但此时 plugins.js（含 TouchUI）还未执行。若立即 hook prototype.update，
//   TouchUI 后续会直接覆盖 prototype.update 把 hook 抹掉。所以必须轮询等
//   update.toString() 含 '_swipeable' 字样后再 hook。
//
// Trigger: game plugins.js contains TouchUI

(function () {
    'use strict';

    var MAX_WAIT_MS = 15000;
    var INTERVAL_MS = 50;
    var elapsed = 0;

    var checkInterval = setInterval(function () {
        elapsed += INTERVAL_MS;

        if (typeof Window_Selectable === 'undefined' || typeof Utils === 'undefined') {
            if (elapsed >= MAX_WAIT_MS) clearInterval(checkInterval);
            return;
        }

        var src = (typeof Window_Selectable.prototype.update === 'function')
            ? Window_Selectable.prototype.update.toString() : '';
        if (src.indexOf('_swipeable') === -1) {
            if (elapsed >= MAX_WAIT_MS) {
                clearInterval(checkInterval);
                console.log('[Compat] TouchUI: waited ' + (MAX_WAIT_MS / 1000)
                    + 's but update never got _swipeable branch — TouchUI not loaded? give up');
            }
            return;
        }

        clearInterval(checkInterval);
        installPatch();
    }, INTERVAL_MS);

    function installPatch() {
        if (!Utils.isMobileSafari()) {
            console.log('[Compat] TouchUI: not MobileSafari, skip');
            return;
        }

        if (Window_Selectable.prototype.update.__arkTouchUiPatchApplied) {
            console.log('[Compat] TouchUI: already patched, skip');
            return;
        }

        var _touchUiUpdate = Window_Selectable.prototype.update;
        var _origProcessCursorMove = Window_Selectable.prototype.processCursorMove;

        // 每 tick 全 scene 只让一个"focused"（_index >= 0）窗口响应键盘方向键。
        // - 防 TDDP 多次 updateScene 在同一窗口上重复触发（同一窗口二次 update 时 flag 已占）
        // - 防 TouchUI 双窗口同时 active 导致焦点串台（后处理的窗口看到 flag 已占直接跳过）
        var _focusedWindowThisTick = null;

        var _origTickStart = SceneManager.tickStart;
        SceneManager.tickStart = function () {
            _focusedWindowThisTick = null;
            if (_origTickStart) _origTickStart.call(this);
        };

        // 诊断计数
        var _cursorMoveCallCount = 0;
        var _suppressedDupCount = 0;
        var _suppressedUnfocusedCount = 0;
        var _lastReportTs = 0;
        var _startTs = (typeof performance !== 'undefined' && typeof performance.now === 'function')
            ? performance.now() : Date.now();

        var newUpdate = function () {
            var wasSwipeable = this._swipeable;
            _touchUiUpdate.call(this);
            if (!wasSwipeable) return;
            if (!(this.isOpenAndActive && this.isOpenAndActive())) return;

            // TouchUI 让多个 swipeable 窗口同时 active（如战斗 actorCommand + cancel）。
            // 只有 _index >= 0 的"focused"窗口才响应键盘，避免 cursor 在 _index=-1 上
            // 触发 cursorDown 的 wrap 行为，导致焦点串台。
            if (this._index < 0) {
                _suppressedUnfocusedCount++;
                return;
            }

            // 每 tick 全 scene 只允许一个窗口响应
            if (_focusedWindowThisTick !== null) {
                _suppressedDupCount++;
                return;
            }
            _focusedWindowThisTick = this;

            var indexBefore = this.index();
            _origProcessCursorMove.call(this);
            var indexAfter = this.index();
            _cursorMoveCallCount++;

            if (indexBefore !== indexAfter) {
                var cls = (this.constructor && this.constructor.name) || '?';
                console.log('[Compat][TouchUI] cursor moved by keyboard: ' + cls
                    + ' ' + indexBefore + '→' + indexAfter);
            }

            var now = (typeof performance !== 'undefined' && typeof performance.now === 'function')
                ? performance.now() : Date.now();
            if (now - _lastReportTs > 5000) {
                _lastReportTs = now;
                var sec = Math.max(0.001, (now - _startTs) / 1000);
                console.log('[Compat][TouchUI] stats: cursorMoveCalls=' + _cursorMoveCallCount
                    + ' dupSuppressed=' + _suppressedDupCount
                    + ' unfocusedSuppressed=' + _suppressedUnfocusedCount
                    + ' over ' + sec.toFixed(1) + 's');
            }
        };
        newUpdate.__arkTouchUiPatchApplied = true;
        Window_Selectable.prototype.update = newUpdate;

        console.log('[Compat] TouchUI: hook installed after TouchUI override detected (update src len='
            + _touchUiUpdate.toString().length + ')');
    }
})();


/* === compat_yep_fps_synch_option.js === */
// YEP_FpsSynchOption iOS 输入修复
// 问题：YEP_FpsSynchOption 覆写 SceneManager.updateMain，在 updateMainNoFpsSynch()
//       中调用了 updateInputData()。而 rpg_managers.js 的 SceneManager.update() 在
//       isMobileSafari()=true 时也会在 updateMain() 之前调用 updateInputData()。
//       结果：每帧 Input.update() 被调用两次，_pressedTime 被推离 0，
//       Input.isTriggered()（===0）永远不满足。
//
// 修复：Hook SceneManager.updateInputData 而非 Input.update，在帧边界内去重。
//       这样不干扰其他 compat 层（如 compat_koffi_modmanager）对 Input.update 的
//       包装——DKTools 等插件直接调用 Input.update 时仍可被 koffi 层正确处理。
// Trigger: game plugins.js contains YEP_FpsSynchOption

(function () {
    'use strict';

    var MAX_WAIT_MS = 10000;
    var INTERVAL_MS = 50;
    var elapsed = 0;

    var checkInterval = setInterval(function () {
        elapsed += INTERVAL_MS;

        if (typeof SceneManager === 'undefined' || typeof Utils === 'undefined') {
            if (elapsed >= MAX_WAIT_MS) clearInterval(checkInterval);
            return;
        }

        clearInterval(checkInterval);

        if (!Utils.isMobileSafari()) return;

        if (SceneManager.updateInputData && SceneManager.updateInputData.__arkFpsPatchApplied) return;

        var _updatedThisTick = false;

        var _origTickStart = SceneManager.tickStart;
        SceneManager.tickStart = function () {
            _updatedThisTick = false;
            if (_origTickStart) _origTickStart.call(this);
        };

        var _origUpdateInputData = SceneManager.updateInputData;
        SceneManager.updateInputData = function () {
            if (_updatedThisTick) return;
            _updatedThisTick = true;
            _origUpdateInputData.call(this);
        };
        SceneManager.updateInputData.__arkFpsPatchApplied = true;

        console.log('[Compat] YEP_FpsSynchOption: iOS double updateInputData() dedup patch applied');
    }, INTERVAL_MS);

})();


/* === compat_globalmap.js === */
// globalmap compatibility for ArkRPG/WKWebView.
//
// globalmap depends on two NW.js capabilities unavailable in WKWebView:
//   1. require('lodash/cloneDeep') for JSON-backed RPG.Event values.
//   2. fs.readFileSync for every MapNNN.json during new-game setup.
//
// The shared synchronous bridge deliberately rejects responses above 4 MiB.
// Keep that safety limit intact and use a bounded native chunk transport only
// for globalmap's UTF-8 map JSON reads.

(function() {
    'use strict';

    if (location.protocol !== 'rpgmv:' || typeof window.require !== 'function') return;
    if (window.require.__arkGlobalmapCompat) return;

    var originalRequire = window.require;
    var fs;
    try {
        fs = originalRequire('fs');
    } catch (error) {
        fs = null;
    }
    var originalReadFileSync = fs && typeof fs.readFileSync === 'function'
        ? fs.readFileSync
        : null;
    var chunkBytes = 1024 * 1024;

    function hasEnabledGlobalmap() {
        if (!Array.isArray(window.$plugins)) return false;
        return window.$plugins.some(function(plugin) {
            return plugin && plugin.name === 'globalmap' && plugin.status === true;
        });
    }

    function normalizedMapPath(path) {
        var normalized = String(path == null ? '' : path)
            .replace(/\\/g, '/')
            .replace(/[?#].*$/, '')
            .replace(/^.*www\//i, '')
            .replace(/^\.\//, '')
            .replace(/^\//, '');
        if (normalized.split('/').indexOf('..') !== -1) return null;
        return /^data\/Map\d{3}\.json$/i.test(normalized) ? normalized : null;
    }

    function utf8EncodingRequested(encoding) {
        var value = typeof encoding === 'string'
            ? encoding
            : encoding && typeof encoding.encoding === 'string'
                ? encoding.encoding
                : '';
        return /^(?:utf8|utf-8)$/i.test(value);
    }

    function base64ToBytes(base64) {
        var binary = atob(base64);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    }

    function chunkedMapRead(cleanPath) {
        var url = location.protocol + '//game/' + cleanPath;
        var offset = 0;
        var total = null;
        var output = null;

        do {
            var response;
            try {
                response = prompt('__NATIVE_SYNC_GET_CHUNK__:' + JSON.stringify({
                    url: url,
                    offset: offset,
                    length: chunkBytes
                }), '');
            } catch (error) {
                return null;
            }
            if (typeof response !== 'string' || response.length === 0) return null;

            var firstSeparator = response.indexOf('|');
            var secondSeparator = response.indexOf('|', firstSeparator + 1);
            if (firstSeparator <= 0 || secondSeparator <= firstSeparator) return null;

            var status = parseInt(response.slice(0, firstSeparator), 10) || 0;
            if (status !== 200) {
                throw new Error('globalmap chunked read failed with status ' + status + ': ' + cleanPath);
            }

            var responseTotal = parseInt(
                response.slice(firstSeparator + 1, secondSeparator),
                10
            );
            if (!Number.isFinite(responseTotal) || responseTotal < 0) {
                throw new Error('globalmap chunked read returned invalid length: ' + cleanPath);
            }
            if (total === null) {
                total = responseTotal;
                output = new Uint8Array(total);
            } else if (responseTotal !== total) {
                throw new Error('globalmap chunked read length changed: ' + cleanPath);
            }

            var bytes = base64ToBytes(response.slice(secondSeparator + 1));
            if (bytes.length === 0 && offset < total) {
                throw new Error('globalmap chunked read made no progress: ' + cleanPath);
            }
            if (offset + bytes.length > total) {
                throw new Error('globalmap chunked read overflow: ' + cleanPath);
            }
            output.set(bytes, offset);
            offset += bytes.length;
        } while (offset < total);

        return new TextDecoder('utf-8').decode(output);
    }

    if (originalReadFileSync) {
        function compatibleReadFileSync(path, encoding) {
            var cleanPath = normalizedMapPath(path);
            if (!hasEnabledGlobalmap() || cleanPath === null || !utf8EncodingRequested(encoding)) {
                return originalReadFileSync.apply(this, arguments);
            }

            var content = chunkedMapRead(cleanPath);
            if (content !== null) return content;
            // Old app builds do not expose the chunk protocol. Preserve the
            // previous read path so small maps still work and large ones fail
            // with the existing ENOENT/413 behavior rather than corrupt data.
            return originalReadFileSync.apply(this, arguments);
        }

        compatibleReadFileSync.__arkGlobalmapCompat = true;
        fs.readFileSync = compatibleReadFileSync;
    }

    // globalmap only passes values sourced from RPG Maker JSON databases.
    function cloneDeepForGlobalmap(value) {
        if (value === null || value === undefined || typeof value !== 'object') {
            return value;
        }
        return JSON.parse(JSON.stringify(value));
    }

    function compatibleRequire(moduleName) {
        if (moduleName === 'lodash/cloneDeep' && hasEnabledGlobalmap()) {
            return cloneDeepForGlobalmap;
        }
        return originalRequire.apply(this, arguments);
    }

    compatibleRequire.__arkGlobalmapCompat = true;
    compatibleRequire.__arkGlobalmapOriginalRequire = originalRequire;
    if (originalRequire.modules) compatibleRequire.modules = originalRequire.modules;
    window.require = compatibleRequire;
    console.log('[Compat][globalmap] cloneDeep and chunked map reads installed');
})();


/* === compat_koffi_modmanager.js === */
// AbortError 抑制器
// 部分游戏（如 Karryn's Prison DLC）的 mod-manager 注册了全局 error/unhandledrejection 处理器，
// 将所有未捕获错误视为 fatal error 并弹窗。当 app 进入后台时，WKWebView 中断 pending 异步操作
// 触发 AbortError（"The operation was aborted"），被误当作致命错误。
// 此处注册 capture 阶段处理器（先于 mod-manager 的 handler），拦截 AbortError 阻止传播。
// Trigger: game plugins.js contains mod-manager or koffi

(function() {
    function isAbortError(err) {
        if (!err) return false;
        if (err instanceof DOMException && err.name === 'AbortError') return true;
        if (err instanceof Error && err.name === 'AbortError') return true;
        var msg = err.message || String(err);
        return msg.indexOf('operation was aborted') !== -1 ||
               msg.indexOf('aborted') !== -1;
    }
    function suppressAbortError(event) {
        var err = event.reason || event.error;
        if (isAbortError(err)) {
            event.stopImmediatePropagation();
            event.preventDefault();
        }
    }
    window.addEventListener('error', suppressAbortError, true);
    window.addEventListener('unhandledrejection', suppressAbortError, true);
})();

// patchInputUpdate — DKTools 双次 update / 浮点增量 _pressedTime 补偿
// 触发条件：游戏含 mod-manager / koffi / ModManager 插件（即 Karryn's Prison 系列）
// 问题：
//   Karryn's Prison DLC 的 Input.update 使用 _deltaTime 浮点增量（替代原版 _pressedTime++），
//   且 DKTools 每帧调用 Input.update 2 次以上，导致 _pressedTime 被增量推离 0，
//   isTriggered(===0) 永远不满足，虚拟键盘按键无响应。
// 修复：
//   包装 Input.update，在检测到新虚拟按键按下且每帧多次调用时，
//   调整 _pressedTime 使 isTriggered 在最后一次调用后精确命中。
(function installKarrynInputPatch() {
    var attempts = 0;
    var timer = setInterval(function() {
        attempts++;
        if (typeof window.Input === 'undefined') {
            if (attempts >= 100) clearInterval(timer);
            return;
        }
        clearInterval(timer);
        console.log('[Compat][Karryn] Input ready, installing DKTools _pressedTime patch');

        var origUpdate = Input.update;
        var _updateCallsThisFrame = 0;
        var _prevFrameCalls = 1;

        // DLC 版本检测：DLC 版 Input.update 使用 _deltaTime 浮点增量
        var _isFloatIncrement = false;
        try {
            _isFloatIncrement = typeof origUpdate === 'function' &&
                origUpdate.toString().indexOf('_deltaTime') !== -1;
        } catch(e) {}
        var _arkNeedPtZero = false;
        var _arkPtZeroDone = false;

        requestAnimationFrame(function loop() {
            _prevFrameCalls = _updateCallsThisFrame;
            _updateCallsThisFrame = 0;
            _arkNeedPtZero = false;
            _arkPtZeroDone = false;
            requestAnimationFrame(loop);
        });

        Input.update = function() {
            _updateCallsThisFrame++;

            // 同步合并 _held 到 _currentState（防御：如果直写因某原因未生效时的补充保障）
            var held = window.InputBridge ? InputBridge._held : {};
            var virt = this._arkVirt || {};

            // 检测新虚拟按键按下（held 中有，_previousState 中没有）
            var hadNewVirtualPress = false;
            for (var name in held) {
                if (!this._previousState[name]) hadNewVirtualPress = true;
            }

            // 清除不再按住的虚拟按键
            for (var name in virt) {
                if (!held[name]) {
                    this._currentState[name] = false;
                    delete virt[name];
                }
            }
            // 设置当前按住的虚拟按键
            for (var name in held) {
                this._currentState[name] = true;
                virt[name] = true;
            }
            this._arkVirt = virt;

            origUpdate.call(this);

            // 修复多调用场景：DKTools 每帧调用 Input.update >=2 次，
            // _pressedTime 在第一次调用后被增量推离 0，导致 isTriggered(===0) 失败
            if (hadNewVirtualPress
                && _updateCallsThisFrame === 1
                && this._pressedTime === 0
                && this._latestButton) {
                if (_isFloatIncrement && _prevFrameCalls > 1) {
                    // DLC 浮点增量：改用哨兵值方案
                    // call#1 设 pt=-1 阻止中间触发，最后一次调用时强制 pt=0
                    _arkNeedPtZero = true;
                    _arkPtZeroDone = false;
                    this._pressedTime = -1;
                } else {
                    // 标准整数增量：pt=-(N-1) 后经 N-1 次自增恰好回到 0
                    this._pressedTime = -(_prevFrameCalls - 1);
                }
            }

            // DLC 浮点增量：最后一次调用时强制 pt=0（仅一次）
            if (_arkNeedPtZero && !_arkPtZeroDone
                && _updateCallsThisFrame >= _prevFrameCalls) {
                this._pressedTime = 0;
                _arkPtZeroDone = true;
            }
        };
    }, 200);
})();


/* === compat_mv3d.js === */
// Pointer Lock API polyfill（mv3d / mz3d 通用）
// 问题：mv3d.js（MV）与 mz3d.js（MZ）在 Scene_Map.stop / Scene_Map.update
//       等钩子中调用 document.exitPointerLock()、document.pointerLockElement、
//       及 HTMLElement.prototype.requestPointerLock()。
//       iOS WKWebView 不实现 Pointer Lock API，上述调用均抛出
//       TypeError: document.exitPointerLock is not a function，
//       导致 Scene_Map 过渡时整条场景切换链崩溃，游戏黑屏无法进行。
//
// 修复：在 document / HTMLElement.prototype 上注入空操作 (no-op) stub，
//       并将 pointerLockElement 固定为 null（iOS 上永远不会锁定指针）。
//       mv3d/mz3d 内部的 _relockPointer 逻辑依赖 pointerLockElement 判断
//       是否需要重新锁定，返回 null 即可让其静默放弃重锁请求。
// Trigger: game plugins.js contains mv3d or mz3d

(function patchPointerLock() {
    'use strict';

    // document.exitPointerLock
    if (typeof document.exitPointerLock !== 'function') {
        document.exitPointerLock = function () {};
    }

    // document.pointerLockElement（只读 getter stub）
    if (!('pointerLockElement' in document)) {
        Object.defineProperty(document, 'pointerLockElement', {
            get: function () { return null; },
            configurable: true
        });
    }

    // Element.prototype.requestPointerLock（canvas.requestPointerLock()）
    if (typeof HTMLElement !== 'undefined' &&
        typeof HTMLElement.prototype.requestPointerLock !== 'function') {
        HTMLElement.prototype.requestPointerLock = function () {};
    }

    console.log('[mv3d] Pointer Lock API polyfilled (no-op stubs for iOS WKWebView)');
})();


/* === compat_parallel_bgs.js === */
// ParallelBgs.js patch
// Fix: AudioManager.findPlayingBgsIndex uses findIndex for correct index lookup.
// Trigger: game plugins.js contains ParallelBgs

(function() {
    function applyPatch() {
        if (typeof AudioManager === 'undefined') return false;
        if (!AudioManager.findPlayingBgsIndex) return false;
        if (AudioManager.__arkParallelBgsPatched) return true;

        AudioManager.findPlayingBgsIndex = function (bgs, startingIndex) {
            return this._allBgsBuffer.findIndex(function(buffer, i) {
                if (i < startingIndex) return false;
                if (!buffer || !buffer._url) return false;
                var url = buffer._url.split('?')[0];
                var bufferName = url.substring(url.lastIndexOf('/') + 1);
                bufferName = bufferName.replace(/\.[^/.]+$/, "");
                return buffer._autoPlay && bufferName === bgs.name;
            });
        };
        AudioManager.__arkParallelBgsPatched = true;
        console.log('[ParallelBgs] findPlayingBgsIndex patched');
        return true;
    }

    var retries = 0;
    var timer = setInterval(function() {
        retries++;
        if (applyPatch() || retries > 100) clearInterval(timer);
    }, 100);
})();


/* === compat_pixi_apng.js === */
// APNG / pixi-rpgm .rpgmvp double-decryption fix
// 问题：pixi-apng 加载加密 .rpgmvp 图像时出现 "Buffer too small to slice 4 bytes" 错误。
// 原因：MVSchemeHandler 预解密 .rpgmvp 为 PNG，pixi-rpgm 再次 XOR 解密导致数据损坏。
// 修复：拦截 .rpgmvp 请求，检测到 PNG 签名时重建 RPGMV 容器。
// Trigger: game plugins.js contains pixi-apng or pixi-rpgm

(function() {
    var RPGMV_HEADER = new Uint8Array([
        0x52, 0x50, 0x47, 0x4d, 0x56, 0x00, 0x00, 0x00,
        0x00, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);

    function getDecryptKey() {
        var dec = window.Decrypter;
        if (!dec) return null;
        if (!dec._encryptionKey || dec._encryptionKey === '' || dec._encryptionKey.length === 0) {
            if (typeof dec.readEncryptionkey === 'function') {
                try { dec.readEncryptionkey(); } catch (e) {}
            }
        }
        var k = dec._encryptionKey;
        if (!k || k === '') return null;
        var bytes = null;
        if (Array.isArray(k)) {
            bytes = [];
            if (k.length === 32) {
                for (var i = 0; i < 16; i++) {
                    var v = k[i]; var b = (typeof v === 'string') ? parseInt(v, 16) : (v & 0xff);
                    if (isNaN(b)) return null;
                    bytes.push(b);
                }
            } else if (k.length === 16) {
                for (var i = 0; i < 16; i++) {
                    var v = k[i]; var b = (typeof v === 'number') ? (v & 0xff) : parseInt(String(v), 16);
                    if (isNaN(b)) return null;
                    bytes.push(b);
                }
            } else {
                return null;
            }
            return bytes;
        }
        if (typeof k === 'string') {
            var ks = k.trim();
            if (/^[0-9a-fA-F]{32}$/.test(ks)) {
                bytes = [];
                for (var j = 0; j < 32; j += 2) bytes.push(parseInt(ks.substr(j, 2), 16));
                return bytes;
            }
            return null;
        }
        return null;
    }

    function rebuildRpgmvpFromPng(view, key) {
        var xored = new Uint8Array(16);
        for (var i = 0; i < 16; i++) xored[i] = view[i] ^ key[i];
        var out = new Uint8Array(16 + view.length);
        out.set(RPGMV_HEADER, 0);
        out.set(xored, 16);
        out.set(view.subarray(16), 32);
        return out.buffer;
    }

    // 修复 1：.rpgmvp 双重解密修复（fetch 路径）
    (function installRpgmvpFetchFix() {
        if (typeof window.fetch !== 'function') { return; }
        var _origFetch = window.fetch;

        window.fetch = function(input, init) {
            var url;
            try {
                url = typeof input === 'string' ? input :
                      (input instanceof Request ? input.url : String(input));
            } catch (_) { url = ''; }

            var isRpgmvp = typeof url === 'string' &&
                           url.indexOf('blob:') !== 0 &&
                           url.indexOf('data:') !== 0 &&
                           url.indexOf('.rpgmvp') !== -1;
            if (!isRpgmvp) return _origFetch.apply(window, arguments);

            return _origFetch.call(window, input, init).then(function(response) {
                return response.arrayBuffer().then(function(buffer) {
                    var bytes = new Uint8Array(buffer);
                    var isPng = bytes.length >= 8 &&
                        bytes[0] === 0x89 && bytes[1] === 0x50 &&
                        bytes[2] === 0x4e && bytes[3] === 0x47;

                    if (!isPng) {
                        return new Response(buffer, {
                            status: response.status,
                            headers: { 'Content-Type': 'application/octet-stream' }
                        });
                    }

                    var key = getDecryptKey();
                    if (!key) {
                        return new Response(buffer, {
                            status: response.status,
                            headers: { 'Content-Type': 'image/png' }
                        });
                    }
                    var rebuilt = rebuildRpgmvpFromPng(bytes, key);
                    return new Response(rebuilt, {
                        status: response.status,
                        headers: { 'Content-Type': 'application/octet-stream' }
                    });
                }).catch(function(err) {
                    return _origFetch.call(window, input, init);
                });
            });
        };
    })();

    // 修复 2：.rpgmvp 双重解密修复（XHR 路径）
    (function installRpgmvpXhrFix() {
        if (typeof XMLHttpRequest === 'undefined') return;
        var _origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if (typeof url === 'string' && url.indexOf('.rpgmvp') !== -1) {
                var xhr = this;
                var _url = url;
                xhr.addEventListener('readystatechange', function() {
                    if (xhr.readyState !== 4 || xhr._arkXhrFixed) return;
                    xhr._arkXhrFixed = true;
                    try {
                        var rawBuf = xhr.response;
                        if (!rawBuf || !(rawBuf instanceof ArrayBuffer)) return;
                        var view = new Uint8Array(rawBuf);
                        if (view.length < 8 || view[0] !== 0x89 || view[1] !== 0x50) return;
                        var key = getDecryptKey();
                        if (!key) return;
                        var newBuf = rebuildRpgmvpFromPng(view, key);
                        Object.defineProperty(xhr, 'response', {
                            configurable: true, enumerable: true,
                            get: function() { return newBuf; }
                        });
                    } catch(e) {}
                });
            }
            return _origOpen.apply(this, arguments);
        };
    })();
})();


