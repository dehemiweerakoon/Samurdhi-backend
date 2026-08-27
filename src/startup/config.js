import config from 'config';

export default function () {
    // Prefer environment variable, fall back to config package if present.
    let jwtKey;
    try {
        jwtKey = process.env.JWT_PRIVATE_KEY || config.get('jwtPrivateKey');
    } catch (err) {
        jwtKey = process.env.JWT_PRIVATE_KEY;
    }

    if (!jwtKey) {
        // For development, warn instead of crashing. To enforce, replace console.warn with throw.
        console.warn('Warning: jwtPrivateKey not set. Set JWT_PRIVATE_KEY env var or provide config/jwtPrivateKey.');
    }
}
