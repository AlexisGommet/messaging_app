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
import { getFirestore, collection, addDoc, serverTimestamp, orderBy, query, onSnapshot, limitToLast }  from 'firebase/firestore';

firebase.initializeApp({
    apiKey: "AIzaSyANIQzL74x4IWdwSqKNnK6552vGnrUaVeU",
    authDomain: "messaging-b6c1c.firebaseapp.com",
    projectId: "messaging-b6c1c",
    storageBucket: "messaging-b6c1c.appspot.com",
    messagingSenderId: "522534076303",
    appId: "1:522534076303:web:20b4491c656aff1bdb55fa",
    measurementId: "G-QRKBHTYSCJ"
})

// TODO : commentez code et réduire les occurences des heures

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
  const listRef = useRef();
  const previousScrollDiff = useRef(0);
  const canload = useRef(false);
  const scrollonload = useRef(false);

  const [loading, setLoading] = useState(false);
  const [loadmore, setLoadMore] = useState(30);
  

  const [querySnapshot] = useCollectionData(query(collection(firestore, "Chat_general"), orderBy("createdAt"), limitToLast(loadmore)));

  // TODO : commentez code et réduire les occurences des heures

  let day = "0";
  const setDay = (newday) => {day = newday;}
  const getDay = () => {return day;}
  let dayint = 0;
  const getDayInt = () => {return dayint;}
  const setDayInt = (newdayint) => {dayint = newdayint;}
  let hour = "00:00";
  const getHour = () => {return hour;}
  const setHour= (newhour) => {hour = newhour;}

  const scrollonsnap = onSnapshot(collection(firestore, "Chat_general"), () => {
    if (anchor.current && canload.current) {
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

  // TODO : commentez code et réduire les occurences des heures

  useEffect(() => {
    setTimeout(() => {
      scrollonload.current = true;  
    }, 1000);
  }, [])

  useEffect(() => {
    canload.current = false; 
    setTimeout(() => {
      canload.current = true;  
    }, 100);
  })

  const load = (scrollTop, scrollHeight) => {  
    if(scrollHeight - scrollTop > scrollHeight * 0.98 && canload.current && loadmore <= querySnapshot.length){
      previousScrollDiff.current = listRef.current.scrollHeight - listRef.current.scrollTop;
      setLoadMore(loadmore + 10);  
    } 
  }

  // TODO : commentez code et réduire les occurences des heures

  let upstate = () => {setLoading(true)}

   useEffect(()=>{
    if(listRef.current && scrollonload.current){
      listRef.current.scroll({
        top: listRef.current.scrollHeight - previousScrollDiff.current,
        left: 0,
        behavior: 'instant'
      });
    }
   })

  return (
    <>
      {loading ? 
        <>
          <div onScroll={(e) => load(e.target.scrollTop, e.target.scrollHeight)} id='scroll' className='chatbox' ref={listRef}>
            {querySnapshot && querySnapshot.map((msg, index) => <ChatMessage key={index} message={msg} d={getDay} ds={setDay} di={getDayInt} dis={setDayInt} h={getHour} hs={setHour}/>)}
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
  let hour = "";
  let dayint2 = "";
  let newdaystr = "";
  let current_day = "";

  if(props.message.createdAt){
    hour = props.message.createdAt.toDate().toString().substr(16,5);
    dayint2 = parseInt(props.message.createdAt.toDate().toString().substr(8,2));
    newdaystr = props.message.createdAt.toDate().toString().substr(4,6);
    current_day = props.message.createdAt.valueOf();
  }

  const dayint = props.di();
  const day = props.d();
  const newday = (day === current_day) || (day < current_day && dayint !== dayint2);
  const old_hour = parseInt(props.h().substr(0,2));
  const new_hour = parseInt(hour.substr(0,2));
  const old_minutes = parseInt(props.h().substr(3,2));
  const new_minutes = parseInt(hour.substr(3,2))
  const newhour =  (old_hour <= new_hour  && old_minutes + 5 <= new_minutes) || newday;
  
  if(newday){props.ds(current_day);props.dis(dayint2);}
  if(newhour){props.hs(hour);}

  return (
    <>
    {newday ? <><br></br><div className='newday'>{newdaystr}</div><br></br></> : <></>}
    <div className={`message ${messageClass}`}>
      <img alt='userphoto' src={props.message.url} />
      <p>{props.message.text}</p>
      {newhour ? <p id='hour'>{hour}</p> : <></>} 
    </div>
    </>
  );
}
// format de date
// Tue Feb 15 2022 21:44:22 GMT+0100 (heure normale d’Europe centrale)

export default App;
