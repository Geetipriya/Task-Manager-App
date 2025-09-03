import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, StatusBar } from 'react-native';
import { auth, db } from './firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc 
} from 'firebase/firestore';

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [user, setUser] = useState(null);
  const [isInitialTasksLoaded, setIsInitialTasksLoaded] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);
  
  useEffect(() => {
    async function fetchTasks() {
      if (user && !isInitialTasksLoaded) {
        const q = await getDocs(collection(db, "tasks_" + user.uid));
        setTasks(q.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setIsInitialTasksLoaded(true);
      }
    }
    fetchTasks();
  }, [user, isInitialTasksLoaded]);

  if (showWelcome) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="dark-content" />
        <Image source={require('./assets/images/image.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Task Manager</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!user.emailVerified) {
    return <VerificationScreen />;
  }

  return (
    <TaskManagerScreen
      user={user}
      tasks={tasks}
      setTasks={setTasks}
    />
  );
}

function AuthScreen() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');

  function handleSignUp() {
    createUserWithEmailAndPassword(auth, email, pwd)
      .then((userCredential) => {
        sendEmailVerification(userCredential.user)
          .then(() => {
            alert("Verification email sent! Please check your inbox.");
          });
      })
      .catch((error) => {
        alert(error.message);
      });
  }

  function handleSignIn() {
    signInWithEmailAndPassword(auth, email, pwd)
      .catch((error) => {
        alert(error.message);
      });
  }

  return (
    <View style={styles.authContainer}>
      <Text style={styles.subtitle}>{isSignIn ? "Sign In" : "Sign Up"}</Text>
      <TextInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        style={styles.input} 
        autoCapitalize="none"
      />
      <TextInput 
        placeholder="Password" 
        value={pwd} 
        onChangeText={setPwd} 
        style={styles.input} 
        secureTextEntry 
      />
      <TouchableOpacity style={styles.button} onPress={isSignIn ? handleSignIn : handleSignUp}>
        <Text style={styles.buttonText}>{isSignIn ? "Sign In" : "Sign Up"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonOutline} onPress={() => setIsSignIn(!isSignIn)}>
        <Text style={styles.buttonOutlineText}>{isSignIn ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}</Text>
      </TouchableOpacity>
    </View>
  );
}

function VerificationScreen() {
  function resendVerification() {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      sendEmailVerification(user)
        .then(() => alert("Verification email sent again!"))
        .catch(error => alert(error.message));
    }
  }
  return (
    <View style={styles.authContainer}>
      <Text style={styles.subtitle}>Email Verification</Text>
      <Text style={{ marginVertical: 10, textAlign:"center" }}>
        Please verify your email address before using the app. Check your inbox and click the verification link.
      </Text>
      <TouchableOpacity style={styles.button} onPress={resendVerification}>
        <Text style={styles.buttonText}>Resend Verification Email</Text>
      </TouchableOpacity>
    </View>
  );
}

function TaskManagerScreen({ user, tasks, setTasks }) {
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

  async function addTask() {
    if (input.trim()) {
      const docRef = await addDoc(collection(db, "tasks_" + user.uid), {
        title: input.trim(),
        completed: false
      });
      setTasks([...tasks, { id: docRef.id, title: input.trim(), completed: false }]);
      setInput('');
    }
  }
  
  async function toggleTask(id, completed) {
    const docRef = doc(db, "tasks_" + user.uid, id);
    await updateDoc(docRef, { completed: !completed });
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }
  
  function startEdit(id, title) {
    setEditId(id);
    setEditText(title);
  }
  async function saveEdit() {
    const docRef = doc(db, "tasks_" + user.uid, editId);
    await updateDoc(docRef, { title: editText });
    setTasks(tasks.map(t => t.id === editId ? { ...t, title: editText } : t));
    setEditId(null);
    setEditText('');
  }
  async function deleteTask(id) {
    const docRef = doc(db, "tasks_" + user.uid, id);
    await deleteDoc(docRef);
    setTasks(tasks.filter(t => t.id !== id));
  }
  function handleSignOut() {
    signOut(auth);
  }
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Your Tasks</Text>
      <View style={styles.inputRow}>
        <TextInput 
          style={styles.inputTask} 
          placeholder="Add a new task" 
          value={input} 
          onChangeText={setInput} 
          onSubmitEditing={addTask}
        />
        <TouchableOpacity style={styles.button} onPress={addTask}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={t => t.id}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <TouchableOpacity onPress={() => toggleTask(item.id, item.completed)}>
              <Text style={[styles.taskText, item.completed && styles.taskTextDone]}>
                {item.title}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => startEdit(item.id, item.title)}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteBtn}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tasks yet.</Text>}
      />
      {editId && (
        <View style={styles.editRow}>
          <TextInput 
            style={styles.inputTask} 
            value={editText} 
            onChangeText={setEditText} 
          />
          <TouchableOpacity style={styles.button} onPress={saveEdit}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  logo: { width: 100, height: 100, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold' },
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 32 },
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  subtitle: { fontSize: 22, marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  editRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  inputTask: { borderWidth: 1, borderColor: '#bbb', padding: 10, borderRadius: 8, minWidth: 180, marginRight: 8 },
  input: { width: 220, borderWidth: 1, borderColor: '#bbb', borderRadius: 8, padding: 10, marginBottom: 10 },
  button: { backgroundColor: '#0077ee', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  buttonOutline: { borderWidth: 1, borderColor: '#0077ee', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, marginTop: 8 },
  buttonOutlineText: { color: '#0077ee', fontWeight: 'bold' },
  taskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  taskText: { fontSize: 18, minWidth: 100 },
  taskTextDone: { textDecorationLine: 'line-through', color: '#444' },
  editBtn: { color: '#6c4', marginLeft: 12 },
  deleteBtn: { color: '#e33', marginLeft: 8 },
  empty: { color: '#aaa', marginTop: 18 },
  signOutBtn: { backgroundColor: '#888', marginTop: 26, padding: 10, borderRadius: 8 }
});





