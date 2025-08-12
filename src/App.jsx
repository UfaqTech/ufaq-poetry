import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import {
  Heart,
  MessageCircle,
  Plus,
  Trash2,
  Edit,
  Save,
  PenTool,
  Check,
  X,
  Shield,
  LogOut,
  List,
  Edit2
} from 'lucide-react';

// === Firebase Setup and Context ===
// DO NOT CHANGE THESE VARIABLES. They are provided by the Canvas environment.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// The user ID for the logged-in user. This will be updated after auth is ready.
let userId = null;

const FirebaseContext = createContext(null);

const FirebaseProvider = ({ children }) => {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);

  // Hardcoded admin email for demonstration.
  // In a real app, this would be a more secure check.
  const ADMIN_UID = 'admin-user-id'; // This ID is what we will use to identify the admin.

  useEffect(() => {
    // Initialize Firebase and sign in the user.
    const initializeFirebase = async () => {
      try {
        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const firebaseAuth = getAuth(app);
        setDb(firestore);
        setAuth(firebaseAuth);

        onAuthStateChanged(firebaseAuth, async (currentUser) => {
          if (currentUser) {
            userId = currentUser.uid;
            setUser(currentUser);
            console.log("User signed in:", currentUser.uid);
          } else {
            // Sign in anonymously if no user is found
            try {
              const anonymousUser = await signInAnonymously(firebaseAuth);
              userId = anonymousUser.user.uid;
              setUser(anonymousUser.user);
              console.log("Signed in anonymously:", anonymousUser.user.uid);
            } catch (error) {
              console.error("Error signing in anonymously:", error);
            }
          }
          setFirebaseReady(true);
        });

      } catch (e) {
        console.error("Error initializing Firebase:", e);
      }
    };

    initializeFirebase();
  }, []);

  const value = { db, auth, user, firebaseReady, isAdmin: user && user.uid === ADMIN_UID };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

const useFirebase = () => useContext(FirebaseContext);

// A simple utility to format the date
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleDateString();
};

// === Main Application Components ===

