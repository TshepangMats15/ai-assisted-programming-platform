import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { Alert } from "react-native";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
  type User,
} from "firebase/auth";

import { auth } from "../services/firebase";
import { api, setAuthToken } from "../constants/api";

import {
  setAuthToken as setServicesAuthToken,
} from "../services/api";

export interface AuthProfile {
  id: string;
  firebaseUid: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "STUDENT";
  lastActive?: string | null;
}

type State = {
  status: "loading" | "guest" | "ready" | "error";
  user: User | null;
  profile: AuthProfile | null;
  error: string | null;
};

type Context = State & {
  login: (
    email: string,
    password: string
  ) => Promise<void>;

  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;

  logout: () => Promise<void>;

  retry: () => Promise<void>;

  resendVerificationEmail: () => Promise<void>;
};

const initial: State = {
  status: "loading",
  user: null,
  profile: null,
  error: null,
};

const AuthContext =
  createContext<Context | undefined>(undefined);

const message = (e: unknown) =>
  e instanceof Error
    ? e.message
    : "Unable to authenticate.";

function clearTokens() {
  setAuthToken(null);
  setServicesAuthToken(null);
}

// =====================================================
// LOAD AND VALIDATE BACKEND USER PROFILE
// =====================================================

async function loadProfile(
  user: User
): Promise<AuthProfile> {

  const check = () => {
    if (auth.currentUser !== user) {
      throw new Error(
        "Authentication session changed."
      );
    }
  };

  check();

  const token = await user.getIdToken(true);

  check();

  setAuthToken(token);
  setServicesAuthToken(token);

  await api.users.sync();

  check();

  const data = await api.users.getMe();

  check();

  const role = data.role?.trim().toUpperCase();

  if (
    data.firebaseUid !== user.uid ||
    (role !== "ADMIN" && role !== "STUDENT")
  ) {
    throw new Error("Invalid backend profile.");
  }

  return {
    id: String(data.id),
    firebaseUid: data.firebaseUid,
    fullName: data.fullName,
    email: data.email,
    role,
    lastActive: data.lastActive ?? null,
  };
}

