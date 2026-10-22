// src/pages/Register.tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { registerUser, clearError } from "../features/auth/authSlice";
import "./Auth.css";

function Register() {
  const [form, setForm] = useState({
    name: "", surname: "", email: "", cellNumber: "", password: "",
  });
  const [localError, setLocalError] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);

  const update = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (Object.values(form).some((v) => !v.trim())) {
      setLocalError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    setLocalError("");
    dispatch(clearError());

    const result = await dispatch(registerUser({
      ...form,
      name: form.name.trim(),
      surname: form.surname.trim(),
      email: form.email.trim(),
      cellNumber: form.cellNumber.trim(),
    }));
    if (registerUser.fulfilled.match(result)) navigate("/");
  };

  return (
    <div className="auth-page">
      <form className="auth-card wide" onSubmit={handleSubmit}>
        <div className="brand">
          <div className="brand-mark">S</div>
          <span className="brand-name">ShopList</span>
        </div>

        <h2>Create your account</h2>
        <p className="auth-subtitle">
          It takes a minute. Your password is stored encrypted.
        </p>

        <div className="row">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" placeholder="Thandi" value={form.name} onChange={update("name")} />
          </div>
          <div className="field">
            <label htmlFor="surname">Surname</label>
            <input id="surname" placeholder="Dlamini" value={form.surname} onChange={update("surname")} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={update("email")} />
        </div>

        <div className="field">
          <label htmlFor="cell">Cell number</label>
          <input id="cell" type="tel" placeholder="082 123 4567" value={form.cellNumber} onChange={update("cellNumber")} />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="At least 8 characters" value={form.password} onChange={update("password")} />
        </div>

        {(localError || error) && <p className="auth-error">{localError || error}</p>}

        <button type="submit" className="btn-primary" disabled={status === "loading"}>
          {status === "loading" ? "Creating account..." : "Create account"}
        </button>

        <p className="auth-footer">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;