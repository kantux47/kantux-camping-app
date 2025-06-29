import { useEffect, useState } from "react";
import {
  getCurrentUser,
  signOut,
  signInWithRedirect,
  fetchAuthSession,
} from "aws-amplify/auth";
import { Hub } from 'aws-amplify/utils';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

interface AmplifyUser {
  username: string;
  signInDetails?: {
    loginId?: string;
  };
  // inne potrzebne pola
}

function App() {
  const [user, setUser] = useState<AmplifyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    checkAuthState();
    
    // Nasłuchuj na zmiany stanu autentykacji
    const hubListener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          checkAuthState();
          break;
        case 'signInWithRedirect_failure':
          console.log('Sign in failure', payload.data);
          setLoading(false);
          break;
        case 'signedOut':
          setUser(null);
          setTodos([]);
          break;
      }
    });

    return () => hubListener();
  }, []);

  useEffect(() => {
    if (user) {
      const sub = client.models.Todo.observeQuery().subscribe({
        next: (data) => setTodos([...data.items]),
      });
      return () => sub.unsubscribe();
    }
  }, [user]);

  async function checkAuthState() {
    try {
      const session = await fetchAuthSession();
      if (session.tokens) {
        setUser(await getCurrentUser() as AmplifyUser);
        return;
      }
    } catch {
      console.log('User not authenticated');
    }
    await signInWithRedirect();
  }

  async function handleSignIn() {
    try {
      await signInWithRedirect();
    } catch (error) {
      console.log('Error signing in:', error);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setUser(null);
      setTodos([]);
    } catch (error) {
      console.log('Error signing out:', error);
    }
  }

  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({ content });
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      handleSignIn();
    }
  }, [loading, user]);

  if (loading) {
    return (
      <main>
        <div>Loading...</div>
      </main>
    );
  }

  if (loading || !user) {
  return null;                 
}

  return (
    <main>
      <h1>{user?.signInDetails?.loginId || user?.username}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <button onClick={handleSignOut}>Sign out</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
    </main>
  );
}

export default App;