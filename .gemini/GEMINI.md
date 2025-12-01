## Never do any changes or look the code of oldstory folder

Got error messaeg ->
## Error Type
Runtime TypeError

## Error Message
Failed to fetch


    at handleQA (src/app/page.tsx:29:21)

## Code Frame
  27 |
  28 | const handleQA = async () => {
> 29 |   const res = await fetch("http://localhost:8000/qa", {
     |                     ^
  30 |     method: "POST",
  31 |     headers: { "Content-Type": "application/json" },
  32 |     body: JSON.stringify({ query: qaQuery }),

Next.js version: 15.5.2 (Turbopack)
