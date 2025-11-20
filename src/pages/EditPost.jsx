import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import "./CreateEdit.css";

function getCreatorId() {
    let id = localStorage.getItem("gg_creator_id");
    if (!id) {
        id = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("gg_creator_id", id);
    }
    return id;
}

export default function EditPost() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const creatorId = getCreatorId();

    useEffect(() => {
        const load = async () => {
            const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();
            if (error) { console.error(error); navigate("/"); return; }
            setPost(data);
            setTitle(data.title);
            setContent(data.content || "");
            setImageUrl(data.image_url || "");
            setLoading(false);
        };
        load();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (!post) return <p>Not found</p>;
    if (post.creator_id !== creatorId) return <p>You are not the creator of this post.</p>;

    const handleSave = async (e) => {
        e.preventDefault();
        if (!title.trim()) return alert("Title required.");
        const { error } = await supabase.from("posts").update({
            title: title.trim(),
            content: content || null,
            image_url: imageUrl || null
        }).eq("id", id);
        if (error) { console.error(error); alert("Update failed."); return; }
        navigate(`/post/${id}`);
    };

    return (
        <div className="form-container">
            <h2>Edit Post</h2>
            <form onSubmit={handleSave} className="post-form">
                <label>Title (required)</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required />

                <label>Additional Content</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} />

                <label>Image URL (external)</label>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />

                <button type="submit">Save</button>
            </form>
        </div>
    );
}
