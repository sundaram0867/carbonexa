import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import carbonexaLogo from '../assets/carbonexa-logo.png';
import analysisFieldImage from '../assets/section-analysis-field.jpg';
import './Login.css';

const roles = ['Researcher', 'Admin'];

function Login() {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('Researcher');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const isRegistering = mode === 'register';

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage(isRegistering
      ? 'Account registration is not connected yet. Please contact your Carbonexa administrator for access.'
      : 'Sign-in is not connected yet. Please contact your Carbonexa administrator for access.');
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setMessage('');
    setShowPassword(false);
  };

  return (
    <main
      className="login-page"
      style={{ '--login-story-image': `url("${analysisFieldImage}")` }}
    >
      <section
        className="login-story"
        aria-label="Carbonexa research workspace"
      >
        <div className="login-story-content">
          <a className="login-brand login-brand-light" href="/" aria-label="Carbonexa home">
            <img src={carbonexaLogo} alt="" />
            <span>CARBONEXA</span>
          </a>
          <div className="login-story-copy">
            <span className="login-eyebrow">INTELLIGENCE FOR A CHANGING PLANET</span>
            <h1>Turn field data into a clearer picture.</h1>
            <p>
              One secure workspace for the people studying our resources and
              shaping what comes next.
            </p>
          </div>
          <div className="login-story-footer">
            <span><ShieldCheck size={16} aria-hidden="true" /> Trusted research workspace</span>
            <span>CARBONEXA · RESEARCH &amp; OPERATIONS</span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <a className="login-brand login-brand-dark" href="/" aria-label="Carbonexa home">
          <img src={carbonexaLogo} alt="" />
          <span>CARBONEXA</span>
        </a>

        <div className="login-card">
          <div className="login-heading">
            <span className="login-eyebrow">{isRegistering ? 'JOIN CARBONEXA' : 'WELCOME BACK'}</span>
            <h2>{isRegistering ? 'Create your account' : 'Sign in to your workspace'}</h2>
            <p>{isRegistering
              ? 'Choose your role and create one account for your workspace.'
              : 'Enter your work email and password to continue.'}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {isRegistering && (
              <>
                <div className="login-role-picker" role="group" aria-label="Choose your account role">
                  {roles.map((accountRole) => (
                    <button
                      type="button"
                      key={accountRole}
                      className={role === accountRole ? 'is-selected' : ''}
                      aria-pressed={role === accountRole}
                      onClick={() => {
                        setRole(accountRole);
                        setMessage('');
                      }}
                    >
                      {accountRole}
                    </button>
                  ))}
                </div>

                <label htmlFor="login-name">Full name</label>
                <input
                  id="login-name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </>
            )}

            <label htmlFor="login-email">Work email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@organization.com"
              autoComplete="email"
              required
            />

            <div className="login-password-label">
              <label htmlFor="login-password">Password</label>
              {!isRegistering && (
                <button
                  type="button"
                  className="login-text-button"
                  onClick={() => setMessage('Please contact your Carbonexa administrator to reset your password.')}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="login-password-wrap">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                minLength={isRegistering ? 8 : undefined}
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {!isRegistering && (
              <label className="login-remember">
                <input type="checkbox" name="remember" />
                <span>Keep me signed in</span>
              </label>
            )}

            {message && <p className="login-message" role="status">{message}</p>}

            <button type="submit" className="login-submit">
              {isRegistering ? `Create ${role} account` : 'Sign in'}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>

          <p className="login-access-note">
            {isRegistering ? 'Already have an account?' : 'New to Carbonexa?'}{' '}
            <button
              type="button"
              className="login-mode-switch"
              onClick={() => changeMode(isRegistering ? 'login' : 'register')}
            >
              {isRegistering ? 'Sign in' : 'Create an account'}
            </button>
          </p>
          {!isRegistering && (
            <p className="login-access-note login-admin-note">
              Need access? <a href="mailto:support@carbonexa.com">Contact your workspace administrator</a>
            </p>
          )}
        </div>

        <p className="login-legal">© {new Date().getFullYear()} Carbonexa. All rights reserved.</p>
      </section>
    </main>
  );
}

export default Login;
