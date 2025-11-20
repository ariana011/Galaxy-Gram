import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./PostPage.css";

function getCreatorId() {
    let id = localStorage.getItem("gg_creator_id");
    if (!id) {
        id = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("gg_creator_id", id);
    }
    return id;
}

export default function PostPage() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [loading, setLoading] = useState(true);
    const creatorId = getCreatorId();
    const navigate = useNavigate();

    const fetchPost = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();
        if (error) {
            console.error(error);
            setPost(null);
        } else {
            setPost(data);
        }
        setLoading(false);
    };

    const fetchComments = async () => {
        const { data } = await supabase.from("comments").select("*").eq("post_id", id).order("created_at", { ascending: true });
        setComments(data || []);
    };

    useEffect(() => {
        fetchPost();
        fetchComments();

        const sub = supabase
            .channel(`post-${id}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${id}` }, (payload) => {
                fetchComments();
            })
            .subscribe();

        return () => supabase.removeChannel(sub);
    }, [id]);

    if (loading) return <p className="loading">Loading...</p>;
    if (!post) return <p>Post not found.</p>;

    const handleUpvote = async () => {
        // increment upvotes by 1 (no limit)
        const { error } = await supabase.from("posts").update({ upvotes: post.upvotes + 1 }).eq("id", id);
        if (error) { console.error(error); return; }
        fetchPost();
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        const { error } = await supabase.from("comments").insert([
            { post_id: id, author: localStorage.getItem("gg_username") || "Anonymous", content: commentText.trim() }
        ]);
        if (error) { console.error(error); alert("Failed to post comment"); return; }
        setCommentText("");
        fetchComments();
    };

    const handleDelete = async () => {
        if (!confirm("Delete this post?")) return;
        const { error } = await supabase.from("posts").delete().eq("id", id);
        if (error) { console.error(error); alert("Delete failed"); return; }
        navigate("/");
    };

    const isCreator = post.creator_id === creatorId;

    return (
        <div className="postpage">
            <div className="postcard-large">
                <div className="post-header">
                    <h1>{post.title}</h1>
                    <div className="meta">Posted: {new Date(post.created_at).toLocaleString()}</div>
                </div>

                {post.image_url && (
                    <div className="image-wrap">
                        <img src={post.image_url} alt={post.title} />
                    </div>
                )}

                {post.content && <p className="post-content">{post.content}</p>}

                <div className="post-actions">
                    <button onClick={handleUpvote}>▲ Upvote ({post.upvotes})</button>
                    {isCreator && (
                        <>
                            <Link to={`/post/${id}/edit`} className="btn-link">Edit</Link>
                            <button onClick={handleDelete} className="danger">Delete</button>
                        </>
                    )}
                </div>
            </div>

            <div className="comments-section">
                <h3>Comments</h3>
                <form onSubmit={handleComment} className="comment-form">
                    <input placeholder="Your name (optional)" defaultValue={localStorage.getItem("gg_username") || ""} onBlur={(e) => localStorage.setItem("gg_username", e.target.value)} />
                    <textarea placeholder="Leave a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                    <button type="submit">Comment</button>
                </form>

                <div className="comment-list">
                    {comments.length === 0 ? <p>No comments yet.</p> : comments.map(c => (
                        <div key={c.id} className="comment">
                            <div className="comment-meta">{c.author || "Anonymous"} — <span>{new Date(c.created_at).toLocaleString()}</span></div>
                            <div className="comment-body">{c.content}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
