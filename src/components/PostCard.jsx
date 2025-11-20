import React from "react";
import { Link } from "react-router-dom";
import "./PostCard.css";

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleString();
}

export default function PostCard({ post }) {
    return (
        <div className="postcard">
            <div className="postcard-left">
                <div className="post-meta">
                    <span className="post-time">{formatDate(post.created_at)}</span>
                </div>
                <Link to={`/post/${post.id}`} className="post-title">{post.title}</Link>
                <div className="post-upvotes">▲ {post.upvotes}</div>
            </div>
        </div>
    );
}