// =====================================================
// AUTHENTICATION PROVIDER
// =====================================================

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [state, setState] =
    useState<State>(initial);

  const busy = useRef(false);
  const generation = useRef(0);

  // ===================================================
  // RESTORE EXISTING SESSION
  // ===================================================

  async function restore(user: User | null) {

    const version = ++generation.current;

    if (!user) {
      clearTokens();

      setState({
        ...initial,
        status: "guest",
      });

      return;
    }

    setState({
      ...initial,
      user,
    });

    try {
      const profile = await loadProfile(user);

      if (
        generation.current === version &&
        auth.currentUser === user
      ) {
        setState({
          status: "ready",
          user,
          profile,
          error: null,
        });
      }

    } catch (e) {
      if (
        generation.current === version &&
        auth.currentUser === user
      ) {
        setState({
          ...initial,
          status: "error",
          user,
          error: message(e),
        });
      }
    }
  }

  // ===================================================
  // FIREBASE AUTHENTICATION LISTENER
  // ===================================================

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,

      (user) => {
        if (
          !busy.current &&
          user === auth.currentUser
        ) {
          void restore(user);
        }
      },

      (e) => {
        if (!busy.current) {
          ++generation.current;

          setState({
            ...initial,
            status: "error",
            user: auth.currentUser,
            error: message(e),
          });
        }
      }
    );

    return () => {
      ++generation.current;
      unsubscribe();
    };

  }, []);

  // ===================================================
  // LOGIN AND REGISTRATION
  // ===================================================

  async function authenticate(
    email: string,
    password: string,
    fullName?: string
  ) {

    if (busy.current || auth.currentUser) {
      throw new Error(
        "Another session or authentication operation is active."
      );
    }

    busy.current = true;

    ++generation.current;

    let created = false;

    try {

      const cleanEmail = email.trim();

      const credential =
        fullName === undefined
          ? await signInWithEmailAndPassword(
              auth,
              cleanEmail,
              password
            )
          : await createUserWithEmailAndPassword(
              auth,
              cleanEmail,
              password
            );

      created = fullName !== undefined;

      if (created) {

        await updateProfile(
          credential.user,
          {
            displayName: fullName,
          }
        );
      }

      // Synchronize Firebase account with MySQL.

      const profile =
        await loadProfile(credential.user);

      if (
        created &&
        profile.role !== "STUDENT"
      ) {
        throw new Error(
          "Unexpected account role."
        );
      }

      // ===============================================
      // SEND REGISTRATION VERIFICATION EMAIL
      // ===============================================

      if (
        created &&
        !credential.user.emailVerified
      ) {

        try {

          console.log(
            "[Auth] Requesting verification email"
          );

          await sendEmailVerification(
            credential.user
          );

          console.log(
            "[Auth] Firebase accepted verification request"
          );

          Alert.alert(
            "Registration Successful",
            "Your DevMate account has been created. Please check your inbox and spam folder for your email verification link."
          );

        } catch (emailError: any) {

          console.warn(
            "[Verification Email Error]",
            {
              code: emailError?.code,
              message: emailError?.message,
            }
          );

          // Do not invalidate an account that
          // has already been successfully created.

          Alert.alert(
            "Account Created",
            "Your account was created successfully, but the verification email could not be requested. Please try again later."
          );
        }
      }

      // Complete authentication and allow navigation.

      setState({
        status: "ready",
        user: credential.user,
        profile,
        error: null,
      });

    } catch (e) {

      clearTokens();

      try {
        if (auth.currentUser) {
          await signOut(auth);
        }
      } catch (logoutError) {

        setState({
          ...initial,
          status: "error",
          user: auth.currentUser,
          error: message(logoutError),
        });
      }

      if (!auth.currentUser) {
        setState({
          ...initial,
          status: "guest",
        });
      }

      if (created) {
        throw new Error(
          "Your Firebase account was created, but profile setup failed. Sign in again to retry. " +
          message(e)
        );
      }

      throw e;

    } finally {
      busy.current = false;
    }
  }

  // ===================================================
  // RESEND VERIFICATION EMAIL
  // ===================================================

  async function resendVerificationEmail() {

    const user = auth.currentUser;

    if (!user) {
      throw new Error(
        "Please sign in first."
      );
    }

    await user.reload();

    if (auth.currentUser !== user) {
      throw new Error(
        "Authentication session changed."
      );
    }

    if (user.emailVerified) {

      Alert.alert(
        "Email Verified",
        "Your email address is already verified."
      );

      return;
    }

    try {

      await sendEmailVerification(user);

      Alert.alert(
        "Verification Requested",
        "Please check your inbox and spam folder for your verification link."
      );

    } catch (error: any) {

      console.warn(
        "[Resend Verification Error]",
        {
          code: error?.code,
          message: error?.message,
        }
      );

      Alert.alert(
        "Verification Failed",
        error?.code === "auth/too-many-requests"
          ? "Please wait before requesting another email."
          : "Unable to request the verification email."
      );
    }
  }

  // ===================================================
  // LOGOUT
  // ===================================================

  async function logout() {

    if (busy.current) {
      return;
    }

    busy.current = true;

    ++generation.current;

    setState(initial);

    clearTokens();

    try {

      await signOut(auth);

      setState({
        ...initial,
        status: "guest",
      });

    } catch (e) {

      setState({
        ...initial,
        status: "error",
        user: auth.currentUser,
        error: message(e),
      });

    } finally {

      busy.current = false;
    }
  }

  // ===================================================
  // RETRY SESSION RESTORATION
  // ===================================================

  async function retry() {

    if (!busy.current) {
      await restore(auth.currentUser);
    }
  }

  const effective =
    state.status === "ready" &&
    state.user !== auth.currentUser
      ? initial
      : state;

  return (
    <AuthContext.Provider
      value={{
        ...effective,

        login: (email, password) =>
          authenticate(email, password),

        register: (email, password, fullName) =>
          authenticate(
            email,
            password,
            fullName
          ),

        logout,

        retry,

        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// AUTHENTICATION HOOK
// =====================================================

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "AuthProvider missing."
    );
  }

  return context;
}