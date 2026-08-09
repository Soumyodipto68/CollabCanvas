import React from "react";

export const EmptyState: React.FC = () => (
  <div className="text-center py-15 text-slate-400">
    <p className="text-lg mb-2 text-slate-200">No whiteboards found</p>
    <p className="text-sm">Create one above to start drawing!</p>
  </div>
);