// This component handles the submission of new poetry by visitors.
const PoetrySubmissionForm = ({ labels }) => {
  const { db, firebaseReady } = useFirebase();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firebaseReady || !title || !content || !selectedLabel) {
      setMessage('Please fill out all fields.');
      return;
    }

    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/poetries`), {
        title,
        content,
        label: selectedLabel,
        submittedBy: userId,
        status: 'pending', // 'pending' or 'approved'
        likes: [],
        comments: [],
        createdAt: new Date(),
        author: 'Visitor' // Default author for submitted poems
      });
      setMessage('Poetry submitted successfully! It is now pending admin approval.');
      setTitle('');
      setContent('');
      setSelectedLabel('');
    } catch (error) {
      console.error('Error submitting poetry:', error);
      setMessage('Failed to submit poetry. Please try again.');
    }
  };

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center">
        <PenTool className="mr-2" />
        Submit Your Poetry
      </h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">Share your creative work with the world. Your submission will be reviewed by an admin.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 p-2"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Poetry</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 p-2"
          ></textarea>
        </div>
        <div>
          <label htmlFor="label" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Choose a Label</label>
          <select
            id="label"
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 p-2"
          >
            <option value="" disabled>Select a category</option>
            {labels.map((label) => (
              <option key={label.id} value={label.name}>{label.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={!firebaseReady}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-300"
        >
          Submit
        </button>
      </form>
      {message && <p className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400">{message}</p>}
    </div>
  );
};


// A component to display a single poetry piece
const PoetryCard = ({ poetry }) => {
  const { db, user, firebaseReady } = useFirebase();
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (!firebaseReady || !user) return;
    const poetryRef = doc(db, `artifacts/${appId}/public/data/poetries`, poetry.id);
    if (poetry.likes.includes(user.uid)) {
      // Unlike
      await updateDoc(poetryRef, {
        likes: arrayRemove(user.uid)
      });
    } else {
      // Like
      await updateDoc(poetryRef, {
        likes: arrayUnion(user.uid)
      });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!firebaseReady || !user || !newComment.trim()) return;

    const poetryRef = doc(db, `artifacts/${appId}/public/data/poetries`, poetry.id);
    const newCommentObject = {
      userId: user.uid,
      userName: user.uid.substring(0, 8), // A simple way to identify users
      commentText: newComment,
      createdAt: new Date()
    };
    await updateDoc(poetryRef, {
      comments: arrayUnion(newCommentObject)
    });
    setNewComment('');
  };

  const hasLiked = poetry.likes.includes(user?.uid);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transform transition duration-300 hover:scale-[1.01]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{poetry.title}</h3>
        <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-indigo-200 dark:text-indigo-900">
          {poetry.label}
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-serif leading-relaxed mb-4">
        {poetry.content}
      </p>
      <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
        <span className="flex items-center text-sm">By {poetry.author} on {formatDate(poetry.createdAt)}</span>
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 transition duration-300 ${hasLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
          disabled={!firebaseReady}
        >
          <Heart size={18} fill={hasLiked ? "currentColor" : "none"} />
          <span>{poetry.likes.length}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 text-gray-400 hover:text-indigo-500 transition duration-300"
        >
          <MessageCircle size={18} />
          <span>{poetry.comments.length}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-6">
          <h4 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">Comments</h4>
          <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
            {poetry.comments.length > 0 ? (
              poetry.comments.map((comment, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-gray-800 dark:text-gray-200 text-sm">{comment.commentText}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    - By {comment.userName} on {formatDate(comment.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm italic">No comments yet. Be the first to comment!</p>
            )}
          </div>
          <form onSubmit={handleCommentSubmit} className="mt-4 flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-grow rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 text-sm"
            />
            <button
              type="submit"
              className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 text-sm"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};


// Component for the Admin Panel
const AdminPanel = ({ labels, poetries }) => {
  const { db, firebaseReady } = useFirebase();
  const [newLabel, setNewLabel] = useState('');
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [editingLabelName, setEditingLabelName] = useState('');

  // Function to add a new label
  const handleAddLabel = async () => {
    if (!firebaseReady || !newLabel) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/labels`), {
        name: newLabel,
      });
      setNewLabel('');
    } catch (error) {
      console.error('Error adding label:', error);
    }
  };

  // Function to delete a label
  const handleDeleteLabel = async (id) => {
    if (!firebaseReady) return;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/public/data/labels`, id));
    } catch (error) {
      console.error('Error deleting label:', error);
    }
  };

  // Function to save a renamed label
  const handleRenameLabel = async (id) => {
    if (!firebaseReady || !editingLabelName) return;
    try {
      await updateDoc(doc(db, `artifacts/${appId}/public/data/labels`, id), {
        name: editingLabelName
      });
      setEditingLabelId(null);
      setEditingLabelName('');
    } catch (error) {
      console.error('Error renaming label:', error);
    }
  };

  // Function to approve a pending poetry submission
  const handleApprovePoetry = async (poetryId) => {
    if (!firebaseReady) return;
    try {
      await updateDoc(doc(db, `artifacts/${appId}/public/data/poetries`, poetryId), {
        status: 'approved',
        author: 'UFAQ' // Set the official author name
      });
    } catch (error) {
      console.error('Error approving poetry:', error);
    }
  };

  // Function to delete a pending poetry submission
  const handleDeletePoetry = async (poetryId) => {
    if (!firebaseReady) return;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/public/data/poetries`, poetryId));
    } catch (error) {
      console.error('Error deleting poetry:', error);
    }
  };

  const pendingPoetries = poetries.filter(p => p.status === 'pending');

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg my-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center">
        <Shield className="mr-2" />
        Admin Panel
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Manage poetry labels and approve visitor submissions.</p>

      {/* Label Management Section */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center"><List className="mr-2" /> Manage Labels</h3>
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="New label name"
            className="flex-grow p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <button
            onClick={handleAddLabel}
            className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        <ul className="space-y-2">
          {labels.map((label) => (
            <li key={label.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
              {editingLabelId === label.id ? (
                <div className="flex-grow flex items-center space-x-2">
                  <input
                    type="text"
                    value={editingLabelName}
                    onChange={(e) => setEditingLabelName(e.target.value)}
                    className="flex-grow p-1 rounded-md border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                  <button onClick={() => handleRenameLabel(label.id)} className="p-1 text-green-500 hover:text-green-700"><Check size={20} /></button>
                  <button onClick={() => setEditingLabelId(null)} className="p-1 text-red-500 hover:text-red-700"><X size={20} /></button>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-between">
                  <span className="text-gray-900 dark:text-gray-100">{label.name}</span>
                  <div className="flex space-x-2">
                    <button onClick={() => { setEditingLabelId(label.id); setEditingLabelName(label.name); }} className="p-1 text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteLabel(label.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Pending Poetry Section */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center"><PenTool className="mr-2" /> Pending Submissions ({pendingPoetries.length})</h3>
        {pendingPoetries.length > 0 ? (
          <ul className="space-y-4">
            {pendingPoetries.map((poetry) => (
              <li key={poetry.id} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{poetry.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Label: {poetry.label}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Submitted by: {poetry.submittedBy.substring(0, 8)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprovePoetry(poetry.id)}
                      className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => handleDeletePoetry(poetry.id)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap text-sm">{poetry.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">No pending submissions at this time.</p>
        )}
      </div>
    </div>
  );
};


// === App Component and Main UI ===
const App = () => {
  const { firebaseReady, db, isAdmin } = useFirebase();
  const [labels, setLabels] = useState([]);
  const [poetries, setPoetries] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState('All');
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    if (!firebaseReady) return;

    // Listen for real-time updates to labels
    const labelsUnsub = onSnapshot(collection(db, `artifacts/${appId}/public/data/labels`), (snapshot) => {
      const labelsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLabels(labelsData);
    });

    // Listen for real-time updates to poetries
    const poetriesUnsub = onSnapshot(collection(db, `artifacts/${appId}/public/data/poetries`), (snapshot) => {
      const poetriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPoetries(poetriesData);
    });

    return () => {
      labelsUnsub();
      poetriesUnsub();
    };
  }, [db, firebaseReady]);

  const filteredPoetries = poetries
    .filter(p => p.status === 'approved')
    .filter(p => selectedLabel === 'All' || p.label === selectedLabel)
    .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()); // Sort by most recent

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans p-4">
      <header className="py-6 px-8 bg-white dark:bg-gray-800 shadow-md rounded-xl mb-8 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <h1 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">UfaqTech Poetry</h1>
          <span className="ml-2 text-xl font-medium text-gray-500 dark:text-gray-400">by UFAQ</span>
        </div>
        <nav className="flex flex-wrap justify-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setCurrentPage('home')}
            className={`px-4 py-2 rounded-full transition duration-300 font-medium ${currentPage === 'home' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentPage('submit')}
            className={`px-4 py-2 rounded-full transition duration-300 font-medium ${currentPage === 'submit' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            Submit Poetry
          </button>
          {isAdmin && (
            <button
              onClick={() => setCurrentPage('admin')}
              className={`px-4 py-2 rounded-full transition duration-300 font-medium ${currentPage === 'admin' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              Admin Panel
            </button>
          )}
        </nav>
      </header>

      <main className="container mx-auto max-w-4xl p-4">
        {/* User ID Display */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
            Your User ID (for admin login): <span className="font-mono text-indigo-500">{userId}</span>
            <p className="mt-2 text-xs">If you want to be the admin, please change the `ADMIN_UID` constant in the code to match this ID.</p>
        </div>
        {currentPage === 'home' && (
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-1/4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Categories</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setSelectedLabel('All')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition duration-300 ${selectedLabel === 'All' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      All
                    </button>
                  </li>
                  {labels.map((label) => (
                    <li key={label.id}>
                      <button
                        onClick={() => setSelectedLabel(label.name)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition duration-300 ${selectedLabel === label.name ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                      >
                        {label.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
            <section className="w-full md:w-3/4">
              {filteredPoetries.length > 0 ? (
                filteredPoetries.map((poetry) => (
                  <PoetryCard key={poetry.id} poetry={poetry} />
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                  No poetry found for this category. Be the first to submit!
                </div>
              )}
            </section>
          </div>
        )}
        {currentPage === 'submit' && <PoetrySubmissionForm labels={labels} />}
        {currentPage === 'admin' && isAdmin && <AdminPanel labels={labels} poetries={poetries} />}
        {currentPage === 'admin' && !isAdmin && (
           <div className="p-8 text-center text-red-500 dark:text-red-400 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
             You do not have access to the admin panel.
           </div>
        )}
      </main>
    </div>
  );
};

// Top-level component to provide the Firebase context
const AppWrapper = () => (
  <FirebaseProvider>
    <App />
  </FirebaseProvider>
);

export default AppWrapper;
