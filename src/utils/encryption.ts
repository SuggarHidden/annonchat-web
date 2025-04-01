export async function encrypt(text: string, password: string): Promise<string> {
  // Convertir la contraseña y el texto a ArrayBuffer
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const textData = encoder.encode(text);

  // Generar salt aleatorio
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derivar clave usando PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  // Generar IV aleatorio
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encriptar
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    textData
  );

  // Convertir los datos a formato que se pueda almacenar
  const encryptedArray = new Uint8Array(encryptedData);
  const saltString = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const ivString = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
  const encryptedString = Array.from(encryptedArray).map(b => b.toString(16).padStart(2, '0')).join('');

  return `${saltString}:${ivString}:${encryptedString}`;
}

export async function decrypt(encryptedText: string, password: string): Promise<string> {
  try {
    const [saltHex, ivHex, encryptedHex] = encryptedText.split(':');

    // Convertir de hex a Uint8Array
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const encryptedData = new Uint8Array(encryptedHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    // Convertir la contraseña a ArrayBuffer
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    // Derivar clave usando PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // Desencriptar
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encryptedData
    );

    // Convertir el resultado a texto
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Error al desencriptar:', error);
    return "";
  }
}