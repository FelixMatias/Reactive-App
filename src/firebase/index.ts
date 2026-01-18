import { initializeApp } from "firebase/app";
import * as Firestore from "firebase/firestore";

/** * FIREBASE CONFIGURATION 
 * This identifies your specific project in the Google Cloud Console.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDOn4SQJBHdw35zycAxobGheGr0_3X8bCY",
  authDomain: "bim-dev-master-653a8.firebaseapp.com",
  projectId: "bim-dev-master-653a8",
  storageBucket: "bim-dev-master-653a8.firebasestorage.app",
  messagingSenderId: "1090668653951",
  appId: "1:1090668653951:web:3ffd1ebebbbc651c7c3e4a"
};

// Initialize the core Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore (The Database)
export const firestoreDB = Firestore.getFirestore(app);

/** * OFFLINE PERSISTENCE
 * Allows the BIM app to work without internet. Changes are saved locally 
 * in the browser and synced automatically when the connection returns.
 */
Firestore.enableIndexedDbPersistence(firestoreDB).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Persistence failed: multiple tabs open");
  } else if (err.code === "unimplemented") {
    console.warn("Persistence not supported by browser");
  }
});

/** * getCollection<T>
 * A generic helper that points to a specific path in the database.
 * Use <T> to tell TypeScript what kind of data (Project or Todo) to expect.
 */
export function getCollection<T>(path: string) {
  return Firestore.collection(firestoreDB, path) as Firestore.CollectionReference<T>;
}

/** * getDocuments<T> (SMART FETCHING)
 * Fetches all items from a path (e.g., "projects" or "projects/ID/todos").
 * It maps the raw Firestore data into a clean JavaScript array for the UI.
 */
export async function getDocuments<T>(path: string): Promise<T[]> {
  const colRef = getCollection<T>(path);
  const querySnapshot = await Firestore.getDocs(colRef);
  // We extract the data and include the document ID in the final object
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T));
}

/** * addDocument
 * Creates a NEW record and lets Firebase generate a random, unique ID.
 * Best used when creating a brand new Project.
 */
export async function addDocument<T extends Record<string, any>>(path: string, data: T): Promise<string> {
  const colRef = getCollection<T>(path);
  const docRef = await Firestore.addDoc(colRef, data);
  return docRef.id; // Returns the auto-generated ID
}

/** * setDocument
 * Creates or Overwrites a record using a specific ID provided by the app.
 * Essential for your Todos since we generate UUIDs on the frontend.
 */
export async function setDocument<T extends Record<string, any>>(path: string, id: string, data: T) {
  const docRef = Firestore.doc(firestoreDB, `${path}/${id}`);
  await Firestore.setDoc(docRef, data);
}

/** * updateDocument (SURGICAL EDIT)
 * Modifies ONLY the specific fields provided (e.g., updating just the 'status').
 * This is highly efficient because it doesn't overwrite the whole document.
 */
export async function updateDocument<T extends Record<string, any>>(path: string, id: string, data: Partial<T>) {
  const docRef = Firestore.doc(firestoreDB, `${path}/${id}`);
  await Firestore.updateDoc(docRef, data as any);
}

/** * deleteDocument (PERMANENT REMOVAL)
 * Erases a specific document from the cloud using its path and ID.
 * Targets exactly what you want to remove (e.g., "projects/PID/todos/TID").
 */
export async function deleteDocument(path: string, id: string) {
  const docRef = Firestore.doc(firestoreDB, `${path}/${id}`);
  await Firestore.deleteDoc(docRef);
}