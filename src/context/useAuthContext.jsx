import {createContext, useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCookies} from 'react-cookie';

const AuthContext = createContext(undefined);

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}

const authSessionKey = '_uBold_AUTH_KEY_';

export function AuthProvider({
                                 children
                             }) {
    const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies([authSessionKey]);
    const cookieSession = cookies[authSessionKey];
    const getSession = () => {
        const fetchedCookie = cookieSession;
        if (!fetchedCookie) return; else return fetchedCookie;
    };
    const [user, setUser] = useState(getSession());

    useEffect(() => {
        if (cookieSession) {
            setUser(cookieSession);
        } else if (!cookieSession && user) {
            setUser(undefined);
        }
    }, [cookieSession]);

    const saveSession = user => {
        setUser(user);
        setCookie(authSessionKey, user, {
            path: '/',
            sameSite: 'lax'
        });
    };
    const removeSession = () => {
        removeCookie(authSessionKey, {
            path: '/'
        });
        setUser(undefined);
        navigate('/auth/login', {
            replace: true
        });
    };
    return <AuthContext.Provider value={{
        user,
        isAuthenticated: !!(user || cookieSession),
        saveSession,
        removeSession
    }}>
        {children}
    </AuthContext.Provider>;
}
