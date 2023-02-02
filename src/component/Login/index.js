import React, { useState } from 'react';
import axios from 'axios';
import { baseImagePath } from '../../utils/utility';
import Input from '../shared/Input';
import SignInButton from '../shared/SignInButton';
import useStore from '../../store';

const Login = () => {
  const setUser = useStore(state => state.setUser);
  const setLogin = useStore(state => state.setLogin);
  const [formFields, setFormFields] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);

  const handleTextChange = e => {
    setFormFields(prevState => {
      return {
        ...prevState,
        [e.target.name]: e.target.value,
      };
    });
  };

  const loginPassword = async e => {
    e.preventDefault();
    setError(null);
    try {
      const { email, password } = formFields;

      if (email === '' && password === '') {
        throw new Error("Please fill in your log in details.");
      }
      if (email === '') {
        throw new Error("Please fill in your email address.");
      }
      if (password === '') {
        throw new Error("Please fill in your password.");
      }

      const body = {
        user: {
          email,
          password,
        },
      };

      let data = null;
      try {
        await axios.post('https://my-api.espres.so/v1/auth/login', body)
        .then(function (res) {
          data = res.data;
        })
        .catch(function (errorPost) {
          let postErrorMessage = null;

          if (errorPost.response === undefined) {
            throw new Error("Please check your internet connection.");
          }

          let postError = errorPost.response.status;
          switch (postError) {
            case 403:
              postErrorMessage = "Please check your log in details and try again.";
              break;
            case 429:
              postErrorMessage = "Too many attempts to sign in - please try again after some time.";
              break;
            case 401:
              postErrorMessage = "Please check your email to verify your account.";
              break;
            default:
              postErrorMessage = "Please check your log in details and try again.";
          }
          throw new Error(postErrorMessage);
        });
      } catch (e) {
        let message = null;
        message = e.message;
        throw new Error(message);
      }

      setUser(data);
      setLogin(data);
      setFormFields({
        email: '',
        password: '',
      });

    } catch (error) {
      setError(error.message);
    }
  };

  const authLoginUrl = platform => {
    window.electron.openAuthUrl(platform);
  };

  const openEspressoUrl = url => {
    window.electron.openEspressoUrl(url);
  }

  return (
    <div className="es_main_wrapper_dark">
      <div id="login-wrapper">
        <div className="login-header" style={{paddingTop: "12px"}}>
          <img src={baseImagePath('thumbnails/logo-white.svg')} alt="espresso" />
          <p style={{color:"white", paddingTop: "16px", paddingBottom: "16px"}}>Log in to espressoFlow</p>
        </div>
        <form id="login-fields" onSubmit={loginPassword}>
          <Input
            type="email"
            name="email"
            placeholder="Email address"
            value={formFields.email}
            onChange={handleTextChange}
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formFields.password}
            onChange={handleTextChange}
          />
          <button type="submit" className="login-btn">
            <img
              src={baseImagePath('icons/next-arrow-white.svg')}
              alt="login espressoFlow"
            />
          </button>
        </form>
        {error && <p className="error-label">{error}</p>}
        <a onClick={() => {openEspressoUrl("https://my.espres.so/forgot-password")}} href="/" className="forgot-password">
          Forgotten password?
        </a>
        <div className="separator">
          <hr></hr>
          <span style={{color:"white"}}>or</span>
          <hr></hr>
        </div>

        <div className="sso-container">
          <SignInButton
            label="Sign in with Apple"
            onClick={() => authLoginUrl('apple')}
            icon={baseImagePath('icons/apple-icon.svg')}
          />
          <SignInButton
            label="Sign in with Google"
            onClick={() => authLoginUrl('google')}
            icon={baseImagePath('icons/google.svg')}
          />
        </div>
        <div className="login-footer">
          <span style={{color:"white"}}>
            Don't have an account? <a onClick={() => {openEspressoUrl("https://my.espres.so/signup")}} href="/">Sign up</a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
