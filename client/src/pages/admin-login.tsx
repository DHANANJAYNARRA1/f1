import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password })
      });
      
      // Check if response is ok before trying to parse JSON
      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.message || "Login failed");
        } catch {
          setError(`Login failed: ${res.status} ${res.statusText}`);
        }
        return;
      }
      
      const data = await res.json();
      
      if (data.success && data.user) {
        // Check if user is admin or superadmin
        if (data.user.isAdmin || data.user.role === 'admin' || data.user.role === 'superadmin') {
          localStorage.setItem("admin", JSON.stringify(data.user));
          
          // Redirect based on role
          if (data.user.role === 'superadmin') {
            navigate("/superadmin");
          } else {
            navigate("/admin");
          }
        } else {
          setError("Access denied. Admin privileges required.");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">Admin Login</h1>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border p-2 rounded"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full border p-2 rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button className="w-full" type="submit">Login</Button>
        </form>
        <p className="mt-4 text-xs text-gray-500 text-center">
          (This page is for admin use only)
        </p>
      </div>
    </div>
  );
}