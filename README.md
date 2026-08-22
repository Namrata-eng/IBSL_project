# ISKCON Temple Website

Full-stack temple information platform with a React public site and a secured Express/MongoDB API.

## Start locally

1. Copy `.env.example` to `.env` and enter your MongoDB Atlas URI and a long JWT secret.
2. Run `npm install` in this directory.
3. Run `npm run dev`.
4. Open `http://localhost:5173`.

The frontend works gracefully before official content is added. No temple facts, timings, contact details, or payment details have been invented.

## Operations

- Create an administrator: `npm run seed-admin --workspace server -- "Name" admin@example.com secure-password`
- Connect Cloudinary and payment/LLM providers only with backend environment variables; no secret is sent to the client.
- Public endpoints are under `/api`; write endpoints require a Bearer JWT.

1) Controller
2) Entity
3) Repository
4) 
