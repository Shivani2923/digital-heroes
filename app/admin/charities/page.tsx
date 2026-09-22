"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Charity = {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

const supabase = createClient();

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  async function fetchCharities() {
    setLoading(true);

    const { data, error } = await supabase
      .from("charities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching charities:", error);
      alert("Failed to load charities");
    } else {
      setCharities(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchCharities();
  }, []);

  function clearForm() {
    setName("");
    setDescription("");
    setImageUrl("");
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      alert("Please enter charity name and description");
      return;
    }

    if (editingId !== null) {
      const { error } = await supabase
        .from("charities")
        .update({
          name,
          description,
          image_url: imageUrl || null,
        })
        .eq("id", editingId);

      if (error) {
        console.error("Update error:", error);
        alert("Failed to update charity");
        return;
      }

      alert("Charity updated successfully");
    } else {
      const { error } = await supabase.from("charities").insert({
        name,
        description,
        image_url: imageUrl || null,
        is_active: true,
      });

      if (error) {
        console.error("Insert error:", error);
        alert("Failed to add charity");
        return;
      }

      alert("Charity added successfully");
    }

    clearForm();
    fetchCharities();
  }

  function handleEdit(charity: Charity) {
    setEditingId(charity.id);
    setName(charity.name);
    setDescription(charity.description);
    setImageUrl(charity.image_url || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function toggleActive(charity: Charity) {
    const { error } = await supabase
      .from("charities")
      .update({
        is_active: !charity.is_active,
      })
      .eq("id", charity.id);

    if (error) {
      console.error("Status update error:", error);
      alert("Failed to update charity status");
      return;
    }

    fetchCharities();
  }

  async function deleteCharity(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this charity?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("charities")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      alert("Failed to delete charity");
      return;
    }

    alert("Charity deleted successfully");
    fetchCharities();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "45px",
      }}
    >
      <div
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                color: "#009f78",
                fontWeight: "700",
                letterSpacing: "1px",
              }}
            >
              DIGITAL HEROES ADMIN
            </p>

            <h1
              style={{
                fontSize: "40px",
                color: "#0f172a",
                margin: "10px 0",
              }}
            >
              Charity Management
            </h1>

            <p
              style={{
                fontSize: "18px",
                color: "#475569",
              }}
            >
              Add, edit, and manage charities.
            </p>
          </div>

          <Link href="/admin">
            <button
              style={{
                background: "#0f172a",
                color: "white",
                padding: "14px 22px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Back to Admin Dashboard
            </button>
          </Link>
        </div>

        <section
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "16px",
            marginTop: "35px",
          }}
        >
          <h2 style={{ color: "#0f172a" }}>
            {editingId !== null ? "Edit Charity" : "Add New Charity"}
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: "16px",
              marginTop: "20px",
            }}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Charity name"
              style={inputStyle}
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Charity description"
              rows={4}
              style={inputStyle}
            />

            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL (optional)"
              style={inputStyle}
            />

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" style={primaryButton}>
                {editingId !== null ? "Update Charity" : "Add Charity"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={clearForm}
                  style={secondaryButton}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "16px",
            marginTop: "30px",
            overflowX: "auto",
          }}
        >
          <h2 style={{ color: "#0f172a" }}>All Charities</h2>

          {loading ? (
            <p>Loading charities...</p>
          ) : charities.length === 0 ? (
            <p style={{ color: "#64748b" }}>No charities found.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px",
              }}
            >
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  <th style={cellStyle}>ID</th>
                  <th style={cellStyle}>Name</th>
                  <th style={cellStyle}>Description</th>
                  <th style={cellStyle}>Status</th>
                  <th style={cellStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {charities.map((charity) => (
                  <tr key={charity.id}>
                    <td style={cellStyle}>{charity.id}</td>

                    <td style={cellStyle}>
                      <strong>{charity.name}</strong>
                    </td>

                    <td style={cellStyle}>{charity.description}</td>

                    <td style={cellStyle}>
                      <span
                        style={{
                          background: charity.is_active
                            ? "#d1fae5"
                            : "#fee2e2",
                          color: charity.is_active
                            ? "#047857"
                            : "#b91c1c",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontWeight: "600",
                        }}
                      >
                        {charity.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td style={cellStyle}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() => handleEdit(charity)}
                          style={smallButton}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => toggleActive(charity)}
                          style={smallButton}
                        >
                          {charity.is_active ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          onClick={() => deleteCharity(charity.id)}
                          style={{
                            ...smallButton,
                            background: "#dc2626",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "13px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "16px",
  boxSizing: "border-box" as const,
};

const primaryButton = {
  background: "#009f78",
  color: "white",
  padding: "13px 22px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600" as const,
};

const secondaryButton = {
  background: "#64748b",
  color: "white",
  padding: "13px 22px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600" as const,
};

const smallButton = {
  background: "#2563eb",
  color: "white",
  padding: "8px 12px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600" as const,
};

const cellStyle = {
  padding: "15px",
  borderBottom: "1px solid #e2e8f0",
  textAlign: "left" as const,
  color: "#334155",
};