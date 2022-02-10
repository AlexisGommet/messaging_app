import React, { useRef, useState } from 'react';
import './App.css';
import ReactLoading from 'react-loading';

import * as firebase from 'firebase/app';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, orderBy, query }  from 'firebase/firestore';

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
      {user ? <Chat />: <SignIn />} 
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

function SignOut(props) {

  const[loading, setloading] = useState(true);

  const memes = ["Loading dank memes", "Invoking dark magic", "very science, wow much application, so technology", "beep boop beep plotting destruction of humanity"];
  const screen = ["spinningBubbles", "balls", "bars", "bubbles", "cubes", "cylon", "spin", "spokes"];

  setTimeout(() => {
    setloading(false);
    props.update(true);
  }, 4000);

  return auth.currentUser && (
    <>
      {loading ? <> <ReactLoading type={screen[Math.floor(Math.random() * 8)]} color={"#ffffff"} height={200} width={200} /> <br></br> <p>{memes[Math.floor(Math.random() * 4)]}</p> </>
      :
      <>
        <button className='Sign_in_button' onClick={() => auth.signOut()}>Sign Out</button>
      </>
      }
    </>
  );
}

function Chat() {

  const anchor = useRef();

  const chatref = collection(firestore, "Chat_general");
  const q = query(chatref, orderBy("createdAt"))
  const [querySnapshot] = useCollectionData(q);

  const [formValue, setFormValue] = useState('');
  const [loading, setloading] = useState(false);

  const sendMessage = async (e) => {

    e.preventDefault();

    await addDoc(collection(firestore, "Chat_general"), {
      text: formValue,
      user: auth.currentUser.uid,
      createdAt: serverTimestamp(firestore),
      url: auth.currentUser.photoURL
    })
    setFormValue('');
    anchor.current.scrollIntoView({ behavior: 'smooth' });
  }

  let upstate = (state) => {setloading({state})}

  return (
    <>
    <SignOut update={upstate}/>
    {loading ? 
      <>
        <div className='chatbox'>{querySnapshot && querySnapshot.map((msg, index) => <ChatMessage key={index} message={msg} />)}</div>
        <span ref={anchor}></span>
        <form onSubmit={sendMessage}>
          <input className='inp' value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type a message..." />
          <button className='send' type="submit" disabled={!formValue}>&#x2B9E;</button>
        </form>
      </>
      : <></>}
    </>
  );
}

function ChatMessage(props) {

  const messageClass = props.message.user === auth.currentUser.uid ? 'sent' : 'received';

return (
  <div className={`message ${messageClass}`}>
    <img alt='userphoto' src={props.message.url} />
    <p>{props.message.text}</p>
  </div> 
);
}

export default App;
