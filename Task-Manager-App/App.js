import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, StatusBar, Platform, Dimensions } from 'react-native';
import * as Notifications from 'expo-notifications';

const isTablet = Dimensions.get('window').width > 768; 


function useAuth() {
  const [user, setUser] = useState(null);
  function signIn(email, pwd) {
    if (email && pwd) setUser({ email });
  }
  function signUp(email, pwd) {
    if (email && pwd) setUser({ email });
  }
  function signOut() { setUser(null); }
  return { user, signIn, signUp, signOut };
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const auth = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function setupPush() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      // You can use this token in your backend for sending notifications
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo push token:', token);
    }
    setupPush();
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }
  }, []);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="dark-content" />
        <Image source={require('./assets/images/image.png')} style={isTablet ? styles.logoTablet : styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Task Manager</Text>
      </View>
    );
  }

  
  if (!auth.user) {
    return <AuthScreen signIn={auth.signIn} signUp={auth.signUp} />;
  }


  return <TaskManagerScreen signOut={auth.signOut} />;
}

function AuthScreen({ signIn, signUp }) {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  return (
    <View style={styles.authContainer}>
      <Text style={styles.subtitle}>Sign In / Sign Up</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
      <TextInput placeholder="Password" value={pwd} onChangeText={setPwd} secureTextEntry style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={() => signIn(email, pwd)}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonOutline} onPress={() => signUp(email, pwd)}>
        <Text style={styles.buttonOutlineText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

function TaskManagerScreen({ signOut }) {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

  function addTask() {
    if (input.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), title: input.trim(), completed: false }]);
      setInput('');
    }
  }
  function toggleTask(id) {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }
  function startEdit(id, title) {
    setEditId(id);
    setEditText(title);
  }
  function saveEdit() {
    setTasks(tasks.map(t => t.id === editId ? { ...t, title: editText } : t));
    setEditId(null);
    setEditText('');
  }
  function deleteTask(id) {
    setTasks(tasks.filter(t => t.id !== id));
  }

  return (
    <View style={isTablet ? styles.tabletContainer : styles.container}>
      <Text style={styles.subtitle}>Your Tasks</Text>
      <View style={styles.inputRow}>
        <TextInput style={styles.inputTask} placeholder="Add a new task" value={input} onChangeText={setInput} onSubmitEditing={addTask} />
        <TouchableOpacity style={styles.button} onPress={addTask}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={t => t.id}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <TouchableOpacity onPress={() => toggleTask(item.id)}>
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
          <TextInput style={styles.inputTask} value={editText} onChangeText={setEditText} />
          <TouchableOpacity style={styles.button} onPress={saveEdit}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  splashContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  logo: { width: 120, height: 120, marginBottom: 18 },
  logoTablet: { width: 220, height: 220, marginBottom: 24 },
  title: { fontSize: 30, fontWeight: 'bold' },
  tabletContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 80 },
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 32 },
  authContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontSize: 24, marginBottom: 18 },
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




