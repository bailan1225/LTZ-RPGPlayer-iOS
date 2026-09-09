// common_crypto.js
// Polyfill for Node's `crypto` module in WebView environments.
// Provides: createHash (SHA-256), createCipheriv/createDecipheriv (AES-CBC).
(function(){
  var root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this);
  if (!root) return;
  var DIAG_PREFIX = '[ArkCryptoDiag]';
  var webCrypto = root.crypto || {};
  var nodeCrypto = root.__arkNodeCrypto = root.__arkNodeCrypto || {};
  if (!nodeCrypto.webcrypto) nodeCrypto.webcrypto = webCrypto;
  if (!nodeCrypto.subtle && webCrypto.subtle) nodeCrypto.subtle = webCrypto.subtle;
  if (!nodeCrypto.getRandomValues && webCrypto.getRandomValues) {
    nodeCrypto.getRandomValues = function(arr) { return webCrypto.getRandomValues(arr); };
  }
  if (!nodeCrypto.randomUUID) {
    if (webCrypto.randomUUID) {
      nodeCrypto.randomUUID = function() { return webCrypto.randomUUID(); };
    } else {
      nodeCrypto.randomUUID = function() {
        var b = new Uint8Array(16);
        if (nodeCrypto.getRandomValues) nodeCrypto.getRandomValues(b);
        else {
          for (var i = 0; i < 16; i++) b[i] = (Math.random() * 256) | 0;
        }
        b[6] = (b[6] & 0x0f) | 0x40;
        b[8] = (b[8] & 0x3f) | 0x80;
        var h = [];
        for (var i = 0; i < b.length; i++) h.push((b[i] + 0x100).toString(16).slice(1));
        return h[0]+h[1]+h[2]+h[3]+'-'+h[4]+h[5]+'-'+h[6]+h[7]+'-'+h[8]+h[9]+'-'+h[10]+h[11]+h[12]+h[13]+h[14]+h[15];
      };
    }
  }
  // Some runtimes provide a partial or non-extensible window.crypto; keep Node-style methods on nodeCrypto.

  // Minimal, self-contained SHA-256 implementation (synchronous)
  function sha256(ascii) {
    function rightRotate(value, amount) {
      return (value>>>amount) | (value<<(32-amount));
    }

    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length'
    var i, j;
    var result = ''

    var words = [];
    var asciiBitLength = ascii[lengthProperty]*8;

    var K = [
      0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
    ];

    var H = [
      0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19
    ];

    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return;
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }

    words[asciiBitLength >> 5] |= 0x80 << (24 - asciiBitLength % 32);
    words[((asciiBitLength + 64 >> 9) << 4) + 15] = asciiBitLength;

    var w = new Array(64);
    for (var blockStart = 0; blockStart < words.length; blockStart += 16) {
      for (i = 0; i < 16; i++) w[i] = words[blockStart + i] | 0;
      for (i = 16; i < 64; i++) {
        var s0 = rightRotate(w[i-15], 7) ^ rightRotate(w[i-15], 18) ^ (w[i-15] >>> 3);
        var s1 = rightRotate(w[i-2], 17) ^ rightRotate(w[i-2], 19) ^ (w[i-2] >>> 10);
        w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
      }

      var a = H[0]; var b = H[1]; var c = H[2]; var d = H[3];
      var e = H[4]; var f = H[5]; var g = H[6]; var h = H[7];

      for (i = 0; i < 64; i++) {
        var S1 = rightRotate(e,6) ^ rightRotate(e,11) ^ rightRotate(e,25);
        var ch = (e & f) ^ (~e & g);
        var temp1 = (h + S1 + ch + K[i] + w[i]) | 0;
        var S0 = rightRotate(a,2) ^ rightRotate(a,13) ^ rightRotate(a,22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var temp2 = (S0 + maj) | 0;

        h = g; g = f; f = e; e = (d + temp1) | 0;
        d = c; c = b; b = a; a = (temp1 + temp2) | 0;
      }

      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0;
      H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0;
      H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }

    for (i = 0; i < H.length; i++) {
      for (j = 3; j + 1; j--) {
        var bv = (H[i] >> (j * 8)) & 255;
        var hex = (bv < 16 ? '0' : '') + bv.toString(16);
        result += hex;
      }
    }
    return result;
  }

  function hexToBase64(hex) {
    var bytes = [];
    for (var i = 0; i < hex.length; i += 2) {
      bytes.push(String.fromCharCode(parseInt(hex.substr(i, 2), 16)));
    }
    var bin = bytes.join('');
    if (typeof root.btoa === 'function') return root.btoa(bin);
    if (typeof Buffer !== 'undefined') return Buffer.from(bin, 'binary').toString('base64');
    if (typeof btoa === 'function') return btoa(bin);
    try {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      var i = 0, len = bin.length, out = '';
      while (i < len) {
        var c1 = bin.charCodeAt(i++) & 0xff;
        if (i == len) { out += chars.charAt(c1 >> 2); out += chars.charAt((c1 & 0x3) << 4); out += '=='; break; }
        var c2 = bin.charCodeAt(i++);
        if (i == len) { out += chars.charAt(c1 >> 2); out += chars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)); out += chars.charAt((c2 & 0xF) << 2); out += '='; break; }
        var c3 = bin.charCodeAt(i++);
        out += chars.charAt(c1 >> 2); out += chars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += chars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6)); out += chars.charAt(c3 & 0x3F);
      }
      return out;
    } catch (e) { return ''; }
  }

  // crypto.createHash
  if (!nodeCrypto.createHash) nodeCrypto.createHash = function(alg) {
    alg = String(alg || '').toLowerCase();
    var acc = '';
    return {
      update: function(data, inputEncoding) {
        if (typeof data === 'string') {
          acc += data;
        } else if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
          var u = data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
          var s = '';
          for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
          acc += s;
        } else if (data && data.toString) {
          acc += data.toString();
        }
        return this;
      },
      digest: function(enc) {
        enc = enc || 'hex';
        var hex = sha256(acc);
        if (enc === 'hex') return hex;
        if (enc === 'base64') return hexToBase64(hex);
        if (enc === 'binary') {
          var out = new Uint8Array(hex.length/2);
          for (var i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i*2,2),16);
          return out;
        }
        return hex;
      }
    };
  };

  // --- AES-CBC cipher/decipher support ---
  var _AES_S = [
    0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
    0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
    0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
    0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
    0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
    0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
    0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
    0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
    0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
    0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
    0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
    0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
    0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
    0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
    0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
    0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
  ];
  var _AES_SI = [
    0x52,0x09,0x6a,0xd5,0x30,0x36,0xa5,0x38,0xbf,0x40,0xa3,0x9e,0x81,0xf3,0xd7,0xfb,
    0x7c,0xe3,0x39,0x82,0x9b,0x2f,0xff,0x87,0x34,0x8e,0x43,0x44,0xc4,0xde,0xe9,0xcb,
    0x54,0x7b,0x94,0x32,0xa6,0xc2,0x23,0x3d,0xee,0x4c,0x95,0x0b,0x42,0xfa,0xc3,0x4e,
    0x08,0x2e,0xa1,0x66,0x28,0xd9,0x24,0xb2,0x76,0x5b,0xa2,0x49,0x6d,0x8b,0xd1,0x25,
    0x72,0xf8,0xf6,0x64,0x86,0x68,0x98,0x16,0xd4,0xa4,0x5c,0xcc,0x5d,0x65,0xb6,0x92,
    0x6c,0x70,0x48,0x50,0xfd,0xed,0xb9,0xda,0x5e,0x15,0x46,0x57,0xa7,0x8d,0x9d,0x84,
    0x90,0xd8,0xab,0x00,0x8c,0xbc,0xd3,0x0a,0xf7,0xe4,0x58,0x05,0xb8,0xb3,0x45,0x06,
    0xd0,0x2c,0x1e,0x8f,0xca,0x3f,0x0f,0x02,0xc1,0xaf,0xbd,0x03,0x01,0x13,0x8a,0x6b,
    0x3a,0x91,0x11,0x41,0x4f,0x67,0xdc,0xea,0x97,0xf2,0xcf,0xce,0xf0,0xb4,0xe6,0x73,
    0x96,0xac,0x74,0x22,0xe7,0xad,0x35,0x85,0xe2,0xf9,0x37,0xe8,0x1c,0x75,0xdf,0x6e,
    0x47,0xf1,0x1a,0x71,0x1d,0x29,0xc5,0x89,0x6f,0xb7,0x62,0x0e,0xaa,0x18,0xbe,0x1b,
    0xfc,0x56,0x3e,0x4b,0xc6,0xd2,0x79,0x20,0x9a,0xdb,0xc0,0xfe,0x78,0xcd,0x5a,0xf4,
    0x1f,0xdd,0xa8,0x33,0x88,0x07,0xc7,0x31,0xb1,0x12,0x10,0x59,0x27,0x80,0xec,0x5f,
    0x60,0x51,0x7f,0xa9,0x19,0xb5,0x4a,0x0d,0x2d,0xe5,0x7a,0x9f,0x93,0xc9,0x9c,0xef,
    0xa0,0xe0,0x3b,0x4d,0xae,0x2a,0xf5,0xb0,0xc8,0xeb,0xbb,0x3c,0x83,0x53,0x99,0x61,
    0x17,0x2b,0x04,0x7e,0xba,0x77,0xd6,0x26,0xe1,0x69,0x14,0x63,0x55,0x21,0x0c,0x7d
  ];
  var _AES_RC = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];

  function _aes_xt(a) { return ((a << 1) ^ (((a >>> 7) & 1) * 0x1b)) & 0xff; }

  function _aes_gm(a, b) {
    var p = 0;
    for (var i = 0; i < 8; i++) {
      if (b & 1) p ^= a;
      var hi = a & 0x80;
      a = (a << 1) & 0xff;
      if (hi) a ^= 0x1b;
      b >>>= 1;
    }
    return p;
  }

  function _aes_expand(key) {
    var kl = key.length, nk = kl >> 2, nr = nk + 6, tw = 4 * (nr + 1);
    var w = new Uint8Array(tw * 4);
    for (var i = 0; i < kl; i++) w[i] = key[i];
    for (var i = nk; i < tw; i++) {
      var t0 = w[(i-1)*4], t1 = w[(i-1)*4+1], t2 = w[(i-1)*4+2], t3 = w[(i-1)*4+3];
      if (i % nk === 0) {
        var u = t0; t0 = _AES_S[t1]; t1 = _AES_S[t2]; t2 = _AES_S[t3]; t3 = _AES_S[u];
        t0 ^= _AES_RC[(i / nk - 1) | 0];
      } else if (nk > 6 && i % nk === 4) {
        t0 = _AES_S[t0]; t1 = _AES_S[t1]; t2 = _AES_S[t2]; t3 = _AES_S[t3];
      }
      w[i*4]   = w[(i-nk)*4]   ^ t0;
      w[i*4+1] = w[(i-nk)*4+1] ^ t1;
      w[i*4+2] = w[(i-nk)*4+2] ^ t2;
      w[i*4+3] = w[(i-nk)*4+3] ^ t3;
    }
    return w;
  }

  function _aes_encBlock(block, rk, nr) {
    var s = new Uint8Array(block);
    var i, r, t;
    for (i = 0; i < 16; i++) s[i] ^= rk[i];
    for (r = 1; r < nr; r++) {
      var o = r * 16;
      for (i = 0; i < 16; i++) s[i] = _AES_S[s[i]];
      t = s[1]; s[1] = s[5]; s[5] = s[9]; s[9] = s[13]; s[13] = t;
      t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
      t = s[15]; s[15] = s[11]; s[11] = s[7]; s[7] = s[3]; s[3] = t;
      for (i = 0; i < 16; i += 4) {
        var a = s[i], b = s[i+1], c = s[i+2], d = s[i+3];
        s[i]   = _aes_xt(a) ^ (_aes_xt(b) ^ b) ^ c ^ d;
        s[i+1] = a ^ _aes_xt(b) ^ (_aes_xt(c) ^ c) ^ d;
        s[i+2] = a ^ b ^ _aes_xt(c) ^ (_aes_xt(d) ^ d);
        s[i+3] = (_aes_xt(a) ^ a) ^ b ^ c ^ _aes_xt(d);
      }
      for (i = 0; i < 16; i++) s[i] ^= rk[o + i];
    }
    for (i = 0; i < 16; i++) s[i] = _AES_S[s[i]];
    t = s[1]; s[1] = s[5]; s[5] = s[9]; s[9] = s[13]; s[13] = t;
    t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
    t = s[15]; s[15] = s[11]; s[11] = s[7]; s[7] = s[3]; s[3] = t;
    for (i = 0; i < 16; i++) s[i] ^= rk[nr * 16 + i];
    return s;
  }

  function _aes_decBlock(block, rk, nr) {
    var s = new Uint8Array(block);
    var i, r, t;
    for (i = 0; i < 16; i++) s[i] ^= rk[nr * 16 + i];
    for (r = nr - 1; r > 0; r--) {
      var o = r * 16;
      t = s[13]; s[13] = s[9]; s[9] = s[5]; s[5] = s[1]; s[1] = t;
      t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
      t = s[3]; s[3] = s[7]; s[7] = s[11]; s[11] = s[15]; s[15] = t;
      for (i = 0; i < 16; i++) s[i] = _AES_SI[s[i]];
      for (i = 0; i < 16; i++) s[i] ^= rk[o + i];
      for (i = 0; i < 16; i += 4) {
        var a = s[i], b = s[i+1], c = s[i+2], d = s[i+3];
        s[i]   = _aes_gm(a,14) ^ _aes_gm(b,11) ^ _aes_gm(c,13) ^ _aes_gm(d,9);
        s[i+1] = _aes_gm(a,9)  ^ _aes_gm(b,14) ^ _aes_gm(c,11) ^ _aes_gm(d,13);
        s[i+2] = _aes_gm(a,13) ^ _aes_gm(b,9)  ^ _aes_gm(c,14) ^ _aes_gm(d,11);
        s[i+3] = _aes_gm(a,11) ^ _aes_gm(b,13) ^ _aes_gm(c,9)  ^ _aes_gm(d,14);
      }
    }
    t = s[13]; s[13] = s[9]; s[9] = s[5]; s[5] = s[1]; s[1] = t;
    t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
    t = s[3]; s[3] = s[7]; s[7] = s[11]; s[11] = s[15]; s[15] = t;
    for (i = 0; i < 16; i++) s[i] = _AES_SI[s[i]];
    for (i = 0; i < 16; i++) s[i] ^= rk[i];
    return s;
  }

  function _toU8(d) {
    if (d instanceof Uint8Array) return d;
    if (typeof d === 'string') return new TextEncoder().encode(d);
    if (d && d._bytes) {
      var b = new Uint8Array(d.length);
      for (var i = 0; i < d.length; i++) b[i] = (d[i] !== undefined ? d[i] : d._bytes[i]) & 0xff;
      return b;
    }
    if (Array.isArray(d)) return new Uint8Array(d);
    if (d && typeof d.length === 'number') {
      var b = new Uint8Array(d.length);
      for (var i = 0; i < d.length; i++) b[i] = d[i] & 0xff;
      return b;
    }
    return new Uint8Array(0);
  }

  function _makeBuf(bytes) {
    if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
      return Buffer.from(bytes);
    }
    var o = { length: bytes.length, _bytes: new Uint8Array(bytes) };
    for (var i = 0; i < bytes.length; i++) o[i] = bytes[i];
    return o;
  }

  function _aes_cbcEnc(data, key, iv) {
    var kb = _toU8(key), ivb = _toU8(iv);
    var nr = (kb.length >> 2) + 6, rk = _aes_expand(kb);
    var pad = 16 - (data.length % 16);
    var p = new Uint8Array(data.length + pad);
    p.set(data);
    for (var i = data.length; i < p.length; i++) p[i] = pad;
    var out = new Uint8Array(p.length), prev = ivb;
    for (var i = 0; i < p.length; i += 16) {
      for (var j = 0; j < 16; j++) p[i + j] ^= prev[j];
      var enc = _aes_encBlock(p.subarray(i, i + 16), rk, nr);
      out.set(enc, i);
      prev = enc;
    }
    return out;
  }

  function _aes_cbcDec(data, key, iv) {
    var kb = _toU8(key), ivb = _toU8(iv);
    var nr = (kb.length >> 2) + 6, rk = _aes_expand(kb);
    var out = new Uint8Array(data.length), prev = ivb;
    for (var i = 0; i < data.length; i += 16) {
      var blk = data.subarray(i, i + 16);
      var dec = _aes_decBlock(blk, rk, nr);
      for (var j = 0; j < 16; j++) out[i + j] = dec[j] ^ prev[j];
      prev = new Uint8Array(blk);
    }
    var pad = out[out.length - 1];
    if (pad >= 1 && pad <= 16) {
      var valid = true;
      for (var i = out.length - pad; i < out.length; i++) {
        if (out[i] !== pad) { valid = false; break; }
      }
      if (valid) out = out.subarray(0, out.length - pad);
    }
    return out;
  }

  function _parseAESCBC(algorithm) {
    var m = /^aes-(128|192|256)-cbc$/i.exec(algorithm);
    if (!m) return 0;
    return parseInt(m[1]) >> 3;
  }

  if (!nodeCrypto.createCipheriv) nodeCrypto.createCipheriv = function(algorithm, key, iv) {
    var kl = _parseAESCBC(algorithm);
    if (!kl) throw new Error('Unsupported cipher: ' + algorithm);
    var kb = _toU8(key), ivb = _toU8(iv), chunks = [];
    return {
      update: function(data) { chunks.push(_toU8(data)); return _makeBuf(new Uint8Array(0)); },
      final: function() {
        var total = 0;
        for (var i = 0; i < chunks.length; i++) total += chunks[i].length;
        var all = new Uint8Array(total), off = 0;
        for (var i = 0; i < chunks.length; i++) { all.set(chunks[i], off); off += chunks[i].length; }
        chunks = [];
        return _makeBuf(_aes_cbcEnc(all, kb, ivb));
      }
    };
  };

  if (!nodeCrypto.createDecipheriv) nodeCrypto.createDecipheriv = function(algorithm, key, iv) {
    var kl = _parseAESCBC(algorithm);
    if (!kl) throw new Error('Unsupported cipher: ' + algorithm);
    var kb = _toU8(key), ivb = _toU8(iv), chunks = [];
    return {
      update: function(data) { chunks.push(_toU8(data)); return _makeBuf(new Uint8Array(0)); },
      final: function() {
        var total = 0;
        for (var i = 0; i < chunks.length; i++) total += chunks[i].length;
        var all = new Uint8Array(total), off = 0;
        for (var i = 0; i < chunks.length; i++) { all.set(chunks[i], off); off += chunks[i].length; }
        chunks = [];
        return _makeBuf(_aes_cbcDec(all, kb, ivb));
      }
    };
  };

  // Best-effort mirror for legacy code that directly accesses window.crypto.createHash/createDecipheriv.
  if (webCrypto && webCrypto !== nodeCrypto) {
    try {
      if (!webCrypto.createHash && nodeCrypto.createHash) webCrypto.createHash = nodeCrypto.createHash;
      if (!webCrypto.createCipheriv && nodeCrypto.createCipheriv) webCrypto.createCipheriv = nodeCrypto.createCipheriv;
      if (!webCrypto.createDecipheriv && nodeCrypto.createDecipheriv) webCrypto.createDecipheriv = nodeCrypto.createDecipheriv;
    } catch (e) {}
  }

  try {
    console.log(
      DIAG_PREFIX + ' init',
      'nodeCrypto.createHash=' + typeof nodeCrypto.createHash,
      'nodeCrypto.createCipheriv=' + typeof nodeCrypto.createCipheriv,
      'nodeCrypto.createDecipheriv=' + typeof nodeCrypto.createDecipheriv,
      'webCrypto.createHash=' + typeof webCrypto.createHash,
      'webCrypto.createCipheriv=' + typeof webCrypto.createCipheriv,
      'webCrypto.createDecipheriv=' + typeof webCrypto.createDecipheriv,
      'sameObject=' + (webCrypto === nodeCrypto),
      'webCryptoExtensible=' + (webCrypto && typeof Object.isExtensible === 'function' ? Object.isExtensible(webCrypto) : 'unknown')
    );
  } catch (e) {
    console.warn(DIAG_PREFIX + ' init log failed:', e && e.message ? e.message : e);
  }
})();
