## Error Type
Console Error

## Error Message
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...
    <HotReload assetPrefix="" globalError={[...]}>
      <AppDevOverlayErrorBoundary globalError={[...]}>
        <ReplaySsrOnlyErrors>
        <DevRootHTTPAccessFallbackBoundary>
          <HTTPAccessFallbackBoundary notFound={<NotAllowedRootHTTPFallbackError>}>
            <HTTPAccessFallbackErrorBoundary pathname="/" notFound={<NotAllowedRootHTTPFallbackError>} ...>
              <RedirectBoundary>
                <RedirectErrorBoundary router={{...}}>
                  <Head>
                  <__next_root_layout_boundary__>
                    <SegmentViewNode type="layout" pagePath="layout.tsx">
                      <SegmentTrieNode>
                      <link>
                      <script>
                      <RootLayout>
                        <html lang="en" className="geist_a715...">
                          <body
-                           data-new-gr-c-s-loaded="14.1119.0"
-                           data-new-gr-c-s-check-loaded="14.1119.0"
-                           data-gr-ext-installed=""
                          >
                  ...



    at body (<anonymous>:null:null)
    at RootLayout (src\app\layout.tsx:26:7)

## Code Frame
  24 |   return (
  25 |     <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
> 26 |       <body>
     |       ^
  27 |         {children}
  28 |       </body>
  29 |     </html>

Next.js version: 15.5.2 (Turbopack)
