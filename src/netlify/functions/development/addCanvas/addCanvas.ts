import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "secrets.env" });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async (request: Request) => {
  try {
    if (request.method === "POST") {
      const body = await request.json();

      await client.connect();
      await client.query(
        "INSERT INTO canvas (data, name, tag) VALUES ($1, $2, $3);",
        [body.data, body.name, body.tag],
      );
      await client.end();
    }

    return new Response(JSON.stringify({ message: `OK` }), {
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
