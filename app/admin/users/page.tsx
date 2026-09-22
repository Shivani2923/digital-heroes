"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");

      // Check the currently logged-in session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("Current session:", session);

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        setError("No authenticated session found. Please log in again.");
        setUsers([]);
        return;
      }

      // Fetch users from the profiles table
      const { data, error: usersError } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at")
        .order("created_at", { ascending: false });

      if (usersError) {
        console.error("Users fetch error:", usersError);
        throw usersError;
      }

      setUsers(data || []);
    } catch (error: unknown) {
      console.error("Error loading users:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to load users");
      }

      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "48px 6%",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "36px",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              color: "#009f7f",
              fontWeight: 700,
              letterSpacing: "1px",
              marginBottom: "12px",
            }}
          >
            DIGITAL HEROES ADMIN
          </p>

          <h1
            style={{
              fontSize: "42px",
              color: "#111827",
              margin: 0,
            }}
          >
            User Management
          </h1>

          <p
            style={{
              color: "#475569",
              fontSize: "18px",
              marginTop: "12px",
            }}
          >
            View registered users and their account details.
          </p>
        </div>

        <button
          onClick={() => {
            window.location.href = "/admin";
          }}
          style={{
            background: "#111827",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "16px 24px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Back to Admin Dashboard
        </button>
      </div>

      {/* Users Section */}
      <section
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "28px",
          overflowX: "auto",
        }}
      >
        <h2
          style={{
            color: "#111827",
            marginBottom: "24px",
          }}
        >
          Registered Users
        </h2>

        {/* Loading State */}
        {loading && (
          <p style={{ color: "#475569" }}>
            Loading users...
          </p>
        )}

        {/* Error State */}
        {!loading && error && (
          <div>
            <p style={{ color: "red", marginBottom: "16px" }}>
              Failed to load users: {error}
            </p>

            <button
              onClick={fetchUsers}
              style={{
                background: "#111827",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "12px 20px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && users.length === 0 && (
          <p style={{ color: "#475569" }}>
            No users found.
          </p>
        )}

        {/* Users Table */}
        {!loading && !error && users.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "750px",
            }}
          >
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                <th style={headerStyle}>Name</th>
                <th style={headerStyle}>Email</th>
                <th style={headerStyle}>Role</th>
                <th style={headerStyle}>Created At</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={cellStyle}>
                    {user.full_name || "Not provided"}
                  </td>

                  <td style={cellStyle}>
                    {user.email || "Not provided"}
                  </td>

                  <td style={cellStyle}>
                    <span
                      style={{
                        background:
                          user.role === "admin"
                            ? "#dbeafe"
                            : "#dcfce7",
                        color:
                          user.role === "admin"
                            ? "#1d4ed8"
                            : "#15803d",
                        padding: "7px 12px",
                        borderRadius: "20px",
                        fontWeight: 600,
                      }}
                    >
                      {user.role || "user"}
                    </span>
                  </td>

                  <td style={cellStyle}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

const headerStyle = {
  textAlign: "left" as const,
  padding: "16px",
  color: "#1e293b",
  borderBottom: "1px solid #cbd5e1",
};

const cellStyle = {
  padding: "18px 16px",
  color: "#334155",
  borderBottom: "1px solid #e2e8f0",
};