import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import logo from './logo.png'
import send from './send.png'
import ReactLoading from 'react-loading';

import * as firebase from 'firebase/app';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, orderBy, query, onSnapshot, limit, limitToLast }  from 'firebase/firestore';

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

const appHeight = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
const landscape = () => document.documentElement.style.setProperty('--app-width', `${window.innerWidth}px`)
window.addEventListener('resize', appHeight);
window.addEventListener('resize', landscape);
appHeight();
landscape();

function App() {

  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header className="App-header">
        <div className='wrapper'>
          {user ? <Chat />: <SignIn />} 
        </div>
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

  const prop = props;

  const[loading, setLoading] = useState(true);

  const memes = ["Loading dank memes", "Invoking dark magic", "very science, wow much application, so technology", "beep boop beep plotting destruction of humanity"];
  const screen = ["spinningBubbles", "balls", "bars", "bubbles", "cubes", "cylon", "spin", "spokes"];

  useEffect(() => {
    setTimeout(() => {
      setLoading();
      prop.update();  
    }, 4000);
  }, [])

  return auth.currentUser && (
    <>
      {loading ? <> <ReactLoading type={screen[Math.floor(Math.random() * 8)]} color={"#ffffff"} height={200} width={200} /> <br></br> <p>{memes[Math.floor(Math.random() * 4)]}</p> </>
      :
      <>
        <div className='top'><p>Not Messenger</p>
          <img src={logo} alt='logo'></img>
          <button id='sign_out' onClick={() => auth.signOut()}>Sign Out</button>
        </div>
      </>
      }
    </>
  );
}

function Chat() {

  const anchor = useRef();

  const [querySnapshot] = useCollectionData(query(collection(firestore, "Chat_general"), orderBy("createdAt"), limitToLast(50)));

  const [loading, setLoading] = useState(false);

  // garde ça pour faire le chargement
  
  // const scrollonsnap = onSnapshot(collection(firestore, "Chat_general"), () => {
  //   if (document.getElementById("scroll") && anchor.current) {
  //     const sc = document.getElementById("scroll");
  //     if(sc.scrollHeight - sc.scrollTop < 1000) {
  //       anchor.current.scrollIntoView({ behavior: 'smooth' });
  //     }
  //   }
  // });

  const scrollonsnap = onSnapshot(collection(firestore, "Chat_general"), () => {
    if (anchor.current) {
      anchor.current.scrollIntoView({ behavior: 'smooth' });
    }
  });

  const sendMessage = async (e,resetform,formValue) => {

    e.preventDefault();

    await addDoc(collection(firestore, "Chat_general"), {
      text: formValue,
      user: auth.currentUser.uid,
      createdAt: serverTimestamp(firestore),
      url: auth.currentUser.photoURL
    })
    resetform();
  }

  let upstate = () => {setLoading(true)}

  return (
    <>
      {loading ? 
        <>
          <div onScroll={(e) => e.target.scrollTop} id='scroll' className='chatbox'>
            {querySnapshot && querySnapshot.map((msg, index) => <ChatMessage key={index} message={msg} />)}
            <span ref={anchor}></span>
          </div>
          <Form send_msg={sendMessage}/>
        </>
        : <></>}
      <SignOut update={upstate}/>
    </>
  );
}

function Form(props) {

const [formValue, setFormValue] = useState('');

let resetform = () => {setFormValue('')}

return (
  <form onSubmit={(e) => props.send_msg(e,resetform,formValue)}>
    <input className='inp' value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder=" Type a message..." />
    {/* Send icons created by Freepik - Flaticon */}
    <button className='send' type="submit" disabled={!formValue || formValue.trim() === ""}><img alt='send_logo' src={send} className='emoji'></img></button>
  </form>
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
