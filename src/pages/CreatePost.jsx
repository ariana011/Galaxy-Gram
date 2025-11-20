import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./CreateEdit.css";

function getCreatorId() {
    let id = localStorage.getItem("gg_creator_id");
    if (!id) {
        id = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("gg_creator_id", id);
    }
    return id;
}


export default function CreatePost() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreate = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert("Title is required.");
            return;
        }

        setLoading(true);

        const creator_id = getCreatorId();  // now safe because DB column is TEXT

        const { data, error } = await supabase
            .from("posts")
            .insert([
                {
                    title: title.trim(),
                    content: content || null,
                    image_url: imageUrl || null,
                    creator_id
                }
            ])
            .select()
            .single();

        setLoading(false);

        if (error) {
            console.error("Supabase insert error:", error);
            alert("Failed to create post.");
            return;
        }

        navigate(`/post/${data.id}`);
    };


    return (
        <div className="form-container">
            <h2>Create Post</h2>
            <form onSubmit={handleCreate} className="post-form">
                <label>Title (required)</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required />

                <label>Additional Content</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} />

                <label>Image URL (external)</label>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />

                <button type="submit" disabled={loading}>{loading ? "Posting..." : "Post"}</button>
            </form>
        </div>
    );
}
