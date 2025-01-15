// ./functions/src/index.ts

import * as functions from 'firebase-functions';

// Przykładowa prosta funkcja Firebase
export const helloWorld = functions.https.onRequest((request, response) => {
  response.json({ message: "Hello from Firebase!" });
});