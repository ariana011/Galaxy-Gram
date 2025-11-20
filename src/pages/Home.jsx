import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import PostCard from "../components/PostCard";
import "./Home.css";

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [sortBy, setSortBy] = useState("created_at"); // or "upvotes"
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        setLoading(true);
        let order = sortBy === "created_at" ? { column: "created_at", ascending: false } : { column: "upvotes", ascending: false };
        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .order(order.column, { ascending: order.ascending });

        if (error) {
            console.error(error);
            setPosts([]);
        } else {
            setPosts(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPosts();
        // listen for changes (realtime optional)
        const subscription = supabase
            .channel("public:posts")
            .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, (payload) => {
                fetchPosts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [sortBy]);

    const filtered = posts.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="container">
            <div className="controls">
                <input placeholder="Search by title..." value={query} onChange={(e) => setQuery(e.target.value)} />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="created_at">Sort by Newest</option>
                    <option value="upvotes">Sort by Upvotes</option>
                </select>
            </div>

            {loading ? <p className="loading">Loading...</p> : (
                filtered.length === 0 ? <p>No posts found.</p> : (
                    <div className="feed">
                        {filtered.map((post) => <PostCard key={post.id} post={post} />)}
                    </div>
                )
            )}
        </div>
    );
}
