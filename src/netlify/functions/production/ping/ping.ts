export default (request: Request) => {
  try {
    const url = new URL(request.url);
    const subject = url.searchParams.get("name") || "World";

    return new Response(JSON.stringify({ message: `Hello ${subject}` }), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ errorMessage: error.message }), {
        status: 500,
      });
    }
  }
};
