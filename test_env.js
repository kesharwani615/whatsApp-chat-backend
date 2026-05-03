import 'dotenv/config';
console.log('Keys:', Object.keys(process.env).filter(k => k.startsWith('FIREBASE_')));
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('Project ID (with space):', process.env['FIREBASE_PROJECT_ID ']);
