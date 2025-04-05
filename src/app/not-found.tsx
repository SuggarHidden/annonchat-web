"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000); // Redirige después de 3 segundos

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <title>404: This page could not be found.</title>
      <div style={styles.error}>
        <div>
          <style
            dangerouslySetInnerHTML={{
              __html: `body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}`,
            }}
          />
          <h1 className="next-error-h1" style={styles.h1}>404</h1>
          <div style={styles.desc}>
            <h2 style={styles.h2}>This page could not be found.</h2>
            <p style={styles.h2}>Redirecting to main page...</p>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  error: {
    fontFamily:
      'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
    height: "100vh",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  desc: {
    display: "inline-block",
  },

  h1: {
    display: "inline-block",
    margin: "0 20px 0 0",
    padding: "0 23px 0 0",
    fontSize: 24,
    fontWeight: 500,
    verticalAlign: "top",
    lineHeight: "49px",
  },

  h2: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: "49px",
    margin: 0,
  },
} as const;
