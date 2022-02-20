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

// TODO : Enlevez photo pour messages suivants (5 min) et les rapprochez

const analytics = getAnalytics();
const auth = getAuth();
const firestore = getFirestore();

// Get height and width for landscape mode
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

  const[loading, setLoading] = useState(true);

  const memes = ["Loading dank memes", "Invoking dark magic", "very science, wow much application, so technology", "beep boop beep plotting destruction of humanity"];
  const screen = ["spinningBubbles", "balls", "bars", "bubbles", "cubes", "cylon", "spin", "spokes"];

  // Show loading screen then the sign out button and the chatroom and scroll to bottom 
  useEffect(() => {
    setTimeout(() => {
      setLoading();
      props.update();  
      props.scroll();
    }, 4000);
  }, [])

  return auth.currentUser && (
    <>
      {loading ? <> <ReactLoading type={screen[Math.floor(Math.random() * screen.length)]} color={"#ffffff"} height={200} width={200} /> <br></br> <p>{memes[Math.floor(Math.random() * memes.length)]}</p> </>
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
  const canload = useRef(true);
  const scrollonload = useRef(false);
  const snapshot = useRef(false);

  const [loading, setLoading] = useState(false); 
  // Load more messages for tall screens else the loading of more messages on scroll to top will break
  const [loadmore, setLoadMore] = useState(window.innerHeight > 1100 ? 30 : 15);
  
  // Get collection for this chat
  const [querySnapshot] = useCollectionData(query(collection(firestore, "Chat_general"), orderBy("createdAt"), limitToLast(loadmore)));

  // TODO : Enlevez photo pour messages suivants (5 min) et les rapprochez

  let day = "0";
  const setDay = (newday) => {day = newday;}
  const getDay = () => {return day;}
  let dayint = 0;
  const getDayInt = () => {return dayint;}
  const setDayInt = (newdayint) => {dayint = newdayint;}
  let hour = "00:00";
  const getHour = () => {return hour;}
  const setHour = (newhour) => {hour = newhour;}
  let hourf = "0";
  const getHourf = () => {return hourf;}
  const setHourf = (newhour) => {hourf = newhour;}

  // Scroll to bottom on other people's messages
  const scrollonsnap = onSnapshot(collection(firestore, "Chat_general"), () => {
    if (anchor.current && canload.current) {
      // Deactivate instant scroll to top position if it's a snapshot for 100 ms
      snapshot.current = true;
      setTimeout(() => {
        snapshot.current = false;  
      }, 100);
      anchor.current.scrollIntoView({ behavior: 'smooth' });
    }
  });

  const sendMessage = async (e,resetform,formValue) => {
    
    // Prevent refresh of the page on form submit
    e.preventDefault();

    await addDoc(collection(firestore, "Chat_general"), {
      text: formValue,
      user: auth.currentUser.uid,
      createdAt: serverTimestamp(firestore),
      url: auth.currentUser.photoURL
    })
    resetform();
  }

  // TODO : Enlevez photo pour messages suivants (5 min) et les rapprochez

  // To not scroll instantly to bottom on first render
  useEffect(() => {
    setTimeout(() => {
      scrollonload.current = true;  
    }, 4100);
  }, [])

  // 100 ms buffer to not scroll to bottom on re-render for loading more messages
  useEffect(() => {
    canload.current = false; 
    setTimeout(() => {
      canload.current = true;  
    }, 100);
    // Set previous scroll height before loading messages, to give impression that window didn't move and just expanded upward
    if(listRef.current && scrollonload.current && !snapshot.current){
      listRef.current.scroll({
        top: listRef.current.scrollHeight - previousScrollDiff.current,
        left: 0,
        behavior: 'instant'
    });
    }
  })

  // If user scroll to the top, get actual scroll height and load more messages
  const load = (scrollTop, scrollHeight) => {  
    if(scrollHeight - scrollTop > scrollHeight * 0.98 && canload.current && loadmore <= querySnapshot.length && scrollonload.current){
      previousScrollDiff.current = listRef.current.scrollHeight - listRef.current.scrollTop;
      setLoadMore(loadmore + 10);  
    } 
  }

  // TODO : Enlevez photo pour messages suivants (5 min) et les rapprochez

  // Props for SignOut
  let upstate = () => {setLoading(true)}

  let scroll = () => {anchor.current.scrollIntoView({ behavior: 'smooth' });}

  return (
    <>
      {loading ? 
        <>
          <div onScroll={(e) => load(e.target.scrollTop, e.target.scrollHeight)} id='scroll' className='chatbox' ref={listRef}>
            {querySnapshot && querySnapshot.map((msg, index) => <ChatMessage key={index} message={msg} d={getDay} ds={setDay} di={getDayInt} dis={setDayInt} h={getHour} hs={setHour} hf={getHourf} hfs={setHourf}/>)}
            <span ref={anchor}></span>
          </div>
          <Form send_msg={sendMessage}/>
        </>
        : <></>}
      <SignOut update={upstate} scroll={scroll}/>
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
  
  // Give message proper css class if the current user sent it or not
  const messageClass = props.message.user === auth.currentUser.uid ? 'sent' : 'received';

  // Manipulation of createdAt property to know if a day or hour timestamp should be displayed
  // ******************************************************************************************************* //
  let hour = "";
  let dayint2 = "";
  let newdaystr = "";
  let current_day = "";

  if(props.message.createdAt){
    const mes = props.message.createdAt.toDate().toString();
    hour = mes.substr(16,5);
    dayint2 = parseInt(mes.substr(8,2));
    newdaystr = mes.substr(4,6);
    current_day = props.message.createdAt.valueOf();
  }

  const dayint = props.di();
  const day = props.d();
  const hourf = parseFloat(props.hf());

  // Display day every new day
  const newday = (day === current_day) || (day < current_day && dayint !== dayint2);
  // Display hour every 5 min only
  const newhour =  hourf + 300 <= parseFloat(current_day) || newday || hourf === parseFloat(current_day);

  if(newday){props.ds(current_day);props.dis(dayint2);}
  if(newhour){props.hfs(current_day);}
  // ******************************************************************************************************* //

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

export default App;
