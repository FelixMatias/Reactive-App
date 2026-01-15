import * as Firestore from "firebase/firestore";
import { initializeApp } from "firebase/app"

const firebaseConfig = {
  apiKey: "AIzaSyDOn4SQJBHdw35zycAxobGheGr0_3X8bCY",
  authDomain: "bim-dev-master-653a8.firebaseapp.com",
  projectId: "bim-dev-master-653a8",
  storageBucket: "bim-dev-master-653a8.firebasestorage.app",
  messagingSenderId: "1090668653951",
  appId: "1:1090668653951:web:3ffd1ebebbbc651c7c3e4a"
};

const app = initializeApp(firebaseConfig);
export const firestoreDB = Firestore.getFirestore(app);

export function getCollection<T>(path: string) {
  return Firestore.collection(firestoreDB, path) as Firestore.CollectionReference<T>
}

export async function deleteDocument(path: string, id: string) {
  const doc = Firestore.doc(firestoreDB, `${path}/${id}`)
  await Firestore.deleteDoc(doc)
}

export async function updateDocument<T extends Record<string, any>>(path: string, id: string, data: T) {
  const doc = Firestore.doc(firestoreDB, `${path}/${id}`)
  await Firestore.updateDoc(doc, data)
}
