// クライアントサイドでのパスワードハッシュ化（TypeScript）
// Thank you claude.ai with writing it!!

export interface HashedPassword {
    salt: string;
    hash: string;
}

export async function hashPassword(password: string): Promise<HashedPassword> {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const passwordBuffer = encoder.encode(password);
    const iterations = 100000;
    const hashBuffer = await crypto.subtle.deriveBits(
        {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
        },
        await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
        ),
        256
    );

    return {
        salt: bufferToHex(salt),
        hash: bufferToHex(new Uint8Array(hashBuffer))
    };
}

export async function verifyPassword(password: string, hashedPassword: HashedPassword): Promise<boolean> {
    const encoder = new TextEncoder();
    const salt = hexToBuffer(hashedPassword.salt);

    const passwordBuffer = encoder.encode(password);
    const iterations = 100000;
    const hashBuffer = await crypto.subtle.deriveBits(
        {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
        },
        await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
        ),
        256
    );

    const newHash = bufferToHex(new Uint8Array(hashBuffer));
    return newHash === hashedPassword.hash;
}

function bufferToHex(buffer: Uint8Array): string {
    return Array.from(buffer)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function hexToBuffer(hex: string): Uint8Array {
    const matches = hex.match(/.{1,2}/g);
    return new Uint8Array(matches ? matches.map(byte => parseInt(byte, 16)) : []);
}