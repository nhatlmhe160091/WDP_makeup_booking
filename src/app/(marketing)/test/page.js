"use client";
import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/courses";

export default function CourseTestPage() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ id: "", title: "", price: "", desc: "", file: null });
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");

  // Fetch all courses
  const fetchCourses = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setCourses(data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Create course
  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("id", form.id);
    formData.append("title", form.title);
    formData.append("price", form.price);
    formData.append("desc", form.desc);
    if (form.file) formData.append("file", form.file);
    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });
    setMessage(await res.text());
    fetchCourses();
  };

  // Update course
  const handleUpdate = async (id) => {
    const formData = new FormData();
    if (form.title) formData.append("title", form.title);
    if (form.price) formData.append("price", form.price);
    if (form.desc) formData.append("desc", form.desc);
    if (form.file) formData.append("file", form.file);
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      body: formData,
    });
    setMessage(await res.text());
    fetchCourses();
  };

  // Delete course
  const handleDelete = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setMessage(await res.text());
    fetchCourses();
  };

  // Get one course
  const handleGetOne = async (id) => {
    const res = await fetch(`${API_URL}/${id}`);
    const data = await res.json();
    setForm({
      id: data.id,
      title: data.title,
      price: data.price,
      desc: data.desc,
      file: null,
    });
    setSelectedId(id);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Test CRUD Course API</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input name="id" placeholder="id" value={form.id} onChange={handleChange} required />
        <input name="title" placeholder="title" value={form.title} onChange={handleChange} required />
        <input name="price" placeholder="price" value={form.price} onChange={handleChange} required />
        <input name="desc" placeholder="desc" value={form.desc} onChange={handleChange} required />
        <input name="file" type="file" accept="image/*" onChange={handleChange} />
        <button type="submit">Create</button>
        {selectedId && <button type="button" onClick={() => handleUpdate(selectedId)}>Update</button>}
      </form>
      {message && <div style={{ color: "green" }}>{message}</div>}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>id</th>
            <th>title</th>
            <th>price</th>
            <th>desc</th>
            <th>cover</th>
            <th>actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.title}</td>
              <td>{c.price}</td>
              <td>{c.desc}</td>
              <td>{c.cover && <img src={c.cover} alt="cover" width={60} />}</td>
              <td>
                <button onClick={() => handleGetOne(c.id)}>Edit</button>
                <button onClick={() => handleDelete(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
