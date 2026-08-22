// 前端密码密码公钥加密

/**
 * 将 PEM 格式的公钥转换为 Web Crypto 可识别的 ArrayBuffer
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s/g, "");
  const binaryString = atob(b64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * 使用 RSA-OAEP (SHA-256) 加密文本
 * @param text 待加密的明文密码
 * @param pemPublicKey PEM 格式公钥字符串
 */
async function encryptPassword(text: string, pemPublicKey: string): Promise<string> {
  const publicKeyBuffer = pemToArrayBuffer(pemPublicKey);

  // 导入公钥
  const publicKey = await window.crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"],
  );

  // 加密数据
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const encryptedBuffer = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, data);

  // 转为 Base64 字符串用于网络传输
  return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
}

// 使用加密级随机数生成器
function generateNonce(length = 16): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// 生成密码
export async function getEncryptPwd(password: string): Promise<string> {
  const timestamp = Date.now(); // 毫秒时间戳
  const nonce = generateNonce();

  // 将三者用特定分隔符拼接
  // 格式: password|timestamp|nonce
  const rawData = `${password}|${timestamp}|${nonce}`;

  const res = await fetch("/public_key.pem");
  const publicKeyPem = await res.text();

  // 用公钥整体加密
  const encryptedData = await encryptPassword(rawData, publicKeyPem);

  return encryptedData;
}
