// Cached clients may still call this endpoint; visitor tracking is disabled.
export const POST = () => new Response(null, {status: 204});
