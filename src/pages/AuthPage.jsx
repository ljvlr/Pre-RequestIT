import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emptyFields, setEmptyFields] = useState([]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setEmptyFields([]);

    const missing = [];
    if (!email) missing.push('email');
    if (!password) missing.push('password');
    
    if (!isLogin) {
      if (!firstName) missing.push('firstName');
      if (!lastName) missing.push('lastName');
      if (!studentId) missing.push('studentId');
      if (!confirmPassword) missing.push('confirmPassword');
    }

    if (missing.length > 0) {
      setEmptyFields(missing);
      setErrorMessage('Input required data');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data: userRecord } = await supabase
          .from('profiles')
          .select('email')
          .ilike('email', email);

        if (!userRecord || userRecord.length === 0) {
          throw new Error('There is no user record corresponding to this identifier.');
        }

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (authError) {
          if (authError.message.includes('Invalid login credentials')) {
            throw new Error('The password is invalid.');
          } else if (authError.message.includes('invalid format')) {
            throw new Error('The email address is badly formatted.');
          } else {
            throw authError;
          }
        }
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData.role === 'coordinator') {
          navigate('/coordinator');
        } else if (profileData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
        
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              student_id: studentId,
              full_name: `${firstName} ${lastName}`
            }
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('Email already in use.');
          } else if (error.message.includes('invalid format')) {
            throw new Error('The email address is badly formatted.');
          } else {
            throw error;
          }
        }
        
        alert("Successfully registered.");
        setIsLogin(true);
        setFirstName('');
        setLastName('');
        setStudentId('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldName) => {
    const baseClass = "w-full p-3 border rounded-xl focus:outline-none focus:border-blue-500 ";
    return baseClass + (emptyFields.includes(fieldName) ? "border-red-500 bg-red-50" : "border-gray-300");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Pre-RequestIT</h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          {isLogin ? 'Sign in to your account' : 'Create your student account'}
        </p>

        {errorMessage && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 font-medium text-center">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="First Name" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={getInputClass('firstName')}
                />
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={getInputClass('lastName')}
                />
              </div>
              <input 
                type="text" 
                placeholder="Student ID number" 
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className={getInputClass('studentId')}
              />
            </>
          )}
          
          <input 
            type="email" 
            placeholder="USC Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={getInputClass('email')}
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={getInputClass('password')}
          />

          {!isLogin && (
            <input 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={getInputClass('confirmPassword')}
            />
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign up')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMessage('');
              setEmptyFields([]);
            }}
            type="button"
            className="text-sm text-blue-600 hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}