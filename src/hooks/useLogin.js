import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as yup from 'yup';
import { useAuthContext } from '@/context/useAuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../../firebase'; // Import Firestore and Firebase Auth
import { getMessaging, getToken } from "firebase/messaging";
import { doc, getDoc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore'; // Import modular methods

// Get the messaging instance
const messaging = getMessaging();

// Function to retrieve the device token
const getDeviceToken = async () => {
  console.log('16-------------------------------');
  try {
    const token = await getToken(messaging, {
      vapidKey: 'BPDEnbADRV8tMemcJdap87z5fOmPWoKwZn0ZQeawPbS_Hy6HO_i6xXCSo3lGjQ18kmT9DT9WR4ClzHVOW2Yipe0', // Replace with your VAPID key
    });
    console.log('20----------', token);
    if (token) {
      console.log("Device Token: ", token);
      return token;
    } else {
      console.log("No device token available.");
      return null;
    }
  } catch (error) {
    console.error("Error getting device token: ", error);
    return null;
  }
};

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { saveSession } = useAuthContext();
  const [searchParams] = useSearchParams();

  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password'),
  });

  const { control, handleSubmit, setError } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: 'user@demo.com',
      password: '123456',
    },
  });

  const redirectUser = () => {
    const redirectLink = searchParams.get('redirectTo');
    if (redirectLink) navigate(redirectLink);
    else navigate('/dashboard');
  };

  const storeUserInFirestore = async (user) => {
    console.log('64-------------------------------');
    try {
      const deviceToken = await getDeviceToken();
      console.log('67-----------', deviceToken);
      if (!deviceToken) return;

      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      // Existing tokens array or empty array
      const existingTokens = userDoc.exists() ? userDoc.data()?.deviceTokens || [] : [];

      // Only update if token doesn't already exist
      if (!existingTokens.includes(deviceToken)) {
        // Add new device token to the array and update lastLogin
        await setDoc(userRef, {
          email: user.email,
          lastLogin: serverTimestamp(),
          deviceTokens: arrayUnion(deviceToken), // Store the device token in an array
        }, { merge: true });

        console.log('✅ New device token added and lastLogin updated');
      } else {
        // Just update the lastLogin timestamp if token already exists
        await setDoc(userRef, {
          lastLogin: serverTimestamp(),
        }, { merge: true });

        console.log('✅ Existing token found, only lastLogin updated');
      }
    } catch (error) {
      console.error('❌ Error storing user data in Firestore:', error);
    }
  };

  const login = handleSubmit(async (values) => {
    console.log('103---------------------------');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Save token or user data
      const token = await user.getIdToken();

      saveSession({
        token,
        email: user.email,
        uid: user.uid,
      });

      // Store user data in Firestore including the device token
      await storeUserInFirestore(user);

      redirectUser();
    } catch (error) {
      const errorMsg =
        error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
          ? 'Invalid email or password'
          : 'Login failed. Please try again.';

      setError('email', {
        type: 'custom',
        message: errorMsg,
      });

      setError('password', {
        type: 'custom',
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  });

  return {
    loading,
    login,
    control,
  };
};

export default useLogin;
