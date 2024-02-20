const { auth } = require('firebase-admin');
const { initializeApp } = require('firebase-admin/app');

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

initializeApp(config);

// Middleware to authenticate Firebase token
const authenticateFirebase = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).send('Authorization header is required');
  }

  const token = authorizationHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth().verifyIdToken(token);
    req.user = decodedToken; // or just req.uid = decodedToken.uid if you prefer
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized');
  }
};

module.exports = {
  authenticateFirebase
};
