import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main style={{ padding: "2rem" }}>
      {!session ? (
        <>
          <h2>Welcome to AstriVerse</h2>
          <button onClick={() => signIn("github")}>Login with GitHub</button>
        </>
      ) : (
        <>
          <h2>Welcome, {session.user.name}</h2>
          <img src={session.user.image} width={50} style={{ borderRadius: "50%" }} />
          <p>{session.user.email}</p>
          <button onClick={() => signOut()}>Logout</button>
        </>
      )}
    </main>
  );
}
