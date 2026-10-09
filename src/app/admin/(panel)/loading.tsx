export default function AdminLoading() {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-line border-t-[var(--theme-accent)]" />
  
          <p className="mt-4 text-sm font-medium text-muted">
            Loading admin...
          </p>
        </div>
      </div>
    );
  }