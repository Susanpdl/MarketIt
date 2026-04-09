"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";

type InfluencerEmail = {
  id: string;
  name: string;
  email?: string | null;
  outreachEmailContent?: string | null;
  replyEmailContent?: string | null;
};

type Props = {
  influencerId: string;
  influencerName?: string;
  onClose: () => void;
};

export function ViewEmailModal({ influencerId, influencerName, onClose }: Props) {
  const [data, setData] = useState<InfluencerEmail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<InfluencerEmail>(`/api/influencers/${influencerId}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [influencerId]);

  const hasContent = data?.outreachEmailContent || data?.replyEmailContent;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] transition-opacity duration-250"
      onClick={onClose}
    >
      <div
        className="card card-elevated max-w-[560px] w-90 max-h-85vh m-4 p-6 flex flex-col overflow-hidden rounded-xl shadow-clay-lg animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="m-0 text-lg font-normal tracking-tight">Email - {data?.name ?? influencerName ?? "Influencer"}</h2>
          <button type="button" className="btn btn-ghost btn-sm btn-interactive" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="overflow-auto flex-1 flex flex-col gap-5">
          {loading ? (
            <div className="skeleton h-28 rounded-xl" />
          ) : !hasContent ? (
            <p className="text-muted m-0">
              {data?.email
                ? "No email content stored yet. The outreach email will appear here once sent via n8n."
                : "No email address for this influencer."}
            </p>
          ) : (
            <>
              {data.outreachEmailContent && (
                <div>
                  <h3 className="text-sm text-secondary mb-2 font-normal">Outreach email</h3>
                  <pre className="bg-secondary p-4 rounded-lg text-sm whitespace-pre-wrap break-words m-0 shadow-clay-inset code-block">
                    {data.outreachEmailContent}
                  </pre>
                </div>
              )}
              {data.replyEmailContent && (
                <div>
                  <h3 className="text-sm text-secondary mb-2 font-normal">Reply</h3>
                  <pre className="bg-secondary p-4 rounded-lg text-sm whitespace-pre-wrap break-words m-0 shadow-clay-inset code-block">
                    {data.replyEmailContent}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
