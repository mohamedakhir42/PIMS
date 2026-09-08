import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await authService.login(username, password);

      authService.setToken(response.access_token);

      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Unable to sign in. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative"
      style={{
        backgroundImage: "url('/assets/background-login.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Background overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background: 'rgba(255,255,255,0.08)',
        }}
      />

      {/* Login container */}
      <div
        className="container position-relative"
        style={{ zIndex: 2,}}
      >
        <div className="row justify-content-start">
          <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">

            {/* Glass card */}
            <div
              className="p-4 p-md-5"
              style={{
                height:"100vh",
                background: 'rgba(255, 255, 255)',
                // backdropFilter: 'blur(5px)',
                // WebkitBackdropFilter: 'blur(15px)',
                // border: '0.5px solid rgba(255,255,255,0.85)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              }}
            >

              {/* Logo OCP */}
              <div className="text-center mb-3">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center"
                >
                  <img src="/assets/logo-ocp.png" width="60px"></img>
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-1">
                  Inventory management system
                </h2>

                <p className="text-secondary mb-0">
                  Welcome back, please enter your details to sign in.
                </p>
              </div>
            

              {/* Error */}
              {error && (
                <div
                  className="alert alert-danger py-2 small rounded-2"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>

                {/* Email */}
                <div className="mb-3">

                  <label
                    htmlFor="username"
                    className="form-label fw-semibold"
                  >
                    E-Mail Address
                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-transparent border-secondary-subtle">
                      <Mail size={18} />
                    </span>

                    <input
                      id="username"
                      type="text"
                      className="form-control bg-transparent border-secondary-subtle py-2"
                      placeholder="Enter your email..."
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value)
                      }
                      autoComplete="username"
                      autoFocus
                      required
                    />

                  </div>

                </div>

                {/* Password */}
                <div className="mb-3">

                  <label
                    htmlFor="password"
                    className="form-label fw-semibold"
                  >
                    Password
                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-transparent border-secondary-subtle">
                      <Lock size={18} />
                    </span>

                    <input
                      id="password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      className="form-control bg-transparent border-secondary-subtle py-2"
                      placeholder="Password@123"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      className="btn btn-outline-secondary border-secondary-subtle"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>


                {/* Sign in */}
                <button
                  type="submit"
                  className="btn w-100 rounded-2 py-2 fw-semibold"
                  style={{ backgroundColor: "#007A3D", color: "white" }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />

                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>

              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;