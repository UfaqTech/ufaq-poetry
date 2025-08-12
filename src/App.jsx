import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signInAnonymously, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, arrayUnion, arrayRemove, query, where, limit, getDocs, getDoc, setDoc, orderBy, startAfter } from 'firebase/firestore';
import { Helmet, HelmetProvider } from 'react-helmet-async';
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
  Edit2,
  Search,
  User,
  Power,
  Info,
  BookOpenText,
  Mail,
  Lock,
  ArrowLeft,
  UserCheck,
  Moon,
  Sun,
  ChevronsDown,
  UserCircle
} from 'lucide-react';

// === Firebase Setup and Context ===
// Your web app's Firebase configuration - provided by user
const firebaseConfig = {
  apiKey: "AIzaSyCpvJZ1zdcH410sQrdsClTQB7ItnVcTavA",
  authDomain: "ufaqtech-143.firebaseapp.com",
  projectId: "ufaqtech-143",
  storageBucket: "ufaqtech-143.firebasestorage.app",
  messagingSenderId: "245005956266",
  appId: "1:245005956266:web:322cab7c1aa4aa3d65ccd3",
  measurementId: "G-P2H63C8C3B"
};

const FirebaseContext = createContext(null);

const FirebaseProvider = ({ children }) => {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // IMPORTANT: This is the UID of your administrator account
  const ADMIN_UID = 'FTqhvlaU59WVZEOfl3K3HQrb2n02';

  // Effect to initialize Firebase services once.
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);
      setDb(firestore);
      setAuth(firebaseAuth);
      setFirebaseReady(true);
    } catch (e) {
      console.error("Error initializing Firebase:", e);
      setFirebaseReady(false);
    }
  }, []);

  // Effect to handle user authentication state changes.
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log("User signed in:", currentUser.uid);
      } else {
        try {
          await signInAnonymously(auth);
          console.log("Signed in anonymously.");
        } catch (error) {
          console.error("Error signing in anonymously:", error);
        }
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const isRegisteredUser = user && !user.isAnonymous;
  const isAdmin = user && user.uid === ADMIN_UID;
  const value = { db, auth, user, firebaseReady, isRegisteredUser, isAdmin, loadingAuth };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

const useFirebase = () => useContext(FirebaseContext);

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// --- Modals for user feedback (replacing alert/confirm) ---
const Modal = ({ show, title, message, onConfirm, onCancel, type = 'alert' }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm animate-zoom-in">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          {type === 'confirm' && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            {type === 'confirm' ? 'Confirm' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DisplayNameModal = ({ show, onSave, onCancel }) => {
  const [displayName, setDisplayName] = useState('');

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm animate-zoom-in">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center"><UserCheck className="mr-2 text-indigo-600" /> Set Your Display Name</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">Please enter a name to be shown with your comments and submissions.</p>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name or nickname"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-gray-100 dark:bg-gray-700 dark:text-gray-100"
        />
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(displayName)}
            disabled={!displayName.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};


// === Main Application Components ===

const PoetrySubmissionForm = ({ labels }) => {
  const { db, firebaseReady, user, isRegisteredUser } = useFirebase();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [language, setLanguage] = useState('English');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);
  const [authorName, setAuthorName] = useState(null);

  const checkForDisplayName = async () => {
    if (!firebaseReady || !user) {
      setModalContent({
        title: "Submission Error",
        message: "Authentication is not ready. Please try again.",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
      return;
    }
    const userRef = doc(db, `artifacts/${firebaseConfig.appId}/users/${user.uid}/profile`, 'info');
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data().displayName) {
      setAuthorName(userSnap.data().displayName);
      handleSubmit();
    } else {
      setShowDisplayNameModal(true);
    }
  };

  const handleSaveDisplayName = async (name) => {
    if (!name.trim()) return;

    try {
      const userRef = doc(db, `artifacts/${firebaseConfig.appId}/users/${user.uid}/profile`, 'info');
      await setDoc(userRef, { displayName: name.trim() }, { merge: true });
      setAuthorName(name.trim());
      setShowDisplayNameModal(false);
      handleSubmit();
    } catch (error) {
      console.error("Error saving display name:", error);
      setModalContent({
        title: "Error",
        message: "Could not save your name. Please try again.",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
    }
  };

  const handleSubmit = async (e) => {
    if(e) e.preventDefault();
    if (!firebaseReady || !user || !title || !content || !selectedLabel || !language) {
      setModalContent({
        title: "Submission Error",
        message: "Please fill out all fields before submitting.",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
      return;
    }
    try {
      const submissionStatus = isRegisteredUser ? 'approved' : 'pending';
      
      await addDoc(collection(db, `artifacts/${firebaseConfig.appId}/public/data/poetries`), {
        title,
        content,
        label: selectedLabel,
        language: language,
        submittedBy: user.uid,
        status: submissionStatus,
        likes: [],
        comments: [],
        createdAt: new Date(),
        author: authorName || (isRegisteredUser ? user.email.split('@')[0] : 'Visitor')
      });
      
      setModalContent({
        title: "Success!",
        message: isRegisteredUser ? "Poetry submitted and automatically approved!" : "Poetry submitted successfully! It is now pending admin approval.",
        type: "alert",
        onConfirm: () => {
          setShowModal(false);
          setTitle('');
          setContent('');
          setSelectedLabel('');
          setLanguage('English');
        }
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error submitting poetry:', error);
      setModalContent({
        title: "Submission Failed",
        message: "Failed to submit poetry. Please try again.",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
    }
  };

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl mx-auto my-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center">
        <PenTool className="mr-2" />
        Submit Your Poetry
      </h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        {isRegisteredUser ? "Share your creative work with the world. Your poetry will be automatically approved." : "Share your creative work. Your submission will be reviewed by an admin."}
      </p>
      <form onSubmit={e => { e.preventDefault(); checkForDisplayName(); }} className="space-y-4">
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
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 p-2"
          >
            <option value="English">English</option>
            <option value="Urdu">Urdu</option>
            <option value="Saraiki">Saraiki</option>
            <option value="Quotes">Quotes</option>
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
      <Modal {...modalContent} show={showModal} />
      <DisplayNameModal show={showDisplayNameModal} onSave={handleSaveDisplayName} onCancel={() => setShowDisplayNameModal(false)} />
    </div>
  );
};


const PoetryCard = ({ poetry }) => {
  const { db, user, firebaseReady, isAdmin } = useFirebase();
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);

  const handleLike = async () => {
    if (!firebaseReady || !user) {
      setModalContent({
        title: "Action Required",
        message: "You need to be signed in to like poetry. An anonymous session is already active.",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
      return;
    }
    const poetryRef = doc(db, `artifacts/${firebaseConfig.appId}/public/data/poetries`, poetry.id);
    try {
      if (poetry.likes && poetry.likes.includes(user.uid)) {
        await updateDoc(poetryRef, {
          likes: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(poetryRef, {
          likes: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error("Error updating like:", error);
      setModalContent({
        title: "Action Failed",
        message: "Could not update like. Please try again.",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!firebaseReady || !user || !newComment.trim()) {
      setModalContent({
        title: "Comment Error",
        message: "Please ensure you are signed in and your comment is not empty.",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
      return;
    }
    
    const userRef = doc(db, `artifacts/${firebaseConfig.appId}/users/${user.uid}/profile`, 'info');
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data().displayName) {
      postComment(userSnap.data().displayName);
    } else {
      setShowDisplayNameModal(true);
    }
  };

  const postComment = async (displayName) => {
    const poetryRef = doc(db, `artifacts/${firebaseConfig.appId}/public/data/poetries`, poetry.id);
    const newCommentObject = {
      userId: user.uid,
      userName: displayName,
      commentText: newComment,
      createdAt: new Date()
    };
    try {
      await updateDoc(poetryRef, {
        comments: arrayUnion(newCommentObject)
      });
      setNewComment('');
      setShowDisplayNameModal(false);
    } catch (error) {
      console.error("Error adding comment:", error);
      setModalContent({
        title: "Comment Failed",
        message: "Could not post comment. Please try again.",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
    }
  };

  const handleSaveDisplayName = async (name) => {
    if (!name.trim()) return;
    try {
      const userRef = doc(db, `artifacts/${firebaseConfig.appId}/users/${user.uid}/profile`, 'info');
      await setDoc(userRef, { displayName: name.trim() }, { merge: true });
      postComment(name.trim());
    } catch (error) {
      console.error("Error saving display name:", error);
      setModalContent({
        title: "Error",
        message: "Could not save your name. Please try again.",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
    }
  };

  const hasLiked = poetry.likes && poetry.likes.includes(user?.uid);
  const isUrduOrSaraiki = poetry.language === 'Urdu' || poetry.language === 'Saraiki';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transform transition duration-300 hover:scale-[1.01] animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-xl font-bold text-gray-900 dark:text-gray-100 ${isUrduOrSaraiki ? 'text-right w-full' : ''}`}>
          {poetry.title}
        </h3>
        <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-indigo-200 dark:text-indigo-900">
          {poetry.label}
        </span>
      </div>
      <p className={`text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-4 ${isUrduOrSaraiki ? 'text-right font-urdu' : 'font-serif'}`}>
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
          <span>{poetry.likes ? poetry.likes.length : 0}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 text-gray-400 hover:text-indigo-500 transition duration-300"
        >
          <MessageCircle size={18} />
          <span>{poetry.comments ? poetry.comments.length : 0}</span>
        </button>
      </div>
      {showComments && (
        <div className="mt-6 animate-fade-in">
          <h4 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">Comments</h4>
          <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
            {poetry.comments && poetry.comments.length > 0 ? (
              poetry.comments.map((comment, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg animate-fade-in-down">
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
      <Modal {...modalContent} show={showModal} />
      <DisplayNameModal show={showDisplayNameModal} onSave={handleSaveDisplayName} onCancel={() => setShowDisplayNameModal(false)} />
    </div>
  );
};

const AdminPanel = ({ labels, poetries }) => {
  const { db, firebaseReady, isAdmin } = useFirebase();
  const [newLabel, setNewLabel] = useState('');
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [editingLabelName, setEditingLabelName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});

  const handleAddLabel = async () => {
    if (!firebaseReady || !newLabel.trim()) {
      setModalContent({
        title: "Input Required",
        message: "Please enter a label name.",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
      return;
    }
    try {
      await addDoc(collection(db, `artifacts/${firebaseConfig.appId}/public/data/labels`), {
        name: newLabel.trim(),
      });
      setNewLabel('');
      setModalContent({
        title: "Success",
        message: "Label added successfully!",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error adding label:', error);
      setModalContent({
        title: "Error",
        message: "Failed to add label. Please try again.",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
    }
  };

  const handleDeleteLabel = async (id) => {
    if (!firebaseReady) return;
    setModalContent({
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this label? This action cannot be undone. Poems with this label will still exist but without a recognized category.",
      type: "confirm",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, `artifacts/${firebaseConfig.appId}/public/data/labels`, id));
          setShowModal(false);
          setModalContent({
            title: "Success",
            message: "Label deleted successfully!",
            type: "alert",
            onConfirm: () => setShowModal(false)
          });
          setShowModal(true);
        } catch (error) {
          console.error('Error deleting label:', error);
          setShowModal(false);
          setModalContent({
            title: "Error",
            message: "Failed to delete label. Please try again.",
            type: "alert",
            onConfirm: () => setShowModal(false)
          });
          setShowModal(true);
        }
      },
      onCancel: () => setShowModal(false)
    });
    setShowModal(true);
  };

  const handleRenameLabel = async (id) => {
    if (!firebaseReady || !editingLabelName.trim()) {
      setModalContent({
        title: "Input Required",
        message: "Label name cannot be empty.",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
      return;
    }
    try {
      await updateDoc(doc(db, `artifacts/${firebaseConfig.appId}/public/data/labels`, id), {
        name: editingLabelName.trim()
      });
      setEditingLabelId(null);
      setEditingLabelName('');
      setModalContent({
        title: "Success",
        message: "Label renamed successfully!",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error renaming label:', error);
      setModalContent({
        title: "Error",
        message: "Failed to rename label. Please try again.",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
    }
  };

  const handleApprovePoetry = async (poetryId) => {
    if (!firebaseReady) return;
    setModalContent({
      title: "Confirm Approval",
      message: "Are you sure you want to approve this poetry? It will become visible to all visitors.",
      type: "confirm",
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, `artifacts/${firebaseConfig.appId}/public/data/poetries`, poetryId), {
            status: 'approved',
            author: 'UFAQ Official'
          });
          setShowModal(false);
          setModalContent({
            title: "Success",
            message: "Poetry approved and published!",
            type: "alert",
            onConfirm: () => setShowModal(false)
          });
          setShowModal(true);
        } catch (error) {
          console.error('Error approving poetry:', error);
          setShowModal(false);
          setModalContent({
            title: "Error",
            message: "Failed to approve poetry. Please try again.",
            type: "alert",
            onConfirm: () => setShowModal(false)
          });
          setShowModal(true);
        }
      },
      onCancel: () => setShowModal(false)
    });
    setShowModal(true);
  };

  const handleDeletePoetry = async (poetryId) => {
    if (!firebaseReady) return;
    setModalContent({
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this poetry? This action cannot be undone.",
      type: "confirm",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, `artifacts/${firebaseConfig.appId}/public/data/poetries`, poetryId));
          setShowModal(false);
          setModalContent({
            title: "Success",
            message: "Poetry deleted successfully!",
            type: "alert",
            onConfirm: () => setShowModal(false)
          });
          setShowModal(true);
        } catch (error) {
          console.error('Error deleting poetry:', error);
          setShowModal(false);
          setModalContent({
            title: "Error",
            message: "Failed to delete poetry. Please try again.",
            type: "alert",
            onConfirm: () => setShowModal(false)
          });
          setShowModal(true);
        }
      },
      onCancel: () => setShowModal(false)
    });
    setShowModal(true);
  };

  const pendingPoetries = poetries.filter(p => p.status === 'pending');

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg my-8 animate-fade-in">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center">
        <Shield className="mr-2" />
        Admin Panel
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Manage poetry labels and approve visitor submissions.</p>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center"><List className="mr-2" /> Manage Labels</h3>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="New label name"
            className="flex-grow p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 w-full"
          />
          <button
            onClick={handleAddLabel}
            className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors w-full sm:w-auto flex justify-center items-center"
          >
            <Plus size={20} /> <span className="ml-2 sm:hidden">Add Label</span>
          </button>
        </div>
        <ul className="space-y-2">
          {labels.map((label) => (
            <li key={label.id} className="flex flex-col sm:flex-row items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-md animate-fade-in-down">
              {editingLabelId === label.id ? (
                <div className="flex-grow flex items-center space-x-2 w-full sm:w-auto">
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
                <div className="flex-grow flex items-center justify-between w-full sm:w-auto">
                  <span className="text-gray-900 dark:text-gray-100">{label.name}</span>
                  <div className="flex space-x-2 mt-2 sm:mt-0">
                    <button onClick={() => { setEditingLabelId(label.id); setEditingLabelName(label.name); }} className="p-1 text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteLabel(label.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center"><PenTool className="mr-2" /> Pending Submissions ({pendingPoetries.length})</h3>
        {pendingPoetries.length > 0 ? (
          <ul className="space-y-4">
            {pendingPoetries.map((poetry) => (
              <li key={poetry.id} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm animate-fade-in-down">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{poetry.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Label: {poetry.label} | Lang: {poetry.language}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Submitted by: <span className="font-mono text-indigo-600 dark:text-indigo-400">{poetry.submittedBy.substring(0, 8)}...</span></p>
                  </div>
                  <div className="flex space-x-2 mt-3 sm:mt-0">
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
                <p className={`text-gray-700 dark:text-gray-200 whitespace-pre-wrap text-sm ${poetry.language === 'Urdu' || poetry.language === 'Saraiki' ? 'text-right font-urdu' : ''}`}>{poetry.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">No pending submissions at this time.</p>
        )}
      </div>
      <Modal {...modalContent} show={showModal} />
    </div>
  );
};


const AuthPanel = () => {
  const { auth, firebaseReady, loadingAuth, user, isAdmin } = useFirebase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [showLoginForm, setShowLoginForm] = useState(true);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!firebaseReady) {
      setModalContent({
        title: "Firebase Not Ready",
        message: "Authentication services are not yet loaded. Please wait a moment and try again.",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
      return;
    }
    if (!email || !password) {
      setModalContent({
        title: "Login Error",
        message: "Please enter both email and password.",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setModalContent({
        title: "Login Successful",
        message: "You have successfully logged in!",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
    } catch (error) {
      console.error("Login error:", error);
      setModalContent({
        title: "Login Failed",
        message: `Login error: ${error.message}. Please check your credentials.`,
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!firebaseReady) return;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setModalContent({
        title: "Registration Successful",
        message: "Your account has been created and you are now logged in!",
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
    } catch (error) {
      console.error("Registration error:", error);
      setModalContent({
        title: "Registration Failed",
        message: `Error: ${error.message}`,
        type: "alert",
        onConfirm: () => setShowModal(false)
      });
      setShowModal(true);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    setModalContent({
      title: "Confirm Logout",
      message: "Are you sure you want to log out?",
      type: "confirm",
      onConfirm: async () => {
        try {
          await signOut(auth);
          setShowModal(false);
          setModalContent({
            title: "Logged Out",
            message: "You have been logged out.",
            type: "alert",
            onConfirm: () => setShowModal(false)
          });
          setShowModal(true);
        } catch (error) {
          console.error("Logout error:", error);
          setShowModal(false);
          setModalContent({
            title: "Logout Failed",
            message: `Logout error: ${error.message}`,
            type: "alert",
            onConfirm: () => setShowModal(false)
          });
          setShowModal(true);
        }
      },
      onCancel: () => setShowModal(false)
    });
    setShowModal(true);
  };

  if (loadingAuth) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-lg animate-pulse">
        Loading authentication...
      </div>
    );
  }

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md mx-auto my-8 text-gray-900 dark:text-gray-100 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center"><User className="mr-2" /> User & Admin Access</h2>
      
      {user ? (
        <div className="text-center">
          <p className="mb-4 text-gray-700 dark:text-gray-300">Currently signed in with User ID:</p>
          <p className="font-mono bg-gray-100 dark:bg-gray-700 p-3 rounded-md break-all text-indigo-600 dark:text-indigo-400">
            {user.uid}
          </p>
          {isAdmin ? (
            <p className="mt-4 text-green-600 dark:text-green-400 font-semibold flex items-center justify-center">
              <Check size={20} className="mr-2" /> You are logged in as Admin! (Awais Nawaz)
            </p>
          ) : user.isAnonymous ? (
            <p className="mt-4 text-gray-600 dark:text-gray-300 flex items-center justify-center">
              <Info size={18} className="mr-2" /> This is an anonymous visitor account.
            </p>
          ) : (
            <p className="mt-4 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-center">
              <Check size={20} className="mr-2" /> You are logged in as a Registered User.
            </p>
          )}
          <button
            onClick={handleLogout}
            className="mt-6 w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 flex items-center justify-center"
          >
            <LogOut size={20} className="mr-2" /> Logout
          </button>
        </div>
) : (
        <div>
          {showLoginForm ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  id="admin-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Example@gmail.com"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input
                  type="password"
                  id="admin-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password "
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 flex items-center justify-center"
              >
                <Power size={20} className="mr-2" /> Login
              </button>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button type="button" onClick={() => setShowLoginForm(false)} className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Register now
                </button>
              </p>
            </form>
          ) : (
            <div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    id="register-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <input
                    type="password"
                    id="register-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300 flex items-center justify-center"
                >
                  <Check size={20} className="mr-2" /> Create Account
                </button>
              </form>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                <button type="button" onClick={() => setShowLoginForm(true)} className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center mx-auto">
                  <ArrowLeft size={16} className="mr-1" /> Back to Login
                </button>
              </p>
            </div>
          )}
        </div>
      )}
      <Modal {...modalContent} show={showModal} />
    </div>
  );
};

const UserProfile = () => {
  const { user, db, firebaseReady } = useFirebase();
  const [userPoetries, setUserPoetries] = useState([]);

  useEffect(() => {
    if (!firebaseReady || !user || !db) return;

    const q = query(
      collection(db, `artifacts/${firebaseConfig.appId}/public/data/poetries`),
      where('submittedBy', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const poetries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserPoetries(poetries);
    });

    return () => unsubscribe();
  }, [db, firebaseReady, user]);

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg my-8 animate-fade-in">
      <div className="flex items-center mb-6">
        <UserCircle size={40} className="text-indigo-600 dark:text-indigo-400 mr-4" />
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Profile</h2>
          <p className="text-gray-600 dark:text-gray-300">Your User ID: <span className="font-mono text-sm break-all">{user.uid}</span></p>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">My Submissions</h3>
      {userPoetries.length > 0 ? (
        userPoetries.map((poetry) => (
          <PoetryCard key={poetry.id} poetry={poetry} />
        ))
      ) : (
        <p className="text-gray-500 dark:text-gray-400 italic">You have not submitted any poetry yet.</p>
      )}
    </div>
  );
};


const App = () => {
  const { firebaseReady, db, isAdmin, user, isRegisteredUser } = useFirebase();
  const [labels, setLabels] = useState([]);
  const [poetries, setPoetries] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState('All');
  const [currentPage, setCurrentPage] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdminSetupInfo, setShowAdminSetupInfo] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingPoetries, setLoadingPoetries] = useState(false);
  const poetriesPerPage = 5;

  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('theme');
    return savedMode === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  useEffect(() => {
    if (!firebaseReady || !db) return;

    const checkAndAddDefaultLabels = async () => {
      const labelsColRef = collection(db, `artifacts/${firebaseConfig.appId}/public/data/labels`);
      const snapshot = await getDocs(labelsColRef);
      if (snapshot.empty) {
        console.log("Adding default labels...");
        await addDoc(labelsColRef, { name: "Nature" });
        await addDoc(labelsColRef, { name: "Love" });
        await addDoc(labelsColRef, { name: "Life" });
        await addDoc(labelsColRef, { name: "Urdu" });
        await addDoc(labelsColRef, { name: "English" });
        await addDoc(labelsColRef, { name: "Saraiki" });
        await addDoc(labelsColRef, { name: "Quotes" });
      }
    };
    checkAndAddDefaultLabels();
  }, [db, firebaseReady]);


  useEffect(() => {
    if (!firebaseReady || !db) return;

    const checkAndAddDefaultPoetries = async () => {
      const poetriesColRef = collection(db, `artifacts/${firebaseConfig.appId}/public/data/poetries`);
      const snapshot = await getDocs(poetriesColRef);
      if (snapshot.empty) {
        console.log("Adding default poetries...");
        await addDoc(poetriesColRef, {
          title: "ہزاروں خواہشیں ایسی",
          content: `ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے
بہت نکلے مرے ارمان لیکن پھر بھی کم نکلے`,
          label: "Urdu",
          language: "Urdu",
          submittedBy: "pre-filled",
          status: "approved",
          likes: [],
          comments: [],
          createdAt: new Date(2023, 0, 15),
          author: "Mirza Ghalib"
        });
        await addDoc(poetriesColRef, {
          title: "دل ناداں تجھے ہوا کیا ہے",
          content: `دلِ ناداں تجھے ہوا کیا ہے
آخر اس درد کی دوا کیا ہے`,
          label: "Urdu",
          language: "Urdu",
          submittedBy: "pre-filled",
          status: "approved",
          likes: [],
          comments: [],
          createdAt: new Date(2023, 1, 20),
          author: "Mirza Ghalib"
        });
        await addDoc(poetriesColRef, {
          title: "جو گزاری نہ جا سکی ہم سے",
          content: `جو گزاری نہ جا سکی ہم سے
ہم نے وہ زندگی گزاری ہے`,
          label: "Urdu",
          language: "Urdu",
          submittedBy: "pre-filled",
          status: "approved",
          likes: [],
          comments: [],
          createdAt: new Date(2023, 2, 10),
          author: "Jaun Elia"
        });
        await addDoc(poetriesColRef, {
          title: "یہ مجھے چین کیوں نہیں پڑتا",
          content: `یہ مجھے چین کیوں نہیں پڑتا
ایک ہی شخص تھا جہان میں کیا`,
          label: "Urdu",
          language: "Urdu",
          submittedBy: "pre-filled",
          status: "approved",
          likes: [],
          comments: [],
          createdAt: new Date(2023, 3, 5),
          author: "Jaun Elia"
        });
        await addDoc(poetriesColRef, {
          title: "توں محنت کر، تے محنت دا صلہ جانے",
          content: `توں محنت کر، تے محنت دا صلہ جانے خدا جانے
توں دیوا بال کے رکھ شاکر، ہوا جانے خدا جانے`,
          label: "Saraiki",
          language: "Saraiki",
          submittedBy: "pre-filled",
          status: "approved",
          likes: [],
          comments: [],
          createdAt: new Date(2023, 4, 1),
          author: "Shakir Shuja Abadi"
        });
         await addDoc(poetriesColRef, {
          title: "اساں اُجڑے لوک مقدراں دے",
          content: `اساں اُجڑے لوک مقدراں دے، ویران نصیب دا حال نہ پچھ
توں شاکر آپ سیانا ایں، ساڈا چہرہ پڑھ حالات نہ پچھ`,
          label: "Saraiki",
          language: "Saraiki",
          submittedBy: "pre-filled",
          status: "approved",
          likes: [],
          comments: [],
          createdAt: new Date(2023, 5, 10),
          author: "Shakir Shuja Abadi"
        });
        await addDoc(poetriesColRef, {
          title: "Life is what happens...",
          content: `Life is what happens when you're busy making other plans.`,
          label: "Quotes",
          language: "English",
          submittedBy: "pre-filled",
          status: "approved",
          likes: [],
          comments: [],
          createdAt: new Date(2023, 6, 1),
          author: "John Lennon"
        });
        await addDoc(poetriesColRef, {
          title: "The only way to do great work...",
          content: `The only way to do great work is to love what you do.`,
          label: "Quotes",
          language: "English",
          submittedBy: "pre-filled",
          status: "approved",
          likes: [],
          comments: [],
          createdAt: new Date(2023, 7, 15),
          author: "Steve Jobs"
        });
        await addDoc(poetriesColRef, {
          title: "My New English Poem (Pending)",
          content: `This is a test poem submitted by a visitor.
It needs admin approval to be visible on the main page.`,
          label: "English",
          language: "English",
          submittedBy: "some-visitor-uid",
          status: "pending",
          likes: [],
          comments: [],
          createdAt: new Date(2024, 0, 1),
          author: "Visitor"
        });
      }
    };
    checkAndAddDefaultPoetries();
  }, [db, firebaseReady]);


  useEffect(() => {
    if (!firebaseReady || !db) return;

    const labelsUnsub = onSnapshot(collection(db, `artifacts/${firebaseConfig.appId}/public/data/labels`), (snapshot) => {
      const labelsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLabels(labelsData);
    });

    return () => {
      labelsUnsub();
    };
  }, [db, firebaseReady]);

  const fetchPoetries = async (nextPage = false) => {
    if (!firebaseReady || !db) return;
    setLoadingPoetries(true);

    const poetryColRef = collection(db, `artifacts/${firebaseConfig.appId}/public/data/poetries`);
    let q = query(
      poetryColRef,
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(poetriesPerPage)
    );

    if (nextPage && lastVisible) {
      q = query(
        poetryColRef,
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
      limit(poetriesPerPage)
      );
    }
    
    try {
      const documentSnapshots = await getDocs(q);
      const newPoetries = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setPoetries(prevPoetries => [...prevPoetries, ...newPoetries]);
      setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
      setHasMore(newPoetries.length === poetriesPerPage);
    } catch (error) {
      console.error("Error fetching poetries:", error);
    } finally {
      setLoadingPoetries(false);
    }
  };

  useEffect(() => {
    fetchPoetries();
  }, [firebaseReady, db]);

  const filteredPoetries = poetries
    .filter(p => selectedLabel === 'All' || p.label === selectedLabel)
    .filter(p =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.author && p.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.language && p.language.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.label && p.label.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans p-4 transition-colors duration-300`}>
      <HelmetProvider>
        <Helmet>
          <title>UfaqTech Poetry by Awais Nawaz - Urdu, Saraiki, English Gazal & Quotes</title>
          <meta name="description" content="Explore a collection of poetry from Awais Nawaz and UfaqTech. Find beautiful Urdu poetry, Saraiki poetry, English poems, ghazals, and inspiring quotes. Submit your own creative writing!" />
          <meta name="keywords" content="Awais Nawaz, UfaqTech, Awais poetry, ufaqTech poetry, saraki poetry, urdu poetry, English poetry, Gazal, quotes, Ufaq poetry" />
          <meta name="author" content="Awais Nawaz" />
        </Helmet>
      </HelmetProvider>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet" />
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .animate-fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }
        .animate-zoom-in { animation: zoomIn 0.3s ease-out forwards; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        
        .font-urdu {
          font-family: 'Noto Nastaliq Urdu', serif;
        }
        `}
      </style>
      <header className="py-6 px-8 bg-white dark:bg-gray-800 shadow-md rounded-xl mb-8 flex flex-col sm:flex-row justify-between items-center animate-fade-in">
        <div className="flex items-center mb-4 sm:mb-0">
          <BookOpenText size={40} className="text-indigo-600 dark:text-indigo-400 mr-3" />
          <h1 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">UfaqTech Poetry</h1>
          <span className="ml-2 text-xl font-medium text-gray-500 dark:text-gray-400">by UFAQ</span>
        </div>
        <nav className="flex flex-wrap justify-center space-x-2 sm:space-x-4 mt-4 sm:mt-0 items-center">
          <button
            onClick={() => { setCurrentPage('home'); setShowAdminSetupInfo(true); }}
            className={`px-4 py-2 rounded-full transition duration-300 font-medium ${currentPage === 'home' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            Home
          </button>
          <button
            onClick={() => { setCurrentPage('submit'); setShowAdminSetupInfo(false); }}
            className={`px-4 py-2 rounded-full transition duration-300 font-medium ${currentPage === 'submit' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            Submit Poetry
          </button>
          {user && (
            <button
              onClick={() => { setCurrentPage('profile'); setShowAdminSetupInfo(false); }}
              className={`px-4 py-2 rounded-full transition duration-300 font-medium ${currentPage === 'profile' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              My Profile
            </button>
          )}
          <button
            onClick={() => { setCurrentPage('auth'); setShowAdminSetupInfo(false); }}
            className={`px-4 py-2 rounded-full transition duration-300 font-medium ${currentPage === 'auth' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            User/Admin Login
          </button>
          {isAdmin && (
            <button
              onClick={() => { setCurrentPage('admin'); setShowAdminSetupInfo(false); }}
              className={`px-4 py-2 rounded-full transition duration-300 font-medium ${currentPage === 'admin' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              Admin Panel
            </button>
          )}
          <button
            onClick={toggleDarkMode}
            className="p-2 ml-2 rounded-full transition duration-300 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>
      </header>

      <main className="container mx-auto max-w-4xl p-4">
        {showAdminSetupInfo && currentPage === 'home' && user && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg flex flex-col sm:flex-row items-center justify-center animate-fade-in-down">
              <Info size={18} className="mr-2 text-yellow-600 dark:text-yellow-400 mb-2 sm:mb-0" />
              <span className="mb-2 sm:mb-0">Your User ID (for admin setup): <span className="font-mono text-yellow-700 dark:text-yellow-300 ml-1 break-all">{user.uid}</span></span>
              <p className="mt-2 text-xs sm:mt-0 sm:ml-4">
                To become admin, <span className="font-bold">create a user with email/password in Firebase Authentication</span> (e.g., mawais03415942806@gmail.com / Aw@is@32303).
                Then, set that user's UID as `ADMIN_UID` in `App.jsx` and log in via the "User/Admin Login" tab.
              </p>
          </div>
        )}
        {currentPage === 'home' && (
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-1/4 animate-fade-in-down">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Categories</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setSelectedLabel('All')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition duration-300 font-medium ${selectedLabel === 'All' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      All
                    </button>
                  </li>
                  {labels.map((label) => (
                    <li key={label.id}>
                      <button
                        onClick={() => setSelectedLabel(label.name)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition duration-300 font-medium ${selectedLabel === label.name ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                      >
                        {label.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center"><Search className="mr-2" /> Search Poetry</h3>
                <input
                  type="text"
                  placeholder="Search titles, content, author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </aside>
            <section className="w-full md:w-3/4">
              {filteredPoetries.length > 0 ? (
                <>
                  {filteredPoetries.map((poetry) => (
                    <PoetryCard key={poetry.id} poetry={poetry} />
                  ))}
                  {hasMore && (
                    <div className="text-center mt-4 animate-fade-in">
                      <button
                        onClick={() => fetchPoetries(true)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto hover:bg-indigo-700 transition duration-300 disabled:opacity-50"
                        disabled={loadingPoetries}
                      >
                        {loadingPoetries ? (
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <>
                            <ChevronsDown size={20} className="mr-2" /> Load More
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-lg animate-fade-in">
                  No poetry found for this category or search term. Be the first to submit!
                </div>
              )}
            </section>
          </div>
        )}
        {currentPage === 'submit' && <PoetrySubmissionForm labels={labels} />}
        {currentPage === 'profile' && <UserProfile />}
        {currentPage === 'admin' && isAdmin && <AdminPanel labels={labels} poetries={poetries} />}
        {currentPage === 'admin' && !isAdmin && (
           <div className="p-8 text-center text-red-500 dark:text-red-400 bg-white dark:bg-gray-800 rounded-xl shadow-lg animate-fade-in">
             You do not have access to the admin panel.
           </div>
        )}
        {currentPage === 'auth' && <AuthPanel />}
      </main>

      <footer className="text-center text-gray-600 dark:text-gray-400 mt-12 text-sm opacity-80 animate-fade-in">
        <p>&copy; {new Date().getFullYear()} UfaqTech Poetry. All rights reserved.</p>
      </footer>
    </div>
  );
};

const AppWrapper = () => (
  <FirebaseProvider>
    <App />
  </FirebaseProvider>
);

export default AppWrapper;
