import React, { useRef, useState } from 'react';
import './App.css';
import ReactLoading from 'react-loading';

import * as firebase from 'firebase/app';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

firebase.initializeApp({
    apiKey: "AIzaSyANIQzL74x4IWdwSqKNnK6552vGnrUaVeU",
    authDomain: "messaging-b6c1c.firebaseapp.com",
    projectId: "messaging-b6c1c",
    storageBucket: "messaging-b6c1c.appspot.com",
    messagingSenderId: "522534076303",
    appId: "1:522534076303:web:20b4491c656aff1bdb55fa",
    measurementId: "G-QRKBHTYSCJ"
})

const analytics = getAnalytics();
const auth = getAuth();
const firestore = getFirestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        {user ? <SignOut /> : <SignIn />}
      </header>
    </div>
  );
}

function SignIn() {

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  return (
    <>
      <p>Click the button to login</p>
      <button className='Sign_in_button' onClick={login}>Sign in</button>
    </>
  );
}

function SignOut() {

  const[loading, setloading] = useState(true);

  const memes = ["Loading dank memes", "Invoking dark magic", "very science, wow much application, so technology", "beep boop beep plotting destruction of humanity"];
  const index = Math.floor(Math.random() * 4);

  const text = "Hello\nHere is your user info\nName: "+auth.currentUser.displayName+"\nUser id: "+auth.currentUser.uid+"\nMail: "+auth.currentUser.email+"";
  const newText = text.split ('\n').map ((item, i) => <p key={i}>{item}</p>);

  setTimeout(() => {
    setloading(false);
  }, 4000);

  return (
    <>
      {loading ?<> <ReactLoading type={"spinningBubbles"} color={"#ffffff"} height={200} width={200} /> <br></br> <p>{memes[index]}</p> </>
      :
      <>
      <div>{newText}</div>
      <button className='Sign_in_button' onClick={() => auth.signOut()}>Sign Out</button>
    </>
    }
    </>
  );
}

export default App;