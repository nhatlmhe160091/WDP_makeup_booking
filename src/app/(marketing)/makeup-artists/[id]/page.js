"use client";

import { useEffect, useState } from "react";
import SendRequest from "@muahub/utils/SendRequest";
import { useParams } from "next/navigation";
import MakeupArtistProfile from "./MakeupArtistProfile";

export default function MakeupArtistPage() {
  const params = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const res = await SendRequest("get", `/api/makeup-artists/${params.id}`);
        console.log("res", res);
        if (res.payload) {
          setArtist(res.payload);
          console.log("artist", res.payload);
        } else {
          setError("Could not find makeup artist");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchArtist();
    }
  }, [params.id]);

  if (loading) return <div className="text-center py-5">Loading...</div>;
  
  if (error) return (
    <div className="container py-5">
      <div className="alert alert-danger">
        {error}
      </div>
    </div>
  );

  if (!artist) return (
    <div className="container py-5">
      <div className="alert alert-warning">
        Makeup artist profile not found
      </div>
    </div>
  );

  return <MakeupArtistProfile artist={artist} />;
}